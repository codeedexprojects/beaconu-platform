"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, ExternalLink, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublicHappeningsSection } from "@beaconu/types";

interface HappeningsSectionProps {
  section: PublicHappeningsSection;
  subdomain: string;
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

export function HappeningsSection({
  section,
  subdomain,
}: HappeningsSectionProps) {
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
    <section id="happenings" className="pb-16">
      <div className="relative bg-[#E6F7FF] py-10">
        <Link
          href={`/college/${subdomain}`}
          className="absolute left-4 top-6 flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted sm:left-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {section.title || "Happenings"}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {categories.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm transition-colors",
                  activeCategory === null
                    ? "bg-headerTeal-dark text-white"
                    : "border border-border/60 bg-white text-foreground hover:bg-field",
                )}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() =>
                    setActiveCategory(
                      activeCategory === category ? null : category,
                    )
                  }
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-sm transition-colors",
                    activeCategory === category
                      ? "bg-headerTeal-dark text-white"
                      : "border border-border/60 bg-white text-foreground hover:bg-field",
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          ) : (
            <span />
          )}

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search happenings"
              className="w-56 rounded-full border border-border/60 bg-white py-2 pl-9 pr-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-headerTeal"
            />
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item, i) => {
              const formattedDate = formatHappeningDate(item.date);
              return (
                <article
                  key={`${item.title}-${i}`}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm"
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
                        <span className="rounded-full bg-headerTeal/10 px-2.5 py-1 text-xs font-medium text-headerTeal">
                          {item.category}
                        </span>
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
      </div>
    </section>
  );
}
