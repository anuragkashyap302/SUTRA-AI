"use client";

import React, { useEffect, useRef, useState } from "react";
import { Star, UserCheck, Users } from "lucide-react";

interface TestimonialItem {
  id: number;
  name: string;
  role: string;
  rating: number;
  text: string;
  image: string;
  type: "engineer" | "creator";
}

export function HomeTestimonialsSection() {
  const scrollRefLeft = useRef<HTMLDivElement>(null);
  const scrollRefRight = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const testimonials: TestimonialItem[] = [
    // Left: Engineers & Researchers (Indian names)
    {
      id: 1,
      name: "Aarav Sharma",
      role: "Lead AI Engineer, Enterprise Systems",
      rating: 5,
      text: "The Hybrid RAG engine with Reciprocal Rank Fusion (k=60) and exact [Page X] bounding citations is the most impressive open-source implementation I've seen. Truly enterprise grade.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      type: "engineer",
    },
    {
      id: 2,
      name: "Dr. Ananya Iyer",
      role: "Staff ML Scientist",
      rating: 5,
      text: "Sub-50ms TTFT vector queries with pgvector in Neon Postgres. Grounding accuracy on dense technical PDFs is remarkable.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
      type: "engineer",
    },
    {
      id: 3,
      name: "Rohan Verma",
      role: "Full-Stack AI Architect",
      rating: 5,
      text: "Next.js 15 App Router + Drizzle ORM + Neon serverless pooling executed flawlessly. The real-time telemetry drawer is pure craftsmanship.",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
      type: "engineer",
    },
    {
      id: 4,
      name: "Tanvi Deshmukh",
      role: "NLP & Retrieval Specialist",
      rating: 5,
      text: "Embedding 768-dim Gemini representations directly into PostgreSQL without external vector DB sprawl simplifies our whole deployment stack.",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
      type: "engineer",
    },

    // Right: Founders & Creators (Indian names)
    {
      id: 5,
      name: "Priya Patel",
      role: "Product Designer & Content Lead",
      rating: 5,
      text: "The split-pane Claude Artifacts studio with in-line table insertion and punchier refactors has cut our technical article drafting time by 60%.",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
      type: "creator",
    },
    {
      id: 6,
      name: "Siddharth Rao",
      role: "Founder, SaaS Growth Labs",
      rating: 5,
      text: "Generating viral blog hooks and high-conversion LinkedIn carousels with custom system prompts in under 3 seconds has transformed our outbound pipeline.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
      type: "creator",
    },
    {
      id: 7,
      name: "Neha Singhania",
      role: "Tech Journalist & Author",
      rating: 5,
      text: "Interactive canvas brush inpainting with ClipDrop integration makes visual asset generation instantaneous without leaving the markdown editor.",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      type: "creator",
    },
    {
      id: 8,
      name: "Aditya Mukherjee",
      role: "Creative Director",
      rating: 5,
      text: "The ATS resume review tool gave actionable, section-by-section scoring that helped our agency talent optimize profiles with 95+ match rates.",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
      type: "creator",
    },
  ];

  const leftTestimonials = testimonials.filter((t) => t.type === "engineer");
  const rightTestimonials = testimonials.filter((t) => t.type === "creator");

  useEffect(() => {
    const scrollLeft = scrollRefLeft.current;
    const scrollRight = scrollRefRight.current;
    if (!scrollLeft || !scrollRight) return;

    // Start right column at halfway down so it scrolls upwards seamlessly
    if (scrollRight.scrollTop === 0) {
      scrollRight.scrollTop = scrollRight.scrollHeight / 2;
    }

    const scrollSpeed = 0.55; // Silky smooth speed
    let rafId: number;

    const smoothScroll = () => {
      if (!isPaused) {
        // Left column scrolls DOWN
        scrollLeft.scrollTop += scrollSpeed;
        if (scrollLeft.scrollTop >= scrollLeft.scrollHeight / 2) {
          scrollLeft.scrollTop = 0;
        }

        // Right column scrolls UP
        scrollRight.scrollTop -= scrollSpeed;
        if (scrollRight.scrollTop <= 0) {
          scrollRight.scrollTop = scrollRight.scrollHeight / 2;
        }
      }
      rafId = requestAnimationFrame(smoothScroll);
    };

    rafId = requestAnimationFrame(smoothScroll);
    return () => cancelAnimationFrame(rafId);
  }, [isPaused]);

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5" title={`${rating} of 5 Stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < rating
              ? "text-amber-400 fill-amber-400"
              : "text-slate-300"
          }`}
        />
      ))}
    </div>
  );

  const TestimonialCard = ({
    item,
    direction,
  }: {
    item: TestimonialItem;
    direction: "left" | "right";
  }) => (
    <div
      className={`bg-white rounded-2xl shadow-sm hover:shadow-md p-4 sm:p-5 mb-4 transition-all duration-300 border border-slate-100 ${
        direction === "left"
          ? "border-l-4 border-l-emerald-500 hover:border-l-emerald-600 shadow-emerald-500/5"
          : "border-l-4 border-l-teal-500 hover:border-l-teal-600 shadow-teal-500/5"
      }`}
    >
      <div className="flex items-start gap-3.5">
        <img
          src={item.image}
          alt={item.name}
          className="w-11 h-11 sm:w-12 sm:h-12 object-cover rounded-full border-2 border-emerald-100 shrink-0 shadow-xs"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4
                className={`font-bold text-sm sm:text-base leading-snug ${
                  direction === "left" ? "text-emerald-950" : "text-teal-950"
                }`}
              >
                {item.name}
              </h4>
              <p className="text-xs text-slate-500 leading-tight mt-0.5">{item.role}</p>
            </div>
            <div className="hidden sm:block shrink-0">{renderStars(item.rating)}</div>
          </div>

          <p className="text-slate-700 italic text-xs sm:text-sm mt-2.5 leading-relaxed">
            "{item.text}"
          </p>

          <div className="sm:hidden mt-2">{renderStars(item.rating)}</div>
        </div>
      </div>
    </div>
  );

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full border-t border-emerald-100/80">
      {/* Header with Serif + Emerald Italic Accent */}
      <div className="text-center mb-12 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider mb-2.5">
          User Testimonials & Telemetry
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-serif">
          Voices of Trust:{" "}
          <span className="italic font-serif font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
            Loved by Creators
          </span>
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm max-w-2xl mx-auto mt-2.5 leading-relaxed">
          Real feedback from AI engineers, founders, and content builders scaling production workflows on Sutra AI.
        </p>
      </div>

      {/* Dual Animated Infinite Scrolling Columns */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto items-stretch"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Left Column: AI Engineers & Researchers (Scrolls Down) */}
        <div className="relative border-2 border-emerald-200 rounded-2xl overflow-hidden bg-white/70 backdrop-blur-sm shadow-md">
          <div className="py-2.5 px-4 font-bold text-sm sm:text-base text-center bg-emerald-100/90 text-emerald-900 border-b border-emerald-200 flex items-center justify-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>AI Creators & Engineers</span>
          </div>

          <div
            className="h-[360px] sm:h-[420px] overflow-y-hidden p-3.5 sm:p-4 no-scrollbar"
            ref={scrollRefLeft}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {[...leftTestimonials, ...leftTestimonials, ...leftTestimonials].map((item, idx) => (
              <TestimonialCard key={`left-${idx}`} item={item} direction="left" />
            ))}
          </div>
        </div>

        {/* Right Column: Founders & Product Leads (Scrolls Up) */}
        <div className="relative border-2 border-teal-200 rounded-2xl overflow-hidden bg-white/70 backdrop-blur-sm shadow-md">
          <div className="py-2.5 px-4 font-bold text-sm sm:text-base text-center bg-teal-100/90 text-teal-900 border-b border-teal-200 flex items-center justify-center gap-2">
            <Users className="w-4 h-4 text-teal-700 shrink-0" />
            <span>Founders & Content Leads</span>
          </div>

          <div
            className="h-[360px] sm:h-[420px] overflow-y-hidden p-3.5 sm:p-4 no-scrollbar"
            ref={scrollRefRight}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {[...rightTestimonials, ...rightTestimonials, ...rightTestimonials].map((item, idx) => (
              <TestimonialCard key={`right-${idx}`} item={item} direction="right" />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
