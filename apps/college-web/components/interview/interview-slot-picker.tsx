"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, MapPin, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconSectionHeader } from "@/components/ui/icon-section-header";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/api";
import {
  useAvailableInterviewSlots,
  useBookInterviewSlot,
} from "@/hooks/use-interview";
import type { InterviewSlotItem } from "@beaconu/types";

interface InterviewSlotPickerProps {
  collegeId: string;
  applicationId: string;
}

function formatDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function groupByDate(
  slots: InterviewSlotItem[],
): { date: string; slots: InterviewSlotItem[] }[] {
  const map = new Map<string, InterviewSlotItem[]>();
  for (const slot of slots) {
    const list = map.get(slot.scheduledDate) ?? [];
    list.push(slot);
    map.set(slot.scheduledDate, list);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, list]) => ({ date, slots: list }));
}

export function InterviewSlotPicker({
  collegeId,
  applicationId,
}: InterviewSlotPickerProps) {
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const { data, isLoading, error } = useAvailableInterviewSlots(
    collegeId,
    {},
    true,
  );
  const { mutate: book, isPending } = useBookInterviewSlot(applicationId);

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-2xl border bg-muted" />;
  }

  if (error) {
    return (
      <p className="rounded-2xl border border-border/60 p-5 text-sm text-destructive">
        {getErrorMessage(error)}
      </p>
    );
  }

  const slots = data ?? [];
  const groups = groupByDate(slots);

  function handleBook() {
    if (!selectedSlotId) return;
    book(
      { application_id: applicationId, slot_id: selectedSlotId },
      {
        onSuccess: () => {
          toast.success("Interview booked");
        },
      },
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border/60 p-5">
      <IconSectionHeader
        icon={Video}
        title="Book Your Interview"
        subLabel="Choose a Slot"
      />

      {groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No interview slots are available right now — check back soon.
        </p>
      ) : (
        <div className="space-y-4">
          {groups.map(({ date, slots: daySlots }) => (
            <div key={date}>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-headerTeal">
                {formatDate(date)}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {daySlots.map((slot) => {
                  const isSelected = selectedSlotId === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-colors",
                        isSelected
                          ? "border-headerTeal-dark bg-headerTeal/10"
                          : "border-border/60 bg-field hover:bg-field-focus",
                      )}
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {slot.startTime} – {slot.endTime}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          {slot.mode === "gmeet" ? (
                            <>
                              <Video className="h-3 w-3" />
                              Video Call
                            </>
                          ) : (
                            <>
                              <MapPin className="h-3 w-3" />
                              {slot.campus?.name ?? "On Campus"}
                            </>
                          )}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        onClick={handleBook}
        disabled={!selectedSlotId || isPending}
        className="h-12 w-full rounded-full border-0 bg-headerTeal-dark text-base font-semibold text-white shadow-md hover:opacity-95"
      >
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Confirm Booking
      </Button>
    </div>
  );
}
