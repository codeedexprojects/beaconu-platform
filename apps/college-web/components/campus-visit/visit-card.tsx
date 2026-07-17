"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, User2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AvailabilityStrip } from "@/components/campus-visit/availability-strip";
import {
  useCancelCampusVisit,
  useRescheduleCampusVisit,
  useVisitAvailability,
} from "@/hooks/use-campus-visits";
import type { CampusVisitListItem } from "@beaconu/types";

const ACTIONABLE_STATUSES = new Set(["pending", "confirmed"]);

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  pending: "outline",
  confirmed: "default",
  completed: "secondary",
  cancelled: "outline",
  rejected: "outline",
  reassigned: "secondary",
};

const inputCls =
  "h-11 w-full rounded-xl border border-border/60 bg-background px-3.5 text-sm outline-none focus:border-foreground/30";

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateStr));
}

interface VisitCardProps {
  visit: CampusVisitListItem;
  collegeId: string;
}

export function VisitCard({ visit, collegeId }: VisitCardProps) {
  const [mode, setMode] = useState<"none" | "reschedule" | "cancel">("none");
  const [newDate, setNewDate] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  const { data: availability } = useVisitAvailability(
    collegeId,
    mode === "reschedule",
  );
  const { mutate: reschedule, isPending: isRescheduling } =
    useRescheduleCampusVisit(collegeId);
  const { mutate: cancel, isPending: isCancelling } =
    useCancelCampusVisit(collegeId);

  const canAct = ACTIONABLE_STATUSES.has(visit.status);
  const today = new Date().toISOString().split("T")[0];

  function submitReschedule() {
    if (!newDate) {
      toast.error("Select a new date");
      return;
    }
    reschedule(
      { visitId: visit.id, input: { proposed_date: newDate } },
      {
        onSuccess: () => {
          toast.success("Visit rescheduled");
          setMode("none");
          setNewDate("");
        },
      },
    );
  }

  function submitCancel() {
    if (!cancelReason.trim()) {
      toast.error("Enter a cancellation reason");
      return;
    }
    cancel(
      { visitId: visit.id, input: { cancellation_reason: cancelReason } },
      {
        onSuccess: () => {
          toast.success("Visit cancelled");
          setMode("none");
        },
      },
    );
  }

  return (
    <div className="rounded-2xl border border-border/60 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">
            {formatDate(visit.proposedDate)} · {visit.proposedTime}
          </p>
          {visit.reasonForVisit ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {visit.reasonForVisit}
            </p>
          ) : null}
        </div>
        <Badge
          variant={STATUS_VARIANT[visit.status] ?? "outline"}
          className="capitalize"
        >
          {visit.status}
        </Badge>
      </div>

      {visit.ambassador ? (
        <div className="mt-3 flex items-center gap-2.5 border-t border-border/60 pt-3">
          {visit.ambassador.avatarUrl ? (
            <Image
              src={visit.ambassador.avatarUrl}
              alt={visit.ambassador.fullName}
              width={28}
              height={28}
              className="h-7 w-7 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
              <User2 className="h-3.5 w-3.5 text-muted-foreground" />
            </span>
          )}
          <span className="text-sm text-muted-foreground">
            Hosted by {visit.ambassador.fullName}
          </span>
        </div>
      ) : null}

      {visit.cancellationReason ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Cancellation reason: {visit.cancellationReason}
        </p>
      ) : null}

      {canAct ? (
        <div className="mt-4 border-t border-border/60 pt-4">
          {mode === "none" ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMode("reschedule")}
              >
                Reschedule
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMode("cancel")}
              >
                Cancel
              </Button>
            </div>
          ) : mode === "reschedule" ? (
            <div className="space-y-4">
              {availability ? (
                <AvailabilityStrip availability={availability} />
              ) : (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">New Proposed Date</label>
                <input
                  type="date"
                  min={today}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={submitReschedule} disabled={isRescheduling}>
                  {isRescheduling ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : null}
                  Confirm Reschedule
                </Button>
                <Button variant="ghost" onClick={() => setMode("none")}>
                  Back
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">
                  Reason for cancelling
                </label>
                <input
                  type="text"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={submitCancel}
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : null}
                  Confirm Cancel
                </Button>
                <Button variant="ghost" onClick={() => setMode("none")}>
                  Back
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
