"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  RefreshCw,
  Check,
  X,
  Mail,
  Phone,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
  useBlinkWithdrawalRequests,
  useUpdateBlinkWithdrawalStatus,
} from "@/hooks/use-blink-withdrawals";
import { getErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { BlinkWithdrawalRequest } from "@beaconu/types";

const PAGE_SIZE = 20;

const STATUS_FILTERS = ["", "pending", "approved", "rejected"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    variant: "warning" | "success" | "destructive";
    icon: LucideIcon;
  }
> = {
  pending: { label: "Pending", variant: "warning", icon: Clock },
  approved: { label: "Paid", variant: "success", icon: CheckCircle2 },
  rejected: { label: "Rejected", variant: "destructive", icon: XCircle },
};

function formatRupees(amount: number) {
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function BankSummary({
  bank,
}: {
  bank: BlinkWithdrawalRequest["bankDetails"];
}) {
  if (!bank) {
    return (
      <span className="flex items-center gap-1 text-xs text-destructive">
        <AlertTriangle className="h-3 w-3" />
        Not set
      </span>
    );
  }
  return (
    <div className="text-xs text-muted-foreground space-y-0.5">
      <p className="font-medium text-foreground">{bank.accountHolderName}</p>
      <p>{bank.bankName}</p>
      <p className="font-mono">
        {bank.accountNumber} · {bank.ifsc}
      </p>
    </div>
  );
}

interface PendingAction {
  request: BlinkWithdrawalRequest;
  status: "approved" | "rejected";
}

export function BlinkWithdrawalRequestsView() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [page, setPage] = useState(1);
  const [remarksById, setRemarksById] = useState<Record<string, string>>({});
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );

  const { data, isLoading, isFetching, error, refetch } =
    useBlinkWithdrawalRequests({
      status: statusFilter || undefined,
      page,
      limit: PAGE_SIZE,
    });
  const requests = data?.data ?? [];
  const meta = data?.meta;
  const statusMutation = useUpdateBlinkWithdrawalStatus();

  function confirmAction() {
    if (!pendingAction) return;
    const { request, status } = pendingAction;
    statusMutation.mutate(
      {
        id: request.id,
        data: { status, remarks: remarksById[request.id] || undefined },
      },
      {
        onSuccess: () => {
          toast.success(
            status === "approved"
              ? `Withdrawal for ${request.blinkUser.fullName} marked as paid`
              : `Withdrawal rejected — ${formatRupees(request.amount)} returned to wallet`,
          );
          setPendingAction(null);
        },
      },
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Blink Withdrawals"
        description="Review wallet withdrawal requests from associate admins and ambassadors"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => void refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            className={cn("h-4 w-4 mr-2", isFetching && "animate-spin")}
          />
          Refresh
        </Button>
      </Header>

      <div className="flex-1 space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_FILTERS.map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className="capitalize"
            >
              {s === "" ? "All" : s === "approved" ? "Paid" : s}
            </Button>
          ))}
        </div>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Blink User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Bank Details</TableHead>
                  <TableHead>Wallet</TableHead>
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
                        <Skeleton className="h-12 w-[160px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-[110px]" />
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
                    <TableCell colSpan={7} className="h-24 text-center">
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
                      colSpan={7}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No withdrawal requests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((req) => {
                    const sc = STATUS_CONFIG[req.withdrawalStatus ?? ""];
                    const isPending = req.withdrawalStatus === "pending";
                    return (
                      <TableRow
                        key={req.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 shrink-0 rounded-lg flex items-center justify-center font-bold bg-primary/10 text-primary">
                              {req.blinkUser.fullName.charAt(0)}
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm">
                                  {req.blinkUser.fullName}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  {req.blinkUser.roleName}
                                </Badge>
                              </div>
                              {req.blinkUser.agencyName && (
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <Building2 className="h-3 w-3" />
                                  {req.blinkUser.agencyName}
                                </div>
                              )}
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {req.blinkUser.email}
                              </div>
                              {req.blinkUser.phoneNumber && (
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  {req.blinkUser.phoneNumber}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-sm">
                            {formatRupees(req.amount)}
                          </span>
                          {req.description && (
                            <p className="text-[10px] text-muted-foreground max-w-[140px]">
                              {req.description}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <BankSummary bank={req.bankDetails} />
                        </TableCell>
                        <TableCell>
                          <div className="text-xs space-y-0.5">
                            <p>
                              <span className="text-muted-foreground">
                                Balance:{" "}
                              </span>
                              <span className="font-medium">
                                {formatRupees(req.wallet.balance)}
                              </span>
                            </p>
                            <p>
                              <span className="text-muted-foreground">
                                Earned:{" "}
                              </span>
                              {formatRupees(req.wallet.totalEarned)}
                            </p>
                            <p>
                              <span className="text-muted-foreground">
                                Withdrawn:{" "}
                              </span>
                              {formatRupees(req.wallet.totalWithdrawn)}
                            </p>
                          </div>
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
                            {new Date(req.createdAt).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {isPending ? (
                            <div className="flex flex-col items-end gap-2">
                              <Textarea
                                placeholder="Remarks / payment reference (optional)"
                                value={remarksById[req.id] ?? ""}
                                onChange={(e) =>
                                  setRemarksById((prev) => ({
                                    ...prev,
                                    [req.id]: e.target.value,
                                  }))
                                }
                                maxLength={500}
                                className="h-16 w-56 text-xs"
                              />
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800"
                                  onClick={() =>
                                    setPendingAction({
                                      request: req,
                                      status: "approved",
                                    })
                                  }
                                  disabled={
                                    statusMutation.isPending || !req.bankDetails
                                  }
                                  title={
                                    req.bankDetails
                                      ? undefined
                                      : "No bank details on file"
                                  }
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Mark Paid
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800"
                                  onClick={() =>
                                    setPendingAction({
                                      request: req,
                                      status: "rejected",
                                    })
                                  }
                                  disabled={statusMutation.isPending}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {meta.page} of {meta.totalPages} · {meta.total} requests
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={!meta.hasPreviousPage || isFetching}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!meta.hasNextPage || isFetching}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={pendingAction !== null}
        title={
          pendingAction?.status === "approved"
            ? "Mark Withdrawal as Paid"
            : "Reject Withdrawal"
        }
        description={
          pendingAction
            ? pendingAction.status === "approved"
              ? `Confirm you have transferred ${formatRupees(pendingAction.request.amount)} to ${pendingAction.request.blinkUser.fullName}'s bank account. This cannot be undone.`
              : `Reject ${pendingAction.request.blinkUser.fullName}'s withdrawal of ${formatRupees(pendingAction.request.amount)}? The amount will be returned to their wallet balance.`
            : ""
        }
        confirmLabel={
          pendingAction?.status === "approved" ? "Mark Paid" : "Reject"
        }
        variant={
          pendingAction?.status === "rejected" ? "destructive" : "default"
        }
        loading={statusMutation.isPending}
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmAction}
      />
    </div>
  );
}
