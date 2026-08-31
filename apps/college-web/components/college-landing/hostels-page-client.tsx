"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Bed, Building2, MapPin, Star, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublicHostelSummary } from "@beaconu/types";

interface HostelsPageClientProps {
  subdomain: string;
  hostels: PublicHostelSummary[];
}

type FilterValue =
  | "all"
  | "on-campus"
  | "off-campus"
  | "boys"
  | "girls"
  | "co-ed";

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: "All", value: "all" },
  { label: "On-Campus", value: "on-campus" },
  { label: "Off-Campus", value: "off-campus" },
  { label: "Boys", value: "boys" },
  { label: "Girls", value: "girls" },
];

function matchesFilter(
  hostel: PublicHostelSummary,
  filter: FilterValue,
): boolean {
  switch (filter) {
    case "all":
      return true;
    case "on-campus":
      return hostel.isOnCampus;
    case "off-campus":
      return !hostel.isOnCampus;
    case "boys":
      return hostel.hostelType === "boys";
    case "girls":
      return hostel.hostelType === "girls";
    case "co-ed":
      return hostel.hostelType === "co-ed";
    default:
      return true;
  }
}

export function HostelsPageClient({
  subdomain,
  hostels,
}: HostelsPageClientProps) {
  const [filter, setFilter] = useState<FilterValue>("all");

  const filtered = useMemo(
    () => hostels.filter((hostel) => matchesFilter(hostel, filter)),
    [hostels, filter],
  );

  return (
    <>
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
            <Building2 className="h-7 w-7" />
            Hostels &amp; Accommodation
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  filter === item.value
                    ? "bg-headerTeal-dark text-white"
                    : "border border-border/60 bg-white text-foreground hover:bg-field",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Showing {filtered.length} result{filtered.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="mt-6 border-t border-border/60 pt-6">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hostels match this filter.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {filtered.map((hostel) => (
                <div
                  key={hostel.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm"
                >
                  <div className="relative h-52 w-full bg-muted">
                    {hostel.coverImageUrl ? (
                      <Image
                        src={hostel.coverImageUrl}
                        alt={hostel.name}
                        fill
                        sizes="(min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Building2 className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute left-3 top-3 flex gap-1.5">
                      <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase text-foreground shadow-sm">
                        {hostel.hostelType === "co-ed"
                          ? "Co-Ed"
                          : hostel.hostelType}
                      </span>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 shadow-sm">
                        {hostel.isOnCampus ? "On-Campus" : "Off-Campus"}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-lg font-bold">{hostel.name}</p>
                      {hostel.avgRating > 0 ? (
                        <span className="flex shrink-0 items-center gap-1 text-sm font-semibold">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          {hostel.avgRating}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-y-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Bed className="h-4 w-4" />
                        {hostel.totalBeds
                          ? `${hostel.totalBeds} Beds`
                          : "Beds not listed"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {hostel.isOnCampus
                          ? "In Campus"
                          : hostel.distanceFromCampus || "Distance not listed"}
                      </span>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-4">
                      {hostel.reviewCount > 0 ? (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Wifi className="h-3.5 w-3.5" />
                          {hostel.reviewCount} review
                          {hostel.reviewCount === 1 ? "" : "s"}
                        </span>
                      ) : (
                        <span />
                      )}
                      <Link
                        href={`/college/${subdomain}/hostels/${hostel.id}`}
                        className="rounded-full border border-headerTeal-dark px-5 py-1.5 text-sm font-semibold text-headerTeal-dark hover:bg-headerTeal-dark hover:text-white"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
