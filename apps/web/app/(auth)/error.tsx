"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AuthError]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <p className="text-sm text-gray-400 mb-2">
          {error.message ?? "Something went wrong."}
        </p>
        {error.digest && (
          <p className="text-xs text-gray-500/50 font-mono mb-4">
            ID: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-primary hover:opacity-90 text-white text-sm font-semibold rounded-full transition-colors"
          >
            Try again
          </button>
          <Link
            href="/login"
            className="px-5 py-2.5 bg-white/10 border border-white/10 text-white/70 text-sm font-semibold rounded-full"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
