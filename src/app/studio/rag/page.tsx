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
        "Welcome to **Sutra Document Intelligence & Hybrid RAG Engine**! 🧠\n\nUpload any PDF document or load our pre-indexed **Enterprise Architecture Whitepaper** to ask deep questions with **verifiable inline [Page X] citations** and live vector/lexical retrieval telemetry.",
      timestamp: "Just now",
    },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const chunkRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

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

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loadingQuery]);

  // Auto-scroll document pane when a citation is clicked
  useEffect(() => {
    if (activeCitedPage !== null) {
      const targetChunk = docChunks.find((c) => c.pageNumber === activeCitedPage);
      if (targetChunk && chunkRefs.current[targetChunk.id]) {
        chunkRefs.current[targetChunk.id]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [activeCitedPage, docChunks]);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api/ai/rag/documents");
      const data = await res.json();
      if (data.success && data.data) {
        setDocumentsList(data.data);
        if (data.data.length > 0 && !selectedDocId) {
          setSelectedDocId(data.data[0].id);
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
        setDocChunks(data.data);
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
          content: `✅ Successfully indexed **${result.data.fileName}** (${result.data.pageCount} pages, ${result.data.chunkCount} vector chunks).\n\nTry asking:\n- *"What is the Reciprocal Rank Fusion formula?"*\n- *"What are the sub-50ms latency benchmarks?"*\n- *"How does multi-tenant isolation work?"*`,
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
          content: `📄 **${result.data.fileName}** is ready! Indexed **${result.data.pageCount} pages** and **${result.data.chunkCount} semantic chunks** into Neon \`pgvector\`. Ask any question below.`,
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
        model: "gemini-3.6-flash + text-embedding-004",
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
        model: "gemini-3.6-flash",
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
          content: `⚠️ **Error:** ${msg}`,
          timestamp: "Just now",
        },
      ]);
    } finally {
      setLoadingQuery(false);
    }
  };

  // Render text with interactive citation badges
  const renderMessageContent = (content: string) => {
    // Regex matches [Page X] or [Page X, Page Y]
    const parts = content.split(/(\[Page \d+(?:, Page \d+)*\])/g);

    return (
      <div className="space-y-2 leading-relaxed text-sm">
        {parts.map((part, idx) => {
          const match = part.match(/\[Page (\d+)\]/);
          if (match) {
            const pageNum = parseInt(match[1], 10);
            return (
              <button
                key={idx}
                onClick={() => {
                  setActiveCitedPage(pageNum);
                  setActiveTab("document");
                  toast.info(`Scrolled to Page ${pageNum} source citation`);
                }}
                className={`inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-full text-xs font-mono font-bold transition-all ${
                  activeCitedPage === pageNum
                    ? "bg-amber-400 text-slate-950 ring-2 ring-amber-300 shadow-lg shadow-amber-500/20 scale-105"
                    : "bg-amber-500/15 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                }`}
                title={`Click to jump to Page ${pageNum} source`}
              >
                <BookOpen className="w-3 h-3" />
                Page {pageNum}
              </button>
            );
          }

          // Format bullet points or plain lines
          return <span key={idx}>{part}</span>;
        })}
      </div>
    );
  };

  const activeDoc = documentsList.find((d) => d.id === selectedDocId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/70 via-white to-amber-50/40 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Banner & Quick Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-rose-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100/80 text-rose-700 border border-rose-200 text-xs font-bold mb-2 shadow-xs">
              <Cpu className="w-3.5 h-3.5 text-rose-600" />
              Hybrid RAG Engine (pgvector + BM25)
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 bg-clip-text text-transparent">
              Document Intelligence & Hybrid RAG Engine
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Reciprocal Rank Fusion (RRF $k=60$) search with sub-50ms citation-grounded answers.
            </p>
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
              className="px-5 py-2.5 rounded-full bg-white hover:bg-rose-50 border-2 border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 transition-all shadow-sm hover:shadow-md hover:scale-105 disabled:opacity-50 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-rose-600" />
              1-Click Load Whitepaper
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-rose-600/25 hover:shadow-xl hover:scale-105 disabled:opacity-50 cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Upload PDF Document
            </button>
          </div>
        </div>

        {/* Active Document Selector & Stats Bar */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 border border-rose-100 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-12 h-12 rounded-full bg-rose-50 border-2 border-rose-200 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
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
                  className="bg-rose-50/50 border-2 border-rose-100 text-slate-900 text-xs rounded-full px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-rose-400 max-w-full truncate font-bold shadow-xs cursor-pointer"
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
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100 shadow-xs">
                <Database className="w-3.5 h-3.5 text-rose-600" />
                <span>{docChunks.length} Chunks</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 shadow-xs">
                <Layers className="w-3.5 h-3.5 text-amber-600" />
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
          <div className="lg:col-span-6 bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-rose-100 shadow-xl flex flex-col h-[650px]">
            {/* Chat Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-rose-100">
              <div className="flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-rose-600" />
                <h2 className="text-sm font-bold text-slate-900">Document Q&A & Citation Grounding</h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-50 border border-rose-100 text-[11px] text-rose-700 font-mono font-bold">
                ⚡ 1 Credit / Query
              </span>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-700 border-2 border-rose-200 flex items-center justify-center shrink-0 text-xs font-black shadow-xs">
                      AI
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-3xl p-4 text-xs sm:text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-br-none shadow-md shadow-rose-600/20"
                        : "bg-rose-50/40 border border-rose-100 text-slate-800 rounded-tl-none font-normal shadow-xs"
                    }`}
                  >
                    {msg.role === "user" ? msg.content : renderMessageContent(msg.content)}

                    {/* Cited page badges in message footer */}
                    {msg.citedPages && msg.citedPages.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-rose-100 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                          Source Citations:
                        </span>
                        {msg.citedPages.map((p) => (
                          <button
                            key={p}
                            onClick={() => {
                              setActiveCitedPage(p);
                              setActiveTab("document");
                              toast.info(`Focused on Page ${p}`);
                            }}
                            className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold transition-all cursor-pointer ${
                              activeCitedPage === p
                                ? "bg-amber-400 text-slate-950 font-black shadow-sm ring-2 ring-amber-300 scale-105"
                                : "bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100"
                            }`}
                          >
                            📄 Page {p}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loadingQuery && (
                <div className="flex items-center gap-3 text-slate-500 text-xs py-2">
                  <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  </div>
                  <span className="animate-pulse font-semibold text-rose-700">
                    Querying pgvector dense index + BM25 full-text fusion...
                  </span>
                </div>
              )}
              <div ref={chatBottomRef} />
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
                  className="whitespace-nowrap px-3 py-1 rounded-full bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 border border-rose-100 text-[11px] text-slate-700 font-semibold transition-all shrink-0 disabled:opacity-40 cursor-pointer shadow-2xs"
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
              className="pt-3 border-t border-rose-100 flex items-center gap-2"
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
                className="flex-1 bg-white border-2 border-rose-100 rounded-full px-4 py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 disabled:opacity-50 shadow-xs transition-all"
              />
              <button
                type="submit"
                disabled={!queryInput.trim() || !selectedDocId || loadingQuery}
                className="w-11 h-11 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white flex items-center justify-center transition-all shadow-md shadow-rose-600/20 hover:scale-105 disabled:opacity-40 cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* RIGHT PANE: Dual-Tab Document Inspector & Telemetry Canvas (6 Cols) */}
          <div className="lg:col-span-6 bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-rose-100 shadow-xl flex flex-col h-[650px]">
            {/* Tab Navigation */}
            <div className="flex items-center justify-between pb-3.5 border-b border-rose-100">
              <div className="flex items-center gap-2 bg-rose-50/60 p-1 rounded-full border border-rose-100">
                <button
                  onClick={() => setActiveTab("document")}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "document"
                      ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                      : "text-slate-600 hover:text-rose-700 hover:bg-white"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Document Reader
                </button>
                <button
                  onClick={() => setActiveTab("telemetry")}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === "telemetry"
                      ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                      : "text-slate-600 hover:text-rose-700 hover:bg-white"
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  RRF Telemetry ({lastTelemetry.length})
                </button>
              </div>

              {activeCitedPage && activeTab === "document" && (
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-mono font-black animate-pulse shadow-xs">
                  Page {activeCitedPage}
                </span>
              )}
            </div>

            {/* TAB 1: Document Chunks Viewer with Glowing Citation Highlights */}
            {activeTab === "document" && (
              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                {loadingDoc ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-rose-500" />
                    <span>Loading document chunks...</span>
                  </div>
                ) : docChunks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-500">
                    <FileText className="w-12 h-12 text-rose-200 mb-3" />
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
                        className={`rounded-2xl p-4 transition-all duration-300 ${
                          isCited
                            ? "bg-amber-50/95 border-2 border-amber-400 shadow-lg shadow-amber-400/15 ring-2 ring-amber-300/60"
                            : "bg-white border border-rose-100/80 hover:border-rose-200 shadow-xs"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                                isCited
                                  ? "bg-amber-400 text-slate-950 font-black"
                                  : "bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs"
                              }`}
                            >
                              Page {chunk.pageNumber} • Chunk #{chunk.chunkIndex + 1}
                            </span>
                            {isCited && (
                              <span className="text-[10px] text-amber-700 font-extrabold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-amber-600" /> Cited Source
                              </span>
                            )}
                          </div>
                        </div>
                        <p
                          className={`text-xs leading-relaxed ${
                            isCited ? "text-amber-950 font-semibold" : "text-slate-700 font-normal"
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
              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                <div className="rounded-2xl p-4 border border-rose-200 bg-rose-50/60 text-xs text-slate-700 leading-relaxed space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-rose-600" />
                    Reciprocal Rank Fusion (RRF $k=60$) Pipeline
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Dense cosine similarity queries in <code className="text-rose-700 font-bold">pgvector</code> are combined with English dictionary BM25 lexical matches:
                  </p>
                  <div className="p-2.5 rounded-xl bg-white font-mono text-[11px] text-rose-700 border border-rose-200 font-semibold shadow-xs">
                    RRF_Score = 1/(60 + Dense_Rank) + 1/(60 + Sparse_Rank)
                  </div>
                </div>

                {lastTelemetry.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center p-6 text-slate-500">
                    <Activity className="w-10 h-10 text-rose-200 mb-2" />
                    <p className="text-xs font-bold text-slate-800">No Telemetry Recorded</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Ask a question in the chat to see real-time vector and lexical search rankings.
                    </p>
                  </div>
                ) : (
                  lastTelemetry.map((t, idx) => (
                    <div key={t.id || idx} className="rounded-2xl p-4 border border-rose-100 bg-white shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            Page {t.pageNumber} • Chunk #{t.chunkIndex + 1}
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-mono font-bold">
                          RRF: {t.rrfScore.toFixed(5)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 rounded-xl bg-rose-50/40 border border-rose-100">
                          <span className="text-slate-500 block text-[10px]">Dense pgvector Rank:</span>
                          <span className="font-bold text-emerald-700">
                            {t.denseRank ? `#${t.denseRank} (${(t.denseScore * 100).toFixed(1)}% Sim)` : "N/A"}
                          </span>
                        </div>
                        <div className="p-2 rounded-xl bg-amber-50/40 border border-amber-100">
                          <span className="text-slate-500 block text-[10px]">Sparse BM25 Rank:</span>
                          <span className="font-bold text-amber-700">
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

