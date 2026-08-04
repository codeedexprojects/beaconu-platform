"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Loader2, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useCollegeCoursesMinimal } from "@/hooks/use-colleges";
import { useCollegeQuotas } from "@/hooks/use-quotas";
import { useCourseQuotas } from "@/hooks/use-course-quotas";
import {
  useAdmissionCycleCourses,
  useAttachAdmissionCycleCourse,
  useUpdateAdmissionCycleCourse,
  useDetachAdmissionCycleCourse,
  useCourseQuotaSeats,
  useAttachCourseQuota,
  useUpdateCourseQuotaSeats,
  useDetachCourseQuota,
} from "@/hooks/use-admission-cycles";
import type {
  AdmissionCycleCourseItem,
  AdmissionCycleItem,
  CourseQuotaSeatsItem,
  TokenPaymentStage,
} from "@beaconu/types";

const TOKEN_STAGE_LABELS: Record<"none" | TokenPaymentStage, string> = {
  none: "Not configured",
  before_assessment: "Before Assessment",
  after_shortlisting: "After Shortlisting",
};

const BUCKET_LABELS: Record<"in_state" | "out_of_state", string> = {
  in_state: "In-State",
  out_of_state: "Out-of-State",
};

function CourseQuotaSeatsPanel({
  cycleId,
  courseId,
}: {
  cycleId: string;
  courseId: string;
}) {
  const { data: quotas } = useCollegeQuotas();
  const { data: courseQuotaConfigs } = useCourseQuotas(courseId);
  const { data: quotaSeats, isLoading } = useCourseQuotaSeats(
    cycleId,
    courseId,
  );
  const { mutate: attachQuota, isPending: isAttaching } = useAttachCourseQuota(
    cycleId,
    courseId,
  );
  const { mutate: updateSeats } = useUpdateCourseQuotaSeats(cycleId, courseId);
  const { mutate: detachQuota, isPending: isDetaching } = useDetachCourseQuota(
    cycleId,
    courseId,
  );

  const [removeTarget, setRemoveTarget] = useState<CourseQuotaSeatsItem | null>(
    null,
  );
  const [selectedQuotaId, setSelectedQuotaId] = useState("");
  const [totalSeats, setTotalSeats] = useState("0");
  const [rowDrafts, setRowDrafts] = useState<Record<string, string>>({});

  const activeRows = (quotaSeats ?? []).filter((row) => row.isActive);
  const configuredQuotaIds = new Set(
    activeRows.map((row) => row.collegeQuotaId),
  );
  const courseAcceptedQuotaIds = new Set(
    (courseQuotaConfigs ?? [])
      .filter((cq) => cq.isActive)
      .map((cq) => cq.collegeQuotaId),
  );
  const availableQuotas = (quotas ?? []).filter(
    (q) =>
      q.isActive &&
      courseAcceptedQuotaIds.has(q.id) &&
      !configuredQuotaIds.has(q.id),
  );

  function handleAttach() {
    if (!selectedQuotaId) {
      toast.error("Select a quota");
      return;
    }
    attachQuota(
      {
        college_quota_id: selectedQuotaId,
        total_seats: Number(totalSeats) || 0,
      },
      {
        onSuccess: () => {
          toast.success("Seats added for this course");
          setSelectedQuotaId("");
          setTotalSeats("0");
        },
      },
    );
  }

  function handleSave(row: CourseQuotaSeatsItem) {
    const value = Number(rowDrafts[row.id] ?? row.totalSeats ?? 0);
    if (Number.isNaN(value) || value < 0) {
      toast.error("Enter a valid seat count");
      return;
    }
    updateSeats(
      { id: row.id, data: { total_seats: value } },
      {
        onSuccess: () => {
          toast.success("Seats updated");
          setRowDrafts((prev) => {
            const next = { ...prev };
            delete next[row.id];
            return next;
          });
        },
      },
    );
  }

  function confirmRemove() {
    if (!removeTarget) return;
    detachQuota(removeTarget.id, {
      onSuccess: () => {
        toast.success("Quota removed from this course");
        setRemoveTarget(null);
      },
    });
  }

  return (
    <div className="border-t pt-3 space-y-3">
      <Label className="text-xs font-semibold">Quotas &amp; Seats</Label>

      {isLoading ? (
        <div className="flex h-12 items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        </div>
      ) : activeRows.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No quotas configured for this course yet.
        </p>
      ) : (
        <div className="space-y-2">
          {activeRows.map((row) => {
            const draft = rowDrafts[row.id] ?? String(row.totalSeats ?? 0);
            const dirty =
              !row.isPooled && draft !== String(row.totalSeats ?? 0);
            return (
              <div
                key={row.id}
                className="flex items-center gap-2 text-xs bg-muted/20 rounded-lg px-3 py-2"
              >
                <span className="font-medium">{row.quotaName}</span>
                <span className="text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {BUCKET_LABELS[row.bucketType]}
                </span>
                {row.isPooled ? (
                  <span className="text-muted-foreground">
                    {row.openSeats}/{row.totalSeats} open — shared pool (edit
                    from Seat Pools)
                  </span>
                ) : (
                  <>
                    <Input
                      type="number"
                      min={0}
                      value={draft}
                      onChange={(e) =>
                        setRowDrafts((prev) => ({
                          ...prev,
                          [row.id]: e.target.value,
                        }))
                      }
                      className="h-7 w-20 text-xs"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant={dirty ? "default" : "outline"}
                      disabled={!dirty}
                      onClick={() => handleSave(row)}
                      className="h-7 text-xs px-2"
                    >
                      Save
                    </Button>
                  </>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 ml-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setRemoveTarget(row)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {availableQuotas.length > 0 ? (
        <div className="flex items-end gap-2">
          <div className="space-y-1 flex-1">
            <Label className="text-xs">Add Quota</Label>
            <Select value={selectedQuotaId} onValueChange={setSelectedQuotaId}>
              <SelectTrigger className="h-8 text-xs">
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
          <div className="space-y-1 w-24">
            <Label className="text-xs">Seats</Label>
            <Input
              type="number"
              min={0}
              value={totalSeats}
              onChange={(e) => setTotalSeats(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <Button
            type="button"
            size="sm"
            onClick={handleAttach}
            disabled={isAttaching}
            className="h-8"
          >
            {isAttaching ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      ) : courseAcceptedQuotaIds.size === 0 ? (
        <p className="text-xs text-muted-foreground">
          This course has no quotas configured in Academics Catalog → Quotas
          &amp; Fees yet. Add quotas there first, then come back here to set
          seats for this cycle.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          All of this course&apos;s configured quotas already have seats set for
          this cycle.
        </p>
      )}

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(v) => !v && setRemoveTarget(null)}
        title="Remove Quota"
        description={
          removeTarget
            ? `Remove "${removeTarget.quotaName}" seats from this course?`
            : undefined
        }
        confirmLabel="Remove"
        onConfirm={confirmRemove}
        isPending={isDetaching}
      />
    </div>
  );
}

export function ManageCoursesDialog({
  cycle,
  onClose,
}: {
  cycle: AdmissionCycleItem | null;
  onClose: () => void;
}) {
  const cycleId = cycle?.id;
  const { data: courses } = useCollegeCoursesMinimal(!!cycleId);
  const { data: attached, isLoading: isLoadingAttached } =
    useAdmissionCycleCourses(cycleId);
  const { mutate: attachCourse, isPending: isAttaching } =
    useAttachAdmissionCycleCourse(cycleId ?? "");
  const { mutate: updateCourse } = useUpdateAdmissionCycleCourse(cycleId ?? "");
  const { mutate: detachCourse, isPending: isDetaching } =
    useDetachAdmissionCycleCourse(cycleId ?? "");

  const [detachTarget, setDetachTarget] =
    useState<AdmissionCycleCourseItem | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [applicationFee, setApplicationFee] = useState("0");
  const [interviewRequired, setInterviewRequired] = useState(true);
  const [assessmentRequired, setAssessmentRequired] = useState(true);
  const [workExperienceRequired, setWorkExperienceRequired] = useState(false);
  const [tokenPaymentStage, setTokenPaymentStage] = useState<
    "none" | TokenPaymentStage
  >("none");

  const [rowDrafts, setRowDrafts] = useState<
    Record<string, { applicationFee: string }>
  >({});

  const activeAttached = (attached ?? []).filter((row) => row.isActive);
  const attachedCourseIds = new Set(activeAttached.map((row) => row.courseId));
  const availableCourses = (courses ?? []).filter(
    (c) => !attachedCourseIds.has(c.id),
  );

  function resetForm() {
    setSelectedCourseId("");
    setApplicationFee("0");
    setInterviewRequired(true);
    setAssessmentRequired(true);
    setWorkExperienceRequired(false);
    setTokenPaymentStage("none");
  }

  function handleAttach() {
    if (!selectedCourseId) {
      toast.error("Select a course to attach");
      return;
    }
    attachCourse(
      {
        course_id: selectedCourseId,
        application_fee: Number(applicationFee) || 0,
        interview_required: interviewRequired,
        assessment_required: assessmentRequired,
        token_payment_stage:
          tokenPaymentStage === "none" ? null : tokenPaymentStage,
        work_experience_required: workExperienceRequired,
      },
      {
        onSuccess: () => {
          toast.success("Course attached to application form");
          resetForm();
        },
      },
    );
  }

  function handleToggle(
    row: AdmissionCycleCourseItem,
    field:
      | "interviewRequired"
      | "assessmentRequired"
      | "workExperienceRequired",
    apiField:
      | "interview_required"
      | "assessment_required"
      | "work_experience_required",
  ) {
    updateCourse({
      id: row.id,
      data: { [apiField]: !row[field] },
    });
  }

  function handleTokenStageChange(
    row: AdmissionCycleCourseItem,
    value: "none" | TokenPaymentStage,
  ) {
    updateCourse({
      id: row.id,
      data: { token_payment_stage: value === "none" ? null : value },
    });
  }

  function getFeeDraft(row: AdmissionCycleCourseItem) {
    return rowDrafts[row.id]?.applicationFee ?? row.applicationFee;
  }

  function handleSaveFee(row: AdmissionCycleCourseItem) {
    const value = Number(getFeeDraft(row));
    if (Number.isNaN(value) || value < 0) {
      toast.error("Enter a valid application fee");
      return;
    }
    updateCourse(
      { id: row.id, data: { application_fee: value } },
      {
        onSuccess: () => {
          toast.success("Application fee updated");
          setRowDrafts((prev) => {
            const next = { ...prev };
            delete next[row.id];
            return next;
          });
        },
      },
    );
  }

  function confirmDetach() {
    if (!detachTarget) return;
    detachCourse(detachTarget.id, {
      onSuccess: () => {
        toast.success("Course detached from application form");
        setDetachTarget(null);
      },
    });
  }

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function requirementsSummary(row: AdmissionCycleCourseItem) {
    const parts = [
      row.interviewRequired && "Interview",
      row.assessmentRequired && "Assessment",
      row.workExperienceRequired && "Work Exp.",
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "No requirements";
  }

  return (
    <>
      <Dialog open={!!cycle} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Courses — {cycle?.name}</DialogTitle>
            <DialogDescription>
              Attach courses to this application form and configure the
              application fee and requirements students see for each.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-2">
            <div className="border p-4 rounded-xl space-y-4 bg-muted/10">
              <h4 className="font-bold text-sm">Attach a Course</h4>
              {availableCourses.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  {(courses ?? []).length === 0
                    ? "No courses configured for this college yet."
                    : "All courses are already attached to this application form."}
                </p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Course</Label>
                    <Select
                      value={selectedCourseId}
                      onValueChange={setSelectedCourseId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCourses.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name} ({c.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Application Fee</Label>
                    <Input
                      type="number"
                      min={0}
                      value={applicationFee}
                      onChange={(e) => setApplicationFee(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Token Payment Stage</Label>
                    <Select
                      value={tokenPaymentStage}
                      onValueChange={(v) =>
                        setTokenPaymentStage(v as typeof tokenPaymentStage)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(TOKEN_STAGE_LABELS).map(
                          ([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end gap-4 pb-1.5">
                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={interviewRequired}
                        onChange={(e) => setInterviewRequired(e.target.checked)}
                      />
                      Interview
                    </label>
                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={assessmentRequired}
                        onChange={(e) =>
                          setAssessmentRequired(e.target.checked)
                        }
                      />
                      Assessment
                    </label>
                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={workExperienceRequired}
                        onChange={(e) =>
                          setWorkExperienceRequired(e.target.checked)
                        }
                      />
                      Work Exp.
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAttach}
                      disabled={isAttaching}
                    >
                      {isAttaching ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4 mr-1" />
                      )}
                      Attach Course
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm">
                Courses in This Application Form ({activeAttached.length})
              </h4>
              {isLoadingAttached ? (
                <div className="flex h-24 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : activeAttached.length === 0 ? (
                <div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground bg-muted/5 text-sm">
                  No courses attached yet. Students won&apos;t be able to apply
                  through this application form until at least one is added.
                </div>
              ) : (
                activeAttached.map((row) => {
                  const feeDraft = getFeeDraft(row);
                  const feeDirty = feeDraft !== row.applicationFee;
                  const isExpanded = expandedIds.has(row.id);
                  return (
                    <div
                      key={row.id}
                      className="border rounded-xl bg-card overflow-hidden"
                    >
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleExpanded(row.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggleExpanded(row.id);
                          }
                        }}
                        className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-muted/20 transition-colors cursor-pointer"
                      >
                        <div className="min-w-0">
                          <span className="font-semibold text-sm">
                            {row.courseName}{" "}
                            <span className="text-muted-foreground font-normal">
                              ({row.courseCode})
                            </span>
                          </span>
                          <p className="text-xs text-muted-foreground truncate">
                            ₹{row.applicationFee} · {requirementsSummary(row)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDetachTarget(row);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 pt-0 space-y-3">
                          <div className="grid gap-3 md:grid-cols-4 items-end">
                            <div className="space-y-1">
                              <Label className="text-xs">Application Fee</Label>
                              <div className="flex gap-1.5">
                                <Input
                                  type="number"
                                  min={0}
                                  value={feeDraft}
                                  onChange={(e) =>
                                    setRowDrafts((prev) => ({
                                      ...prev,
                                      [row.id]: {
                                        applicationFee: e.target.value,
                                      },
                                    }))
                                  }
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={feeDirty ? "default" : "outline"}
                                  disabled={!feeDirty}
                                  onClick={() => handleSaveFee(row)}
                                >
                                  Save
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">
                                Token Payment Stage
                              </Label>
                              <Select
                                value={row.tokenPaymentStage ?? "none"}
                                onValueChange={(v) =>
                                  handleTokenStageChange(
                                    row,
                                    v as "none" | TokenPaymentStage,
                                  )
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(TOKEN_STAGE_LABELS).map(
                                    ([value, label]) => (
                                      <SelectItem key={value} value={value}>
                                        {label}
                                      </SelectItem>
                                    ),
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center gap-4 md:col-span-2">
                              <label className="flex items-center gap-2 text-xs">
                                <input
                                  type="checkbox"
                                  checked={row.interviewRequired}
                                  onChange={() =>
                                    handleToggle(
                                      row,
                                      "interviewRequired",
                                      "interview_required",
                                    )
                                  }
                                />
                                Interview
                              </label>
                              <label className="flex items-center gap-2 text-xs">
                                <input
                                  type="checkbox"
                                  checked={row.assessmentRequired}
                                  onChange={() =>
                                    handleToggle(
                                      row,
                                      "assessmentRequired",
                                      "assessment_required",
                                    )
                                  }
                                />
                                Assessment
                              </label>
                              <label className="flex items-center gap-2 text-xs">
                                <input
                                  type="checkbox"
                                  checked={row.workExperienceRequired}
                                  onChange={() =>
                                    handleToggle(
                                      row,
                                      "workExperienceRequired",
                                      "work_experience_required",
                                    )
                                  }
                                />
                                Work Exp.
                              </label>
                            </div>
                          </div>

                          {cycleId && (
                            <CourseQuotaSeatsPanel
                              cycleId={cycleId}
                              courseId={row.courseId}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!detachTarget}
        onOpenChange={(v) => !v && setDetachTarget(null)}
        title="Detach Course"
        description={
          detachTarget
            ? `Remove "${detachTarget.courseName}" from this application form? Students will no longer be able to apply for it here.`
            : undefined
        }
        confirmLabel="Detach"
        onConfirm={confirmDetach}
        isPending={isDetaching}
      />
    </>
  );
}
