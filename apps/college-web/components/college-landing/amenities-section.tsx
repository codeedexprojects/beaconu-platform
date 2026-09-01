import Image from "next/image";
import { Building2 } from "lucide-react";
import type { PublicCollegeOverviewFacility } from "@beaconu/types";

interface AmenitiesSectionProps {
  facilities: PublicCollegeOverviewFacility[];
  locationText?: string;
  view360Url?: string | null;
}

function FacilityCard({
  facility,
  large,
}: {
  facility: PublicCollegeOverviewFacility;
  large?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-muted ${large ? "h-full min-h-[280px]" : "h-40"}`}
    >
      {facility.image ? (
        <Image
          src={facility.image}
          alt={facility.label ?? "Facility"}
          fill
          sizes={large ? "50vw" : "(min-width: 640px) 33vw, 50vw"}
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/60">
          <Building2 className="h-10 w-10 text-muted-foreground/40" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <p
          className={`font-bold text-white ${large ? "text-2xl" : "text-base"}`}
        >
          {facility.label}
        </p>
        {facility.subtitle ? (
          <p
            className={`mt-0.5 uppercase tracking-wide text-white/80 ${large ? "text-xs" : "text-[10px]"}`}
          >
            {facility.subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function AmenitiesSection({ facilities }: AmenitiesSectionProps) {
  if (facilities.length === 0) return null;

  const [featured, ...rest] = facilities;
  const smallFacilities = rest.slice(0, 3);

  return (
    <section id="campus" className="bg-muted/40 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-headerTeal">
          <span className="h-px w-6 bg-headerTeal" />
          Explore Our Campus
        </p>
        <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
          Facilities at a Glance
        </h2>

        {facilities.length > 0 ? (
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {featured ? <FacilityCard facility={featured} large /> : null}
            {smallFacilities.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {smallFacilities.map((facility, i) => (
                  <FacilityCard
                    key={`${facility.label}-${i}`}
                    facility={facility}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {/* <div className="relative mt-6 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
          <div className="absolute inset-0 bg-black/45" />
          <div className="relative flex flex-col items-center px-6 py-16 text-center">
            <h3 className="text-2xl font-bold text-white sm:text-3xl">
              Experience Our Campus
            </h3>
            <p className="mt-3 max-w-lg text-sm text-white/80">
              Take a virtual walk through our lush green campus, modern academic
              blocks, and historic structures
              {locationText
                ? ` nestled in the serene landscape of ${locationText}.`
                : "."}
            </p>
            {view360Url ? (
              <a
                href={view360Url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-white/90"
              >
                Start Virtual Tour
              </a>
            ) : null}
          </div>
        </div> */}
      </div>
    </section>
  );
}
