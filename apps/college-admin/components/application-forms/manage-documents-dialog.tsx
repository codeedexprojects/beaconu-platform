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
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useCollegeQuotas } from "@/hooks/use-quotas";
import {
  useAdmissionCycleCourses,
  useDocumentRequirements,
  useCreateDocumentRequirement,
  useUpdateDocumentRequirement,
  useDeleteDocumentRequirement,
} from "@/hooks/use-admission-cycles";
import type {
  AdmissionCycleItem,
  DocumentMimeType,
  DocumentRequirementItem,
} from "@beaconu/types";

const BUCKET_LABELS: Record<"in_state" | "out_of_state", string> = {
  in_state: "In-State",
  out_of_state: "Out-of-State",
};

const MIME_TYPE_OPTIONS: { id: DocumentMimeType; label: string }[] = [
  { id: "image/jpeg", label: "JPEG" },
  { id: "image/png", label: "PNG" },
  { id: "image/webp", label: "WEBP" },
  { id: "application/pdf", label: "PDF" },
];

function ChipPicker({
  options,
  selected,
  onToggle,
  emptyLabel,
}: {
  options: { id: string; label: string }[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  emptyLabel: string;
}) {
  if (options.length === 0) {
    return <p className="text-xs text-muted-foreground">{emptyLabel}</p>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const isSelected = selected.has(o.id);
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onToggle(o.id)}
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors ${
              isSelected
                ? "border-primary bg-primary/10 text-primary font-medium"
                : "border-border text-muted-foreground hover:bg-muted/40"
            }`}
          >
            {isSelected && <Check className="h-3 w-3" />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function RequirementCard({
  requirement,
  courseOptions,
  quotaOptions,
  isExpanded,
  onToggleExpand,
  onDelete,
  onSave,
  isSaving,
}: {
  requirement: DocumentRequirementItem;
  courseOptions: { id: string; label: string }[];
  quotaOptions: { id: string; label: string }[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDelete: () => void;
  onSave: (data: {
    document_label: string;
    document_category: string;
    is_required: boolean;
    accepted_mime_types: DocumentMimeType[];
    course_ids: string[];
    quota_ids: string[];
  }) => void;
  isSaving: boolean;
}) {
  const [label, setLabel] = useState(requirement.documentLabel);
  const [category, setCategory] = useState(requirement.documentCategory);
  const [required, setRequired] = useState(requirement.isRequired);
  const [mimeTypes, setMimeTypes] = useState(
    new Set<string>(requirement.acceptedMimeTypes),
  );
  const [courseIds, setCourseIds] = useState(
    new Set(requirement.courses.map((c) => c.id)),
  );
  const [quotaIds, setQuotaIds] = useState(
    new Set(requirement.quotas.map((q) => q.id)),
  );

  const dirty =
    label !== requirement.documentLabel ||
    category !== requirement.documentCategory ||
    required !== requirement.isRequired ||
    mimeTypes.size !== requirement.acceptedMimeTypes.length ||
    !requirement.acceptedMimeTypes.every((m) => mimeTypes.has(m)) ||
    courseIds.size !== requirement.courses.length ||
    !requirement.courses.every((c) => courseIds.has(c.id)) ||
    quotaIds.size !== requirement.quotas.length ||
    !requirement.quotas.every((q) => quotaIds.has(q.id));

  function toggleCourse(id: string) {
    setCourseIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleQuota(id: string) {
    setQuotaIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleMimeType(id: string) {
    setMimeTypes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSave() {
    if (mimeTypes.size === 0) {
      toast.error("Select at least one accepted file type");
      return;
    }
    onSave({
      document_label: label,
      document_category: category,
      is_required: required,
      accepted_mime_types: Array.from(mimeTypes) as DocumentMimeType[],
      course_ids: Array.from(courseIds),
      quota_ids: Array.from(quotaIds),
    });
  }

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
        <div className="min-w-0">
          <span className="font-semibold text-sm">
            {requirement.documentLabel}
          </span>
          <p className="text-xs text-muted-foreground truncate">
            {requirement.documentCategory} ·{" "}
            {requirement.isRequired ? "Required" : "Optional"} ·{" "}
            {requirement.courses.length === 0
              ? "all courses"
              : `${requirement.courses.length} course${requirement.courses.length === 1 ? "" : "s"}`}{" "}
            ·{" "}
            {requirement.quotas.length === 0
              ? "all quotas"
              : `${requirement.quotas.length} quota${requirement.quotas.length === 1 ? "" : "s"}`}
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
        <div className="p-4 pt-0 space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Label</Label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Category</Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
            />
            Required
          </label>

          <div className="space-y-1.5">
            <Label className="text-xs">Accepted File Types</Label>
            <ChipPicker
              options={MIME_TYPE_OPTIONS}
              selected={mimeTypes}
              onToggle={toggleMimeType}
              emptyLabel=""
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">
              Restrict to Courses (empty = all courses)
            </Label>
            <ChipPicker
              options={courseOptions}
              selected={courseIds}
              onToggle={toggleCourse}
              emptyLabel="No courses attached to this application form yet."
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">
              Restrict to Quotas (empty = all quotas)
            </Label>
            <ChipPicker
              options={quotaOptions}
              selected={quotaIds}
              onToggle={toggleQuota}
              emptyLabel="No quotas in your catalogue yet."
            />
          </div>

          <Button
            type="button"
            size="sm"
            variant={dirty ? "default" : "outline"}
            disabled={!dirty || isSaving}
            onClick={handleSave}
          >
            {isSaving && <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />}
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}

export function ManageDocumentsDialog({
  cycle,
  onClose,
}: {
  cycle: AdmissionCycleItem | null;
  onClose: () => void;
}) {
  const cycleId = cycle?.id;
  const { data: quotas } = useCollegeQuotas();
  const { data: cycleCourses } = useAdmissionCycleCourses(cycleId);
  const { data: requirements, isLoading } = useDocumentRequirements(cycleId);
  const { mutate: createRequirement, isPending: isCreating } =
    useCreateDocumentRequirement(cycleId ?? "");
  const { mutate: updateRequirement, isPending: isUpdating } =
    useUpdateDocumentRequirement(cycleId ?? "");
  const { mutate: deleteRequirement, isPending: isDeleting } =
    useDeleteDocumentRequirement(cycleId ?? "");

  const [deleteTarget, setDeleteTarget] =
    useState<DocumentRequirementItem | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [newLabel, setNewLabel] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newRequired, setNewRequired] = useState(true);
  const [newMimeTypes, setNewMimeTypes] = useState<Set<string>>(
    new Set(MIME_TYPE_OPTIONS.map((m) => m.id)),
  );

  const activeRequirements = (requirements ?? []).filter((r) => r.isActive);
  const activeCycleCourses = (cycleCourses ?? []).filter((c) => c.isActive);
  const courseOptions = activeCycleCourses.map((c) => ({
    id: c.courseId,
    label: `${c.courseName} (${c.courseCode})`,
  }));
  const activeQuotas = (quotas ?? []).filter((q) => q.isActive);
  const quotaOptions = activeQuotas.map((q) => ({
    id: q.id,
    label: `${q.name} (${BUCKET_LABELS[q.bucketType]})`,
  }));

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleNewMimeType(id: string) {
    setNewMimeTypes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function resetForm() {
    setNewLabel("");
    setNewCategory("");
    setNewRequired(true);
    setNewMimeTypes(new Set(MIME_TYPE_OPTIONS.map((m) => m.id)));
  }

  function handleCreate() {
    if (!newLabel.trim() || !newCategory.trim()) {
      toast.error("Fill in label and category");
      return;
    }
    if (newMimeTypes.size === 0) {
      toast.error("Select at least one accepted file type");
      return;
    }
    createRequirement(
      {
        document_label: newLabel.trim(),
        document_category: newCategory.trim(),
        is_required: newRequired,
        accepted_mime_types: Array.from(newMimeTypes) as DocumentMimeType[],
        course_ids: [],
        quota_ids: [],
      },
      {
        onSuccess: () => {
          toast.success("Document requirement created");
          resetForm();
        },
      },
    );
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteRequirement(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Document requirement removed");
        setDeleteTarget(null);
      },
    });
  }

  return (
    <>
      <Dialog open={!!cycle} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Documents — {cycle?.name}</DialogTitle>
            <DialogDescription>
              Control which documents students must upload for this application
              form. Leave courses/quotas empty to apply a requirement to
              everyone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            <div className="border p-4 rounded-xl space-y-3 bg-muted/10">
              <h4 className="font-bold text-sm">Add a Document Requirement</h4>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Label</Label>
                  <Input
                    placeholder="e.g. NEET Scorecard"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Category</Label>
                  <Input
                    placeholder="e.g. academic"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={newRequired}
                  onChange={(e) => setNewRequired(e.target.checked)}
                />
                Required
              </label>
              <div className="space-y-1.5">
                <Label className="text-xs">Accepted File Types</Label>
                <ChipPicker
                  options={MIME_TYPE_OPTIONS}
                  selected={newMimeTypes}
                  onToggle={toggleNewMimeType}
                  emptyLabel=""
                />
              </div>
              <p className="text-xs text-muted-foreground">
                New requirements apply to every course and quota by default —
                restrict them after creating, from the card below.
              </p>
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
                Add Requirement
              </Button>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm">
                Document Requirements ({activeRequirements.length})
              </h4>
              {isLoading ? (
                <div className="flex h-24 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : activeRequirements.length === 0 ? (
                <div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground bg-muted/5 text-sm">
                  No document requirements yet. Students won&apos;t be asked to
                  upload anything for this application form.
                </div>
              ) : (
                activeRequirements.map((req) => (
                  <RequirementCard
                    key={req.id}
                    requirement={req}
                    courseOptions={courseOptions}
                    quotaOptions={quotaOptions}
                    isExpanded={expandedIds.has(req.id)}
                    onToggleExpand={() => toggleExpanded(req.id)}
                    onDelete={() => setDeleteTarget(req)}
                    isSaving={isUpdating}
                    onSave={(data) =>
                      updateRequirement(
                        { id: req.id, data },
                        {
                          onSuccess: () => {
                            toast.success("Document requirement updated");
                          },
                        },
                      )
                    }
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
        title="Remove Document Requirement"
        description={
          deleteTarget
            ? `Remove "${deleteTarget.documentLabel}" from this application form's document checklist?`
            : undefined
        }
        confirmLabel="Remove"
        onConfirm={confirmDelete}
        isPending={isDeleting}
      />
    </>
  );
}
