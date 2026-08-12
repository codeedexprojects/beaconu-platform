"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ExternalLink, FileText, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
import { getErrorMessage } from "@/lib/api";
import {
  useSeatCancellations,
  useReviewSeatCancellation,
} from "@/hooks/use-seat-cancellations";
import type {
  RefundStatus,
  SeatCancellationRequest,
  SeatCancellationStatus,
} from "@beaconu/types";

const STATUS_BADGE_CLASS: Record<SeatCancellationStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

const REFUND_STATUS_OPTIONS: { label: string; value: RefundStatus }[] = [
  { label: "Not Applicable", value: "not_applicable" },
  { label: "Pending", value: "pending" },
  { label: "Processed", value: "processed" },
  { label: "Denied", value: "denied" },
];

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SeatCancellationsPage() {
  const [statusFilter, setStatusFilter] = useState<
    SeatCancellationStatus | "all"
  >("pending");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = useSeatCancellations({
    status: statusFilter === "all" ? undefined : statusFilter,
    page,
    limit,
  });
  const { mutate: review, isPending: isReviewing } =
    useReviewSeatCancellation();

  const [reviewTarget, setReviewTarget] =
    useState<SeatCancellationRequest | null>(null);
  const [remarks, setRemarks] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [refundStatus, setRefundStatus] =
    useState<RefundStatus>("not_applicable");

  const requests = data?.requests ?? [];
  const meta = data?.meta;

  function openReview(request: SeatCancellationRequest) {
    setReviewTarget(request);
    setRemarks("");
    setRefundAmount("");
    setRefundStatus("not_applicable");
  }

  function handleReject() {
    if (!reviewTarget) return;
    if (!remarks.trim()) {
      toast.error("Remarks are required when rejecting a request");
      return;
    }
    review(
      { id: reviewTarget.id, data: { decision: "reject", remarks } },
      {
        onSuccess: () => {
          toast.success("Cancellation request rejected");
          setReviewTarget(null);
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  function handleApprove() {
    if (!reviewTarget) return;
    review(
      {
        id: reviewTarget.id,
        data: {
          decision: "approve",
          remarks: remarks.trim() || undefined,
          refund_amount: refundAmount ? Number(refundAmount) : undefined,
          refund_status: refundStatus,
        },
      },
      {
        onSuccess: () => {
          toast.success(
            "Seat cancellation approved — student's Student Hub access has been deactivated",
          );
          setReviewTarget(null);
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      },
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Seat Cancellation Requests
          </h1>
          <p className="text-sm text-muted-foreground">
            Review and process students&apos; requests to cancel their confirmed
            seat.
          </p>
        </div>
      </div>

      <Select
        value={statusFilter}
        onValueChange={(v) => {
          setStatusFilter(v as SeatCancellationStatus | "all");
          setPage(1);
        }}
      >
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
          <SelectItem value="all">All</SelectItem>
        </SelectContent>
      </Select>

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16 border border-dashed rounded-lg text-muted-foreground text-sm">
            No {statusFilter !== "all" ? statusFilter : ""} cancellation
            requests.
          </div>
        ) : (
          requests.map((request) => (
            <div
              key={request.id}
              className="border rounded-2xl p-4 space-y-2 cursor-pointer hover:border-foreground/20"
              onClick={() => openReview(request)}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-sm">
                    {request.studentName ?? request.studentId}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {request.courseName} ({request.courseCode})
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={STATUS_BADGE_CLASS[request.status]}
                >
                  {request.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {request.reason}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <span>Requested {formatDateTime(request.requestedAt)}</span>
                {request.supportingDocUrls.length > 0 && (
                  <span className="flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    {request.supportingDocUrls.length} document
                    {request.supportingDocUrls.length === 1 ? "" : "s"}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {meta.page} of {meta.totalPages} · {meta.total} total
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasPreviousPage}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog
        open={reviewTarget !== null}
        onOpenChange={(open) => !open && setReviewTarget(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Cancellation Request</DialogTitle>
          </DialogHeader>

          {reviewTarget && (
            <div className="space-y-4">
              <div className="rounded-lg border p-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student</span>
                  <span className="font-medium">
                    {reviewTarget.studentName ?? reviewTarget.studentId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Course</span>
                  <span>
                    {reviewTarget.courseName} ({reviewTarget.courseCode})
                  </span>
                </div>
                <div className="pt-1 border-t">
                  <div className="text-muted-foreground mb-1">Reason</div>
                  <p>{reviewTarget.reason}</p>
                </div>
                {reviewTarget.supportingDocUrls.length > 0 && (
                  <div className="pt-1 border-t space-y-1">
                    <div className="text-muted-foreground">
                      Supporting Documents
                    </div>
                    {reviewTarget.supportingDocUrls.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" /> Document {idx + 1}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {reviewTarget.status === "pending" ? (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs">
                      Remarks{" "}
                      <span className="text-muted-foreground">
                        (required if rejecting)
                      </span>
                    </Label>
                    <Textarea
                      rows={3}
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Notes visible in the audit trail"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">
                        Refund Amount (optional)
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Refund Status</Label>
                      <Select
                        value={refundStatus}
                        onValueChange={(v) =>
                          setRefundStatus(v as RefundStatus)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {REFUND_STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Approving releases the seat back to the quota, withdraws the
                    student&apos;s enrollment, and deactivates their Student Hub
                    access (BeaconU Card included). They can submit a fresh
                    application afterward if they wish to rejoin.
                  </p>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={isReviewing}
                      onClick={handleReject}
                    >
                      Reject
                    </Button>
                    <Button
                      type="button"
                      disabled={isReviewing}
                      onClick={handleApprove}
                    >
                      {isReviewing && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      Approve Cancellation
                    </Button>
                  </div>
                </>
              ) : (
                <div className="rounded-lg border p-3 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Decision</span>
                    <Badge
                      variant="outline"
                      className={STATUS_BADGE_CLASS[reviewTarget.status]}
                    >
                      {reviewTarget.status}
                    </Badge>
                  </div>
                  {reviewTarget.remarks && (
                    <div>
                      <div className="text-muted-foreground">Remarks</div>
                      <p>{reviewTarget.remarks}</p>
                    </div>
                  )}
                  {reviewTarget.refundAmount && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Refund Amount
                      </span>
                      <span>₹{reviewTarget.refundAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Processed</span>
                    <span>{formatDateTime(reviewTarget.processedAt)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
