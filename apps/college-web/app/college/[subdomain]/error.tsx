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
    <div className="flex min-h-screen items-center justify-center bg-[#fcfbf7] p-6 [font-family:Poppins,ui-sans-serif,system-ui]">
      <div className="text-center max-w-sm w-full">
        <div className="mb-6 mx-auto h-14 w-14 flex items-center justify-center rounded-2xl bg-orange-50 border border-orange-100">
          <span className="text-2xl">⚠</span>
        </div>

        <h1 className="text-xl font-bold text-[#1b1b1b] tracking-tight mb-2">
          Something went wrong
        </h1>

        <p className="text-sm text-[#1b1b1b]/60 mb-2">
          {error.message ?? "An unexpected error occurred."}
        </p>

        {error.digest && (
          <p className="text-xs text-[#1b1b1b]/30 font-mono mb-6">
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
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-full transition-colors"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
