"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import * as z from "zod";
import { Plus, Trash2, GraduationCap, Briefcase } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import { IconPickerField } from "@/components/icon-picker";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const educationEntrySchema = z.object({
  degree: z.string().min(1, "Degree is required"),
  institution: z.string().optional(),
  duration: z.string().optional(),
});

const professionalExperienceEntrySchema = z.object({
  role: z.string().min(1, "Role is required"),
  organization: z.string().optional(),
  duration: z.string().optional(),
  is_current: z.boolean().optional(),
  current_badge: z.string().optional(),
  icon: z.string().optional(),
});

const facultyMemberSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  photo: z.string().optional(),
  designation: z.string().optional(),
  department: z.string().optional(),
  education: z.array(educationEntrySchema).optional(),
  professional_experience: z
    .array(professionalExperienceEntrySchema)
    .optional(),
});

const facultyDirectoryTabSchema = z.object({
  list: z.array(facultyMemberSchema).optional(),
});

type FacultyDirectoryTabData = z.infer<typeof facultyDirectoryTabSchema>;

// Blocks the "Add" button while the last item's required field is empty.
function isLastItemIncomplete(items: any[], ...fields: string[]): boolean {
  if (!items || items.length === 0) return false;
  const last = items[items.length - 1];
  return fields.some((f) => !String(last?.[f] ?? "").trim());
}

function FacultyEmptyState({
  label,
  icon: Icon,
}: {
  label: string;
  icon: typeof GraduationCap;
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

// The currently-expanded faculty member's editor — has two sibling nested
// arrays (education[] and professional_experience[]), so it needs its own
// scoped useFieldArrays. Mirrors FinancialAidTab's `PortEntryFields` pattern.
function FacultyMemberFields({
  facultyIdx,
  control,
  register,
  watch,
  setValue,
  errors,
  onRemoveFaculty,
}: {
  facultyIdx: number;
  control: any;
  register: any;
  watch: any;
  setValue: any;
  errors: any;
  onRemoveFaculty: () => void;
}) {
  const [deleteEducationIdx, setDeleteEducationIdx] = useState<number | null>(
    null,
  );
  const [deleteExperienceIdx, setDeleteExperienceIdx] = useState<number | null>(
    null,
  );

  const educationArray = useFieldArray({
    control,
    name: `list.${facultyIdx}.education`,
  });
  const experienceArray = useFieldArray({
    control,
    name: `list.${facultyIdx}.professional_experience`,
  });

  const watchedEducation: any[] = watch(`list.${facultyIdx}.education`) || [];
  const watchedExperience: any[] =
    watch(`list.${facultyIdx}.professional_experience`) || [];
  const facultyErrors = errors?.list?.[facultyIdx];

  return (
    <div className="border p-4 rounded-xl space-y-6 bg-muted/5">
      {/* Basic info */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">ID</Label>
            <Input
              placeholder="e.g. faculty_001"
              {...register(`list.${facultyIdx}.id`)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Full Name</Label>
            <Input
              placeholder="e.g. Dr. Rajesh Kumar"
              {...register(`list.${facultyIdx}.name`)}
            />
            {facultyErrors?.name && (
              <p className="text-xs text-destructive">
                {facultyErrors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Designation</Label>
            <Input
              placeholder="e.g. Professor & Head of Cardiology"
              {...register(`list.${facultyIdx}.designation`)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Department</Label>
            <Input
              placeholder="e.g. DEPARTMENT OF CARDIOLOGY"
              {...register(`list.${facultyIdx}.department`)}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label className="text-xs">Photo</Label>
            <ImageUpload
              value={watch(`list.${facultyIdx}.photo`) || ""}
              onChange={(url) => setValue(`list.${facultyIdx}.photo`, url)}
              context={`faculty-directory/photo-${facultyIdx}`}
            />
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemoveFaculty}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      {/* Education */}
      <div className="border-t pt-4 space-y-3">
        <div className="flex justify-between items-center">
          <Label className="font-bold text-sm">Education</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedEducation, "degree")}
            onClick={() =>
              educationArray.append({
                degree: "",
                institution: "",
                duration: "",
              })
            }
          >
            <Plus className="h-3 w-3 mr-1" /> Add Degree
          </Button>
        </div>
        {educationArray.fields.length === 0 ? (
          <FacultyEmptyState label="education entries" icon={GraduationCap} />
        ) : (
          educationArray.fields.map((field, ei) => (
            <div key={field.id} className="space-y-1">
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="Degree (e.g. DM in Cardiology)"
                  {...register(`list.${facultyIdx}.education.${ei}.degree`)}
                />
                <Input
                  placeholder="Institution (e.g. AIIMS, New Delhi)"
                  {...register(
                    `list.${facultyIdx}.education.${ei}.institution`,
                  )}
                />
                <Input
                  placeholder="Duration (e.g. 2005 - 2008)"
                  className="w-36"
                  {...register(`list.${facultyIdx}.education.${ei}.duration`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteEducationIdx(ei)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              {facultyErrors?.education?.[ei]?.degree && (
                <p className="text-xs text-destructive">
                  {facultyErrors.education[ei]?.degree?.message}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Professional Experience */}
      <div className="border-t pt-4 space-y-3">
        <div className="flex justify-between items-center">
          <Label className="font-bold text-sm">Professional Experience</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedExperience, "role")}
            onClick={() =>
              experienceArray.append({
                role: "",
                organization: "",
                duration: "",
                is_current: false,
                current_badge: "",
                icon: "",
              })
            }
          >
            <Plus className="h-3 w-3 mr-1" /> Add Experience
          </Button>
        </div>
        {experienceArray.fields.length === 0 ? (
          <FacultyEmptyState
            label="professional experience entries"
            icon={Briefcase}
          />
        ) : (
          experienceArray.fields.map((field, ei) => {
            const isCurrent = watchedExperience[ei]?.is_current;
            return (
              <div
                key={field.id}
                className={`border p-3 rounded-lg space-y-3 ${
                  isCurrent ? "border-primary/30 bg-primary/5" : "bg-muted/5"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="Role (e.g. Senior Consultant)"
                      {...register(
                        `list.${facultyIdx}.professional_experience.${ei}.role`,
                      )}
                    />
                    <Input
                      placeholder="Organization (e.g. City Heart Institute)"
                      {...register(
                        `list.${facultyIdx}.professional_experience.${ei}.organization`,
                      )}
                    />
                    <Input
                      placeholder="Duration (e.g. 2015 - 2020)"
                      className="w-36"
                      {...register(
                        `list.${facultyIdx}.professional_experience.${ei}.duration`,
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteExperienceIdx(ei)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  {facultyErrors?.professional_experience?.[ei]?.role && (
                    <p className="text-xs text-destructive">
                      {facultyErrors.professional_experience[ei]?.role?.message}
                    </p>
                  )}
                </div>
                <div className="flex gap-4 items-center pl-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded"
                      {...register(
                        `list.${facultyIdx}.professional_experience.${ei}.is_current`,
                      )}
                    />
                    <span className="text-xs font-medium text-muted-foreground">
                      Current Position
                    </span>
                  </label>
                  {isCurrent && (
                    <Input
                      placeholder="Badge text (e.g. CURRENT POSITION)"
                      className="h-7 text-xs flex-1"
                      {...register(
                        `list.${facultyIdx}.professional_experience.${ei}.current_badge`,
                      )}
                    />
                  )}
                  <IconPickerField
                    value={watchedExperience[ei]?.icon || ""}
                    onChange={(iconUrl) =>
                      setValue(
                        `list.${facultyIdx}.professional_experience.${ei}.icon`,
                        iconUrl,
                      )
                    }
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      <ConfirmDialog
        open={deleteEducationIdx !== null}
        title="Remove Degree"
        description="Remove this education entry? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteEducationIdx(null)}
        onConfirm={() => {
          if (deleteEducationIdx === null) return;
          educationArray.remove(deleteEducationIdx);
          setDeleteEducationIdx(null);
        }}
      />

      <ConfirmDialog
        open={deleteExperienceIdx !== null}
        title="Remove Experience"
        description="Remove this professional experience entry? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteExperienceIdx(null)}
        onConfirm={() => {
          if (deleteExperienceIdx === null) return;
          experienceArray.remove(deleteExperienceIdx);
          setDeleteExperienceIdx(null);
        }}
      />
    </div>
  );
}

export function FacultyDirectoryTab({
  payload,
  onChange,
}: {
  payload: any;
  onChange: (updates: any) => void;
}) {
  const [facultyExpandedIdx, setFacultyExpandedIdx] = useState<number>(0);
  const [deleteFacultyIdx, setDeleteFacultyIdx] = useState<number | null>(null);

  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FacultyDirectoryTabData>({
    resolver: zodResolver(facultyDirectoryTabSchema as any),
    values: payload,
  });

  const facultyArray = useFieldArray({
    control: control as any,
    name: "list",
  });

  const watchedList = watch("list") || [];

  useEffect(() => {
    const subscription = watch((value) => onChange(value));
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Label className="font-bold">Faculty Directory</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLastItemIncomplete(watchedList, "name")}
          onClick={() => {
            const nextIdx = facultyArray.fields.length;
            facultyArray.append({
              id: `faculty_${String(nextIdx + 1).padStart(3, "0")}`,
              name: "",
              photo: "",
              designation: "",
              department: "",
              education: [],
              professional_experience: [],
            });
            setFacultyExpandedIdx(nextIdx);
          }}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Faculty
        </Button>
      </div>

      {/* Faculty picker tabs */}
      {facultyArray.fields.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {facultyArray.fields.map((field, idx) => (
            <button
              key={field.id}
              type="button"
              onClick={() => setFacultyExpandedIdx(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                facultyExpandedIdx === idx
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {watchedList[idx]?.name || `Faculty ${idx + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* Active faculty editor */}
      {facultyExpandedIdx < facultyArray.fields.length && (
        <FacultyMemberFields
          key={facultyArray.fields[facultyExpandedIdx].id}
          facultyIdx={facultyExpandedIdx}
          control={control}
          register={register}
          watch={watch}
          setValue={setValue}
          errors={errors}
          onRemoveFaculty={() => setDeleteFacultyIdx(facultyExpandedIdx)}
        />
      )}

      <ConfirmDialog
        open={deleteFacultyIdx !== null}
        title="Remove Faculty"
        description="Remove this faculty member and all their education and experience entries? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteFacultyIdx(null)}
        onConfirm={() => {
          if (deleteFacultyIdx === null) return;
          facultyArray.remove(deleteFacultyIdx);
          setFacultyExpandedIdx(Math.max(0, deleteFacultyIdx - 1));
          setDeleteFacultyIdx(null);
        }}
      />
    </div>
  );
}
