"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Search,
  SlidersHorizontal,
  ArrowRight,
  List,
  LayoutGrid,
  ChevronDown,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useApplications } from "@/hooks/use-applications";
import { useAdmissionCycles } from "@/hooks/use-admission-cycles";
import type { ApplicationListItem } from "@beaconu/types";

const FORM_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
};

const AVATAR_PALETTE = [
  "bg-neutral-100 text-neutral-700",
  "bg-amber-100 text-amber-800",
  "bg-blue-100 text-blue-800",
  "bg-emerald-100 text-emerald-800",
  "bg-violet-100 text-violet-800",
  "bg-rose-100 text-rose-800",
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function avatarColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++)
    hash = (hash + seed.charCodeAt(i)) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[hash];
}

function relativeDate(dateStr: string | null) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function Avatar({
  seed,
  name,
  photoUrl,
}: {
  seed: string;
  name: string;
  photoUrl: string | null;
}) {
  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt={name}
        width={48}
        height={48}
        className="h-12 w-12 rounded-full object-cover"
      />
    );
  }
  return (
    <span
      className={`flex h-12 w-12 items-center justify-center rounded-full font-serif text-base font-bold ${avatarColor(seed)}`}
    >
      {initials(name)}
    </span>
  );
}

function ApplicantCard({
  app,
  view,
  onClick,
}: {
  app: ApplicationListItem;
  view: "list" | "grid";
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-4 rounded-2xl border border-border bg-white p-5 shadow-sm transition-colors hover:border-gold ${
        view === "grid" ? "flex-col text-center" : ""
      }`}
    >
      <Avatar
        seed={app.id}
        name={app.studentName}
        photoUrl={app.profilePhotoUrl}
      />
      <div className={`min-w-0 flex-1 ${view === "grid" ? "w-full" : ""}`}>
        <p className="truncate font-serif text-base font-bold text-navy">
          {app.studentName}
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          #{app.applicationNumber} · Applied: {relativeDate(app.submittedAt)}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary" className="text-[10px]">
            {FORM_STATUS_LABELS[app.formStatus] ?? app.formStatus}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {PAYMENT_STATUS_LABELS[app.feePaymentStatus] ??
              app.feePaymentStatus}
          </Badge>
        </div>
      </div>
      {view === "list" && (
        <Button
          size="icon"
          variant="outline"
          className="rounded-full border-gold text-gold hover:bg-gold-pale"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export default function ApplicationsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [cycleFilter, setCycleFilter] = useState("");
  const [formStatusFilter, setFormStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState<"list" | "grid">("list");
  const [sortNewestFirst, setSortNewestFirst] = useState(true);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<ApplicationListItem[]>([]);

  const { data: cycles } = useAdmissionCycles();

  const { data, isLoading, isFetching } = useApplications({
    search: search || undefined,
    admission_cycle_id: cycleFilter || undefined,
    form_status: formStatusFilter || undefined,
    fee_payment_status: paymentStatusFilter || undefined,
    page,
    limit: 20,
  });

  // Filters/search changing resets the accumulated Load More list.
  useEffect(() => {
    setPage(1);
    setRows([]);
  }, [search, cycleFilter, formStatusFilter, paymentStatusFilter]);

  useEffect(() => {
    if (!data) return;
    setRows((prev) =>
      page === 1 ? data.applications : [...prev, ...data.applications],
    );
  }, [data, page]);

  const meta = data?.meta;
  const sortedRows = [...rows].sort((a, b) => {
    const diff =
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return sortNewestFirst ? diff : -diff;
  });

  const hasFilters =
    search || cycleFilter || formStatusFilter || paymentStatusFilter;

  function clearFilters() {
    setSearch("");
    setCycleFilter("");
    setFormStatusFilter("");
    setPaymentStatusFilter("");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-navy">
            Applicants Directory
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage and process student applications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border bg-white p-0.5">
            <button
              type="button"
              onClick={() => setView("list")}
              className={`rounded-md p-1.5 ${view === "list" ? "bg-navy text-white" : "text-muted-foreground"}`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setView("grid")}
              className={`rounded-md p-1.5 ${view === "grid" ? "bg-navy text-white" : "text-muted-foreground"}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
          <Button variant="outline" onClick={() => setShowFilters((s) => !s)}>
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-white p-4">
          <Select
            value={cycleFilter}
            onValueChange={(v) => setCycleFilter(v === "all" ? "" : v)}
          >
            <SelectTrigger className="h-9 w-56">
              <SelectValue placeholder="All admission cycles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All admission cycles</SelectItem>
              {(cycles ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={formStatusFilter}
            onValueChange={(v) => setFormStatusFilter(v === "all" ? "" : v)}
          >
            <SelectTrigger className="h-9 w-44">
              <SelectValue placeholder="All form statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All form statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={paymentStatusFilter}
            onValueChange={(v) => setPaymentStatusFilter(v === "all" ? "" : v)}
          >
            <SelectTrigger className="h-9 w-44">
              <SelectValue placeholder="All payment statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All payment statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, application #..."
          className="h-11 w-full rounded-full border border-border bg-white pl-10 pr-4 text-sm outline-none focus:border-gold"
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-navy">
          Showing {rows.length} of {meta?.total ?? 0} Applicants
        </span>
        <button
          type="button"
          onClick={() => setSortNewestFirst((s) => !s)}
          className="flex items-center gap-1 text-muted-foreground"
        >
          Sort by: Date {sortNewestFirst ? "(Newest)" : "(Oldest)"}
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {isLoading ? (
        <div
          className={
            view === "grid"
              ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              : "space-y-3"
          }
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-white p-5"
            >
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="mt-3 h-4 w-32" />
              <Skeleton className="mt-2 h-3 w-24" />
            </div>
          ))}
        </div>
      ) : sortedRows.length === 0 ? (
        <div className="rounded-2xl border border-dashed py-20 text-center text-sm text-muted-foreground">
          No applications found.
        </div>
      ) : (
        <div
          className={
            view === "grid"
              ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              : "space-y-3"
          }
        >
          {sortedRows.map((app) => (
            <ApplicantCard
              key={app.id}
              app={app}
              view={view}
              onClick={() => router.push(`/applications/${app.id}`)}
            />
          ))}
        </div>
      )}

      {meta?.hasNext && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            disabled={isFetching}
            onClick={() => setPage((p) => p + 1)}
          >
            {isFetching ? "Loading..." : "Load More Applicants"}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
