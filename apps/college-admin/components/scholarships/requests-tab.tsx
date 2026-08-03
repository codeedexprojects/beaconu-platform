"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  useScholarshipApplications,
  useReviewScholarshipApplication,
} from "@/hooks/use-scholarships";
import type {
  ScholarshipApplicationItem,
  ScholarshipApplicationStatus,
} from "@beaconu/types";

const STATUS_VARIANT: Record<
  ScholarshipApplicationStatus,
  "default" | "secondary" | "destructive"
> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ScholarshipRequestsTab() {
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [reviewing, setReviewing] = useState<ScholarshipApplicationItem | null>(
    null,
  );
  const [action, setAction] = useState<"approve" | "reject">("approve");
  const [discountAmount, setDiscountAmount] = useState("");
  const [reviewRemarks, setReviewRemarks] = useState("");

  const { data: applications, isLoading } = useScholarshipApplications(
    statusFilter === "all" ? undefined : statusFilter,
  );
  const { mutate: review, isPending: isReviewing } =
    useReviewScholarshipApplication();

  function openReview(
    item: ScholarshipApplicationItem,
    initialAction: "approve" | "reject",
  ) {
    setReviewing(item);
    setAction(initialAction);
    setDiscountAmount("");
    setReviewRemarks("");
  }

  function submitReview() {
    if (!reviewing) return;
    review(
      {
        id: reviewing.id,
        data: {
          action,
          discount_amount:
            action === "approve" && discountAmount
              ? Number(discountAmount)
              : undefined,
          review_remarks: reviewRemarks || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success(
            action === "approve"
              ? "Application approved"
              : "Application rejected",
          );
          setReviewing(null);
        },
      },
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Scholarship requests submitted by students.
        </p>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="py-4 pl-6 text-xs font-semibold uppercase tracking-wide">
                  Student
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Scholarship
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Application
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Income Range
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Status
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Submitted
                </TableHead>
                <TableHead className="w-[200px] py-4 pr-6 text-right text-xs font-semibold uppercase tracking-wide">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} className="border-b last:border-0">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <TableCell key={j} className="py-4">
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : !applications || applications.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-20 text-center text-muted-foreground"
                  >
                    No scholarship requests yet.
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((item) => (
                  <TableRow
                    key={item.id}
                    className="border-b last:border-0 transition-colors hover:bg-muted/30"
                  >
                    <TableCell className="py-4 pl-6 text-sm font-medium">
                      {item.studentName}
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      {item.scholarshipName}
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      <div className="flex flex-col">
                        <span>{item.applicationNumber}</span>
                        <span className="text-xs">
                          {item.courseNames.join(", ")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      {item.annualFamilyIncomeRange}
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant={STATUS_VARIANT[item.status]}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      {formatDate(item.createdAt)}
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right">
                      {item.status === "pending" ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs"
                            onClick={() => openReview(item, "approve")}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs text-destructive hover:text-destructive"
                            onClick={() => openReview(item, "reject")}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {item.reviewedAt ? formatDate(item.reviewedAt) : "—"}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog
        open={reviewing !== null}
        onOpenChange={(v) => {
          if (!v) setReviewing(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {action === "approve" ? "Approve" : "Reject"} Scholarship Request
            </DialogTitle>
          </DialogHeader>
          {reviewing && (
            <div className="space-y-4">
              <div className="space-y-1 rounded-md border bg-muted/40 p-3 text-sm">
                <p>
                  <span className="text-muted-foreground">Student:</span>{" "}
                  {reviewing.studentName}
                </p>
                <p>
                  <span className="text-muted-foreground">Reason:</span>{" "}
                  {reviewing.reason}
                </p>
                <p>
                  <span className="text-muted-foreground">Income Range:</span>{" "}
                  {reviewing.annualFamilyIncomeRange}
                </p>
                {reviewing.supportingDocuments.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Documents:</span>
                    <ul className="ml-4 list-disc">
                      {reviewing.supportingDocuments.map((doc, i) => (
                        <li key={i}>
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {doc.documentName}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  size="sm"
                  variant={action === "approve" ? "default" : "outline"}
                  onClick={() => setAction("approve")}
                >
                  Approve
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={action === "reject" ? "destructive" : "outline"}
                  onClick={() => setAction("reject")}
                >
                  Reject
                </Button>
              </div>

              {action === "approve" && (
                <div className="space-y-1.5">
                  <Label htmlFor="discount_amount">
                    Discount Amount{" "}
                    <span className="text-muted-foreground">
                      (optional — defaults to the scholarship&apos;s own
                      discount)
                    </span>
                  </Label>
                  <Input
                    id="discount_amount"
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="review_remarks">
                  Remarks{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="review_remarks"
                  rows={3}
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReviewing(null)}
                  disabled={isReviewing}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant={action === "reject" ? "destructive" : "default"}
                  onClick={submitReview}
                  disabled={isReviewing}
                >
                  {isReviewing
                    ? "Saving..."
                    : action === "approve"
                      ? "Confirm Approve"
                      : "Confirm Reject"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
