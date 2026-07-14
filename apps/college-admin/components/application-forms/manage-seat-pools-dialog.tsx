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
import { useCollegeQuotas } from "@/hooks/use-quotas";
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

function CourseCheckboxList({
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
    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
      {courses.map((c) => (
        <label
          key={c.courseId}
          className="flex items-center gap-2 text-xs cursor-pointer"
        >
          <input
            type="checkbox"
            checked={selected.has(c.courseId)}
            onChange={() => onToggle(c.courseId)}
          />
          {c.courseName} ({c.courseCode})
        </label>
      ))}
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

  function handleCreate() {
    if (!selectedQuotaId) {
      toast.error("Select a quota for this seat pool");
      return;
    }
    if (selectedCourseIds.size === 0) {
      toast.error("Select at least one course to share this pool");
      return;
    }
    createPool(
      {
        college_quota_id: selectedQuotaId,
        total_seats: Number(totalSeats) || 0,
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
    updatePool(
      {
        id: pool.id,
        data: {
          total_seats: Number(draft.totalSeats) || 0,
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
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Seat Pools — {cycle?.name}</DialogTitle>
            <DialogDescription>
              Allocate total seats per quota for this application form. A
              pool&apos;s seats are shared across every course selected below —
              one pool can cover multiple courses.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-2">
            <div className="border p-4 rounded-xl space-y-4 bg-muted/10">
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
                  <div className="space-y-1">
                    <Label className="text-xs">Courses Sharing This Pool</Label>
                    <CourseCheckboxList
                      courses={activeCycleCourses}
                      selected={selectedCourseIds}
                      onToggle={toggleNewCourse}
                    />
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
                activePools.map((pool) => {
                  const draft = getDraft(pool);
                  const dirty = isDirty(pool);
                  return (
                    <div
                      key={pool.id}
                      className="border p-4 rounded-xl space-y-3 bg-card"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {pool.quotaName}
                          </span>
                          <span className="text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {BUCKET_LABELS[pool.bucketType]}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {pool.openSeats}/{pool.totalSeats} open
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteTarget(pool)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid gap-3 md:grid-cols-3 items-end">
                        <div className="space-y-1">
                          <Label className="text-xs">Total Seats</Label>
                          <Input
                            type="number"
                            min={0}
                            value={draft.totalSeats}
                            onChange={(e) =>
                              setDraft(pool, { totalSeats: e.target.value })
                            }
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={dirty ? "default" : "outline"}
                            disabled={!dirty}
                            onClick={() => handleSave(pool)}
                          >
                            Save Changes
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">
                          Courses Sharing This Pool
                        </Label>
                        <div className="grid grid-cols-2 gap-2 max-h-28 overflow-y-auto border rounded-md p-2">
                          {activeCycleCourses.map((c) => (
                            <label
                              key={c.courseId}
                              className="flex items-center gap-2 text-xs cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={draft.courseIds.has(c.courseId)}
                                onChange={() =>
                                  toggleDraftCourse(pool, c.courseId)
                                }
                              />
                              {c.courseName} ({c.courseCode})
                            </label>
                          ))}
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
