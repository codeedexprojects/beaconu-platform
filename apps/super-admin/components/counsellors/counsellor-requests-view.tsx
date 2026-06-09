"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Search,
  RefreshCw,
  Check,
  X,
  Mail,
  Clock,
  CheckCircle2,
  XCircle,
  Hash,
  Copy,
  CheckCheck,
  type LucideIcon,
} from "lucide-react";

import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  useCounsellorRequests,
  useUpdateCounsellorRequestStatus,
} from "@/hooks/use-counsellor-requests";
import type {
  CounsellorType,
  UpdateCounsellorRequestStatusResult,
} from "@beaconu/types";

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

interface CounsellorRequestsViewProps {
  counsellorType: CounsellorType;
  title: string;
  description: string;
  trackLabel: string;
  trackIcon: LucideIcon;
  avatarClassName: string;
}

export function CounsellorRequestsView({
  counsellorType,
  title,
  description,
  trackLabel,
  trackIcon: TrackIcon,
  avatarClassName,
}: CounsellorRequestsViewProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "" | "pending" | "approved" | "rejected"
  >("pending");
  const [approvalResult, setApprovalResult] =
    useState<UpdateCounsellorRequestStatusResult | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  const { data, isLoading, refetch } = useCounsellorRequests({
    counsellor_type: counsellorType,
    status: statusFilter || undefined,
    search: search || undefined,
  });
  const requests = data?.data ?? [];
  const statusMutation = useUpdateCounsellorRequestStatus();

  function handleCopyCode(text: string) {
    void navigator.clipboard.writeText(text);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  }

  function handleStatusUpdate(id: string, status: "approved" | "rejected") {
    statusMutation.mutate(
      { id, data: { status } },
      {
        onSuccess: (result) => {
          if (status === "approved" && result.counsellor_code) {
            setApprovalResult(result);
          } else {
            toast.success("Request rejected successfully");
          }
        },
      },
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      {approvalResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setApprovalResult(null)}
        >
          <Card
            className="w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">Counsellor Approved</p>
                <p className="text-xs text-muted-foreground">
                  Account created successfully
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Counsellor Code
              </p>
              <div className="flex items-center justify-between gap-2 bg-muted rounded-md px-3 py-2">
                <div className="flex items-center gap-1.5 font-mono text-sm font-semibold">
                  <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                  {approvalResult.counsellor_code}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyCode(approvalResult.counsellor_code!)
                  }
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {codeCopied ? (
                    <CheckCheck className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button className="w-full" onClick={() => setApprovalResult(null)}>
              Done
            </Button>
          </Card>
        </div>
      )}

      <Header title={title} description={description}>
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
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
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
                  <TableHead>Applicant</TableHead>
                  <TableHead>Track</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Qualification</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Applied</TableHead>
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
                        <Skeleton className="h-4 w-[140px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[160px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[100px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-[100px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-32 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : requests.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No requests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((req) => {
                    const sc = STATUS_CONFIG[req.status];
                    return (
                      <TableRow
                        key={req.id}
                        className="group hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold ${avatarClassName}`}
                            >
                              {req.full_name.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm">
                                {req.full_name}
                              </span>
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {req.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1.5">
                            <TrackIcon className="h-3.5 w-3.5" />
                            {trackLabel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {req.counsellor_code ? (
                            <div className="flex items-center gap-1 font-mono text-xs bg-muted px-2 py-1 rounded w-fit">
                              <Hash className="h-3 w-3 text-muted-foreground" />
                              {req.counsellor_code}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {req.qualification || "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {req.years_of_experience || "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={sc.variant} className="gap-1.5">
                            <sc.icon className="h-3.5 w-3.5" />
                            {sc.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {new Date(req.created_at).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {req.status === "pending" ? (
                            <div className="flex items-center justify-end gap-2">
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
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {req.reviewer ? `by ${req.reviewer.name}` : "—"}
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
