import Link from "next/link";
import Image from "next/image";
import { HomePricingSection } from "@/components/home/HomePricingSection";
import { HomeTestimonialsSection } from "@/components/home/HomeTestimonialsSection";
import {
  SquarePen,
  Hash,
  Image as ImageIcon,
  Eraser,
  Scissors,
  FileText,
  Check,
  Star,
  ArrowRight,
  Play,
  FileSearch,
  Activity,
  Sparkles,
  Zap,
  ShieldCheck,
  Cpu,
  Layers,
  Flame,
} from "lucide-react";

export default function HomePage() {
  const tools = [
    {
      title: "Hybrid Document RAG",
      badge: "Flagship",
      description: "Reciprocal Rank Fusion (RRF k=60) combining pgvector dense search + BM25 sparse search with interactive yellow PDF citations.",
      icon: FileSearch,
      gradient: "from-rose-500 to-pink-500",
      shadow: "shadow-rose-500/20",
      href: "/studio/rag",
      tag: "Gemini + pgvector",
    },
    {
      title: "Claude Artifacts Article Studio",
      badge: "Popular",
      description: "Dual-pane Markdown/WYSIWYG editor with 1-click in-line AI transformations, live reading stats, and PDF export.",
      icon: SquarePen,
      gradient: "from-teal-600 to-emerald-500",
      shadow: "shadow-teal-500/20",
      href: "/studio/article",
      tag: "Gemini 3.6 Flash",
    },
    {
      title: "Canvas Inpainting Studio",
      badge: "Vision",
      description: "HTML5 brush mask canvas with normalized coordinate scaling for seamless object removal and generative replacement.",
      icon: Sparkles,
      gradient: "from-cyan-600 to-teal-500",
      shadow: "shadow-cyan-500/20",
      href: "/studio/remove-object",
      tag: "ClipDrop + Diffusion",
    },
    {
      title: "AI Image Generation",
      description: "Create high-fidelity generative visual art and diffusion graphics with Cloudinary CDN persistence.",
      icon: ImageIcon,
      gradient: "from-emerald-500 to-teal-500",
      shadow: "shadow-emerald-500/20",
      href: "/studio/image",
      tag: "Cloudinary Gen",
    },
    {
      title: "ATS Resume Reviewer",
      description: "Analyze resumes against Staff/Principal rubrics with keyword gap analysis and ATS scoring.",
      icon: FileText,
      gradient: "from-amber-500 to-orange-500",
      shadow: "shadow-orange-500/20",
      href: "/studio/review-resume",
      tag: "PDFParse + Gemini",
    },
    {
      title: "Catchy Blog Title Generator",
      description: "Generate viral, high-CTR blog titles tailored for audience resonance and search intent.",
      icon: Hash,
      gradient: "from-cyan-500 to-blue-500",
      shadow: "shadow-cyan-500/20",
      href: "/studio/blog-titles",
      tag: "Viral Hooks",
    },
  ];


  return (
    <div className="flex flex-col min-h-screen relative bg-transparent">
      {/* Hero Section */}
      <section className="pt-6 sm:pt-8 pb-14 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex flex-col items-center text-center relative z-10">
        {/* Top Floating Pill Badge with Pulse */}
        <Link
          href="/studio/rag"
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/90 border border-emerald-200/80 shadow-md text-xs font-bold text-emerald-800 hover:border-emerald-400 hover:scale-105 transition-all mb-6 group cursor-pointer backdrop-blur-sm"
        >
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Next-Generation Multimodal AI Platform</span>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.12]">
          The Multimodal AI Studio <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            for Next-Gen Creators
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl font-normal leading-relaxed">
          Create, research, and edit with production-grade AI tools. Featuring <strong className="text-emerald-800">Hybrid PDF Document RAG</strong>, <strong className="text-teal-800">Claude Artifacts Split Canvas</strong>, and <strong className="text-emerald-800">Interactive Brush Inpainting</strong>.
        </p>

        {/* Pill Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/studio/rag"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/25 hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <FileSearch className="w-4 h-4" />
            Explore Hybrid RAG Free
          </Link>

          <Link
            href="/community"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white hover:bg-emerald-50 text-emerald-800 font-bold text-sm border-2 border-emerald-200 shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-emerald-700 text-emerald-700" />
            Browse Community Gallery
          </Link>
        </div>

        {/* Social Proof Pill Bar */}
        <div className="mt-10 inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/95 border border-emerald-100 shadow-md">
          <div className="flex -space-x-2">
            {["from-emerald-500 to-teal-500", "from-teal-500 to-cyan-500", "from-rose-500 to-pink-500", "from-amber-500 to-orange-500"].map((grad, i) => (
              <div key={i} className={`w-6 h-6 rounded-full bg-gradient-to-tr ${grad} ring-2 ring-white flex items-center justify-center text-[9px] text-white font-bold`}>
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <span className="text-xs text-slate-700 font-medium">
            Trusted by <strong className="text-emerald-900 font-bold">10,000+</strong> developers & creators worldwide
          </span>
        </div>

        {/* Floating App Preview Showcase with Animated Glowing Border */}
        <div className="mt-14 w-full max-w-5xl rounded-3xl p-1.5 animated-border shadow-2xl shadow-emerald-500/10 relative">
          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-inner bg-white border border-emerald-100/60">
            <Image
              src="/hero-preview.png"
              alt="Sutra AI Platform Interface"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Quick Stats Pill Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 w-full max-w-4xl mx-auto mt-12">
          {[
            { label: "Query Latency", value: "< 50ms TTFT", icon: Zap, color: "text-amber-500" },
            { label: "Vector Search", value: "RRF (k=60)", icon: Cpu, color: "text-rose-500" },
            { label: "Citation Accuracy", value: "100% Grounded", icon: ShieldCheck, color: "text-emerald-500" },
            { label: "Free Daily Tier", value: "20 Credits", icon: Sparkles, color: "text-teal-600" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="p-3.5 rounded-full bg-white/90 backdrop-blur-sm border border-emerald-100 shadow-sm flex items-center justify-center gap-2.5 transition-all hover:shadow-md hover:scale-105"
              >
                <Icon className={`w-4 h-4 ${stat.color}`} />
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold text-slate-400 leading-tight">{stat.label}</p>
                  <p className="text-xs font-extrabold text-slate-800 leading-tight">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Multimodal Studios Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider mb-2">
            Enterprise Multimodal Studios
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-serif">
            Specialized AI Workspaces for{" "}
            <span className="italic font-serif font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
              Every Creator
            </span>
          </h2>
          <p className="text-slate-600 mt-2 text-xs sm:text-sm max-w-xl mx-auto">
            Click on any studio to explore its dedicated interface with sample data and real-time generation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.title}
                href={tool.href}
                className="bg-white/95 rounded-3xl p-6 sm:p-7 flex flex-col justify-between group border border-slate-200/80 shadow-md hover:shadow-2xl hover:border-emerald-300 hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${tool.gradient} ${tool.shadow} shadow-md flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    {tool.badge && (
                      <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
                        {tool.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {tool.title}
                  </h3>

                  <p className="mt-2 text-xs text-slate-600 leading-relaxed min-h-[44px]">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700 group-hover:text-emerald-800">
                  <span className="text-[11px] font-mono text-slate-400 font-normal">
                    {tool.tag}
                  </span>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 group-hover:bg-emerald-100 transition-colors">
                    Open Studio
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Plan Pricing Section (Connected to Clerk Billing) */}
      <HomePricingSection />

      {/* Dual Animated Infinite Scrolling Testimonials */}
      <HomeTestimonialsSection />
    </div>
  );
}

