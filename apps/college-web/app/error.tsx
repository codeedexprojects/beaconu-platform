"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-12 text-center">
      <p className="text-sm text-muted-foreground">
        {error.message ?? "An unexpected error occurred."}
      </p>
      {error.digest && (
        <p className="font-mono text-xs text-muted-foreground/50">
          Error ID: {error.digest}
        </p>
      )}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={reset}>
          Try again
        </Button>
        <Button size="sm" asChild>
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}
