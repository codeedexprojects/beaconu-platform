"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, SlidersHorizontal, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useSeatCancellations } from "@/hooks/use-seat-cancellations";
import type {
  SeatCancellationRequest,
  SeatCancellationStatus,
} from "@beaconu/types";

type ListBadge =
  | "PENDING REVIEW"
  | "DOCUMENT PENDING"
  | "SETTLED"
  | "REFUND SETTLED"
  | "REJECTED";

const LIST_BADGE_TEXT_CLASS: Record<ListBadge, string> = {
  "PENDING REVIEW": "text-amber-600",
  "DOCUMENT PENDING": "text-orange-600",
  SETTLED: "text-emerald-600",
  "REFUND SETTLED": "text-emerald-600",
  REJECTED: "text-red-600",
};

// Derives the richer 5-phase list label from the underlying status/phase/
// case fields — see SeatCancellationService for the phase definitions.
function deriveListBadge(request: SeatCancellationRequest): ListBadge {
  if (request.status === "rejected") return "REJECTED";
  if (request.currentPhase >= 5) {
    return request.caseType === "B" ? "REFUND SETTLED" : "SETTLED";
  }
  if (request.status === "approved") return "SETTLED";
  if (request.currentPhase === 5) return "DOCUMENT PENDING";
  return "PENDING REVIEW";
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function initials(name: string | null, fallback: string) {
  const source = name?.trim() || fallback;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export default function SeatCancellationsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<
    SeatCancellationStatus | "all"
  >("pending");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [accumulated, setAccumulated] = useState<SeatCancellationRequest[]>([]);
  const limit = 20;

  const { data, isLoading, isFetching } = useSeatCancellations({
    status: statusFilter === "all" ? undefined : statusFilter,
    page,
    limit,
  });

  useEffect(() => {
    if (!data) return;
    setAccumulated((prev) =>
      page === 1 ? data.requests : [...prev, ...data.requests],
    );
  }, [data, page]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const meta = data?.meta;
  const filtered = accumulated.filter((r) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      (r.studentName ?? "").toLowerCase().includes(q) ||
      r.courseName.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-5">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-navy">
          Cancellation &amp; Withdrawals
        </h1>
        <p className="text-sm text-muted-foreground">
          Review and process students&apos; requests to cancel their confirmed
          seat.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, ID, or application no..."
            className="h-11 w-full rounded-full border border-border bg-white pl-10 pr-4 text-sm outline-none focus:border-gold"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) =>
            setStatusFilter(v as SeatCancellationStatus | "all")
          }
        >
          <SelectTrigger className="h-11 w-full gap-2 rounded-full border-border bg-white sm:w-52">
            <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue placeholder="Filter Registry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-gold" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 border border-dashed rounded-2xl text-muted-foreground text-sm">
            No {statusFilter !== "all" ? statusFilter : ""} cancellation
            requests.
          </div>
        ) : (
          filtered.map((request) => {
            const badge = deriveListBadge(request);
            return (
              <div
                key={request.id}
                className="flex items-center gap-4 rounded-2xl border-y border-r border-y-border border-r-border border-l-4 border-l-gold bg-white p-4 shadow-sm"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white">
                  {initials(request.studentName, request.studentId)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm text-navy">
                    {request.studentName ?? request.studentId}
                  </div>
                  <div className="text-xs">
                    <span className="font-medium text-gold">
                      ID: {request.id}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {request.courseName}
                  </div>
                </div>
                <div className="hidden text-right sm:block">
                  <p
                    className={cn(
                      "text-xs font-bold uppercase tracking-wide",
                      LIST_BADGE_TEXT_CLASS[badge],
                    )}
                  >
                    {badge}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatDate(request.requestedAt)}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="shrink-0 rounded-full bg-navy px-4 text-white hover:bg-navy/90"
                  onClick={() =>
                    router.push(`/seat-cancellations/${request.id}`)
                  }
                >
                  View Case →
                </Button>
              </div>
            );
          })
        )}
      </div>

      {meta?.hasNextPage && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            disabled={isFetching}
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-navy disabled:opacity-50"
          >
            {isFetching ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
            Load More Records
          </button>
        </div>
      )}

      {meta && (
        <p className="text-center text-xs text-muted-foreground">
          Showing {filtered.length} of {meta.total} record
          {meta.total === 1 ? "" : "s"}
        </p>
      )}
    </div>
  );
}
