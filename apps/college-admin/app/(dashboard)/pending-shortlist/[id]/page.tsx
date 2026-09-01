"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/api";
import { uploadCollegeAdminFile } from "@/lib/services/colleges.service";
import { usePendingShortlistDetail } from "@/hooks/use-applications";
import { useShortlistCourse } from "@/hooks/use-interviews";

const STAGE_LABEL: Record<string, string> = {
  submitted: "Submitted",
  assessment_completed: "Assessment Completed",
  interview_completed: "Interview Completed",
};

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value ?? "—"}</p>
    </div>
  );
}

export default function PendingShortlistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: item, isLoading } = usePendingShortlistDetail(id);
  const shortlistMutation = useShortlistCourse();

  const [file, setFile] = useState<File | null>(null);
  const [validUntil, setValidUntil] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (!item) return null;

  async function handleShortlist() {
    if (!item || !file || !validUntil) {
      toast.error("Select the offer letter document and its valid-until date");
      return;
    }
    setIsUploading(true);
    try {
      const documentUrl = await uploadCollegeAdminFile(
        file,
        "applications/offer-letters",
      );
      shortlistMutation.mutate(
        {
          applicationCourseId: item.applicationCourseId,
          data: { document_url: documentUrl, valid_until: validUntil },
        },
        {
          onSuccess: () => {
            toast.success(`"${item.studentName}" shortlisted`);
            router.push("/pending-shortlist");
          },
        },
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4 border-b border-border pb-5">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            {item.studentName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {item.applicationNumber} · {item.admissionCycleName}
          </p>
        </div>
      </div>

      <div className="rounded-lg border p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Basic Details
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <DetailRow label="Student Name" value={item.studentName} />
          <DetailRow label="Email" value={item.studentEmail} />
          <DetailRow label="Phone" value={item.studentPhone} />
          <DetailRow
            label="Course"
            value={`${item.courseName} (${item.courseCode})`}
          />
          <DetailRow
            label="Primary Course"
            value={item.isPrimary ? "Yes" : "No"}
          />
          <DetailRow
            label="Application Fee"
            value={`₹${item.applicationFee}`}
          />
          <DetailRow
            label="Current Stage"
            value={
              <Badge variant="secondary">
                {STAGE_LABEL[item.currentStage] ?? item.currentStage}
              </Badge>
            }
          />
        </div>
      </div>

      <div className="rounded-lg border p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Shortlist &amp; Issue Offer
        </h2>
        <div className="space-y-4">
          <div>
            <Label>Offer Letter Document</Label>
            <Input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div>
            <Label>Offer Valid Until</Label>
            <Input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
            />
          </div>
          <Button
            className="w-full"
            disabled={isUploading || shortlistMutation.isPending}
            onClick={handleShortlist}
          >
            {(isUploading || shortlistMutation.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Confirm Shortlist
          </Button>
        </div>
      </div>
    </div>
  );
}
