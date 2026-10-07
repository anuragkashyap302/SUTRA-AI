import Link from "next/link";
import Image from "next/image";
import { Sparkles, Github, ShieldCheck, Cpu, ArrowUpRight, Heart, Layers } from "lucide-react";

/**
 * Sutra AI Global Footer - Executive Multimodal SaaS Standard
 */
export function Footer() {
  return (
    <footer className="w-full border-t border-emerald-100/90 bg-white/75 backdrop-blur-xl mt-auto relative overflow-hidden text-slate-700 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
      {/* Subtle Ambient Accent Line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-10 border-b border-emerald-100/80">
          {/* Col 1: Brand & Enterprise Readiness (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="flex items-center gap-3 group inline-flex">
              <div className="relative w-10 h-10 rounded-2xl overflow-hidden shadow-sm ring-2 ring-emerald-200 group-hover:scale-105 transition-transform">
                <Image src="/logo.png" alt="Sutra AI" fill className="object-cover" />
              </div>
              <div>
                <span className="text-base font-black bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                  Sutra AI
                </span>
                <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  Multimodal Suite
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-500 leading-relaxed font-medium max-w-sm">
              Next-generation enterprise AI platform powering citation-grounded RAG, canvas inpainting, high-definition diffusion, and long-form editorial intelligence.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/90 text-[11px] font-bold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Systems Operational (99.9%)
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200 text-[11px] font-medium shadow-2xs">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Zero-Retention AI
              </span>
            </div>
          </div>

          {/* Col 2: Generative Studios (3 Cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              AI Studios
            </h3>
            <ul className="space-y-2 text-xs font-medium text-slate-600">
              <li>
                <Link
                  href="/studio/rag"
                  className="hover:text-amber-700 transition-colors flex items-center justify-between group"
                >
                  <span>Hybrid RAG Engine</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-mono opacity-0 group-hover:opacity-100 transition-opacity">pgvector</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/studio/remove-object"
                  className="hover:text-cyan-700 transition-colors flex items-center justify-between group"
                >
                  <span>Canvas Inpainting</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 font-mono opacity-0 group-hover:opacity-100 transition-opacity">Brush</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/studio/article"
                  className="hover:text-blue-700 transition-colors flex items-center justify-between group"
                >
                  <span>Article Artifacts Studio</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono opacity-0 group-hover:opacity-100 transition-opacity">Gemini</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/studio/image"
                  className="hover:text-emerald-700 transition-colors flex items-center justify-between group"
                >
                  <span>Diffusion Art & Imagery</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono opacity-0 group-hover:opacity-100 transition-opacity">ClipDrop</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/studio/review-resume"
                  className="hover:text-teal-700 transition-colors flex items-center justify-between group"
                >
                  <span>ATS Resume Reviewer</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-mono opacity-0 group-hover:opacity-100 transition-opacity">AI HR</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/studio/blog-titles"
                  className="hover:text-rose-700 transition-colors flex items-center justify-between group"
                >
                  <span>Blog Title Generator</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-mono opacity-0 group-hover:opacity-100 transition-opacity">Viral CTR</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Platform & Community (3 Cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-teal-600" />
              Platform & Architecture
            </h3>
            <ul className="space-y-2 text-xs font-medium text-slate-600">
              <li>
                <Link href="/community" className="hover:text-emerald-700 transition-colors flex items-center gap-1">
                  Community Creations Hub
                </Link>
              </li>
              <li>
                <Link href="/observability" className="hover:text-emerald-700 transition-colors flex items-center gap-1">
                  Telemetry & Trace Drawer
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-emerald-700 transition-colors flex items-center gap-1">
                  Creator Dashboard
                </Link>
              </li>
              <li>
                <span className="text-slate-400 text-xs flex items-center gap-1">
                  Reciprocal Rank Fusion (k=60)
                </span>
              </li>
              <li>
                <span className="text-slate-400 text-xs flex items-center gap-1">
                  PostgreSQL 16 Dense Embeddings
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Open Source & Codebase (2 Cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Github className="w-3.5 h-3.5 text-slate-800" />
              Developer
            </h3>
            <div className="space-y-2.5">
              <a
                href="https://github.com/anuragkashyap302/QuickAI"
                target="_blank"
                rel="noreferrer"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-between transition-all shadow-sm hover:scale-[1.02] cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5" />
                  GitHub Repo
                </span>
                <ArrowUpRight className="w-3 h-3 text-slate-400" />
              </a>

              <p className="text-[11px] text-slate-400 font-medium">
                Built with Next.js 15 App Router, TypeScript, Tailwind CSS, Drizzle ORM & Gemini 3.8 Flash.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Sutra AI. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <span>Designed for enterprise speed, precision, and privacy.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
