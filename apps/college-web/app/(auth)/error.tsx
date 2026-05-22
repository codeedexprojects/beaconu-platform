"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[RouteError]", error);
  }, [error]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070B14] flex items-center justify-center p-6">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-[#f97316]/5 blur-[120px]" />
      </div>

      <div className="relative z-10 text-center max-w-sm w-full">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 mx-auto">
          <span className="text-2xl">⚠</span>
        </div>

        <h1 className="text-xl font-bold text-white tracking-tight mb-2">
          Something went wrong
        </h1>

        <p className="text-sm text-white/50 mb-2">
          {error.message ?? "An unexpected error occurred."}
        </p>

        {error.digest && (
          <p className="text-xs text-white/25 font-mono mb-6">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex gap-3 justify-center mt-6">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-[#f97316] hover:bg-[#ea5f05] text-white text-sm font-semibold rounded-full transition-colors"
          >
            Try again
          </button>
          <a
            href="/"
            className="px-5 py-2.5 border border-white/10 bg-white/[0.04] text-white/60 hover:text-white text-sm font-semibold rounded-full transition-colors"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
