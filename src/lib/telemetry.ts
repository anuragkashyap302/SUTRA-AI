export interface TelemetryTrace {
  id: string;
  timestamp: string; // ISO string
  studio: string; // e.g. "Hybrid Document RAG", "Article Studio", "AI Image Generator", "Inpainting Studio", "ATS Resume Reviewer", "Blog Titles"
  model: string; // e.g. "gemini-3.8-flash", "gemini-3.6-flash", "text-embedding-004", "clipdrop-inpaint", "cloudinary-diffusion"
  latencyMs: number;
  ttftMs?: number; // Time to first token
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
  status: "success" | "error";
  promptPreview: string;
  responsePreview: string;
  metadata?: Record<string, any>;
}

export interface TelemetrySummary {
  totalCalls: number;
  totalTokens: number;
  totalCostUsd: number;
  avgLatencyMs: number;
  successRate: number;
}

// Official API Pricing (USD per token)
// Gemini 3.8 / 3.6 / 2.5 / 1.5 Flash: $0.075 / 1M input ($0.000000075), $0.30 / 1M output ($0.00000030)
// text-embedding-004: $0.02 / 1M ($0.00000002)
// Vision / Inpaint / ClipDrop API: $0.01 per execution flat rate
export function calculateCallCost(
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  if (model.includes("clipdrop") || model.includes("cloudinary") || model.includes("vision")) {
    return 0.01; // $0.01 per image/vision call
  }
  if (model.includes("embedding")) {
    return (promptTokens + completionTokens) * 0.00000002;
  }
  // Default Gemini 3.8 Flash (Fallback: Gemini 3.6 Flash)
  const inputCost = promptTokens * 0.000000075;
  const outputCost = completionTokens * 0.0000003;
  return Number((inputCost + outputCost).toFixed(7));
}

// Rough heuristic estimator: 1 token ≈ 4 characters
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.trim().length / 4));
}

export const INITIAL_SEED_TRACES: TelemetryTrace[] = [
  {
    id: "tr-rag-9941a",
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    studio: "Hybrid Document RAG",
    model: "gemini-3.8-flash + text-embedding-001",
    latencyMs: 842,
    ttftMs: 240,
    promptTokens: 1420,
    completionTokens: 380,
    totalTokens: 1800,
    costUsd: 0.0002205,
    status: "success",
    promptPreview: "What are the Q3 cloud margin projections and capital allocation targets?",
    responsePreview: "According to the financial breakdown [Page 4], Q3 gross margins expanded to 74.2% driven by infrastructure consolidation, with $12.5M allocated to edge compute expansion [Page 7].",
    metadata: {
      hybridSearch: "Reciprocal Rank Fusion (RRF k=60)",
      denseRank: 1,
      sparseRank: 2,
      chunksRetrieved: 3,
      citationsCount: 2,
    },
  },
  {
    id: "tr-art-8820c",
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    studio: "Article Studio",
    model: "gemini-3.8-flash",
    latencyMs: 1250,
    ttftMs: 190,
    promptTokens: 850,
    completionTokens: 1120,
    totalTokens: 1970,
    costUsd: 0.0003997,
    status: "success",
    promptPreview: "Draft a comprehensive technical guide on building Next.js 15 full-stack AI SaaS with Drizzle ORM and pgvector.",
    responsePreview: "# Architecting Enterprise AI SaaS with Next.js 15 and Drizzle ORM\n\nIn modern web engineering, the boundary between client interactivity and server-side compute has merged...",
    metadata: {
      tone: "authoritative",
      wordCount: 1420,
      mode: "stream-generation",
    },
  },
  {
    id: "tr-inp-7104f",
    timestamp: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
    studio: "Inpainting Studio",
    model: "clipdrop-inpaint-gen-replace",
    latencyMs: 2410,
    promptTokens: 60,
    completionTokens: 0,
    totalTokens: 60,
    costUsd: 0.01,
    status: "success",
    promptPreview: "Replace masked region with a cybernetic titanium lens with subtle blue backlight",
    responsePreview: "[Inpainted Binary Mask Stream (1920x1080) Synthesized via Generative Diffusion]",
    metadata: {
      mode: "gen_replace",
      maskResolution: "1920x1080",
      scaleRatio: "1.0",
    },
  },
  {
    id: "tr-res-5509e",
    timestamp: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    studio: "ATS Resume Reviewer",
    model: "gemini-3.8-flash",
    latencyMs: 980,
    ttftMs: 210,
    promptTokens: 2150,
    completionTokens: 490,
    totalTokens: 2640,
    costUsd: 0.0003082,
    status: "success",
    promptPreview: "Analyze Senior AI Engineer resume for FAANG ATS scoring against Principal Staff rubric.",
    responsePreview: "### ATS Score: 92/100\n- **Strengths**: Quantified multi-tenant architectures, hybrid RAG benchmarks, and Drizzle/Postgres optimizations.\n- **Action Items**: Add exact latency metrics to inpainting description.",
    metadata: {
      atsScore: 92,
      pagesParsed: 2,
    },
  },
];
