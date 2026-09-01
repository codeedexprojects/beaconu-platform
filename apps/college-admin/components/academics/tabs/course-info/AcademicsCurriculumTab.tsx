"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import * as z from "zod";
import {
  Plus,
  Trash2,
  Layers,
  BookOpen,
  GraduationCap,
  DoorOpen,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SubjectTagInput } from "@/components/academics/shared/SubjectTagInput";

const specializationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  selected: z.string().optional(),
  subjects: z.array(z.string()).optional(),
});

const semesterSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  expanded: z.boolean().optional(),
  footnote: z.string().optional(),
  core_subjects: z.array(z.string()).optional(),
  specializations: z.array(specializationSchema).optional(),
});

const courseStructureItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  credits: z.union([z.string(), z.coerce.number()]).optional(),
});

const flexibleExitOptionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

const higherEducationSchema = z.object({
  global_certifications: z.array(z.string()).optional(),
  postgraduation: z.array(z.string()).optional(),
});

const academicsCurriculumTabSchema = z.object({
  curriculum: z
    .object({ semesters: z.array(semesterSchema).optional() })
    .optional(),
  course_structure: z.array(courseStructureItemSchema).optional(),
  value_added_courses: z.array(z.string()).optional(),
  higher_education: higherEducationSchema.optional(),
  flexible_exit_options: z.array(flexibleExitOptionSchema).optional(),
});

type AcademicsCurriculumTabData = z.infer<typeof academicsCurriculumTabSchema>;

// Blocks the "Add" button while the last item's required field is empty.
function isLastItemIncomplete(items: any[], ...fields: string[]): boolean {
  if (!items || items.length === 0) return false;
  const last = items[items.length - 1];
  return fields.some((f) => !String(last?.[f] ?? "").trim());
}

// Blocks the "Add" button for flat string arrays while the last string is empty.
function isLastStringIncomplete(items: string[]): boolean {
  if (!items || items.length === 0) return false;
  return !String(items[items.length - 1] ?? "").trim();
}

function CurriculumEmptyState({
  label,
  icon: Icon = Layers,
}: {
  label: string;
  icon?: typeof Layers;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 bg-muted/20 py-8 text-center">
      <Icon className="h-6 w-6 text-muted-foreground/40" />
      <span className="text-xs text-muted-foreground max-w-xs">
        No {label} yet — click above to add your first one.
      </span>
    </div>
  );
}

// One semester — has its own nested specializations[] array, so it needs its
// own scoped useFieldArray. Mirrors EligibilityCriteriaTab's `QuotaFields`
// pattern. `core_subjects` stays a newline-split Textarea via setValue (not a
// useFieldArray) and each specialization's `subjects` is wired through
// SubjectTagInput via watch/setValue (SubjectTagInput owns its own tag UI).
function SemesterFields({
  semesterIdx,
  control,
  register,
  watch,
  setValue,
  errors,
  onRemoveSemester,
}: {
  semesterIdx: number;
  control: any;
  register: any;
  watch: any;
  setValue: any;
  errors: any;
  onRemoveSemester: () => void;
}) {
  const [deleteSpecIdx, setDeleteSpecIdx] = useState<number | null>(null);

  const specializationsArray = useFieldArray({
    control,
    name: `curriculum.semesters.${semesterIdx}.specializations`,
  });

  const watchedSpecializations: any[] =
    watch(`curriculum.semesters.${semesterIdx}.specializations`) || [];
  const watchedCoreSubjects: string[] =
    watch(`curriculum.semesters.${semesterIdx}.core_subjects`) || [];
  const semesterErrors = errors?.curriculum?.semesters?.[semesterIdx];

  return (
    <div className="border p-3 rounded-lg bg-muted/5 space-y-3">
      <div className="flex gap-2 items-start">
        <div className="flex-1 space-y-1">
          <Input
            className="flex-1"
            placeholder="Semester Name (e.g. Semester 1)"
            {...register(`curriculum.semesters.${semesterIdx}.name`)}
          />
          {semesterErrors?.name && (
            <p className="text-xs text-destructive">
              {semesterErrors.name.message}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemoveSemester}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground mb-1 block">
          Footnote
        </Label>
        <Textarea
          placeholder="Footnote / semester note"
          rows={2}
          {...register(`curriculum.semesters.${semesterIdx}.footnote`)}
        />
      </div>

      <div>
        <Label className="text-xs text-muted-foreground mb-1 block">
          Core Subjects (one per line)
        </Label>
        <Textarea
          placeholder="Subject 1&#10;Subject 2"
          rows={3}
          value={watchedCoreSubjects.join("\n")}
          onChange={(e) =>
            setValue(
              `curriculum.semesters.${semesterIdx}.core_subjects`,
              e.target.value
                .split("\n")
                .map((s: string) => s.trim())
                .filter(Boolean),
              { shouldDirty: true },
            )
          }
        />
      </div>

      {/* Specializations */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-xs text-muted-foreground">
            Specializations
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedSpecializations, "title")}
            onClick={() =>
              specializationsArray.append({
                title: "",
                selected: "",
                subjects: [],
              })
            }
          >
            <Plus className="h-3 w-3 mr-1" /> Add
          </Button>
        </div>
        {specializationsArray.fields.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            No specializations added yet.
          </p>
        ) : (
          specializationsArray.fields.map((field, spIdx) => (
            <div
              key={field.id}
              className="border p-2 rounded space-y-2 bg-background"
            >
              <div className="flex gap-2 items-start">
                <div className="flex-1 space-y-1">
                  <Input
                    className="flex-1"
                    placeholder='Title (e.g. "Specialization 1:")'
                    {...register(
                      `curriculum.semesters.${semesterIdx}.specializations.${spIdx}.title`,
                    )}
                  />
                  {semesterErrors?.specializations?.[spIdx]?.title && (
                    <p className="text-xs text-destructive">
                      {semesterErrors.specializations[spIdx]?.title?.message}
                    </p>
                  )}
                </div>
                <Input
                  className="flex-1"
                  placeholder="Selected (e.g. Marketing)"
                  {...register(
                    `curriculum.semesters.${semesterIdx}.specializations.${spIdx}.selected`,
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteSpecIdx(spIdx)}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
              <SubjectTagInput
                placeholder="Type a subject and press Enter"
                value={
                  watch(
                    `curriculum.semesters.${semesterIdx}.specializations.${spIdx}.subjects`,
                  ) || []
                }
                onChange={(subjects) =>
                  setValue(
                    `curriculum.semesters.${semesterIdx}.specializations.${spIdx}.subjects`,
                    subjects,
                    { shouldDirty: true },
                  )
                }
              />
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={deleteSpecIdx !== null}
        title="Remove Specialization"
        description="Remove this specialization? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteSpecIdx(null)}
        onConfirm={() => {
          if (deleteSpecIdx === null) return;
          specializationsArray.remove(deleteSpecIdx);
          setDeleteSpecIdx(null);
        }}
      />
    </div>
  );
}

export function AcademicsCurriculumTab({
  payload,
  onChange,
  uploadingBrochure,
  onBrochureUpload,
}: {
  payload: any;
  onChange: (updates: any) => void;
  uploadingBrochure: boolean;
  onBrochureUpload: (file: File | null) => void;
}) {
  const [deleteSemesterIdx, setDeleteSemesterIdx] = useState<number | null>(
    null,
  );
  const [deleteStructureIdx, setDeleteStructureIdx] = useState<number | null>(
    null,
  );
  const [deleteVacIdx, setDeleteVacIdx] = useState<number | null>(null);
  const [deleteCertIdx, setDeleteCertIdx] = useState<number | null>(null);
  const [deletePgIdx, setDeletePgIdx] = useState<number | null>(null);
  const [deleteExitIdx, setDeleteExitIdx] = useState<number | null>(null);

  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AcademicsCurriculumTabData>({
    resolver: zodResolver(academicsCurriculumTabSchema as any),
    values: payload,
  });

  const semestersArray = useFieldArray({
    control: control as any,
    name: "curriculum.semesters",
  });
  const courseStructureArray = useFieldArray({
    control: control as any,
    name: "course_structure",
  });
  const valueAddedCoursesArray = useFieldArray({
    control: control as any,
    name: "value_added_courses",
  });
  const globalCertificationsArray = useFieldArray({
    control: control as any,
    name: "higher_education.global_certifications",
  });
  const postgraduationArray = useFieldArray({
    control: control as any,
    name: "higher_education.postgraduation",
  });
  const flexibleExitOptionsArray = useFieldArray({
    control: control as any,
    name: "flexible_exit_options",
  });

  const watchedSemesters = watch("curriculum.semesters") || [];
  const watchedCourseStructure = watch("course_structure") || [];
  const watchedValueAddedCourses: string[] = watch("value_added_courses") || [];
  const watchedGlobalCertifications: string[] =
    watch("higher_education.global_certifications") || [];
  const watchedPostgraduation: string[] =
    watch("higher_education.postgraduation") || [];
  const watchedFlexibleExitOptions = watch("flexible_exit_options") || [];

  useEffect(() => {
    const subscription = watch((value) => onChange(value));
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label>Brochure</Label>
          <Input
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            disabled={uploadingBrochure}
            onChange={(e) => onBrochureUpload(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t">
        <div className="flex justify-between items-center">
          <Label className="font-bold">Semesters</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedSemesters, "name")}
            onClick={() => {
              const n = semestersArray.fields.length + 1;
              semestersArray.append({
                id: `sem_${n}`,
                name: `Semester ${n}`,
                expanded: false,
                footnote: "",
                core_subjects: [],
                specializations: [],
              });
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Semester
          </Button>
        </div>
        {semestersArray.fields.length === 0 ? (
          <CurriculumEmptyState label="semesters" icon={Layers} />
        ) : (
          semestersArray.fields.map((field, idx) => (
            <SemesterFields
              key={field.id}
              semesterIdx={idx}
              control={control}
              register={register}
              watch={watch}
              setValue={setValue}
              errors={errors}
              onRemoveSemester={() => setDeleteSemesterIdx(idx)}
            />
          ))
        )}
      </div>

      {/* Course Structure Array */}
      <div className="space-y-3 pt-4 border-t">
        <div className="flex justify-between items-center">
          <Label className="font-bold">Course Structure</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedCourseStructure, "title")}
            onClick={() =>
              courseStructureArray.append({ title: "", credits: "" })
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add Structure Group
          </Button>
        </div>
        {courseStructureArray.fields.length === 0 ? (
          <CurriculumEmptyState
            label="course structure groups"
            icon={BookOpen}
          />
        ) : (
          courseStructureArray.fields.map((field, idx) => (
            <div
              key={field.id}
              className="flex gap-2 items-start border p-3 rounded-lg bg-muted/5"
            >
              <div className="flex-1 space-y-2">
                <div className="space-y-1">
                  <Input
                    placeholder="Group Title (e.g. Core Electives)"
                    {...register(`course_structure.${idx}.title`)}
                  />
                  {errors?.course_structure?.[idx]?.title && (
                    <p className="text-xs text-destructive">
                      {errors.course_structure[idx]?.title?.message}
                    </p>
                  )}
                </div>
                <Input
                  type="number"
                  placeholder="Score / Credits (e.g. 12)"
                  {...register(`course_structure.${idx}.credits`)}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setDeleteStructureIdx(idx)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Value Added Courses Array of strings */}
      <div className="space-y-3 pt-4 border-t">
        <div className="flex justify-between items-center">
          <Label className="font-bold">Value Added Courses</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastStringIncomplete(watchedValueAddedCourses)}
            onClick={() => valueAddedCoursesArray.append("")}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Value Course
          </Button>
        </div>
        {valueAddedCoursesArray.fields.length === 0 ? (
          <CurriculumEmptyState label="value added courses" icon={BookOpen} />
        ) : (
          valueAddedCoursesArray.fields.map((field, idx) => (
            <div key={field.id} className="flex gap-2 items-center">
              <Input
                placeholder="e.g. AI Ethics & Compliance"
                {...register(`value_added_courses.${idx}`)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setDeleteVacIdx(idx)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Higher Education Object */}
      <div className="border p-4 rounded-xl space-y-4 bg-muted/10">
        <h4 className="font-bold text-sm text-foreground">
          Higher Education Pathways
        </h4>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-xs">Global Certifications</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLastStringIncomplete(watchedGlobalCertifications)}
              onClick={() => globalCertificationsArray.append("")}
            >
              <Plus className="h-3 w-3 mr-1" /> Add Certification
            </Button>
          </div>
          {globalCertificationsArray.fields.length === 0 ? (
            <CurriculumEmptyState
              label="global certifications"
              icon={GraduationCap}
            />
          ) : (
            globalCertificationsArray.fields.map((field, idx) => (
              <div key={field.id} className="flex gap-2 items-center">
                <Input
                  placeholder="e.g. AWS Solutions Architect"
                  {...register(`higher_education.global_certifications.${idx}`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteCertIdx(idx)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>

        <div className="space-y-3 pt-3 border-t">
          <div className="flex justify-between items-center">
            <Label className="text-xs">Postgraduation Options</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLastStringIncomplete(watchedPostgraduation)}
              onClick={() => postgraduationArray.append("")}
            >
              <Plus className="h-3 w-3 mr-1" /> Add Postgrad Path
            </Button>
          </div>
          {postgraduationArray.fields.length === 0 ? (
            <CurriculumEmptyState
              label="postgraduation options"
              icon={GraduationCap}
            />
          ) : (
            postgraduationArray.fields.map((field, idx) => (
              <div key={field.id} className="flex gap-2 items-center">
                <Input
                  placeholder="e.g. M.Tech Research, PhD"
                  {...register(`higher_education.postgraduation.${idx}`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeletePgIdx(idx)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Flexible Exit Options */}
      <div className="space-y-3 pt-4 border-t">
        <div className="flex justify-between items-center">
          <Label className="font-bold">Flexible Exit Options</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedFlexibleExitOptions, "title")}
            onClick={() =>
              flexibleExitOptionsArray.append({ title: "", description: "" })
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add Exit Option
          </Button>
        </div>
        {flexibleExitOptionsArray.fields.length === 0 ? (
          <CurriculumEmptyState label="flexible exit options" icon={DoorOpen} />
        ) : (
          flexibleExitOptionsArray.fields.map((field, idx) => (
            <div
              key={field.id}
              className="space-y-2 border p-3 rounded-lg bg-muted/5"
            >
              <div className="flex gap-2 items-start">
                <div className="flex-1 space-y-1">
                  <Input
                    className="flex-1"
                    placeholder="Title (e.g. Diploma after 1 year)"
                    {...register(`flexible_exit_options.${idx}.title`)}
                  />
                  {errors?.flexible_exit_options?.[idx]?.title && (
                    <p className="text-xs text-destructive">
                      {errors.flexible_exit_options[idx]?.title?.message}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteExitIdx(idx)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <Textarea
                rows={2}
                placeholder="Description"
                {...register(`flexible_exit_options.${idx}.description`)}
              />
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={deleteSemesterIdx !== null}
        title="Remove Semester"
        description="Remove this semester and all its specializations? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteSemesterIdx(null)}
        onConfirm={() => {
          if (deleteSemesterIdx === null) return;
          semestersArray.remove(deleteSemesterIdx);
          setDeleteSemesterIdx(null);
        }}
      />

      <ConfirmDialog
        open={deleteStructureIdx !== null}
        title="Remove Structure Group"
        description="Remove this course structure group? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteStructureIdx(null)}
        onConfirm={() => {
          if (deleteStructureIdx === null) return;
          courseStructureArray.remove(deleteStructureIdx);
          setDeleteStructureIdx(null);
        }}
      />

      <ConfirmDialog
        open={deleteVacIdx !== null}
        title="Remove Value Added Course"
        description="Remove this value added course? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteVacIdx(null)}
        onConfirm={() => {
          if (deleteVacIdx === null) return;
          valueAddedCoursesArray.remove(deleteVacIdx);
          setDeleteVacIdx(null);
        }}
      />

      <ConfirmDialog
        open={deleteCertIdx !== null}
        title="Remove Certification"
        description="Remove this global certification? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteCertIdx(null)}
        onConfirm={() => {
          if (deleteCertIdx === null) return;
          globalCertificationsArray.remove(deleteCertIdx);
          setDeleteCertIdx(null);
        }}
      />

      <ConfirmDialog
        open={deletePgIdx !== null}
        title="Remove Postgraduation Option"
        description="Remove this postgraduation option? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeletePgIdx(null)}
        onConfirm={() => {
          if (deletePgIdx === null) return;
          postgraduationArray.remove(deletePgIdx);
          setDeletePgIdx(null);
        }}
      />

      <ConfirmDialog
        open={deleteExitIdx !== null}
        title="Remove Exit Option"
        description="Remove this flexible exit option? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteExitIdx(null)}
        onConfirm={() => {
          if (deleteExitIdx === null) return;
          flexibleExitOptionsArray.remove(deleteExitIdx);
          setDeleteExitIdx(null);
        }}
      />
    </div>
  );
}
