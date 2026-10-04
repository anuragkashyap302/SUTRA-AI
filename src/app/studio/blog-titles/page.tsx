"use client";

import { useState, useEffect } from "react";
import { Hash, Sparkles, Copy, Check, Loader2, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import Link from "next/link";

export default function BlogTitlesPage() {
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState("Technology");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTitles, setGeneratedTitles] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Hydrate remixed prompt from URL query params
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const remixPrompt = params.get("remixPrompt");
      if (remixPrompt) {
        setPrompt(remixPrompt);
        toast.success("✨ Remixed topic loaded from Community!");
      }
    }
  }, []);

  const categories = [
    "Technology",
    "Business & Startups",
    "Marketing & Growth",
    "Design & Creative",
    "Lifestyle & Wellness",
    "Personal Development",
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error("Please enter a keyword or topic");
      return;
    }

    setIsGenerating(true);
    setGeneratedTitles(null);

    try {
      const res = await fetch("/api/ai/blog-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, category }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to generate titles");

      setGeneratedTitles(json.data.content);
      toast.success("Catchy titles generated!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedTitles) return;
    navigator.clipboard.writeText(generatedTitles);
    setCopied(true);
    toast.success("Copied titles to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 lg:p-8 relative">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Studio Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-rose-200/80">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center shadow-md shadow-rose-500/20 text-white shrink-0">
              <Hash className="w-6 h-6" />
            </div>
            <div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-rose-100/90 text-rose-900 border border-rose-200/90 text-[11px] font-bold mb-1 shadow-2xs backdrop-blur-xs">
                  <Sparkles className="w-3 h-3 text-rose-600" />
                  Viral CTR & Search Engine
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-600 via-rose-500 to-pink-500 bg-clip-text text-transparent leading-snug pb-0.5">
                Blog Title Generator
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed font-medium">
                Generate catchy, viral, SEO-friendly headline ideas tailored for audience resonance and search intent.
              </p>
            </div>
          </div>

          {generatedTitles && (
            <button
              onClick={copyToClipboard}
              className="px-5 py-2.5 rounded-full bg-white hover:bg-rose-50 text-rose-800 text-xs font-bold border-2 border-rose-200 flex items-center gap-2 transition-all shadow-sm hover:shadow-md hover:scale-105 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-rose-600" />}
              {copied ? "Copied!" : "Copy Titles"}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form */}
          <div className="lg:col-span-5">
            <form onSubmit={handleGenerate} className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-white/90 ring-1 ring-rose-950/[0.05] shadow-xl space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Keyword or Topic Outline <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI full-stack development, remote work habits"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-4 py-3 rounded-full bg-white border-2 border-rose-100 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all font-medium shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Industry Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-full bg-white border-2 border-rose-100 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all font-semibold cursor-pointer shadow-xs"
                >
                  {categories.map((c) => (
                    <option key={c} value={c} className="bg-white text-slate-900">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-4 rounded-full bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-sm font-bold shadow-lg shadow-rose-600/25 hover:shadow-xl hover:scale-[1.01] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Catchy Titles...
                  </>
                ) : (
                  <>
                    <Hash className="w-4 h-4" />
                    Generate 10 Titles (1 Credit)
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Output */}
          <div className="lg:col-span-7">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/90 ring-1 ring-rose-950/[0.05] shadow-xl min-h-[400px] flex flex-col justify-center">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <Loader2 className="w-10 h-10 animate-spin text-rose-600 mb-3" />
                  <p className="text-sm font-bold text-slate-900">Crafting viral headlines with Gemini...</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Optimizing CTR & search intent algorithms</p>
                </div>
              ) : generatedTitles ? (
                <div className="prose max-w-none text-slate-800 prose-headings:text-slate-900 prose-p:text-slate-700 prose-ol:text-slate-800 prose-li:my-2 prose-strong:text-rose-700">
                  <ReactMarkdown>{generatedTitles}</ReactMarkdown>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-3 border-2 border-rose-100 shadow-xs">
                    <Hash className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Your generated titles will appear here</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs font-medium">
                    Enter your topic and click generate to get 10 high-CTR headlines.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

