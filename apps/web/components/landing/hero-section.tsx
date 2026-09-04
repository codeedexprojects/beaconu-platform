"use client";

import Image from "next/image";

export function HeroSection({
  onRequestOnboarding,
}: {
  onRequestOnboarding: () => void;
}) {
  return (
    <section className="relative mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-12 overflow-hidden px-6 pb-20 pt-32 md:grid-cols-[1.05fr_0.95fr] md:gap-8 md:px-8 md:pb-24 md:pt-36">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(244,106,18,0.08) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-[15%] h-[600px] w-[600px] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(circle, rgba(244,106,18,0.05) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.02) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center md:items-start md:text-left">
        <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-landing/20 bg-landing/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-landing">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-landing" />
          Now Onboarding Partner Colleges
        </div>
        <h1 className="font-sans text-[clamp(2.5rem,5vw,3.75rem)] font-black leading-[1.08] tracking-tight text-navy-dark">
          Powering India&apos;s
          <br />
          <span className="bg-gradient-to-br from-landing to-landing-dark bg-clip-text text-transparent">
            College Experience
          </span>
          .
        </h1>
        <p className="mx-0 my-6 max-w-[520px] text-lg leading-relaxed text-gray-label">
          The unified student engagement platform trusted by leading
          institutions to transform how campuses learn, connect, and thrive.
        </p>
        <div className="flex flex-wrap justify-center gap-3.5 md:justify-start">
          <button
            className="rounded-xl bg-landing px-8 py-3.5 text-base font-bold text-white shadow-[0_4px_12px_rgba(244,106,18,0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(244,106,18,0.35)]"
            onClick={onRequestOnboarding}
          >
            Request Onboarding →
          </button>
          <button className="rounded-xl border border-navy-dark/10 bg-navy-dark/[0.03] px-8 py-3.5 text-base font-semibold text-navy-dark transition-colors hover:bg-navy-dark/[0.06]">
            Learn More
          </button>
        </div>
      </div>

      <div className="relative z-10 flex justify-center">
        <div
          className="pointer-events-none absolute -right-[10%] -top-[10%] h-[60%] w-[60%]"
          style={{
            background:
              "radial-gradient(circle, rgba(244,106,18,0.14) 0%, transparent 70%)",
          }}
        />
        <div className="relative w-full max-w-[560px] rotate-[1.5deg] overflow-hidden rounded-2xl border border-landing/[0.12] shadow-[0_24px_60px_-16px_rgba(26,26,46,0.18),0_8px_24px_-8px_rgba(244,106,18,0.12)]">
          <Image
            src="/hero-img.jpg"
            alt="BeaconU student dashboard — academic progress, schedule, and campus events"
            width={960}
            height={696}
            className="h-auto w-full"
            priority
          />
        </div>
      </div>
    </section>
  );
}
