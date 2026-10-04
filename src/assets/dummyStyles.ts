// Centralized studio styles and vibrant light theme palettes inspired by dummyStyles.js

export const studioPalettes = {
  // Flagship Hybrid RAG (Rose, Amber, Orange, Warm Gold)
  rag: {
    container: "min-h-screen bg-gradient-to-br from-rose-50/70 via-white to-amber-50/50 p-4 sm:p-6 lg:p-8 relative overflow-hidden",
    badge: "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/20",
    headerTitle: "bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 bg-clip-text text-transparent",
    cardBorder: "border-rose-100",
    buttonPrimary: "bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-lg shadow-rose-600/20",
    buttonSecondary: "bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 shadow-xs",
    pillInput: "p-3 rounded-full border-2 border-rose-100 bg-white placeholder:text-slate-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all",
    activePill: "bg-rose-600 text-white border-rose-600 shadow-md",
  },
  // Claude Artifacts Article Studio (Emerald & Teal - No Indigo/Violet)
  article: {
    container: "min-h-screen bg-transparent p-4 sm:p-6 lg:p-8 relative",
    badge: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20",
    headerTitle: "bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-600 bg-clip-text text-transparent",
    cardBorder: "border-emerald-100",
    buttonPrimary: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/20",
    buttonSecondary: "bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs",
    pillInput: "p-3 rounded-full border-2 border-emerald-100 bg-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all",
    activePill: "bg-emerald-600 text-white border-emerald-600 shadow-md",
  },
  // Canvas Inpainting Studio (Electric Teal & Cyan - No Purple)
  inpaint: {
    container: "min-h-screen bg-transparent p-4 sm:p-6 lg:p-8 relative",
    badge: "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-600/20",
    headerTitle: "bg-gradient-to-r from-teal-700 via-emerald-600 to-cyan-600 bg-clip-text text-transparent",
    cardBorder: "border-teal-100",
    buttonPrimary: "bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-lg shadow-teal-600/20",
    buttonSecondary: "bg-white hover:bg-teal-50 text-teal-700 border border-teal-200 shadow-xs",
    pillInput: "p-3 rounded-full border-2 border-teal-100 bg-white placeholder:text-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all",
    activePill: "bg-teal-600 text-white border-teal-600 shadow-md",
  },
  // AI Image Generation Studio (Emerald, Cyan, Teal)
  image: {
    container: "min-h-screen bg-transparent p-4 sm:p-6 lg:p-8 relative",
    badge: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20",
    headerTitle: "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent",
    cardBorder: "border-emerald-100",
    buttonPrimary: "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/20",
    buttonSecondary: "bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs",
    pillInput: "p-3 rounded-full border-2 border-emerald-100 bg-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition-all",
    activePill: "bg-emerald-600 text-white border-emerald-600 shadow-md",
  },
  // Resume ATS Reviewer (Teal, Cyan, Sky)
  resume: {
    container: "min-h-screen bg-transparent p-4 sm:p-6 lg:p-8 relative",
    badge: "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md shadow-teal-600/20",
    headerTitle: "bg-gradient-to-r from-teal-700 via-cyan-600 to-sky-600 bg-clip-text text-transparent",
    cardBorder: "border-teal-100",
    buttonPrimary: "bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white shadow-lg shadow-teal-600/20",
    buttonSecondary: "bg-white hover:bg-teal-50 text-teal-700 border border-teal-200 shadow-xs",
    pillInput: "p-3 rounded-full border-2 border-teal-100 bg-white placeholder:text-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all",
    activePill: "bg-teal-600 text-white border-teal-600 shadow-md",
  },
  // Blog Titles Generator (Coral, Rose, Amber - No Purple)
  blog: {
    container: "min-h-screen bg-transparent p-4 sm:p-6 lg:p-8 relative",
    badge: "bg-gradient-to-r from-rose-500 to-amber-600 text-white shadow-md shadow-rose-500/20",
    headerTitle: "bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 bg-clip-text text-transparent",
    cardBorder: "border-rose-100",
    buttonPrimary: "bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-lg shadow-rose-600/20",
    buttonSecondary: "bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 shadow-xs",
    pillInput: "p-3 rounded-full border-2 border-rose-100 bg-white placeholder:text-slate-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all",
    activePill: "bg-rose-600 text-white border-rose-600 shadow-md",
  },
  // Background Remover (Amber, Orange, Coral)
  bgRemover: {
    container: "min-h-screen bg-gradient-to-br from-amber-50/70 via-white to-orange-50/60 p-4 sm:p-6 lg:p-8 relative overflow-hidden",
    badge: "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20",
    headerTitle: "bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-transparent",
    cardBorder: "border-amber-100",
    buttonPrimary: "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg shadow-orange-600/20",
    buttonSecondary: "bg-white hover:bg-amber-50 text-amber-700 border border-amber-200 shadow-xs",
    pillInput: "p-3 rounded-full border-2 border-amber-100 bg-white placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all",
    activePill: "bg-amber-600 text-white border-amber-600 shadow-md",
  },
};
