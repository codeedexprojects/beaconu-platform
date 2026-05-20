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
      className="relative rounded-b-[2.5rem] overflow-hidden pb-8"
      style={{
        backgroundColor: "#0D0D0D",
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)",
        backgroundSize: "20px 20px",
      }}
    >
      {/* Top row: user + card badge + counselor */}
      <div className="flex items-center justify-between px-4 pt-14 pb-5">
        {/* Avatar + name */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0 border-2 border-white/20">
            <span className="text-white font-bold text-sm">{initials}</span>
          </div>
          <span className="text-white font-medium text-[15px] truncate">
            {user?.fullName ?? "Student"}
          </span>
        </div>

        {/* BeaconU Infinity card badge */}
        <div className="flex items-center gap-1.5 bg-[#1C1C1E] rounded-full px-3 py-1.5 border border-white/10 flex-shrink-0 mx-2">
          <div className="w-[18px] h-[18px] rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[10px] font-black leading-none">
              ∞
            </span>
          </div>
          <span className="text-white text-[12px] font-semibold">Infinity</span>
          <span className="bg-[#14291A] text-green-400 text-[11px] font-semibold px-2 py-0.5 rounded-full">
            Active
          </span>
        </div>

        {/* Counselor icon button */}
        <button
          className="w-10 h-10 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center justify-center flex-shrink-0"
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
      <div className="px-6 text-center mb-7">
        <h1 className="text-white font-bold text-[28px] leading-[1.2] tracking-tight mb-3">
          Your World Class
          <br />
          Education Awaits
        </h1>
        <p className="text-[#9CA3AF] text-[14px] leading-[1.65]">
          Explore top local institutions and find the perfect campus for your
          future career close to home.
        </p>
      </div>

      {/* Search bar */}
      <div className="px-4">
        <div className="relative flex items-center bg-white rounded-full shadow-lg">
          <Search className="absolute left-4 h-[18px] w-[18px] text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search colleges, cities, courses..."
            className="w-full pl-11 pr-[60px] py-[14px] rounded-full bg-transparent text-[#374151] placeholder-gray-400 text-[14px] focus:outline-none"
          />
          <button
            className="absolute right-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-[10px] transition-colors flex-shrink-0"
            aria-label="Search"
          >
            <ArrowRight className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </section>
  );
}
