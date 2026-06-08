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
import type { CounsellorType } from "@beaconu/types";

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

  const { data, isLoading, refetch } = useCounsellorRequests({
    counsellor_type: counsellorType,
    status: statusFilter || undefined,
    search: search || undefined,
  });
  const requests = data?.data ?? [];
  const statusMutation = useUpdateCounsellorRequestStatus();

  function handleStatusUpdate(id: string, status: "approved" | "rejected") {
    statusMutation.mutate(
      { id, data: { status } },
      {
        onSuccess: () =>
          toast.success(
            `Request ${status === "approved" ? "approved" : "rejected"} successfully`,
          ),
      },
    );
  }

  return (
    <div className="flex flex-col min-h-full">
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
                      colSpan={7}
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
