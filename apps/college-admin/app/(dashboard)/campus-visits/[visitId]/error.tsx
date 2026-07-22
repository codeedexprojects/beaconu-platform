"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CampusVisitDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[CampusVisitDetailError]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-muted-foreground">
        {error.message ?? "Failed to load campus visit."}
      </p>
      {error.digest && (
        <p className="font-mono text-xs text-muted-foreground">
          ID: {error.digest}
        </p>
      )}
      <div className="flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <Link href="/campus-visits">Back to list</Link>
        </Button>
      </div>
    </div>
  );
}
