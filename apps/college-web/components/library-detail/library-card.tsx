import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock } from "lucide-react";
import type { PublicLibrary } from "@beaconu/types";

interface LibraryCardProps {
  library: PublicLibrary;
  subdomain: string;
}

export function LibraryCard({ library, subdomain }: LibraryCardProps) {
  const stats = library.stats ?? [];
  const resources = library.availableResources?.items ?? [];
  const hours = library.libraryHours?.days ?? [];
  const facilities = library.facilities?.items ?? [];

  return (
    <div className="pb-16">
      <div className="bg-headerTeal-dark py-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/college/${subdomain}/libraries`}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="Back to libraries"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-white sm:text-2xl">
              <BookOpen className="h-6 w-6" />
              {library.name}
            </h1>
          </div>
          {library.type ? (
            <span className="rounded-full bg-white/15 px-3.5 py-1.5 text-sm font-medium capitalize text-white">
              {library.type}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6">
        {stats.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={i} className="rounded-xl bg-field p-3 text-center">
                <p className="text-lg font-bold tracking-tight text-headerTeal-dark">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {resources.length > 0 ? (
            <div className="rounded-2xl bg-field p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-headerTeal">
                Available Resources
              </p>
              <div className="mt-3 space-y-1.5">
                {resources.map((res, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{res.name}</span>
                    <span className="font-medium">{res.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {hours.length > 0 ? (
            <div className="rounded-2xl bg-field p-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-headerTeal">
                <Clock className="h-3.5 w-3.5" />
                Hours
              </p>
              <div className="mt-3 space-y-1.5">
                {hours.map((day, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{day.day || "Daily"}</span>
                    <span className="text-muted-foreground">
                      {day.working_hours_start} – {day.working_hours_end}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {facilities.length > 0 ? (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-headerTeal">
              Facilities
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {facilities.map((facility, i) =>
                facility.image?.startsWith("http") ? (
                  <div key={i} className="overflow-hidden rounded-xl">
                    <div className="relative h-20 w-full bg-muted">
                      <Image
                        src={facility.image}
                        alt={facility.name ?? "Facility"}
                        fill
                        sizes="150px"
                        className="object-cover"
                      />
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {facility.name}
                    </p>
                  </div>
                ) : (
                  <span
                    key={i}
                    className="flex h-20 items-center justify-center rounded-xl bg-field p-2 text-center text-xs text-muted-foreground"
                  >
                    {facility.name}
                  </span>
                ),
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
