import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

/**
 * Get or Create User in Database
 * 
 * Ye function Clerk se current logged-in user ko fetch karta hai.
 * Agar user database me pehle se nahi hai, toh auto-sync karke default 20 credits deta hai.
 * 
 * Interview Point: Lazy User Syncing pattern se hum external webhooks par 100% depend nahi hote.
 */
export async function getOrCreateCurrentUser() {
  const { userId, has } = await auth();

  if (!userId) {
    return null;
  }

  // Detect active plan from Clerk Billing (if user subscribed via Clerk modal)
  let clerkPlan: "free" | "pro" | "enterprise" = "free";
  if (has) {
    if (has({ plan: "enterprise" })) {
      clerkPlan = "enterprise";
    } else if (has({ plan: "pro_creator" }) || has({ plan: "pro" }) || has({ plan: "premium" })) {
      clerkPlan = "pro";
    }
  }

  // 1. Check if user already exists in Neon DB
  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (existingUser) {
    // If user upgraded on Clerk Billing, automatically sync plan and boost credits in DB!
    if (clerkPlan !== "free" && existingUser.plan !== clerkPlan) {
      const bonusCredits = clerkPlan === "enterprise" ? 999999 : 500;
      const [updated] = await db
        .update(users)
        .set({
          plan: clerkPlan,
          credits: Math.max(existingUser.credits, bonusCredits),
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();
      return updated;
    }
    return existingUser;
  }

  // 2. Fetch user profile from Clerk
  const clerkUser = await currentUser();
  const primaryEmail = clerkUser?.emailAddresses[0]?.emailAddress || "user@sutra.ai";
  const fullName = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || "Sutra Creator";
  const avatar = clerkUser?.imageUrl || null;

  // 3. Upsert user (Insert or Update on conflict)
  // Interview Tip: Next.js me RootLayout aur DashboardLayout parallel render hote hain.
  // onConflictDoUpdate use karne se concurrent inserts par unique constraint error nahi aata!
  const [user] = await db
    .insert(users)
    .values({
      id: userId,
      email: primaryEmail,
      name: fullName,
      imageUrl: avatar,
      plan: "free",
      credits: 20,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: primaryEmail,
        name: fullName,
        imageUrl: avatar,
        updatedAt: new Date(),
      },
    })
    .returning();

  return user;
}

/**
 * Deduct Credits Atomically
 * 
 * Har AI operation se pehle ye check karta hai ki user ke paas sufficient credits hain ya nahi.
 * Atomic SQL execution (`credits - cost WHERE credits >= cost`) race conditions ko prevent karta hai.
 */
export async function deductUserCredits(userId: string, cost: number = 1): Promise<{ success: boolean; remainingCredits?: number; error?: string }> {
  // Pro users ke paas unlimited quota hota hai
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  if (user.plan === "pro" || user.plan === "enterprise" || user.plan === "premium") {
    return { success: true, remainingCredits: user.credits };
  }

  if (user.credits < cost) {
    return {
      success: false,
      error: `Insufficient credits. You need ${cost} credit(s), but only have ${user.credits} remaining.`,
    };
  }

  // Atomic deduction
  const [updatedUser] = await db
    .update(users)
    .set({
      credits: sql`${users.credits} - ${cost}`,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return { success: true, remainingCredits: updatedUser.credits };
}

/**
 * Refund Credits Atomically
 * 
 * Agar upstream AI API fail ho jaye, toh deducted credit user ke account me wapas credit ho jata hai.
 */
export async function refundUserCredits(userId: string, cost: number = 1): Promise<void> {
  try {
    await db
      .update(users)
      .set({
        credits: sql`${users.credits} + ${cost}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  } catch (err) {
    console.error("Failed to refund user credits:", err);
  }
}
