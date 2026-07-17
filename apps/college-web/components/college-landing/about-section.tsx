import Image from "next/image";
import { Award } from "lucide-react";
import type { PublicCollegeOverviewBadge } from "@beaconu/types";

interface AboutSectionProps {
  about: string | null;
  accolades: PublicCollegeOverviewBadge[];
}

export function AboutSection({ about, accolades }: AboutSectionProps) {
  if (!about && accolades.length === 0) return null;

  return (
    <section id="about" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
        About the Campus
      </h2>

      {about ? (
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
          {about}
        </p>
      ) : null}

      {accolades.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {accolades.map((badge, i) => (
            <div
              key={`${badge.title}-${i}`}
              className="flex items-center gap-3 rounded-2xl border border-border/60 p-4"
            >
              {badge.image ? (
                <Image
                  src={badge.image}
                  alt={badge.title ?? "Accolade"}
                  width={36}
                  height={36}
                  className="h-9 w-9 shrink-0 rounded-lg object-contain"
                />
              ) : (
                <Award className="h-9 w-9 shrink-0 text-muted-foreground" />
              )}
              <div className="min-w-0">
                {badge.tag ? (
                  <p className="truncate text-xs uppercase tracking-wide text-muted-foreground">
                    {badge.tag}
                  </p>
                ) : null}
                <p className="truncate text-sm font-medium">{badge.title}</p>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
