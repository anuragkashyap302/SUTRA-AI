"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, Sparkles, Download, Loader2, Wand2, Eye } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function ImageGenerationPage() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Realistic");
  const [publish, setPublish] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // Hydrate remixed prompt from URL query params
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const remixPrompt = params.get("remixPrompt");
      if (remixPrompt) {
        setPrompt(remixPrompt);
        toast.success("✨ Remixed prompt loaded from Community!");
      }
    }
  }, []);

  const styles = [
    { name: "Realistic", label: "Photorealistic" },
    { name: "Anime", label: "Anime Style" },
    { name: "3D Render", label: "3D Render" },
    { name: "Cyberpunk", label: "Cyberpunk" },
    { name: "Cinematic", label: "Cinematic" },
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error("Please enter an image prompt");
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const res = await fetch("/api/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style, publish }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to generate image");

      setGeneratedImage(json.data.imageUrl);
      toast.success("Image generated & uploaded to Cloudinary!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Image generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 lg:p-8 relative">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Studio Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-emerald-200/80">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white shrink-0">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-emerald-100/90 text-emerald-900 border border-emerald-200/90 text-[11px] font-bold mb-1 shadow-2xs backdrop-blur-xs">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Generative Diffusion Studio
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 bg-clip-text text-transparent leading-snug pb-0.5">
                AI Image Generation
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed font-medium">
                Generate photorealistic visuals, 3D art, and anime imagery powered by ClipDrop & Cloudinary.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form */}
          <div className="lg:col-span-5">
            <form onSubmit={handleGenerate} className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-white/90 ring-1 ring-emerald-950/[0.05] shadow-xl space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Prompt Description <span className="text-emerald-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. A serene Japanese garden with cherry blossoms, soft sunset light, reflections on pond..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-emerald-100 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all resize-none font-medium shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Art Style Preset
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {styles.map((s) => (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => setStyle(s.name)}
                      className={`py-2.5 px-3 rounded-full text-xs font-bold border-2 transition-all cursor-pointer ${
                        style === s.name
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-md scale-105"
                          : "bg-white border-emerald-100 text-slate-600 hover:text-emerald-800 hover:bg-emerald-50/50"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="publish"
                  checked={publish}
                  onChange={(e) => setPublish(e.target.checked)}
                  className="w-4 h-4 rounded-full border-emerald-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                />
                <label htmlFor="publish" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Publish to Community Creations Hub
                </label>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-4 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-sm font-bold shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:scale-[1.01] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating High-Res Visual...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4" />
                    Generate Image (2 Credits)
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Preview */}
          <div className="lg:col-span-7">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/90 ring-1 ring-emerald-950/[0.05] shadow-xl min-h-[450px] flex flex-col justify-center items-center">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                  <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-3" />
                  <p className="text-sm font-bold text-slate-900">Rendering visual with ClipDrop Diffusion...</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Uploading to Cloudinary CDN</p>
                </div>
              ) : generatedImage ? (
                <div className="space-y-4 w-full flex flex-col items-center">
                  <div className="relative w-full max-w-lg aspect-square rounded-2xl overflow-hidden border-2 border-emerald-100 shadow-lg bg-emerald-50/20">
                    <Image
                      src={generatedImage}
                      alt="AI Generated"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href={generatedImage}
                      target="_blank"
                      rel="noreferrer"
                      className="px-6 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20 hover:scale-105"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download High-Res
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-slate-400 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-400 mb-3 border-2 border-emerald-100 shadow-xs">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Your generated artwork will render here</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs font-medium">
                    Choose a style, write your prompt, and click generate.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

