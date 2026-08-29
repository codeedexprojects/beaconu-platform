import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApplyNowButton } from "@/components/college-landing/apply-now-button";

interface CtaFooterProps {
  collegeName: string;
  campusVisitHref: string;
}

export function CtaFooter({ collegeName, campusVisitHref }: CtaFooterProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-headerTeal to-headerTeal-dark">
      <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Begin Your Admission Journey
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/80">
          Take the first step toward studying at {collegeName}.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <ApplyNowButton
            size="lg"
            className="rounded-full bg-white text-headerTeal-dark shadow-md hover:bg-white/90"
          >
            Start Application <ArrowRight className="ml-1.5 h-4 w-4" />
          </ApplyNowButton>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
            asChild
          >
            <Link href={campusVisitHref}>Book Campus Visit</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
