import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative isolate flex min-h-[640px] items-center overflow-hidden sm:min-h-[720px]">
      <Image src="/hero-bg.jpg" alt="" fill priority className="object-cover" />
      <div
        className="absolute inset-0 bg-gradient-to-r from-navy-dark/90 via-navy-dark/70 to-navy-dark/30"
        aria-hidden
      />

      <div className="container relative py-20 sm:py-28">
        <div className="flex max-w-3xl flex-col items-start gap-8">
          <span className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary">
            <Sparkles className="h-4 w-4" />
            The counsellor network
          </span>

          <h1 className="text-balance font-serif text-6xl font-semibold leading-[1.05] tracking-tight text-white sm:text-7xl md:text-8xl">
            Counsel with
            <br />
            <span className="text-primary">purpose.</span>
          </h1>

          <p className="max-w-xl text-balance text-lg text-white/80 sm:text-xl">
            Support students as they find their next step. Run meaningful
            sessions, grow your practice, and make a real difference.
          </p>

          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Link
              href="#roles"
              className="inline-flex h-14 items-center gap-2 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
            >
              Join as a counsellor
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex h-14 items-center gap-2 rounded-full bg-white px-8 text-base font-semibold text-foreground shadow-lg transition-colors hover:bg-white/90"
            >
              See how it works
              <ArrowUpRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
