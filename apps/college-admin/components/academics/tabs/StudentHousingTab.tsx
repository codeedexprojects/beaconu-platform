"use client";

import { Trash2 } from "lucide-react";
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

export function StudentHousingTab({
  payload,
  onChange,
  hostels,
}: {
  payload: any;
  onChange: (updates: any) => void;
  hostels: any[];
}) {
  const getActiveTabPayload = () => payload;
  const updateActiveTabPayload = (updates: any) => onChange(updates);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Hostel & Housing Summary</Label>
        <Textarea
          placeholder="Describe AC/Non-AC hostel rooms, food facilities..."
          value={getActiveTabPayload().summary || ""}
          onChange={(e) =>
            updateActiveTabPayload({
              summary: e.target.value,
            })
          }
        />
      </div>

      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-indigo-950">
            Linked Hostels
          </CardTitle>
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
                const linkedIds: string[] =
                  getActiveTabPayload().hostelIds || [];
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
                        updateActiveTabPayload({
                          hostelIds: next,
                        });
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
          <CardTitle className="text-lg font-bold text-indigo-950">
            Currently Linked
          </CardTitle>
          <CardDescription>
            Hostels currently shown on this course&apos;s Student Housing tab.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(getActiveTabPayload().hostelIds || []).length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No hostels linked yet.
            </p>
          ) : (
            <div className="space-y-2">
              {(getActiveTabPayload().hostelIds || []).map(
                (hostelId: string) => {
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
                        onClick={() => {
                          const linkedIds: string[] =
                            getActiveTabPayload().hostelIds || [];
                          updateActiveTabPayload({
                            hostelIds: linkedIds.filter(
                              (id) => id !== hostelId,
                            ),
                          });
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
