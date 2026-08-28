"use client";

import { useState } from "react";
import { Bus, ChevronDown, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  PublicCommutePickupPoint,
  PublicCommuteRoute,
} from "@beaconu/types";

interface CommuteRoutesProps {
  routes: PublicCommuteRoute[];
}

function PickupPointList({
  title,
  points,
}: {
  title: string;
  points: PublicCommutePickupPoint[];
}) {
  if (points.length === 0) return null;

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <ul className="mt-2 space-y-1.5">
        {points.map((point, i) => (
          <li
            key={`${point.point}-${i}`}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="min-w-0">
              <span className="font-medium">{point.point || "—"}</span>
              {point.landmark ? (
                <span className="text-muted-foreground">
                  {" "}
                  · {point.landmark}
                </span>
              ) : null}
            </span>
            {point.time ? (
              <span className="shrink-0 text-muted-foreground">
                {point.time}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CommuteRoutes({ routes }: CommuteRoutesProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mt-6 space-y-3">
      {routes.map((route, index) => {
        const isOpen = openIndex === index;
        const hasDetail =
          (route.morning_pickup_points?.length ?? 0) > 0 ||
          (route.evening_dropoff_points?.length ?? 0) > 0;

        return (
          <div
            key={`${route.route_name}-${index}`}
            className="overflow-hidden rounded-2xl border border-border/60"
          >
            <div className="flex flex-wrap items-start justify-between gap-3 p-5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold">
                    {route.route_name || "Route"}
                  </p>
                  {route.status ? (
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        route.status === "VERIFIED"
                          ? "bg-headerTeal-dark text-white"
                          : "bg-field text-muted-foreground",
                      )}
                    >
                      {route.status === "VERIFIED" ? "Verified" : "Unverified"}
                    </span>
                  ) : null}
                </div>
                {route.via ? (
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {route.via}
                  </p>
                ) : null}
                {route.pickup_point ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Pickup: {route.pickup_point}
                  </p>
                ) : null}
              </div>

              {route.transport_fee?.amount ? (
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {route.transport_fee.amount}
                  </p>
                  {route.transport_fee.payment_structure ? (
                    <p className="text-xs text-muted-foreground">
                      {route.transport_fee.payment_structure}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            {(route.timings?.length ?? 0) > 0 ||
            route.bus_information?.registration_number ? (
              <div className="flex flex-wrap items-center gap-4 border-t border-border/60 px-5 py-3 text-sm text-muted-foreground">
                {route.timings?.map((timing, i) => (
                  <span key={`${timing.label}-${i}`}>
                    {timing.label}: {timing.time || "—"}
                  </span>
                ))}
                {route.bus_information?.registration_number ? (
                  <span className="flex items-center gap-1.5">
                    <Bus className="h-3.5 w-3.5" />
                    {route.bus_information.registration_number}
                    {route.bus_information.model
                      ? ` · ${route.bus_information.model}`
                      : ""}
                    {route.bus_information.seats
                      ? ` · ${route.bus_information.seats} seats`
                      : ""}
                  </span>
                ) : null}
              </div>
            ) : null}

            {hasDetail ? (
              <>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-2 border-t border-border/60 px-5 py-3 text-left text-sm text-muted-foreground"
                >
                  {isOpen ? "Hide stops" : "View pickup & drop-off stops"}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
                {isOpen ? (
                  <div className="grid gap-6 border-t border-border/60 px-5 py-4 sm:grid-cols-2">
                    <PickupPointList
                      title="Morning Pickup"
                      points={route.morning_pickup_points ?? []}
                    />
                    <PickupPointList
                      title="Evening Drop-off"
                      points={route.evening_dropoff_points ?? []}
                    />
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
