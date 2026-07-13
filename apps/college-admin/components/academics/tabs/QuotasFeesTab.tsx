"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useCollegeQuotas } from "@/hooks/use-quotas";
import {
  useCourseQuotas,
  useAttachCourseQuota,
  useUpdateCourseQuota,
  useDetachCourseQuota,
} from "@/hooks/use-course-quotas";

const BUCKET_LABELS: Record<"in_state" | "out_of_state", string> = {
  in_state: "In-State",
  out_of_state: "Out-of-State",
};

export function QuotasFeesTab({ courseId }: { courseId: string }) {
  const { data: catalogue, isLoading: isLoadingCatalogue } = useCollegeQuotas();
  const { data: attached, isLoading: isLoadingAttached } =
    useCourseQuotas(courseId);
  const { mutate: attachQuota, isPending: isAttaching } =
    useAttachCourseQuota(courseId);
  const { mutate: updateCourseQuota } = useUpdateCourseQuota(courseId);
  const { mutate: detachQuota, isPending: isDetaching } =
    useDetachCourseQuota(courseId);

  const [detachTarget, setDetachTarget] = useState<
    NonNullable<typeof attached>[number] | null
  >(null);
  const [selectedQuotaId, setSelectedQuotaId] = useState("");
  const [reductionType, setReductionType] = useState<
    "none" | "flat" | "percentage"
  >("none");
  const [reductionValue, setReductionValue] = useState("");
  const [tuitionOverride, setTuitionOverride] = useState("");

  // Row-level edit drafts, keyed by CourseQuota.id
  const [rowDrafts, setRowDrafts] = useState<
    Record<
      string,
      {
        reductionType: "none" | "flat" | "percentage";
        reductionValue: string;
        tuitionOverride: string;
      }
    >
  >({});

  if (isLoadingCatalogue || isLoadingAttached) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Detached rows (isActive: false) are soft-deleted only so re-attaching can
  // reuse the same row — they carry no useful info for the admin and are
  // filtered out of both the list below and the "already attached" check.
  const activeAttachedRows = (attached ?? []).filter((row) => row.isActive);
  const attachedQuotaIds = new Set(
    activeAttachedRows.map((row) => row.collegeQuotaId),
  );
  const availableQuotas = (catalogue ?? []).filter(
    (q) => q.isActive && !attachedQuotaIds.has(q.id),
  );

  function resetAttachForm() {
    setSelectedQuotaId("");
    setReductionType("none");
    setReductionValue("");
    setTuitionOverride("");
  }

  function handleAttach() {
    if (!selectedQuotaId) {
      toast.error("Select a quota to attach");
      return;
    }
    if (reductionType !== "none" && reductionValue.trim() === "") {
      toast.error("Enter a reduction value or set reduction to None");
      return;
    }

    attachQuota(
      {
        collegeQuotaId: selectedQuotaId,
        appFeeReductionType: reductionType === "none" ? null : reductionType,
        appFeeReductionValue:
          reductionType === "none" ? null : Number(reductionValue),
        tuitionFeeOverride:
          tuitionOverride.trim() === "" ? null : Number(tuitionOverride),
      },
      {
        onSuccess: () => {
          toast.success("Quota attached to course");
          resetAttachForm();
        },
      },
    );
  }

  function getRowDraft(row: NonNullable<typeof attached>[number]) {
    return (
      rowDrafts[row.id] ?? {
        reductionType: (row.appFeeReductionType ?? "none") as
          | "none"
          | "flat"
          | "percentage",
        reductionValue: row.appFeeReductionValue ?? "",
        tuitionOverride: row.tuitionFeeOverride ?? "",
      }
    );
  }

  function setRowDraft(
    row: NonNullable<typeof attached>[number],
    patch: Partial<{
      reductionType: "none" | "flat" | "percentage";
      reductionValue: string;
      tuitionOverride: string;
    }>,
  ) {
    setRowDrafts((prev) => ({
      ...prev,
      [row.id]: { ...getRowDraft(row), ...patch },
    }));
  }

  function handleSaveRow(row: NonNullable<typeof attached>[number]) {
    const draft = getRowDraft(row);
    if (draft.reductionType !== "none" && draft.reductionValue === "") {
      toast.error("Enter a reduction value or set reduction to None");
      return;
    }

    updateCourseQuota(
      {
        courseQuotaId: row.id,
        data: {
          appFeeReductionType:
            draft.reductionType === "none" ? null : draft.reductionType,
          appFeeReductionValue:
            draft.reductionType === "none"
              ? null
              : Number(draft.reductionValue),
          tuitionFeeOverride:
            draft.tuitionOverride === "" ? null : Number(draft.tuitionOverride),
        },
      },
      {
        onSuccess: () => {
          toast.success("Quota configuration saved");
          setRowDrafts((prev) => {
            const next = { ...prev };
            delete next[row.id];
            return next;
          });
        },
      },
    );
  }

  function handleDetach(row: NonNullable<typeof attached>[number]) {
    setDetachTarget(row);
  }

  function confirmDetach() {
    if (!detachTarget) return;
    detachQuota(detachTarget.id, {
      onSuccess: () => {
        toast.success("Quota detached from course");
        setDetachTarget(null);
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="border p-4 rounded-xl space-y-4 bg-muted/10">
        <h4 className="font-bold text-sm text-foreground">
          Attach a Quota from the Catalogue
        </h4>
        {(catalogue ?? []).length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Your college has no quota categories yet. Add quotas in the{" "}
            <a href="/quotas" className="underline font-medium">
              Quota Catalogue
            </a>{" "}
            first.
          </p>
        ) : availableQuotas.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            All active quotas in your catalogue are already attached to this
            course.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-4">
            <div className="space-y-1">
              <Label className="text-xs">Quota</Label>
              <Select
                value={selectedQuotaId}
                onValueChange={setSelectedQuotaId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select quota" />
                </SelectTrigger>
                <SelectContent>
                  {availableQuotas.map((q) => (
                    <SelectItem key={q.id} value={q.id}>
                      {q.name} ({BUCKET_LABELS[q.bucketType]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">App Fee Reduction</Label>
              <Select
                value={reductionType}
                onValueChange={(v) =>
                  setReductionType(v as typeof reductionType)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="flat">Flat Amount</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">
                {reductionType === "percentage"
                  ? "Reduction %"
                  : "Reduction Amount"}
              </Label>
              <Input
                type="number"
                min={0}
                disabled={reductionType === "none"}
                value={reductionValue}
                onChange={(e) => setReductionValue(e.target.value)}
                placeholder={reductionType === "none" ? "—" : "0"}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tuition Fee Override</Label>
              <Input
                type="number"
                min={0}
                value={tuitionOverride}
                onChange={(e) => setTuitionOverride(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="md:col-span-4">
              <Button
                type="button"
                onClick={handleAttach}
                disabled={isAttaching}
                size="sm"
              >
                {isAttaching ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-1" />
                )}
                Attach Quota
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h4 className="font-bold text-sm text-foreground">
          Quotas Attached to This Course ({attachedQuotaIds.size})
        </h4>
        {activeAttachedRows.length === 0 ? (
          <div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground bg-muted/5 text-sm">
            No quotas attached yet. Students applying for this course will pay
            the full base application fee with no quota options.
          </div>
        ) : (
          activeAttachedRows.map((row) => {
            const draft = getRowDraft(row);
            const isDirty =
              draft.reductionType !== (row.appFeeReductionType ?? "none") ||
              draft.reductionValue !== (row.appFeeReductionValue ?? "") ||
              draft.tuitionOverride !== (row.tuitionFeeOverride ?? "");

            return (
              <div
                key={row.id}
                className="border p-4 rounded-xl space-y-3 bg-card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">
                      {row.quotaName}
                    </span>
                    <span className="text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {BUCKET_LABELS[row.bucketType]}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDetach(row)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-4 items-end">
                  <div className="space-y-1">
                    <Label className="text-xs">App Fee Reduction</Label>
                    <Select
                      value={draft.reductionType}
                      onValueChange={(v) =>
                        setRowDraft(row, {
                          reductionType: v as typeof draft.reductionType,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="flat">Flat Amount</SelectItem>
                        <SelectItem value="percentage">Percentage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">
                      {draft.reductionType === "percentage"
                        ? "Reduction %"
                        : "Reduction Amount"}
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      disabled={draft.reductionType === "none"}
                      value={draft.reductionValue}
                      onChange={(e) =>
                        setRowDraft(row, { reductionValue: e.target.value })
                      }
                      placeholder={draft.reductionType === "none" ? "—" : "0"}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Tuition Fee Override</Label>
                    <Input
                      type="number"
                      min={0}
                      value={draft.tuitionOverride}
                      onChange={(e) =>
                        setRowDraft(row, { tuitionOverride: e.target.value })
                      }
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <Button
                      type="button"
                      size="sm"
                      variant={isDirty ? "default" : "outline"}
                      disabled={!isDirty}
                      onClick={() => handleSaveRow(row)}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <ConfirmDialog
        open={detachTarget !== null}
        title="Detach Quota"
        description={
          detachTarget
            ? `Remove "${detachTarget.quotaName}" from this course? Students will no longer be able to select it.`
            : ""
        }
        confirmLabel="Detach"
        variant="destructive"
        loading={isDetaching}
        onCancel={() => setDetachTarget(null)}
        onConfirm={confirmDetach}
      />
    </div>
  );
}
