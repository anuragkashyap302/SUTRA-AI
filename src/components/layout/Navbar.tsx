"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import {
  Scissors,
  LayoutDashboard,
  SquarePen,
  Image as ImageIcon,
  Users,
  Zap,
  Plus,
  FileSearch,
  Activity,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PricingModal } from "./PricingModal";

export function Navbar({ credits: initialCredits = 20 }: { credits?: number }) {
  const pathname = usePathname();
  const [credits, setCredits] = useState<number>(initialCredits);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  // Monitor scroll state for adaptive glass refraction
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Hybrid RAG", href: "/studio/rag", icon: FileSearch, color: "text-emerald-600" },
    { name: "Articles", href: "/studio/article", icon: SquarePen, color: "text-teal-600" },
    { name: "AI Images", href: "/studio/image", icon: ImageIcon, color: "text-emerald-500" },
    { name: "Inpaint", href: "/studio/remove-object", icon: Scissors, color: "text-cyan-600" },
    { name: "Community", href: "/community", icon: Users, color: "text-blue-500" },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, color: "text-amber-500" },
    { name: "Observability", href: "/observability", icon: Activity, color: "text-emerald-600" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full pt-3 sm:pt-3.5 pb-2 px-3 sm:px-6 pointer-events-none transition-all duration-300">
        <div
          className={cn(
            "pointer-events-auto max-w-7xl mx-auto rounded-full px-4 sm:px-6 h-16 flex items-center justify-between transition-all duration-300 relative",
            isScrolled
              ? "bg-white/80 backdrop-blur-2xl backdrop-saturate-150 border border-white/90 ring-1 ring-emerald-950/[0.06] shadow-[0_12px_36px_rgba(16,185,129,0.1),0_2px_6px_rgba(0,0,0,0.02)]"
              : "bg-white/70 backdrop-blur-xl backdrop-saturate-150 border border-white/80 ring-1 ring-emerald-950/[0.04] shadow-[0_8px_30px_rgb(0,0,0,0.04),0_1px_3px_rgb(16,185,129,0.06)] hover:border-emerald-200/80 hover:shadow-[0_12px_36px_rgba(16,185,129,0.1)]"
          )}
        >
          {/* Subtle top specular glass highlight */}
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent pointer-events-none" />

          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-full overflow-hidden shadow-xs ring-2 ring-emerald-200/80 group-hover:ring-emerald-400 group-hover:scale-105 transition-all duration-300">
              <Image
                src="/logo.png"
                alt="Sutra AI Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-600 bg-clip-text text-transparent flex items-center gap-1 group-hover:opacity-95 transition-opacity">
                Sutra<span className="font-extrabold text-emerald-600">AI</span>
              </span>
            </div>
          </Link>

          {/* Navigation Links for Desktop */}
          <nav className="hidden lg:flex items-center gap-1 bg-emerald-50/50 p-1 rounded-full border border-emerald-100/70 shadow-inner backdrop-blur-xs">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer select-none",
                    isActive
                      ? "bg-white text-emerald-900 shadow-sm border border-emerald-200/90 font-bold scale-[1.02]"
                      : "text-slate-600 hover:text-emerald-800 hover:bg-white/60 active:scale-95"
                  )}
                >
                  <Icon className={cn("w-3.5 h-3.5", isActive ? "text-emerald-600" : link.color)} />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Auth & Credit Action Area */}
          <div className="flex items-center gap-2">
            <SignedIn>
              {/* Clickable Live Credit Indicator Badge */}
              <button
                onClick={() => setIsPricingModalOpen(true)}
                className="group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-linear-to-r from-amber-50 to-emerald-50 hover:from-amber-100 hover:to-emerald-100 border border-amber-200/80 text-amber-900 text-xs font-bold shadow-xs transition-all hover:scale-105 cursor-pointer active:scale-95"
                title="Click to upgrade or add credits"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 group-hover:scale-110 transition-transform" />
                <span>{credits} Credits</span>
                <span className="w-4 h-4 rounded-full bg-amber-200/80 text-amber-900 flex items-center justify-center text-[10px] ml-0.5 group-hover:bg-amber-300 transition-colors">
                  <Plus className="w-3 h-3" />
                </span>
              </button>

              {/* Clerk User Avatar Menu */}
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 rounded-full border-2 border-emerald-200 hover:scale-105 transition-transform",
                  },
                }}
              />
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-3.5 py-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50/80 rounded-full transition-colors cursor-pointer">
                  Sign In
                </button>
              </SignInButton>

              <SignInButton mode="modal">
                <button className="px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/25 transition-all cursor-pointer active:scale-95">
                  Get Started
                </button>
              </SignInButton>
            </SignedOut>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="pointer-events-auto lg:hidden mt-2 max-w-7xl mx-auto bg-white/90 backdrop-blur-2xl border border-white/90 ring-1 ring-emerald-900/[0.08] rounded-3xl p-3 shadow-2xl space-y-1 animate-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-4 py-2.5 rounded-full text-xs font-semibold transition-all",
                    isActive
                      ? "bg-emerald-600 text-white font-bold shadow-sm"
                      : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-900"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={cn("w-4 h-4", isActive ? "text-white" : link.color)} />
                    <span>{link.name}</span>
                  </div>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Pricing Upgrade Modal */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        currentCredits={credits}
        onCreditsUpdated={(newCredits) => setCredits(newCredits)}
      />
    </>
  );
}
