import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import type {
  PublicCollegeOverviewAmenity,
  PublicCollegeOverviewFacility,
} from "@beaconu/types";

interface AmenitiesSectionProps {
  amenities: PublicCollegeOverviewAmenity[];
  facilities: PublicCollegeOverviewFacility[];
}

export function AmenitiesSection({
  amenities,
  facilities,
}: AmenitiesSectionProps) {
  if (amenities.length === 0 && facilities.length === 0) return null;

  return (
    <section id="campus-life" className="bg-muted/40 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Campus Life & Amenities
        </h2>

        {amenities.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-2.5">
            {amenities.map((amenity, i) => (
              <span
                key={`${amenity.label}-${i}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-3.5 py-1.5 text-sm"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-foreground/70" />
                {amenity.label}
              </span>
            ))}
          </div>
        ) : null}

        {facilities.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {facilities.map((facility, i) => (
              <div
                key={`${facility.label}-${i}`}
                className="overflow-hidden rounded-2xl border border-border/60 bg-background"
              >
                {facility.image ? (
                  <div className="relative h-36 w-full">
                    <Image
                      src={facility.image}
                      alt={facility.label ?? "Facility"}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                ) : null}
                <div className="p-4">
                  <p className="text-sm font-semibold">{facility.label}</p>
                  {facility.subtitle ? (
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {facility.subtitle}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
