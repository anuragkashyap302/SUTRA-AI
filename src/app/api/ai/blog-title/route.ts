import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { ai, DEFAULT_AI_MODEL, generateContentWithFallback } from "@/lib/ai";
import { db } from "@/db";
import { creations } from "@/db/schema";
import { deductUserCredits, refundUserCredits } from "@/lib/auth";

const blogTitleSchema = z.object({
  prompt: z.string().min(3, "Topic prompt is required"),
  category: z.string().optional().default("General"),
});

/**
 * POST /api/ai/blog-title
 * 
 * Catchy Blog Title Generator via Gemini AI
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = blogTitleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { prompt, category } = parsed.data;

    // Deduct 1 credit
    const creditResult = await deductUserCredits(userId, 1);
    if (!creditResult.success) {
      return NextResponse.json({ success: false, error: creditResult.error }, { status: 403 });
    }

    const response = await generateContentWithFallback({
      contents: [
        {
          role: "user",
          parts: [{ text: `Generate 10 catchy, SEO-friendly, high-CTR blog post titles for the keyword/topic: "${prompt}" in the category: "${category}". Format as a numbered markdown list.` }],
        },
      ],
      config: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    });

    const content = response.text || "No titles generated.";

    const [newCreation] = await db
      .insert(creations)
      .values({
        userId,
        type: "blog-title",
        title: `Blog Titles: ${prompt.slice(0, 30)}`,
        prompt,
        content,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        id: newCreation.id,
        content: newCreation.content,
        remainingCredits: creditResult.remainingCredits,
      },
    });
  } catch (error: unknown) {
    try {
      const { userId } = await auth();
      if (userId) await refundUserCredits(userId, 1);
    } catch {}
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
