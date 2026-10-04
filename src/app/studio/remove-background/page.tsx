"use client";

import { useState } from "react";
import { Eraser, Upload, Download, Loader2, Image as ImageIcon, Sparkles } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function RemoveBackgroundPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResultImage(null);
    }
  };

  const handleRemoveBg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please upload an image first");
      return;
    }

    setIsProcessing(true);
    setResultImage(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const res = await fetch("/api/ai/remove-background", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to remove background");

      setResultImage(json.data.imageUrl);
      toast.success("Background removed seamlessly!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 lg:p-8 relative">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Studio Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-amber-200/80">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-500/20 text-white shrink-0">
              <Eraser className="w-6 h-6" />
            </div>
            <div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-100/90 text-amber-900 border border-amber-200/90 text-[11px] font-bold mb-1 shadow-2xs backdrop-blur-xs">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  Alpha Transparency Isolation
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-700 via-orange-600 to-rose-600 bg-clip-text text-transparent leading-snug pb-0.5">
                AI Background Removal
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed font-medium">
                Instantly erase image backgrounds with pixel-perfect precision using Cloudinary AI.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form */}
          <div className="lg:col-span-5">
            <form onSubmit={handleRemoveBg} className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-amber-100 shadow-xl space-y-5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Upload Image <span className="text-orange-600">*</span>
              </label>

              <div className="border-2 border-dashed border-amber-200 hover:border-amber-400 rounded-3xl p-6 text-center transition-colors cursor-pointer relative bg-amber-50/30 hover:bg-amber-50/60 shadow-xs">
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {previewUrl ? (
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 rounded-2xl overflow-hidden mb-2 shadow-sm border-2 border-amber-100">
                      <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                    </div>
                    <p className="text-xs text-slate-800 font-bold">{selectedFile?.name}</p>
                    <span className="text-[11px] text-orange-700 font-bold mt-1 px-3 py-1 rounded-full bg-white border border-amber-200 shadow-xs">
                      Click to replace
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-6">
                    <div className="w-14 h-14 rounded-full bg-amber-100 border-2 border-amber-200 flex items-center justify-center text-amber-600 mb-3 shadow-xs">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-900">Click or drag image here</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">PNG, JPG, WebP up to 10MB</p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isProcessing || !selectedFile}
                className="w-full py-4 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-white text-sm font-bold shadow-lg shadow-orange-500/25 hover:shadow-xl hover:scale-[1.01] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Isolating Background...
                  </>
                ) : (
                  <>
                    <Eraser className="w-4 h-4" />
                    Remove Background (2 Credits)
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Output */}
          <div className="lg:col-span-7">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-amber-100 shadow-xl min-h-[400px] flex flex-col justify-center items-center">
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                  <Loader2 className="w-10 h-10 animate-spin text-orange-600 mb-3" />
                  <p className="text-sm font-bold text-slate-900">Segmenting subject & removing background...</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Computing alpha transparency channel</p>
                </div>
              ) : resultImage ? (
                <div className="space-y-4 w-full flex flex-col items-center">
                  <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden border-2 border-amber-100 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] bg-slate-50 shadow-md">
                    <Image src={resultImage} alt="Transparent Output" fill className="object-contain p-4" />
                  </div>
                  <a
                    href={resultImage}
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-500/20 hover:scale-105"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Transparent PNG
                  </a>
                </div>
              ) : (
                <div className="text-center py-16 text-slate-400 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-400 mb-3 border-2 border-amber-100 shadow-xs">
                    <Eraser className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Transparent output will render here</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs font-medium">
                    Upload an image on the left and click remove background.
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

