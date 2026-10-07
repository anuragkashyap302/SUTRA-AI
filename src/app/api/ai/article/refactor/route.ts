import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { ai, DEFAULT_AI_MODEL, generateContentWithFallback } from "@/lib/ai";
import { deductUserCredits, refundUserCredits } from "@/lib/auth";

const refactorSchema = z.object({
  content: z.string().min(20, "Content must have at least 20 characters to refactor"),
  action: z.enum(["punchy", "table", "translate", "seo", "grammar", "expand"]),
  targetLanguage: z.string().optional().default("Spanish"),
  customInstruction: z.string().optional(),
});

/**
 * POST /api/ai/article/refactor
 * 
 * Performs 1-click in-line AI transformations on article content (Punchier, Tables, Translations, SEO Meta, Grammar).
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = refactorSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { content, action, targetLanguage, customInstruction } = parsed.data;

    // Deduct 1 credit
    const creditResult = await deductUserCredits(userId, 1);
    if (!creditResult.success) {
      return NextResponse.json(
        { success: false, error: creditResult.error },
        { status: 403 }
      );
    }

    let actionPrompt = "";

    switch (action) {
      case "punchy":
        actionPrompt = `Transform the following markdown article to make it significantly punchier, more persuasive, and engaging.
- Use high-impact verbs and concise sentences.
- Eliminate passive fluff while preserving all core facts, data, and technical details.
- Keep the overall markdown headings and structure intact.`;
        break;

      case "table":
        actionPrompt = `Analyze the following article and insert a high-value, structured Markdown comparison or summary table at an appropriate location within the text.
- Make the table clear, insightful, and formatted with clean markdown columns.
- Retain the surrounding article text and headings.`;
        break;

      case "translate":
        actionPrompt = `Translate the following markdown article completely into ${targetLanguage}.
- Ensure natural, fluent, professional phrasing in ${targetLanguage}.
- Strictly preserve all Markdown syntax, headings (##), bold text, bullet points, and code formatting.`;
        break;

      case "seo":
        actionPrompt = `Generate an Enterprise SEO Metadata block at the very top of the article in a clean blockquote:
> **SEO Title:** [High CTR, <60 chars]
> **Meta Description:** [High-converting summary, <155 chars]
> **Primary Keywords:** [Comma-separated list]
> **Slug:** [url-friendly-slug]

Followed by the original article with lightly optimized keyword headings.`;
        break;

      case "grammar":
        actionPrompt = `Proofread and polish the following markdown article.
- Fix all spelling, grammar, punctuation, and phrasing issues.
- Improve sentence flow and clarity without altering the author's original tone or removing points.`;
        break;

      case "expand":
        actionPrompt = `Deepen and expand this markdown article with additional practical examples, counter-arguments, and in-depth analysis.
- Maintain existing tone and add 2-3 high-value sub-sections or code/metric illustrations.`;
        break;

      default:
        actionPrompt = customInstruction || "Polish this markdown article.";
    }

    const fullPrompt = `${actionPrompt}\n\nORIGINAL ARTICLE:\n${content}\n\nOUTPUT: Return the refactored text in clean markdown only without preamble.`;

    const response = await generateContentWithFallback({
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      config: {
        temperature: 0.5,
        maxOutputTokens: 2500,
      },
    });

    const refactoredContent = response.text || content;

    return NextResponse.json({
      success: true,
      data: {
        content: refactoredContent,
        remainingCredits: creditResult.remainingCredits,
      },
    });
  } catch (error: unknown) {
    console.error("Refactor error:", error);

    // Auto-refund user credit on failure
    try {
      const { userId } = await auth();
      if (userId) {
        await refundUserCredits(userId, 1);
      }
    } catch (refundErr) {
      console.warn("Failed to refund credit:", refundErr);
    }

    const errorMessage = error instanceof Error ? error.message : "Failed to refactor content";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
