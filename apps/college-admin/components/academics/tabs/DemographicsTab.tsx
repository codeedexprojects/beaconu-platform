"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import * as z from "zod";
import { Plus, Trash2, Users } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PercentTotalBadge } from "@/components/academics/shared/PercentTotalBadge";
import { ImageUpload } from "@/components/ui/image-upload";
import { IconPickerField } from "@/components/icon-picker";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const labelPercentItemSchema = z.object({
  label: z.string().min(1, "Label is required"),
  percent: z.coerce.number().optional(),
});

const workExperienceItemSchema = z.object({
  icon: z.string().optional(),
  label: z.string().min(1, "Label is required"),
  subtitle: z.string().optional(),
  percent: z.coerce.number().optional(),
});

const internationalPresenceItemSchema = z.object({
  flag: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  percent: z.coerce.number().optional(),
});

const nationalPresenceItemSchema = z.object({
  state: z.string().min(1, "State is required"),
  percent: z.coerce.number().optional(),
});

const demographicsTabSchema = z.object({
  age_distribution: z
    .object({ items: z.array(labelPercentItemSchema).optional() })
    .optional(),
  gender_diversity: z
    .object({ segments: z.array(labelPercentItemSchema).optional() })
    .optional(),
  work_experience: z
    .object({ items: z.array(workExperienceItemSchema).optional() })
    .optional(),
  international_presence: z
    .object({ items: z.array(internationalPresenceItemSchema).optional() })
    .optional(),
  national_presence: z
    .object({ items: z.array(nationalPresenceItemSchema).optional() })
    .optional(),
});

type DemographicsTabData = z.infer<typeof demographicsTabSchema>;

// Blocks the "Add" button while the last item's required field is empty.
function isLastItemIncomplete(items: any[], ...fields: string[]): boolean {
  if (!items || items.length === 0) return false;
  const last = items[items.length - 1];
  return fields.some((f) => !String(last?.[f] ?? "").trim());
}

function DemographicsEmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 bg-muted/20 py-8 text-center">
      <Users className="h-6 w-6 text-muted-foreground/40" />
      <span className="text-xs text-muted-foreground max-w-xs">
        No {label} yet — click above to add your first one.
      </span>
    </div>
  );
}

export function DemographicsTab({
  payload,
  onChange,
}: {
  payload: any;
  onChange: (updates: any) => void;
}) {
  const [deleteTarget, setDeleteTarget] = useState<{
    array: "age" | "gender" | "work" | "intl" | "national";
    index: number;
  } | null>(null);

  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DemographicsTabData>({
    resolver: zodResolver(demographicsTabSchema as any),
    values: payload,
  });

  const ageArray = useFieldArray({
    control: control as any,
    name: "age_distribution.items",
  });
  const genderArray = useFieldArray({
    control: control as any,
    name: "gender_diversity.segments",
  });
  const workArray = useFieldArray({
    control: control as any,
    name: "work_experience.items",
  });
  const intlArray = useFieldArray({
    control: control as any,
    name: "international_presence.items",
  });
  const nationalArray = useFieldArray({
    control: control as any,
    name: "national_presence.items",
  });

  const watchedAge = watch("age_distribution.items") || [];
  const watchedGender = watch("gender_diversity.segments") || [];
  const watchedWork = watch("work_experience.items") || [];
  const watchedIntl = watch("international_presence.items") || [];
  const watchedNational = watch("national_presence.items") || [];

  useEffect(() => {
    const subscription = watch((value) => onChange(value));
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  return (
    <div className="space-y-6">
      {/* Age Distribution */}
      <div className="space-y-3 border rounded-lg p-4">
        <div className="flex justify-between items-center">
          <Label className="font-bold">Age Distribution</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedAge, "label")}
            onClick={() => ageArray.append({ label: "", percent: undefined })}
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
        <PercentTotalBadge items={watchedAge} />
        {ageArray.fields.length === 0 ? (
          <DemographicsEmptyState label="age groups" />
        ) : (
          ageArray.fields.map((field, idx) => (
            <div key={field.id} className="space-y-1">
              <div className="flex gap-2 items-center">
                <Input
                  className="flex-1"
                  placeholder="e.g. 18 - 22 years"
                  {...register(`age_distribution.items.${idx}.label`)}
                />
                <Input
                  type="number"
                  className="w-24"
                  placeholder="% e.g. 64"
                  {...register(`age_distribution.items.${idx}.percent`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteTarget({ array: "age", index: idx })}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              {errors.age_distribution?.items?.[idx]?.label && (
                <p className="text-xs text-destructive">
                  {errors.age_distribution.items[idx]?.label?.message}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Gender Diversity */}
      <div className="space-y-3 border rounded-lg p-4">
        <div className="flex justify-between items-center">
          <Label className="font-bold">Gender Diversity</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedGender, "label")}
            onClick={() =>
              genderArray.append({ label: "", percent: undefined })
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
        <PercentTotalBadge items={watchedGender} />
        {genderArray.fields.length === 0 ? (
          <DemographicsEmptyState label="gender segments" />
        ) : (
          genderArray.fields.map((field, idx) => (
            <div key={field.id} className="space-y-1">
              <div className="flex gap-2 items-center">
                <Input
                  className="flex-1"
                  placeholder="e.g. Male"
                  {...register(`gender_diversity.segments.${idx}.label`)}
                />
                <Input
                  type="number"
                  className="w-24"
                  placeholder="% e.g. 60"
                  {...register(`gender_diversity.segments.${idx}.percent`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setDeleteTarget({ array: "gender", index: idx })
                  }
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              {errors.gender_diversity?.segments?.[idx]?.label && (
                <p className="text-xs text-destructive">
                  {errors.gender_diversity.segments[idx]?.label?.message}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Work Experience */}
      <div className="space-y-3 border rounded-lg p-4">
        <div className="flex justify-between items-center">
          <Label className="font-bold">Work Experience</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedWork, "label")}
            onClick={() =>
              workArray.append({
                icon: "",
                label: "",
                subtitle: "",
                percent: undefined,
              })
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
        <PercentTotalBadge items={watchedWork} />
        {workArray.fields.length === 0 ? (
          <DemographicsEmptyState label="work experience segments" />
        ) : (
          workArray.fields.map((field, idx) => (
            <div
              key={field.id}
              className="border p-3 rounded-lg space-y-2 bg-muted/5"
            >
              <div className="flex gap-2 items-center">
                <div className="flex-1 space-y-1">
                  <Input
                    placeholder="Label (e.g. Freshers)"
                    {...register(`work_experience.items.${idx}.label`)}
                  />
                  {errors.work_experience?.items?.[idx]?.label && (
                    <p className="text-xs text-destructive">
                      {errors.work_experience.items[idx]?.label?.message}
                    </p>
                  )}
                </div>
                <Input
                  type="number"
                  className="w-24"
                  placeholder="% e.g. 45"
                  {...register(`work_experience.items.${idx}.percent`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteTarget({ array: "work", index: idx })}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <Input
                placeholder="Subtitle (e.g. Directly after undergrad)"
                {...register(`work_experience.items.${idx}.subtitle`)}
              />
              <IconPickerField
                value={watchedWork[idx]?.icon || ""}
                onChange={(iconUrl) =>
                  setValue(`work_experience.items.${idx}.icon`, iconUrl)
                }
              />
            </div>
          ))
        )}
      </div>

      {/* International Presence */}
      <div className="space-y-3 border rounded-lg p-4">
        <div className="flex justify-between items-center">
          <Label className="font-bold">International Presence</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedIntl, "country")}
            onClick={() =>
              intlArray.append({ flag: "", country: "", percent: undefined })
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add Country
          </Button>
        </div>
        <PercentTotalBadge items={watchedIntl} />
        {intlArray.fields.length === 0 ? (
          <DemographicsEmptyState label="countries" />
        ) : (
          intlArray.fields.map((field, idx) => (
            <div key={field.id} className="space-y-1">
              <div className="flex gap-2 items-center">
                <Input
                  className="flex-1"
                  placeholder="Country (e.g. India)"
                  {...register(`international_presence.items.${idx}.country`)}
                />
                <Input
                  type="number"
                  className="w-24"
                  placeholder="% e.g. 42"
                  {...register(`international_presence.items.${idx}.percent`)}
                />
                <ImageUpload
                  className="flex-1"
                  value={watchedIntl[idx]?.flag || ""}
                  onChange={(url) =>
                    setValue(`international_presence.items.${idx}.flag`, url)
                  }
                  context={`demographics/international-flag-${idx}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteTarget({ array: "intl", index: idx })}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              {errors.international_presence?.items?.[idx]?.country && (
                <p className="text-xs text-destructive">
                  {errors.international_presence.items[idx]?.country?.message}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* National Presence */}
      <div className="space-y-3 border rounded-lg p-4">
        <div className="flex justify-between items-center">
          <Label className="font-bold">National Presence</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedNational, "state")}
            onClick={() =>
              nationalArray.append({ state: "", percent: undefined })
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add State
          </Button>
        </div>
        <PercentTotalBadge items={watchedNational} />
        {nationalArray.fields.length === 0 ? (
          <DemographicsEmptyState label="states" />
        ) : (
          nationalArray.fields.map((field, idx) => (
            <div key={field.id} className="space-y-1">
              <div className="flex gap-2 items-center">
                <Input
                  className="flex-1"
                  placeholder="State (e.g. Kerala)"
                  {...register(`national_presence.items.${idx}.state`)}
                />
                <Input
                  type="number"
                  className="w-24"
                  placeholder="% e.g. 42"
                  {...register(`national_presence.items.${idx}.percent`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setDeleteTarget({ array: "national", index: idx })
                  }
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              {errors.national_presence?.items?.[idx]?.state && (
                <p className="text-xs text-destructive">
                  {errors.national_presence.items[idx]?.state?.message}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Remove Entry"
        description="Remove this entry? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          const { array, index } = deleteTarget;
          if (array === "age") ageArray.remove(index);
          else if (array === "gender") genderArray.remove(index);
          else if (array === "work") workArray.remove(index);
          else if (array === "intl") intlArray.remove(index);
          else if (array === "national") nationalArray.remove(index);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
