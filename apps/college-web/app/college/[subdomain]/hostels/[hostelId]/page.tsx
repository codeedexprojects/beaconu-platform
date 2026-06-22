import { notFound } from "next/navigation";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Star,
  Utensils,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { hostelsService } from "@/lib/services/hostels.service";

interface HostelDetailPageProps {
  params: Promise<{ subdomain: string; hostelId: string }>;
}

export default async function HostelDetailPage({
  params,
}: HostelDetailPageProps) {
  const { subdomain, hostelId } = await params;

  let hostel;
  try {
    hostel = await hostelsService.getById(subdomain, hostelId);
  } catch {
    notFound();
  }

  const addonsByType = (hostel.addonServices || []).reduce<
    Record<string, typeof hostel.addonServices>
  >((acc, service) => {
    acc[service.serviceType] = [...(acc[service.serviceType] || []), service];
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#fcfbf7] text-[#1b1b1b] [font-family:Poppins,ui-sans-serif,system-ui]">
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-200">
          {hostel.coverImageUrl ? (
            <img
              src={hostel.coverImageUrl}
              alt={hostel.name}
              className="h-64 w-full object-cover"
            />
          ) : (
            <div className="flex h-64 w-full items-center justify-center bg-gradient-to-r from-[#182848] to-[#4b6cb7]">
              <Building2 className="h-12 w-12 text-white/70" />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1A2B44]">{hostel.name}</h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
              <MapPin className="h-4 w-4" />
              {hostel.isOnCampus
                ? "On-Campus"
                : `Off-Campus${hostel.distanceFromCampus ? ` (${hostel.distanceFromCampus})` : ""}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="rounded-full bg-[#04162E0D] px-4 py-2 text-sm font-semibold text-[#1A2B44] hover:bg-[#04162E0D]">
              {hostel.hostelType}
            </Badge>
            <span className="flex items-center gap-1 text-sm font-semibold text-slate-700">
              <Star className="h-4 w-4 text-amber-500" />
              {hostel.avgRating.toFixed(1)} ({hostel.reviewCount} reviews)
            </span>
          </div>
        </div>

        {hostel.description && (
          <p className="text-base leading-7 text-slate-600">
            {hostel.description}
          </p>
        )}

        {/* Room types */}
        {hostel.roomTypes.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-[#1A2B44]">Room Types</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {hostel.roomTypes.map((room) => (
                <div
                  key={room.id}
                  className="rounded-3xl border border-[#edeeef] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
                >
                  <h3 className="font-semibold text-[#1A2B44]">{room.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {room.availableBeds} of {room.totalBeds} beds available
                  </p>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    {room.annualPlanPrice != null && (
                      <span className="font-bold text-[#0031E3]">
                        ₹{room.annualPlanPrice}/yr
                      </span>
                    )}
                    {room.monthlyPlanPrice != null && (
                      <span className="text-slate-500">
                        ₹{room.monthlyPlanPrice}/mo
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Mess plans */}
        {hostel.messPlans.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-[#1A2B44] flex items-center gap-2">
              <Utensils className="h-6 w-6 text-[#f97316]" /> Mess Plans
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {hostel.messPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="rounded-3xl border border-[#edeeef] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
                >
                  <h3 className="font-semibold text-[#1A2B44]">{plan.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {plan.mealsIncluded.join(", ")}
                  </p>
                  <p className="mt-3 font-bold text-[#0031E3]">
                    ₹{plan.priceMonthly}/mo
                    {plan.isCompulsory && (
                      <span className="ml-2 text-xs font-normal text-slate-500">
                        (Compulsory)
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Addon services grouped by type */}
        {Object.keys(addonsByType).length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-[#1A2B44] flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-[#f97316]" /> Addon Charges
            </h2>
            <div className="mt-4 space-y-6">
              {Object.entries(addonsByType).map(([type, services]) => (
                <div key={type}>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    {type} Charges
                  </h3>
                  <div className="mt-2 grid gap-3 md:grid-cols-2">
                    {services!.map((service) => (
                      <div
                        key={service.id}
                        className="rounded-2xl border border-[#edeeef] bg-white p-4"
                      >
                        <p className="font-semibold text-[#1A2B44]">
                          {service.name}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {service.plans
                            .map((p) => `${p.label}: ₹${p.price}`)
                            .join(", ")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Amenities */}
        {hostel.amenities.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-[#1A2B44]">Amenities</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {hostel.amenities.map((amenity, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="rounded-full border-orange-200 bg-white px-4 py-2 text-orange-600"
                >
                  {amenity.name}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {/* Rules */}
        {hostel.rules.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-[#1A2B44] flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-[#f97316]" /> Hostel Rules
            </h2>
            <div className="mt-4 space-y-3">
              {hostel.rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#edeeef] bg-white p-4"
                >
                  <p className="font-semibold text-[#1A2B44]">{rule.title}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {rule.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Warden + location */}
        <div className="grid gap-6 md:grid-cols-2">
          {(hostel.wardenInfo?.name || hostel.wardenInfo?.phone) && (
            <div className="rounded-3xl border border-[#edeeef] bg-white p-6">
              <h3 className="text-lg font-semibold text-[#1A2B44]">
                Warden Contact
              </h3>
              {hostel.wardenInfo?.name && (
                <p className="mt-2 text-sm text-slate-600">
                  {hostel.wardenInfo.name}
                </p>
              )}
              {hostel.wardenInfo?.phone && (
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="h-4 w-4" /> {hostel.wardenInfo.phone}
                </p>
              )}
              {hostel.wardenInfo?.email && (
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="h-4 w-4" /> {hostel.wardenInfo.email}
                </p>
              )}
            </div>
          )}

          {hostel.locationInfo?.address && (
            <div className="rounded-3xl border border-[#edeeef] bg-white p-6">
              <h3 className="text-lg font-semibold text-[#1A2B44]">Location</h3>
              <p className="mt-2 text-sm text-slate-600">
                {hostel.locationInfo.address}
              </p>
              {(hostel.locationInfo.nearbyEssentials || []).map((ne, idx) => (
                <p key={idx} className="mt-1 text-xs text-slate-500">
                  {ne.type}: {ne.name} ({ne.distance})
                </p>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
