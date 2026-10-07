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

  // Thematic Soft Gradient & Dynamic Multi-Studio Ambient Glows
  // Default (Home / Global): Harmonious multi-studio cool fusion (Emerald RAG + Sapphire Article + Ice Cyan Inpaint + Seafoam Resume)
  let bgGradient = "from-[#f4fbf8] via-[#eef8fb] to-[#e8f3f8]";
  let glowTop = "bg-gradient-to-r from-emerald-400/20 via-teal-300/18 to-cyan-400/16";
  let glowRight = "bg-gradient-to-br from-cyan-300/18 via-sky-300/16 to-blue-300/14";
  let glowLeft = "bg-gradient-to-tr from-teal-300/16 via-emerald-300/14 to-cyan-200/14";
  let glowBottom = "bg-gradient-to-r from-emerald-200/14 via-teal-200/16 to-sky-200/14";
  let sparkleColor = "text-teal-500/40";

  if (pathname.startsWith("/studio/rag")) {
    // RAG Studio: Pure Fresh Emerald & Soft Mint Breeze (Matches navbar and page seamlessly)
    bgGradient = "from-[#f3faf6] via-[#ebf7f0] to-[#e1f3e7]";
    glowTop = "bg-emerald-300/16";
    glowRight = "bg-teal-200/14";
    glowLeft = "bg-emerald-200/12";
    glowBottom = "bg-teal-200/12";
    sparkleColor = "text-emerald-500/40";
  } else if (pathname.startsWith("/studio/image")) {
    // AI Image Studio: Pure Fresh Emerald & Soft Mint Green
    bgGradient = "from-[#f3faf6] via-[#ebf7f0] to-[#e1f3e7]";
    glowTop = "bg-emerald-300/16";
    glowRight = "bg-teal-200/14";
    glowLeft = "bg-emerald-200/12";
    glowBottom = "bg-teal-200/12";
    sparkleColor = "text-emerald-500/40";
  } else if (pathname.startsWith("/studio/remove-object")) {
    // Canvas Inpainting Studio: Electric Ice Cyan & Soft Sky
    bgGradient = "from-[#f5faff] via-[#ecf5fc] to-[#e2f0f9]";
    glowTop = "bg-cyan-300/16";
    glowRight = "bg-sky-300/14";
    glowLeft = "bg-cyan-200/12";
    glowBottom = "bg-sky-200/12";
    sparkleColor = "text-cyan-500/40";
  } else if (pathname.startsWith("/studio/remove-background")) {
    // Background Removal Studio: Warm Amber & Citrus Sunlit
    bgGradient = "from-[#fefaf5] via-[#fbf3eb] to-[#f6ebe0]";
    glowTop = "bg-amber-300/14";
    glowRight = "bg-orange-200/12";
    glowLeft = "bg-amber-200/10";
    glowBottom = "bg-orange-200/10";
    sparkleColor = "text-amber-500/40";
  } else if (pathname.startsWith("/studio/blog-titles")) {
    // Catchy Blog Title Studio: Warm Peach & Blush Cream
    bgGradient = "from-[#fdf8f6] via-[#faf1ef] to-[#f5e8e4]";
    glowTop = "bg-rose-300/14";
    glowRight = "bg-amber-200/12";
    glowLeft = "bg-rose-200/10";
    glowBottom = "bg-amber-200/10";
    sparkleColor = "text-rose-400/40";
  } else if (pathname.startsWith("/studio/article")) {
    // Article Studio: Editorial Sapphire & Calm Mist Blue
    bgGradient = "from-[#f5f8fd] via-[#edf3fb] to-[#e3edfa]";
    glowTop = "bg-blue-300/16";
    glowRight = "bg-sky-300/14";
    glowLeft = "bg-blue-200/12";
    glowBottom = "bg-sky-200/12";
    sparkleColor = "text-blue-500/40";
  } else if (pathname.startsWith("/studio/review-resume")) {
    // ATS Resume Studio: Professional Seafoam & Soft Mint
    bgGradient = "from-[#f3fbf9] via-[#eaf6f2] to-[#e0f2eb]";
    glowTop = "bg-teal-300/16";
    glowRight = "bg-emerald-200/14";
    glowLeft = "bg-teal-200/12";
    glowBottom = "bg-emerald-200/12";
    sparkleColor = "text-teal-500/40";
  }

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-gradient-to-br ${bgGradient} transition-colors duration-1000`}
    >
      {/* Glow 1: Top-Center Floating Ambient Halo (Behind Floating Navbar & Hero Headline) */}
      <div
        className={`absolute -top-40 left-1/2 -translate-x-1/2 w-[880px] h-[480px] rounded-full ${glowTop} blur-[160px] animate-ambient-pulse transition-colors duration-1000`}
      />

      {/* Glow 2: Balanced Upper-Right Subtle Ambient Drift */}
      <div
        className={`absolute top-[18%] right-[4%] w-[520px] h-[520px] rounded-full ${glowRight} blur-[170px] animate-ambient-drift-2 transition-colors duration-1000`}
      />

      {/* Glow 3: Balanced Mid-Lower Floating Drift */}
      <div
        className={`absolute top-[55%] left-[8%] w-[480px] h-[480px] rounded-full ${glowLeft} blur-[170px] animate-ambient-drift-1 transition-colors duration-1000 opacity-70`}
      />

      {/* Glow 4: Bottom Ambient Grounding Light */}
      <div
        className={`absolute -bottom-36 left-1/2 -translate-x-1/2 w-[880px] h-[480px] rounded-full ${glowBottom} blur-[160px] animate-ambient-pulse transition-colors duration-1000`}
      />

      {/* Subtle Bottom Margin Sparkles */}
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
