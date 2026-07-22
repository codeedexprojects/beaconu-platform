"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Calendar, ExternalLink, PartyPopper, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PublicHappeningsSection } from "@beaconu/types";

interface HappeningsSectionProps {
  section: PublicHappeningsSection;
}

function formatHappeningDate(date?: string): string | null {
  if (!date) return null;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

export function HappeningsSection({ section }: HappeningsSectionProps) {
  const items = useMemo(() => section.happenings ?? [], [section.happenings]);

  const categories = useMemo(() => {
    const fromFilters = section.filters?.categories ?? [];
    const fromItems = items
      .map((item) => item.category)
      .filter((c): c is string => Boolean(c));
    return Array.from(new Set([...fromFilters, ...fromItems]));
  }, [section.filters?.categories, items]);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      if (activeCategory && item.category !== activeCategory) return false;
      if (!query) return true;
      const haystack = [item.title, item.description, item.category]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [items, search, activeCategory]);

  if (items.length === 0) return null;

  return (
    <section id="happenings" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
          <PartyPopper className="h-6 w-6" />
          {section.title || "Happenings"}
        </h2>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search happenings"
            className="w-56 rounded-full border border-border/60 bg-background py-2 pl-9 pr-4 text-sm outline-none focus:border-foreground/30"
          />
        </div>
      </div>

      {categories.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
              activeCategory === null
                ? "border-foreground bg-foreground text-background"
                : "border-border/60 hover:border-foreground/30",
            )}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() =>
                setActiveCategory(activeCategory === category ? null : category)
              }
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                activeCategory === category
                  ? "border-foreground bg-foreground text-background"
                  : "border-border/60 hover:border-foreground/30",
              )}
            >
              {category}
            </button>
          ))}
        </div>
      ) : null}

      {filtered.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, i) => {
            const formattedDate = formatHappeningDate(item.date);
            return (
              <article
                key={`${item.title}-${i}`}
                className="overflow-hidden rounded-2xl border border-border/60"
              >
                {item.image ? (
                  <div className="relative h-40 w-full">
                    <Image
                      src={item.image}
                      alt={item.title ?? "Happening"}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                ) : null}
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2">
                    {item.category ? (
                      <Badge variant="secondary">{item.category}</Badge>
                    ) : (
                      <span />
                    )}
                    {formattedDate ? (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {formattedDate}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-3 text-sm font-semibold leading-snug">
                    {item.title}
                  </h3>
                  {item.description ? (
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  ) : null}
                  {item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-sm font-medium hover:underline"
                    >
                      Read more <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="mt-8 text-sm text-muted-foreground">
          No happenings match your search.
        </p>
      )}
    </section>
  );
}
