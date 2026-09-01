import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { BLINK_ROLES } from "@/lib/roles";

export function RoleCardsSection() {
  return (
    <section id="roles" className="py-20">
      <div className="container">
        <div className="flex flex-col items-start justify-between gap-6 border-b border-border/60 pb-10 lg:flex-row lg:items-end">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
              <span className="h-px w-6 bg-primary" />
              Find your place
            </p>
            <h2 className="mt-3 max-w-md text-balance font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              Two ways to show up for students.
            </h2>
          </div>
          <p className="max-w-sm text-balance text-muted-foreground">
            Bring your experience to the moments that matter — whether
            you&apos;re helping someone choose a course or supporting their
            wellbeing.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {BLINK_ROLES.map((role, index) => (
            <div
              key={role.slug}
              className={cn(
                "flex flex-col rounded-3xl p-8",
                index === 0 ? "bg-secondary" : "bg-primary/10",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <role.icon className="h-5 w-5" />
                </span>
                <span className="rounded-full border border-primary/30 px-3 py-1 text-xs font-semibold text-primary">
                  Request to join
                </span>
              </div>

              <h3 className="mt-6 font-serif text-2xl font-semibold tracking-tight">
                {role.title}
              </h3>
              <p className="mt-2 text-balance text-muted-foreground">
                {role.description}
              </p>

              <ul className="mt-6 flex-1 space-y-3">
                {role.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="flex items-start gap-2.5 text-sm"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={`/register/${role.slug}`}
                className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                {role.ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
