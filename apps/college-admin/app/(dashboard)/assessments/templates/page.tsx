"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Archive,
  CheckCircle2,
  X,
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
  useAssessmentSections,
  useAssessmentTemplates,
  useCreateAssessmentTemplate,
  useUpdateAssessmentTemplate,
  useActivateAssessmentTemplate,
  useArchiveAssessmentTemplate,
} from "@/hooks/use-assessments";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type {
  AssessmentTemplateItem,
  NegativeMarkingMode,
  TemplateSectionInput,
} from "@beaconu/types";

const templateSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  total_marks: z.coerce.number().positive("Total marks must be greater than 0"),
  total_duration_mins: z.coerce
    .number()
    .int()
    .positive("Duration must be greater than 0"),
  negative_marking_mode: z.enum(["none", "fixed", "proportional"]),
});
type TemplateFormValues = z.infer<typeof templateSchema>;

const EMPTY_VALUES: TemplateFormValues = {
  name: "",
  total_marks: 100,
  total_duration_mins: 90,
  negative_marking_mode: "none",
};

interface SectionRow extends TemplateSectionInput {
  key: string;
}

interface InstructionRow {
  key: string;
  heading: string;
  description: string;
}

const STATUS_VARIANT: Record<
  AssessmentTemplateItem["status"],
  "default" | "outline" | "secondary"
> = {
  draft: "outline",
  active: "default",
  archived: "secondary",
};

export default function AssessmentTemplatesPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AssessmentTemplateItem | null>(null);
  const [rows, setRows] = useState<SectionRow[]>([]);
  const [instructionRows, setInstructionRows] = useState<InstructionRow[]>([]);
  const [archiving, setArchiving] = useState<AssessmentTemplateItem | null>(
    null,
  );

  const { data: sections } = useAssessmentSections();
  const { data: templates, isLoading } = useAssessmentTemplates();
  const { mutate: create, isPending: isCreating } =
    useCreateAssessmentTemplate();
  const { mutate: update, isPending: isUpdating } =
    useUpdateAssessmentTemplate();
  const { mutate: activate } = useActivateAssessmentTemplate();
  const { mutate: archive, isPending: isArchiving } =
    useArchiveAssessmentTemplate();

  const enabledSections = sections?.filter((s) => s.isActive) ?? [];

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: EMPTY_VALUES,
  });

  function openCreate() {
    setEditing(null);
    form.reset(EMPTY_VALUES);
    setRows([]);
    setInstructionRows([]);
    setOpen(true);
  }

  function openEdit(item: AssessmentTemplateItem) {
    setEditing(item);
    form.reset({
      name: item.name,
      total_marks: item.totalMarks,
      total_duration_mins: item.totalDurationMins,
      negative_marking_mode: item.negativeMarkingMode,
    });
    setRows(
      item.sections.map((s) => ({
        key: s.id,
        section_id: s.sectionId,
        question_count: s.questionCount,
        time_limit_mins: s.timeLimitMins,
        section_weightage: s.sectionWeightage ?? undefined,
      })),
    );
    setInstructionRows(
      item.instructions.map((ins, index) => ({
        key: `${index}-${Math.random().toString(36).slice(2, 8)}`,
        heading: ins.heading,
        description: ins.description,
      })),
    );
    setOpen(true);
  }

  function addInstructionRow() {
    setInstructionRows((prev) => [
      ...prev,
      {
        key: Math.random().toString(36).slice(2, 10),
        heading: "",
        description: "",
      },
    ]);
  }

  function updateInstructionRow(key: string, patch: Partial<InstructionRow>) {
    setInstructionRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, ...patch } : r)),
    );
  }

  function removeInstructionRow(key: string) {
    setInstructionRows((prev) => prev.filter((r) => r.key !== key));
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      {
        key: Math.random().toString(36).slice(2, 10),
        section_id: "",
        question_count: 5,
        time_limit_mins: 10,
        section_weightage: undefined,
      },
    ]);
  }

  function updateRow(key: string, patch: Partial<TemplateSectionInput>) {
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, ...patch } : r)),
    );
  }

  function removeRow(key: string) {
    setRows((prev) => prev.filter((r) => r.key !== key));
  }

  const weightageSum = rows.reduce(
    (sum, r) => sum + (r.section_weightage ?? 0),
    0,
  );
  const anyWeightageSet = rows.some((r) => r.section_weightage !== undefined);

  function onSubmit(values: TemplateFormValues) {
    if (rows.length === 0) {
      toast.error("Add at least one section");
      return;
    }
    if (rows.some((r) => !r.section_id)) {
      toast.error("Select a section for every row");
      return;
    }
    if (
      instructionRows.some((r) => !r.heading.trim() || !r.description.trim())
    ) {
      toast.error("Fill in both heading and description for every instruction");
      return;
    }

    const payload = {
      ...values,
      instructions: instructionRows.map(({ heading, description }) => ({
        heading,
        description,
      })),
      sections: rows.map(({ key: _key, ...rest }) => rest),
    };

    if (editing) {
      update(
        { id: editing.id, data: payload },
        {
          onSuccess: () => {
            toast.success("Template updated");
            setOpen(false);
          },
        },
      );
    } else {
      create(payload, {
        onSuccess: () => {
          toast.success("Template created");
          setOpen(false);
        },
      });
    }
  }

  function handleActivate(item: AssessmentTemplateItem) {
    activate(item.id, {
      onSuccess: () => toast.success("Template activated"),
    });
  }

  function confirmArchive() {
    if (!archiving) return;
    archive(archiving.id, {
      onSuccess: () => {
        toast.success("Template archived");
        setArchiving(null);
      },
    });
  }

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 -ml-2" asChild>
            <Link href="/assessments">
              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            Assessment Templates
          </h1>
          <p className="text-sm text-muted-foreground">
            Define the structure of an assessment: sections, question counts,
            time limits, and weightage.
          </p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) setEditing(null);
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Template" : "Add Template"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Standard Admission Assessment"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="total_marks">Total Marks</Label>
                  <Input
                    id="total_marks"
                    type="number"
                    {...form.register("total_marks")}
                  />
                  {form.formState.errors.total_marks && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.total_marks.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="total_duration_mins">Duration (mins)</Label>
                  <Input
                    id="total_duration_mins"
                    type="number"
                    {...form.register("total_duration_mins")}
                  />
                  {form.formState.errors.total_duration_mins && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.total_duration_mins.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="negative_marking_mode">
                    Negative Marking
                  </Label>
                  <Select
                    value={form.watch("negative_marking_mode")}
                    onValueChange={(v) =>
                      form.setValue(
                        "negative_marking_mode",
                        v as NegativeMarkingMode,
                      )
                    }
                  >
                    <SelectTrigger id="negative_marking_mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="proportional">Proportional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Instructions</Label>
                <p className="text-xs text-muted-foreground">
                  Shown to students before they start the assessment — e.g. time
                  limit, allowed materials, conduct rules.
                </p>
                <div className="space-y-2 rounded-md border p-2">
                  {instructionRows.map((row) => (
                    <div
                      key={row.key}
                      className="flex items-start gap-2 rounded-md border p-2"
                    >
                      <div className="flex-1 space-y-1.5">
                        <Input
                          className="h-8 text-xs"
                          placeholder="Heading — e.g. Time Limit"
                          value={row.heading}
                          onChange={(e) =>
                            updateInstructionRow(row.key, {
                              heading: e.target.value,
                            })
                          }
                        />
                        <Input
                          className="h-8 text-xs"
                          placeholder="Description — e.g. You have 90 minutes to complete this assessment."
                          value={row.description}
                          onChange={(e) =>
                            updateInstructionRow(row.key, {
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeInstructionRow(row.key)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addInstructionRow}
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Add Instruction
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>Sections</Label>
                  {anyWeightageSet && (
                    <span
                      className={
                        Math.abs(weightageSum - 100) > 0.1
                          ? "text-xs text-destructive"
                          : "text-xs text-muted-foreground"
                      }
                    >
                      Weightage total: {weightageSum}%
                    </span>
                  )}
                </div>
                <div className="space-y-2 rounded-md border p-2">
                  {rows.length > 0 && (
                    <div className="grid grid-cols-[1fr_90px_90px_90px_32px] gap-2 px-0.5">
                      <span className="text-xs font-medium text-muted-foreground">
                        Section
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">
                        Questions
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">
                        Time (mins)
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">
                        Weightage %
                      </span>
                      <span />
                    </div>
                  )}
                  {rows.map((row) => (
                    <div
                      key={row.key}
                      className="grid grid-cols-[1fr_90px_90px_90px_32px] items-center gap-2"
                    >
                      <Select
                        value={row.section_id}
                        onValueChange={(v) =>
                          updateRow(row.key, { section_id: v })
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select section" />
                        </SelectTrigger>
                        <SelectContent>
                          {enabledSections.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        className="h-8 text-xs"
                        aria-label="Question count"
                        placeholder="e.g. 5"
                        value={row.question_count}
                        onChange={(e) =>
                          updateRow(row.key, {
                            question_count: Number(e.target.value),
                          })
                        }
                      />
                      <Input
                        type="number"
                        className="h-8 text-xs"
                        aria-label="Time limit in minutes"
                        placeholder="e.g. 10"
                        value={row.time_limit_mins}
                        onChange={(e) =>
                          updateRow(row.key, {
                            time_limit_mins: Number(e.target.value),
                          })
                        }
                      />
                      <Input
                        type="number"
                        className="h-8 text-xs"
                        aria-label="Section weightage percent"
                        placeholder="optional"
                        value={row.section_weightage ?? ""}
                        onChange={(e) =>
                          updateRow(row.key, {
                            section_weightage:
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                          })
                        }
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeRow(row.key)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addRow}
                    disabled={!enabledSections.length}
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Add Section
                  </Button>
                  {!enabledSections.length && (
                    <p className="text-xs text-muted-foreground">
                      Enable at least one assessment section first.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {isCreating || isUpdating
                    ? "Saving..."
                    : editing
                      ? "Save Changes"
                      : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 overflow-hidden rounded-xl border shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="py-4 pl-6 text-xs font-semibold uppercase tracking-wide">
                  Name
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Questions
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Marks
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Duration
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Status
                </TableHead>
                <TableHead className="w-[180px] py-4 pr-6 text-right text-xs font-semibold uppercase tracking-wide">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i} className="border-b last:border-0">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j} className="py-4">
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : !templates || templates.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-20 text-center text-muted-foreground"
                  >
                    No templates yet.
                  </TableCell>
                </TableRow>
              ) : (
                templates.map((t) => (
                  <TableRow
                    key={t.id}
                    className="border-b last:border-0 transition-colors hover:bg-muted/30"
                  >
                    <TableCell className="py-4 pl-6 text-sm font-medium">
                      {t.name}
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      {t.totalQuestions}
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      {t.totalMarks}
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      {t.totalDurationMins} mins
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant={STATUS_VARIANT[t.status]}>
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right">
                      <div className="flex justify-end gap-2">
                        {t.status !== "archived" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 text-xs"
                            onClick={() => openEdit(t)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                        )}
                        {t.status === "draft" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 text-xs"
                            onClick={() => handleActivate(t)}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Activate
                          </Button>
                        )}
                        {t.status === "active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 text-xs"
                            asChild
                          >
                            <Link
                              href={`/assessments/templates/${t.id}/papers`}
                            >
                              Papers
                            </Link>
                          </Button>
                        )}
                        {t.status === "active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 text-xs"
                            asChild
                          >
                            <Link href={`/assessments/templates/${t.id}/slots`}>
                              Slots
                            </Link>
                          </Button>
                        )}
                        {t.status !== "archived" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
                            onClick={() => setArchiving(t)}
                          >
                            <Archive className="h-3.5 w-3.5" />
                            Archive
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ConfirmDialog
        open={!!archiving}
        onOpenChange={(v) => !v && setArchiving(null)}
        title="Archive template?"
        description={
          archiving
            ? `"${archiving.name}" will no longer be usable for new paper generation. This can't be undone from here.`
            : undefined
        }
        confirmLabel="Archive"
        onConfirm={confirmArchive}
        isPending={isArchiving}
      />
    </div>
  );
}
