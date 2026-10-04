"use client";

import { useState } from "react";
import { FileText, Upload, Download, Loader2, Sparkles, CheckCircle, AlertTriangle, Award } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export default function ReviewResumePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [reviewResult, setReviewResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        toast.error("Please upload a valid PDF document");
        return;
      }
      setSelectedFile(file);
      setReviewResult(null);
    }
  };

  const handleReviewResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please upload your PDF resume first");
      return;
    }

    setIsProcessing(true);
    setReviewResult(null);

    try {
      const formData = new FormData();
      formData.append("resume", selectedFile);

      const res = await fetch("/api/ai/review-resume", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to review resume");

      setReviewResult(json.data.content);
      toast.success("Resume analyzed with recruiter insights!");
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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-teal-200/80">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-600 flex items-center justify-center shadow-md shadow-teal-500/20 text-white shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-teal-100/90 text-teal-900 border border-teal-200/90 text-[11px] font-bold mb-1 shadow-2xs backdrop-blur-xs">
                  <Award className="w-3 h-3 text-teal-600" />
                  ATS Optimization Studio
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-500 bg-clip-text text-transparent leading-snug pb-0.5">
                AI Resume Reviewer & ATS Optimizer
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed font-medium">
                Get actionable feedback from a Silicon Valley recruiter AI: ATS score, strengths, and bullet-point fixes.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form */}
          <div className="lg:col-span-5">
            <form onSubmit={handleReviewResume} className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-white/90 ring-1 ring-teal-950/[0.05] shadow-xl space-y-5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Upload Resume (PDF only) <span className="text-teal-600">*</span>
              </label>

              <div className="border-2 border-dashed border-teal-200 hover:border-teal-400 rounded-3xl p-6 text-center transition-colors cursor-pointer relative bg-teal-50/30 hover:bg-teal-50/60 shadow-xs">
                <input
                  type="file"
                  accept="application/pdf"
                  required
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {selectedFile ? (
                  <div className="flex flex-col items-center py-4">
                    <div className="w-16 h-16 rounded-full bg-teal-100 border-2 border-teal-200 flex items-center justify-center text-teal-700 mb-2 shadow-sm">
                      <FileText className="w-8 h-8" />
                    </div>
                    <p className="text-sm text-slate-900 font-bold line-clamp-1">{selectedFile.name}</p>
                    <span className="text-xs text-slate-500 font-semibold mt-0.5">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <span className="text-[11px] text-teal-700 font-bold mt-2 px-3 py-1 rounded-full bg-white border border-teal-200 shadow-xs">
                      Click to choose another PDF
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-8">
                    <div className="w-14 h-14 rounded-full bg-teal-100 border-2 border-teal-200 flex items-center justify-center text-teal-600 mb-3 shadow-xs">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-900">Click or drag PDF resume here</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">PDF documents up to 5MB</p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isProcessing || !selectedFile}
                className="w-full py-4 rounded-full bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 hover:from-teal-500 hover:to-cyan-500 disabled:opacity-50 text-white text-sm font-bold shadow-lg shadow-teal-600/25 hover:shadow-xl hover:scale-[1.01] flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing Resume with ATS Engine...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Review Resume (2 Credits)
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Output */}
          <div className="lg:col-span-7">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/90 ring-1 ring-teal-950/[0.05] shadow-xl min-h-[450px] flex flex-col justify-center">
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                  <Loader2 className="w-10 h-10 animate-spin text-teal-600 mb-3" />
                  <p className="text-sm font-bold text-slate-900">Evaluating ATS score & recruiter checklist...</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">Parsing sections and quantifiable metrics</p>
                </div>
              ) : reviewResult ? (
                <div className="prose max-w-none text-slate-800 prose-headings:text-slate-900 prose-headings:font-extrabold prose-p:text-slate-700 prose-li:text-slate-700 prose-strong:text-teal-700 prose-code:bg-teal-50 prose-code:text-teal-900 prose-code:px-2 prose-code:py-0.5 prose-code:rounded-md">
                  <ReactMarkdown>{reviewResult}</ReactMarkdown>
                </div>
              ) : (
                <div className="text-center py-16 text-slate-400 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center text-teal-400 mb-3 border-2 border-teal-100 shadow-xs">
                    <Award className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Comprehensive feedback will appear here</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs font-medium">
                    Upload your PDF resume on the left to get ATS scores and line-by-line improvements.
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

