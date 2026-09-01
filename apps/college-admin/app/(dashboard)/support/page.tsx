"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Search,
  SlidersHorizontal,
  Mail,
  CheckCircle2,
  Calendar,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useCollegeTickets, useTicketStats } from "@/hooks/use-support-tickets";
import type { TicketStatus } from "@beaconu/types";

const STATUS_OPTIONS: { label: string; value: TicketStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "In Progress", value: "in_progress" },
  { label: "Awaiting Response", value: "awaiting_response" },
  { label: "Resolved", value: "resolved" },
  { label: "Closed", value: "closed" },
  { label: "Reopened", value: "reopened" },
];

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: number | undefined;
}) {
  return (
    <div className="flex-1 rounded-2xl border border-border bg-white p-5">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-pale text-gold">
          <Icon className="h-4 w-4" />
        </span>
        {label}
      </div>
      <p className="font-serif text-3xl font-bold text-navy">{value ?? "—"}</p>
    </div>
  );
}

export default function SupportTicketsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TicketStatus | "all">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: stats } = useTicketStats();
  const { data, isLoading } = useCollegeTickets({
    search: search || undefined,
    status: status === "all" ? undefined : status,
    page,
    limit,
  });

  const tickets = data?.tickets ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-navy">
          Admission Inquiry Desk
        </h1>
        <Button variant="outline" onClick={() => setShowFilters((s) => !s)}>
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filter View
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <StatCard
          icon={Mail}
          label="Active Inquiries"
          value={stats?.activeCount}
        />
        <StatCard
          icon={CheckCircle2}
          label="Resolved Today"
          value={stats?.resolvedTodayCount}
        />
      </div>

      {showFilters && (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search by subject, ticket #, or student name"
              className="h-10 w-full rounded-full border border-border pl-10 pr-4 text-sm outline-none focus:border-gold"
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
              setStatus(v as TicketStatus | "all");
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
        </div>
      )}

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-white p-6"
            >
              <Skeleton className="h-4 w-40" />
              <Skeleton className="mt-3 h-16 w-full" />
            </div>
          ))
        ) : tickets.length === 0 ? (
          <div className="rounded-2xl border border-dashed py-16 text-center text-sm text-muted-foreground">
            No student queries yet.
          </div>
        ) : (
          tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-6 shadow-sm sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="flex flex-1 gap-4">
                {ticket.studentPhotoUrl ? (
                  <Image
                    src={ticket.studentPhotoUrl}
                    alt={ticket.studentName}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-pale font-serif text-base font-bold text-gold">
                    {initials(ticket.studentName)}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-base font-bold text-navy">
                    {ticket.studentName}
                  </p>
                  <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                    Ticket #{ticket.ticketNumber.slice(-6).toUpperCase()}
                  </p>
                  <div className="mt-2 rounded-lg bg-muted/40 p-3">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-gold">
                      Student Query
                    </p>
                    <p className="text-sm italic text-navy">
                      &quot;{ticket.preview ?? ticket.subject}&quot;
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Received on {formatDateTime(ticket.createdAt)}
                </p>
                <Button
                  className="bg-navy text-white hover:bg-navy/90"
                  onClick={() => router.push(`/support/${ticket.id}`)}
                >
                  Respond →
                </Button>
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
    </div>
  );
}
