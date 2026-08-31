"use client";

import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { GraduationCap, Loader2, Plus, Rocket, Trash2 } from "lucide-react";
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
  useUpdateDiplomaDetails,
  useUpdatePgDetails,
  useUpdateUndergraduateDetails,
} from "@/hooks/use-application";
import type { UseMutationResult } from "@tanstack/react-query";
import type {
  StudentApplicationDto,
  UndergraduateDetailsInput,
} from "@beaconu/types";

const semesterRecordSchema = z.object({
  label: z.string().trim().min(1, "Label is required").max(50),
  duration: z.string().trim().max(50).optional(),
  gpa: z.coerce.number().min(0).max(10).optional(),
  cgpa_or_percentage: z.coerce.number().min(0).max(100).optional(),
  backlogs: z.coerce.number().int().min(0).optional(),
});

const projectEntrySchema = z.object({
  title: z.string().trim().min(1, "Project title is required").max(255),
  project_type: z.string().trim().max(50),
  duration: z.string().trim().max(50).optional(),
  team_size: z.coerce.number().int().min(1).optional(),
  role: z.string().trim().max(100).optional(),
  description: z.string().trim().max(2000).optional(),
  key_outcomes: z.string().trim().max(1000).optional(),
  project_url: z.string().trim().url().optional().or(z.literal("")),
});

const markSheetUrlEntrySchema = z.object({
  url: z.string().trim().url("Upload a file"),
});

const undergraduateSchema = z.object({
  program_type: z.enum(["regular", "distance"]),
  degree_type: z.string().trim().min(1, "Degree type is required").max(100),
  program_name: z.string().trim().min(1, "Program name is required").max(255),
  specialization: z.string().trim().max(255).optional(),
  university_name: z.string().trim().min(1, "University is required").max(255),
  university_type: z
    .string()
    .trim()
    .min(1, "University type is required")
    .max(50),
  institution_name: z
    .string()
    .trim()
    .min(1, "Institution name is required")
    .max(255),
  institution_type: z
    .string()
    .trim()
    .min(1, "Institution type is required")
    .max(50),
  admission_year: z
    .string()
    .trim()
    .min(1, "Admission year is required")
    .max(20),
  passing_year: z.string().trim().min(1, "Passing year is required").max(20),
  duration_years: z.coerce.number().int().min(1).max(10),
  register_number: z.string().trim().max(50).optional(),
  academic_cycle: z.enum(["semester", "yearly"]),
  semester_records: z.array(semesterRecordSchema),
  final_summary: z.object({
    total_credits: z.coerce.number().min(0).optional(),
    cgpa: z.coerce.number().min(0).max(10).optional(),
    percentage: z.coerce.number().min(0).max(100).optional(),
    rank: z.string().trim().max(50).optional(),
    total_backlogs: z.coerce.number().int().min(0).optional(),
    result_status: z
      .string()
      .trim()
      .min(1, "Result status is required")
      .max(50),
    remarks: z.string().trim().max(500).optional(),
  }),
  degree_certificate_url: z.string().trim().url().optional().or(z.literal("")),
  provisional_certificate_url: z
    .string()
    .trim()
    .url()
    .optional()
    .or(z.literal("")),
  consolidated_mark_sheet_url: z
    .string()
    .trim()
    .url()
    .optional()
    .or(z.literal("")),
  semester_mark_sheets: z.array(markSheetUrlEntrySchema),
  has_projects: z.boolean(),
  projects: z.array(projectEntrySchema),
});

type UndergraduateFormInput = z.infer<typeof undergraduateSchema>;

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

interface LevelFormProps {
  title: string;
  successMessage: string;
  mutation: UseMutationResult<
    StudentApplicationDto,
    unknown,
    UndergraduateDetailsInput
  >;
  existingData?: Partial<UndergraduateDetailsInput>;
  isLoading?: boolean;
}

const emptySemesterRecord = {
  label: "",
  duration: "",
  gpa: undefined,
  cgpa_or_percentage: undefined,
  backlogs: undefined,
};

const emptyProject = {
  title: "",
  project_type: "",
  duration: "",
  team_size: undefined,
  role: "",
  description: "",
  key_outcomes: "",
  project_url: "",
};

const yesNoOptions = [
  { value: "yes" as const, label: "Yes" },
  { value: "no" as const, label: "No" },
];

function SingleUploadField({
  label,
  value,
  onUploaded,
}: {
  label: string;
  value: string | undefined;
  onUploaded: (url: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setIsUploading(true);
    try {
      const uploaded = await uploadApplicationDocumentFile(file);
      onUploaded(uploaded.url);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={handleChange}
      />
      {value ? (
        <DocumentRow
          fileName={label}
          fileUrl={value}
          onUpload={() => fileInputRef.current?.click()}
          isUploading={isUploading}
        />
      ) : (
        <Button
          type="button"
          variant="outline"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="w-fit rounded-full"
        >
          {isUploading ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : null}
          Upload
        </Button>
      )}
    </div>
  );
}

function AcademicLevelForm({
  title,
  successMessage,
  mutation,
  existingData,
  isLoading,
}: LevelFormProps) {
  const { mutate: save, isPending } = mutation;

  const form = useForm<UndergraduateFormInput>({
    resolver: zodResolver(undergraduateSchema),
    defaultValues: {
      program_type: "regular",
      degree_type: "",
      program_name: "",
      specialization: "",
      university_name: "",
      university_type: "",
      institution_name: "",
      institution_type: "",
      admission_year: "",
      passing_year: "",
      duration_years: 4,
      register_number: "",
      academic_cycle: "semester",
      semester_records: [],
      final_summary: { result_status: "" },
      degree_certificate_url: "",
      provisional_certificate_url: "",
      consolidated_mark_sheet_url: "",
      semester_mark_sheets: [],
      has_projects: false,
      projects: [],
    },
  });

  const semesterFieldArray = useFieldArray({
    control: form.control,
    name: "semester_records",
  });
  const markSheetFieldArray = useFieldArray({
    control: form.control,
    name: "semester_mark_sheets",
  });
  const projectFieldArray = useFieldArray({
    control: form.control,
    name: "projects",
  });

  const programType = useWatch({ control: form.control, name: "program_type" });
  const academicCycle = useWatch({
    control: form.control,
    name: "academic_cycle",
  });
  const hasProjects = useWatch({ control: form.control, name: "has_projects" });
  const degreeCertificateUrl = useWatch({
    control: form.control,
    name: "degree_certificate_url",
  });
  const provisionalCertificateUrl = useWatch({
    control: form.control,
    name: "provisional_certificate_url",
  });
  const consolidatedMarkSheetUrl = useWatch({
    control: form.control,
    name: "consolidated_mark_sheet_url",
  });

  async function handleAddMarkSheet(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      const uploaded = await uploadApplicationDocumentFile(file);
      markSheetFieldArray.append({ url: uploaded.url });
      toast.success("Mark sheet added");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  useEffect(() => {
    if (!existingData) return;
    form.reset({
      program_type: existingData.program_type ?? "regular",
      degree_type: existingData.degree_type ?? "",
      program_name: existingData.program_name ?? "",
      specialization: existingData.specialization ?? "",
      university_name: existingData.university_name ?? "",
      university_type: existingData.university_type ?? "",
      institution_name: existingData.institution_name ?? "",
      institution_type: existingData.institution_type ?? "",
      admission_year: existingData.admission_year ?? "",
      passing_year: existingData.passing_year ?? "",
      duration_years: existingData.duration_years ?? 4,
      register_number: existingData.register_number ?? "",
      academic_cycle: existingData.academic_cycle ?? "semester",
      semester_records: existingData.semester_records?.length
        ? existingData.semester_records.map(nullsToUndefined)
        : [],
      final_summary: existingData.final_summary
        ? nullsToUndefined(existingData.final_summary)
        : { result_status: "" },
      degree_certificate_url:
        existingData.documents?.degree_certificate_url ?? "",
      provisional_certificate_url:
        existingData.documents?.provisional_certificate_url ?? "",
      consolidated_mark_sheet_url:
        existingData.documents?.consolidated_mark_sheet_url ?? "",
      semester_mark_sheets: existingData.documents?.semester_mark_sheet_urls
        ? existingData.documents.semester_mark_sheet_urls.map((url) => ({
            url,
          }))
        : [],
      has_projects: existingData.has_projects ?? false,
      projects: existingData.projects?.length
        ? existingData.projects.map(nullsToUndefined)
        : [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingData]);

  function onSubmit(data: UndergraduateFormInput) {
    save(
      {
        program_type: data.program_type,
        degree_type: data.degree_type,
        program_name: data.program_name,
        specialization: data.specialization || undefined,
        university_name: data.university_name,
        university_type: data.university_type,
        institution_name: data.institution_name,
        institution_type: data.institution_type,
        admission_year: data.admission_year,
        passing_year: data.passing_year,
        duration_years: data.duration_years,
        register_number: data.register_number || undefined,
        academic_cycle: data.academic_cycle,
        semester_records: data.semester_records,
        final_summary: data.final_summary,
        documents: {
          semester_mark_sheet_urls: data.semester_mark_sheets.map((m) => m.url),
          degree_certificate_url: data.degree_certificate_url || undefined,
          provisional_certificate_url:
            data.provisional_certificate_url || undefined,
          consolidated_mark_sheet_url:
            data.consolidated_mark_sheet_url || undefined,
        },
        has_projects: data.has_projects,
        projects: data.has_projects ? data.projects : [],
      },
      {
        onSuccess: () => {
          toast.success(successMessage);
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
        title={title}
        subLabel="Program Information"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Program Type">
          <Select
            value={programType}
            onValueChange={(v) =>
              form.setValue("program_type", v as "regular" | "distance", {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="regular">Regular</SelectItem>
              <SelectItem value="distance">Distance</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field
          label="Degree Type"
          error={form.formState.errors.degree_type?.message}
        >
          <Input placeholder="Bachelor" {...form.register("degree_type")} />
        </Field>
        <Field
          label="Program Name"
          error={form.formState.errors.program_name?.message}
        >
          <Input {...form.register("program_name")} />
        </Field>
        <Field label="Specialization" optional>
          <Input {...form.register("specialization")} />
        </Field>
        <Field
          label="University Name"
          error={form.formState.errors.university_name?.message}
        >
          <Input {...form.register("university_name")} />
        </Field>
        <Field
          label="University Type"
          error={form.formState.errors.university_type?.message}
        >
          <Input placeholder="State" {...form.register("university_type")} />
        </Field>
        <Field
          label="Institution Name"
          error={form.formState.errors.institution_name?.message}
        >
          <Input {...form.register("institution_name")} />
        </Field>
        <Field
          label="Institution Type"
          error={form.formState.errors.institution_type?.message}
        >
          <Input
            placeholder="Affiliated"
            {...form.register("institution_type")}
          />
        </Field>
        <Field
          label="Admission Year"
          error={form.formState.errors.admission_year?.message}
        >
          <Input {...form.register("admission_year")} />
        </Field>
        <Field
          label="Passing Year"
          error={form.formState.errors.passing_year?.message}
        >
          <Input {...form.register("passing_year")} />
        </Field>
        <Field label="Duration (years)">
          <Input type="number" {...form.register("duration_years")} />
        </Field>
        <Field label="Register Number" optional>
          <Input {...form.register("register_number")} />
        </Field>
        <Field label="Academic Cycle">
          <Select
            value={academicCycle}
            onValueChange={(v) =>
              form.setValue("academic_cycle", v as "semester" | "yearly", {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semester">Semester</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-headerTeal">
          Breakdown Cycle Information
        </p>
        <div className="space-y-3">
          {semesterFieldArray.fields.map((field, index) => (
            <div
              key={field.id}
              className="space-y-3 rounded-2xl bg-groupBg p-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Record {index + 1}</h4>
                <button
                  type="button"
                  onClick={() => semesterFieldArray.remove(index)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-field hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Label">
                  <Input
                    placeholder="Semester 1"
                    {...form.register(`semester_records.${index}.label`)}
                  />
                </Field>
                <Field label="Duration" optional>
                  <Input
                    placeholder="6 months"
                    {...form.register(`semester_records.${index}.duration`)}
                  />
                </Field>
                <Field label="GPA" optional>
                  <Input
                    type="number"
                    step="0.01"
                    {...form.register(`semester_records.${index}.gpa`)}
                  />
                </Field>
                <Field label="CGPA / Percentage" optional>
                  <Input
                    type="number"
                    step="0.01"
                    {...form.register(
                      `semester_records.${index}.cgpa_or_percentage`,
                    )}
                  />
                </Field>
                <Field label="Backlogs" optional>
                  <Input
                    type="number"
                    {...form.register(`semester_records.${index}.backlogs`)}
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => semesterFieldArray.append(emptySemesterRecord)}
          className="mt-3 rounded-full"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add semester / year
        </Button>
      </div>

      <div className="rounded-2xl bg-groupBg p-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-headerTeal">
          Final Academic Summary
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Total Credits" optional>
            <Input
              type="number"
              {...form.register("final_summary.total_credits")}
            />
          </Field>
          <Field label="CGPA" optional>
            <Input
              type="number"
              step="0.01"
              {...form.register("final_summary.cgpa")}
            />
          </Field>
          <Field label="Percentage" optional>
            <Input
              type="number"
              {...form.register("final_summary.percentage")}
            />
          </Field>
          <Field label="Rank" optional>
            <Input {...form.register("final_summary.rank")} />
          </Field>
          <Field label="Total Backlogs" optional>
            <Input
              type="number"
              {...form.register("final_summary.total_backlogs")}
            />
          </Field>
          <Field
            label="Result Status"
            error={form.formState.errors.final_summary?.result_status?.message}
          >
            <Input
              placeholder="Passed"
              {...form.register("final_summary.result_status")}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Remarks" optional>
              <Input {...form.register("final_summary.remarks")} />
            </Field>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-groupBg p-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-headerTeal">
          Documents
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <SingleUploadField
            label="Degree Certificate"
            value={degreeCertificateUrl}
            onUploaded={(url) =>
              form.setValue("degree_certificate_url", url, {
                shouldValidate: true,
              })
            }
          />
          <SingleUploadField
            label="Provisional Certificate"
            value={provisionalCertificateUrl}
            onUploaded={(url) =>
              form.setValue("provisional_certificate_url", url, {
                shouldValidate: true,
              })
            }
          />
          <SingleUploadField
            label="Consolidated Mark Sheet"
            value={consolidatedMarkSheetUrl}
            onUploaded={(url) =>
              form.setValue("consolidated_mark_sheet_url", url, {
                shouldValidate: true,
              })
            }
          />
        </div>

        <div className="mt-4">
          <p className="mb-2 text-xs text-muted-foreground">
            Semester Mark Sheets (optional)
          </p>
          <div className="space-y-2">
            {markSheetFieldArray.fields.map((field, index) => (
              <DocumentRow
                key={field.id}
                fileName={`Mark sheet ${index + 1}`}
                fileUrl={field.url}
                onUpload={() =>
                  document
                    .getElementById("undergraduate-mark-sheet-input")
                    ?.click()
                }
                onRemove={() => markSheetFieldArray.remove(index)}
              />
            ))}
          </div>
          <input
            type="file"
            id="undergraduate-mark-sheet-input"
            className="hidden"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={handleAddMarkSheet}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 rounded-full"
            onClick={() =>
              document.getElementById("undergraduate-mark-sheet-input")?.click()
            }
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add mark sheet
          </Button>
        </div>
      </div>

      <div className="rounded-2xl bg-groupBg p-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-headerTeal">
          Academic Projects
        </p>
        <p className="mb-2 text-sm text-foreground">
          Have you completed any projects during your program?
        </p>
        <SegmentedToggle
          options={yesNoOptions}
          value={hasProjects ? "yes" : "no"}
          onChange={(v) =>
            form.setValue("has_projects", v === "yes", {
              shouldValidate: true,
            })
          }
          name="has_projects"
          className="max-w-xs"
        />

        {hasProjects ? (
          <div className="mt-3 space-y-3">
            {projectFieldArray.fields.map((field, index) => (
              <div
                key={field.id}
                className="space-y-3 rounded-2xl bg-background p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Rocket className="h-4 w-4 text-headerTeal" />
                    Project {index + 1}
                  </div>
                  <button
                    type="button"
                    onClick={() => projectFieldArray.remove(index)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-field hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Title">
                    <Input {...form.register(`projects.${index}.title`)} />
                  </Field>
                  <Field label="Project Type">
                    <Input
                      placeholder="Academic Project"
                      {...form.register(`projects.${index}.project_type`)}
                    />
                  </Field>
                  <Field label="Duration" optional>
                    <Input {...form.register(`projects.${index}.duration`)} />
                  </Field>
                  <Field label="Team Size" optional>
                    <Input
                      type="number"
                      {...form.register(`projects.${index}.team_size`)}
                    />
                  </Field>
                  <Field label="Role" optional>
                    <Input {...form.register(`projects.${index}.role`)} />
                  </Field>
                  <Field label="Project URL" optional>
                    <Input
                      {...form.register(`projects.${index}.project_url`)}
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Description" optional>
                      <Input
                        {...form.register(`projects.${index}.description`)}
                      />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Key Outcomes" optional>
                      <Input
                        {...form.register(`projects.${index}.key_outcomes`)}
                      />
                    </Field>
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => projectFieldArray.append(emptyProject)}
              className="rounded-full"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add another project
            </Button>
          </div>
        ) : null}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="h-14 w-full rounded-full border-0 bg-headerTeal-dark text-base font-semibold text-white shadow-md hover:opacity-95"
      >
        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Save {title}
      </Button>
    </form>
  );
}

interface AcademicLevelWrapperProps {
  applicationId: string;
}

export function UndergraduateForm({
  applicationId,
}: AcademicLevelWrapperProps) {
  const mutation = useUpdateUndergraduateDetails(applicationId);
  const { data: existingSection, isLoading } = useFormDetails(
    applicationId,
    "qualification_details",
    true,
  );
  return (
    <AcademicLevelForm
      title="Undergraduate Details"
      successMessage="Undergraduate details saved"
      mutation={mutation}
      existingData={existingSection?.undergraduate}
      isLoading={isLoading}
    />
  );
}

export function PgForm({ applicationId }: AcademicLevelWrapperProps) {
  const mutation = useUpdatePgDetails(applicationId);
  const { data: existingSection, isLoading } = useFormDetails(
    applicationId,
    "qualification_details",
    true,
  );
  return (
    <AcademicLevelForm
      title="PG Details"
      successMessage="PG details saved"
      mutation={mutation}
      existingData={existingSection?.pg}
      isLoading={isLoading}
    />
  );
}

export function DiplomaForm({ applicationId }: AcademicLevelWrapperProps) {
  const mutation = useUpdateDiplomaDetails(applicationId);
  const { data: existingSection, isLoading } = useFormDetails(
    applicationId,
    "qualification_details",
    true,
  );
  return (
    <AcademicLevelForm
      title="Diploma Details"
      successMessage="Diploma details saved"
      mutation={mutation}
      existingData={existingSection?.diploma}
      isLoading={isLoading}
    />
  );
}
