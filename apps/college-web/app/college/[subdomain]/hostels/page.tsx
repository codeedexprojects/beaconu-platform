import Link from "next/link";
import { Building2, MapPin, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { hostelsService } from "@/lib/services/hostels.service";

interface HostelsListPageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function HostelsListPage({
  params,
}: HostelsListPageProps) {
  const { subdomain } = await params;
  const hostels = await hostelsService.list(subdomain).catch(() => []);

  return (
    <div className="min-h-screen bg-[#fcfbf7] text-[#1b1b1b] [font-family:Poppins,ui-sans-serif,system-ui]">
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[#1A2B44]">Student Housing</h1>
        <p className="mt-2 text-slate-600">
          Explore on-campus and off-campus hostel options.
        </p>

        {hostels.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-orange-200 bg-white p-8 text-center text-slate-500">
            Hostel listings will be published soon.
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {hostels.map((hostel) => (
              <Link
                key={hostel.id}
                href={`/college/${subdomain}/hostels/${hostel.id}`}
                className="rounded-3xl border border-[#ffd9bf] bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition hover:shadow-md"
              >
                <div className="mb-3 flex h-32 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                  {hostel.coverImageUrl ? (
                    <img
                      src={hostel.coverImageUrl}
                      alt={hostel.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Building2 className="h-10 w-10 text-slate-400" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-[#1A2B44]">
                    {hostel.name}
                  </h3>
                  <Badge className="rounded-full bg-[#04162E0D] px-3 py-1 text-xs font-semibold text-[#1A2B44] hover:bg-[#04162E0D]">
                    {hostel.hostelType}
                  </Badge>
                </div>
                <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {hostel.isOnCampus
                    ? "On-Campus"
                    : `Off-Campus${hostel.distanceFromCampus ? ` (${hostel.distanceFromCampus})` : ""}`}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>{hostel.totalBeds ?? 0} beds</span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-amber-500" />
                    {hostel.avgRating.toFixed(1)} ({hostel.reviewCount})
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
