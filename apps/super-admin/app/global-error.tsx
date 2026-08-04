"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({
  error,
  reset,
}: GlobalErrorProps): React.JSX.Element {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#070B14] flex items-center justify-center p-4 font-sans antialiased">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-white">Critical error</h1>
            <p className="text-sm text-white/40 max-w-sm">
              The application encountered a fatal error. Please refresh the
              page.
            </p>
            {error.digest && (
              <p className="text-xs text-white/20 font-mono">
                Error ID: {error.digest}
              </p>
            )}
          </div>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reload application
          </button>
        </div>
      </body>
    </html>
  );
}
