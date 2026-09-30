"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import * as z from "zod";
import { Trash2, Bus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { CommuteRouteDto } from "@/lib/services/colleges.service";

const commuteTabSchema = z.object({
  summary: z.string().optional(),
  routeIds: z.array(z.string()).optional(),
});

type CommuteTabData = z.infer<typeof commuteTabSchema>;

function routeMeta(route: CommuteRouteDto): string {
  const pickupStops = route.stops.filter((s) => s.isPickupPoint !== false);
  return `${pickupStops.length} pickup stop${pickupStops.length === 1 ? "" : "s"} · ${route.buses.length} bus${route.buses.length === 1 ? "" : "es"}`;
}

function LinkedRoutesEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 bg-muted/20 py-8 text-center">
      <Bus className="h-6 w-6 text-muted-foreground/40" />
      <span className="text-xs text-muted-foreground max-w-xs">
        No routes linked — the Commute tab stays hidden on this course&apos;s
        page. Select a route above to offer commute.
      </span>
    </div>
  );
}

export function CommuteTab({
  payload,
  onChange,
  routes,
}: {
  payload: any;
  onChange: (updates: any) => void;
  routes: CommuteRouteDto[];
}) {
  const [unlinkTarget, setUnlinkTarget] = useState<string | null>(null);

  const { register, watch, setValue } = useForm<CommuteTabData>({
    resolver: zodResolver(commuteTabSchema as any),
    defaultValues: payload,
  });

  useEffect(() => {
    const subscription = watch((value) => onChange(value));
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  const linkedIds: string[] = watch("routeIds") || [];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Commute Summary</Label>
        <Textarea
          placeholder="Describe pickup coverage, timings, or transport notes for this course..."
          {...register("summary")}
        />
      </div>

      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold">Linked Routes</CardTitle>
          <CardDescription>
            Optional. Select which of the college&apos;s bus routes apply to
            students of this course.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {routes.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No routes added yet &mdash; add one under Commute first.
            </p>
          ) : (
            <div className="space-y-2">
              {routes.map((route) => {
                const isLinked = linkedIds.includes(route.id);
                return (
                  <label
                    key={route.id}
                    className="flex items-center gap-3 border p-3 rounded-lg bg-muted/5 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={isLinked}
                      onChange={() => {
                        const next = isLinked
                          ? linkedIds.filter((id) => id !== route.id)
                          : [...linkedIds, route.id];
                        setValue("routeIds", next, { shouldDirty: true });
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold break-words">
                        {route.name}
                        {route.isVerified && (
                          <Badge
                            variant="outline"
                            className="ml-2 h-4 px-1 text-[9px] align-middle"
                          >
                            Verified
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {routeMeta(route)}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold">Currently Linked</CardTitle>
          <CardDescription>
            Routes currently shown on this course&apos;s Commute tab.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {linkedIds.length === 0 ? (
            <LinkedRoutesEmptyState />
          ) : (
            <div className="space-y-2">
              {linkedIds.map((routeId: string) => {
                const route = routes.find((r) => r.id === routeId);
                if (!route) return null;
                return (
                  <div
                    key={routeId}
                    className="flex items-center justify-between gap-2 border p-3 rounded-lg bg-muted/5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold break-words">
                        {route.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {routeMeta(route)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => setUnlinkTarget(routeId)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={unlinkTarget !== null}
        title="Unlink Route"
        description="Remove this route from the course? You can link it again later."
        confirmLabel="Unlink"
        variant="destructive"
        onCancel={() => setUnlinkTarget(null)}
        onConfirm={() => {
          if (!unlinkTarget) return;
          setValue(
            "routeIds",
            linkedIds.filter((id) => id !== unlinkTarget),
            { shouldDirty: true },
          );
          setUnlinkTarget(null);
        }}
      />
    </div>
  );
}
