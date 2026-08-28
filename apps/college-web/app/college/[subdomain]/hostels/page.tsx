import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Building2, MapPin, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { getHostels } from "@/lib/services/public-hostel.service";

interface HostelsPageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function HostelsPage({ params }: HostelsPageProps) {
  const { subdomain } = await params;

  const hostels = await getHostels(subdomain).catch(() => []);

  return (
    <div className="pb-16">
      <div className="bg-headerTeal-dark py-6">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link
            href={`/college/${subdomain}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Back to college page"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-white sm:text-2xl">
            <Building2 className="h-6 w-6" />
            Hostels &amp; Accommodation
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
        {hostels.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hostels are listed for this college yet.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hostels.map((hostel) => (
              <Link
                key={hostel.id}
                href={`/college/${subdomain}/hostels/${hostel.id}`}
                className="overflow-hidden rounded-2xl bg-field transition-colors hover:bg-field-focus"
              >
                <div className="relative h-40 w-full bg-muted">
                  {hostel.coverImageUrl ? (
                    <Image
                      src={hostel.coverImageUrl}
                      alt={hostel.name}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">
                      {hostel.name}
                    </p>
                    {hostel.avgRating > 0 ? (
                      <span className="flex shrink-0 items-center gap-1 text-xs">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {hostel.avgRating}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span
                      className={cn(
                        "rounded-full bg-headerTeal-dark px-2.5 py-0.5 text-xs font-medium capitalize text-white",
                      )}
                    >
                      {hostel.hostelType}
                    </span>
                    <span className="rounded-full bg-background px-2.5 py-0.5 text-xs font-medium text-foreground">
                      {hostel.isOnCampus ? "On-Campus" : "Off-Campus"}
                    </span>
                  </div>
                  <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {hostel.isOnCampus
                      ? `${hostel.totalBeds ?? "—"} beds`
                      : hostel.distanceFromCampus || "Distance not listed"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
