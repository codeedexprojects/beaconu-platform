"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    question: "Who can join Blink?",
    answer:
      "Academic Counsellors and MindCare (mental health) counsellors can apply to join the Blink counsellor network through this page.",
  },
  {
    question: "What does 'Request to join' mean?",
    answer:
      "Submitting the form doesn't create an account right away. The Blink team reviews every request first, and you'll be notified by email once it's approved — at which point your counsellor account is set up.",
  },
  {
    question: "How long does approval take?",
    answer:
      "Most requests are reviewed within a few business days. You'll receive an email update once a decision is made.",
  },
  {
    question: "How do I earn through Blink?",
    answer:
      "Counsellors are compensated for the sessions they conduct with students, paid out through the BeaconU counsellor wallet.",
  },
  {
    question:
      "What's the difference between Academic and MindCare counselling?",
    answer:
      "Academic Counsellors guide students on choosing the right stream, course, and college. MindCare Counsellors are licensed mental health professionals who support student wellbeing through confidential sessions.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="border-t border-border/60 py-20">
      <div className="container">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="lg:pt-24">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Good to know
            </p>
            <h2 className="mt-3 text-balance font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              Questions,
              <br />
              answered.
            </h2>
            <p className="mt-4 max-w-sm text-balance text-muted-foreground">
              Everything you need to feel ready for your first step with Blink.
            </p>
          </div>

          <div className="border-t border-border">
            {FAQS.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={faq.question} className="border-b border-border">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 py-6 text-left"
                  >
                    <span className="font-serif text-xl font-medium tracking-tight">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 shrink-0 text-primary transition-transform",
                        isOpen && "rotate-180",
                      )}
                    />
                  </button>
                  {isOpen && (
                    <p className="animate-fade-in pb-6 text-sm text-muted-foreground">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
