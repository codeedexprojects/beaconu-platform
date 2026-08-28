"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";

interface TestimonialItem {
  id: string;
  quote: string;
  name: string;
  roleLines: string[];
  avatarUrl?: string | null;
}

interface SharingExperienceSectionProps {
  subdomain: string;
  testimonials?: TestimonialItem[];
}

const PLACEHOLDER_TESTIMONIALS: TestimonialItem[] = [
  {
    id: "placeholder-1",
    quote:
      "M.E.S Kalladi College is unique in academic and co-curricular aspects and the Happiness Centre of the college is a novel initiative. I could attend the world record event organized by M.E.S Kalladi College and understand that the institution has a visionary management, dedicated faculty and a promising generation of students.",
    name: "Prof. E. Balagurusamy",
    roleLines: ["Former VC, Anna University", "Former Member, UPSC"],
  },
  {
    id: "placeholder-2",
    quote:
      "The campus culture here strikes a rare balance between academic rigor and genuine student wellbeing. It's the kind of environment that produces confident, well-rounded graduates.",
    name: "Dr. A. R. Nair",
    roleLines: ["Former Vice Chancellor", "Kerala University"],
  },
  {
    id: "placeholder-3",
    quote:
      "What stood out to me was how invested the faculty are in every student's journey — not just academically, but personally. That kind of mentorship is rare.",
    name: "Ms. Priya Menon",
    roleLines: ["Education Consultant", "Alumni Board Member"],
  },
];

export function SharingExperienceSection({
  subdomain,
  testimonials = PLACEHOLDER_TESTIMONIALS,
}: SharingExperienceSectionProps) {
  const [index, setIndex] = useState(0);

  if (testimonials.length === 0) return null;

  const current = testimonials[index];

  function goPrev() {
    setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);
  }

  function goNext() {
    setIndex((i) => (i + 1) % testimonials.length);
  }

  return (
    <section className="bg-muted/40 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-headerTeal">
              <span className="h-px w-6 bg-headerTeal" />
              Hear It From Our Students
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Sharing Experience
            </h2>
          </div>
          <Link
            href={`/college/${subdomain}#reviews`}
            className="flex items-center gap-1 text-sm font-medium text-headerTeal hover:text-headerTeal-dark"
          >
            Explore students Experiences
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative mx-auto mt-10 max-w-3xl">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous testimonial"
            className="absolute left-0 top-1/2 z-10 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-headerTeal-dark text-white shadow-md hover:bg-headerTeal-dark/90"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="rounded-3xl bg-background px-6 py-10 text-center shadow-sm sm:px-14 sm:py-12">
            <p className="text-base italic leading-8 text-foreground sm:text-lg">
              &quot;{current.quote}&quot;
            </p>

            <div className="mt-6 flex flex-col items-center gap-2">
              <div className="relative h-16 w-16 overflow-hidden rounded-full bg-muted">
                {current.avatarUrl ? (
                  <Image
                    src={current.avatarUrl}
                    alt={current.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <p className="text-sm font-semibold text-foreground">
                {current.name}
              </p>
              {current.roleLines.map((line) => (
                <p key={line} className="text-xs text-muted-foreground">
                  {line}
                </p>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={goNext}
            aria-label="Next testimonial"
            className="absolute right-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-headerTeal-dark text-white shadow-md hover:bg-headerTeal-dark/90"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-1.5">
          {testimonials.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === index ? "bg-headerTeal-dark" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
