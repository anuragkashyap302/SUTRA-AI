"use client";

import { useClerk, useUser, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { Check, Sparkles, Zap, ArrowRight, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export function HomePricingSection() {
  const { isSignedIn } = useUser();
  const { openUserProfile } = useClerk();

  const handleOpenBilling = (planName: string) => {
    toast.info(`Opening Clerk Billing for ${planName}...`, {
      description: "Redirecting directly to your subscription plans...",
    });

    try {
      (openUserProfile as any)({ path: "billing" });
    } catch {
      openUserProfile();
    }

    // Auto-click the Billing tab inside Clerk modal so it doesn't stay on Profile
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

  const plans = [
    {
      name: "Free Starter",
      price: "$0",
      period: "forever",
      description: "Ideal for testing all AI studios with daily refills.",
      badge: "Free Forever",
      highlighted: false,
      features: [
        "Gemini 3.8 Flash Articles & Titles",
        "Flagship Hybrid RAG (PDF Q&A)",
        "AI Image Gen & Object Removal",
        "ATS Resume Review & Feedback",
        "Public Community Feed Access",
        "Standard Generation Speed",
      ],
      isFree: true,
    },
    {
      name: "Premium",
      price: "$2",
      period: "per month",
      description: "Light creator pack with 5x monthly credit reserve.",
      badge: "Starter Pro",
      highlighted: false,
      features: [
        "Gemini 3.8 Flash Articles & Titles",
        "Flagship Hybrid RAG (PDF Q&A)",
        "AI Image Gen & Object Removal",
        "ATS Resume Review & Feedback",
        "Public Community Feed Access",
        "Fast Generation Speed",
      ],
      isFree: false,
    },
    {
      name: "Pro Creator",
      price: "$19",
      period: "per month",
      description: "High-volume generation for builders & creators.",
      badge: "Most Popular",
      highlighted: true,
      features: [
        "Gemini 3.8 Flash Articles & Titles",
        "Flagship Hybrid RAG (PDF Q&A)",
        "AI Image Gen & Object Removal",
        "ATS Resume Review & Feedback",
        "Public Community Feed Access",
        "Priority Multimodal Compute",
      ],
      isFree: false,
    },
    {
      name: "Enterprise",
      price: "$49",
      period: "per month",
      description: "Unlimited generation quota for high-demand workflows.",
      badge: "Scale & SLA",
      highlighted: false,
      features: [
        "Gemini 3.8 Flash Articles & Titles",
        "Flagship Hybrid RAG (PDF Q&A)",
        "AI Image Gen & Object Removal",
        "ATS Resume Review & Feedback",
        "Public Community Feed Access",
        "Dedicated Speed & 24/7 SLA",
      ],
      isFree: false,
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider mb-2">
          Transparent Pricing
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-serif">
          Simple,{" "}
          <span className="italic font-serif font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
            Defensible Plans
          </span>
        </h2>
        <p className="text-slate-600 mt-2 text-xs sm:text-sm max-w-xl mx-auto">
          Start for free with daily credits. Scale up for dedicated vector indexing and priority multimodal compute.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all relative ${plan.highlighted
                ? "bg-white border-2 border-emerald-500 shadow-2xl shadow-emerald-500/15 scale-[1.03] ring-4 ring-emerald-500/10"
                : "bg-white/95 rounded-3xl border border-slate-200 shadow-md hover:shadow-xl hover:border-emerald-200 transition-all"
              }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md shadow-emerald-600/30 flex items-center gap-1 whitespace-nowrap">
                <Sparkles className="w-3 h-3" />
                {plan.badge}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                {!plan.highlighted && (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                    {plan.badge}
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                <span className="text-xs text-slate-500">/ {plan.period}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.description}</p>

              <div className="mt-6 space-y-3 pb-6 border-t border-slate-100 pt-4">
                {plan.features.map((item) => (
                  <div key={item} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {plan.isFree ? (
              <Link
                href="/studio/rag"
                className="mt-6 w-full py-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold text-center border border-emerald-200 transition-all block shadow-xs"
              >
                Get Started Free
              </Link>
            ) : isSignedIn ? (
              <button
                onClick={() => handleOpenBilling(plan.name)}
                className={`mt-6 w-full py-3.5 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer ${plan.highlighted
                    ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-slate-900 hover:bg-emerald-950 text-white border border-slate-800 hover:border-emerald-500 shadow-md hover:scale-[1.02] active:scale-[0.98]"
                  }`}
              >
                Subscribe via Clerk
                <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
              </button>
            ) : (
              <SignInButton mode="modal">
                <button
                  className={`mt-6 w-full py-3.5 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer ${plan.highlighted
                      ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-lg shadow-emerald-600/25"
                      : "bg-slate-900 hover:bg-emerald-950 text-white border border-slate-800"
                    }`}
                >
                  Sign In to Subscribe
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                </button>
              </SignInButton>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
