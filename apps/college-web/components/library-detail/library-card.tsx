import Image from "next/image";
import { BookOpen, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PublicLibrary } from "@beaconu/types";

interface LibraryCardProps {
  library: PublicLibrary;
}

export function LibraryCard({ library }: LibraryCardProps) {
  const stats = library.stats ?? [];
  const resources = library.availableResources?.items ?? [];
  const hours = library.libraryHours?.days ?? [];
  const facilities = library.facilities?.items ?? [];

  return (
    <div className="rounded-2xl border border-border/60 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <BookOpen className="h-5 w-5" />
          {library.name}
        </h3>
        {library.type ? (
          <Badge variant="secondary" className="capitalize">
            {library.type}
          </Badge>
        ) : null}
      </div>

      {stats.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat, i) => (
            <div key={i} className="rounded-xl bg-muted/60 p-3 text-center">
              <p className="text-lg font-bold tracking-tight">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-5 grid gap-6 sm:grid-cols-2">
        {resources.length > 0 ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Available Resources
            </p>
            <div className="mt-2 space-y-1.5">
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
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Hours
            </p>
            <div className="mt-2 space-y-1.5">
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
        <div className="mt-5 border-t border-border/60 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
                  className="flex h-20 items-center justify-center rounded-xl bg-muted p-2 text-center text-xs text-muted-foreground"
                >
                  {facility.name}
                </span>
              ),
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
