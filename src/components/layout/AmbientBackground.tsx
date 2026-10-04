"use client";

import React from "react";
import { usePathname } from "next/navigation";

/**
 * AmbientBackground Component (LinkedIn-Inspired Subtle Warm Gradient + Delicate Ambient Liveness)
 * 
 * Features:
 * - Ultra-smooth, soothing base gradient tailored for each studio (like LinkedIn's warm champagne & soft ivory).
 * - Symmetrical, ultra-diffused ambient light (blur-[180px], 8%-14% opacity) - NO heavy left-side blobs!
 * - Delicate floating sparkles (like the gold 4-point stars in the LinkedIn reference screenshot).
 * - Minute-to-minute gentle breathing drift that gives life without visual clutter or distraction.
 * - STRICT POLICY: Zero purple / zero indigo anywhere.
 */
export function AmbientBackground() {
  const pathname = usePathname() || "";

  // Thematic Soft Gradient & Delicate Ambient Glow
  // Defaults to Home (LinkedIn Live Background - Warm Champagne, Soft Ivory & Subtle Golden Aura)
  let bgGradient = "from-[#fefdfa] via-[#faf5eb] to-[#f4ebe0]";
  let glowColor1 = "bg-amber-300/15";
  let glowColor2 = "bg-orange-200/12";
  let sparkleColor = "text-amber-500/35";

  if (pathname.startsWith("/studio/rag")) {
    // RAG Studio: Warm Champagne, Soft Ivory & Sunlit Amber (Matches LinkedIn Reference - Eye Soothing)
    bgGradient = "from-[#fefdfa] via-[#faf5eb] to-[#f4ebe0]";
    glowColor1 = "bg-amber-300/12";
    glowColor2 = "bg-orange-200/10";
    sparkleColor = "text-amber-500/40";
  } else if (pathname.startsWith("/studio/image")) {
    // AI Image Studio: Pure Fresh Emerald & Soft Mint Green
    bgGradient = "from-[#f3faf6] via-[#ebf7f0] to-[#e1f3e7]";
    glowColor1 = "bg-emerald-300/12";
    glowColor2 = "bg-teal-200/10";
    sparkleColor = "text-emerald-500/40";
  } else if (pathname.startsWith("/studio/remove-object")) {
    // Canvas Inpainting Studio: Electric Ice Cyan & Soft Sky (Distinct Creative Studio)
    bgGradient = "from-[#f5faff] via-[#ecf5fc] to-[#e2f0f9]";
    glowColor1 = "bg-cyan-300/12";
    glowColor2 = "bg-sky-300/10";
    sparkleColor = "text-cyan-500/40";
  } else if (pathname.startsWith("/studio/remove-background")) {
    // Background Removal Studio: Warm Amber & Citrus Sunlit
    bgGradient = "from-[#fefaf5] via-[#fbf3eb] to-[#f6ebe0]";
    glowColor1 = "bg-amber-300/12";
    glowColor2 = "bg-orange-200/10";
    sparkleColor = "text-amber-500/40";
  } else if (pathname.startsWith("/studio/blog-titles")) {
    // Catchy Blog Title Studio: Warm Peach & Blush Cream (Single Clean Tone - No Multi-Color Clash)
    bgGradient = "from-[#fdf8f6] via-[#faf1ef] to-[#f5e8e4]";
    glowColor1 = "bg-rose-300/12";
    glowColor2 = "bg-amber-200/10";
    sparkleColor = "text-rose-400/40";
  } else if (pathname.startsWith("/studio/article")) {
    // Article Studio: Editorial Sapphire & Calm Mist Blue (Easy on the eyes, authoritative)
    bgGradient = "from-[#f5f8fd] via-[#edf3fb] to-[#e3edfa]";
    glowColor1 = "bg-blue-300/12";
    glowColor2 = "bg-sky-300/10";
    sparkleColor = "text-blue-500/40";
  } else if (pathname.startsWith("/studio/review-resume")) {
    // ATS Resume Studio: Professional Seafoam & Soft Mint
    bgGradient = "from-[#f3fbf9] via-[#eaf6f2] to-[#e0f2eb]";
    glowColor1 = "bg-teal-300/12";
    glowColor2 = "bg-emerald-200/10";
    sparkleColor = "text-teal-500/40";
  }

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-gradient-to-br ${bgGradient} transition-colors duration-1000`}
    >
      {/* Glow 1: Top-Center Floating Ambient Halo (Behind Floating Navbar & Page Header) */}
      <div
        className={`absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[450px] rounded-full ${glowColor1} blur-[170px] animate-ambient-pulse transition-colors duration-1000`}
      />

      {/* Glow 2: Balanced Upper-Right Subtle Ambient Drift */}
      <div
        className={`absolute top-[20%] right-[5%] w-[480px] h-[480px] rounded-full ${glowColor2} blur-[180px] animate-ambient-drift-2 transition-colors duration-1000`}
      />

      {/* Glow 3: Balanced Mid-Lower Centered Ambient Drift (NO harsh left blob!) */}
      <div
        className={`absolute top-[60%] left-[10%] w-[420px] h-[420px] rounded-full ${glowColor1} blur-[180px] animate-ambient-drift-1 transition-colors duration-1000 opacity-60`}
      />

      {/* Glow 4: Bottom Ambient Grounding Light */}
      <div
        className={`absolute -bottom-36 left-1/2 -translate-x-1/2 w-[850px] h-[450px] rounded-full ${glowColor2} blur-[170px] animate-ambient-pulse transition-colors duration-1000`}
      />

      {/* Subtle Bottom Margin Sparkles Only (Completely removed from upper viewport so they never overlap buttons) */}
      <svg
        className={`absolute top-[75%] right-[6%] w-3.5 h-3.5 ${sparkleColor} animate-pulse pointer-events-none hidden lg:block`}
        style={{ animationDelay: "2s", animationDuration: "4s" }}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
      </svg>
      <svg
        className={`absolute top-[82%] left-[6%] w-3.5 h-3.5 ${sparkleColor} animate-pulse pointer-events-none hidden lg:block`}
        style={{ animationDelay: "3s", animationDuration: "3.5s" }}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
      </svg>
    </div>
  );
}
