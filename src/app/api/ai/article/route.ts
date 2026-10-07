import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { ai, DEFAULT_AI_MODEL, generateContentWithFallback } from "@/lib/ai";
import { db } from "@/db";
import { creations } from "@/db/schema";
import { deductUserCredits, refundUserCredits } from "@/lib/auth";

// Request Body Validation Schema with tone, targetAudience and keywords
const generateArticleSchema = z.object({
  prompt: z.string().min(3, "Prompt must be at least 3 characters long"),
  title: z.string().optional().default("Untitled Article"),
  length: z.number().optional().default(800),
  tone: z.string().optional().default("Professional"),
  targetAudience: z.string().optional().default("General Public"),
  keywords: z.string().optional().default(""),
  publish: z.boolean().optional().default(false),
});

/**
 * POST /api/ai/article
 * 
 * Generates structured, high-ranking long-form markdown articles with tone and audience customization.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Please sign in to continue." },
        { status: 401 }
      );
    }
    // you cannot get req.body in next js 15 use req.json()
  //  console.log(req.body);
// Output: ReadableStream { locked: false, state: 'readable' }  (Yeh JSON object nahi hai!)
    const body = await req.json();
    const parsed = generateArticleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { prompt, title, length, tone, targetAudience, keywords, publish } = parsed.data;

    // Credit Deduction (1 Credit per article)
    const creditResult = await deductUserCredits(userId, 1);
    if (!creditResult.success) {
      return NextResponse.json(
        { success: false, error: creditResult.error },
        { status: 403 }
      );
    }

    // Build specialized prompt
    const instructions = `You are a world-class content strategist and senior technical writer.
Write a comprehensive, compelling, and beautifully structured markdown article.

ARTICLE PARAMETERS:
- Topic / Focus: "${prompt}"
- Title: "${title || prompt}"
- Tone of Voice: ${tone}
- Target Audience: ${targetAudience}
${keywords ? `- Target SEO Keywords to organically weave in: ${keywords}` : ""}
- Desired Length: ~${length} tokens

FORMATTING REQUIREMENTS:
1. Start with an engaging H1 title and a strong executive hook.
2. Use hierarchical headings (## and ###) with insightful sub-sections.
3. Incorporate bullet points, numbered takeaways, and bold emphasis where impactful.
4. Include a structured comparison or summary markdown table where relevant.
5. Provide a strong, memorable conclusion with 2-3 actionable next steps.
6. Output raw, clean GitHub-flavored Markdown only (no external commentary).`;

    // Google Gemini Generation with automatic 503 retry and model fallback
    const response = await generateContentWithFallback({
      contents: [
        {
          role: "user",
          parts: [{ text: instructions }],
        },
      ],
      config: {
        temperature: 0.7,
        maxOutputTokens: Math.max(3500, length * 3),
      },
    });

    const content = response.text || "Failed to generate content.";

    // Save creation into Neon DB via Drizzle
    const [newCreation] = await db
      .insert(creations)
      .values({
        userId,
        type: "article",
        title: title || prompt.slice(0, 50),
        prompt,
        content,
        publish,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        id: newCreation.id,
        title: newCreation.title,
        content: newCreation.content,
        remainingCredits: creditResult.remainingCredits,
      },
    });
  } catch (error: unknown) {
    console.error("Article Generation Error:", error);

    // Auto-refund user credit on upstream error so credits are never lost
    try {
      const { userId } = await auth();
      if (userId) {
        await refundUserCredits(userId, 1);
      }
    } catch (refundErr) {
      console.warn("Failed to refund credit:", refundErr);
    }

    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
