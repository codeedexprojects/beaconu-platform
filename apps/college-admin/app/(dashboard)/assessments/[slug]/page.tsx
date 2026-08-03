"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
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
  useQuestionTypes,
  useQuestions,
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
} from "@/hooks/use-assessments";
import { useCollegeCoursesMinimal } from "@/hooks/use-colleges";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  uploadAssessmentMedia,
  CORE_SECTIONS,
  CALCULATOR_SECTIONS,
} from "@/lib/services/assessments.service";
import type {
  QuestionItem,
  QuestionOption,
  QuestionBlank,
} from "@beaconu/types";

// Mirrors question-bank.service.ts's validation groups — word_highlight
// (Highlight Incorrect Words) is structurally identical to multi_choice
// (options + correct option ids), just a different answer widget.
const CHOICE_FORMATS = ["single_choice", "multi_choice", "word_highlight"];
const ORDERED_FORMATS = ["ranking", "sequence"];
const FILL_BLANK_FORMATS = ["fill_blank_drag_drop", "fill_blank_dropdown"];

const questionSchema = z
  .object({
    question_type_id: z.string().trim().min(1, "Question type is required"),
    difficulty: z.enum(["easy", "medium", "hard"]),
    title: z.string().trim().optional(),
    prompt_type: z.enum(["text", "audio"]),
    text: z.string().trim().optional(),
    question: z.string().trim().optional(),
    audio_url: z.string().trim().optional(),
    image_url: z.string().trim().optional(),
    marks: z.coerce.number().positive("Marks must be greater than 0"),
    negative_marks: z.coerce.number().min(0).optional(),
    course_ids: z.array(z.string()).optional(),
  })
  .refine(
    (data) =>
      data.negative_marks === undefined || data.negative_marks <= data.marks,
    {
      message: "Negative marks cannot exceed marks",
      path: ["negative_marks"],
    },
  );
type QuestionFormValues = z.infer<typeof questionSchema>;

const EMPTY_VALUES: QuestionFormValues = {
  question_type_id: "",
  difficulty: "medium",
  title: "",
  prompt_type: "text",
  text: "",
  question: "",
  audio_url: "",
  image_url: "",
  marks: 5,
  negative_marks: 0,
  course_ids: [],
};

function newOptionId() {
  return Math.random().toString(36).slice(2, 10);
}

// Fill-in-the-blank passages mark each blank's position inline with this
// token (e.g. "The cat sat on the [[blank]] and looked at the [[blank]].")
// instead of a separate, position-less "Add Blank" button — the blank list
// is derived from the passage text itself, so it can never drift out of
// sync with where the blanks actually are.
const BLANK_MARKER_REGEX = /\[\[blank\]\]/gi;

function detectBlanks(text: string): QuestionBlank[] {
  const count = (text.match(BLANK_MARKER_REGEX) ?? []).length;
  return Array.from({ length: count }, (_, i) => ({
    id: `blank-${i + 1}`,
    label: `Blank ${i + 1}`,
  }));
}

const PAGE_SIZE = 20;

export default function AssessmentSectionQuestionsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const sectionMeta =
    CORE_SECTIONS.find((s) => s.slug === slug) ??
    CALCULATOR_SECTIONS.find((s) => s.slug === slug);
  const isCoreSection = CORE_SECTIONS.some((s) => s.slug === slug);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<QuestionItem | null>(null);
  const [uploadingField, setUploadingField] = useState<
    "audio_url" | "image_url" | null
  >(null);
  const [options, setOptions] = useState<QuestionOption[]>([]);
  const [correctOptionIds, setCorrectOptionIds] = useState<string[]>([]);
  const [blankAnswers, setBlankAnswers] = useState<Record<string, string>>({});
  const [matchLeftItems, setMatchLeftItems] = useState<QuestionBlank[]>([]);
  const [uploadingMatchItemId, setUploadingMatchItemId] = useState<
    string | null
  >(null);
  const [deleting, setDeleting] = useState<QuestionItem | null>(null);
  const [page, setPage] = useState(1);

  const { data: questionTypes, isLoading: typesLoading } =
    useQuestionTypes(slug);
  const { data: questionsData, isLoading: questionsLoading } = useQuestions(
    slug,
    { page, limit: PAGE_SIZE },
  );
  const questions = questionsData?.questions;
  const meta = questionsData?.meta;
  const { data: courses } = useCollegeCoursesMinimal();
  const { mutate: create, isPending: isCreating } = useCreateQuestion(slug);
  const { mutate: update, isPending: isUpdating } = useUpdateQuestion(slug);
  const { mutate: remove, isPending: isDeleting } = useDeleteQuestion(slug);

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: EMPTY_VALUES,
  });

  const selectedType = questionTypes?.find(
    (t) => t.id === form.watch("question_type_id"),
  );
  const isChoice =
    !!selectedType && CHOICE_FORMATS.includes(selectedType.responseFormat);
  const isOrdered =
    !!selectedType && ORDERED_FORMATS.includes(selectedType.responseFormat);
  const isFillBlank =
    !!selectedType && FILL_BLANK_FORMATS.includes(selectedType.responseFormat);
  const isMatching = selectedType?.responseFormat === "matching";

  // fill_blank_* derives its blanks from the passage text's [[blank]]
  // markers — there's no passage for "matching" (it's a two-column pairing,
  // not a sentence), so its left-column items are authored directly via
  // matchLeftItems, same add/edit/remove shape as blanks used to be before
  // the marker-based UI existed.
  const watchedText = form.watch("text") ?? "";
  const blanks = useMemo(() => {
    if (isFillBlank) return detectBlanks(watchedText);
    if (isMatching) return matchLeftItems;
    return [];
  }, [isFillBlank, watchedText, isMatching, matchLeftItems]);
  const textFieldReg = form.register("text");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  /** Inserts "[[blank]]" at the current cursor position (or the end, if
   * the textarea isn't focused) instead of making the admin type the
   * marker by hand — click to drop in a blank right where the cursor is. */
  function insertBlankMarker() {
    const el = textareaRef.current;
    const current = form.getValues("text") ?? "";
    const start = el?.selectionStart ?? current.length;
    const end = el?.selectionEnd ?? current.length;
    const next = `${current.slice(0, start)}[[blank]]${current.slice(end)}`;
    form.setValue("text", next, { shouldDirty: true, shouldValidate: true });
    const cursor = start + "[[blank]]".length;
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(cursor, cursor);
    });
  }

  function addMatchItem() {
    setMatchLeftItems((prev) => [...prev, { id: newOptionId(), label: "" }]);
  }

  function updateMatchItemLabel(id: string, label: string) {
    setMatchLeftItems((prev) =>
      prev.map((b) => (b.id === id ? { ...b, label } : b)),
    );
  }

  function updateMatchItemImage(id: string, imageUrl: string | undefined) {
    setMatchLeftItems((prev) =>
      prev.map((b) => (b.id === id ? { ...b, imageUrl } : b)),
    );
  }

  async function handleMatchItemImageChange(id: string, file: File | null) {
    if (!file) return;
    setUploadingMatchItemId(id);
    try {
      const url = await uploadAssessmentMedia(slug, file);
      updateMatchItemImage(id, url);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload image",
      );
    } finally {
      setUploadingMatchItemId(null);
    }
  }

  function removeMatchItem(id: string) {
    setMatchLeftItems((prev) => prev.filter((b) => b.id !== id));
    setBlankAnswers((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function openCreate() {
    setEditing(null);
    form.reset(EMPTY_VALUES);
    setOptions([]);
    setCorrectOptionIds([]);
    setBlankAnswers({});
    setMatchLeftItems([]);
    setOpen(true);
  }

  function openEdit(item: QuestionItem) {
    setEditing(item);
    const type = questionTypes?.find((t) => t.id === item.questionTypeId);
    form.reset({
      question_type_id: item.questionTypeId,
      difficulty: item.difficulty,
      title: item.title ?? "",
      prompt_type:
        item.content.promptType ?? (type?.hasAudio ? "audio" : "text"),
      text: item.content.text ?? "",
      question: item.content.question ?? "",
      audio_url: item.content.audioUrl ?? "",
      image_url: item.content.imageUrl ?? "",
      marks: item.marks,
      negative_marks: item.negativeMarks,
      course_ids: item.courseIds,
    });
    setOptions(item.content.options ?? []);
    setCorrectOptionIds(item.answerKey?.correctOptionIds ?? []);

    const savedBlanks = item.content.blanks ?? [];
    const answerBySavedId = Object.fromEntries(
      (item.answerKey?.blankAnswers ?? []).map((a) => [a.blankId, a.optionId]),
    );

    if (type?.responseFormat === "matching") {
      // Matching items keep whatever id they were saved with — nothing to
      // derive positionally, unlike fill_blank's text-marker-driven ids.
      setMatchLeftItems(savedBlanks);
      setBlankAnswers(answerBySavedId);
    } else {
      // Remap positionally (index in the saved blanks[] -> "blank-{n}") so
      // this works both for older questions authored with random blank ids
      // and for ones already using the [[blank]]-derived positional scheme.
      setMatchLeftItems([]);
      setBlankAnswers(
        Object.fromEntries(
          savedBlanks
            .map((b, i) => [`blank-${i + 1}`, answerBySavedId[b.id]])
            .filter(([, optionId]) => optionId !== undefined),
        ),
      );
    }
    setOpen(true);
  }

  function handleQuestionTypeChange(typeId: string) {
    form.setValue("question_type_id", typeId);
    const type = questionTypes?.find((t) => t.id === typeId);
    if (type) {
      form.setValue("prompt_type", type.hasAudio ? "audio" : "text");
    }
  }

  function setBlankAnswer(blankId: string, optionId: string) {
    setBlankAnswers((prev) => ({ ...prev, [blankId]: optionId }));
  }

  async function handleFileChange(
    field: "audio_url" | "image_url",
    file: File | null,
  ) {
    if (!file) return;
    setUploadingField(field);
    try {
      const url = await uploadAssessmentMedia(slug, file);
      form.setValue(field, url);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload file",
      );
    } finally {
      setUploadingField(null);
    }
  }

  function addOption() {
    setOptions((prev) => [...prev, { id: newOptionId(), text: "" }]);
  }

  function updateOptionText(id: string, text: string) {
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, text } : o)));
  }

  function removeOption(id: string) {
    setOptions((prev) => prev.filter((o) => o.id !== id));
    setCorrectOptionIds((prev) => prev.filter((oid) => oid !== id));
  }

  function moveOption(index: number, direction: -1 | 1) {
    setOptions((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function toggleCorrectOption(id: string, checked: boolean) {
    setCorrectOptionIds((prev) =>
      checked ? [...prev, id] : prev.filter((oid) => oid !== id),
    );
  }

  function onSubmit(values: QuestionFormValues) {
    if (
      !isCoreSection &&
      (!values.course_ids || values.course_ids.length === 0)
    ) {
      toast.error(
        "This section is course-specific — select at least one course",
      );
      return;
    }

    if (isFillBlank || isMatching) {
      if (blanks.length === 0) {
        toast.error(
          isMatching
            ? "Add at least one left-column item to match"
            : "Add [[blank]] in the passage text for each blank you want",
        );
        return;
      }
      if (isMatching && blanks.some((b) => !b.label?.trim() && !b.imageUrl)) {
        toast.error("Give every left-column item text and/or an image");
        return;
      }
      if (blanks.some((b) => !blankAnswers[b.id])) {
        toast.error("Select the correct option for every blank");
        return;
      }
    }

    const payload = {
      question_type_id: values.question_type_id,
      difficulty: values.difficulty,
      title: values.title || undefined,
      content: {
        text: values.text || undefined,
        question: values.question || undefined,
        audioUrl: values.audio_url || undefined,
        imageUrl: values.image_url || undefined,
        options: options.length > 0 ? options : undefined,
        promptType: values.prompt_type,
        blanks: isFillBlank || isMatching ? blanks : undefined,
      },
      answer_key:
        isFillBlank || isMatching
          ? {
              blankAnswers: blanks.map((b) => ({
                blankId: b.id,
                optionId: blankAnswers[b.id],
              })),
            }
          : isChoice
            ? { correctOptionIds }
            : isOrdered
              ? { correctOrder: options.map((o) => o.id) }
              : undefined,
      marks: values.marks,
      negative_marks: values.negative_marks,
      course_ids: values.course_ids,
    };

    if (editing) {
      update(
        { id: editing.id, data: payload },
        {
          onSuccess: () => {
            toast.success("Question updated");
            setOpen(false);
          },
        },
      );
    } else {
      create(payload, {
        onSuccess: () => {
          toast.success("Question created");
          setOpen(false);
          setPage(1);
        },
      });
    }
  }

  function confirmDelete() {
    if (!deleting) return;
    remove(deleting.id, {
      onSuccess: () => {
        toast.success("Question deleted");
        setDeleting(null);
        if (questions?.length === 1 && page > 1) {
          setPage(page - 1);
        }
      },
    });
  }

  function toggleCourse(courseId: string, checked: boolean) {
    const current = form.getValues("course_ids") ?? [];
    form.setValue(
      "course_ids",
      checked
        ? [...current, courseId]
        : current.filter((id) => id !== courseId),
    );
  }

  const isLoading = typesLoading || questionsLoading;

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
            {sectionMeta?.name ?? slug} — Questions
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage questions across all question types in this section. Leave
            courses unselected to apply a question to every course.
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
              Add Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Question" : "Add Question"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="question_type_id">Question Type</Label>
                <Select
                  value={form.watch("question_type_id")}
                  onValueChange={handleQuestionTypeChange}
                >
                  <SelectTrigger id="question_type_id">
                    <SelectValue placeholder="Select a question type" />
                  </SelectTrigger>
                  <SelectContent>
                    {questionTypes?.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.question_type_id && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.question_type_id.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={form.watch("difficulty")}
                  onValueChange={(v) =>
                    form.setValue(
                      "difficulty",
                      v as QuestionFormValues["difficulty"],
                    )
                  }
                >
                  <SelectTrigger id="difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="title">
                  Title{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input id="title" {...form.register("title")} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="prompt_type">Prompt Type</Label>
                <Select
                  value={form.watch("prompt_type")}
                  onValueChange={(v) =>
                    form.setValue("prompt_type", v as "text" | "audio")
                  }
                >
                  <SelectTrigger id="prompt_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="audio">Audio File</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="text">
                    {isFillBlank
                      ? "Passage"
                      : isMatching
                        ? "Instructions"
                        : isChoice || isOrdered
                          ? "Prompt"
                          : "Question Text"}
                    {(form.watch("prompt_type") === "audio" || isMatching) && (
                      <span className="text-muted-foreground"> (optional)</span>
                    )}
                  </Label>
                  {isFillBlank && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 gap-1 text-xs"
                      onClick={insertBlankMarker}
                    >
                      <Plus className="h-3 w-3" />
                      Insert Blank
                    </Button>
                  )}
                </div>
                <textarea
                  id="text"
                  rows={3}
                  placeholder={
                    isFillBlank
                      ? "Type [[blank]] wherever a blank should go, e.g. The cat sat on the [[blank]] and looked at the [[blank]]."
                      : isMatching
                        ? "e.g. Match each capital city to its correct country."
                        : "Prompt or passage shown to the student"
                  }
                  {...textFieldReg}
                  ref={(el) => {
                    textFieldReg.ref(el);
                    textareaRef.current = el;
                  }}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {isFillBlank && (
                  <p className="text-xs text-muted-foreground">
                    {blanks.length > 0
                      ? `${blanks.length} blank${blanks.length === 1 ? "" : "s"} detected`
                      : "No [[blank]] markers found yet — type [[blank]] wherever a blank should go."}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="question">
                  Question{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <textarea
                  id="question"
                  rows={2}
                  placeholder="For prompt/passage-based questions — the actual question being asked about the prompt above"
                  {...form.register("question")}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {form.watch("prompt_type") === "audio" && (
                <div className="space-y-1.5">
                  <Label htmlFor="audio_file">Audio Upload (required)</Label>
                  <Input
                    id="audio_file"
                    type="file"
                    accept="audio/mpeg,audio/mp4,audio/wav"
                    onChange={(e) =>
                      handleFileChange("audio_url", e.target.files?.[0] ?? null)
                    }
                  />
                  {uploadingField === "audio_url" && (
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" /> Uploading...
                    </p>
                  )}
                  {form.watch("audio_url") && (
                    <audio
                      controls
                      src={form.watch("audio_url")}
                      className="mt-1 h-9 w-full"
                    />
                  )}
                </div>
              )}

              {selectedType?.hasImage && (
                <div className="space-y-1.5">
                  <Label htmlFor="image_file">Image Upload (required)</Label>
                  <Input
                    id="image_file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) =>
                      handleFileChange("image_url", e.target.files?.[0] ?? null)
                    }
                  />
                  {uploadingField === "image_url" && (
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" /> Uploading...
                    </p>
                  )}
                  {form.watch("image_url") && (
                    <img
                      src={form.watch("image_url")}
                      alt="Question"
                      className="mt-1 h-24 w-full rounded-md object-cover"
                    />
                  )}
                </div>
              )}

              {(isChoice || isOrdered) && (
                <div className="space-y-1.5">
                  <Label>
                    Options{" "}
                    {isOrdered && (
                      <span className="text-muted-foreground">
                        (order = correct order)
                      </span>
                    )}
                  </Label>
                  <div className="space-y-2 rounded-md border p-2">
                    {options.map((opt, idx) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        {isChoice && (
                          <input
                            type="checkbox"
                            checked={correctOptionIds.includes(opt.id)}
                            onChange={(e) =>
                              toggleCorrectOption(opt.id, e.target.checked)
                            }
                            title="Mark as correct"
                          />
                        )}
                        <Input
                          value={opt.text}
                          placeholder={`Option ${idx + 1}`}
                          onChange={(e) =>
                            updateOptionText(opt.id, e.target.value)
                          }
                          className="h-8 flex-1 text-sm"
                        />
                        {isOrdered && (
                          <>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => moveOption(idx, -1)}
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => moveOption(idx, 1)}
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeOption(opt.id)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={addOption}
                    >
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      Add Option
                    </Button>
                  </div>
                </div>
              )}

              {(isFillBlank || isMatching) && (
                <>
                  <div className="space-y-1.5">
                    <Label>
                      {isMatching ? "Right Column (Word Bank)" : "Word Bank"}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {isMatching
                        ? "The right-column choices students match each left item to."
                        : "The choices students can pick from for each blank."}
                    </p>
                    <div className="space-y-2 rounded-md border p-2">
                      {options.map((opt, idx) => (
                        <div key={opt.id} className="flex items-center gap-2">
                          <Input
                            value={opt.text}
                            placeholder={`Option ${idx + 1}`}
                            onChange={(e) =>
                              updateOptionText(opt.id, e.target.value)
                            }
                            className="h-8 flex-1 text-sm"
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeOption(opt.id)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={addOption}
                      >
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        Add Option
                      </Button>
                    </div>
                  </div>

                  {isMatching ? (
                    <div className="space-y-1.5">
                      <Label>Left Column</Label>
                      <p className="text-xs text-muted-foreground">
                        The items students match to a right-column option each.
                      </p>
                      <div className="space-y-3 rounded-md border p-2">
                        {matchLeftItems.map((item, idx) => (
                          <div
                            key={item.id}
                            className="space-y-2 rounded-md border p-2"
                          >
                            <div className="flex items-center gap-2">
                              <Input
                                value={item.label ?? ""}
                                placeholder={`Left item ${idx + 1} text (optional if using an image)`}
                                onChange={(e) =>
                                  updateMatchItemLabel(item.id, e.target.value)
                                }
                                className="h-8 flex-1 text-sm"
                              />
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 shrink-0 text-destructive"
                                onClick={() => removeMatchItem(item.id)}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>

                            <div className="flex items-center gap-2">
                              {item.imageUrl ? (
                                <div className="flex items-center gap-2">
                                  <img
                                    src={item.imageUrl}
                                    alt=""
                                    className="h-10 w-10 rounded border object-cover"
                                  />
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs"
                                    onClick={() =>
                                      updateMatchItemImage(item.id, undefined)
                                    }
                                  >
                                    Remove Image
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    className="h-8 flex-1 text-xs"
                                    disabled={uploadingMatchItemId === item.id}
                                    onChange={(e) =>
                                      handleMatchItemImageChange(
                                        item.id,
                                        e.target.files?.[0] ?? null,
                                      )
                                    }
                                  />
                                  {uploadingMatchItemId === item.id && (
                                    <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                                  )}
                                </>
                              )}
                            </div>

                            <Select
                              value={blankAnswers[item.id] ?? ""}
                              onValueChange={(v) => setBlankAnswer(item.id, v)}
                            >
                              <SelectTrigger className="h-8 w-full text-xs">
                                <SelectValue placeholder="Correct match" />
                              </SelectTrigger>
                              <SelectContent>
                                {options.map((opt) => (
                                  <SelectItem key={opt.id} value={opt.id}>
                                    {opt.text || "(untitled option)"}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={addMatchItem}
                          disabled={options.length === 0}
                        >
                          <Plus className="mr-1.5 h-3.5 w-3.5" />
                          Add Left Item
                        </Button>
                        {options.length === 0 && (
                          <p className="text-xs text-muted-foreground">
                            Add at least one word bank option first.
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <Label>Blanks</Label>
                      <p className="text-xs text-muted-foreground">
                        Detected from the [[blank]] markers in the passage
                        above, in order — pick the correct word-bank option for
                        each.
                      </p>
                      {blanks.length === 0 ? (
                        <p className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
                          Add [[blank]] to the passage text to create blanks
                          here.
                        </p>
                      ) : (
                        <div className="space-y-2 rounded-md border p-2">
                          {blanks.map((blank, idx) => (
                            <div
                              key={blank.id}
                              className="flex items-center gap-2"
                            >
                              <span className="w-20 shrink-0 text-sm text-muted-foreground">
                                Blank {idx + 1}
                              </span>
                              <Select
                                value={blankAnswers[blank.id] ?? ""}
                                onValueChange={(v) =>
                                  setBlankAnswer(blank.id, v)
                                }
                              >
                                <SelectTrigger className="h-8 flex-1 text-xs">
                                  <SelectValue placeholder="Correct option" />
                                </SelectTrigger>
                                <SelectContent>
                                  {options.map((opt) => (
                                    <SelectItem key={opt.id} value={opt.id}>
                                      {opt.text || "(untitled option)"}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                          {options.length === 0 && (
                            <p className="text-xs text-muted-foreground">
                              Add at least one word bank option first.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="marks">Marks</Label>
                  <Input
                    id="marks"
                    type="number"
                    step="0.5"
                    {...form.register("marks")}
                  />
                  {form.formState.errors.marks && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.marks.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="negative_marks">Negative Marks</Label>
                  <Input
                    id="negative_marks"
                    type="number"
                    step="0.5"
                    {...form.register("negative_marks")}
                  />
                </div>
              </div>

              {!isCoreSection && (
                <div className="space-y-1.5">
                  <Label>
                    Courses{" "}
                    <span className="text-muted-foreground">
                      (this section is course-specific — select at least one)
                    </span>
                  </Label>
                  <div className="max-h-32 space-y-1 overflow-y-auto rounded-md border p-2">
                    {courses?.map((c) => (
                      <label
                        key={c.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={
                            form.watch("course_ids")?.includes(c.id) ?? false
                          }
                          onChange={(e) => toggleCourse(c.id, e.target.checked)}
                        />
                        {c.name}
                      </label>
                    ))}
                    {!courses?.length && (
                      <p className="text-xs text-muted-foreground">
                        No courses found.
                      </p>
                    )}
                  </div>
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
                <Button
                  type="submit"
                  disabled={isCreating || isUpdating || !!uploadingField}
                >
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
                  Question
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Type
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Difficulty
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Marks
                </TableHead>
                <TableHead className="py-4 text-xs font-semibold uppercase tracking-wide">
                  Courses
                </TableHead>
                <TableHead className="w-[140px] py-4 pr-6 text-right text-xs font-semibold uppercase tracking-wide">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i} className="border-b last:border-0">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j} className="py-4">
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : !questions || questions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-20 text-center text-muted-foreground"
                  >
                    No questions yet.
                  </TableCell>
                </TableRow>
              ) : (
                questions.map((q) => {
                  const type = questionTypes?.find(
                    (t) => t.id === q.questionTypeId,
                  );
                  return (
                    <TableRow
                      key={q.id}
                      className="border-b last:border-0 transition-colors hover:bg-muted/30"
                    >
                      <TableCell className="py-4 pl-6">
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">
                            {q.title || "Untitled"}
                          </p>
                          {q.content.text && (
                            <p className="max-w-xs truncate text-xs text-muted-foreground">
                              {q.content.text}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-sm text-muted-foreground">
                        {type?.name ?? "—"}
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="outline" className="capitalize">
                          {q.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 text-sm text-muted-foreground">
                        {q.marks}
                        {q.negativeMarks > 0 && ` (-${q.negativeMarks})`}
                      </TableCell>
                      <TableCell className="py-4 text-sm text-muted-foreground">
                        {q.courseIds.length === 0
                          ? "All courses"
                          : `${q.courseIds.length} course(s)`}
                      </TableCell>
                      <TableCell className="py-4 pr-6 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 text-xs"
                            onClick={() => openEdit(q)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
                            onClick={() => setDeleting(q)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {meta && meta.total > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Showing {(meta.page - 1) * meta.limit + 1}–
            {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1 text-xs"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </Button>
            <span className="text-xs">
              Page {meta.page} of{" "}
              {Math.max(1, Math.ceil(meta.total / meta.limit))}
            </span>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1 text-xs"
              disabled={!meta.hasNext}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title="Delete question?"
        description="This question will be excluded from new assessments. This can't be undone from here."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        isPending={isDeleting}
      />
    </div>
  );
}
