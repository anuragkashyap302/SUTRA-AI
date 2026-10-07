import { GoogleGenAI } from "@google/genai";

/**
 * Google Gemini AI Instance Helper
 * 
 * Ye helper single instance banata hai Gemini GenAI client ka.
 * Is se bar-bar new object allocate nahi hota (Singleton Pattern).
 */
const apiKey = process.env.GEMINI_API_KEY || "";

export const ai = new GoogleGenAI({
  apiKey,
});

export const DEFAULT_AI_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
export const FALLBACK_AI_MODEL = "gemini-3.6-flash";

/**
 * Generate content with automatic retry on 503 (High Demand) and model fallback
 */
export async function generateContentWithFallback(params: {
  contents: any;
  config?: any;
  preferredModel?: string;
}) {
  const primaryModel = params.preferredModel || DEFAULT_AI_MODEL;
  const modelsToTry = [
    primaryModel,
    primaryModel === FALLBACK_AI_MODEL ? "gemini-3.8-flash" : FALLBACK_AI_MODEL,
  ];
  const uniqueModels = Array.from(new Set(modelsToTry));

  let lastError: any = null;

  for (const model of uniqueModels) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const errMsg = String(err?.message || "");
        const isTransient =
          err?.status === 503 ||
          errMsg.includes("503") ||
          errMsg.includes("high demand") ||
          errMsg.includes("UNAVAILABLE") ||
          err?.status === 429;

        if (isTransient) {
          // Wait briefly before retry
          await new Promise((resolve) => setTimeout(resolve, 800 * (attempt + 1)));
          continue;
        } else {
          break; // Try next fallback model
        }
      }
    }
  }

  throw lastError;
}
