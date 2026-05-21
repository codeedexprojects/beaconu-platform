"use client";

import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store";

export function HeroSection() {
  const [query, setQuery] = useState("");
  const user = useAuthStore((s) => s.user);

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .slice(0, 2)
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : "S";

  return (
    <section
      className="relative rounded-b-[2.5rem] sm:rounded-b-[3rem] lg:rounded-b-[4rem] overflow-hidden pb-8 sm:pb-12 lg:pb-16"
      style={{
        backgroundColor: "#0D0D0D",
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)",
        backgroundSize: "20px 20px",
      }}
    >
      {/* Inner content — constrained on large screens */}
      <div className="max-w-4xl mx-auto">
        {/* Top row: user + card badge + counselor */}
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 pt-14 sm:pt-16 lg:pt-20 pb-5 sm:pb-7">
          {/* Avatar + name */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0 border-2 border-white/20">
              <span className="text-white font-bold text-sm">{initials}</span>
            </div>
            <span className="text-white font-medium text-[15px] sm:text-[16px] truncate">
              {user?.fullName ?? "Student"}
            </span>
          </div>

          {/* BeaconU Infinity card badge */}
          <div className="flex items-center gap-1.5 bg-[#1C1C1E] rounded-full px-3 py-1.5 border border-white/10 flex-shrink-0 mx-2 sm:mx-4">
            <div className="w-[18px] h-[18px] rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[10px] font-black leading-none">
                ∞
              </span>
            </div>
            <span className="text-white text-[12px] sm:text-[13px] font-semibold">
              Infinity
            </span>
            <span className="bg-[#14291A] text-green-400 text-[11px] font-semibold px-2 py-0.5 rounded-full">
              Active
            </span>
          </div>

          {/* Counselor icon button */}
          <button
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center justify-center flex-shrink-0"
            aria-label="Talk to counselor"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
        </div>

        {/* Hero text */}
        <div className="px-6 sm:px-8 text-center mb-7 sm:mb-9 lg:mb-11">
          <h1 className="text-white font-bold text-[28px] sm:text-[40px] lg:text-[54px] leading-[1.15] tracking-tight mb-3 sm:mb-4">
            Your World Class
            <br />
            Education Awaits
          </h1>
          <p className="text-[#9CA3AF] text-[14px] sm:text-[16px] lg:text-[18px] leading-[1.65] max-w-xl mx-auto">
            Explore top local institutions and find the perfect campus for your
            future career close to home.
          </p>
        </div>

        {/* Search bar — max-width on desktop */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto relative flex items-center bg-white rounded-full shadow-lg">
            <Search className="absolute left-4 h-[18px] w-[18px] sm:h-5 sm:w-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search colleges, cities, courses..."
              className="w-full pl-11 sm:pl-12 pr-[60px] py-[14px] sm:py-[16px] rounded-full bg-transparent text-[#374151] placeholder-gray-400 text-[14px] sm:text-[15px] focus:outline-none"
            />
            <button
              className="absolute right-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-[10px] sm:p-3 transition-colors flex-shrink-0"
              aria-label="Search"
            >
              <ArrowRight className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
