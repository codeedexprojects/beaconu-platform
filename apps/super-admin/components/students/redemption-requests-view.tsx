"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  RefreshCw,
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  AlertTriangle,
  Mail,
  type LucideIcon,
} from "lucide-react";

import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { getErrorMessage } from "@/lib/api";
import {
  useStudentRedemptions,
  useReviewRedemption,
} from "@/hooks/use-student-redemptions";
import { RedemptionPayoutDialog } from "./redemption-payout-dialog";
import type { RedemptionRequest } from "@beaconu/types";

const STATUS_FILTERS = ["pending", "approved", "rejected", ""] as const;

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    variant: "warning" | "success" | "destructive";
    icon: LucideIcon;
  }
> = {
  pending: { label: "Pending", variant: "warning", icon: Clock },
  approved: { label: "Approved", variant: "success", icon: CheckCircle2 },
  rejected: { label: "Rejected", variant: "destructive", icon: XCircle },
};

type PendingReview = {
  request: RedemptionRequest;
  status: "approved" | "rejected";
};

export function RedemptionRequestsView() {
  const [statusFilter, setStatusFilter] = useState<
    "" | "pending" | "approved" | "rejected"
  >("pending");
  const [remarksById, setRemarksById] = useState<Record<string, string>>({});
  const [payoutRequestId, setPayoutRequestId] = useState<string | null>(null);
  const [pendingReview, setPendingReview] = useState<PendingReview | null>(
    null,
  );

  const { data, isLoading, error, refetch } = useStudentRedemptions({
    status: statusFilter || undefined,
  });
  const requests = data?.data ?? [];
  const reviewMutation = useReviewRedemption();

  function confirmReview() {
    if (!pendingReview) return;
    const { request, status } = pendingReview;
    reviewMutation.mutate(
      {
        id: request.id,
        data: { status, remarks: remarksById[request.id] || undefined },
      },
      {
        onSuccess: () => {
          toast.success(
            status === "approved"
              ? `₹${request.amount.toFixed(2)} marked as paid to ${request.student.fullName}`
              : "Redemption request declined",
          );
          setPendingReview(null);
        },
      },
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Card Redemptions"
        description="Review BeaconU Card payout requests. Transfer the money manually, then approve."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => void refetch()}
          disabled={isLoading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </Header>

      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center gap-2">
          {STATUS_FILTERS.map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(s)}
              className="capitalize"
            >
              {s === "" ? "All" : s}
            </Button>
          ))}
        </div>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Pay To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-12 w-[220px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[90px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[160px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[90px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-48 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center gap-1 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="text-sm">
                          {getErrorMessage(error)}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : requests.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No redemption requests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((req) => {
                    const sc = STATUS_CONFIG[req.status ?? ""];
                    const isPending = req.status === "pending";
                    return (
                      <TableRow
                        key={req.id}
                        className="group hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg flex items-center justify-center font-bold bg-sky-100 text-sky-700">
                              {req.student.fullName.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm">
                                {req.student.fullName}
                              </span>
                              {req.student.email && (
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <Mail className="h-3 w-3" />
                                  {req.student.email}
                                </div>
                              )}
                              {req.card && (
                                <span className="font-mono text-[10px] text-muted-foreground">
                                  {req.card.cardNumber}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-sm">
                            ₹{req.amount.toFixed(2)}
                          </span>
                          {req.card && (
                            <p className="text-[10px] text-muted-foreground">
                              of ₹{req.card.balance.toFixed(2)}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          {req.payoutDetails ? (
                            <div className="text-xs text-muted-foreground space-y-0.5">
                              <p className="font-medium text-foreground">
                                {req.payoutDetails.accountHolderName}
                              </p>
                              <p>{req.payoutDetails.bankName}</p>
                              <p className="font-mono">
                                ••••{req.payoutDetails.accountNumberLast4} ·{" "}
                                {req.payoutDetails.ifscCode}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Not recorded
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {sc && (
                            <Badge variant={sc.variant} className="gap-1.5">
                              <sc.icon className="h-3.5 w-3.5" />
                              {sc.label}
                            </Badge>
                          )}
                          {req.reviewRemarks && (
                            <p className="text-[10px] text-muted-foreground mt-1 max-w-[160px]">
                              {req.reviewRemarks}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {new Date(req.requestedAt).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setPayoutRequestId(req.id)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Payout details
                            </Button>
                            {isPending && (
                              <>
                                <Textarea
                                  placeholder="Remarks (optional)"
                                  value={remarksById[req.id] ?? ""}
                                  onChange={(e) =>
                                    setRemarksById((prev) => ({
                                      ...prev,
                                      [req.id]: e.target.value,
                                    }))
                                  }
                                  className="h-16 w-56 text-xs"
                                />
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800"
                                    onClick={() =>
                                      setPendingReview({
                                        request: req,
                                        status: "approved",
                                      })
                                    }
                                    disabled={reviewMutation.isPending}
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Mark paid
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800"
                                    onClick={() =>
                                      setPendingReview({
                                        request: req,
                                        status: "rejected",
                                      })
                                    }
                                    disabled={reviewMutation.isPending}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Decline
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <RedemptionPayoutDialog
        requestId={payoutRequestId}
        onClose={() => setPayoutRequestId(null)}
      />

      {/* Confirmed, not fired from the row: approving debits a real balance. */}
      <ConfirmDialog
        open={pendingReview !== null}
        title={
          pendingReview?.status === "approved"
            ? "Mark this redemption as paid?"
            : "Decline this redemption?"
        }
        description={
          pendingReview
            ? pendingReview.status === "approved"
              ? `Confirm you have transferred ₹${pendingReview.request.amount.toFixed(2)} to ${pendingReview.request.student.fullName}. This deducts the amount from their card balance and cannot be undone here.`
              : `Decline ${pendingReview.request.student.fullName}'s ₹${pendingReview.request.amount.toFixed(2)} request. Their balance is unchanged and stays available to redeem.`
            : ""
        }
        confirmLabel={
          pendingReview?.status === "approved" ? "Mark paid" : "Decline"
        }
        variant={
          pendingReview?.status === "approved" ? "default" : "destructive"
        }
        loading={reviewMutation.isPending}
        onCancel={() => setPendingReview(null)}
        onConfirm={confirmReview}
      />
    </div>
  );
}
