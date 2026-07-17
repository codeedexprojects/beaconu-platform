"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function CollegeLandingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[CollegeLandingError]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-12 text-center">
      <p className="text-sm text-muted-foreground">
        {error.message ?? "Couldn't load this college's page."}
      </p>
      {error.digest && (
        <p className="font-mono text-xs text-muted-foreground/50">
          Error ID: {error.digest}
        </p>
      )}
      <Button variant="outline" size="sm" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
