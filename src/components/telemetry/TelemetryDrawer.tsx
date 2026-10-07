"use client";

import React, { useState } from "react";
import { useTelemetry } from "@/context/TelemetryContext";
import {
  X,
  Zap,
  Activity,
  Coins,
  Clock,
  Download,
  Trash2,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
  Copy,
  Check,
  Code2,
  FileText,
  Search,
} from "lucide-react";
import { toast } from "sonner";

export function TelemetryDrawer() {
  const {
    traces,
    isDrawerOpen,
    setDrawerOpen,
    selectedTrace,
    setSelectedTrace,
    summary,
    clearTraces,
    exportTracesJson,
    isMounted,
  } = useTelemetry();

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState("");

  if (!isMounted || !isDrawerOpen) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`Copied ${field} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const filteredTraces = traces.filter(
    (t) =>
      t.studio.toLowerCase().includes(filterQuery.toLowerCase()) ||
      t.model.toLowerCase().includes(filterQuery.toLowerCase()) ||
      t.promptPreview.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div
        className="absolute inset-0"
        onClick={() => setDrawerOpen(false)}
      />

      {/* Slide-out Drawer Panel */}
      <div className="relative w-full max-w-2xl h-full bg-white border-l border-slate-200 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 shadow-xs">
              <Activity className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                  <span className="text-emerald-700">LLM</span> Observability Drawer
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full">
                  LIVE TRACING
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Real-time token metrics, latency breakdown & per-call cost telemetry
              </p>
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-4 gap-2 p-4 bg-slate-50 border-b border-slate-200 text-xs">
          <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mb-1">
              <Zap className="w-3 h-3 text-amber-500" /> Calls
            </span>
            <span className="text-sm font-extrabold text-slate-900">{summary.totalCalls}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mb-1">
              <Layers className="w-3 h-3 text-teal-600" /> Tokens
            </span>
            <span className="text-sm font-extrabold text-slate-900">
              {summary.totalTokens.toLocaleString()}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mb-1">
              <Coins className="w-3 h-3 text-emerald-600" /> Est. Spend
            </span>
            <span className="text-sm font-extrabold text-emerald-700">
              ${summary.totalCostUsd.toFixed(5)}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mb-1">
              <Clock className="w-3 h-3 text-teal-600" /> Avg Latency
            </span>
            <span className="text-sm font-extrabold text-teal-700">
              {summary.avgLatencyMs} ms
            </span>
          </div>
        </div>

        {/* Selected Trace Detail or Trace List */}
        {selectedTrace ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Back Button */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <button
                onClick={() => setSelectedTrace(null)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                ← Back to Trace Stream
              </button>
              <span className="text-xs font-mono text-slate-400 font-medium">ID: {selectedTrace.id}</span>
            </div>

            {/* Trace Header Info */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-teal-50 text-teal-700 border border-teal-200">
                  {selectedTrace.studio}
                </span>
                <span className="text-xs font-mono text-emerald-700 font-bold">
                  ${selectedTrace.costUsd.toFixed(6)} USD
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">MODEL</span>
                  <span className="text-slate-800 font-mono text-[11px] font-semibold">
                    {selectedTrace.model}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">TOTAL LATENCY</span>
                  <span className="text-slate-800 font-bold">{selectedTrace.latencyMs} ms</span>
                  {selectedTrace.ttftMs && (
                    <span className="text-[10px] text-teal-600 font-medium block">
                      TTFT: {selectedTrace.ttftMs} ms
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">TOKENS (IN/OUT)</span>
                  <span className="text-slate-800 font-bold">
                    {selectedTrace.promptTokens} / {selectedTrace.completionTokens} ({selectedTrace.totalTokens})
                  </span>
                </div>
              </div>
            </div>

            {/* Prompt Block */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-500" /> Prompt & Input Context
                </span>
                <button
                  onClick={() => handleCopy(selectedTrace.promptPreview, "Prompt")}
                  className="text-[11px] text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer font-medium"
                >
                  {copiedField === "Prompt" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  Copy
                </button>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {selectedTrace.promptPreview}
              </div>
            </div>

            {/* Response Output Block */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-emerald-600" /> Model Response
                </span>
                <button
                  onClick={() => handleCopy(selectedTrace.responsePreview, "Response")}
                  className="text-[11px] text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer font-medium"
                >
                  {copiedField === "Response" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  Copy
                </button>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {selectedTrace.responsePreview}
              </div>
            </div>

            {/* Metadata / Retrieval Info if any */}
            {selectedTrace.metadata && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-teal-600" /> Execution Metadata & RRF Chunks
                </span>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-700 whitespace-pre-wrap">
                  {JSON.stringify(selectedTrace.metadata, null, 2)}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Search Filter */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter by studio, model or prompt keyword..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
              />
            </div>

            {/* Traces Feed */}
            {filteredTraces.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs font-medium">
                No telemetry traces matching query.
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredTraces.map((trace) => {
                  const isFast = trace.latencyMs < 1000;
                  return (
                    <div
                      key={trace.id}
                      onClick={() => setSelectedTrace(trace)}
                      className="group p-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300 shadow-xs transition-all cursor-pointer space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-teal-50 text-teal-700 border border-teal-200">
                            {trace.studio}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500 font-medium">
                            {trace.model}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                              isFast
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {trace.latencyMs} ms
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 transition-colors" />
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed font-medium">
                        {trace.promptPreview}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100 font-medium">
                        <div className="flex items-center gap-3">
                          <span>
                            Tokens: <strong className="text-slate-800">{trace.totalTokens}</strong>
                          </span>
                          {trace.ttftMs && (
                            <span className="text-teal-600 font-semibold">
                              TTFT: <strong>{trace.ttftMs}ms</strong>
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-emerald-700 font-bold">
                          ${trace.costUsd.toFixed(6)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={clearTraces}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200 cursor-pointer shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Session
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={exportTracesJson}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 rounded-xl shadow-md shadow-teal-600/20 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Export Traces (JSON)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
