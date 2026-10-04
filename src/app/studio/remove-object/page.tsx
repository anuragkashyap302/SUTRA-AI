"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Scissors,
  Upload,
  Download,
  Loader2,
  Sparkles,
  Brush,
  RotateCcw,
  Trash2,
  Eye,
  EyeOff,
  Wand2,
  Layers,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface StrokePoint {
  x: number;
  y: number;
}

interface Stroke {
  points: StrokePoint[];
  size: number;
}

const SAMPLE_IMAGES = [
  {
    name: "Urban Portrait (Remove Background Person)",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    defaultObject: "person in background",
    replaceSuggestion: "green tree foliage",
  },
  {
    name: "Workspace Desk (Replace Coffee Mug)",
    url: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80",
    defaultObject: "coffee mug",
    replaceSuggestion: "vintage brass compass",
  },
];

export default function RemoveObjectPage() {
  const [mode, setMode] = useState<"remove" | "replace">("remove");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [objectName, setObjectName] = useState("");
  const [replacementPrompt, setReplacementPrompt] = useState("");

  // Canvas Drawing State
  const [brushSize, setBrushSize] = useState<number>(24);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<StrokePoint[]>([]);
  const [showMask, setShowMask] = useState<boolean>(true);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  // Result State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<"result" | "compare">("result");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redraw canvas whenever strokes, brushSize, or imageSrc change
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background image
    if (imageObjRef.current) {
      ctx.drawImage(imageObjRef.current, 0, 0, canvas.width, canvas.height);
    }

    // Draw strokes
    if (showMask) {
      const allStrokes = [...strokes, ...(currentStroke.length > 0 ? [{ points: currentStroke, size: brushSize }] : [])];

      for (const stroke of allStrokes) {
        if (stroke.points.length === 0) continue;

        ctx.strokeStyle = "rgba(6, 182, 212, 0.70)"; // Semi-transparent electric cyan mask
        ctx.fillStyle = "rgba(6, 182, 212, 0.70)";
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = stroke.size;

        ctx.beginPath();
        if (stroke.points.length === 1) {
          ctx.arc(stroke.points[0].x, stroke.points[0].y, stroke.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
          for (let i = 1; i < stroke.points.length; i++) {
            ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
          }
          ctx.stroke();
        }
      }
    }
  }, [strokes, currentStroke, brushSize, showMask]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Load Image onto Canvas
  const loadImageToCanvas = (src: string) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageObjRef.current = img;
      const canvas = canvasRef.current;
      if (canvas) {
        const maxWidth = 550;
        const scale = Math.min(1, maxWidth / img.naturalWidth);
        canvas.width = img.naturalWidth * scale;
        canvas.height = img.naturalHeight * scale;
        setStrokes([]);
        setCurrentStroke([]);
        redrawCanvas();
      }
    };
    img.src = src;
    setImageSrc(src);
    setResultImage(null);
    setOriginalUrl(src);
  };

  // Handle local file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      loadImageToCanvas(url);
    }
  };

  // Load sample image
  const handleLoadSample = async (sample: typeof SAMPLE_IMAGES[0]) => {
    const toastId = toast.loading(`Loading ${sample.name}...`);
    try {
      const response = await fetch(sample.url);
      const blob = await response.blob();
      const file = new File([blob], "sample_inpainting.jpg", { type: "image/jpeg" });
      setSelectedFile(file);
      setObjectName(sample.defaultObject);
      if (sample.replaceSuggestion) {
        setReplacementPrompt(sample.replaceSuggestion);
      }
      loadImageToCanvas(sample.url);
      toast.success("Sample image loaded onto canvas!", { id: toastId });
    } catch {
      toast.error("Failed to load sample image", { id: toastId });
    }
  };

  // Canvas Mouse Coordinates Helper
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Drawing Events
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!imageSrc) return;
    const coords = getCanvasCoords(e);
    if (!coords) return;

    setIsDrawing(true);
    setCurrentStroke([coords]);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    if (!coords) return;

    setCursorPos({ x: coords.x, y: coords.y });

    if (!isDrawing) return;
    setCurrentStroke((prev) => [...prev, coords]);
  };

  const stopDrawing = () => {
    if (isDrawing && currentStroke.length > 0) {
      setStrokes((prev) => [...prev, { points: currentStroke, size: brushSize }]);
      setCurrentStroke([]);
    }
    setIsDrawing(false);
  };

  // Undo last brush stroke
  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, -1));
    toast.info("Undid last brush stroke");
  };

  // Clear all mask strokes
  const handleClearMask = () => {
    setStrokes([]);
    setCurrentStroke([]);
    toast.info("Mask cleared");
  };

  // Submit Inpainting Request
  const handleInpaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please upload or choose a sample image first");
      return;
    }
    if (!objectName.trim()) {
      toast.error("Please describe the object painted under the mask");
      return;
    }
    if (mode === "replace" && !replacementPrompt.trim()) {
      toast.error("Please specify what to replace the object with");
      return;
    }

    setIsProcessing(true);
    setResultImage(null);
    const toastId = toast.loading(
      mode === "replace"
        ? `Generatively replacing "${objectName}" with "${replacementPrompt}"...`
        : `Erasing "${objectName}" and reconstructing background...`
    );

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("object", objectName.trim());
      formData.append("mode", mode);
      if (mode === "replace") {
        formData.append("replacementPrompt", replacementPrompt.trim());
      }

      const res = await fetch("/api/ai/remove-object", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Inpainting failed");
      }

      setResultImage(json.data.imageUrl);
      if (json.data.originalUrl) {
        setOriginalUrl(json.data.originalUrl);
      }
      toast.success("Inpainting complete! (2 Credits)", { id: toastId });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Processing failed";
      toast.error(msg, { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 lg:p-8 relative">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-cyan-200/80">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-tr from-cyan-500 to-sky-600 flex items-center justify-center shadow-md shadow-cyan-500/20 text-white shrink-0">
              <Brush className="w-6 h-6" />
            </div>
            <div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-cyan-100/90 text-cyan-900 border border-cyan-200/90 text-[11px] font-bold mb-1 shadow-2xs backdrop-blur-xs">
                  <Sparkles className="w-3 h-3 text-cyan-600" />
                  Interactive Canvas Inpainting Studio
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-600 bg-clip-text text-transparent leading-snug pb-0.5">
                AI Canvas Inpainting & Generative Fill
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed font-medium">
                Paint directly over unwanted objects to erase them or inpaint photorealistic generative replacements.
              </p>
            </div>
          </div>

          {/* 1-Click Sample Image Loaders */}
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
            {SAMPLE_IMAGES.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleLoadSample(sample)}
                className="px-4 py-2 rounded-full bg-white hover:bg-cyan-50 text-cyan-800 text-xs font-bold border-2 border-cyan-200/80 shadow-sm hover:shadow-md hover:scale-105 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5 text-cyan-600" />
                Sample #{idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Main Dual-Pane Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start min-h-[640px]">
          {/* LEFT PANE: Brush Canvas & Inpainting Form (6 Cols) */}
          <div className="lg:col-span-6 bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/90 ring-1 ring-cyan-950/[0.05] shadow-xl space-y-4 flex flex-col">
            {/* Mode Switcher */}
            <div className="flex items-center justify-between pb-3.5 border-b border-cyan-100">
              <div className="flex items-center gap-1 bg-cyan-50/70 p-1 rounded-full border border-cyan-200/80">
                <button
                  type="button"
                  onClick={() => setMode("remove")}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    mode === "remove"
                      ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/20"
                      : "text-slate-600 hover:text-cyan-700 hover:bg-white"
                  }`}
                >
                  <Scissors className="w-3.5 h-3.5" />
                  Object Eraser
                </button>
                <button
                  type="button"
                  onClick={() => setMode("replace")}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    mode === "replace"
                      ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/20"
                      : "text-slate-600 hover:text-cyan-700 hover:bg-white"
                  }`}
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  Generative Replace
                </button>
              </div>
              <span className="px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-[11px] text-cyan-700 font-mono font-bold">
                ⚡ 2 Credits
              </span>
            </div>

            {/* Interactive Brush Toolbar (When image is loaded) */}
            {imageSrc && (
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-cyan-50/60 border border-cyan-100">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs text-cyan-900 font-bold flex items-center gap-1">
                    <Brush className="w-3.5 h-3.5 text-cyan-600" />
                    Brush: {brushSize}px
                  </span>
                  <input
                    type="range"
                    min={8}
                    max={60}
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-24 accent-cyan-600 cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={strokes.length === 0}
                    className="p-2 rounded-full bg-white hover:bg-cyan-50 text-slate-700 hover:text-cyan-900 text-xs border border-cyan-100 disabled:opacity-40 transition-all shadow-xs cursor-pointer"
                    title="Undo Last Stroke"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleClearMask}
                    disabled={strokes.length === 0}
                    className="p-2 rounded-full bg-white hover:bg-cyan-50 text-slate-700 hover:text-cyan-900 text-xs border border-cyan-100 disabled:opacity-40 transition-all shadow-xs cursor-pointer"
                    title="Clear Mask"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMask(!showMask)}
                    className="p-2 rounded-full bg-white hover:bg-cyan-50 text-slate-700 hover:text-cyan-900 text-xs border border-cyan-100 transition-all shadow-xs cursor-pointer"
                    title={showMask ? "Hide Mask" : "Show Mask"}
                  >
                    {showMask ? <Eye className="w-3.5 h-3.5 text-cyan-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                  </button>
                </div>
              </div>
            )}

            {/* Canvas Painting Viewport / Upload Dropzone */}
            <div className="relative w-full rounded-2xl overflow-hidden border-2 border-dashed border-cyan-200/90 bg-cyan-50/20 min-h-[330px] flex items-center justify-center transition-colors">
              {imageSrc ? (
                <div className="relative cursor-crosshair max-w-full overflow-hidden flex items-center justify-center p-2">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={() => {
                      stopDrawing();
                      setCursorPos(null);
                    }}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="max-w-full rounded-2xl shadow-lg border-2 border-cyan-100 touch-none bg-white"
                  />
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:bg-cyan-50/50 transition-colors w-full h-full"
                >
                  <div className="w-14 h-14 rounded-full bg-cyan-100/80 border-2 border-cyan-200 text-cyan-600 flex items-center justify-center mb-3 shadow-xs">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">Click or drag image to open Canvas</p>
                  <p className="text-xs text-slate-400 mt-1 font-medium">PNG, JPG or WebP up to 10MB</p>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Form Directives */}
            <form onSubmit={handleInpaintSubmit} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Describe Painted Object to {mode === "remove" ? "Erase" : "Replace"}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. coffee mug, person in red jacket, microphone"
                  value={objectName}
                  onChange={(e) => setObjectName(e.target.value)}
                  className="w-full px-4 py-3 rounded-full bg-white border-2 border-cyan-100 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all font-medium shadow-xs"
                />
              </div>

              {mode === "replace" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Generative Replacement Prompt <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. luxury gold Rolex watch, vintage Polaroid camera, red sports car"
                    value={replacementPrompt}
                    onChange={(e) => setReplacementPrompt(e.target.value)}
                    className="w-full px-4 py-3 rounded-full bg-white border-2 border-cyan-100 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all font-medium shadow-xs"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing || !imageSrc || !objectName.trim()}
                className="w-full py-4 rounded-full bg-gradient-to-r from-cyan-600 via-sky-600 to-cyan-700 hover:from-cyan-500 hover:to-sky-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-lg shadow-cyan-600/25 hover:shadow-xl hover:scale-[1.01] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Synthesizing Inpainting...
                  </>
                ) : mode === "replace" ? (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Generative Replace Object (2 Credits)
                  </>
                ) : (
                  <>
                    <Scissors className="w-4 h-4" />
                    Erase Masked Object (2 Credits)
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT PANE: Inpainted Results & Comparison Canvas (6 Cols) */}
          <div className="lg:col-span-6 bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-white/90 ring-1 ring-cyan-950/[0.05] shadow-xl flex flex-col h-[640px]">
            <div className="flex items-center justify-between pb-3.5 border-b border-cyan-100">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-cyan-600" />
                <h2 className="text-sm font-bold text-slate-900">Inpainted Output & Comparison</h2>
              </div>

              {resultImage && (
                <div className="flex items-center gap-1 bg-cyan-50/70 p-1 rounded-full border border-cyan-200/80">
                  <button
                    onClick={() => setViewTab("result")}
                    className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all ${
                      viewTab === "result"
                        ? "bg-cyan-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-cyan-700"
                    }`}
                  >
                    Result
                  </button>
                  <button
                    onClick={() => setViewTab("compare")}
                    className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all ${
                      viewTab === "compare"
                        ? "bg-cyan-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-cyan-700"
                    }`}
                  >
                    Before / After
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto py-4 flex flex-col items-center justify-center">
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <Loader2 className="w-10 h-10 animate-spin text-cyan-600 mb-3" />
                  <p className="text-sm font-bold text-slate-900">Synthesizing Diffusion Inpaint...</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs font-medium">
                    Reconstructing background texture and seamlessly blending lighting...
                  </p>
                </div>
              ) : resultImage ? (
                <div className="w-full space-y-4 flex flex-col items-center">
                  {viewTab === "result" ? (
                    <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden border border-cyan-100 shadow-md bg-cyan-50/20">
                      <Image
                        src={resultImage}
                        alt="Inpainted Result"
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                      <div className="space-y-1 text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-500">Before</span>
                        <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
                          {originalUrl && (
                            <Image
                              src={originalUrl}
                              alt="Original"
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                      </div>
                      <div className="space-y-1 text-center">
                        <span className="text-[10px] uppercase font-bold text-cyan-700">After Inpaint</span>
                        <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-cyan-500 shadow-xs">
                          <Image
                            src={resultImage}
                            alt="After Inpaint"
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <a
                    href={resultImage}
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-600 via-sky-600 to-cyan-700 hover:from-cyan-500 hover:to-sky-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-cyan-600/20 hover:scale-105"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download High-Res Inpaint
                  </a>
                </div>
              ) : (
                <div className="text-center p-8 text-slate-400 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600 mb-3 border-2 border-cyan-100 shadow-xs">
                    <Scissors className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Clean Inpainted Result</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed font-medium">
                    Upload an image on the left, draw an overlay mask over any object, and click{" "}
                    <strong className="text-cyan-700">Synthesize Inpaint</strong>.
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

