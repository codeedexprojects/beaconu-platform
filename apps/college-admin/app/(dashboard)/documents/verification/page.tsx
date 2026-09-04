"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, Search } from "lucide-react";

import {
  useDocumentsUnderReview,
  usePartiallyVerifiedDocuments,
} from "@/hooks/use-application-documents";
import { useSubmissionRequests } from "@/hooks/use-documents";
import type {
  DocumentVerificationListItem,
  SubmissionRequestItem,
} from "@beaconu/types";

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

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

type TabId = "under_review" | "partially_verified" | "requested_documents";

const TABS: { id: TabId; label: string }[] = [
  { id: "under_review", label: "Documents Under Review" },
  { id: "partially_verified", label: "Partially Verified Documents" },
  { id: "requested_documents", label: "Requested Documents" },
];

function DocumentQueueList({
  applications,
  isLoading,
  actionLabel,
  dateLabel,
  dateValue,
  onSelect,
}: {
  applications: DocumentVerificationListItem[];
  isLoading: boolean;
  actionLabel: string;
  dateLabel: string;
  dateValue: (app: DocumentVerificationListItem) => string | null;
  onSelect: (applicationId: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }
  if (applications.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed py-16 text-center text-sm text-muted-foreground">
        Nothing here right now.
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {applications.map((app) => (
        <div
          key={app.applicationId}
          className="flex items-center gap-4 rounded-2xl border-y border-r border-y-border border-r-border border-l-4 border-l-gold bg-white p-4 shadow-sm"
        >
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${avatarColor(app.studentId)}`}
          >
            {initials(app.studentName)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-navy">
              {app.studentName}
            </div>
            <div className="text-xs font-medium text-gold">
              ID: {app.applicationNumber}
            </div>
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {dateLabel}
            </p>
            <p className="text-xs font-medium text-navy">
              {formatDate(dateValue(app))}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelect(app.applicationId)}
            className="shrink-0 rounded-full bg-navy px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-navy/90"
          >
            {actionLabel}
          </button>
        </div>
      ))}
    </div>
  );
}

// Requested Documents ("Requested From Students", DocumentSubmissionRequest)
// is a separate entity from application documents — keyed by student, not
// application. It already has a fully working Verify/Reject flow on the
// Documents page, so this tab just surfaces what's awaiting review here
// and links out to that existing page rather than re-implementing review.
function RequestedDocumentsTab() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [accumulated, setAccumulated] = useState<SubmissionRequestItem[]>([]);

  const { data, isLoading, isFetching } = useSubmissionRequests({
    status: "under_review",
    page,
    limit: 20,
  });

  useEffect(() => {
    if (!data) return;
    setAccumulated((prev) =>
      page === 1 ? data.requests : [...prev, ...data.requests],
    );
  }, [data, page]);

  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Documents the college requested directly from students, awaiting review.
        Review and Verify/Reject each on the Documents page.
      </p>

      {isLoading && page === 1 ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-gold" />
        </div>
      ) : accumulated.length === 0 ? (
        <div className="rounded-2xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          Nothing awaiting review right now.
        </div>
      ) : (
        <div className="space-y-3">
          {accumulated.map((req) => (
            <div
              key={req.id}
              className="flex items-center gap-4 rounded-2xl border-y border-r border-y-border border-r-border border-l-4 border-l-gold bg-white p-4 shadow-sm"
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${avatarColor(req.studentId)}`}
              >
                {initials(req.student?.fullName ?? req.studentId)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-navy">
                  {req.student?.fullName ?? req.studentId}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {req.documentName}
                </div>
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Submitted
                </p>
                <p className="text-xs font-medium text-navy">
                  {formatDate(req.submittedAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/documents?status=under_review")}
                className="shrink-0 rounded-full bg-navy px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-navy/90"
              >
                Review
              </button>
            </div>
          ))}
        </div>
      )}

      {meta?.hasNext && (
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
            Load More
          </button>
        </div>
      )}

      {meta && (
        <p className="text-center text-xs text-muted-foreground">
          Showing {accumulated.length} of {meta.total} request
          {meta.total === 1 ? "" : "s"}
        </p>
      )}
    </div>
  );
}

export default function DocumentVerificationPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("under_review");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [accumulated, setAccumulated] = useState<
    DocumentVerificationListItem[]
  >([]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
    setAccumulated([]);
  }, [tab, debouncedSearch]);

  const underReview = useDocumentsUnderReview(
    page,
    debouncedSearch || undefined,
    tab === "under_review",
  );
  const partiallyVerified = usePartiallyVerifiedDocuments(
    page,
    debouncedSearch || undefined,
    tab === "partially_verified",
  );
  const active = tab === "under_review" ? underReview : partiallyVerified;

  useEffect(() => {
    if (tab === "requested_documents" || !active.data) return;
    setAccumulated((prev) =>
      page === 1
        ? active.data!.applications
        : [...prev, ...active.data!.applications],
    );
  }, [active.data, page, tab]);

  const meta = tab === "requested_documents" ? undefined : active.data?.meta;

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-5">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-navy">
          Document Verification
        </h1>
        <p className="text-sm text-muted-foreground">
          Review the documents students uploaded with their applications.
        </p>
      </div>

      <div className="flex gap-2 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t.id
                ? "border-b-2 border-gold text-navy"
                : "text-muted-foreground hover:text-navy"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "requested_documents" ? (
        <RequestedDocumentsTab />
      ) : (
        <>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name or application number..."
              className="h-11 w-full rounded-full border border-border bg-white pl-10 pr-4 text-sm outline-none focus:border-gold"
            />
          </div>

          <DocumentQueueList
            applications={accumulated}
            isLoading={active.isLoading && page === 1}
            actionLabel={
              tab === "under_review" ? "Verify" : "Continue Verification"
            }
            dateLabel={
              tab === "under_review" ? "Submission Date" : "Last Update"
            }
            dateValue={(app) =>
              tab === "under_review"
                ? app.submittedAt
                : (app.lastDocumentUpdateAt ?? app.submittedAt)
            }
            onSelect={(applicationId) =>
              router.push(`/documents/verification/${applicationId}`)
            }
          />

          {meta?.hasNext && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                disabled={active.isFetching}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-navy disabled:opacity-50"
              >
                {active.isFetching ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
                Load More Students
              </button>
            </div>
          )}

          {meta && (
            <p className="text-center text-xs text-muted-foreground">
              Showing {accumulated.length} of {meta.total} application
              {meta.total === 1 ? "" : "s"}
            </p>
          )}
        </>
      )}
    </div>
  );
}
