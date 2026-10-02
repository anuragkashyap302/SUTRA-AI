"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
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
  ExternalLink,
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
  const { openUserProfile } = useClerk();

  if (!isOpen) return null;

  // Real Clerk Billing Checkout Flow with Auto-Switch to Billing Tab
  const handleUpgradeViaClerk = (planName: string) => {
    onClose();
    toast.info(`Opening Clerk Billing for ${planName}...`, {
      description: "Redirecting directly to your subscription plans...",
    });

    try {
      (openUserProfile as any)({ path: "billing" });
    } catch {
      openUserProfile();
    }

    // Polling helper to automatically click the "Billing" tab inside Clerk modal
    const tryClickBillingTab = (attempt = 0) => {
      const allClickables = Array.from(document.querySelectorAll("button, a, div[role='button']"));
      const billingTab = allClickables.find((el) => {
        const text = el.textContent?.trim().toLowerCase() || "";
        const aria = el.getAttribute("aria-label")?.toLowerCase() || "";
        const loc = el.getAttribute("data-localization-key")?.toLowerCase() || "";
        return text === "billing" || aria.includes("billing") || loc.includes("billing");
      }) as HTMLElement | undefined;

      if (billingTab) {
        billingTab.click();
      } else if (attempt < 20) {
        setTimeout(() => tryClickBillingTab(attempt + 1), 100);
      }
    };

    setTimeout(() => tryClickBillingTab(0), 100);
  };

  // Developer Test Refill Mode
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
      description: "Ideal for testing all AI studios with daily refills.",
      credits: "20 Daily Credits",
      badge: "Current Plan",
      features: [
        "Gemini 3.6 Flash Articles & Titles",
        "Flagship Hybrid RAG (PDF Q&A)",
        "AI Image Gen & Object Removal",
        "ATS Resume Review & Feedback",
        "Public Community Feed Access",
        "Standard Generation Speed",
      ],
      highlighted: false,
      buttonText: "Active Plan",
      disabled: true,
      action: "none",
    },
    {
      name: "Premium",
      price: "$2",
      period: "per month",
      description: "Light creator pack with 5x monthly credit reserve.",
      credits: "100 Monthly Credits",
      badge: "Starter Pro",
      features: [
        "Gemini 3.6 Flash Articles & Titles",
        "Flagship Hybrid RAG (PDF Q&A)",
        "AI Image Gen & Object Removal",
        "ATS Resume Review & Feedback",
        "Public Community Feed Access",
        "Fast Generation Speed",
      ],
      highlighted: false,
      buttonText: "Subscribe via Clerk",
      disabled: false,
      action: "clerk",
    },
    {
      name: "Pro Creator",
      price: "$19",
      period: "per month",
      description: "High-volume generation for builders & creators.",
      credits: "500 Monthly Credits",
      badge: "Most Popular",
      features: [
        "Gemini 3.6 Flash Articles & Titles",
        "Flagship Hybrid RAG (PDF Q&A)",
        "AI Image Gen & Object Removal",
        "ATS Resume Review & Feedback",
        "Public Community Feed Access",
        "Priority Multimodal Compute",
      ],
      highlighted: true,
      buttonText: "Subscribe via Clerk",
      disabled: false,
      action: "clerk",
    },
    {
      name: "Enterprise",
      price: "$49",
      period: "per month",
      description: "Unlimited generation quota for high-demand workflows.",
      credits: "Unlimited Credits",
      badge: "Scale & SLA",
      features: [
        "Gemini 3.6 Flash Articles & Titles",
        "Flagship Hybrid RAG (PDF Q&A)",
        "AI Image Gen & Object Removal",
        "ATS Resume Review & Feedback",
        "Public Community Feed Access",
        "Dedicated Speed & 24/7 SLA",
      ],
      highlighted: false,
      buttonText: "Subscribe via Clerk",
      disabled: false,
      action: "clerk",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl bg-white rounded-3xl p-5 sm:p-8 border border-emerald-100 shadow-2xl shadow-emerald-950/20 overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Emerald & Teal Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-teal-200/40 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-500 hover:text-emerald-800 transition-colors cursor-pointer border border-transparent hover:border-emerald-200 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold shadow-xs">
            <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
            Credit Balance: <span className="font-extrabold text-emerald-950">{currentCredits} Credits</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif">
            Upgrade Your{" "}
            <span className="italic font-serif font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
              Creation Power
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Get higher credit quotas, unlock the Flagship Hybrid RAG engine, and create without limits.
          </p>
        </div>

        {/* 1-Click Instant Test Top-Up Bar */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-50 border border-emerald-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-xs">
              <Flame className="w-5 h-5 fill-emerald-600 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                Developer Test Mode: Instant Credit Refill
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold border border-emerald-200">Free Sandbox</span>
              </h4>
              <p className="text-[11px] text-slate-600">
                Simulate a credit purchase by adding +20 credits directly to your Neon PostgreSQL balance.
              </p>
            </div>
          </div>

          <button
            onClick={handleTopUp}
            disabled={loadingTopUp}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all shrink-0 cursor-pointer disabled:opacity-50 hover:scale-105 active:scale-95"
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

        {/* 4 Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 relative z-10">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all relative ${
                plan.highlighted
                  ? "bg-white border-2 border-emerald-500 shadow-xl shadow-emerald-500/15 scale-[1.02] ring-4 ring-emerald-500/10"
                  : "bg-slate-50/70 border border-slate-200 hover:border-emerald-200 hover:bg-slate-50 transition-colors"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md shadow-emerald-600/30 flex items-center gap-1 whitespace-nowrap">
                  <Sparkles className="w-3 h-3" />
                  {plan.badge}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg">{plan.name}</h3>
                  {!plan.highlighted && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 font-semibold border border-slate-200">
                      {plan.badge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 min-h-[32px] mb-3">
                  {plan.description}
                </p>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-black text-slate-900">{plan.price}</span>
                  <span className="text-xs text-slate-500">/{plan.period}</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-bold mb-4">
                  <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                  {plan.credits}
                </div>

                <div className="space-y-2 pb-5 border-t border-slate-200/80 pt-3">
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
                  if (plan.action === "clerk") {
                    handleUpgradeViaClerk(plan.name);
                  }
                }}
                disabled={plan.disabled}
                className={`w-full py-2.5 sm:py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  plan.highlighted
                    ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 hover:scale-[1.02] active:scale-[0.98]"
                    : plan.disabled
                    ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                    : "bg-slate-900 hover:bg-emerald-950 text-white border border-slate-800 hover:border-emerald-500 shadow-md hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                {plan.buttonText}
                {!plan.disabled && <ExternalLink className="w-3.5 h-3.5 ml-0.5" />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
