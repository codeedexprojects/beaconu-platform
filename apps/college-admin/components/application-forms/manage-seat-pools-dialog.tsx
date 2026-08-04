"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
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
import { useCollegeQuotas, useQuotaUsage } from "@/hooks/use-quotas";
import {
  useAdmissionCycleCourses,
  useSeatPools,
  useCreateSeatPool,
  useUpdateSeatPool,
  useDeleteSeatPool,
} from "@/hooks/use-admission-cycles";
import type { AdmissionCycleItem, SeatPoolItem } from "@beaconu/types";

const BUCKET_LABELS: Record<"in_state" | "out_of_state", string> = {
  in_state: "In-State",
  out_of_state: "Out-of-State",
};

function useQuotaEligibleCourses(
  quotaId: string,
  cycleCourses: {
    id: string;
    courseId: string;
    courseName: string;
    courseCode: string;
  }[],
) {
  const { data: usage } = useQuotaUsage(quotaId, !!quotaId);
  if (!quotaId) return { courses: [], hasQuotaConfig: true };
  const acceptedCourseIds = new Set((usage?.courses ?? []).map((c) => c.id));
  return {
    courses: cycleCourses.filter((c) => acceptedCourseIds.has(c.courseId)),
    hasQuotaConfig: (usage?.courses.length ?? 0) > 0,
  };
}

function parseTotalSeats(value: string): number | null {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) return null;
  return n;
}

function CourseChipPicker({
  courses,
  selected,
  onToggle,
}: {
  courses: {
    id: string;
    courseId: string;
    courseName: string;
    courseCode: string;
  }[];
  selected: Set<string>;
  onToggle: (courseId: string) => void;
}) {
  if (courses.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        No courses are attached to this application form yet. Attach courses
        first from the &quot;Courses&quot; action on this application form.
      </p>
    );
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {courses.map((c) => {
        const isSelected = selected.has(c.courseId);
        return (
          <button
            key={c.courseId}
            type="button"
            onClick={() => onToggle(c.courseId)}
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors ${
              isSelected
                ? "border-primary bg-primary/10 text-primary font-medium"
                : "border-border text-muted-foreground hover:bg-muted/40"
            }`}
          >
            {isSelected && <Check className="h-3 w-3" />}
            {c.courseCode}
          </button>
        );
      })}
    </div>
  );
}

function SeatPoolCard({
  pool,
  activeCycleCourses,
  isExpanded,
  draft,
  dirty,
  onToggleExpand,
  onDelete,
  onTotalSeatsChange,
  onToggleCourse,
  onSave,
}: {
  pool: SeatPoolItem;
  activeCycleCourses: {
    id: string;
    courseId: string;
    courseName: string;
    courseCode: string;
  }[];
  isExpanded: boolean;
  draft: { totalSeats: string; courseIds: Set<string> };
  dirty: boolean;
  onToggleExpand: () => void;
  onDelete: () => void;
  onTotalSeatsChange: (value: string) => void;
  onToggleCourse: (courseId: string) => void;
  onSave: () => void;
}) {
  const eligible = useQuotaEligibleCourses(
    pool.collegeQuotaId,
    activeCycleCourses,
  );

  return (
    <div className="border rounded-xl bg-card overflow-hidden">
      <div
        role="button"
        tabIndex={0}
        onClick={onToggleExpand}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggleExpand();
          }
        }}
        className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-muted/20 transition-colors cursor-pointer"
      >
        <div className="min-w-0 flex items-center gap-2">
          <span className="font-semibold text-sm">{pool.quotaName}</span>
          <span className="text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
            {BUCKET_LABELS[pool.bucketType]}
          </span>
          <span className="text-xs text-muted-foreground truncate">
            {pool.openSeats}/{pool.totalSeats} open · {pool.courses.length}{" "}
            {pool.courses.length === 1 ? "course" : "courses"}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
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
          <div className="grid gap-3 md:grid-cols-3 items-end">
            <div className="space-y-1">
              <Label className="text-xs">Total Seats</Label>
              <Input
                type="number"
                min={0}
                value={draft.totalSeats}
                onChange={(e) => onTotalSeatsChange(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Button
                type="button"
                size="sm"
                variant={dirty ? "default" : "outline"}
                disabled={!dirty}
                onClick={onSave}
              >
                Save Changes
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Courses Sharing This Pool</Label>
            {eligible.courses.length === 0 && !eligible.hasQuotaConfig ? (
              <p className="text-xs text-muted-foreground">
                No courses have this quota configured in Academics Catalog →
                Quotas &amp; Fees anymore.
              </p>
            ) : (
              <CourseChipPicker
                courses={eligible.courses}
                selected={draft.courseIds}
                onToggle={onToggleCourse}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function ManageSeatPoolsDialog({
  cycle,
  onClose,
}: {
  cycle: AdmissionCycleItem | null;
  onClose: () => void;
}) {
  const cycleId = cycle?.id;
  const { data: quotas } = useCollegeQuotas();
  const { data: cycleCourses } = useAdmissionCycleCourses(cycleId);
  const { data: pools, isLoading: isLoadingPools } = useSeatPools(cycleId);
  const { mutate: createPool, isPending: isCreating } = useCreateSeatPool(
    cycleId ?? "",
  );
  const { mutate: updatePool } = useUpdateSeatPool(cycleId ?? "");
  const { mutate: deletePool, isPending: isDeleting } = useDeleteSeatPool(
    cycleId ?? "",
  );

  const [deleteTarget, setDeleteTarget] = useState<SeatPoolItem | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedQuotaId, setSelectedQuotaId] = useState("");
  const [totalSeats, setTotalSeats] = useState("0");
  const [selectedCourseIds, setSelectedCourseIds] = useState<Set<string>>(
    new Set(),
  );

  const [rowDrafts, setRowDrafts] = useState<
    Record<string, { totalSeats: string; courseIds: Set<string> }>
  >({});

  const activePools = (pools ?? []).filter((p) => p.isActive);
  const activeCycleCourses = (cycleCourses ?? []).filter((c) => c.isActive);
  // A quota can back multiple independent pools in the same cycle, as long
  // as their course sets don't overlap — the backend rejects overlapping
  // courses with a clear conflict message, so every active quota stays
  // selectable here rather than being hidden after its first pool.
  const availableQuotas = (quotas ?? []).filter((q) => q.isActive);
  const selectedQuotaCourses = useQuotaEligibleCourses(
    selectedQuotaId,
    activeCycleCourses,
  );

  function resetForm() {
    setSelectedQuotaId("");
    setTotalSeats("0");
    setSelectedCourseIds(new Set());
  }

  function toggleNewCourse(courseId: string) {
    setSelectedCourseIds((prev) => {
      const next = new Set(prev);
      if (next.has(courseId)) next.delete(courseId);
      else next.add(courseId);
      return next;
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

  function handleCreate() {
    if (!selectedQuotaId) {
      toast.error("Select a quota for this seat pool");
      return;
    }
    if (selectedCourseIds.size === 0) {
      toast.error("Select at least one course to share this pool");
      return;
    }
    const totalSeatsValue = parseTotalSeats(totalSeats);
    if (totalSeatsValue === null) {
      toast.error("Total seats must be a whole number of 0 or more");
      return;
    }
    createPool(
      {
        college_quota_id: selectedQuotaId,
        total_seats: totalSeatsValue,
        course_ids: Array.from(selectedCourseIds),
      },
      {
        onSuccess: () => {
          toast.success("Seat pool created");
          resetForm();
        },
      },
    );
  }

  function getDraft(pool: SeatPoolItem) {
    return (
      rowDrafts[pool.id] ?? {
        totalSeats: String(pool.totalSeats),
        courseIds: new Set(pool.courses.map((c) => c.id)),
      }
    );
  }

  function setDraft(
    pool: SeatPoolItem,
    patch: Partial<{ totalSeats: string; courseIds: Set<string> }>,
  ) {
    setRowDrafts((prev) => ({
      ...prev,
      [pool.id]: { ...getDraft(pool), ...patch },
    }));
  }

  function toggleDraftCourse(pool: SeatPoolItem, courseId: string) {
    const draft = getDraft(pool);
    const next = new Set(draft.courseIds);
    if (next.has(courseId)) next.delete(courseId);
    else next.add(courseId);
    setDraft(pool, { courseIds: next });
  }

  function isDirty(pool: SeatPoolItem) {
    const draft = getDraft(pool);
    if (draft.totalSeats !== String(pool.totalSeats)) return true;
    const original = new Set(pool.courses.map((c) => c.id));
    if (draft.courseIds.size !== original.size) return true;
    for (const id of draft.courseIds) if (!original.has(id)) return true;
    return false;
  }

  function handleSave(pool: SeatPoolItem) {
    const draft = getDraft(pool);
    if (draft.courseIds.size === 0) {
      toast.error("A seat pool needs at least one course");
      return;
    }
    const totalSeatsValue = parseTotalSeats(draft.totalSeats);
    if (totalSeatsValue === null) {
      toast.error("Total seats must be a whole number of 0 or more");
      return;
    }
    updatePool(
      {
        id: pool.id,
        data: {
          total_seats: totalSeatsValue,
          course_ids: Array.from(draft.courseIds),
        },
      },
      {
        onSuccess: () => {
          toast.success("Seat pool updated");
          setRowDrafts((prev) => {
            const next = { ...prev };
            delete next[pool.id];
            return next;
          });
        },
      },
    );
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deletePool(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Seat pool removed");
        setDeleteTarget(null);
      },
    });
  }

  return (
    <>
      <Dialog open={!!cycle} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Seat Pools — {cycle?.name}</DialogTitle>
            <DialogDescription>
              Allocate total seats per quota. A pool&apos;s seats are shared
              across every course selected below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            <div className="border p-4 rounded-xl space-y-3 bg-muted/10">
              <h4 className="font-bold text-sm">Create a Seat Pool</h4>
              {availableQuotas.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No active quotas in your catalogue yet.
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
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
                      <Label className="text-xs">Total Seats</Label>
                      <Input
                        type="number"
                        min={0}
                        value={totalSeats}
                        onChange={(e) => setTotalSeats(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Courses Sharing This Pool</Label>
                    {!selectedQuotaId ? (
                      <p className="text-xs text-muted-foreground">
                        Select a quota first.
                      </p>
                    ) : !selectedQuotaCourses.hasQuotaConfig ? (
                      <p className="text-xs text-muted-foreground">
                        No courses have this quota configured in Academics
                        Catalog → Quotas &amp; Fees yet. Add it there first.
                      </p>
                    ) : (
                      <CourseChipPicker
                        courses={selectedQuotaCourses.courses}
                        selected={selectedCourseIds}
                        onToggle={toggleNewCourse}
                      />
                    )}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreate}
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-1" />
                    )}
                    Create Pool
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm">
                Seat Pools ({activePools.length})
              </h4>
              {isLoadingPools ? (
                <div className="flex h-24 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : activePools.length === 0 ? (
                <div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground bg-muted/5 text-sm">
                  No seat pools yet. Without one, a quota has no seat cap for
                  this application form.
                </div>
              ) : (
                activePools.map((pool) => (
                  <SeatPoolCard
                    key={pool.id}
                    pool={pool}
                    activeCycleCourses={activeCycleCourses}
                    isExpanded={expandedIds.has(pool.id)}
                    draft={getDraft(pool)}
                    dirty={isDirty(pool)}
                    onToggleExpand={() => toggleExpanded(pool.id)}
                    onDelete={() => setDeleteTarget(pool)}
                    onTotalSeatsChange={(value) =>
                      setDraft(pool, { totalSeats: value })
                    }
                    onToggleCourse={(courseId) =>
                      toggleDraftCourse(pool, courseId)
                    }
                    onSave={() => handleSave(pool)}
                  />
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Remove Seat Pool"
        description={
          deleteTarget
            ? `Remove the "${deleteTarget.quotaName}" seat pool from this application form? Its ${deleteTarget.totalSeats} seats will no longer be allocated.`
            : undefined
        }
        confirmLabel="Remove"
        onConfirm={confirmDelete}
        isPending={isDeleting}
      />
    </>
  );
}
