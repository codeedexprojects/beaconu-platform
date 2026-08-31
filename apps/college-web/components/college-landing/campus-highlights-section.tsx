import Link from "next/link";
import { ArrowRight, ArrowUpRight, Newspaper } from "lucide-react";

interface CampusHighlightItem {
  id: string;
  tag: string;
  title: string;
  excerpt: string;
  imageUrl?: string | null;
  href?: string;
}

interface CampusHighlightsSectionProps {
  subdomain: string;
  highlights: CampusHighlightItem[];
}

export function CampusHighlightsSection({
  subdomain,
  highlights,
}: CampusHighlightsSectionProps) {
  if (highlights.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-headerTeal">
            <span className="h-px w-6 bg-headerTeal" />
            News &amp; Events
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Campus Highlights
          </h2>
        </div>
        <Link
          href={`/college/${subdomain}/happenings`}
          className="flex items-center gap-1 text-sm font-medium text-headerTeal hover:text-headerTeal-dark"
        >
          View All Highlights
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="no-scrollbar mt-8 flex gap-5 overflow-x-auto pb-2">
        {highlights.map((item) => (
          <div
            key={item.id}
            className="flex w-80 shrink-0 flex-col overflow-hidden rounded-2xl bg-white shadow-sm"
          >
            <div className="relative h-48 w-full bg-muted">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/60">
                  <Newspaper className="h-12 w-12 text-muted-foreground/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-3 rounded-full bg-headerTeal-dark px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                {item.tag}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="text-base font-semibold leading-snug">
                {item.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-5 text-muted-foreground">
                {item.excerpt}
              </p>
              {item.href ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 flex items-center gap-1.5 text-sm font-medium text-headerTeal"
                >
                  Read More
                  <ArrowRight className="h-4 w-4" />
                </a>
              ) : (
                <Link
                  href={`/college/${subdomain}/happenings`}
                  className="mt-4 flex items-center gap-1.5 text-sm font-medium text-headerTeal"
                >
                  Read More
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
