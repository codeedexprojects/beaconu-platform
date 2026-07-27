"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Inbox,
  ExternalLink,
  Upload,
  XCircle,
  Loader2,
  PlayCircle,
  Send,
  CheckCircle2,
  Paperclip,
  Phone,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  useDocumentRequests,
  useStartReviewDocumentRequest,
  useSendForApprovalDocumentRequest,
  useApproveDocumentRequest,
  useIssueDocumentRequest,
  useRejectDocumentRequest,
} from "@/hooks/use-documents";
import { uploadCollegeAdminFile } from "@/lib/services/colleges.service";
import {
  DocumentRequestStatus,
  type DocumentRequestItem,
} from "@beaconu/types";

const STATUS_LABELS: Record<DocumentRequestStatus, string> = {
  submitted: "Submitted",
  processing: "Processing",
  awaiting_approval: "Awaiting Approval",
  approved: "Approved",
  rejected: "Rejected",
  issued: "Issued",
  collected: "Collected",
};

const STATUS_VARIANT: Record<
  DocumentRequestStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  submitted: "secondary",
  processing: "secondary",
  awaiting_approval: "secondary",
  approved: "default",
  rejected: "destructive",
  issued: "default",
  collected: "outline",
};

export default function DocumentRequestsFromStudentsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [viewingRequest, setViewingRequest] =
    useState<DocumentRequestItem | null>(null);
  const [pendingIssue, setPendingIssue] = useState<{
    requestId: string;
    file: File;
  } | null>(null);
  const [pickupInstructions, setPickupInstructions] = useState("");
  const [officeContactPhone, setOfficeContactPhone] = useState("");

  const { data, isLoading } = useDocumentRequests({
    status: statusFilter || undefined,
    page,
    limit: 20,
  });
  const { mutate: startReview, isPending: isStartingReview } =
    useStartReviewDocumentRequest();
  const { mutate: sendForApproval, isPending: isSendingForApproval } =
    useSendForApprovalDocumentRequest();
  const { mutate: approve, isPending: isApproving } =
    useApproveDocumentRequest();
  const { mutate: issue, isPending: isIssuing } = useIssueDocumentRequest();
  const { mutate: reject, isPending: isRejecting } = useRejectDocumentRequest();

  const REJECTABLE_STATUSES: DocumentRequestStatus[] = [
    DocumentRequestStatus.Submitted,
    DocumentRequestStatus.Processing,
    DocumentRequestStatus.AwaitingApproval,
  ];

  function handleStartReview(requestId: string) {
    startReview(requestId, {
      onSuccess: () => toast.success("Marked as under review"),
    });
  }

  function handleSendForApproval(requestId: string) {
    sendForApproval(requestId, {
      onSuccess: () => toast.success("Sent for approval"),
    });
  }

  function handleApprove(requestId: string) {
    approve(requestId, {
      onSuccess: () => toast.success("Document request approved"),
    });
  }

  async function issueNow(
    requestId: string,
    file: File,
    extra?: { pickup_instructions: string; office_contact_phone: string },
  ) {
    try {
      setUploadingId(requestId);
      const url = await uploadCollegeAdminFile(file, "documents/issued");
      issue(
        {
          requestId,
          data: {
            document_url: url,
            file_name: file.name,
            file_size_bytes: file.size,
            ...extra,
          },
        },
        {
          onSuccess: () => toast.success("Document issued to student"),
        },
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingId(null);
    }
  }

  function handleIssue(
    requestId: string,
    file: File | null,
    deliveryMode: string,
  ) {
    if (!file) return;
    if (deliveryMode === "pickup") {
      setPendingIssue({ requestId, file });
      setPickupInstructions("");
      setOfficeContactPhone("");
      return;
    }
    void issueNow(requestId, file);
  }

  function handleConfirmPickupIssue() {
    if (
      !pendingIssue ||
      !pickupInstructions.trim() ||
      !officeContactPhone.trim()
    ) {
      return;
    }
    void issueNow(pendingIssue.requestId, pendingIssue.file, {
      pickup_instructions: pickupInstructions,
      office_contact_phone: officeContactPhone,
    }).then(() => setPendingIssue(null));
  }

  function handleReject() {
    if (!rejectingId || !rejectReason.trim()) return;
    reject(
      { requestId: rejectingId, data: { rejection_reason: rejectReason } },
      {
        onSuccess: () => {
          toast.success("Document request rejected");
          setRejectingId(null);
          setRejectReason("");
        },
      },
    );
  }

  const requests = data?.requests ?? [];
  const meta = data?.meta;

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 -ml-2" asChild>
            <Link href="/documents">
              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            Documents Requested By Students
          </h1>
          <p className="text-sm text-muted-foreground">
            Official documents (e.g. bonafide certificates) students have asked
            for — upload the issued file or decline.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/documents">
            <Inbox className="mr-1.5 h-3.5 w-3.5" />
            Requests From College
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v === "all" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-9 w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="awaiting_approval">Awaiting Approval</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="issued">Issued</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="collected">Collected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-hidden rounded-xl border shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="py-4 pl-6 text-xs font-semibold uppercase tracking-wide">
                  Student
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Document
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Delivery
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Status
                </TableHead>
                <TableHead className="w-[220px] py-4 pr-6 text-right text-xs font-semibold uppercase tracking-wide">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b last:border-0">
                    {Array.from({ length: 5 }).map((__, j) => (
                      <TableCell key={j} className="py-4">
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-20 text-center text-muted-foreground"
                  >
                    No document requests from students yet.
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((r) => (
                  <TableRow
                    key={r.id}
                    className="border-b last:border-0 transition-colors hover:bg-muted/30"
                  >
                    <TableCell className="py-4 pl-6">
                      <div className="space-y-0.5">
                        <p className="font-medium text-sm">
                          {r.student?.fullName ?? r.studentId}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {r.student?.email ?? ""}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 max-w-[220px]">
                      <div className="space-y-0.5">
                        <p className="truncate text-sm font-medium">
                          {r.documentName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {r.requestNumber}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-sm capitalize text-muted-foreground">
                      {r.deliveryMode}
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant={STATUS_VARIANT[r.status]}>
                        {STATUS_LABELS[r.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 text-xs"
                          onClick={() => setViewingRequest(r)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Details
                        </Button>
                        {r.status === "submitted" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 text-xs"
                            disabled={isStartingReview}
                            onClick={() => handleStartReview(r.id)}
                          >
                            <PlayCircle className="h-3.5 w-3.5" />
                            Start Review
                          </Button>
                        )}
                        {r.status === "processing" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 text-xs"
                            disabled={isSendingForApproval}
                            onClick={() => handleSendForApproval(r.id)}
                          >
                            <Send className="h-3.5 w-3.5" />
                            Send for Approval
                          </Button>
                        )}
                        {r.status === "awaiting_approval" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 text-xs text-emerald-600 hover:text-emerald-600"
                            disabled={isApproving}
                            onClick={() => handleApprove(r.id)}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Approve
                          </Button>
                        )}
                        {r.status === "approved" && (
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              className="sr-only"
                              disabled={isIssuing || uploadingId === r.id}
                              onChange={(e) =>
                                handleIssue(
                                  r.id,
                                  e.target.files?.[0] ?? null,
                                  r.deliveryMode,
                                )
                              }
                            />
                            <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-accent">
                              {uploadingId === r.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Upload className="h-3.5 w-3.5" />
                              )}
                              Issue
                            </span>
                          </label>
                        )}
                        {REJECTABLE_STATUSES.includes(r.status) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
                            disabled={isRejecting}
                            onClick={() => setRejectingId(r.id)}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {meta && meta.total > 20 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {meta.page} of {Math.ceil(meta.total / 20)} · {meta.total}{" "}
            total
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasNext}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Details Dialog */}
      <Dialog
        open={!!viewingRequest}
        onOpenChange={(v) => !v && setViewingRequest(null)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Document Request Details</DialogTitle>
          </DialogHeader>
          {viewingRequest && (
            <div className="divide-y text-sm">
              <div className="space-y-1.5 pb-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Student
                </p>
                <p className="text-base font-medium leading-snug">
                  {viewingRequest.student?.fullName ?? viewingRequest.studentId}
                </p>
                <p className="text-sm text-muted-foreground">
                  {viewingRequest.student?.email ?? ""}
                </p>
              </div>

              <div className="space-y-1.5 py-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Document
                </p>
                <p className="text-base font-medium leading-snug">
                  {viewingRequest.documentName}
                </p>
                <p className="text-sm capitalize text-muted-foreground">
                  {viewingRequest.requestNumber} · {viewingRequest.deliveryMode}
                </p>
                {viewingRequest.description && (
                  <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                    {viewingRequest.description}
                  </p>
                )}
              </div>

              {viewingRequest.supportingDocuments.length > 0 && (
                <div className="space-y-2 py-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Supporting Documents
                  </p>
                  <div className="flex flex-col gap-2">
                    {viewingRequest.supportingDocuments.map((doc, i) => (
                      <a
                        key={i}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-primary hover:underline"
                      >
                        <Paperclip className="h-3.5 w-3.5 shrink-0" />
                        {doc.name ?? `Attachment ${i + 1}`}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2 py-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Status
                </p>
                <Badge variant={STATUS_VARIANT[viewingRequest.status]}>
                  {STATUS_LABELS[viewingRequest.status]}
                </Badge>
                {viewingRequest.status === "issued" &&
                  viewingRequest.issuedDocumentUrl && (
                    <a
                      href={viewingRequest.issuedDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-primary hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      View issued file
                    </a>
                  )}
              </div>

              {viewingRequest.deliveryMode === "pickup" &&
                viewingRequest.pickupInstructions && (
                  <div className="py-5">
                    <div className="space-y-2 rounded-md bg-muted/50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Pickup Instructions
                      </p>
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {viewingRequest.pickupInstructions}
                      </p>
                      {viewingRequest.officeContactPhone && (
                        <p className="flex items-center gap-1.5 font-medium">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          {viewingRequest.officeContactPhone}
                        </p>
                      )}
                    </div>
                  </div>
                )}

              {viewingRequest.rejectionReason && (
                <div className="space-y-1.5 py-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Rejection Reason
                  </p>
                  <p className="whitespace-pre-wrap leading-relaxed text-destructive">
                    {viewingRequest.rejectionReason}
                  </p>
                </div>
              )}

              {viewingRequest.resubmissionCount > 0 && (
                <div className="space-y-2 py-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Resubmission History ({viewingRequest.resubmissionCount})
                  </p>
                  <ul className="space-y-3 border-l-2 pl-4">
                    {viewingRequest.resubmissionHistory.map((h, i) => (
                      <li
                        key={i}
                        className="space-y-0.5 text-sm text-muted-foreground"
                      >
                        <p className="text-destructive">
                          Rejected: {h.rejectionReason}
                        </p>
                        <p>
                          Resubmitted{" "}
                          {new Date(h.resubmittedAt).toLocaleString("en-IN")}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-2 pt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Status History
                </p>
                <ul className="space-y-1.5 border-l-2 pl-4 text-sm text-muted-foreground">
                  {viewingRequest.statusHistory.map((h, i) => (
                    <li key={i}>
                      <span className="font-medium text-foreground">
                        {h.status}
                      </span>{" "}
                      — {new Date(h.changedAt).toLocaleString("en-IN")}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Pickup Details Modal */}
      {pendingIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">Pickup Details</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              This request is for in-person pickup — tell the student where and
              how to collect it.
            </p>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>Pickup instructions</Label>
                <textarea
                  rows={3}
                  placeholder="e.g. Visit the Admissions Office, Ground Floor, Mon-Fri 10am-4pm"
                  value={pickupInstructions}
                  onChange={(e) => setPickupInstructions(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-1">
                <Label>Office contact phone</Label>
                <Input
                  placeholder="+91 9876543210"
                  value={officeContactPhone}
                  onChange={(e) => setOfficeContactPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPendingIssue(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmPickupIssue}
                disabled={
                  isIssuing ||
                  uploadingId === pendingIssue.requestId ||
                  !pickupInstructions.trim() ||
                  !officeContactPhone.trim()
                }
              >
                {uploadingId === pendingIssue.requestId
                  ? "Issuing..."
                  : "Confirm & Issue"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">
              Reject Document Request
            </h2>
            <div className="space-y-1">
              <Label>Reason for rejection</Label>
              <textarea
                rows={3}
                placeholder="Let the student know why..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setRejectingId(null);
                  setRejectReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                disabled={isRejecting || !rejectReason.trim()}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isRejecting ? "Rejecting..." : "Confirm Rejection"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
