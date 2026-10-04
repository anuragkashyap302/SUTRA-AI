"use client";

import { useState } from "react";
import {
  Clock,
  Search,
  Filter,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  FileText,
  FileCheck2,
  SquarePen,
  Hash,
  Image as ImageIcon,
  Scissors,
  Eraser,
  Cpu,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

export interface CreationItem {
  id: number;
  type: string;
  title: string | null;
  prompt: string;
  content: string;
  imageUrl?: string | null;
  createdAt: Date | string;
}

const TYPE_CONFIG: { [key: string]: { label: string; icon: typeof FileText; color: string } } = {
  article: { label: "Article", icon: SquarePen, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  "blog-title": { label: "Blog Titles", icon: Hash, color: "text-rose-700 bg-rose-50 border-rose-200" },
  image: { label: "AI Image", icon: ImageIcon, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  "remove-background": { label: "BG Removal", icon: Eraser, color: "text-orange-700 bg-orange-50 border-orange-200" },
  "object-removal": { label: "Inpaint Object", icon: Scissors, color: "text-rose-700 bg-rose-50 border-rose-200" },
  "resume-review": { label: "Resume ATS", icon: FileCheck2, color: "text-teal-700 bg-teal-50 border-teal-200" },
  "document-rag": { label: "Hybrid RAG Doc", icon: Cpu, color: "text-pink-700 bg-pink-50 border-pink-200" },
};

export function CreationsLibrary({ initialCreations = [] }: { initialCreations: CreationItem[] }) {
  const [creationsList, setCreationsList] = useState<CreationItem[]>(initialCreations);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Filtered Creations
  const filteredCreations = creationsList.filter((item) => {
    const matchesFilter =
      activeFilter === "all" ||
      item.type.toLowerCase().includes(activeFilter.toLowerCase());

    const matchesSearch =
      (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.prompt && item.prompt.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const handleDeleteCreation = async (id: number) => {
    try {
      const res = await fetch(`/api/user/creations?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Delete failed");

      setCreationsList((prev) => prev.filter((c) => c.id !== id));
      toast.success("Creation removed from library");
    } catch {
      toast.error("Failed to delete creation");
    }
  };

  const handleCopyContent = (item: CreationItem) => {
    navigator.clipboard.writeText(item.content || item.prompt);
    setCopiedId(item.id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = [
    { id: "all", label: "All Items", count: creationsList.length },
    { id: "article", label: "✍️ Articles", count: creationsList.filter((c) => c.type === "article").length },
    { id: "document-rag", label: "🧠 Hybrid RAG", count: creationsList.filter((c) => c.type === "document-rag").length },
    { id: "image", label: "🎨 AI Images", count: creationsList.filter((c) => c.type === "image").length },
    { id: "object-removal", label: "✂️ Inpainting", count: creationsList.filter((c) => c.type === "object-removal").length },
    { id: "resume-review", label: "📄 Resume ATS", count: creationsList.filter((c) => c.type === "resume-review").length },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/90 ring-1 ring-emerald-950/[0.05] shadow-xl space-y-6">
      {/* Top Header & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center shadow-xs">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your Creation Library</h2>
            <p className="text-xs text-slate-500 font-medium">
              {creationsList.length} items persisted in Neon PostgreSQL
            </p>
          </div>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search creations or prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="overflow-x-auto flex items-center gap-2 pb-2 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveFilter(cat.id)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeFilter === cat.id
                ? "bg-teal-600 text-white shadow-xs"
                : "bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span>{cat.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeFilter === cat.id ? "bg-white/25 text-white" : "bg-slate-200/70 text-slate-600"
              }`}
            >
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Creations List Table / Stream */}
      {filteredCreations.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-3 shadow-xs">
            <FolderOpen className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No creations match your query</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm font-medium">
            {searchQuery ? "Try a different search keyword or filter." : "Launch one of the AI studios to create your first asset!"}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {filteredCreations.map((item) => {
            const config = TYPE_CONFIG[item.type] || {
              label: item.type,
              icon: FileText,
              color: "text-slate-700 bg-slate-100 border-slate-200",
            };
            const Icon = config.icon;

            return (
              <div
                key={item.id}
                className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/80 px-3 rounded-2xl transition-colors group"
              >
                {/* Left side details */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 shadow-xs ${config.color}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {item.title || "Untitled Creation"}
                      </h4>
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border shrink-0 ${config.color}`}
                      >
                        {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
                      {item.prompt}
                    </p>
                  </div>
                </div>

                {/* Right side actions */}
                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                  <span className="text-xs text-slate-400 font-medium font-mono">
                    {formatDate(new Date(item.createdAt))}
                  </span>

                  <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopyContent(item)}
                      className="p-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shadow-xs"
                      title="Copy content"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => handleDeleteCreation(item.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete creation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
