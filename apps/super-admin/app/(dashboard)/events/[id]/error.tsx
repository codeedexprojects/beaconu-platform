"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center p-6">
      <p className="text-sm text-muted-foreground">
        {error.message ?? "An unexpected error occurred."}
      </p>
      {error.digest && (
        <p className="font-mono text-xs text-muted-foreground">
          ID: {error.digest}
        </p>
      )}
      <div className="flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/events">Back to Events</Link>
        </Button>
      </div>
    </div>
  );
}
