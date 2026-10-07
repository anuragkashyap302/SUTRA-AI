import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ai, DEFAULT_AI_MODEL, generateContentWithFallback } from "@/lib/ai";
import { generateEmbedding } from "@/lib/embeddings";
import { searchHybridChunks } from "@/lib/rag";
import { db } from "@/db";
import { creations } from "@/db/schema";
import { deductUserCredits, refundUserCredits } from "@/lib/auth";

export const maxDuration = 45;

/**
 * POST /api/ai/rag/query
 * 
 * Performs Dense (pgvector) + Sparse (BM25) Hybrid Search via Reciprocal Rank Fusion,
 * then generates grounded answers with exact [Page X] citation badges.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { documentId, query } = await req.json();

    if (!documentId || !query || !query.trim()) {
      return NextResponse.json({ success: false, error: "documentId and query are required" }, { status: 400 });
    }

    // Deduct 1 credit for Q&A query
    const creditResult = await deductUserCredits(userId, 1);
    if (!creditResult.success) {
      return NextResponse.json({ success: false, error: creditResult.error }, { status: 403 });
    }

    // 1. Generate Query Vector Embedding (768-dim)
    const queryEmbedding = await generateEmbedding(query);

    // 2. Execute Hybrid Search (Dense pgvector + Sparse BM25 with RRF)
    const rankedChunks = await searchHybridChunks(documentId, query, queryEmbedding, 5);

    if (rankedChunks.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          answer: "No relevant content found in this document for your query. Please try rephrasing your question or selecting another document.",
          rankedChunks: [],
          citations: [],
          remainingCredits: creditResult.remainingCredits,
        },
      });
    }

    // 3. Build Context Prompt with strict citation grounding rules
    const contextText = rankedChunks
      .map(
        (chunk, idx) =>
          `[Source Chunk ${idx + 1} | Page ${chunk.pageNumber} | ChunkID: ${chunk.id}]\n${chunk.content}`
      )
      .join("\n\n---\n\n");

    const systemPrompt = `You are Sutra Document Intelligence AI, an enterprise-grade document comprehension and citation engine.

Your task is to answer the user's question accurately and concisely based ONLY on the provided document context chunks below.

CRITICAL CITATION RULES:
1. For EVERY factual claim or quote, you MUST cite the source page using the exact bracket format: [Page X] where X is the page number.
2. If multiple pages support a claim, use [Page X, Page Y].
3. Format your answer using clean GitHub-flavored Markdown with bold headers, bullet points, and concise executive summaries where appropriate.
4. If the context does not contain enough information to answer the question, clearly state: "The uploaded document does not contain sufficient information to answer this question."

DOCUMENT CONTEXT:
${contextText}`;

    // 4. Generate grounded response with Gemini
    const response = await generateContentWithFallback({
      contents: [
        { role: "user", parts: [{ text: `${systemPrompt}\n\nUSER QUESTION: ${query}` }] },
      ],
      config: {
        temperature: 0.2, // Low temperature for high factual precision
        maxOutputTokens: 1500,
      },
    });

    const answer = response.text || "Failed to generate answer from document.";

    // Extract unique cited pages
    const pageMatches = answer.match(/\[Page (\d+)\]/g) || [];
    const citedPages = Array.from(
      new Set(pageMatches.map((m) => parseInt(m.replace(/\D/g, ""), 10)))
    );

    // 5. Store creation record
    await db.insert(creations).values({
      userId,
      type: "document-rag",
      title: `Doc Q&A: ${query.slice(0, 50)}...`,
      prompt: query,
      content: answer,
    });

    return NextResponse.json({
      success: true,
      data: {
        answer,
        citedPages,
        rankedChunks: rankedChunks.map((c) => ({
          id: c.id,
          chunkIndex: c.chunkIndex,
          pageNumber: c.pageNumber,
          content: c.content,
          denseRank: c.denseRank,
          sparseRank: c.sparseRank,
          denseScore: c.denseScore,
          sparseScore: c.sparseScore,
          rrfScore: c.rrfScore,
        })),
        remainingCredits: creditResult.remainingCredits,
      },
    });
  } catch (error: unknown) {
    console.error("RAG Query Error:", error);
    try {
      const { userId } = await auth();
      if (userId) await refundUserCredits(userId, 1);
    } catch {}
    const errorMessage = error instanceof Error ? error.message : "Failed to execute document query";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
