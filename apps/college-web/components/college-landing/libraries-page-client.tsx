"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublicLibrary } from "@beaconu/types";

interface LibrariesPageClientProps {
  subdomain: string;
  libraries: PublicLibrary[];
}

function tabLabel(library: PublicLibrary): string {
  if (library.type === "central") return "Central Library";
  if (library.type === "department") return "Departmental";
  return library.name;
}

export function LibrariesPageClient({
  subdomain,
  libraries,
}: LibrariesPageClientProps) {
  const orderedLibraries = [...libraries].sort((a, b) =>
    a.type === "central" ? -1 : b.type === "central" ? 1 : 0,
  );
  const [activeId, setActiveId] = useState(orderedLibraries[0]?.id ?? null);
  const active =
    orderedLibraries.find((l) => l.id === activeId) ?? orderedLibraries[0];

  const stats = active?.stats ?? [];
  const resources = active?.availableResources?.items ?? [];
  const hours = active?.libraryHours?.days ?? [];
  const facilities = active?.facilities?.items ?? [];

  return (
    <div className="pb-16">
      <div className="relative bg-[#E6F7FF] py-10">
        <Link
          href={`/college/${subdomain}`}
          className="absolute left-4 top-6 flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted sm:left-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <h1 className="flex items-center justify-center gap-2.5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            <BookOpen className="h-7 w-7" />
            Libraries &amp; Learning Resources
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        {orderedLibraries.length === 0 || !active ? (
          <p className="text-sm text-muted-foreground">
            No libraries are listed for this college yet.
          </p>
        ) : (
          <>
            {orderedLibraries.length > 1 ? (
              <div className="flex flex-wrap items-center gap-2">
                {orderedLibraries.map((library) => (
                  <button
                    key={library.id}
                    type="button"
                    onClick={() => setActiveId(library.id)}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                      active.id === library.id
                        ? "bg-headerTeal-dark text-white"
                        : "border border-border/60 bg-white text-foreground hover:bg-field",
                    )}
                  >
                    {tabLabel(library)}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
              <div>
                <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                  {active.coverImageUrl ? (
                    <div className="relative h-56 w-full bg-muted">
                      <Image
                        src={active.coverImageUrl}
                        alt={active.name}
                        fill
                        sizes="(min-width: 1024px) 60vw, 100vw"
                        className="object-cover"
                      />
                      {active.type ? (
                        <span className="absolute left-3 top-3 rounded-full bg-headerTeal-dark px-2.5 py-1 text-[10px] font-semibold uppercase text-white">
                          {active.type}
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <div className="relative flex h-56 w-full items-center justify-center bg-field">
                      <BookOpen className="h-10 w-10 text-muted-foreground/40" />
                      {active.type ? (
                        <span className="absolute left-3 top-3 rounded-full bg-headerTeal-dark px-2.5 py-1 text-[10px] font-semibold uppercase text-white">
                          {active.type}
                        </span>
                      ) : null}
                    </div>
                  )}

                  <div className="p-5">
                    <p className="text-xl font-bold">{active.name}</p>

                    {stats.length > 0 ? (
                      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {stats.map((stat, i) => (
                          <div
                            key={i}
                            className="rounded-xl bg-field p-3 text-center"
                          >
                            <p className="text-lg font-bold tracking-tight text-headerTeal-dark">
                              {stat.value}
                            </p>
                            <p className="text-xs uppercase text-muted-foreground">
                              {stat.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {resources.length > 0 ? (
                      <div className="mt-6">
                        <p className="text-sm font-semibold text-headerTeal-dark">
                          Available Resources
                        </p>
                        <div className="mt-3 divide-y divide-border/60">
                          {resources.map((res, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between py-2 text-sm"
                            >
                              <span className="text-muted-foreground">
                                {res.name}
                              </span>
                              <span className="font-semibold text-headerTeal-dark">
                                {res.count}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                {facilities.length > 0 ? (
                  <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
                    <p className="text-sm font-semibold text-headerTeal-dark">
                      Facilities
                    </p>
                    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {facilities.map((facility, i) =>
                        facility.image?.startsWith("http") ? (
                          <div key={i}>
                            <div className="relative h-40 w-full overflow-hidden rounded-xl bg-muted">
                              <Image
                                src={facility.image}
                                alt={facility.name ?? "Facility"}
                                fill
                                sizes="(min-width: 640px) 280px, 100vw"
                                className="object-cover"
                              />
                            </div>
                            <p className="mt-2 text-center text-sm font-medium text-foreground">
                              {facility.name}
                            </p>
                          </div>
                        ) : (
                          <span
                            key={i}
                            className="flex h-40 items-center justify-center rounded-xl bg-field p-2 text-center text-sm text-muted-foreground"
                          >
                            {facility.name}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                ) : null}
              </div>

              {hours.length > 0 ? (
                <div className="h-fit rounded-2xl bg-white p-5 shadow-sm">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-headerTeal-dark">
                    <Clock className="h-4 w-4" />
                    Library Hours
                  </p>
                  <div className="mt-4 space-y-4">
                    {hours.map((day, i) => (
                      <div key={i}>
                        <p className="text-sm font-semibold">
                          {day.day || "Daily"}
                        </p>
                        <div className="mt-1.5 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                          <span>Working Hours</span>
                          <span className="rounded-full bg-field px-2.5 py-1 font-medium text-foreground">
                            {day.working_hours_start} – {day.working_hours_end}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
