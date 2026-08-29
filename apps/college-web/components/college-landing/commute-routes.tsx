"use client";

import { useState } from "react";
import { Bus, ChevronDown, MapPin, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  PublicCommutePickupPoint,
  PublicCommuteRoute,
} from "@beaconu/types";

interface CommuteRoutesProps {
  routes: PublicCommuteRoute[];
}

function routeBadge(routeName: string | undefined, index: number): string {
  const match = routeName?.match(/\d+/);
  return match ? `R${match[0]}` : `R${index + 1}`;
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
    <div className="mt-6 space-y-6">
      {routes.map((route, index) => {
        const isOpen = openIndex === index;
        const hasDetail =
          (route.morning_pickup_points?.length ?? 0) > 0 ||
          (route.evening_dropoff_points?.length ?? 0) > 0;
        const morningTiming = route.timings?.find((t) =>
          t.label?.toLowerCase().includes("morning"),
        );
        const eveningTiming = route.timings?.find((t) =>
          t.label?.toLowerCase().includes("evening"),
        );

        return (
          <div
            key={`${route.route_name}-${index}`}
            className="overflow-hidden rounded-2xl bg-white shadow-sm"
          >
            <div className="flex flex-wrap items-start gap-4 p-5">
              <div className="flex shrink-0 flex-col items-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-b from-headerTeal to-headerTeal-dark text-sm font-semibold text-white">
                  {routeBadge(route.route_name, index)}
                </span>
                {hasDetail ? (
                  <span className="mt-1 flex flex-col items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full border-2 border-border" />
                    <span className="h-4 w-px border-l border-dashed border-border" />
                    <span className="h-2.5 w-2.5 rounded-full border-2 border-border" />
                  </span>
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
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
                          {route.status === "VERIFIED"
                            ? "Verified"
                            : "Unverified"}
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
                      <p className="mt-1 text-sm">
                        <span className="text-headerTeal">Pickup: </span>
                        <span className="text-muted-foreground">
                          {route.pickup_point}
                        </span>
                      </p>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {route.transport_fee?.amount ? (
                      <p className="text-sm font-semibold text-headerTeal">
                        {route.transport_fee.amount}
                        {route.transport_fee.payment_structure ? (
                          <span className="ml-1 text-xs font-normal text-muted-foreground">
                            / {route.transport_fee.payment_structure}
                          </span>
                        ) : null}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      className="flex items-center gap-1 rounded-full border border-headerTeal-dark px-3.5 py-1 text-xs font-medium text-headerTeal-dark hover:bg-headerTeal-dark/5"
                    >
                      View Details
                      <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </div>

                {morningTiming || eveningTiming || route.bus_information ? (
                  <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl bg-field px-4 py-3 text-sm">
                    {morningTiming ? (
                      <span className="flex items-center gap-1.5">
                        <Sun className="h-4 w-4 text-amber-500" />
                        <span className="text-muted-foreground">
                          {morningTiming.time || "—"}
                        </span>
                      </span>
                    ) : null}
                    {eveningTiming ? (
                      <span className="flex items-center gap-1.5">
                        <Moon className="h-4 w-4 text-indigo-400" />
                        <span className="text-muted-foreground">
                          {eveningTiming.time || "—"}
                        </span>
                      </span>
                    ) : null}
                    {route.bus_information?.registration_number ? (
                      <span className="flex items-center gap-1.5">
                        <Bus className="h-4 w-4 text-headerTeal" />
                        <span className="text-muted-foreground">
                          {route.bus_information.registration_number}
                          {route.bus_information.model
                            ? ` · ${route.bus_information.model}`
                            : ""}
                          {route.bus_information.seats
                            ? ` · ${route.bus_information.seats} seats`
                            : ""}
                        </span>
                      </span>
                    ) : null}
                  </div>
                ) : null}

                {hasDetail ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="mt-3 flex w-full items-center justify-between gap-2 border-t border-border/60 pt-3 text-left text-sm text-muted-foreground"
                    >
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {isOpen ? "Hide stops" : "View pickup & drop-off stops"}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 shrink-0 transition-transform",
                          isOpen && "rotate-180",
                        )}
                      />
                    </button>
                    {isOpen ? (
                      <div className="grid gap-6 border-t border-border/60 pt-4 sm:grid-cols-2">
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
            </div>
          </div>
        );
      })}
    </div>
  );
}
