"use client";

import { useEffect, useRef } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { ClipboardList, Loader2, Plus, Trash2 } from "lucide-react";
import { zodResolver } from "@/lib/zod-resolver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { SegmentedToggle } from "@/components/ui/segmented-toggle";
import { IconSectionHeader } from "@/components/ui/icon-section-header";
import { getErrorMessage } from "@/lib/api";
import { uploadApplicationDocumentFile } from "@/lib/services/application.service";
import {
  useFormDetails,
  useUpdateEntranceExamDetails,
} from "@/hooks/use-application";
import { DocumentRow } from "@/components/applications/file-preview";

const examRecordSchema = z.object({
  exam_name: z.string().trim().min(1, "Exam name is required").max(150),
  year_of_appearance: z.coerce.number().int().min(1950).max(2100).optional(),
  roll_number: z.string().trim().max(50).optional(),
  score_or_percentile: z.string().trim().max(50).optional(),
  mark_card_url: z.string().trim().url().optional().or(z.literal("")),
});

const recommendationLetterSchema = z.object({
  document_url: z.string().trim().url("Upload a file"),
});

const entranceExamSchema = z
  .object({
    has_attempted_entrance_exam: z.boolean(),
    exams: z.array(examRecordSchema),
    recommendation_letters: z.array(recommendationLetterSchema),
  })
  .superRefine((data, ctx) => {
    if (data.has_attempted_entrance_exam && data.exams.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "At least one exam record is required",
        path: ["exams"],
      });
    }
  });

type EntranceExamFormInput = z.infer<typeof entranceExamSchema>;

type NullsToUndefined<T> = {
  [K in keyof T]: T[K] extends null
    ? undefined
    : T[K] extends infer U | null
      ? U | undefined
      : T[K];
};

function nullsToUndefined<T extends object>(obj: T): NullsToUndefined<T> {
  const result = { ...obj } as Record<string, unknown>;
  for (const key in result) {
    if (result[key] === null) {
      result[key] = undefined;
    }
  }
  return result as NullsToUndefined<T>;
}

interface EntranceExamFormProps {
  applicationId: string;
  onSaved?: () => void;
}

const emptyExam = {
  exam_name: "",
  year_of_appearance: undefined,
  roll_number: "",
  score_or_percentile: "",
  mark_card_url: "",
};

const yesNoOptions = [
  { value: "yes" as const, label: "Yes" },
  { value: "no" as const, label: "No" },
];

function MarkCardUpload({
  index,
  value,
  onUploaded,
}: {
  index: number;
  value: string | undefined;
  onUploaded: (url: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const uploaded = await uploadApplicationDocumentFile(file);
      onUploaded(uploaded.url);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <div className="flex flex-col gap-1.5 sm:col-span-2">
      <label className="text-xs text-muted-foreground">
        Mark Card (optional)
      </label>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={handleChange}
        id={`mark-card-input-${index}`}
      />
      {value ? (
        <DocumentRow
          fileName="Mark card"
          fileUrl={value}
          onUpload={() => fileInputRef.current?.click()}
        />
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit rounded-full"
          onClick={() => fileInputRef.current?.click()}
        >
          Upload
        </Button>
      )}
    </div>
  );
}

export function EntranceExamForm({
  applicationId,
  onSaved,
}: EntranceExamFormProps) {
  const { data: existing, isLoading } = useFormDetails(
    applicationId,
    "entrance_exam_details",
    true,
  );
  const { mutate: save, isPending } =
    useUpdateEntranceExamDetails(applicationId);

  const form = useForm<EntranceExamFormInput>({
    resolver: zodResolver(entranceExamSchema),
    defaultValues: {
      has_attempted_entrance_exam: false,
      exams: [],
      recommendation_letters: [],
    },
  });

  const exams = useFieldArray({ control: form.control, name: "exams" });
  const recommendationLetters = useFieldArray({
    control: form.control,
    name: "recommendation_letters",
  });

  const hasAttemptedExam = useWatch({
    control: form.control,
    name: "has_attempted_entrance_exam",
  });
  const watchedExams = useWatch({ control: form.control, name: "exams" });

  const recommendationInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!existing) return;
    form.reset({
      has_attempted_entrance_exam:
        existing.has_attempted_entrance_exam ?? false,
      exams: existing.exams?.length ? existing.exams.map(nullsToUndefined) : [],
      recommendation_letters: existing.recommendation_letters?.length
        ? existing.recommendation_letters.map(nullsToUndefined)
        : [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing]);

  async function handleRecommendationLetterUpload(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      const uploaded = await uploadApplicationDocumentFile(file);
      recommendationLetters.append({ document_url: uploaded.url });
      toast.success("Recommendation letter added");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  function onSubmit(data: EntranceExamFormInput) {
    save(
      {
        has_attempted_entrance_exam: data.has_attempted_entrance_exam,
        exams: data.has_attempted_entrance_exam
          ? data.exams.map((exam) => ({
              exam_name: exam.exam_name,
              year_of_appearance: exam.year_of_appearance,
              roll_number: exam.roll_number || undefined,
              score_or_percentile: exam.score_or_percentile || undefined,
              mark_card_url: exam.mark_card_url || undefined,
            }))
          : [],
        recommendation_letters: data.recommendation_letters,
      },
      {
        onSuccess: () => {
          toast.success("Entrance exam details saved");
          onSaved?.();
        },
      },
    );
  }

  if (isLoading) {
    return <div className="h-48 animate-pulse rounded-2xl border bg-muted" />;
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="space-y-5 rounded-2xl border border-border/60 p-5"
    >
      <IconSectionHeader
        icon={ClipboardList}
        title="Competitive Exam Records"
        subLabel="Entrance Exam"
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">
          Have you attempted any entrance exam?
        </label>
        <SegmentedToggle
          options={yesNoOptions}
          value={hasAttemptedExam ? "yes" : "no"}
          onChange={(v) =>
            form.setValue("has_attempted_entrance_exam", v === "yes", {
              shouldValidate: true,
            })
          }
          name="has_attempted_entrance_exam"
        />
      </div>

      {hasAttemptedExam ? (
        <div>
          {form.formState.errors.exams?.root ? (
            <p className="mb-2 text-xs text-destructive">
              {form.formState.errors.exams.root.message}
            </p>
          ) : null}
          <div className="space-y-3">
            {exams.fields.map((field, index) => (
              <div
                key={field.id}
                className="space-y-3 rounded-2xl border border-border/40 p-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Exam {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => exams.remove(index)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-field hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Exam Name">
                    <Input {...form.register(`exams.${index}.exam_name`)} />
                  </Field>
                  <Field label="Year of Appearance" optional>
                    <Input
                      type="number"
                      {...form.register(`exams.${index}.year_of_appearance`)}
                    />
                  </Field>
                  <Field label="Roll Number" optional>
                    <Input {...form.register(`exams.${index}.roll_number`)} />
                  </Field>
                  <Field label="Score / Percentile" optional>
                    <Input
                      {...form.register(`exams.${index}.score_or_percentile`)}
                    />
                  </Field>
                  <MarkCardUpload
                    index={index}
                    value={watchedExams?.[index]?.mark_card_url}
                    onUploaded={(url) =>
                      form.setValue(`exams.${index}.mark_card_url`, url, {
                        shouldValidate: true,
                      })
                    }
                  />
                </div>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => exams.append(emptyExam)}
            className="mt-3 rounded-full"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add another exam
          </Button>
        </div>
      ) : null}

      <div className="rounded-2xl border border-border/40 p-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-accentOrange">
          Recommendation Letters
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {recommendationLetters.fields.map((field, index) => (
            <DocumentRow
              key={field.id}
              fileName={`Letter ${index + 1}`}
              fileUrl={field.document_url}
              onUpload={() => recommendationInputRef.current?.click()}
              onRemove={() => recommendationLetters.remove(index)}
            />
          ))}
        </div>
        <input
          ref={recommendationInputRef}
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={handleRecommendationLetterUpload}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 rounded-full"
          onClick={() => recommendationInputRef.current?.click()}
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add recommendation letter
        </Button>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="h-14 w-full rounded-full border-0 bg-gradient-to-r from-[hsl(var(--accent-orange-gradient-from))] to-[hsl(var(--accent-orange-gradient-to))] text-base font-semibold text-accentOrange-foreground shadow-md hover:opacity-95"
      >
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Save & Continue
      </Button>
    </form>
  );
}
