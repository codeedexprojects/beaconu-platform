import { Award, HeartHandshake, Wallet } from "lucide-react";

const POINTS = [
  {
    icon: HeartHandshake,
    title: "Two counselling tracks",
    description:
      "Join as an Academic Counsellor guiding course and college decisions, or a MindCare Counsellor supporting student mental wellbeing.",
  },
  {
    icon: Wallet,
    title: "Transparent earnings",
    description:
      "Every session and payout is tracked through your BeaconU counsellor wallet — no spreadsheets, no guesswork.",
  },
  {
    icon: Award,
    title: "Reach students who need you",
    description:
      "Connect with students across BeaconU's network of partner colleges, on a platform built for confidential, focused sessions.",
  },
];

export function WhatIsBlinkSection() {
  return (
    <section className="border-t border-border/60 bg-secondary/40 py-20">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            What is Blink?
          </h2>
          <p className="mt-3 text-balance text-muted-foreground">
            Blink is BeaconU&apos;s counsellor network — connecting academic and
            MindCare counsellors with students looking for guidance on their
            course, college, and wellbeing.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-3">
          {POINTS.map((point) => (
            <div
              key={point.title}
              className="rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <point.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold">{point.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {point.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
