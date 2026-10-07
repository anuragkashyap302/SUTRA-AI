import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { creations } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getOrCreateCurrentUser } from "@/lib/auth";
import {
  SquarePen,
  Hash,
  Image as ImageIcon,
  Eraser,
  Scissors,
  FileText,
  Zap,
  Sparkles,
  Flame,
  Cpu,
  ArrowUpRight,
} from "lucide-react";
import { CreationsLibrary } from "@/components/dashboard/CreationsLibrary";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // 1. Fetch user profile & credits
  const user = await getOrCreateCurrentUser();
  const credits = user?.credits ?? 20;
  const userPlan = user?.plan ?? "free";

  // 2. Fetch user's creations history directly from Drizzle
  const userCreations = await db.query.creations.findMany({
    where: eq(creations.userId, userId),
    orderBy: [desc(creations.createdAt)],
    limit: 30,
  });

  const allTools = [
    {
      title: "Document RAG Engine",
      description: "Flagship hybrid vector + BM25 search with interactive PDF citations.",
      icon: Cpu,
      gradient: "from-[#F43F5E] to-[#E11D48]",
      href: "/studio/rag",
      badge: "Flagship",
    },
    {
      title: "AI Article Studio",
      description: "Claude Artifacts-style split-pane editor with 1-click AI refactors.",
      icon: SquarePen,
      gradient: "from-[#3588F2] to-[#0BB0D7]",
      href: "/studio/article",
      badge: "Artifacts",
    },
    {
      title: "Inpainting Canvas",
      description: "HTML5 brush tool for generative object removal and replacements.",
      icon: Scissors,
      gradient: "from-[#0D9488] to-[#10B981]",
      href: "/studio/remove-object",
      badge: "Canvas",
    },
    {
      title: "Blog Title Generator",
      description: "Generate 10 catchy headline ideas for blogs & social posts.",
      icon: Hash,
      gradient: "from-[#F43F5E] to-[#FB923C]",
      href: "/studio/blog-titles",
    },
    {
      title: "AI Image Generation",
      description: "Create photorealistic visuals & artwork with Cloudinary CDN.",
      icon: ImageIcon,
      gradient: "from-[#20C363] to-[#11B97E]",
      href: "/studio/image",
    },
    {
      title: "Background Removal",
      description: "Isolate subjects and download clean transparent PNGs.",
      icon: Eraser,
      gradient: "from-[#F76C1C] to-[#F04A3C]",
      href: "/studio/remove-background",
    },
    {
      title: "Resume ATS Reviewer",
      description: "PDF parsing with ATS scoring and line-by-line bullet fixes.",
      icon: FileText,
      gradient: "from-[#12B7AC] to-[#08B6CE]",
      href: "/studio/review-resume",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-4">
      {/* Top Banner / Welcome Area */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/90 ring-1 ring-emerald-950/[0.05] shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold mb-3 shadow-xs">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            Active Plan: <span className="capitalize font-bold text-emerald-900">{userPlan}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Welcome back, <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{user?.name || "Creator"}</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
            Choose an AI tool to generate, transform, or search your enterprise documents.
          </p>
        </div>

        {/* Credit Quota Widget */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-4 relative z-10 w-full md:w-auto">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/20">
            <Zap className="w-6 h-6 text-white fill-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">
              Available Credits
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900">{credits}</span>
              <span className="text-xs text-slate-500 font-medium">Credits Balance</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Studios Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-emerald-600" />
            Multimodal AI Creation Studios
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {allTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.title}
                href={tool.href}
                className="bg-white rounded-2xl p-5 group flex flex-col justify-between border border-slate-200/80 shadow-sm hover:shadow-md hover:border-teal-300 transition-all duration-300 cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${tool.gradient} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    {tool.badge && (
                      <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-mono font-bold shadow-xs">
                        {tool.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 group-hover:text-teal-600 transition-colors flex items-center justify-between text-sm">
                    {tool.title}
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-teal-600" />
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-medium">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-slate-100 text-xs font-bold text-teal-600 flex items-center gap-1">
                  Launch Studio &rarr;
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Interactive Filterable Creations Library */}
      <CreationsLibrary initialCreations={userCreations} />
    </div>
  );
}
