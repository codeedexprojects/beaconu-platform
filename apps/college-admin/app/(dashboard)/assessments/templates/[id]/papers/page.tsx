"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Trash2,
  Pencil,
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
  useAssessmentSections,
  useAssessmentTemplate,
  useAssessmentPapers,
  useGenerateAssessmentPaper,
  useApproveAssessmentPaper,
  useRenameAssessmentPaper,
  useDeleteAssessmentPaper,
  useQuestions,
} from "@/hooks/use-assessments";
import { useCollegeCoursesMinimal } from "@/hooks/use-colleges";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type {
  AssessmentPaperItem,
  ManualQuestionSelection,
  QuestionItem,
} from "@beaconu/types";

type GenerationMode = "auto" | "manual";

const PICKER_PAGE_SIZE = 20;

interface ManualSectionPickerProps {
  slug: string;
  requiredCount: number;
  courseId?: string;
  selected: string[];
  onToggle: (questionId: string, checked: boolean) => void;
}

function ManualSectionPicker({
  slug,
  requiredCount,
  courseId,
  selected,
  onToggle,
}: ManualSectionPickerProps) {
  const [page, setPage] = useState(1);
  const [loaded, setLoaded] = useState<QuestionItem[]>([]);

  useEffect(() => {
    setPage(1);
    setLoaded([]);
  }, [slug, courseId]);

  const { data, isLoading, isFetching } = useQuestions(slug, {
    status: "active",
    course_id: courseId,
    page,
    limit: PICKER_PAGE_SIZE,
  });

  useEffect(() => {
    if (!data) return;
    setLoaded((prev) =>
      page === 1 ? data.questions : [...prev, ...data.questions],
    );
  }, [data, page]);

  return (
    <div className="space-y-2">
      <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border p-2">
        {isLoading && page === 1 ? (
          <p className="text-xs text-muted-foreground">Loading questions...</p>
        ) : loaded.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No active questions available for this section
            {courseId ? " and course" : ""}.
          </p>
        ) : (
          loaded.map((q) => (
            <label key={q.id} className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={selected.includes(q.id)}
                disabled={
                  !selected.includes(q.id) && selected.length >= requiredCount
                }
                onChange={(e) => onToggle(q.id, e.target.checked)}
              />
              <span>{q.title || q.content.text || "(untitled question)"}</span>
            </label>
          ))
        )}
      </div>
      {data?.meta.hasNext && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          disabled={isFetching}
          onClick={() => setPage((p) => p + 1)}
        >
          {isFetching ? "Loading..." : "Load more"}
        </Button>
      )}
    </div>
  );
}

export default function AssessmentPapersPage() {
  const params = useParams<{ id: string }>();
  const templateId = params.id;

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<GenerationMode>("auto");
  const [name, setName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [manualSelections, setManualSelections] = useState<
    Record<string, string[]>
  >({});
  const [expandedPaperId, setExpandedPaperId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<AssessmentPaperItem | null>(null);
  const [renaming, setRenaming] = useState<AssessmentPaperItem | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const { data: template } = useAssessmentTemplate(templateId);
  const { data: sections } = useAssessmentSections();
  const { data: courses } = useCollegeCoursesMinimal();
  const { data: papers, isLoading } = useAssessmentPapers(templateId);
  const { mutate: generate, isPending: isGenerating } =
    useGenerateAssessmentPaper(templateId);
  const { mutate: approve } = useApproveAssessmentPaper(templateId);
  const { mutate: rename, isPending: isRenaming } =
    useRenameAssessmentPaper(templateId);
  const { mutate: removePaper, isPending: isDeleting } =
    useDeleteAssessmentPaper(templateId);

  const hasCalculatorSection = template?.sections.some((ts) => {
    const section = sections?.find((s) => s.id === ts.sectionId);
    return section && !section.isCoreSection;
  });

  function resetDialog() {
    setMode("auto");
    setName("");
    setCourseId("");
    setManualSelections({});
  }

  function openRename(paper: AssessmentPaperItem) {
    setRenaming(paper);
    setRenameValue(paper.name ?? "");
  }

  function confirmRename() {
    if (!renaming || !renameValue.trim()) return;
    rename(
      { id: renaming.id, name: renameValue.trim() },
      {
        onSuccess: () => {
          toast.success("Paper renamed");
          setRenaming(null);
        },
      },
    );
  }

  function toggleManualSelection(
    sectionId: string,
    questionId: string,
    checked: boolean,
  ) {
    setManualSelections((prev) => {
      const current = prev[sectionId] ?? [];
      const next = checked
        ? [...current, questionId]
        : current.filter((id) => id !== questionId);
      return { ...prev, [sectionId]: next };
    });
  }

  function handleGenerate() {
    if (hasCalculatorSection && !courseId) {
      toast.error(
        "Select a course — this template includes a course-specific section",
      );
      return;
    }

    if (mode === "manual") {
      const manual_selections: ManualQuestionSelection[] = [];
      for (const ts of template?.sections ?? []) {
        const selected = manualSelections[ts.sectionId] ?? [];
        if (selected.length !== ts.questionCount) {
          toast.error(
            `"${ts.sectionName}" needs exactly ${ts.questionCount} question(s), selected ${selected.length}`,
          );
          return;
        }
        for (const questionId of selected) {
          manual_selections.push({
            question_id: questionId,
            section_id: ts.sectionId,
          });
        }
      }

      generate(
        {
          generation_type: "manual",
          name: name.trim() || undefined,
          manual_selections,
          course_id: hasCalculatorSection ? courseId : undefined,
        },
        {
          onSuccess: () => {
            toast.success("Paper generated");
            setOpen(false);
            resetDialog();
          },
        },
      );
      return;
    }

    generate(
      {
        generation_type: "auto",
        name: name.trim() || undefined,
        course_id: hasCalculatorSection ? courseId : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Paper generated");
          setOpen(false);
          resetDialog();
        },
      },
    );
  }

  function handleApprove(paper: AssessmentPaperItem) {
    approve(paper.id, {
      onSuccess: () => toast.success("Paper approved"),
    });
  }

  function confirmDelete() {
    if (!deleting) return;
    removePaper(deleting.id, {
      onSuccess: () => {
        toast.success("Paper deleted");
        setDeleting(null);
      },
    });
  }

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 -ml-2" asChild>
            <Link href="/assessments/templates">
              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {template?.name ?? "Template"} — Papers
          </h1>
          <p className="text-sm text-muted-foreground">
            Generate and approve question papers for this template.
          </p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) resetDialog();
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              Generate Paper
            </Button>
          </DialogTrigger>
          <DialogContent
            className={
              mode === "manual"
                ? "max-h-[90vh] overflow-y-auto sm:max-w-2xl"
                : "sm:max-w-md"
            }
          >
            <DialogHeader>
              <DialogTitle>Generate Paper</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Method</Label>
                <Select
                  value={mode}
                  onValueChange={(v) => setMode(v as GenerationMode)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto Generate</SelectItem>
                    <SelectItem value="manual">
                      Manual — Pick Questions
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {mode === "auto" ? (
                <p className="text-sm text-muted-foreground">
                  Randomly selects questions from the question bank, matching
                  each section&apos;s configured count. This template has{" "}
                  {template?.sections.length ?? 0} section(s).
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Pick the exact questions for each section — useful when
                  auto-generate keeps producing the same paper because the
                  question bank doesn&apos;t have enough spare questions.
                </p>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="paper_name">
                  Name <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="paper_name"
                  placeholder="e.g. Set A, Morning Batch, Retake"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {hasCalculatorSection && (
                <div className="space-y-1.5">
                  <Label>Course</Label>
                  <Select value={courseId} onValueChange={setCourseId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} ({c.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Required — this template includes a course-specific
                    (calculator) section.
                  </p>
                </div>
              )}

              {mode === "manual" &&
                template?.sections.map((ts) => {
                  const section = sections?.find((s) => s.id === ts.sectionId);
                  if (!section) return null;
                  const selected = manualSelections[ts.sectionId] ?? [];
                  return (
                    <div key={ts.sectionId} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label>{ts.sectionName}</Label>
                        <span
                          className={
                            selected.length === ts.questionCount
                              ? "text-xs text-muted-foreground"
                              : "text-xs text-destructive"
                          }
                        >
                          {selected.length}/{ts.questionCount} selected
                        </span>
                      </div>
                      <ManualSectionPicker
                        slug={section.slug}
                        requiredCount={ts.questionCount}
                        courseId={
                          !section.isCoreSection
                            ? courseId || undefined
                            : undefined
                        }
                        selected={selected}
                        onToggle={(questionId, checked) =>
                          toggleManualSelection(
                            ts.sectionId,
                            questionId,
                            checked,
                          )
                        }
                      />
                    </div>
                  );
                })}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleGenerate} disabled={isGenerating}>
                  {isGenerating ? "Generating..." : "Generate"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))
        ) : !papers || papers.length === 0 ? (
          <div className="rounded-xl border py-20 text-center text-muted-foreground">
            No papers generated yet.
          </div>
        ) : (
          papers.map((paper) => {
            const isExpanded = expandedPaperId === paper.id;
            return (
              <div key={paper.id} className="rounded-xl border shadow-sm">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium">
                        {paper.name ?? paper.paperCode}
                      </p>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => openRename(paper)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {paper.paperCode} · {paper.generationType} ·{" "}
                      {paper.questions.length} questions
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        paper.status === "approved" ? "default" : "outline"
                      }
                    >
                      {paper.status}
                    </Badge>
                    {paper.status === "draft" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 text-xs"
                          onClick={() => handleApprove(paper)}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
                          onClick={() => setDeleting(paper)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() =>
                        setExpandedPaperId(isExpanded ? null : paper.id)
                      }
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="space-y-2 border-t p-4">
                    {paper.questions.map((pq) => (
                      <div
                        key={pq.id}
                        className="rounded-md border bg-muted/30 p-3 text-sm"
                      >
                        <p className="text-xs font-medium text-muted-foreground">
                          {pq.sectionName} · #{pq.questionOrder + 1}
                        </p>
                        <p className="mt-1">
                          {pq.question.title || pq.question.content.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Delete paper?"
        description={
          deleting
            ? `"${deleting.paperCode}" will be removed from this list. This can't be undone from here.`
            : undefined
        }
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        isPending={isDeleting}
      />

      <Dialog open={!!renaming} onOpenChange={(v) => !v && setRenaming(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename Paper</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="rename_value">Name</Label>
              <Input
                id="rename_value"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder={renaming?.paperCode}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRenaming(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmRename}
                disabled={isRenaming || !renameValue.trim()}
              >
                {isRenaming ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
