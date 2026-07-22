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
  time: string;
  maxCapacity: string;
  isOff: boolean;
}

function toRowState(entry: CampusVisitAvailabilityEntry): RowState {
  return {
    time: entry.time ?? "",
    maxCapacity: String(entry.maxCapacity),
    isOff: entry.isOff,
  };
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
    if (!row.isOff && !row.time) {
      toast.error("Set a time before opening this day for visits");
      return;
    }
    setSavingWeekday(weekday);
    upsert(
      {
        weekday,
        time: row.isOff ? undefined : row.time,
        max_capacity: Number(row.maxCapacity) || 1,
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
          Set one visiting time per weekday and mark any day off. Students can
          only book dates that fall on an open weekday.
        </p>
      </div>

      <div className="flex-1 overflow-hidden rounded-xl border shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="py-4 pl-6 text-xs font-semibold uppercase tracking-wide">
                  Day
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Time
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
                      {Array.from({ length: 5 }).map((__, j) => (
                        <TableCell key={j} className="py-4">
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : WEEKDAY_LABELS.map((label, weekday) => {
                    const row = rows[weekday] ?? {
                      time: "",
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
                          <div className="space-y-1">
                            <Label className="sr-only">Time</Label>
                            <Input
                              type="time"
                              className="h-9 w-32"
                              value={row.time}
                              disabled={row.isOff}
                              onChange={(e) =>
                                updateRow(weekday, { time: e.target.value })
                              }
                            />
                          </div>
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
