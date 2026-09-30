"use client";

import { useState } from "react";
import {
  Zap,
  Check,
  Sparkles,
  X,
  Crown,
  ShieldCheck,
  Flame,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCredits?: number;
  onCreditsUpdated?: (newCredits: number) => void;
}

export function PricingModal({
  isOpen,
  onClose,
  currentCredits = 20,
  onCreditsUpdated,
}: PricingModalProps) {
  const [loadingTopUp, setLoadingTopUp] = useState(false);

  if (!isOpen) return null;

  const handleTopUp = async () => {
    setLoadingTopUp(true);
    const toastId = toast.loading("Refilling +20 creation credits in PostgreSQL...");
    try {
      const res = await fetch("/api/user/credits/top-up", {
        method: "POST",
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Top-up failed");
      }

      toast.success("🎉 Added +20 Credits to your balance!", { id: toastId });
      if (onCreditsUpdated) {
        onCreditsUpdated(data.data.credits);
      }
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to add credits";
      toast.error(msg, { id: toastId });
    } finally {
      setLoadingTopUp(false);
    }
  };

  const plans = [
    {
      name: "Free Starter",
      price: "$0",
      period: "forever",
      description: "Ideal for testing AI studios and light personal creation.",
      credits: "20 Daily Credits",
      badge: "Current Plan",
      features: [
        "Gemini 3.6 Flash Article & Titles",
        "ClipDrop Background Removal",
        "Basic ATS Resume Review",
        "Public Community Feed Access",
      ],
      highlighted: false,
      buttonText: "Active Plan",
      disabled: true,
    },
    {
      name: "Pro Creator",
      price: "$19",
      period: "per month",
      description: "For professionals, content creators & engineers.",
      credits: "500 Monthly Credits",
      badge: "Most Popular",
      features: [
        "All Free Tier Features",
        "Flagship Hybrid RAG (pgvector + BM25)",
        "Interactive Canvas Inpainting Brush",
        "Claude Artifacts-Style Split WYSIWYG",
        "1-Click PDF, MD & HTML Exports",
        "No Watermarks & Priority Generation",
      ],
      highlighted: true,
      buttonText: "Upgrade to Pro",
      disabled: false,
    },
    {
      name: "Enterprise",
      price: "$49",
      period: "per month",
      description: "For high-volume teams, founders & organizations.",
      credits: "Unlimited Credits",
      badge: "Scale & SLA",
      features: [
        "Everything in Pro Creator",
        "Unlimited Generation Credits",
        "Dedicated Neon Vector Indexing",
        "100K Token Document Ingestion",
        "Custom System Prompts & Tone",
        "24/7 Dedicated SLA & Support",
      ],
      highlighted: false,
      buttonText: "Upgrade to Enterprise",
      disabled: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-100 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-pink-100 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            Credit Balance: <span className="font-extrabold">{currentCredits} Credits</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Upgrade Your Creation Power
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Get higher credit quotas, unlock the Flagship Hybrid RAG engine, and create without limits.
          </p>
        </div>

        {/* 1-Click Instant Test Top-Up Bar */}
        <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                Developer Test Mode: Instant Credit Refill
              </h4>
              <p className="text-[11px] text-slate-600">
                Simulate a credit purchase by adding +20 credits directly to your Neon PostgreSQL balance.
              </p>
            </div>
          </div>

          <button
            onClick={handleTopUp}
            disabled={loadingTopUp}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all shrink-0 cursor-pointer disabled:opacity-50"
          >
            {loadingTopUp ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Refilling...
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                +20 Test Credits (Instant)
              </>
            )}
          </button>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl p-6 flex flex-col justify-between transition-all relative ${
                plan.highlighted
                  ? "bg-white border-2 border-indigo-600 shadow-xl shadow-indigo-500/10 scale-[1.02]"
                  : "bg-slate-50/70 border border-slate-200"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                  {plan.badge}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-900 text-lg">{plan.name}</h3>
                  {!plan.highlighted && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-600 border border-slate-200">
                      {plan.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 min-h-[32px] mb-4">
                  {plan.description}
                </p>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900">{plan.price}</span>
                  <span className="text-xs text-slate-500">/{plan.period}</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-bold mb-6">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  {plan.credits}
                </div>

                <div className="space-y-2.5 pb-6 border-t border-slate-200 pt-4">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  if (!plan.disabled) {
                    handleTopUp();
                  }
                }}
                disabled={plan.disabled || loadingTopUp}
                className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  plan.highlighted
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
                    : plan.disabled
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-white hover:bg-slate-100 text-slate-800 border border-slate-300"
                }`}
              >
                {plan.buttonText}
                {!plan.disabled && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
