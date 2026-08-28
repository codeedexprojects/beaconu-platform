"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Award,
  ArrowLeft,
  Banknote,
  CheckCircle2,
  ExternalLink,
  FileText,
  Loader2,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useScholarshipApplications,
  useScholarshipConfigs,
  useReviewScholarshipApplication,
} from "@/hooks/use-scholarships";
import type { ScholarshipApplicationStatus } from "@beaconu/types";

const STATUS_BADGE_CLASS: Record<ScholarshipApplicationStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ScholarshipRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data: applications, isLoading } = useScholarshipApplications();
  const { data: configs = [] } = useScholarshipConfigs();
  const { mutate: review, isPending: isReviewing } =
    useReviewScholarshipApplication();

  const [discountAmount, setDiscountAmount] = useState("");
  const [reviewRemarks, setReviewRemarks] = useState("");

  const application = applications?.find((a) => a.id === id);
  const config = configs.find((c) => c.id === application?.scholarshipConfigId);

  if (isLoading || !application) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  const financialBenefit =
    application.status === "approved" && application.discountAmount
      ? `₹${application.discountAmount} discount`
      : config
        ? config.discountType === "percentage"
          ? `${config.discountValue}% Fee Waiver`
          : `₹${config.discountValue} Fee Discount`
        : "—";

  function handleReview(action: "approve" | "reject") {
    review(
      {
        id: id as string,
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
            action === "approve" ? "Request approved" : "Request rejected",
          );
        },
      },
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={() => router.push("/scholarships")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-navy">
          Scholarship Eligibility Details
        </h1>
      </div>

      <Card className="overflow-hidden rounded-2xl border-border">
        <div className="h-1 w-full bg-gold" />
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-navy text-lg font-semibold text-gold">
              {initials(application.studentName)}
            </span>
            <div>
              <p className="font-serif text-lg font-bold text-navy">
                {application.studentName}
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-gold">
                  #{application.applicationNumber}
                </span>{" "}
                · {application.courseNames.join(", ")}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={STATUS_BADGE_CLASS[application.status]}
          >
            {application.status}
          </Badge>
        </CardContent>
      </Card>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Requested Scholarship
        </p>
        <Card className="overflow-hidden rounded-2xl border-l-4 border-l-gold border-border">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-navy">
                  {application.scholarshipName}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {config?.scholarshipType ?? "Scholarship"} · Annual family
                  income: {application.annualFamilyIncomeRange}
                </p>
              </div>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-pale text-gold">
                <Award className="h-5 w-5" />
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Student&apos;s Reason
                </p>
                <p className="text-sm text-foreground">{application.reason}</p>
              </div>
              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <Banknote className="h-3.5 w-3.5" />
                  Financial Benefit
                </p>
                <div className="rounded-lg bg-gold-pale/60 p-3">
                  <p className="text-sm font-semibold text-navy">
                    {financialBenefit}
                  </p>
                </div>
              </div>
            </div>

            {application.supportingDocuments.length > 0 && (
              <div className="mt-4 border-t border-border pt-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Supporting Documents
                </p>
                <div className="flex flex-wrap gap-2">
                  {application.supportingDocuments.map((doc, i) => (
                    <a
                      key={i}
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs text-navy hover:border-gold"
                    >
                      <FileText className="h-3 w-3" />
                      {doc.documentName}
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {application.status === "pending" ? (
        <Card className="rounded-2xl">
          <CardContent className="space-y-3 p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Discount Amount{" "}
                  <span className="text-muted-foreground">
                    (optional — defaults to the scholarship&apos;s own)
                  </span>
                </Label>
                <Input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">
                  Remarks{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  rows={1}
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1 gap-2 rounded-lg bg-navy text-white hover:bg-navy/90"
                disabled={isReviewing}
                onClick={() => handleReview("approve")}
              >
                {isReviewing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Approve Request
              </Button>
              <Button
                variant="outline"
                className="gap-2 rounded-lg text-destructive hover:text-destructive"
                disabled={isReviewing}
                onClick={() => handleReview("reject")}
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          This request was {application.status} on{" "}
          {formatDate(application.reviewedAt)}.
          {application.reviewRemarks && (
            <>
              {" "}
              <span className="font-medium">Remarks:</span>{" "}
              {application.reviewRemarks}
            </>
          )}
        </div>
      )}
    </div>
  );
}
