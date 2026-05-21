"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function HomeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[HomeError]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-6">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/30">
          <span className="text-xl font-black text-white">B</span>
        </div>
        <p className="text-gray-600 mb-2">
          {error.message ?? "Something went wrong."}
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 font-mono mb-4">
            ID: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-full transition-colors"
          >
            Try again
          </button>
          <Link
            href="/home"
            className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-full"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
