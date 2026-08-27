"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useCallRequests } from "@/hooks/use-call-requests";
import type { CallRequestStatus } from "@beaconu/types";

const STATUS_OPTIONS: { label: string; value: CallRequestStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Contacted", value: "contacted" },
  { label: "Cancelled", value: "cancelled" },
];

const STATUS_BADGE_CLASS: Record<CallRequestStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  contacted: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-muted text-muted-foreground border-border/60",
};

const STATUS_LABEL: Record<CallRequestStatus, string> = {
  pending: "Pending",
  contacted: "Contacted",
  cancelled: "Cancelled",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CallRequestsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CallRequestStatus | "all">("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = useCallRequests({
    search: search || undefined,
    status: status === "all" ? undefined : status,
    page,
    limit,
  });

  const callRequests = data?.callRequests ?? [];
  const meta = data?.meta;
  const pendingCount = callRequests.filter(
    (r) => r.status === "pending",
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Call Requests</h1>
          <p className="text-sm text-muted-foreground">
            Students requesting a call back — including prospective students who
            aren&apos;t enrolled yet.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by phone number or student name"
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v as CallRequestStatus | "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {pendingCount > 0 && (
          <Badge variant="destructive" className="px-3 py-1 self-center">
            {pendingCount} pending
          </Badge>
        )}
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Preferred Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Requested</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : callRequests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No call requests yet.
                </TableCell>
              </TableRow>
            ) : (
              callRequests.map((request) => (
                <TableRow
                  key={request.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/call-requests/${request.id}`)}
                >
                  <TableCell>
                    <div className="font-medium">{request.studentName}</div>
                    <div className="text-xs text-muted-foreground">
                      {request.studentEmail ?? "—"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-sm">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      {request.phoneNumber}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {request.preferredTime ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={STATUS_BADGE_CLASS[request.status]}
                    >
                      {STATUS_LABEL[request.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(request.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
    </div>
  );
}
