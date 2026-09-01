import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="relative isolate overflow-hidden bg-primary py-24">
      <div
        className="pointer-events-none absolute -right-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full border border-white/20"
        aria-hidden
      />

      <div className="container relative">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white">
              Your next conversation starts here
            </p>
            <h2 className="mt-3 max-w-xl text-balance font-serif text-4xl font-semibold tracking-tight text-primary-foreground sm:text-5xl">
              Ready to counsel with purpose?
            </h2>
          </div>

          <Link
            href="#roles"
            className="inline-flex h-14 shrink-0 items-center gap-2 rounded-full bg-white px-8 text-base font-semibold text-foreground shadow-lg transition-colors hover:bg-white/90"
          >
            Request to join Blink
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
