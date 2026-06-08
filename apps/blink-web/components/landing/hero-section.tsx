import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[480px] bg-[radial-gradient(closest-side,hsl(var(--primary)/0.18),transparent)]"
        aria-hidden
      />
      <div className="container flex flex-col items-center gap-6 py-20 text-center sm:py-28">
        <Badge variant="secondary" className="gap-1.5 px-3 py-1">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          BeaconU&apos;s counsellor network
        </Badge>

        <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
          Counsel with BeaconU.
          <br />
          <span className="text-primary">
            Support students. Grow your practice.
          </span>
        </h1>

        <p className="max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
          Blink is BeaconU&apos;s counsellor network — for academic counsellors
          guiding students toward the right course, and MindCare counsellors
          supporting student wellbeing. Run sessions, get paid, and make a real
          impact.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="gap-2">
            <Link href="#roles">
              Join as a counsellor
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="#how-it-works">See how it works</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
