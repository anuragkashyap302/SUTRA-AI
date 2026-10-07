import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PDFParse } from "@/lib/pdf";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { documents, documentChunks } from "@/db/schema";
import { chunkDocumentPages, generateBatchEmbeddings } from "@/lib/embeddings";
import { deductUserCredits } from "@/lib/auth";

export const maxDuration = 60; // 60 seconds for processing

/**
 * POST /api/ai/rag/upload
 * 
 * Ingests a PDF document or text sample, extracts layout/pages, generates 768-dim 
 * Gemini embeddings, and saves to Neon PostgreSQL with pgvector indexing.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";
    let fileName = "Document.pdf";
    let fileSize = 0;
    const pages: { pageNumber: number; text: string }[] = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File;

      if (!file) {
        return NextResponse.json({ success: false, error: "No PDF file uploaded" }, { status: 400 });
      }

      fileName = file.name;
      fileSize = file.size;

      if (fileSize > 10 * 1024 * 1024) {
        return NextResponse.json({ success: false, error: "PDF exceeds 10MB limit" }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const parser = new PDFParse({ data: uint8Array });
      const parseResult = await parser.getText();
      const fullText = parseResult.text || "";

      if (!fullText.trim()) {
        return NextResponse.json({ success: false, error: "No readable text in PDF" }, { status: 400 });
      }

      // Split text into pages by FormFeed \f or \x0C, or logical page segmentation
      const rawPages = fullText.split(/\x0C|\f/);
      if (rawPages.length > 1) {
        rawPages.forEach((pText, idx) => {
          if (pText.trim()) {
            pages.push({ pageNumber: idx + 1, text: pText.trim() });
          }
        });
      } else {
        // Fallback segment into 350-word pages
        const words = fullText.split(/\s+/);
        let pageNum = 1;
        for (let i = 0; i < words.length; i += 350) {
          const pageWords = words.slice(i, i + 350).join(" ");
          pages.push({ pageNumber: pageNum++, text: pageWords });
        }
      }
    } else {
      // JSON sample document upload
      const body = await req.json();
      fileName = body.fileName || "Sutra_Enterprise_AI_Whitepaper.pdf";
      fileSize = body.fileSize || 1024 * 45;
      const sampleText = body.text || "";

      if (!sampleText) {
        return NextResponse.json({ success: false, error: "Text is required for document ingestion" }, { status: 400 });
      }

      const rawPages = sampleText.split(/=== Page (\d+) ===/);
      if (rawPages.length > 1) {
        for (let i = 1; i < rawPages.length; i += 2) {
          const pNum = parseInt(rawPages[i], 10) || 1;
          const pText = rawPages[i + 1] || "";
          if (pText.trim()) {
            pages.push({ pageNumber: pNum, text: pText.trim() });
          }
        }
      } else {
        pages.push({ pageNumber: 1, text: sampleText });
      }
    }

    if (pages.length === 0) {
      return NextResponse.json({ success: false, error: "Could not parse pages from document" }, { status: 400 });
    }

    // Deduct 2 creation credits
    const creditResult = await deductUserCredits(userId, 2);
    if (!creditResult.success) {
      return NextResponse.json({ success: false, error: creditResult.error }, { status: 403 });
    }

    // 1. Create parent document record
    const [doc] = await db
      .insert(documents)
      .values({
        userId,
        fileName,
        fileUrl: `/uploads/${fileName}`,
        fileSize,
        status: "processing",
      })
      .returning();

    // 2. Compute semantic chunks
    const chunkData = chunkDocumentPages(pages, 220, 35);
    const chunkTexts = chunkData.map((c) => c.content);

    // 3. Generate Gemini 768-dim embeddings in batch
    const embeddings = await generateBatchEmbeddings(chunkTexts);

    // 4. Batch insert chunks with vector embeddings
    for (let i = 0; i < chunkData.length; i++) {
      const chunk = chunkData[i];
      const emb = embeddings[i];

      await db.insert(documentChunks).values({
        documentId: doc.id,
        chunkIndex: chunk.chunkIndex,
        pageNumber: chunk.pageNumber,
        content: chunk.content,
        embedding: emb,
      });
    }

    // Update document status to ready
    await db
      .update(documents)
      .set({ status: "ready" })
      .where(eq(documents.id, doc.id));

    return NextResponse.json({
      success: true,
      data: {
        documentId: doc.id,
        fileName: doc.fileName,
        pageCount: pages.length,
        chunkCount: chunkData.length,
        remainingCredits: creditResult.remainingCredits,
      },
    });
  } catch (error: unknown) {
    console.error("Document ingestion error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to process document";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
