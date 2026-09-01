import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { BlinkRole } from "@/lib/roles";

export function SubmissionSuccess({ role }: { role: BlinkRole }) {
  return (
    <Card className="rounded-2xl shadow-md">
      <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <h2 className="font-serif text-xl font-semibold">
          Your request has been received
        </h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Thanks for your interest in joining Blink as a {role.shortLabel}. Our
          team will review your request and email you with next steps — usually
          within a few business days.
        </p>
        <Button asChild className="mt-2">
          <Link href="/">Back to Blink home</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
