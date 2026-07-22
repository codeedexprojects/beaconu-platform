import Image from "next/image";
import Link from "next/link";
import { Building2, MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getHostels } from "@/lib/services/public-hostel.service";

interface HostelsPageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function HostelsPage({ params }: HostelsPageProps) {
  const { subdomain } = await params;

  const hostels = await getHostels(subdomain).catch(() => []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        Hostels & Accommodation
      </h1>

      {hostels.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          No hostels are listed for this college yet.
        </p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hostels.map((hostel) => (
            <Link
              key={hostel.id}
              href={`/college/${subdomain}/hostels/${hostel.id}`}
              className="overflow-hidden rounded-2xl border border-border/60 transition-colors hover:border-foreground/30"
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
                  <Badge variant="secondary" className="capitalize">
                    {hostel.hostelType}
                  </Badge>
                  <Badge variant="outline">
                    {hostel.isOnCampus ? "On-Campus" : "Off-Campus"}
                  </Badge>
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
  );
}
