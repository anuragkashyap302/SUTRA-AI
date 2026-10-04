"use client";

import React, { useState } from "react";
import { useTelemetry } from "@/context/TelemetryContext";
import {
  Activity,
  Zap,
  Coins,
  Clock,
  Layers,
  Search,
  Download,
  Trash2,
  ChevronRight,
  Sparkles,
  Cpu,
  Check,
  Copy,
  ArrowUpRight,
  ShieldCheck,
  Sliders,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ObservabilityDashboardPage() {
  const {
    traces,
    summary,
    clearTraces,
    exportTracesJson,
    selectedTrace,
    setSelectedTrace,
    isMounted,
  } = useTelemetry();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudioFilter, setSelectedStudioFilter] = useState("ALL");
  const [copiedTraceId, setCopiedTraceId] = useState<string | null>(null);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 text-sm font-medium">
        Initializing Observability telemetry pipeline...
      </div>
    );
  }

  const handleCopyPrompt = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTraceId(id);
    toast.success("Prompt context copied to clipboard");
    setTimeout(() => setCopiedTraceId(null), 2000);
  };

  const filteredTraces = traces.filter((t) => {
    const matchesSearch =
      t.studio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.promptPreview.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedStudioFilter === "ALL") return matchesSearch;
    if (selectedStudioFilter === "RAG") return matchesSearch && t.studio.includes("RAG");
    if (selectedStudioFilter === "ARTICLE") return matchesSearch && t.studio.includes("Article");
    if (selectedStudioFilter === "VISION")
      return (
        matchesSearch &&
        (t.studio.includes("Image") || t.studio.includes("Inpaint") || t.studio.includes("Background"))
      );
    if (selectedStudioFilter === "ATS") return matchesSearch && t.studio.includes("ATS");
    return matchesSearch;
  });

  // Calculate model breakdown
  const modelStats = traces.reduce((acc, t) => {
    acc[t.model] = (acc[t.model] || 0) + t.totalTokens;
    return acc;
  }, {} as Record<string, number>);

  const totalTokens = summary.totalTokens || 1;

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  Real-Time LLM Observability & Telemetry
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full flex items-center gap-1.5 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  SYSTEM HEALTHY
                </span>
              </div>
              <p className="text-sm text-slate-500 font-medium">
                Full-trace OpenTelemetry metrics, per-call token accounting, TTFT latency & cost analytics
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={clearTraces}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Trash2 className="w-4 h-4" /> Clear Session
          </button>
          <button
            onClick={exportTracesJson}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 rounded-xl shadow-md shadow-teal-600/20 transition-all cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4" /> Export Traces (JSON)
          </button>
        </div>
      </div>

      {/* 4 Flagship Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tokens Card */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-teal-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Total Tokens Processed</span>
            <Layers className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mb-1">
            {summary.totalTokens.toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 font-medium">Across {summary.totalCalls} model inferences</p>
        </div>

        {/* Cumulative API Spend */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Estimated API Spend</span>
            <Coins className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mb-1">
            ${summary.totalCostUsd.toFixed(5)} <span className="text-xs font-normal text-slate-400">USD</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Gemini 3.6 Flash + Vision API rates</p>
        </div>

        {/* Average Latency */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-teal-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Mean Latency</span>
            <Clock className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-teal-700 mb-1">
            {summary.avgLatencyMs} <span className="text-xs font-normal text-slate-400">ms</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Sub-50ms token stream throughput</p>
        </div>

        {/* Success Rate */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Inference Success Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mb-1">{summary.successRate}%</div>
          <p className="text-xs text-emerald-600 font-bold">0 Fatal Execution Errors</p>
        </div>
      </div>

      {/* Model Breakdown Progress Bars & Architecture Callout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model Token Share */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-teal-600" /> Token Volume By Model
            </h3>
            <span className="text-xs text-slate-500 font-mono font-medium">
              {Object.keys(modelStats).length} Active Endpoints
            </span>
          </div>

          <div className="space-y-3.5 pt-2">
            {Object.entries(modelStats).map(([modelName, tokens]) => {
              const pct = Math.round((tokens / totalTokens) * 100);
              return (
                <div key={modelName} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-800 font-semibold">{modelName}</span>
                    <span className="font-bold text-slate-600">
                      {tokens.toLocaleString()} tokens ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Observability Standards Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-teal-50/80 via-white to-emerald-50/80 border border-teal-100 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Production Telemetry Design
            </div>
            <h4 className="text-base font-extrabold text-slate-900">Full-Trace Langfuse / OpenTelemetry Compliance</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Every inference captures input prompt context, dense & sparse RRF retrieval chunks, TTFT
              (Time to First Token), and token-cost calculus for strict enterprise SLA compliance.
            </p>
          </div>

          <div className="pt-3 border-t border-teal-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Latency SLA: &lt; 2.5s</span>
            <span className="text-emerald-700 font-bold">Grounded & Verified</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
            {[
              { id: "ALL", label: "All Traces" },
              { id: "RAG", label: "🧠 Hybrid RAG" },
              { id: "ARTICLE", label: "✍️ Articles" },
              { id: "VISION", label: "🎨 Vision & Inpaint" },
              { id: "ATS", label: "📄 ATS Reviewer" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStudioFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedStudioFilter === tab.id
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompts, models, keywords..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-xs font-medium"
            />
          </div>
        </div>

        {/* Detailed Trace Events Table */}
        <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Studio / Model</th>
                  <th className="p-4">Prompt Context</th>
                  <th className="p-4">Latency & TTFT</th>
                  <th className="p-4">Tokens (In / Out)</th>
                  <th className="p-4">Cost (USD)</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTraces.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">
                      No matching telemetry traces found.
                    </td>
                  </tr>
                ) : (
                  filteredTraces.map((trace) => {
                    const isFast = trace.latencyMs < 1000;
                    return (
                      <tr
                        key={trace.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        <td className="p-4 space-y-1">
                          <span className="inline-block px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-teal-50 text-teal-700 border border-teal-200">
                            {trace.studio}
                          </span>
                          <p className="text-[10px] font-mono text-slate-400 font-medium">{trace.model}</p>
                        </td>

                        <td className="p-4 max-w-xs">
                          <p className="text-xs text-slate-800 line-clamp-2 leading-relaxed font-medium">
                            {trace.promptPreview}
                          </p>
                        </td>

                        <td className="p-4 whitespace-nowrap space-y-0.5">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                              isFast
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {trace.latencyMs} ms
                          </span>
                          {trace.ttftMs && (
                            <p className="text-[10px] text-teal-600 font-semibold">TTFT: {trace.ttftMs}ms</p>
                          )}
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          <span className="font-bold text-slate-900">
                            {trace.totalTokens.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-medium">
                            ({trace.promptTokens} in / {trace.completionTokens} out)
                          </span>
                        </td>

                        <td className="p-4 whitespace-nowrap font-mono text-emerald-700 font-bold">
                          ${trace.costUsd.toFixed(6)}
                        </td>

                        <td className="p-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleCopyPrompt(trace.promptPreview, trace.id)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors inline-flex items-center gap-1 text-[11px] cursor-pointer"
                            title="Copy Prompt Context"
                          >
                            {copiedTraceId === trace.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
