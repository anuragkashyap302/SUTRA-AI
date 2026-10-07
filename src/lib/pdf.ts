import { PDFParse } from "pdf-parse";
// @ts-expect-error pdfjs-dist internal worker module
import * as pdfWorker from "pdfjs-dist/legacy/build/pdf.worker.mjs";

/**
 * PDF Parsing Helper with In-Memory Worker Configuration
 * 
 * In Next.js Node/SSR runtime, pdfjs-dist defaults to dynamic import("./pdf.worker.mjs")
 * which breaks under Webpack chunking. Pre-registering globalThis.pdfjsWorker bypasses
 * the dynamic import entirely and executes WorkerMessageHandler directly in-process.
 */
if (typeof globalThis !== "undefined") {
  // @ts-expect-error internal pdfjs-dist hook
  globalThis.pdfjsWorker = pdfWorker;
}

export { PDFParse };
