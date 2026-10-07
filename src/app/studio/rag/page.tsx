"use client";

import { useState, useEffect, useRef } from "react";
import {
  FileText,
  FileSearch,
  Search,
  Layers,
  Cpu,
  UploadCloud,
  Send,
  RefreshCw,
  Trash2,
  BookOpen,
  Activity,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ChevronRight,
  Database,
  ArrowRight,
  Sparkles,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { SAMPLE_WHITEPAPER } from "@/lib/sample-docs";
import { useTelemetry } from "@/context/TelemetryContext";
import { estimateTokens } from "@/lib/telemetry";

interface DocumentItem {
  id: string;
  fileName: string;
  fileSize: number;
  status: string;
  createdAt: string;
}

interface DocumentChunkItem {
  id: string;
  chunkIndex: number;
  pageNumber: number;
  content: string;
}

interface RankedChunkTelemetry {
  id: string;
  chunkIndex: number;
  pageNumber: number;
  content: string;
  denseRank: number | null;
  sparseRank: number | null;
  denseScore: number;
  sparseScore: number;
  rrfScore: number;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  citedPages?: number[];
  rankedChunks?: RankedChunkTelemetry[];
}

export default function DocumentRagPage() {
  const [documentsList, setDocumentsList] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [docChunks, setDocChunks] = useState<DocumentChunkItem[]>([]);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [queryInput, setQueryInput] = useState("");
  const [loadingQuery, setLoadingQuery] = useState(false);
  const [activeTab, setActiveTab] = useState<"document" | "telemetry">("document");
  const [activeCitedPage, setActiveCitedPage] = useState<number | null>(null);
  const [lastTelemetry, setLastTelemetry] = useState<RankedChunkTelemetry[]>([]);

  const { addTrace } = useTelemetry();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content:
        "Welcome to Sutra Document Intelligence & Hybrid RAG Engine.\n\nUpload any PDF document or load our pre-indexed Enterprise Architecture Whitepaper to ask questions with verifiable inline [Page X] citations and live retrieval telemetry.",
      timestamp: "Just now",
    },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const docContainerRef = useRef<HTMLDivElement>(null);
  const chunkRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Force window to stay pinned at top (0,0) and disable browser scroll memory
  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, []);

  // Fetch documents on load
  useEffect(() => {
    fetchDocuments();
  }, []);

  // When selected document changes, fetch its chunks
  useEffect(() => {
    if (selectedDocId) {
      fetchDocumentChunks(selectedDocId);
    }
  }, [selectedDocId]);

  // Auto-scroll chat to bottom ONLY inside the chat container (never scroll the main window)
  useEffect(() => {
    if (chatContainerRef.current && messages.length > 1) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages.length, loadingQuery]);

  // Auto-scroll document pane when a citation is clicked (container-level only, never window)
  useEffect(() => {
    if (activeCitedPage !== null && docChunks.length > 0) {
      const targetChunk = docChunks.find((c) => c.pageNumber === activeCitedPage);
      if (targetChunk && chunkRefs.current[targetChunk.id] && docContainerRef.current) {
        const targetEl = chunkRefs.current[targetChunk.id]!;
        const containerEl = docContainerRef.current;
        containerEl.scrollTo({
          top: targetEl.offsetTop - containerEl.offsetTop - 12,
          behavior: "smooth",
        });
      }
    }
  }, [activeCitedPage, docChunks]);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/ai/rag/documents");
      const data = await res.json();
      if (data.success && data.data) {
        const docs = Array.isArray(data.data) ? data.data : [];
        setDocumentsList(docs);
        if (docs.length > 0 && !selectedDocId) {
          setSelectedDocId(docs[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    }
  };

  const fetchDocumentChunks = async (docId: string) => {
    setLoadingDoc(true);
    try {
      const res = await fetch(`/api/ai/rag/documents?documentId=${docId}`);
      const data = await res.json();
      if (data.success && data.data) {
        const chunks = Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.data.chunks)
          ? data.data.chunks
          : [];
        setDocChunks(chunks);
      }
    } catch (err) {
      console.error("Failed to fetch chunks:", err);
    } finally {
      setLoadingDoc(false);
    }
  };

  // 1-Click Load Sample Whitepaper
  const handleLoadSampleWhitepaper = async () => {
    setUploading(true);
    const toastId = toast.loading("Ingesting & embedding Whitepaper with Gemini text-embedding-004...");
    try {
      const res = await fetch("/api/ai/rag/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(SAMPLE_WHITEPAPER),
      });

      const result = await res.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to ingest whitepaper");
      }

      toast.success("Whitepaper indexed with pgvector!", { id: toastId });
      await fetchDocuments();
      setSelectedDocId(result.data.documentId);
      
      // Add proactive suggestion message
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          role: "assistant",
          content: `Successfully indexed **${result.data.fileName}** (${result.data.pageCount} pages, ${result.data.chunkCount} vector chunks).\n\nTry asking:\n- *"What is the Reciprocal Rank Fusion formula?"*\n- *"What are the sub-50ms latency benchmarks?"*\n- *"How does multi-tenant isolation work?"*`,
          timestamp: "Just now",
        },
      ]);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error(msg, { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  // PDF File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a valid PDF document");
      return;
    }

    setUploading(true);
    const toastId = toast.loading(`Parsing & indexing ${file.name}...`);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/ai/rag/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to process PDF");
      }

      toast.success("PDF parsed & vector indexed!", { id: toastId });
      await fetchDocuments();
      setSelectedDocId(result.data.documentId);

      setMessages((prev) => [
        ...prev,
        {
          id: `upload-${Date.now()}`,
          role: "assistant",
          content: `**${result.data.fileName}** is ready. Indexed **${result.data.pageCount} pages** and **${result.data.chunkCount} semantic chunks** into vector storage. You can now ask questions about this document below.`,
          timestamp: "Just now",
        },
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload PDF";
      toast.error(msg, { id: toastId });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Delete active document
  const handleDeleteDocument = async () => {
    if (!selectedDocId) return;
    if (!confirm("Are you sure you want to delete this document and all its vector chunks?")) return;

    try {
      const res = await fetch(`/api/ai/rag/documents?documentId=${selectedDocId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Document deleted");
        setSelectedDocId("");
        setDocChunks([]);
        setLastTelemetry([]);
        fetchDocuments();
      }
    } catch {
      toast.error("Failed to delete document");
    }
  };

  // Submit Query to Hybrid RAG
  const handleSendQuery = async (queryText?: string) => {
    const textToSend = queryText || queryInput;
    if (!textToSend.trim() || !selectedDocId || loadingQuery) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setQueryInput("");
    setLoadingQuery(true);
    setActiveCitedPage(null);
    const startTime = performance.now();

    try {
      const res = await fetch("/api/ai/rag/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: selectedDocId,
          query: textToSend,
        }),
      });

      const result = await res.json();
      if (!result.success) {
        throw new Error(result.error || "Query failed");
      }

      const latencyMs = Math.round(performance.now() - startTime);
      const answer = result.data.answer;
      const promptTokens = estimateTokens(textToSend) + (docChunks.length * 200);
      const completionTokens = estimateTokens(answer);

      // Record to global telemetry drawer
      addTrace({
        studio: "Hybrid Document RAG",
        model: "gemini-3.8-flash + text-embedding-001",
        latencyMs,
        ttftMs: Math.round(latencyMs * 0.35),
        promptTokens,
        completionTokens,
        status: "success",
        promptPreview: textToSend,
        responsePreview: answer,
        metadata: {
          documentId: selectedDocId,
          chunksRetrieved: result.data.rankedChunks?.length || 0,
          citedPages: result.data.citedPages || [],
          hybridRRF: "Reciprocal Rank Fusion (k=60)",
        },
      });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: result.data.answer,
        timestamp: "Just now",
        citedPages: result.data.citedPages,
        rankedChunks: result.data.rankedChunks,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setLastTelemetry(result.data.rankedChunks || []);
    } catch (err: unknown) {
      const latencyMs = Math.round(performance.now() - startTime);
      const msg = err instanceof Error ? err.message : "Failed to generate answer";
      toast.error(msg);

      addTrace({
        studio: "Hybrid Document RAG",
        model: "gemini-3.8-flash",
        latencyMs,
        promptTokens: estimateTokens(textToSend),
        completionTokens: 0,
        status: "error",
        promptPreview: textToSend,
        responsePreview: msg,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: `**Error:** ${msg}`,
          timestamp: "Just now",
        },
      ]);
    } finally {
      setLoadingQuery(false);
    }
  };

  // Render text with interactive citation badges and clean typography
  const renderFormattedText = (text: string) => {
    const citationRegex = /(\[Page \d+(?:, Page \d+)*\])/g;
    const segments = text.split(citationRegex);

    return segments.map((seg, sIdx) => {
      const match = seg.match(/\[Page (\d+)\]/);
      if (match) {
        const pageNum = parseInt(match[1], 10);
        const isActive = activeCitedPage === pageNum;
        return (
          <button
            key={sIdx}
            type="button"
            onClick={() => {
              setActiveCitedPage(pageNum);
              setActiveTab("document");
              toast.info(`Focused on Page ${pageNum}`);
            }}
            className={`inline-flex items-center mx-1 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold transition-all cursor-pointer ${
              isActive
                ? "bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-300"
                : "bg-emerald-50 text-emerald-900 border border-emerald-200/90 hover:bg-emerald-100"
            }`}
            title={`Jump to Page ${pageNum}`}
          >
            Page {pageNum}
          </button>
        );
      }

      const boldSegments = seg.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={sIdx}>
          {boldSegments.map((bSeg, bIdx) => {
            if (bSeg.startsWith("**") && bSeg.endsWith("**")) {
              return (
                <strong key={bIdx} className="font-semibold text-slate-900">
                  {bSeg.slice(2, -2)}
                </strong>
              );
            }
            if (bSeg.startsWith("`") && bSeg.endsWith("`") && bSeg.length > 2) {
              return (
                <code key={bIdx} className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-100 text-emerald-800 font-mono text-[11px] border border-slate-200">
                  {bSeg.slice(1, -1)}
                </code>
              );
            }
            return <span key={bIdx}>{bSeg}</span>;
          })}
        </span>
      );
    });
  };

  const renderMessageContent = (content: string) => {
    const paragraphs = content.split("\n");
    return (
      <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-slate-800">
        {paragraphs.map((p, pIdx) => {
          if (!p.trim()) return <div key={pIdx} className="h-1" />;
          const isBullet = p.trim().startsWith("- ") || p.trim().startsWith("* ");
          const cleanText = isBullet ? p.trim().slice(2) : p;

          if (isBullet) {
            return (
              <div key={pIdx} className="flex items-start gap-2 pl-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                <span className="flex-1">{renderFormattedText(cleanText)}</span>
              </div>
            );
          }

          return <p key={pIdx}>{renderFormattedText(p)}</p>;
        })}
      </div>
    );
  };

  const activeDoc = documentsList.find((d) => d.id === selectedDocId);

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 lg:p-8 relative">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Studio Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-emerald-200/80">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white shrink-0">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-emerald-100/90 text-emerald-900 border border-emerald-200/90 text-[11px] font-bold mb-1 shadow-2xs backdrop-blur-xs">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Hybrid RAG Engine (pgvector + BM25)
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 bg-clip-text text-transparent leading-snug pb-0.5">
                Document Intelligence & Hybrid RAG Engine
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed font-medium">
                Reciprocal Rank Fusion (RRF $k=60$) search with sub-50ms citation-grounded answers.
              </p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.txt,.md"
              className="hidden"
            />

            <button
              onClick={handleLoadSampleWhitepaper}
              disabled={uploading}
              className="px-5 py-2.5 rounded-full bg-white hover:bg-emerald-50 border-2 border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 transition-all shadow-xs hover:shadow-sm hover:scale-105 disabled:opacity-50 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              1-Click Load Whitepaper
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20 hover:scale-105 disabled:opacity-50 cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Upload PDF Document
            </button>
          </div>
        </div>

        {/* Active Document Selector & Stats Bar */}
        <div className="bg-white/95 rounded-2xl p-5 border border-emerald-100/90 shadow-sm ring-1 ring-emerald-950/[0.03] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active Document:</label>
                {activeDoc && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Ready
                  </span>
                )}
              </div>
              {documentsList.length > 0 ? (
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-full px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-400 max-w-full truncate font-bold shadow-2xs cursor-pointer"
                >
                  {documentsList.map((doc) => (
                    <option key={doc.id} value={doc.id} className="bg-white text-slate-900">
                      {doc.fileName} ({(doc.fileSize / 1024).toFixed(0)} KB)
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-slate-500 mt-0.5">
                  No document loaded yet. Click <strong>1-Click Load Whitepaper</strong> or upload a PDF above.
                </p>
              )}
            </div>
          </div>

          {activeDoc && (
            <div className="flex items-center gap-3 text-xs text-slate-700 shrink-0 self-end md:self-center font-semibold">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 shadow-2xs">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span>{docChunks.length} Chunks</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 shadow-2xs">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>768-dim Embeddings</span>
              </div>
              <button
                onClick={handleDeleteDocument}
                className="p-2 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all cursor-pointer shadow-xs"
                title="Delete document"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Main Dual-Pane Split Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start min-h-[620px]">
          {/* LEFT PANE: Grounded Chat & Citations (6 Cols) */}
          <div className="lg:col-span-6 bg-white/95 rounded-3xl p-6 border border-emerald-100/90 shadow-sm flex flex-col h-[650px] ring-1 ring-emerald-950/[0.03]">
            {/* Chat Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">Document Q&A & Citation Grounding</h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-50/80 border border-amber-200 text-[11px] text-amber-800 font-mono font-bold inline-flex items-center gap-1.5 shadow-2xs">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                1 Credit / Query
              </span>
            </div>

            {/* Chat Messages Stream */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 overscroll-contain">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 text-[11px] font-bold shadow-2xs">
                      AI
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-br-xs shadow-xs font-medium"
                        : "bg-slate-50/90 border border-slate-200/80 text-slate-900 rounded-tl-xs font-normal shadow-2xs"
                    }`}
                  >
                    {msg.role === "user" ? msg.content : renderMessageContent(msg.content)}

                    {/* Cited page badges in message footer */}
                    {msg.citedPages && msg.citedPages.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                          Citations:
                        </span>
                        {msg.citedPages.map((p) => (
                          <button
                            key={p}
                            onClick={() => {
                              setActiveCitedPage(p);
                              setActiveTab("document");
                              toast.info(`Focused on Page ${p}`);
                            }}
                            className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold transition-all cursor-pointer border ${
                              activeCitedPage === p
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                : "bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50 hover:border-slate-300"
                            }`}
                          >
                            Page {p}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loadingQuery && (
                <div className="flex items-center gap-3 text-slate-500 text-xs py-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  </div>
                  <span className="animate-pulse font-semibold text-emerald-800">
                    Querying pgvector dense index + BM25 full-text fusion...
                  </span>
                </div>
              )}
            </div>

            {/* Quick Question Chips */}
            <div className="pt-2 pb-2 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
              {[
                "What is the Reciprocal Rank Fusion formula?",
                "What are the latency benchmarks (TTFT & Vector)?",
                "How is multi-tenant security enforced?",
              ].map((chip, idx) => (
                <button
                  key={idx}
                  disabled={!selectedDocId || loadingQuery}
                  onClick={() => handleSendQuery(chip)}
                  className="whitespace-nowrap px-3 py-1 rounded-full bg-white hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 text-[11px] text-slate-700 font-semibold transition-colors shrink-0 disabled:opacity-40 cursor-pointer shadow-2xs"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Query Input Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendQuery();
              }}
              className="pt-3 border-t border-slate-100 flex items-center gap-2"
            >
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder={
                  selectedDocId
                    ? "Ask anything about this document..."
                    : "Load a document first to start chatting..."
                }
                disabled={!selectedDocId || loadingQuery}
                className="flex-1 bg-white border-2 border-slate-200 rounded-full px-4 py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:opacity-50 shadow-xs transition-colors"
              />
              <button
                type="submit"
                disabled={!queryInput.trim() || !selectedDocId || loadingQuery}
                className="w-11 h-11 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center justify-center transition-all shadow-md shadow-emerald-600/20 hover:scale-105 disabled:opacity-40 cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* RIGHT PANE: Dual-Tab Document Inspector & Telemetry Canvas (6 Cols) */}
          <div className="lg:col-span-6 bg-white/95 rounded-3xl p-6 border border-emerald-100/90 shadow-sm flex flex-col h-[650px] ring-1 ring-emerald-950/[0.03]">
            {/* Tab Navigation */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-full border border-slate-200">
                <button
                  onClick={() => setActiveTab("document")}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === "document"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Document Reader
                </button>
                <button
                  onClick={() => setActiveTab("telemetry")}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === "telemetry"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  RRF Telemetry ({lastTelemetry.length})
                </button>
              </div>

              {activeCitedPage && activeTab === "document" && (
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-mono font-black animate-pulse shadow-xs">
                  Page {activeCitedPage}
                </span>
              )}
            </div>

            {/* TAB 1: Document Chunks Viewer with Glowing Citation Highlights */}
            {activeTab === "document" && (
              <div ref={docContainerRef} className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 overscroll-contain">
                {loadingDoc ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
                    <span>Loading document chunks...</span>
                  </div>
                ) : docChunks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-500">
                    <FileText className="w-12 h-12 text-slate-300 mb-3" />
                    <p className="text-sm font-bold text-slate-800">No Document Selected</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs">
                      Select a document from the top bar or load the whitepaper to preview chunks.
                    </p>
                  </div>
                ) : (
                  docChunks.map((chunk) => {
                    const isCited = activeCitedPage === chunk.pageNumber;
                    return (
                      <div
                        key={chunk.id}
                        ref={(el) => {
                          chunkRefs.current[chunk.id] = el;
                        }}
                        className={`rounded-2xl p-4 transition-colors duration-150 ${
                          isCited
                            ? "bg-emerald-50/70 border-2 border-emerald-500 shadow-2xs ring-1 ring-emerald-300/40"
                            : "bg-white border border-slate-200/80 hover:border-slate-300 shadow-2xs"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                isCited
                                  ? "bg-emerald-600 text-white font-black"
                                  : "bg-slate-100 text-slate-700 border border-slate-200"
                              }`}
                            >
                              Page {chunk.pageNumber} • Chunk #{chunk.chunkIndex + 1}
                            </span>
                            {isCited && (
                              <span className="text-[10px] text-emerald-700 font-extrabold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Cited Source
                              </span>
                            )}
                          </div>
                        </div>
                        <p
                          className={`text-xs leading-relaxed ${
                            isCited ? "text-emerald-950 font-medium" : "text-slate-700 font-normal"
                          }`}
                        >
                          {chunk.content}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 2: Hybrid RRF Search Telemetry */}
            {activeTab === "telemetry" && (
              <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 overscroll-contain">
                <div className="rounded-2xl p-4 border border-emerald-200 bg-emerald-50/50 text-xs text-slate-700 leading-relaxed space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-emerald-600" />
                    Reciprocal Rank Fusion (RRF $k=60$) Pipeline
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Dense cosine similarity queries in <code className="text-emerald-800 font-bold">pgvector</code> are combined with English dictionary BM25 lexical matches:
                  </p>
                  <div className="p-2.5 rounded-xl bg-white font-mono text-[11px] text-emerald-800 border border-emerald-200 font-semibold shadow-2xs">
                    RRF_Score = 1/(60 + Dense_Rank) + 1/(60 + Sparse_Rank)
                  </div>
                </div>

                {lastTelemetry.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center p-6 text-slate-500">
                    <Activity className="w-10 h-10 text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-800">No Telemetry Recorded</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Ask a question in the chat to see real-time vector and lexical search rankings.
                    </p>
                  </div>
                ) : (
                  lastTelemetry.map((t, idx) => (
                    <div key={t.id || idx} className="rounded-2xl p-4 border border-slate-200/80 bg-white shadow-2xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            Page {t.pageNumber} • Chunk #{t.chunkIndex + 1}
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold">
                          RRF: {t.rrfScore.toFixed(5)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-slate-500 block text-[10px]">Dense pgvector Rank:</span>
                          <span className="font-bold text-emerald-700">
                            {t.denseRank ? `#${t.denseRank} (${(t.denseScore * 100).toFixed(1)}% Sim)` : "N/A"}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-slate-500 block text-[10px]">Sparse BM25 Rank:</span>
                          <span className="font-bold text-teal-700">
                            {t.sparseRank ? `#${t.sparseRank} (Score: ${t.sparseScore.toFixed(2)})` : "N/A"}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 line-clamp-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono text-[11px]">
                        {t.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

