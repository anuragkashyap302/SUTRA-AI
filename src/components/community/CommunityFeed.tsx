"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Heart,
  Share2,
  Search,
  Sparkles,
  SquarePen,
  Hash,
  Image as ImageIcon,
  Scissors,
  FileText,
  Cpu,
  ArrowUpRight,
  Zap,
  Check,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

export interface PublicCreation {
  id: number;
  type: string;
  title: string | null;
  prompt: string;
  content: string;
  imageUrl?: string | null;
  likes?: string[] | null;
  likesCount?: number | null;
  createdAt: Date | string;
}

const TYPE_CONFIG: { [key: string]: { label: string; icon: typeof ImageIcon; color: string; studioHref: string } } = {
  image: { label: "AI Art", icon: ImageIcon, color: "text-emerald-700 bg-emerald-50 border-emerald-200", studioHref: "/studio/image" },
  "object-removal": { label: "Inpainting", icon: Scissors, color: "text-rose-700 bg-rose-50 border-rose-200", studioHref: "/studio/remove-object" },
  "remove-background": { label: "BG Removal", icon: Scissors, color: "text-amber-700 bg-amber-50 border-amber-200", studioHref: "/studio/remove-background" },
};

export function CommunityFeed({
  initialCreations = [],
  currentUserId,
}: {
  initialCreations: PublicCreation[];
  currentUserId?: string | null;
}) {
  const router = useRouter();
  const [creations, setCreations] = useState<PublicCreation[]>(() =>
    initialCreations
      .filter((item) => item.imageUrl || item.content?.startsWith("http"))
      .filter((item) => item.type !== "article" && item.type !== "blog-title" && item.type !== "document-rag" && item.type !== "resume-review")
      .map((item) => ({
        ...item,
        imageUrl: item.imageUrl || (item.content?.startsWith("http") ? item.content : null),
        likesCount: Math.max(item.likesCount || 0, item.likes?.length || 0),
      }))
  );
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [likedPosts, setLikedPosts] = useState<{ [key: number]: boolean }>(() => {
    const initialLiked: { [key: number]: boolean } = {};
    if (currentUserId) {
      initialCreations.forEach((item) => {
        if (item.likes && item.likes.includes(currentUserId)) {
          initialLiked[item.id] = true;
        }
      });
    }
    return initialLiked;
  });
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Filtered public visual feed (strictly image creations)
  const filteredFeed = creations.filter((item) => {
    if (!item.imageUrl && !item.content?.startsWith("http")) return false;
    if (item.type === "article" || item.type === "blog-title" || item.type === "document-rag" || item.type === "resume-review") {
      return false;
    }

    const matchesCategory =
      activeCategory === "all" ||
      item.type.toLowerCase().includes(activeCategory.toLowerCase());

    const matchesSearch =
      (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.prompt && item.prompt.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  // 1-Click Prompt Remixing Engine
  const handleRemix = (item: PublicCreation) => {
    const config = TYPE_CONFIG[item.type] || { studioHref: "/studio/image" };
    const queryParams = new URLSearchParams({
      remixPrompt: item.prompt,
      title: item.title || "",
      type: item.type,
    });

    toast.success(`Remixing prompt into ${config.label || "Studio"}!`);
    router.push(`${config.studioHref}?${queryParams.toString()}`);
  };

  // Optimistic Like Handler
  const handleToggleLike = async (item: PublicCreation) => {
    if (!currentUserId) {
      toast.error("Please sign in to like community creations");
      return;
    }

    const isCurrentlyLiked = likedPosts[item.id] || false;
    const previousLikesCount = item.likesCount || 0;

    // 1. Optimistic UI update
    setLikedPosts((prev) => ({ ...prev, [item.id]: !isCurrentlyLiked }));
    setCreations((prev) =>
      prev.map((c) => {
        if (c.id === item.id) {
          return {
            ...c,
            likesCount: isCurrentlyLiked ? Math.max(0, previousLikesCount - 1) : previousLikesCount + 1,
          };
        }
        return c;
      })
    );

    try {
      const res = await fetch("/api/community/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creationId: item.id }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Like failed");
      }

      // Reconcile with server response
      setLikedPosts((prev) => ({ ...prev, [item.id]: data.data.hasLiked }));
      setCreations((prev) =>
        prev.map((c) => (c.id === item.id ? { ...c, likesCount: data.data.likesCount } : c))
      );
    } catch {
      // Rollback on network error
      setLikedPosts((prev) => ({ ...prev, [item.id]: isCurrentlyLiked }));
      setCreations((prev) =>
        prev.map((c) => (c.id === item.id ? { ...c, likesCount: previousLikesCount } : c))
      );
      toast.error("Failed to update like");
    }
  };

  // Share handler
  const handleShare = (item: PublicCreation) => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    navigator.clipboard.writeText(url);
    setCopiedId(item.id);
    toast.success("Community link copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = [
    { id: "all", label: "All Visuals", icon: Sparkles, count: creations.length },
    { id: "image", label: "AI Art", icon: ImageIcon, count: creations.filter((c) => c.type === "image").length },
    { id: "object-removal", label: "Canvas Inpainting", icon: Scissors, count: creations.filter((c) => c.type === "object-removal" || c.type === "remove-background").length },
  ];

  return (
    <div className="space-y-6">
      {/* Category Pills & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills with Professional Lucide Icons */}
        <div className="overflow-x-auto flex items-center gap-2 pb-2 no-scrollbar">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${activeCategory === cat.id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/90 shadow-2xs"
                  }`}
              >
                <Icon className={`w-3.5 h-3.5 ${activeCategory === cat.id ? "text-emerald-400" : "text-slate-500"}`} />
                <span>{cat.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${activeCategory === cat.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                    }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search prompts or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs font-medium"
          />
        </div>
      </div>

      {/* Public Feed Cards Grid */}
      {filteredFeed.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center flex flex-col items-center max-w-lg mx-auto border border-slate-200/80 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-4 shadow-xs">
            <FolderOpen className="w-7 h-7" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">No Creations Found</h3>
          <p className="text-xs text-slate-500 mt-1 text-center font-medium">
            {searchQuery ? "No public posts match your search query." : "Be the first to publish an article or AI image to the community!"}
          </p>
          <Link
            href="/studio/article"
            className="mt-5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            Create in Studio
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeed.map((item) => {
            const config = TYPE_CONFIG[item.type] || {
              label: item.type,
              icon: FileText,
              color: "text-slate-700 bg-slate-100 border-slate-200",
            };
            const isLiked = likedPosts[item.id] || false;
            const effectiveImage = item.imageUrl || (item.content?.startsWith("http") ? item.content : null);
            const hasImage = Boolean(effectiveImage);

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-5 sm:p-6 flex flex-col justify-between group border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-300 relative overflow-hidden"
              >
                <div>
                  {/* Card Header: Type Badge & Date */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border shrink-0 ${config.color}`}
                    >
                      {config.label}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium font-mono">
                      {formatDate(new Date(item.createdAt))}
                    </span>
                  </div>

                  {/* Image Preview if available */}
                  {hasImage && effectiveImage && (
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-3.5 border border-slate-200 bg-slate-50 shadow-xs">
                      <Image
                        src={effectiveImage}
                        alt={item.title || "Community Creation"}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Title & Prompt */}
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {item.title || item.prompt.slice(0, 40)}
                  </h3>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 font-mono text-[11px]">
                    "{item.prompt}"
                  </p>
                </div>

                {/* Card Footer: Social Like, Share & 1-Click Remix */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* Like Button */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleLike(item)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-xl border transition-all cursor-pointer shadow-xs ${isLiked
                        ? "bg-rose-50 border-rose-200 text-rose-600"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        }`}
                      title={isLiked ? "Unlike" : "Like this creation"}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 transition-transform active:scale-125 ${isLiked ? "text-rose-500 fill-rose-500" : ""
                          }`}
                      />
                      <span>{item.likesCount || 0}</span>
                    </button>

                    <button
                      onClick={() => handleShare(item)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Share link"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* 1-Click Remix Prompt Button */}
                  <button
                    onClick={() => handleRemix(item)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1 transition-all cursor-pointer shrink-0"
                  >
                    <Zap className="w-3 h-3" />
                    1-Click Remix
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
