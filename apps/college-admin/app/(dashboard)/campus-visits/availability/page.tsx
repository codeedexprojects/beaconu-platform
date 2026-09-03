"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCampusVisitAvailability,
  useUpsertCampusVisitAvailability,
  useCampusVisitSettings,
  useUpsertCampusVisitSettings,
} from "@/hooks/use-campus-visits";
import type { CampusVisitAvailabilityEntry } from "@beaconu/types";

const WEEKDAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface RowState {
  maxCapacity: string;
  isOff: boolean;
}

function parseMaxCapacity(value: string): number | null {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) return null;
  return n;
}

function toRowState(entry: CampusVisitAvailabilityEntry): RowState {
  return {
    maxCapacity: String(entry.maxCapacity),
    isOff: entry.isOff,
  };
}

function VisitTimeCard() {
  const { data: settings, isLoading } = useCampusVisitSettings();
  const { mutate: upsert, isPending } = useUpsertCampusVisitSettings();
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    if (settings?.visitStartTime) setStartTime(settings.visitStartTime);
    if (settings?.visitEndTime) setEndTime(settings.visitEndTime);
  }, [settings?.visitStartTime, settings?.visitEndTime]);

  function handleSave() {
    if (!startTime || !endTime) {
      toast.error("Set both a start and end time first");
      return;
    }
    if (endTime <= startTime) {
      toast.error("End time must be after start time");
      return;
    }
    upsert(
      { visit_start_time: startTime, visit_end_time: endTime },
      { onSuccess: () => toast.success("Campus working hours saved") },
    );
  }

  return (
    <div className="rounded-xl border bg-card p-5">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Campus Visiting Hours
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">
        The college&apos;s working hours, shown to students — students only pick
        a date, never a specific time. Every open day uses this same window.
      </p>
      {isLoading ? (
        <Skeleton className="h-9 w-64" />
      ) : (
        <div className="flex items-end gap-3">
          <div>
            <Label className="sr-only">Start time</Label>
            <Input
              type="time"
              className="h-9 w-32"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <span className="pb-2 text-sm text-muted-foreground">to</span>
          <div>
            <Label className="sr-only">End time</Label>
            <Input
              type="time"
              className="h-9 w-32"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          <Button size="sm" disabled={isPending} onClick={handleSave}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function CampusVisitAvailabilityPage() {
  const { data: entries, isLoading } = useCampusVisitAvailability();
  const { mutate: upsert, isPending: isSaving } =
    useUpsertCampusVisitAvailability();

  const [rows, setRows] = useState<Record<number, RowState>>({});
  const [savingWeekday, setSavingWeekday] = useState<number | null>(null);

  useEffect(() => {
    if (!entries) return;
    setRows((prev) => {
      const next = { ...prev };
      for (const entry of entries) {
        const weekday = WEEKDAY_LABELS.indexOf(entry.weekday);
        if (weekday !== -1 && !next[weekday]) {
          next[weekday] = toRowState(entry);
        }
      }
      return next;
    });
  }, [entries]);

  function updateRow(weekday: number, patch: Partial<RowState>) {
    setRows((prev) => ({
      ...prev,
      [weekday]: { ...prev[weekday]!, ...patch },
    }));
  }

  function handleSave(weekday: number) {
    const row = rows[weekday];
    if (!row) return;
    const maxCapacityValue = parseMaxCapacity(row.maxCapacity);
    if (maxCapacityValue === null) {
      toast.error("Max capacity must be a whole number of 1 or more");
      return;
    }
    setSavingWeekday(weekday);
    upsert(
      {
        weekday,
        max_capacity: maxCapacityValue,
        is_off: row.isOff,
      },
      {
        onSuccess: () => {
          toast.success(`${WEEKDAY_LABELS[weekday]} availability saved`);
        },
        onSettled: () => setSavingWeekday(null),
      },
    );
  }

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div>
        <Button variant="ghost" size="sm" className="mb-2 -ml-2" asChild>
          <Link href="/campus-visits">
            <ArrowLeft className="mr-1 h-3.5 w-3.5" />
            Back to Campus Visits
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          Visit Availability
        </h1>
        <p className="text-sm text-muted-foreground">
          Set the recurring weekly pattern — which weekdays are open and how
          many visits each can hold. One-off holidays/leave days are marked
          directly from the calendar.
        </p>
      </div>

      <VisitTimeCard />

      <div className="flex-1 overflow-hidden rounded-xl border shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="py-4 pl-6 text-xs font-semibold uppercase tracking-wide">
                  Day
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Max Visits
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Status
                </TableHead>
                <TableHead className="w-[220px] py-4 pr-6 text-right text-xs font-semibold uppercase tracking-wide">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading || !entries
                ? Array.from({ length: 7 }).map((_, i) => (
                    <TableRow key={i} className="border-b last:border-0">
                      {Array.from({ length: 4 }).map((__, j) => (
                        <TableCell key={j} className="py-4">
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : WEEKDAY_LABELS.map((label, weekday) => {
                    const row = rows[weekday] ?? {
                      maxCapacity: "1",
                      isOff: true,
                    };
                    return (
                      <TableRow
                        key={weekday}
                        className="border-b last:border-0 transition-colors hover:bg-muted/30"
                      >
                        <TableCell className="py-4 pl-6 font-medium">
                          {label}
                        </TableCell>
                        <TableCell className="py-4">
                          <Input
                            type="number"
                            min={1}
                            className="h-9 w-24"
                            value={row.maxCapacity}
                            disabled={row.isOff}
                            onChange={(e) =>
                              updateRow(weekday, {
                                maxCapacity: e.target.value,
                              })
                            }
                          />
                        </TableCell>
                        <TableCell className="py-4">
                          {row.isOff ? (
                            <Badge variant="destructive">Off</Badge>
                          ) : (
                            <Badge variant="default">Open</Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-4 pr-6 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() =>
                                updateRow(weekday, { isOff: !row.isOff })
                              }
                            >
                              {row.isOff ? "Mark Open" : "Mark Off"}
                            </Button>
                            <Button
                              size="sm"
                              className="h-8 text-xs"
                              disabled={isSaving && savingWeekday === weekday}
                              onClick={() => handleSave(weekday)}
                            >
                              {isSaving && savingWeekday === weekday
                                ? "Saving..."
                                : "Save"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
