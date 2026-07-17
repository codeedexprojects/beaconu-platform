import Image from "next/image";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PublicHostelListItemFromCourseTab } from "@beaconu/types";

interface StudentHousingSectionProps {
  summary?: string;
  hostels: PublicHostelListItemFromCourseTab[];
  subdomain: string;
}

export function StudentHousingSection({
  summary,
  hostels,
  subdomain,
}: StudentHousingSectionProps) {
  if (hostels.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-muted-foreground sm:px-6">
        Student housing details aren&apos;t available yet.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h2 className="text-xl font-bold tracking-tight">Student Housing</h2>
      {summary ? (
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          {summary}
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {hostels.map((hostel) => (
          <Link
            key={hostel.id}
            href={`/college/${subdomain}/hostels/${hostel.id}`}
            className="overflow-hidden rounded-2xl border border-border/60 transition-colors hover:border-foreground/30"
          >
            <div className="relative h-32 w-full bg-muted">
              {hostel.coverImageUrl ? (
                <Image
                  src={hostel.coverImageUrl}
                  alt={hostel.name ?? "Hostel"}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="p-4">
              <p className="truncate text-sm font-semibold">{hostel.name}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {hostel.hostelType ? (
                  <Badge variant="secondary" className="capitalize">
                    {hostel.hostelType}
                  </Badge>
                ) : null}
                <Badge variant="outline">
                  {hostel.isOnCampus ? "On-Campus" : "Off-Campus"}
                </Badge>
              </div>
              {(hostel.roomTypes?.length ?? 0) > 0 ? (
                <div className="mt-3 space-y-1 border-t border-border/60 pt-3">
                  {hostel.roomTypes?.map((rt, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-muted-foreground">{rt.name}</span>
                      <span className="font-medium">
                        ₹{rt.monthlyPlanPrice?.toLocaleString()}/mo
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
