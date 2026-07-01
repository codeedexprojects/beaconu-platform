"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CampusVisitsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[CampusVisitsError]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-muted-foreground">
        {error.message ?? "Failed to load campus visits."}
      </p>
      {error.digest && (
        <p className="font-mono text-xs text-muted-foreground">
          ID: {error.digest}
        </p>
      )}
      <div className="flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <Link href="/">Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
