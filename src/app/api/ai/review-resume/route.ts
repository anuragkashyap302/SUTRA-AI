import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PDFParse } from "@/lib/pdf";
import { ai, DEFAULT_AI_MODEL, generateContentWithFallback } from "@/lib/ai";
import { db } from "@/db";
import { creations } from "@/db/schema";
import { deductUserCredits, refundUserCredits } from "@/lib/auth";

/**
 * POST /api/ai/review-resume
 * 
 * Ingests PDF resume, extracts text, and runs deep ATS + Strengths / Weaknesses analysis with Gemini AI
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("resume") as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "Resume PDF file is required" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "Resume size exceeds 5MB limit" }, { status: 400 });
    }

    // Deduct 2 credits
    const creditResult = await deductUserCredits(userId, 2);
    if (!creditResult.success) {
      return NextResponse.json({ success: false, error: creditResult.error }, { status: 403 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const parser = new PDFParse({ data: uint8Array });
    const textResult = await parser.getText();
    const resumeText = textResult.text;

    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json({ success: false, error: "Could not extract readable text from PDF" }, { status: 400 });
    }

    const prompt = `You are a senior tech recruiter and resume reviewer at a top Silicon Valley company. Review this resume in detail.
Provide structured markdown feedback containing:
1. Overall Impression & ATS Compatibility Score (out of 100)
2. Top Strengths
3. Critical Weaknesses & Red Flags
4. Actionable Line-by-Line Bullet Point Improvements (Quantify impact with metrics)
5. Recommended Next Steps & Interview Preparation Tips

Resume Text:
${resumeText}`;

    const response = await generateContentWithFallback({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        temperature: 0.7,
        maxOutputTokens: 2000,
      },
    });

    const feedback = response.text || "Failed to generate review feedback.";

    const [newCreation] = await db
      .insert(creations)
      .values({
        userId,
        type: "resume-review",
        title: `Resume Review: ${file.name}`,
        prompt: `Review resume for ${file.name}`,
        content: feedback,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        id: newCreation.id,
        content: feedback,
        remainingCredits: creditResult.remainingCredits,
      },
    });
  } catch (error: unknown) {
    console.error("Resume review error:", error);
    try {
      const { userId } = await auth();
      if (userId) await refundUserCredits(userId, 1);
    } catch {}
    const errorMessage = error instanceof Error ? error.message : "Failed to review resume";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
