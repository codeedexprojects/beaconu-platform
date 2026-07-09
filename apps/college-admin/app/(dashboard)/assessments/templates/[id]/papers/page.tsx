"use client";

import { useState } from "react";
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
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
  useDeleteAssessmentPaper,
} from "@/hooks/use-assessments";
import { useCollegeCoursesMinimal } from "@/hooks/use-colleges";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { AssessmentPaperItem } from "@beaconu/types";

export default function AssessmentPapersPage() {
  const params = useParams<{ id: string }>();
  const templateId = params.id;

  const [open, setOpen] = useState(false);
  const [courseId, setCourseId] = useState("");
  const [expandedPaperId, setExpandedPaperId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<AssessmentPaperItem | null>(null);

  const { data: template } = useAssessmentTemplate(templateId);
  const { data: sections } = useAssessmentSections();
  const { data: courses } = useCollegeCoursesMinimal();
  const { data: papers, isLoading } = useAssessmentPapers(templateId);
  const { mutate: generate, isPending: isGenerating } =
    useGenerateAssessmentPaper(templateId);
  const { mutate: approve } = useApproveAssessmentPaper(templateId);
  const { mutate: removePaper, isPending: isDeleting } =
    useDeleteAssessmentPaper(templateId);

  const hasCalculatorSection = template?.sections.some((ts) => {
    const section = sections?.find((s) => s.id === ts.sectionId);
    return section && !section.isCoreSection;
  });

  function handleGenerate() {
    if (hasCalculatorSection && !courseId) {
      toast.error(
        "Select a course — this template includes a course-specific section",
      );
      return;
    }
    generate(
      {
        generation_type: "auto",
        course_id: hasCalculatorSection ? courseId : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Paper generated");
          setOpen(false);
          setCourseId("");
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
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              Generate Paper
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Generate Paper</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Randomly selects questions from the question bank, matching each
                section&apos;s configured count. This template has{" "}
                {template?.sections.length ?? 0} section(s).
              </p>
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
                    <p className="text-sm font-medium">{paper.paperCode}</p>
                    <p className="text-xs text-muted-foreground">
                      {paper.generationType} · {paper.questions.length}{" "}
                      questions
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
    </div>
  );
}
