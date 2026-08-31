"use client";

import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { BookOpen, GraduationCap, Loader2, Plus, Trash2 } from "lucide-react";
import { zodResolver } from "@/lib/zod-resolver";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SegmentedToggle } from "@/components/ui/segmented-toggle";
import { IconSectionHeader } from "@/components/ui/icon-section-header";
import { getErrorMessage } from "@/lib/api";
import { uploadApplicationDocumentFile } from "@/lib/services/application.service";
import { DocumentRow } from "@/components/applications/file-preview";
import {
  useFormDetails,
  useUpdateTwelfthGradeDetails,
} from "@/hooks/use-application";
import {
  useEducationBoardDetail,
  useEducationBoards,
} from "@/hooks/use-education-boards";
import { useIndiaStates, useMediums } from "@/hooks/use-geo";

const subjectSchema = z.object({
  subject_name: z.string().trim().min(1, "Subject name is required").max(100),
  evaluation_pattern: z.string().trim().max(50),
  theory_marks: z.coerce.number().min(0).optional(),
  practical_marks: z.coerce.number().min(0).optional(),
  internal_marks: z.coerce.number().min(0).optional(),
  max_marks: z.coerce.number().min(0),
  obtained_marks: z.coerce.number().min(0),
  attempts: z.coerce.number().int().min(1).optional(),
  percentage: z.coerce.number().min(0).max(100).optional(),
});

const resultSummarySchema = z.object({
  marking_scheme: z.enum(["percentage", "gpa", "other"]),
  marks_obtained: z.coerce.number().min(0).optional(),
  max_marks: z.coerce.number().min(0).optional(),
  percentage: z.coerce.number().min(0).max(100).optional(),
  remarks: z.string().trim().max(500).optional(),
});

const twelfthGradeSchema = z.object({
  academic_year: z.string().trim().min(1, "Academic year is required").max(20),
  admission_year: z
    .string()
    .trim()
    .min(1, "Admission year is required")
    .max(20),
  year_of_passing: z.coerce.number().int().min(1950).max(2100),
  board_id: z.string().trim().optional(),
  board_name: z.string().trim().min(1, "Board name is required").max(150),
  course: z.string().trim().optional(),
  registration_number: z.string().trim().max(50).optional(),
  school_name: z.string().trim().min(1, "School name is required").max(255),
  school_code: z.string().trim().max(50).optional(),
  school_address: z.string().trim().max(500).optional(),
  school_state: z.string().trim().min(1, "School state is required").max(100),
  medium_of_instruction: z.string().trim().min(1, "Required").max(50),
  has_separate_class_xi_exam: z.boolean(),
  class_xi_status: z.enum(["declared", "undeclared"]).optional(),
  subjects: z.array(subjectSchema).min(1, "At least one subject is required"),
  result_summary: resultSummarySchema,
  marksheet_url: z.string().trim().url().optional().or(z.literal("")),
  migration_certificate_url: z
    .string()
    .trim()
    .url()
    .optional()
    .or(z.literal("")),
});

type TwelfthGradeFormInput = z.infer<typeof twelfthGradeSchema>;

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

interface TwelfthGradeFormProps {
  applicationId: string;
}

const emptySubject = {
  subject_name: "",
  evaluation_pattern: "",
  theory_marks: undefined,
  practical_marks: undefined,
  internal_marks: undefined,
  max_marks: 100,
  obtained_marks: 0,
  attempts: undefined,
  percentage: undefined,
};

const yesNoOptions = [
  { value: "yes" as const, label: "Yes" },
  { value: "no" as const, label: "No" },
];

export function TwelfthGradeForm({ applicationId }: TwelfthGradeFormProps) {
  const { data: existingSection, isLoading } = useFormDetails(
    applicationId,
    "qualification_details",
    true,
  );
  const existing = existingSection?.twelfth_grade;
  const { mutate: save, isPending } =
    useUpdateTwelfthGradeDetails(applicationId);
  const marksheetInputRef = useRef<HTMLInputElement>(null);
  const migrationInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingMarksheet, setIsUploadingMarksheet] = useState(false);
  const [isUploadingMigration, setIsUploadingMigration] = useState(false);

  const form = useForm<TwelfthGradeFormInput>({
    resolver: zodResolver(twelfthGradeSchema),
    defaultValues: {
      academic_year: "",
      admission_year: "",
      year_of_passing: new Date().getFullYear(),
      board_id: "",
      board_name: "",
      course: "",
      registration_number: "",
      school_name: "",
      school_code: "",
      school_address: "",
      school_state: "",
      medium_of_instruction: "",
      has_separate_class_xi_exam: false,
      class_xi_status: undefined,
      subjects: [emptySubject],
      result_summary: { marking_scheme: "percentage" },
      marksheet_url: "",
      migration_certificate_url: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subjects",
  });

  const hasSeparateClassXiExam = useWatch({
    control: form.control,
    name: "has_separate_class_xi_exam",
  });
  const classXiStatus = useWatch({
    control: form.control,
    name: "class_xi_status",
  });
  const marksheetUrl = useWatch({
    control: form.control,
    name: "marksheet_url",
  });
  const migrationCertificateUrl = useWatch({
    control: form.control,
    name: "migration_certificate_url",
  });
  const markingScheme = useWatch({
    control: form.control,
    name: "result_summary.marking_scheme",
  });
  const boardId = useWatch({ control: form.control, name: "board_id" });
  const course = useWatch({ control: form.control, name: "course" });
  const schoolState = useWatch({ control: form.control, name: "school_state" });
  const mediumOfInstruction = useWatch({
    control: form.control,
    name: "medium_of_instruction",
  });

  const { data: boards, isLoading: isLoadingBoards } = useEducationBoards(
    "12th",
    undefined,
    true,
  );
  const { data: states, isLoading: isLoadingStates } = useIndiaStates();
  const { data: mediums, isLoading: isLoadingMediums } = useMediums();

  // 12th-grade board detail with no ?course= returns the course picker
  // list; with ?course= it returns that course's official subject list.
  const { data: courseList } = useEducationBoardDetail(
    boardId || undefined,
    undefined,
    !!boardId,
  );
  const availableCourses =
    courseList && "courses" in courseList ? courseList.courses : [];

  const { data: courseDetail } = useEducationBoardDetail(
    boardId || undefined,
    course || undefined,
    !!boardId && !!course,
  );

  useEffect(() => {
    if (!courseDetail || !("subjects" in courseDetail)) return;
    if (courseDetail.subjects.length === 0) return;
    form.setValue(
      "subjects",
      courseDetail.subjects.map((subject) => ({
        subject_name: subject.name,
        evaluation_pattern: "",
        theory_marks: undefined,
        practical_marks: undefined,
        internal_marks: undefined,
        max_marks: Number(subject.maxMark),
        obtained_marks: 0,
        attempts: undefined,
        percentage: undefined,
      })),
      { shouldValidate: true },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseDetail]);

  async function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
    field: "marksheet_url" | "migration_certificate_url",
    setUploading: (v: boolean) => void,
  ) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const uploaded = await uploadApplicationDocumentFile(file);
      form.setValue(field, uploaded.url, { shouldValidate: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    if (!existing) return;
    const matchedBoard = boards?.find((b) => b.name === existing.board_name);
    const matchedState = states?.find(
      (s) =>
        s.name.toLowerCase() === (existing.school_state ?? "").toLowerCase(),
    );
    const matchedMedium = mediums?.find(
      (m) =>
        m.name.toLowerCase() ===
        (existing.medium_of_instruction ?? "").toLowerCase(),
    );
    form.reset({
      academic_year: existing.academic_year ?? "",
      admission_year: existing.admission_year ?? "",
      year_of_passing: existing.year_of_passing ?? new Date().getFullYear(),
      board_id: matchedBoard?.id ?? "",
      board_name: existing.board_name ?? "",
      course: existing.course ?? "",
      registration_number: existing.registration_number ?? "",
      school_name: existing.school_name ?? "",
      school_code: existing.school_code ?? "",
      school_address: existing.school_address ?? "",
      school_state: matchedState?.name ?? existing.school_state ?? "",
      medium_of_instruction:
        matchedMedium?.name ?? existing.medium_of_instruction ?? "",
      has_separate_class_xi_exam: existing.has_separate_class_xi_exam ?? false,
      class_xi_status: existing.class_xi_status ?? undefined,
      subjects: existing.subjects?.length
        ? existing.subjects.map(nullsToUndefined)
        : [emptySubject],
      result_summary: existing.result_summary
        ? nullsToUndefined(existing.result_summary)
        : { marking_scheme: "percentage" },
      marksheet_url: existing.marksheet_url ?? "",
      migration_certificate_url: existing.migration_certificate_url ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing, boards, states, mediums]);

  function onSubmit(data: TwelfthGradeFormInput) {
    save(
      {
        academic_year: data.academic_year,
        admission_year: data.admission_year,
        year_of_passing: data.year_of_passing,
        board_name: data.board_name,
        course: data.course || undefined,
        registration_number: data.registration_number || undefined,
        school_name: data.school_name,
        school_code: data.school_code || undefined,
        school_address: data.school_address || undefined,
        school_state: data.school_state,
        medium_of_instruction: data.medium_of_instruction,
        has_separate_class_xi_exam: data.has_separate_class_xi_exam,
        class_xi_status: data.has_separate_class_xi_exam
          ? data.class_xi_status
          : undefined,
        subjects: data.subjects,
        result_summary: data.result_summary,
        marksheet_url: data.marksheet_url || undefined,
        migration_certificate_url: data.migration_certificate_url || undefined,
      },
      {
        onSuccess: () => {
          toast.success("12th grade details saved");
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
      className="space-y-5 rounded-2xl border border-border/60 bg-background p-5"
    >
      <IconSectionHeader
        icon={GraduationCap}
        title="12th Grade Details"
        subLabel="Academic"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Academic Year"
          error={form.formState.errors.academic_year?.message}
        >
          <Input placeholder="2024-25" {...form.register("academic_year")} />
        </Field>
        <Field
          label="Admission Year"
          error={form.formState.errors.admission_year?.message}
        >
          <Input {...form.register("admission_year")} />
        </Field>
        <Field label="Year of Passing">
          <Input type="number" {...form.register("year_of_passing")} />
        </Field>
        <Field
          label="Board Name"
          error={form.formState.errors.board_name?.message}
        >
          <Select
            value={boardId || undefined}
            onValueChange={(id) => {
              const board = boards?.find((b) => b.id === id);
              form.setValue("board_id", id, { shouldValidate: true });
              form.setValue("board_name", board?.name ?? "", {
                shouldValidate: true,
              });
              form.setValue("course", "", { shouldValidate: true });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select board" />
            </SelectTrigger>
            <SelectContent>
              {isLoadingBoards ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : (
                (boards ?? []).map((board) => (
                  <SelectItem key={board.id} value={board.id}>
                    {board.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Course" optional>
          {boardId && availableCourses.length > 0 ? (
            <Select
              value={course || undefined}
              onValueChange={(v) =>
                form.setValue("course", v, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {availableCourses.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              placeholder="e.g. Science, Commerce, Humanities"
              {...form.register("course")}
            />
          )}
        </Field>
        <Field label="Registration Number" optional>
          <Input {...form.register("registration_number")} />
        </Field>
        <Field
          label="School Name"
          error={form.formState.errors.school_name?.message}
        >
          <Input {...form.register("school_name")} />
        </Field>
        <Field label="School Code" optional>
          <Input {...form.register("school_code")} />
        </Field>
        <Field
          label="School State"
          error={form.formState.errors.school_state?.message}
        >
          <Select
            value={schoolState || undefined}
            onValueChange={(v) =>
              form.setValue("school_state", v, { shouldValidate: true })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {isLoadingStates ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : (
                (states ?? []).map((state) => (
                  <SelectItem key={state.code} value={state.name}>
                    {state.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="School Address" optional>
            <Input {...form.register("school_address")} />
          </Field>
        </div>
        <Field
          label="Medium of Instruction"
          error={form.formState.errors.medium_of_instruction?.message}
        >
          <Select
            value={mediumOfInstruction || undefined}
            onValueChange={(v) =>
              form.setValue("medium_of_instruction", v, {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select medium" />
            </SelectTrigger>
            <SelectContent>
              {isLoadingMediums ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : (
                (mediums ?? []).map((medium) => (
                  <SelectItem key={medium.name} value={medium.name}>
                    {medium.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="rounded-2xl bg-groupBg p-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-headerTeal">
          Result Information
        </p>
        <p className="mb-2 text-sm text-foreground">
          Does your Board conduct a separate Class XI / First Year Examination?
        </p>
        <SegmentedToggle
          options={yesNoOptions}
          value={hasSeparateClassXiExam ? "yes" : "no"}
          onChange={(v) =>
            form.setValue("has_separate_class_xi_exam", v === "yes", {
              shouldValidate: true,
            })
          }
          name="has_separate_class_xi_exam"
          className="mb-3 max-w-xs"
        />
        {hasSeparateClassXiExam ? (
          <Field label="Class XI Status">
            <Select
              value={classXiStatus}
              onValueChange={(v) =>
                form.setValue(
                  "class_xi_status",
                  v as "declared" | "undeclared",
                  { shouldValidate: true },
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="declared">Declared</SelectItem>
                <SelectItem value="undeclared">Undeclared</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        ) : null}
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-headerTeal">
          Marks
        </p>
        {form.formState.errors.subjects?.root ? (
          <p className="mb-2 text-xs text-destructive">
            {form.formState.errors.subjects.root.message}
          </p>
        ) : null}
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="space-y-3 rounded-2xl bg-groupBg p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <BookOpen className="h-4 w-4 text-headerTeal" />
                  Subject {index + 1}
                </div>
                {fields.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-field hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Subject Name">
                  <Input {...form.register(`subjects.${index}.subject_name`)} />
                </Field>
                <Field label="Evaluation Pattern">
                  <Input
                    placeholder="Theory + Practical"
                    {...form.register(`subjects.${index}.evaluation_pattern`)}
                  />
                </Field>
                <Field label="Theory Marks" optional>
                  <Input
                    type="number"
                    {...form.register(`subjects.${index}.theory_marks`)}
                  />
                </Field>
                <Field label="Practical Marks" optional>
                  <Input
                    type="number"
                    {...form.register(`subjects.${index}.practical_marks`)}
                  />
                </Field>
                <Field label="Max Marks">
                  <Input
                    type="number"
                    {...form.register(`subjects.${index}.max_marks`)}
                  />
                </Field>
                <Field label="Obtained Marks">
                  <Input
                    type="number"
                    {...form.register(`subjects.${index}.obtained_marks`)}
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => append(emptySubject)}
          className="mt-3 rounded-full"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add another subject
        </Button>
      </div>

      <div className="rounded-2xl bg-groupBg p-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-headerTeal">
          Overall Result Summary
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Marking Scheme">
            <Select
              value={markingScheme}
              onValueChange={(v) =>
                form.setValue(
                  "result_summary.marking_scheme",
                  v as "percentage" | "gpa" | "other",
                  { shouldValidate: true },
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="gpa">GPA</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Marks Obtained" optional>
            <Input
              type="number"
              {...form.register("result_summary.marks_obtained")}
            />
          </Field>
          <Field label="Max Marks" optional>
            <Input
              type="number"
              {...form.register("result_summary.max_marks")}
            />
          </Field>
          <Field label="Percentage" optional>
            <Input
              type="number"
              {...form.register("result_summary.percentage")}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Remarks" optional>
              <Input {...form.register("result_summary.remarks")} />
            </Field>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-headerTeal">
            Class 12 Marksheet
          </p>
          <input
            ref={marksheetInputRef}
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={(e) =>
              handleFileChange(e, "marksheet_url", setIsUploadingMarksheet)
            }
          />
          {marksheetUrl ? (
            <DocumentRow
              fileName="Class 12 Marksheet"
              fileUrl={marksheetUrl}
              label="Class 12 Marksheet"
              onUpload={() => marksheetInputRef.current?.click()}
              isUploading={isUploadingMarksheet}
            />
          ) : (
            <Button
              type="button"
              variant="outline"
              disabled={isUploadingMarksheet}
              onClick={() => marksheetInputRef.current?.click()}
              className="w-fit rounded-full"
            >
              {isUploadingMarksheet ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : null}
              Upload marksheet
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-headerTeal">
            Migration Certificate
          </p>
          <input
            ref={migrationInputRef}
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={(e) =>
              handleFileChange(
                e,
                "migration_certificate_url",
                setIsUploadingMigration,
              )
            }
          />
          {migrationCertificateUrl ? (
            <DocumentRow
              fileName="Migration Certificate"
              fileUrl={migrationCertificateUrl}
              label="Migration Certificate"
              onUpload={() => migrationInputRef.current?.click()}
              isUploading={isUploadingMigration}
            />
          ) : (
            <Button
              type="button"
              variant="outline"
              disabled={isUploadingMigration}
              onClick={() => migrationInputRef.current?.click()}
              className="w-fit rounded-full"
            >
              {isUploadingMigration ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : null}
              Upload certificate
            </Button>
          )}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="h-14 w-full rounded-full border-0 bg-headerTeal-dark text-base font-semibold text-white shadow-md hover:opacity-95"
      >
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Save 12th Grade Details
      </Button>
    </form>
  );
}
