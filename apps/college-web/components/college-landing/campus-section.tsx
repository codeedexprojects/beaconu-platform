import { Building2, MapPin, Navigation } from "lucide-react";
import type {
  PublicCampusSummary,
  PublicCollegeOverviewLocation,
  PublicCollegeOverviewNearbyAccessGroup,
} from "@beaconu/types";

interface CampusSectionProps {
  campuses: PublicCampusSummary[];
  location?: PublicCollegeOverviewLocation;
  nearbyAccess: PublicCollegeOverviewNearbyAccessGroup[];
}

export function CampusSection({
  campuses,
  location,
  nearbyAccess,
}: CampusSectionProps) {
  if (campuses.length === 0 && !location?.address && nearbyAccess.length === 0)
    return null;

  return (
    <section id="campus" className="bg-muted/40 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Campuses & Location
        </h2>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {campuses.length > 0 ? (
            <div className="space-y-3">
              {campuses.map((campus) => (
                <div
                  key={campus.id}
                  className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background p-4"
                >
                  <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-semibold">
                      {campus.name}
                      {campus.isMainCampus ? (
                        <span className="ml-2 rounded-full bg-foreground/5 px-2 py-0.5 text-xs font-normal text-muted-foreground">
                          Main Campus
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {[campus.address, campus.city, campus.state]
                        .filter(Boolean)
                        .join(", ") || "Location details pending"}
                    </p>
                  </div>
                </div>
              ))}

              {location?.address ? (
                <a
                  href={location.map_link || undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background p-4 hover:border-foreground/30"
                >
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {location.address}
                  </p>
                </a>
              ) : null}
            </div>
          ) : null}

          {nearbyAccess.length > 0 ? (
            <div className="space-y-5">
              {nearbyAccess.map((group, i) => (
                <div key={`${group.category}-${i}`}>
                  <p className="flex items-center gap-1.5 text-sm font-semibold">
                    <Navigation className="h-4 w-4 text-muted-foreground" />
                    {group.category}
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {(group.items ?? []).map((item, j) => (
                      <li
                        key={`${item.name}-${j}`}
                        className="flex items-center justify-between text-sm text-muted-foreground"
                      >
                        <span>{item.name}</span>
                        <span>{item.distance}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
