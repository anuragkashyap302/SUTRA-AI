"use client";

import { useState, useRef, useEffect } from "react";
import {
  PenTool,
  SlidersHorizontal,
  Copy,
  Check,
  Download,
  Printer,
  FileText,
  Table as TableIcon,
  Edit3,
  Eye,
  Loader2,
  Heading1,
  Heading2,
  Bold,
  Italic,
  List,
  Quote,
  Code,
  Zap,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { useTelemetry } from "@/context/TelemetryContext";
import { estimateTokens } from "@/lib/telemetry";

const TONE_OPTIONS = [
  { id: "Professional", label: "Professional", desc: "Crisp & authoritative" },
  { id: "Persuasive", label: "Persuasive", desc: "Compelling & action-driven" },
  { id: "Casual", label: "Casual", desc: "Approachable & conversational" },
  { id: "Academic", label: "Academic", desc: "Rigorous & analytical" },
  { id: "Storytelling", label: "Storytelling", desc: "Narrative & engaging" },
  { id: "Viral", label: "Viral", desc: "High-hook & shareable" },
];

const AUDIENCE_OPTIONS = [
  "General Audience",
  "Software Engineers & AI Devs",
  "Startup Founders & Tech Leaders",
  "C-Suite Executives & VCs",
  "Product Designers & Creators",
];

const TRANSLATION_LANGUAGES = ["Spanish", "French", "Hindi", "German", "Japanese"];

export default function ArticleStudioPage() {
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [tone, setTone] = useState("Professional");
  const [targetAudience, setTargetAudience] = useState("Software Engineers & AI Devs");
  const [keywords, setKeywords] = useState("");
  const [length, setLength] = useState(800);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [refactorAction, setRefactorAction] = useState<string | null>(null);
  const [generatedArticle, setGeneratedArticle] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<"preview" | "editor">("preview");
  const [selectedLanguage, setSelectedLanguage] = useState("Spanish");
  const [copied, setCopied] = useState(false);

  const { addTrace } = useTelemetry();
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Hydrate remixed prompt from URL query params
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const remixPrompt = params.get("remixPrompt");
      const remixTitle = params.get("title");
      if (remixPrompt) {
        setPrompt(remixPrompt);
        if (remixTitle) setTitle(remixTitle);
        toast.success("Remixed prompt loaded from Community!");
      }
    }
  }, []);

  // Statistics calculation
  const wordCount = generatedArticle
    ? generatedArticle.trim().split(/\s+/).filter(Boolean).length
    : 0;
  const readingTime = Math.ceil(wordCount / 200) || 1;
  const charCount = generatedArticle ? generatedArticle.length : 0;

  // Initial Full Article Generation
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error("Please enter a topic outline");
      return;
    }

    setIsGenerating(true);
    setGeneratedArticle(null);
    const startTime = performance.now();

    try {
      const res = await fetch("/api/ai/article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          title: title || prompt.slice(0, 50),
          length,
          tone,
          targetAudience,
          keywords,
          publish: true,
        }),
      });

      let json: any = null;
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        json = await res.json();
      } else {
        throw new Error(
          res.status === 401
            ? "Unauthorized: Please sign in to generate articles."
            : "Server returned a non-JSON response. Please try again."
        );
      }

      if (!res.ok || !json?.success) {
        if (res.status === 401) {
          toast.error("Please sign in to generate articles!");
          setTimeout(() => {
            window.location.href = "/sign-in?redirect_url=" + encodeURIComponent(window.location.pathname);
          }, 1200);
          return;
        }
        throw new Error(json?.error || "Failed to generate article");
      }

      const latencyMs = Math.round(performance.now() - startTime);
      const content = json.data.content;
      const promptTokens = estimateTokens(prompt) + estimateTokens(keywords) + 150;
      const completionTokens = estimateTokens(content);

      // Record Telemetry
      addTrace({
        studio: "Article Studio",
        model: "gemini-3.6-flash",
        latencyMs,
        ttftMs: Math.round(latencyMs * 0.25),
        promptTokens,
        completionTokens,
        status: "success",
        promptPreview: prompt,
        responsePreview: content,
        metadata: {
          tone,
          targetAudience,
          length,
          wordCount: content.split(/\s+/).length,
        },
      });

      setGeneratedArticle(json.data.content);
      setViewMode("preview");
      toast.success("Article generated successfully!");
    } catch (err: unknown) {
      const latencyMs = Math.round(performance.now() - startTime);
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);

      addTrace({
        studio: "Article Studio",
        model: "gemini-3.6-flash",
        latencyMs,
        promptTokens: estimateTokens(prompt),
        completionTokens: 0,
        status: "error",
        promptPreview: prompt,
        responsePreview: msg,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // In-Line 1-Click AI Transformation Handler
  const handleRefactor = async (action: "punchy" | "table" | "translate" | "seo" | "grammar" | "expand") => {
    if (!generatedArticle) return;

    setIsRefactoring(true);
    setRefactorAction(action);
    const toastId = toast.loading(`Applying AI refactor: ${action}...`);
    const startTime = performance.now();

    try {
      const res = await fetch("/api/ai/article/refactor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: generatedArticle,
          action,
          targetLanguage: action === "translate" ? selectedLanguage : undefined,
        }),
      });

      let json: any = null;
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        json = await res.json();
      } else {
        throw new Error(
          res.status === 401
            ? "Unauthorized: Please sign in to refactor articles."
            : "Server returned a non-JSON response. Please try again."
        );
      }

      if (!res.ok || !json?.success) {
        if (res.status === 401) {
          toast.error("Please sign in to continue!");
          setTimeout(() => {
            window.location.href = "/sign-in?redirect_url=" + encodeURIComponent(window.location.pathname);
          }, 1200);
          return;
        }
        throw new Error(json?.error || "Refactor failed");
      }

      const latencyMs = Math.round(performance.now() - startTime);
      const refactoredContent = json.data.content;
      const promptTokens = estimateTokens(generatedArticle) + 80;
      const completionTokens = estimateTokens(refactoredContent);

      addTrace({
        studio: "Article Studio (Refactor)",
        model: "gemini-3.6-flash",
        latencyMs,
        ttftMs: Math.round(latencyMs * 0.2),
        promptTokens,
        completionTokens,
        status: "success",
        promptPreview: `[Refactor Action: ${action}] ${generatedArticle.slice(0, 120)}...`,
        responsePreview: refactoredContent,
        metadata: {
          action,
          targetLanguage: selectedLanguage,
        },
      });

      setGeneratedArticle(json.data.content);
      toast.success(`Applied ${action} transformation! (1 Credit)`, { id: toastId });
    } catch (err: unknown) {
      const latencyMs = Math.round(performance.now() - startTime);
      const msg = err instanceof Error ? err.message : "Refactor error";
      toast.error(msg, { id: toastId });

      addTrace({
        studio: "Article Studio (Refactor)",
        model: "gemini-3.6-flash",
        latencyMs,
        promptTokens: estimateTokens(generatedArticle),
        completionTokens: 0,
        status: "error",
        promptPreview: `[Refactor: ${action}]`,
        responsePreview: msg,
      });
    } finally {
      setIsRefactoring(false);
      setRefactorAction(null);
    }
  };

  // Formatting Toolbar Helper for Editor Mode
  const insertFormatting = (prefix: string, suffix = "") => {
    if (!editorRef.current || !generatedArticle) return;

    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = generatedArticle.substring(start, end) || "text";

    const updatedText =
      generatedArticle.substring(0, start) +
      prefix +
      selectedText +
      suffix +
      generatedArticle.substring(end);

    setGeneratedArticle(updatedText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 50);
  };

  // Insert Table Template
  const insertTable = () => {
    const tableTemplate = `\n\n| Feature / Metric | Approach A | Approach B | Advantage |\n| :--- | :--- | :--- | :--- |\n| Latency | 42ms | 120ms | 3x Faster |\n| Precision | 99.4% | 88.1% | 100% Grounded |\n| Cost per 1K | $0.001 | $0.005 | 80% Savings |\n\n`;
    setGeneratedArticle((prev) => (prev || "") + tableTemplate);
    toast.success("Table template added!");
  };

  // Export handlers
  const copyToClipboard = () => {
    if (!generatedArticle) return;
    navigator.clipboard.writeText(generatedArticle);
    setCopied(true);
    toast.success("Markdown copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMarkdownFile = () => {
    if (!generatedArticle) return;
    const blob = new Blob([generatedArticle], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(title || "article").toLowerCase().replace(/\s+/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded .md file!");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 p-4 sm:p-6 lg:p-8 relative overflow-hidden">

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Studio Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-indigo-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/80 text-indigo-700 border border-indigo-200 text-xs font-bold mb-2 shadow-xs">
              <PenTool className="w-3.5 h-3.5 text-indigo-600" />
              Claude Artifacts Split Studio
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-700 via-blue-600 to-violet-600 bg-clip-text text-transparent">
              AI Content Creation & Artifacts Studio
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Generate long-form articles, refine with 1-click in-line AI transformations, and edit in dual-mode canvas.
            </p>
          </div>

          {generatedArticle && (
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 rounded-full bg-white hover:bg-indigo-50 text-slate-800 text-xs font-bold border-2 border-indigo-100 shadow-sm hover:shadow-md hover:scale-105 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-indigo-600" />}
                {copied ? "Copied" : "Copy MD"}
              </button>

              <button
                onClick={downloadMarkdownFile}
                className="px-4 py-2 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border-2 border-indigo-200 shadow-sm hover:shadow-md hover:scale-105 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                Download .md
              </button>

              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-full bg-white hover:bg-indigo-50 text-slate-800 text-xs font-bold border-2 border-slate-200 shadow-sm hover:shadow-md hover:scale-105 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                Print / PDF
              </button>
            </div>
          )}
        </div>

        {/* Main Split-Pane Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start min-h-[640px]">
          {/* LEFT PANE: Parameters & Prompt Studio (5 Cols) */}
          <div className="lg:col-span-5 bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-indigo-100 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3.5 border-b border-indigo-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                Article Parameters & Style
              </h2>
              <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[11px] text-indigo-700 font-mono font-bold inline-flex items-center gap-1.5 shadow-2xs">
                <Zap className="w-3 h-3 text-indigo-600 fill-indigo-600/30" />
                1 Credit
              </span>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Article Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Next-Gen Enterprise AI Architecture in 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-full bg-white border-2 border-indigo-100 text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 shadow-xs transition-all"
                />
              </div>

              {/* Prompt Outline */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Topic & Key Outline Points <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe what you want to write about, including specific sub-sections, target audience, and key metrics..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-indigo-100 text-slate-900 text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none shadow-xs transition-all"
                />
              </div>

              {/* Tone Selector Grid */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Tone of Voice
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TONE_OPTIONS.map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setTone(t.id)}
                      className={`p-2.5 rounded-2xl text-left border-2 transition-all cursor-pointer ${tone === t.id
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-[1.02]"
                          : "bg-white border-slate-200/80 text-slate-700 hover:text-indigo-900 hover:bg-slate-50 hover:border-slate-300"
                        }`}
                    >
                      <div className="text-xs font-bold">{t.label}</div>
                      <div className={`text-[10px] leading-tight mt-0.5 truncate font-medium ${tone === t.id ? "text-indigo-100" : "text-slate-500"}`}>
                        {t.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Audience & Keywords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Target Audience
                  </label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-full bg-white border-2 border-indigo-100 text-slate-900 text-xs font-semibold focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 shadow-xs cursor-pointer"
                  >
                    {AUDIENCE_OPTIONS.map((aud) => (
                      <option key={aud} value={aud} className="bg-white text-slate-900">
                        {aud}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Word Length (~tokens)
                  </label>
                  <select
                    value={length}
                    onChange={(e) => setLength(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-full bg-white border-2 border-indigo-100 text-slate-900 text-xs font-semibold focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 shadow-xs cursor-pointer"
                  >
                    <option value={500}>Short Form (~500 tokens)</option>
                    <option value={800}>Standard (~800 tokens)</option>
                    <option value={1500}>Long-Form (~1500 tokens)</option>
                  </select>
                </div>
              </div>

              {/* SEO Keywords */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target SEO Keywords (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. pgvector, next.js 15, hybrid rag, sub-50ms"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full bg-white border-2 border-indigo-100 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 shadow-xs transition-all"
                />
              </div>

              {/* Generate Button */}
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-4 rounded-full bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/25 hover:shadow-xl hover:scale-[1.01] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Synthesizing with Gemini 3.6 Flash...
                  </>
                ) : (
                  <>
                    <PenTool className="w-4 h-4" />
                    Generate Full Article (1 Credit)
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT PANE: Claude Artifacts Dual-Mode Content Canvas (7 Cols) */}
          <div className="lg:col-span-7 bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-indigo-100 shadow-xl flex flex-col h-[680px]">
            {/* Canvas Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-indigo-100">
              {/* Mode Switcher */}
              <div className="flex items-center gap-1 bg-indigo-50/60 p-1 rounded-full border border-indigo-100">
                <button
                  type="button"
                  onClick={() => setViewMode("preview")}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === "preview"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "text-slate-600 hover:text-indigo-700 hover:bg-white"
                    }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Live Preview
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("editor")}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === "editor"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "text-slate-600 hover:text-indigo-700 hover:bg-white"
                    }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Markdown Editor
                </button>
              </div>

              {/* Document Telemetry Counters */}
              {generatedArticle && (
                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono font-semibold px-3 py-1 rounded-full bg-slate-50 border border-slate-200">
                  <span>{wordCount} Words</span>
                  <span>•</span>
                  <span>~{readingTime} min read</span>
                  <span>•</span>
                  <span>{charCount} Chars</span>
                </div>
              )}
            </div>

            {/* In-Line 1-Click AI Transformation Suite (Available when article exists) */}
            {generatedArticle && (
              <div className="py-2.5 border-b border-indigo-100 overflow-x-auto flex items-center gap-2 no-scrollbar">
                <span className="text-[10px] uppercase font-extrabold text-indigo-700 shrink-0 mr-1 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> AI Tools:
                </span>

                <button
                  onClick={() => handleRefactor("punchy")}
                  disabled={isRefactoring}
                  className="whitespace-nowrap px-3 py-1 rounded-full bg-indigo-50/80 hover:bg-indigo-100 hover:text-indigo-800 border border-indigo-200 text-[11px] text-indigo-800 font-bold transition-all shrink-0 cursor-pointer disabled:opacity-40 shadow-2xs hover:scale-105"
                >
                  Make Punchier
                </button>

                <button
                  onClick={() => handleRefactor("table")}
                  disabled={isRefactoring}
                  className="whitespace-nowrap px-3 py-1 rounded-full bg-indigo-50/80 hover:bg-indigo-100 hover:text-indigo-800 border border-indigo-200 text-[11px] text-indigo-800 font-bold transition-all shrink-0 cursor-pointer disabled:opacity-40 shadow-2xs hover:scale-105"
                >
                  Add Table
                </button>

                <button
                  onClick={() => handleRefactor("seo")}
                  disabled={isRefactoring}
                  className="whitespace-nowrap px-3 py-1 rounded-full bg-indigo-50/80 hover:bg-indigo-100 hover:text-indigo-800 border border-indigo-200 text-[11px] text-indigo-800 font-bold transition-all shrink-0 cursor-pointer disabled:opacity-40 shadow-2xs hover:scale-105"
                >
                  SEO Meta
                </button>

                <button
                  onClick={() => handleRefactor("grammar")}
                  disabled={isRefactoring}
                  className="whitespace-nowrap px-3 py-1 rounded-full bg-indigo-50/80 hover:bg-indigo-100 hover:text-indigo-800 border border-indigo-200 text-[11px] text-indigo-800 font-bold transition-all shrink-0 cursor-pointer disabled:opacity-40 shadow-2xs hover:scale-105"
                >
                  Polish Flow
                </button>

                {/* Translate dropdown */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="bg-white border-2 border-indigo-100 text-[11px] text-slate-800 font-bold rounded-full px-3 py-1 focus:outline-none focus:border-indigo-400"
                  >
                    {TRANSLATION_LANGUAGES.map((lang) => (
                      <option key={lang} value={lang} className="bg-white text-slate-900">
                        {lang}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleRefactor("translate")}
                    disabled={isRefactoring}
                    className="whitespace-nowrap px-3.5 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-[11px] font-bold transition-all cursor-pointer disabled:opacity-40 shadow-xs hover:scale-105"
                  >
                    Translate
                  </button>
                </div>
              </div>
            )}

            {/* Formatting Toolbar (Only in Editor Mode) */}
            {viewMode === "editor" && generatedArticle && (
              <div className="py-2 border-b border-indigo-100 flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => insertFormatting("# ")}
                  className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 transition-colors"
                  title="Heading 1"
                >
                  <Heading1 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("## ")}
                  className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 transition-colors"
                  title="Heading 2"
                >
                  <Heading2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("**", "**")}
                  className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 font-bold transition-colors"
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("*", "*")}
                  className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 italic transition-colors"
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("- ")}
                  className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 transition-colors"
                  title="Bullet List"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("> ")}
                  className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 transition-colors"
                  title="Blockquote"
                >
                  <Quote className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("```\n", "\n```")}
                  className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 transition-colors"
                  title="Code Block"
                >
                  <Code className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={insertTable}
                  className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 transition-colors"
                  title="Insert Table"
                >
                  <TableIcon className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Canvas Content Body */}
            <div className="flex-1 overflow-y-auto py-4 pr-1 relative">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                  <p className="text-sm font-bold text-slate-800">Synthesizing Content with Gemini 3.6 Flash...</p>
                  <p className="text-xs text-slate-500">Applying tone: {tone} • Audience: {targetAudience}</p>
                </div>
              ) : isRefactoring ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                  <p className="text-sm font-bold text-slate-800">Refactoring Content ({refactorAction})...</p>
                  <p className="text-xs text-slate-500">Preserving structure & formatting</p>
                </div>
              ) : !generatedArticle ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-500">
                  <FileText className="w-12 h-12 text-indigo-200 mb-3" />
                  <h3 className="text-sm font-bold text-slate-800">Artifacts Canvas Ready</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                    Configure your parameters on the left and click <strong>Generate Full Article</strong> to start creating.
                  </p>
                </div>
              ) : viewMode === "editor" ? (
                <textarea
                  ref={editorRef}
                  value={generatedArticle}
                  onChange={(e) => setGeneratedArticle(e.target.value)}
                  className="w-full h-full bg-transparent text-slate-900 font-mono text-xs sm:text-sm p-2 focus:outline-none resize-none leading-relaxed"
                  placeholder="Write or edit markdown directly here..."
                />
              ) : (
                <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-headings:font-bold prose-h1:text-xl sm:prose-h1:text-2xl prose-h2:text-lg prose-p:text-slate-700 prose-p:leading-relaxed prose-li:text-slate-700 prose-strong:text-indigo-700 prose-table:border prose-table:border-slate-200 prose-th:bg-indigo-50/50 prose-td:border-slate-200">
                  <ReactMarkdown>{generatedArticle}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

