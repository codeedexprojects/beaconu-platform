"use client";

import { useState } from "react";
import Image from "next/image";
import { Bus, MapPin, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublicHostelLocationAndAccess } from "@beaconu/types";

interface HostelLocationSectionProps {
  location: PublicHostelLocationAndAccess;
}

export function HostelLocationSection({
  location,
}: HostelLocationSectionProps) {
  const options = location.tabs?.options ?? [];
  const [active, setActive] = useState(
    location.tabs?.selected ?? options[0] ?? "",
  );

  const activeType = location.types?.find((t) => t.type === active);
  const categories = (activeType?.categories ?? []).filter(
    (c) => (c.details?.length ?? 0) > 0,
  );

  const hasContent =
    categories.length > 0 ||
    location.map?.address ||
    location.map?.college_transport;

  if (!hasContent) return null;

  return (
    <section>
      <h2 className="text-xl font-bold tracking-tight">
        {location.title || "Location & Access"}
      </h2>

      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <div>
          {options.length > 0 ? (
            <div className="flex gap-2">
              {options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setActive(option)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                    active === option
                      ? "border-foreground bg-foreground text-background"
                      : "border-border/60 hover:border-foreground/30",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-4 space-y-4">
            {categories.length > 0 ? (
              categories.map((category, i) => (
                <div key={i}>
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Navigation className="h-3.5 w-3.5" />
                    {category.title}
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {category.details?.map((detail, j) => (
                      <li
                        key={j}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>{detail.name}</span>
                        <span className="text-muted-foreground">
                          {detail.distance}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Nothing listed for {active} yet.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {location.map?.thumbnail ? (
            <div className="relative h-48 w-full overflow-hidden rounded-2xl">
              <Image
                src={location.map.thumbnail}
                alt="Map"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          ) : null}

          {location.map?.address ? (
            <div className="flex items-start gap-2 rounded-2xl border border-border/60 p-4">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {location.map.address.line1}
                {location.map.address.line2
                  ? `, ${location.map.address.line2}`
                  : ""}
              </p>
            </div>
          ) : null}

          {location.map?.college_transport ? (
            <div className="flex items-start gap-2 rounded-2xl border border-border/60 p-4">
              <Bus className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {location.map.college_transport.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {location.map.college_transport.description}
                </p>
                {location.map.college_transport.bus_stop_note ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {location.map.college_transport.bus_stop_note}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {location.map?.open_map_cta?.link ? (
            <a
              href={location.map.open_map_cta.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
            >
              Open in Maps
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
