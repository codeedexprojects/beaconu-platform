"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle, FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useOfflineReviewQueue,
  useReviewOfflineTokenPayment,
} from "@/hooks/use-payments";
import type { OfflineTokenPaymentDto } from "@/lib/services/payments.service";

const STATUS_OPTIONS = [
  { value: "pending_verification", label: "Pending Review" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
];

const VERIFICATION_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive"
> = {
  pending_verification: "secondary",
  verified: "default",
  rejected: "destructive",
};

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PaymentsPage() {
  const [statusFilter, setStatusFilter] = useState<string>(
    "pending_verification",
  );
  const [page, setPage] = useState(1);
  const [reviewing, setReviewing] = useState<{
    row: OfflineTokenPaymentDto;
    decision: "verified" | "rejected";
  } | null>(null);
  const [receivedAmount, setReceivedAmount] = useState("");
  const [note, setNote] = useState("");

  const { data, isLoading } = useOfflineReviewQueue({
    status: (statusFilter || undefined) as
      | "pending_verification"
      | "verified"
      | "rejected"
      | undefined,
    page,
    limit: 20,
  });
  const { mutate: review, isPending: isReviewing } =
    useReviewOfflineTokenPayment();

  const rows = data?.data ?? [];
  const meta = data?.meta;

  function openReview(
    row: OfflineTokenPaymentDto,
    decision: "verified" | "rejected",
  ) {
    setReviewing({ row, decision });
    setReceivedAmount("");
    setNote("");
  }

  function submitReview() {
    if (!reviewing) return;
    if (reviewing.decision === "rejected" && !note.trim()) {
      toast.error("A note is required when rejecting");
      return;
    }
    if (reviewing.decision === "verified" && !receivedAmount.trim()) {
      toast.error("Enter the amount actually received");
      return;
    }
    review(
      {
        transactionId: reviewing.row.id,
        data: {
          decision: reviewing.decision,
          note: note.trim() || undefined,
          received_amount:
            reviewing.decision === "verified"
              ? Number(receivedAmount)
              : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success(
            reviewing.decision === "verified"
              ? "Payment marked as received"
              : "Payment rejected",
          );
          setReviewing(null);
        },
      },
    );
  }

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Offline Payment Review
          </h1>
          <p className="text-sm text-muted-foreground">
            Review demand draft / bank transfer token payment submissions.
          </p>
        </div>
        {meta && (
          <div className="rounded-md border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground">
            {meta.total} submission{meta.total === 1 ? "" : "s"}
          </div>
        )}
      </div>

      <Select
        value={statusFilter || "all"}
        onValueChange={(v) => {
          setStatusFilter(v === "all" ? "" : v);
          setPage(1);
        }}
      >
        <SelectTrigger className="h-9 w-56">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex-1 overflow-hidden rounded-xl border shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="py-4 pl-6 text-xs font-semibold uppercase tracking-wide">
                  Student
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Course
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Amount
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Method
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Proof
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Submitted
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
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b last:border-0">
                    {Array.from({ length: 8 }).map((__, j) => (
                      <TableCell key={j} className="py-4">
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-20 text-center text-muted-foreground"
                  >
                    No offline payment submissions found.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-b last:border-0 transition-colors hover:bg-muted/30"
                  >
                    <TableCell className="py-4 pl-6 text-sm">
                      <p className="font-medium">{row.studentName ?? "—"}</p>
                      {row.studentEmail && (
                        <p className="text-xs text-muted-foreground">
                          {row.studentEmail}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="py-4 text-sm">
                      {row.courseName ?? "—"}
                    </TableCell>
                    <TableCell className="py-4 text-sm font-medium">
                      ₹{row.amount}
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      {row.paymentMethod === "demand_draft"
                        ? "Demand Draft"
                        : "Bank Transfer"}
                    </TableCell>
                    <TableCell className="py-4 text-sm">
                      {row.proofUrl ? (
                        <a
                          href={row.proofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          View
                        </a>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      {formatDateTime(row.createdAt)}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant={
                            VERIFICATION_VARIANT[row.verificationStatus] ??
                            "secondary"
                          }
                        >
                          {row.verificationStatus.replace("_", " ")}
                        </Badge>
                        {row.isResubmission && (
                          <Badge variant="outline" className="w-fit text-xs">
                            Resubmitted
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right">
                      {row.verificationStatus === "pending_verification" && (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 text-xs"
                            onClick={() => openReview(row, "verified")}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
                            onClick={() => openReview(row, "rejected")}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {meta && meta.total > 20 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {meta.page} of {meta.totalPages} · {meta.total} total
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
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

      <Dialog open={!!reviewing} onOpenChange={(v) => !v && setReviewing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {reviewing?.decision === "verified"
                ? "Mark as Received"
                : "Reject Submission"}
            </DialogTitle>
          </DialogHeader>
          {reviewing && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {reviewing.row.studentName} — {reviewing.row.courseName}.
                Student submitted{" "}
                <span className="font-medium">₹{reviewing.row.amount}</span> via{" "}
                {reviewing.row.paymentMethod === "demand_draft"
                  ? "demand draft"
                  : "bank transfer"}
                .
              </p>

              {reviewing.decision === "verified" ? (
                <div className="space-y-1.5">
                  <Label htmlFor="received_amount">
                    Amount actually received{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="received_amount"
                    type="number"
                    step="0.01"
                    placeholder="Type the amount you actually received"
                    value={receivedAmount}
                    onChange={(e) => setReceivedAmount(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Manually re-enter the amount received for verification —
                    this is checked against the configured token amount, not
                    pre-filled from the student&apos;s submission.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label htmlFor="review-note">
                    Reason for rejection{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="review-note"
                    rows={3}
                    placeholder="e.g. DD number doesn't match the uploaded proof"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              )}

              {reviewing.decision === "verified" && (
                <div className="space-y-1.5">
                  <Label htmlFor="review-note-optional">
                    Note{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Textarea
                    id="review-note-optional"
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setReviewing(null)}
              disabled={isReviewing}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={
                reviewing?.decision === "rejected" ? "destructive" : "default"
              }
              onClick={submitReview}
              disabled={isReviewing}
            >
              {isReviewing
                ? "Saving..."
                : reviewing?.decision === "verified"
                  ? "Confirm Received"
                  : "Confirm Rejection"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
