"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useInterviewReschedules,
  useReviewInterviewReschedule,
  useInterviewSlots,
} from "@/hooks/use-interviews";
import type { InterviewRescheduleItem } from "@beaconu/types";

const STATUS_VARIANT: Record<
  InterviewRescheduleItem["status"],
  "default" | "secondary" | "destructive"
> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function InterviewReschedulesTab() {
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [reviewing, setReviewing] = useState<InterviewRescheduleItem | null>(
    null,
  );
  const [chosenSlotId, setChosenSlotId] = useState("");
  const [remarks, setRemarks] = useState("");

  const { data: reschedules, isLoading } = useInterviewReschedules(
    statusFilter || undefined,
  );
  const { data: activeSlots } = useInterviewSlots({ status: "active" });
  const { mutate: review, isPending: isReviewing } =
    useReviewInterviewReschedule();

  function openReview(reschedule: InterviewRescheduleItem) {
    setReviewing(reschedule);
    setChosenSlotId(reschedule.toSlotId ?? "");
    setRemarks("");
  }

  function handleReview(action: "approve" | "reject") {
    if (!reviewing) return;
    review(
      {
        id: reviewing.id,
        data: {
          action,
          to_slot_id: action === "approve" ? chosenSlotId : undefined,
          review_remarks: remarks || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success(
            action === "approve"
              ? "Reschedule approved"
              : "Reschedule rejected",
          );
          setReviewing(null);
        },
      },
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Student-submitted requests to move their interview to a different
          slot.
        </p>
        <Select
          value={statusFilter || "all"}
          onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}
        >
          <SelectTrigger className="h-9 w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="py-4 pl-6 text-xs font-semibold uppercase tracking-wide">
                  Reason
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Requested
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Status
                </TableHead>
                <TableHead className="w-[160px] py-4 pr-6 text-right text-xs font-semibold uppercase tracking-wide">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} className="border-b last:border-0">
                    {Array.from({ length: 4 }).map((__, j) => (
                      <TableCell key={j} className="py-4">
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : !reschedules || reschedules.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-20 text-center text-muted-foreground"
                  >
                    No reschedule requests.
                  </TableCell>
                </TableRow>
              ) : (
                reschedules.map((r) => (
                  <TableRow
                    key={r.id}
                    className="border-b last:border-0 transition-colors hover:bg-muted/30"
                  >
                    <TableCell className="max-w-[320px] py-4 pl-6 text-sm">
                      {r.reason}
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      {formatDate(r.createdAt)}
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant={STATUS_VARIANT[r.status]}>
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right">
                      {r.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 text-xs"
                          onClick={() => openReview(r)}
                        >
                          Review
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!reviewing} onOpenChange={(v) => !v && setReviewing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review Reschedule Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="rounded-md border bg-muted/40 p-3 text-sm">
              {reviewing?.reason}
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="to_slot">New Slot</Label>
              <Select value={chosenSlotId} onValueChange={setChosenSlotId}>
                <SelectTrigger id="to_slot">
                  <SelectValue placeholder="Select a slot" />
                </SelectTrigger>
                <SelectContent>
                  {(activeSlots ?? []).map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.mode.replace("_", " ")} — {s.scheduledDate}{" "}
                      {s.startTime}–{s.endTime}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="review_remarks">
                Remarks{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="review_remarks"
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="gap-1.5 text-destructive hover:text-destructive"
                disabled={isReviewing}
                onClick={() => handleReview("reject")}
              >
                <XCircle className="h-3.5 w-3.5" />
                Reject
              </Button>
              <Button
                type="button"
                className="gap-1.5"
                disabled={isReviewing || !chosenSlotId}
                onClick={() => handleReview("approve")}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Approve
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
