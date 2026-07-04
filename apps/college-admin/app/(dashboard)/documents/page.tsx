"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  FileText,
  Plus,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Inbox,
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
  DialogTrigger,
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
  useSubmissionRequests,
  useCreateSubmissionRequest,
  useReviewSubmission,
} from "@/hooks/use-documents";
import type {
  DocumentCategory,
  DocumentSubmissionStatus,
} from "@beaconu/types";

const STATUS_LABELS: Record<DocumentSubmissionStatus, string> = {
  pending: "Pending",
  under_review: "Under Review",
  verified: "Verified",
  rejected: "Rejected",
};

const CATEGORY_OPTIONS: { value: DocumentCategory; label: string }[] = [
  { value: "academic", label: "Academic" },
  { value: "identification", label: "Identification" },
  { value: "financial", label: "Financial" },
  { value: "medical", label: "Medical" },
  { value: "administrative", label: "Administrative" },
  { value: "other", label: "Other" },
];

const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  academic: "Academic",
  identification: "Identification",
  financial: "Financial",
  medical: "Medical",
  administrative: "Administrative",
  other: "Other",
};

const STATUS_VARIANT: Record<
  DocumentSubmissionStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "outline",
  under_review: "secondary",
  verified: "default",
  rejected: "destructive",
};

const createSchema = z.object({
  student_id: z.string().trim().min(1, "Student ID is required"),
  document_category: z.enum(
    [
      "academic",
      "identification",
      "financial",
      "medical",
      "administrative",
      "other",
    ],
    { message: "Select a document category" },
  ),
  document_name: z.string().trim().min(1, "Document name is required"),
  instructions: z.string().trim().optional(),
  deadline: z.string().min(1, "Deadline is required"),
});
type CreateForm = z.infer<typeof createSchema>;

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00Z").toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function DocumentSubmissionRequestsPage() {
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading } = useSubmissionRequests({
    status: statusFilter || undefined,
    page,
    limit: 20,
  });
  const { mutate: create, isPending: isCreating } =
    useCreateSubmissionRequest();
  const { mutate: review, isPending: isReviewing } = useReviewSubmission();

  const form = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      student_id: "",
      document_category: undefined,
      document_name: "",
      instructions: "",
      deadline: "",
    },
  });

  function onSubmit(values: CreateForm) {
    create(
      {
        student_id: values.student_id,
        document_category: values.document_category,
        document_name: values.document_name,
        instructions: values.instructions || undefined,
        deadline: values.deadline,
      },
      {
        onSuccess: () => {
          toast.success("Document request created");
          setOpen(false);
          form.reset();
        },
      },
    );
  }

  function handleVerify(requestId: string) {
    review(
      { requestId, data: { status: "verified" } },
      { onSuccess: () => toast.success("Document verified") },
    );
  }

  function handleReject() {
    if (!rejectingId || !rejectReason.trim()) return;
    review(
      {
        requestId: rejectingId,
        data: { status: "rejected", rejection_reason: rejectReason },
      },
      {
        onSuccess: () => {
          toast.success("Document rejected");
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
          <h1 className="text-2xl font-bold tracking-tight">
            Documents Requested From Students
          </h1>
          <p className="text-sm text-muted-foreground">
            Ask a student to submit a document by a deadline, then verify it.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/documents/requests">
              <Inbox className="mr-1.5 h-3.5 w-3.5" />
              Requests From Students
            </Link>
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1.5 h-4 w-4" />
                Request Document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Request a Document</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="student_id">Student ID</Label>
                  <Input
                    id="student_id"
                    placeholder="e.g. STU-3"
                    {...form.register("student_id")}
                  />
                  {form.formState.errors.student_id && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.student_id.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="document_category">Document Category</Label>
                  <Controller
                    name="document_category"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger id="document_category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORY_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.document_category && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.document_category.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="document_name">Document Name</Label>
                  <Input
                    id="document_name"
                    placeholder="e.g. Aadhar Card, 10th Marksheet"
                    {...form.register("document_name")}
                  />
                  {form.formState.errors.document_name && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.document_name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    {...form.register("deadline")}
                  />
                  {form.formState.errors.deadline && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.deadline.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="instructions">
                    Instructions{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <textarea
                    id="instructions"
                    rows={3}
                    placeholder="e.g. Upload a clear scan of both sides"
                    {...form.register("instructions")}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create Request"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
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
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
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
                  Deadline
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Status
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  File
                </TableHead>
                <TableHead className="w-[200px] py-4 pr-6 text-right text-xs font-semibold uppercase tracking-wide">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b last:border-0">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j} className="py-4">
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-20 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-8 w-8 text-muted-foreground/50" />
                      <p>No document requests yet.</p>
                    </div>
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
                    <TableCell className="py-4">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">{r.documentName}</p>
                        <p className="text-xs text-muted-foreground">
                          {CATEGORY_LABELS[r.documentCategory]}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      {formatDate(r.deadline)}
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant={STATUS_VARIANT[r.status]}>
                        {STATUS_LABELS[r.status]}
                      </Badge>
                      {r.status === "rejected" && r.rejectionReason && (
                        <p className="mt-1 max-w-[180px] truncate text-xs text-destructive">
                          {r.rejectionReason}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="py-4 text-sm">
                      {r.fileUrl ? (
                        <a
                          href={r.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right">
                      {r.status === "under_review" && (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 text-xs text-emerald-600 hover:text-emerald-600"
                            disabled={isReviewing}
                            onClick={() => handleVerify(r.id)}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
                            disabled={isReviewing}
                            onClick={() => setRejectingId(r.id)}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </Button>
                        </div>
                      )}
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

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">Reject Document</h2>
            <div className="space-y-1">
              <Label>Reason for rejection</Label>
              <textarea
                rows={3}
                placeholder="Let the student know what's wrong..."
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
                disabled={isReviewing || !rejectReason.trim()}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isReviewing ? "Rejecting..." : "Confirm Rejection"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
