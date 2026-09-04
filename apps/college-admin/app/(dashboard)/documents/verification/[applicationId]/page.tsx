"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  History as HistoryIcon,
  Loader2,
  Mail,
  Phone,
  ExternalLink,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useDocumentVerificationDetail,
  useVerifyDocument,
  useRejectDocument,
} from "@/hooks/use-application-documents";
import type { ApplicationDetailDocumentItem } from "@beaconu/types";

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

function formatLabel(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type DocStatusMeta = {
  label: string;
  variant: "success" | "destructive" | "warning" | "secondary";
};

function getDocStatusMeta(doc: ApplicationDetailDocumentItem): DocStatusMeta {
  if (doc.verificationStatus === "approved") {
    return { label: "Verified", variant: "success" };
  }
  if (doc.verificationStatus === "rejected") {
    return { label: "Rejected", variant: "destructive" };
  }
  if (doc.verificationHistory.length > 0) {
    return { label: "Awaiting Re-verification", variant: "warning" };
  }
  return { label: "Pending Review", variant: "secondary" };
}

function getHeaderStatus(documents: ApplicationDetailDocumentItem[]) {
  const untouched = documents.every(
    (d) =>
      d.verificationStatus === "pending" && d.verificationHistory.length === 0,
  );
  if (untouched)
    return { label: "PENDING REVIEW", variant: "warning" as const };
  const fullyVerified = documents.every(
    (d) => d.verificationStatus === "approved",
  );
  if (fullyVerified)
    return { label: "FULLY VERIFIED", variant: "success" as const };
  return { label: "PARTIALLY VERIFIED", variant: "info" as const };
}

export default function DocumentVerificationDetailPage() {
  const params = useParams<{ applicationId: string }>();
  const applicationId = params.applicationId;

  const { data, isLoading } = useDocumentVerificationDetail(applicationId);
  const verifyMutation = useVerifyDocument(applicationId);
  const rejectMutation = useRejectDocument(applicationId);

  const [rejectTarget, setRejectTarget] =
    useState<ApplicationDetailDocumentItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [historyTarget, setHistoryTarget] =
    useState<ApplicationDetailDocumentItem | null>(null);

  function closeRejectDialog() {
    setRejectTarget(null);
    setRejectReason("");
  }

  function confirmReject() {
    if (!rejectTarget || !rejectReason.trim()) return;
    rejectMutation.mutate(
      { documentId: rejectTarget.id, reason: rejectReason.trim() },
      { onSuccess: closeRejectDialog },
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const grouped = new Map<string, ApplicationDetailDocumentItem[]>();
  for (const doc of data.documents) {
    const key = doc.documentCategory;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(doc);
  }
  const categories = [...grouped.keys()].sort();
  const headerStatus = getHeaderStatus(data.documents);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2" asChild>
        <Link href="/documents/verification">
          <ArrowLeft className="mr-1 h-3.5 w-3.5" />
          Back to Document Verification
        </Link>
      </Button>

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold ${avatarColor(data.studentId)}`}
          >
            {initials(data.studentName)}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-xl font-bold text-navy">
                {data.studentName}
              </h1>
              <Badge variant={headerStatus.variant}>{headerStatus.label}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              ID: {data.applicationNumber}
              {data.primaryCourseName &&
                ` · Program: ${data.primaryCourseName}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {data.studentEmail && (
            <Button variant="outline" size="icon" asChild>
              <a href={`mailto:${data.studentEmail}`}>
                <Mail className="h-4 w-4" />
              </a>
            </Button>
          )}
          {data.studentPhone && (
            <Button variant="outline" size="icon" asChild>
              <a href={`tel:${data.studentPhone}`}>
                <Phone className="h-4 w-4" />
              </a>
            </Button>
          )}
          <Button variant="outline" size="icon" asChild>
            <Link href={`/applications/${data.applicationId}`}>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {categories.map((category) => (
        <div
          key={category}
          className="rounded-2xl border border-border bg-white p-5 shadow-sm"
        >
          <h2 className="mb-4 font-serif text-lg font-bold text-navy">
            {formatLabel(category)}
          </h2>
          <div className="space-y-3">
            {grouped.get(category)!.map((doc) => {
              const statusMeta = getDocStatusMeta(doc);
              const isResubmission =
                doc.verificationStatus === "pending" &&
                doc.verificationHistory.length > 0;
              const latestRejection =
                doc.verificationHistory[doc.verificationHistory.length - 1];
              return (
                <div
                  key={doc.id}
                  className="rounded-xl border border-border p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-navy">
                        {formatLabel(doc.documentType)}
                      </p>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        View Document
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusMeta.variant}>
                        {statusMeta.label}
                      </Badge>
                      {doc.verificationHistory.length > 0 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setHistoryTarget(doc)}
                        >
                          <HistoryIcon className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {doc.verificationStatus === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-destructive text-destructive hover:bg-destructive/10"
                            onClick={() => setRejectTarget(doc)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                            disabled={
                              verifyMutation.isPending &&
                              verifyMutation.variables === doc.id
                            }
                            onClick={() => verifyMutation.mutate(doc.id)}
                          >
                            {verifyMutation.isPending &&
                            verifyMutation.variables === doc.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  {isResubmission && latestRejection && (
                    <div className="mt-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-destructive">
                        Previous Rejection Insight
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        &quot;{latestRejection.reason}&quot;
                      </p>
                    </div>
                  )}
                  {!isResubmission &&
                    doc.verificationStatus === "rejected" &&
                    doc.rejectionReason && (
                      <p className="mt-2 text-xs text-destructive">
                        {doc.rejectionReason}
                      </p>
                    )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <Dialog
        open={rejectTarget !== null}
        onOpenChange={(open) => !open && closeRejectDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Specify Rejection Reason</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Reason</Label>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="Type reason here..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeRejectDialog}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectReason.trim() || rejectMutation.isPending}
              onClick={confirmReject}
            >
              {rejectMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Submit Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={historyTarget !== null}
        onOpenChange={(open) => !open && setHistoryTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejection Details</DialogTitle>
          </DialogHeader>
          {historyTarget && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {formatLabel(historyTarget.documentType)} History
              </p>
              <ul className="space-y-3 border-l-2 pl-4">
                {historyTarget.verificationHistory.map((entry, i) => (
                  <li key={i} className="space-y-0.5 text-sm">
                    <p className="font-semibold text-navy">
                      {formatDateTime(entry.rejectedAt)}
                    </p>
                    <p className="text-muted-foreground">{entry.reason}</p>
                    <p className="text-xs text-muted-foreground">
                      Reviewed by {entry.rejectedByName}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryTarget(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
