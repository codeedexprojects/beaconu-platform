"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function HomePage(): React.JSX.Element {
  const router = useRouter();

  useEffect(() => {
    // Extract subdomain from the current hostname
    const hostname =
      typeof window !== "undefined" ? window.location.hostname : "";
    const isLocalhost = hostname.includes("localhost");

    let subdomain = null;

    if (isLocalhost) {
      // localhost testing: anupam.localhost:3001
      const parts = hostname.split(".");
      if (parts.length > 1 && parts[0] !== "localhost") {
        subdomain = parts[0];
      }
    } else {
      // Production: anupam.beaconu.com
      const parts = hostname.split(".");
      if (parts.length >= 3) {
        subdomain = parts[0];
      }
    }

    // If subdomain detected, redirect to college landing page
    if (subdomain && subdomain !== "www") {
      router.push(`/college/${subdomain}`);
    }
  }, [router]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070B14] flex flex-col items-center justify-center p-4">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-primary/10 blur-[140px] animate-pulse" />
        <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-[#f97316]/5 blur-[120px]" />
      </div>

      {/* Decorative dot background pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full text-center space-y-6">
        {/* Brand Icon Badge */}
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-orange-500 shadow-xl shadow-primary/30 animate-bounce duration-1000">
          <span className="text-2xl font-black text-white">B</span>
        </div>

        {/* Loading Message */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-white tracking-tight">
            BeaconU Portal
          </h1>
          <p className="text-sm text-white/50 font-medium">
            Redirecting to your college portal landing page...
          </p>
        </div>

        {/* Premium Spinner and progress loader */}
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 backdrop-blur-md shadow-md">
          <Loader2 className="h-4 w-4 animate-spin text-[#f97316]" />
          <span className="text-xs text-white/70 font-mono tracking-wider">
            SECURE CONNECTION
          </span>
        </div>
      </div>
    </main>
  );
}
