"use client";

import React from "react";
import { useTelemetry } from "@/context/TelemetryContext";
import { Activity, Sparkles, Zap } from "lucide-react";

export function TelemetryFloatingButton() {
  const { isMounted, traces, setDrawerOpen, isDrawerOpen } = useTelemetry();

  if (!isMounted || isDrawerOpen) return null;

  return (
    <button
      onClick={() => setDrawerOpen(true)}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-400 shadow-xl shadow-slate-900/10 group transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
      title="Open Real-Time LLM Observability & Developer Telemetry Drawer"
    >
      <div className="relative flex items-center justify-center">
        <Activity className="w-4 h-4 text-emerald-600 group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-slate-800 tracking-tight">Observability</span>
        <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-700 rounded-full border border-slate-200">
          {traces.length}
        </span>
      </div>
    </button>
  );
}
