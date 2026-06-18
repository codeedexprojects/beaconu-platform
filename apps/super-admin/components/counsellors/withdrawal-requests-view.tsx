"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  RefreshCw,
  Check,
  X,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  Hash,
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
import {
  useWithdrawalRequests,
  useUpdateWithdrawalStatus,
} from "@/hooks/use-withdrawal-requests";

const STATUS_FILTERS = ["", "pending", "approved", "rejected"] as const;

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

export function WithdrawalRequestsView() {
  const [statusFilter, setStatusFilter] = useState<
    "" | "pending" | "approved" | "rejected"
  >("pending");
  const [remarksById, setRemarksById] = useState<Record<string, string>>({});

  const { data, isLoading, refetch } = useWithdrawalRequests({
    status: statusFilter || undefined,
  });
  const requests = data?.data ?? [];
  const statusMutation = useUpdateWithdrawalStatus();

  function handleStatusUpdate(id: string, status: "approved" | "rejected") {
    statusMutation.mutate(
      { id, data: { status, remarks: remarksById[id] || undefined } },
      {
        onSuccess: () => {
          toast.success(
            status === "approved"
              ? "Withdrawal request approved"
              : "Withdrawal request rejected",
          );
        },
      },
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Withdrawal Requests"
        description="Review and approve counsellor wallet withdrawal requests"
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
        <div className="flex flex-wrap items-center justify-between gap-3">
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
        </div>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Counsellor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Bank Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Requested</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-12 w-[220px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[100px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[160px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[100px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-48 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : requests.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No withdrawal requests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((req) => {
                    const sc = STATUS_CONFIG[req.withdrawal_status ?? ""];
                    const isPending = req.withdrawal_status === "pending";
                    return (
                      <TableRow
                        key={req.id}
                        className="group hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg flex items-center justify-center font-bold bg-violet-100 text-violet-700">
                              {req.counsellor.full_name.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm">
                                {req.counsellor.full_name}
                              </span>
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {req.counsellor.email}
                              </div>
                              {req.counsellor.counsellor_code && (
                                <div className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                                  <Hash className="h-3 w-3" />
                                  {req.counsellor.counsellor_code}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-sm">
                            ₹{req.amount.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-muted-foreground space-y-0.5">
                            <p className="font-medium text-foreground">
                              {req.bank_details.account_holder_name}
                            </p>
                            <p>{req.bank_details.bank_name}</p>
                            <p className="font-mono">
                              {req.bank_details.account_number} ·{" "}
                              {req.bank_details.ifsc}
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
                          {req.review_remarks && (
                            <p className="text-[10px] text-muted-foreground mt-1 max-w-[160px]">
                              {req.review_remarks}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {new Date(req.created_at).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {isPending ? (
                            <div className="flex flex-col items-end gap-2">
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
                                    handleStatusUpdate(req.id, "approved")
                                  }
                                  disabled={statusMutation.isPending}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800"
                                  onClick={() =>
                                    handleStatusUpdate(req.id, "rejected")
                                  }
                                  disabled={statusMutation.isPending}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
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
      </div>
    </div>
  );
}
