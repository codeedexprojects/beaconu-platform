"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import * as z from "zod";
import { Trash2, Home } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const studentHousingTabSchema = z.object({
  summary: z.string().optional(),
  hostelIds: z.array(z.string()).optional(),
});

type StudentHousingTabData = z.infer<typeof studentHousingTabSchema>;

function LinkedHostelsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 bg-muted/20 py-8 text-center">
      <Home className="h-6 w-6 text-muted-foreground/40" />
      <span className="text-xs text-muted-foreground max-w-xs">
        No hostels linked yet — select one above to add it here.
      </span>
    </div>
  );
}

export function StudentHousingTab({
  payload,
  onChange,
  hostels,
}: {
  payload: any;
  onChange: (updates: any) => void;
  hostels: any[];
}) {
  const [unlinkTarget, setUnlinkTarget] = useState<string | null>(null);

  const { register, watch, setValue } = useForm<StudentHousingTabData>({
    resolver: zodResolver(studentHousingTabSchema as any),
    values: payload,
  });

  useEffect(() => {
    const subscription = watch((value) => onChange(value));
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  const linkedIds: string[] = watch("hostelIds") || [];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Hostel & Housing Summary</Label>
        <Textarea
          placeholder="Describe AC/Non-AC hostel rooms, food facilities..."
          {...register("summary")}
        />
      </div>

      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold">Linked Hostels</CardTitle>
          <CardDescription>
            Select which of the college&apos;s hostels apply to students of this
            course.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {hostels.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No hostels added yet &mdash; add one under Setup &rarr; Hostels
              first.
            </p>
          ) : (
            <div className="space-y-2">
              {hostels.map((hostel) => {
                const isLinked = linkedIds.includes(hostel.id);
                return (
                  <label
                    key={hostel.id}
                    className="flex items-center gap-3 border p-3 rounded-lg bg-muted/5 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={isLinked}
                      onChange={() => {
                        const next = isLinked
                          ? linkedIds.filter((id) => id !== hostel.id)
                          : [...linkedIds, hostel.id];
                        setValue("hostelIds", next, { shouldDirty: true });
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{hostel.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {hostel.hostelType} &middot; {hostel.totalBeds} beds
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
            Hostels currently shown on this course&apos;s Student Housing tab.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {linkedIds.length === 0 ? (
            <LinkedHostelsEmptyState />
          ) : (
            <div className="space-y-2">
              {linkedIds.map((hostelId: string) => {
                const hostel = hostels.find((h) => h.id === hostelId);
                if (!hostel) return null;
                return (
                  <div
                    key={hostelId}
                    className="flex items-center justify-between border p-3 rounded-lg bg-muted/5"
                  >
                    <div>
                      <p className="text-sm font-semibold">{hostel.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {hostel.hostelType} &middot; {hostel.totalBeds} beds
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setUnlinkTarget(hostelId)}
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
        title="Unlink Hostel"
        description="Remove this hostel from the course? This cannot be undone."
        confirmLabel="Unlink"
        variant="destructive"
        onCancel={() => setUnlinkTarget(null)}
        onConfirm={() => {
          if (!unlinkTarget) return;
          setValue(
            "hostelIds",
            linkedIds.filter((id) => id !== unlinkTarget),
            { shouldDirty: true },
          );
          setUnlinkTarget(null);
        }}
      />
    </div>
  );
}
