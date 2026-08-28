import Image from "next/image";
import { ArrowRight, Award, Building2 } from "lucide-react";
import type { PublicCollegeOverviewBadge } from "@beaconu/types";

interface AboutSectionProps {
  about: string | null;
  accolades: PublicCollegeOverviewBadge[];
  imageUrl?: string | null;
}

export function AboutSection({
  about,
  accolades,
  imageUrl,
}: AboutSectionProps) {
  if (!about && accolades.length === 0) return null;

  return (
    <section id="about" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <div className="relative h-80 w-full overflow-hidden rounded-2xl bg-muted sm:h-96 lg:h-full lg:min-h-[420px]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt="Campus"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/60">
              <Building2 className="h-16 w-16 text-muted-foreground/40" />
            </div>
          )}
        </div>

        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-headerTeal">
            <span className="h-px w-6 bg-headerTeal" />
            About Us
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Explore Your Potential
          </h2>

          {about ? (
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              {about}
            </p>
          ) : null}

          <button
            type="button"
            className="mt-6 flex items-center gap-3 rounded-full bg-headerTeal-dark py-1.5 pl-4 pr-1.5 text-sm font-medium text-white hover:bg-headerTeal-dark/90"
          >
            Read full story
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-headerTeal-dark">
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </button>

          {accolades.length > 0 ? (
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {accolades.map((badge, i) => (
                <div
                  key={`${badge.title}-${i}`}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-border/60 p-4 text-center"
                >
                  {badge.image ? (
                    <Image
                      src={badge.image}
                      alt={badge.title ?? "Accolade"}
                      width={40}
                      height={40}
                      className="h-10 w-10 shrink-0 object-contain"
                    />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-headerTeal/10 text-headerTeal">
                      <Award className="h-5 w-5" />
                    </span>
                  )}
                  <div className="w-full min-w-0">
                    <p className="truncate text-xs font-semibold">
                      {badge.title}
                    </p>
                    {badge.tag ? (
                      <p className="line-clamp-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                        {badge.tag}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
