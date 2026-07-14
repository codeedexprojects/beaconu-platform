"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
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
import {
  useAdmissionCycleCourses,
  useAttachAdmissionCycleCourse,
  useUpdateAdmissionCycleCourse,
  useDetachAdmissionCycleCourse,
} from "@/hooks/use-admission-cycles";
import type {
  AdmissionCycleCourseItem,
  AdmissionCycleItem,
  TokenPaymentStage,
} from "@beaconu/types";

const TOKEN_STAGE_LABELS: Record<"none" | TokenPaymentStage, string> = {
  none: "Not configured",
  before_assessment: "Before Assessment",
  after_shortlisting: "After Shortlisting",
};

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
                  return (
                    <div
                      key={row.id}
                      className="border p-4 rounded-xl space-y-3 bg-card"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">
                          {row.courseName}{" "}
                          <span className="text-muted-foreground font-normal">
                            ({row.courseCode})
                          </span>
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDetachTarget(row)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

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
                                  [row.id]: { applicationFee: e.target.value },
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
                          <Label className="text-xs">Token Payment Stage</Label>
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
