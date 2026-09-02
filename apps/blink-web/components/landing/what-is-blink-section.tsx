import Image from "next/image";
import { Check, HeartHandshake, Mail } from "lucide-react";

const POINTS = [
  {
    icon: HeartHandshake,
    title: "Two tracks",
    description: "Join the work that feels most meaningful to you.",
  },
  {
    icon: Mail,
    title: "Clear earnings",
    description: "Every session and payout stays easy to follow.",
  },
  {
    icon: Check,
    title: "Real reach",
    description: "Meet students across our partner college network.",
  },
];

export function WhatIsBlinkSection() {
  return (
    <section className="border-t border-border/60 py-20">
      <div className="container">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative w-full">
            <div
              className="pointer-events-none absolute -left-6 -top-6 h-24 w-24 rounded-full border border-primary/30"
              aria-hidden
            />
            <div className="relative aspect-[6/5] w-full overflow-hidden rounded-[2rem]">
              <Image
                src="/about-img.jpg"
                alt="A Blink counsellor in session with a student"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute bottom-4 right-4 flex h-20 w-20 flex-col items-center justify-center rounded-full bg-primary text-center text-primary-foreground shadow-lg">
              <span className="text-sm font-bold leading-none">01</span>
              <span className="mt-1 text-[9px] font-semibold uppercase leading-tight tracking-wide">
                One
                <br />
                Network
              </span>
            </div>
          </div>

          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
              <span className="h-px w-6 bg-primary" />
              The Blink difference
            </p>
            <h2 className="mt-3 text-balance font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              A better conversation can change the direction of a day.
            </h2>
            <p className="mt-4 max-w-lg text-balance text-muted-foreground">
              Blink connects thoughtful professionals with students looking for
              guidance on their course, college, and wellbeing.
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {POINTS.map((point) => (
                <div key={point.title}>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <point.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-3 text-sm font-semibold">{point.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {point.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
