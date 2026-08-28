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
  highlights?: CampusHighlightItem[];
}

const PLACEHOLDER_HIGHLIGHTS: CampusHighlightItem[] = [
  {
    id: "placeholder-1",
    tag: "Career Guidance",
    title: "Mega Placement Drive 2024",
    excerpt:
      "Over 40 top-tier companies recruited 200+ students from various disciplines in our annual recruitment fair.",
  },
  {
    id: "placeholder-2",
    tag: "Career Guidance",
    title: "Mega Placement Drive 2024",
    excerpt:
      "Over 40 top-tier companies recruited 200+ students from various disciplines in our annual recruitment fair.",
  },
  {
    id: "placeholder-3",
    tag: "Career Guidance",
    title: "Mega Placement Drive 2024",
    excerpt:
      "Over 40 top-tier companies recruited 200+ students from various disciplines in our annual recruitment fair.",
  },
];

export function CampusHighlightsSection({
  subdomain,
  highlights = PLACEHOLDER_HIGHLIGHTS,
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
          href={`/college/${subdomain}#news-events`}
          className="flex items-center gap-1 text-sm font-medium text-headerTeal hover:text-headerTeal-dark"
        >
          View All Programmes
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-8 flex gap-5 overflow-x-auto pb-2">
        {highlights.map((item) => (
          <div
            key={item.id}
            className="flex w-64 shrink-0 flex-col overflow-hidden rounded-2xl border border-border/60"
          >
            <div className="relative h-40 w-full bg-muted">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/60">
                  <Newspaper className="h-10 w-10 text-muted-foreground/40" />
                </div>
              )}
              <span className="absolute left-3 top-3 rounded-full bg-headerTeal px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                {item.tag}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h3 className="text-sm font-semibold leading-snug">
                {item.title}
              </h3>
              <p className="mt-2 flex-1 text-xs leading-5 text-muted-foreground">
                {item.excerpt}
              </p>
              <Link
                href={item.href ?? `/college/${subdomain}#news-events`}
                className="mt-3 flex items-center gap-1.5 text-xs font-medium text-headerTeal"
              >
                Read More
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
