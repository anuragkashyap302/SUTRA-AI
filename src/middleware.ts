import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Clerk Authentication Middleware
 * 
 * Ye middleware har incoming request ko inspect karta hai:
 * 1. Agar route public hai (Landing page, Community gallery, Sign-in), toh request pass ho jati hai.
 * 2. Agar route protected hai:
 *    - API routes (/api/*): 401 JSON response return karta hai (JSON parse error se bachata hai).
 *    - Page routes (/dashboard, etc.): User ko sign-in ke liye redirect karta hai.
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/studio(.*)",
  "/community(.*)",
  "/dashboard(.*)",
  "/observability(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/api/ai/rag/documents", // Allow reading documents/samples in preview
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      if (req.nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.json(
          { success: false, error: "Unauthorized: Please sign in to continue." },
          { status: 401 }
        );
      }
      await auth.protect();
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
