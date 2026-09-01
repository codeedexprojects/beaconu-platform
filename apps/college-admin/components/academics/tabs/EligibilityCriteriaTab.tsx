"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import * as z from "zod";
import { Plus, Trash2, ClipboardList } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const criterionSchema = z.object({
  heading: z.string().min(1, "Heading is required"),
  description: z.string().optional(),
});

const quotaSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, "Label is required"),
  criteria: z.array(criterionSchema).optional(),
});

const eligibilityCriteriaTabSchema = z.object({
  indian_student: z
    .object({ quotas: z.array(quotaSchema).optional() })
    .optional(),
  foreign_student: z
    .object({ criteria: z.array(criterionSchema).optional() })
    .optional(),
});

type EligibilityCriteriaTabData = z.infer<typeof eligibilityCriteriaTabSchema>;

// Blocks the "Add" button while the last item's required field is empty.
function isLastItemIncomplete(items: any[], ...fields: string[]): boolean {
  if (!items || items.length === 0) return false;
  const last = items[items.length - 1];
  return fields.some((f) => !String(last?.[f] ?? "").trim());
}

function EligibilityEmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 bg-muted/20 py-8 text-center">
      <ClipboardList className="h-6 w-6 text-muted-foreground/40" />
      <span className="text-xs text-muted-foreground max-w-xs">
        No {label} yet — click above to add your first one.
      </span>
    </div>
  );
}

// One quota inside "Indian Students" — has its own nested criteria[] array,
// so it needs its own useFieldArray scoped to this quota's index. Mirrors
// Profile's `NearbyAccessGroup` pattern.
function QuotaFields({
  quotaIdx,
  control,
  register,
  watch,
  errors,
  onRemoveQuota,
}: {
  quotaIdx: number;
  control: any;
  register: any;
  watch: any;
  errors: any;
  onRemoveQuota: () => void;
}) {
  const [deleteCriterionIdx, setDeleteCriterionIdx] = useState<number | null>(
    null,
  );

  const criteriaArray = useFieldArray({
    control,
    name: `indian_student.quotas.${quotaIdx}.criteria`,
  });

  const watchedCriteria: any[] =
    watch(`indian_student.quotas.${quotaIdx}.criteria`) || [];
  const quotaErrors = errors?.indian_student?.quotas?.[quotaIdx];

  return (
    <div className="border p-3 rounded-lg space-y-3 bg-muted/5">
      <div className="flex gap-2 items-start">
        <div className="flex-1 space-y-1">
          <Input
            className="flex-1"
            placeholder="Quota Label (e.g. General, Management Quota)"
            {...register(`indian_student.quotas.${quotaIdx}.label`)}
          />
          {quotaErrors?.label && (
            <p className="text-xs text-destructive">
              {quotaErrors.label.message}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemoveQuota}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
      <div className="space-y-2 pl-2 border-l-2">
        {criteriaArray.fields.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            No criteria added yet.
          </p>
        ) : (
          criteriaArray.fields.map((field, cIdx) => (
            <div key={field.id} className="flex gap-2 items-start">
              <div className="flex-1 space-y-2">
                <div className="space-y-1">
                  <Input
                    placeholder="Heading (e.g. Minimum Marks)"
                    {...register(
                      `indian_student.quotas.${quotaIdx}.criteria.${cIdx}.heading`,
                    )}
                  />
                  {quotaErrors?.criteria?.[cIdx]?.heading && (
                    <p className="text-xs text-destructive">
                      {quotaErrors.criteria[cIdx]?.heading?.message}
                    </p>
                  )}
                </div>
                <Input
                  placeholder="Description (e.g. 60% aggregate in 10+2 with PCM)"
                  {...register(
                    `indian_student.quotas.${quotaIdx}.criteria.${cIdx}.description`,
                  )}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setDeleteCriterionIdx(cIdx)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLastItemIncomplete(watchedCriteria, "heading")}
          onClick={() => criteriaArray.append({ heading: "", description: "" })}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Criterion
        </Button>
      </div>

      <ConfirmDialog
        open={deleteCriterionIdx !== null}
        title="Remove Criterion"
        description="Remove this criterion? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteCriterionIdx(null)}
        onConfirm={() => {
          if (deleteCriterionIdx === null) return;
          criteriaArray.remove(deleteCriterionIdx);
          setDeleteCriterionIdx(null);
        }}
      />
    </div>
  );
}

export function EligibilityCriteriaTab({
  payload,
  onChange,
}: {
  payload: any;
  onChange: (updates: any) => void;
}) {
  const [deleteQuotaIdx, setDeleteQuotaIdx] = useState<number | null>(null);
  const [deleteForeignCriterionIdx, setDeleteForeignCriterionIdx] = useState<
    number | null
  >(null);

  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useForm<EligibilityCriteriaTabData>({
    resolver: zodResolver(eligibilityCriteriaTabSchema as any),
    values: payload,
  });

  const quotasArray = useFieldArray({
    control: control as any,
    name: "indian_student.quotas",
  });

  const foreignCriteriaArray = useFieldArray({
    control: control as any,
    name: "foreign_student.criteria",
  });

  const watchedQuotas = watch("indian_student.quotas") || [];
  const watchedForeignCriteria = watch("foreign_student.criteria") || [];

  useEffect(() => {
    const subscription = watch((value) => onChange(value));
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  return (
    <div className="space-y-6">
      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">Indian Students</CardTitle>
            <CardDescription>
              Add a quota category (e.g. General, Management, NRI) — each quota
              has its own eligibility criteria.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedQuotas, "label")}
            onClick={() =>
              quotasArray.append({ id: "", label: "", criteria: [] })
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add Quota
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {quotasArray.fields.length === 0 ? (
            <EligibilityEmptyState label="quotas" />
          ) : (
            quotasArray.fields.map((field, qIdx) => (
              <QuotaFields
                key={field.id}
                quotaIdx={qIdx}
                control={control}
                register={register}
                watch={watch}
                errors={errors}
                onRemoveQuota={() => setDeleteQuotaIdx(qIdx)}
              />
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">
              Foreign Students
            </CardTitle>
            <CardDescription>
              Eligibility criteria shown to foreign students for this course (no
              quota selection needed).
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedForeignCriteria, "heading")}
            onClick={() =>
              foreignCriteriaArray.append({ heading: "", description: "" })
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add Criterion
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {foreignCriteriaArray.fields.length === 0 ? (
            <EligibilityEmptyState label="eligibility criteria" />
          ) : (
            <div className="space-y-3">
              {foreignCriteriaArray.fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="flex gap-2 items-start border p-3 rounded-lg bg-muted/5"
                >
                  <div className="flex-1 space-y-2">
                    <div className="space-y-1">
                      <Input
                        placeholder="Heading (e.g. Minimum Marks)"
                        {...register(`foreign_student.criteria.${idx}.heading`)}
                      />
                      {errors.foreign_student?.criteria?.[idx]?.heading && (
                        <p className="text-xs text-destructive">
                          {
                            errors.foreign_student.criteria[idx]?.heading
                              ?.message
                          }
                        </p>
                      )}
                    </div>
                    <Input
                      placeholder="Description (e.g. 60% aggregate in 10+2 with PCM)"
                      {...register(
                        `foreign_student.criteria.${idx}.description`,
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteForeignCriterionIdx(idx)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteQuotaIdx !== null}
        title="Remove Quota"
        description="Remove this quota and all its criteria? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteQuotaIdx(null)}
        onConfirm={() => {
          if (deleteQuotaIdx === null) return;
          quotasArray.remove(deleteQuotaIdx);
          setDeleteQuotaIdx(null);
        }}
      />

      <ConfirmDialog
        open={deleteForeignCriterionIdx !== null}
        title="Remove Criterion"
        description="Remove this criterion? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteForeignCriterionIdx(null)}
        onConfirm={() => {
          if (deleteForeignCriterionIdx === null) return;
          foreignCriteriaArray.remove(deleteForeignCriterionIdx);
          setDeleteForeignCriterionIdx(null);
        }}
      />
    </div>
  );
}
