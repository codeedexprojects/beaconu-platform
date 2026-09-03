"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  Settings,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getErrorMessage } from "@/lib/api";
import {
  useCollegeCampusVisitStats,
  useCampusVisitCalendar,
  useAddCampusVisitDateOverride,
  useRemoveCampusVisitDateOverride,
  useCancelCampusVisitByAdmin,
  useCancelCampusVisitsForDate,
} from "@/hooks/use-campus-visits";
import type {
  CampusVisitCalendarDay,
  CampusVisitListItem,
} from "@beaconu/types";

const WEEKDAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  arrived: "secondary",
  confirmed: "default",
  completed: "outline",
  cancelled: "destructive",
  reassigned: "secondary",
};

function buildGrid(
  days: CampusVisitCalendarDay[],
  year: number,
  month: number,
) {
  if (days.length === 0) return [];
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const cells: (CampusVisitCalendarDay | null)[] =
    Array(firstWeekday).fill(null);
  cells.push(...days);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (CampusVisitCalendarDay | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

function VisitRow({
  visit,
  onCancelled,
}: {
  visit: CampusVisitListItem;
  onCancelled: () => void;
}) {
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState("");
  const { mutate: cancel, isPending } = useCancelCampusVisitByAdmin();
  const isTerminal =
    visit.status === "cancelled" || visit.status === "completed";

  function confirm() {
    if (!message.trim()) {
      toast.error("A message for the student is required");
      return;
    }
    cancel(
      { visitId: visit.id, data: { message: message.trim() } },
      {
        onSuccess: () => {
          toast.success(`"${visit.studentName}"'s visit cancelled`);
          setCancelling(false);
          setMessage("");
          onCancelled();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{visit.studentName}</p>
          <p className="text-xs text-muted-foreground">
            {visit.proposedTime}
            {visit.ambassador
              ? ` · ${visit.ambassador.fullName}`
              : " · Unassigned"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge variant={STATUS_VARIANTS[visit.status] ?? "secondary"}>
            {visit.status}
          </Badge>
          <Button variant="ghost" size="sm" className="h-7 px-2" asChild>
            <Link href={`/campus-visits/${visit.id}`}>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </Button>
          {!isTerminal && !cancelling && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs text-destructive"
              onClick={() => setCancelling(true)}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
      {cancelling && (
        <div className="mt-2 space-y-2">
          <Textarea
            placeholder="Message to send the student..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCancelling(false);
                setMessage("");
              }}
            >
              Back
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={isPending}
              onClick={confirm}
            >
              {isPending && (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              Confirm Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function DateDetailDialog({
  day,
  onClose,
}: {
  day: CampusVisitCalendarDay;
  onClose: () => void;
}) {
  const { mutate: addOverride, isPending: isMarking } =
    useAddCampusVisitDateOverride();
  const { mutate: removeOverride, isPending: isUnmarking } =
    useRemoveCampusVisitDateOverride();
  const { mutate: cancelAll, isPending: isCancellingAll } =
    useCancelCampusVisitsForDate();
  const [bulkCancelling, setBulkCancelling] = useState(false);
  const [bulkMessage, setBulkMessage] = useState("");

  const activeVisits = day.visits.filter((v) => v.status !== "cancelled");

  function toggleHoliday() {
    if (day.isHoliday && day.holidayOverrideId) {
      removeOverride(day.holidayOverrideId, {
        onSuccess: () => toast.success("Holiday removed"),
      });
    } else {
      addOverride(
        { date: day.date },
        { onSuccess: () => toast.success("Date marked as holiday") },
      );
    }
  }

  function confirmBulkCancel() {
    if (!bulkMessage.trim()) {
      toast.error("A message for the students is required");
      return;
    }
    cancelAll(
      { date: day.date, message: bulkMessage.trim() },
      {
        onSuccess: (result) => {
          toast.success(`Cancelled ${result.cancelledCount} booking(s)`);
          setBulkCancelling(false);
          setBulkMessage("");
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {new Date(day.date + "T00:00:00Z").toLocaleDateString("en-IN", {
              weekday: "long",
              day: "2-digit",
              month: "short",
              year: "numeric",
              timeZone: "UTC",
            })}
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">
              {day.isWeekdayOff
                ? "Weekday closed (recurring)"
                : day.isHoliday
                  ? `Marked as holiday${day.holidayReason ? `: ${day.holidayReason}` : ""}`
                  : `${day.bookingCount} / ${day.capacity} booked`}
            </p>
          </div>
          {!day.isWeekdayOff && (
            <Button
              variant="outline"
              size="sm"
              disabled={isMarking || isUnmarking}
              onClick={toggleHoliday}
            >
              {(isMarking || isUnmarking) && (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              {day.isHoliday ? "Remove Holiday" : "Mark as Holiday"}
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {day.visits.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No bookings on this date.
            </p>
          ) : (
            day.visits.map((v) => (
              <VisitRow key={v.id} visit={v} onCancelled={() => {}} />
            ))
          )}
        </div>

        {activeVisits.length > 0 && (
          <div className="border-t pt-3">
            {!bulkCancelling ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBulkCancelling(true)}
              >
                Cancel All Bookings on This Date
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Cancels all {activeVisits.length} active booking(s) below and
                  notifies each student.
                </p>
                <Textarea
                  placeholder="Message to send every affected student..."
                  value={bulkMessage}
                  onChange={(e) => setBulkMessage(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setBulkCancelling(false);
                      setBulkMessage("");
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isCancellingAll}
                    onClick={confirmBulkCancel}
                  >
                    {isCancellingAll && (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    )}
                    Confirm Cancel All
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function CampusVisitsPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getUTCFullYear());
  const [month, setMonth] = useState(now.getUTCMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: stats, isLoading: isLoadingStats } =
    useCollegeCampusVisitStats();
  const { data: days, isLoading } = useCampusVisitCalendar(year, month);

  const weeks = useMemo(
    () => buildGrid(days ?? [], year, month),
    [days, year, month],
  );
  const selectedDay = days?.find((d) => d.date === selectedDate) ?? null;

  function goToPrevMonth() {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function goToNextMonth() {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campus Visits</h1>
          <p className="text-sm text-muted-foreground">
            All scheduled visits, by date
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/campus-visits/availability">
            <Settings className="mr-1.5 h-3.5 w-3.5" />
            Manage Availability
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Today&apos;s Visits</p>
            {isLoadingStats ? (
              <Skeleton className="mt-1 h-8 w-12" />
            ) : (
              <p className="mt-1 text-3xl font-bold">{stats?.today ?? 0}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Pending</p>
            {isLoadingStats ? (
              <Skeleton className="mt-1 h-8 w-12" />
            ) : (
              <p className="mt-1 text-3xl font-bold text-amber-500">
                {stats?.pending ?? 0}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">
              Arrived · Awaiting Ambassador
            </p>
            {isLoadingStats ? (
              <Skeleton className="mt-1 h-8 w-12" />
            ) : (
              <p className="mt-1 text-3xl font-bold text-orange-500">
                {stats?.arrived ?? 0}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Confirmed</p>
            {isLoadingStats ? (
              <Skeleton className="mt-1 h-8 w-12" />
            ) : (
              <p className="mt-1 text-3xl font-bold text-emerald-500">
                {stats?.confirmed ?? 0}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="w-40 text-center text-sm font-semibold">
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-xl border shadow-sm">
        <div className="grid grid-cols-7 border-b bg-muted/50">
          {WEEKDAY_HEADERS.map((d) => (
            <div
              key={d}
              className="py-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              {d}
            </div>
          ))}
        </div>
        {isLoading ? (
          <div className="grid grid-cols-7 gap-px bg-border p-px">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : (
          <div className="divide-y">
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 divide-x">
                {week.map((day, di) => {
                  if (!day)
                    return <div key={di} className="min-h-24 bg-muted/20" />;
                  const dayNum = Number(day.date.split("-")[2]);
                  const closed = day.isWeekdayOff || day.isHoliday;
                  return (
                    <button
                      key={di}
                      type="button"
                      onClick={() => setSelectedDate(day.date)}
                      className={`flex min-h-24 flex-col items-start gap-1 p-2 text-left transition-colors hover:bg-muted/30 ${
                        closed ? "bg-muted/40" : ""
                      }`}
                    >
                      <span
                        className={`text-sm font-medium ${closed ? "text-muted-foreground" : ""}`}
                      >
                        {dayNum}
                      </span>
                      {day.isHoliday && (
                        <Badge variant="destructive" className="text-[10px]">
                          Holiday
                        </Badge>
                      )}
                      {!day.isHoliday && day.isWeekdayOff && (
                        <span className="text-[10px] text-muted-foreground">
                          Closed
                        </span>
                      )}
                      {day.bookingCount > 0 && (
                        <span className="mt-auto inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                          <CalendarIcon className="h-3 w-3" />
                          {day.bookingCount}/{day.capacity || "—"}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedDay && (
        <DateDetailDialog
          day={selectedDay}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}
