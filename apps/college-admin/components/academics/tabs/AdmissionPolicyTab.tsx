"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import * as z from "zod";
import { Plus, Trash2, ListChecks } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const seatMatrixRowSchema = z.object({
  quota_category: z.string().min(1, "Quota category is required"),
  total: z.coerce.number().optional(),
  open: z.coerce.number().optional(),
});

const examSchema = z.object({
  name: z.string().min(1, "Exam name is required"),
  exam_code: z.string().optional(),
  code_badge: z.string().optional(),
  min_criteria_label: z.string().optional(),
  min_criteria_value: z.string().optional(),
});

const levelSchema = z.object({
  level_label: z.string().min(1, "Level label is required"),
  exams: z.array(examSchema).optional(),
});

const admissionPolicyTabSchema = z.object({
  title: z.string().optional(),
  enabled: z.boolean().optional(),
  seat_matrix: z
    .object({
      title: z.string().optional(),
      columns: z.array(z.string()).optional(),
      rows: z.array(seatMatrixRowSchema).optional(),
    })
    .optional(),
  entrance_exams_accepted: z
    .object({
      title: z.string().optional(),
      levels: z.array(levelSchema).optional(),
    })
    .optional(),
});

type AdmissionPolicyTabData = z.infer<typeof admissionPolicyTabSchema>;

// Blocks the "Add" button while the last item's required field is empty.
function isLastItemIncomplete(items: any[], ...fields: string[]): boolean {
  if (!items || items.length === 0) return false;
  const last = items[items.length - 1];
  return fields.some((f) => !String(last?.[f] ?? "").trim());
}

function AdmissionPolicyEmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 bg-muted/20 py-8 text-center">
      <ListChecks className="h-6 w-6 text-muted-foreground/40" />
      <span className="text-xs text-muted-foreground max-w-xs">
        No {label} yet — click above to add your first one.
      </span>
    </div>
  );
}

// One level inside "Entrance Exams Accepted" — has its own nested exams[]
// array, so it needs its own useFieldArray scoped to this level's index.
// Mirrors EligibilityCriteriaTab's `QuotaFields` pattern.
function LevelFields({
  levelIdx,
  control,
  register,
  watch,
  errors,
  onRemoveLevel,
}: {
  levelIdx: number;
  control: any;
  register: any;
  watch: any;
  errors: any;
  onRemoveLevel: () => void;
}) {
  const [deleteExamIdx, setDeleteExamIdx] = useState<number | null>(null);

  const examsArray = useFieldArray({
    control,
    name: `entrance_exams_accepted.levels.${levelIdx}.exams`,
  });

  const watchedExams: any[] =
    watch(`entrance_exams_accepted.levels.${levelIdx}.exams`) || [];
  const levelErrors = errors?.entrance_exams_accepted?.levels?.[levelIdx];

  return (
    <div className="border rounded-lg p-3 space-y-3 bg-background">
      <div className="flex gap-2 items-start">
        <div className="flex-1 space-y-1">
          <Input
            className="flex-1"
            placeholder="Level Label (e.g. NATIONAL LEVEL)"
            {...register(
              `entrance_exams_accepted.levels.${levelIdx}.level_label`,
            )}
          />
          {levelErrors?.level_label && (
            <p className="text-xs text-destructive">
              {levelErrors.level_label.message}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLastItemIncomplete(watchedExams, "name")}
          onClick={() =>
            examsArray.append({
              name: "",
              exam_code: "",
              code_badge: "",
              min_criteria_label: "",
              min_criteria_value: "",
            })
          }
        >
          <Plus className="h-3 w-3 mr-1" /> Add Exam
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemoveLevel}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
      <div className="space-y-2 pl-2">
        {examsArray.fields.length === 0 ? (
          <AdmissionPolicyEmptyState label="exams for this level" />
        ) : (
          examsArray.fields.map((field, ei) => (
            <div
              key={field.id}
              className="border rounded-lg p-3 space-y-2 bg-muted/5"
            >
              <div className="grid gap-2 md:grid-cols-3">
                <div className="space-y-1">
                  <Label className="text-xs">Exam Name</Label>
                  <Input
                    placeholder="e.g. Common Admission Test"
                    {...register(
                      `entrance_exams_accepted.levels.${levelIdx}.exams.${ei}.name`,
                    )}
                  />
                  {levelErrors?.exams?.[ei]?.name && (
                    <p className="text-xs text-destructive">
                      {levelErrors.exams[ei]?.name?.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Exam Code</Label>
                  <Input
                    placeholder="e.g. CAT-105"
                    {...register(
                      `entrance_exams_accepted.levels.${levelIdx}.exams.${ei}.exam_code`,
                    )}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Code Badge</Label>
                  <Input
                    placeholder="e.g. CAT"
                    {...register(
                      `entrance_exams_accepted.levels.${levelIdx}.exams.${ei}.code_badge`,
                    )}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Min Criteria Label</Label>
                  <Input
                    placeholder="e.g. Min. Percentile"
                    {...register(
                      `entrance_exams_accepted.levels.${levelIdx}.exams.${ei}.min_criteria_label`,
                    )}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Min Criteria Value</Label>
                  <Input
                    placeholder="e.g. 85%ile"
                    {...register(
                      `entrance_exams_accepted.levels.${levelIdx}.exams.${ei}.min_criteria_value`,
                    )}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteExamIdx(ei)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={deleteExamIdx !== null}
        title="Remove Exam"
        description="Remove this exam? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteExamIdx(null)}
        onConfirm={() => {
          if (deleteExamIdx === null) return;
          examsArray.remove(deleteExamIdx);
          setDeleteExamIdx(null);
        }}
      />
    </div>
  );
}

export function AdmissionPolicyTab({
  payload,
  onChange,
}: {
  payload: any;
  onChange: (updates: any) => void;
}) {
  const [deleteRowIdx, setDeleteRowIdx] = useState<number | null>(null);
  const [deleteLevelIdx, setDeleteLevelIdx] = useState<number | null>(null);

  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AdmissionPolicyTabData>({
    resolver: zodResolver(admissionPolicyTabSchema as any),
    values: payload,
  });

  const rowsArray = useFieldArray({
    control: control as any,
    name: "seat_matrix.rows",
  });

  const levelsArray = useFieldArray({
    control: control as any,
    name: "entrance_exams_accepted.levels",
  });

  const watchedRows = watch("seat_matrix.rows") || [];
  const watchedColumns = watch("seat_matrix.columns") || [];
  const watchedLevels = watch("entrance_exams_accepted.levels") || [];

  useEffect(() => {
    const subscription = watch((value) => onChange(value));
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label>Section Title</Label>
          <Input placeholder="e.g. Admission Policy" {...register("title")} />
        </div>
        <div className="flex items-center gap-3 pt-5">
          <Label className="text-xs">Enabled</Label>
          <input
            type="checkbox"
            className="h-4 w-4 accent-primary"
            {...register("enabled")}
          />
        </div>
      </div>

      <div className="border p-4 rounded-xl space-y-4 bg-muted/10">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-bold text-sm text-foreground">Seat Matrix</h4>
            <p className="text-xs text-muted-foreground">
              Total and open seats split by quota/category.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedRows, "quota_category")}
            onClick={() =>
              rowsArray.append({
                quota_category: "",
                total: undefined,
                open: undefined,
              })
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add Row
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">Table Title</Label>
            <Input
              placeholder="e.g. Seat Matrix"
              {...register("seat_matrix.title")}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Columns (comma-separated)</Label>
            <Input
              placeholder="Quota Category, Total, Open"
              value={watchedColumns.join(", ")}
              onChange={(e) =>
                setValue(
                  "seat_matrix.columns",
                  e.target.value.split(",") as any,
                )
              }
              onBlur={(e) =>
                setValue(
                  "seat_matrix.columns",
                  e.target.value
                    .split(",")
                    .map((s: string) => s.trim())
                    .filter(Boolean) as any,
                )
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          {rowsArray.fields.length === 0 ? (
            <AdmissionPolicyEmptyState label="seat rows" />
          ) : (
            rowsArray.fields.map((field, idx) => (
              <div key={field.id} className="space-y-1">
                <div className="flex gap-2 items-center border p-2 rounded-lg bg-muted/5">
                  <Input
                    className="flex-1"
                    placeholder="Quota Category (e.g. Government)"
                    {...register(`seat_matrix.rows.${idx}.quota_category`)}
                  />
                  <Input
                    className="w-28"
                    type="number"
                    placeholder="Total"
                    {...register(`seat_matrix.rows.${idx}.total`)}
                  />
                  <Input
                    className="w-28"
                    type="number"
                    placeholder="Open"
                    {...register(`seat_matrix.rows.${idx}.open`)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteRowIdx(idx)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                {errors.seat_matrix?.rows?.[idx]?.quota_category && (
                  <p className="text-xs text-destructive">
                    {errors.seat_matrix.rows[idx]?.quota_category?.message}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="border p-4 rounded-xl space-y-4 bg-muted/10">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-bold text-sm text-foreground">
              Entrance Exams Accepted
            </h4>
            <p className="text-xs text-muted-foreground">
              Group exams by level (National, State, Institutional).
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedLevels, "level_label")}
            onClick={() => levelsArray.append({ level_label: "", exams: [] })}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Level
          </Button>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Section Title</Label>
          <Input
            placeholder="e.g. Entrance Exams Accepted"
            {...register("entrance_exams_accepted.title")}
          />
        </div>
        <div className="space-y-4">
          {levelsArray.fields.length === 0 ? (
            <AdmissionPolicyEmptyState label="exam levels" />
          ) : (
            levelsArray.fields.map((field, li) => (
              <LevelFields
                key={field.id}
                levelIdx={li}
                control={control}
                register={register}
                watch={watch}
                errors={errors}
                onRemoveLevel={() => setDeleteLevelIdx(li)}
              />
            ))
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteRowIdx !== null}
        title="Remove Seat Row"
        description="Remove this seat matrix row? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteRowIdx(null)}
        onConfirm={() => {
          if (deleteRowIdx === null) return;
          rowsArray.remove(deleteRowIdx);
          setDeleteRowIdx(null);
        }}
      />

      <ConfirmDialog
        open={deleteLevelIdx !== null}
        title="Remove Level"
        description="Remove this level and all its exams? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteLevelIdx(null)}
        onConfirm={() => {
          if (deleteLevelIdx === null) return;
          levelsArray.remove(deleteLevelIdx);
          setDeleteLevelIdx(null);
        }}
      />
    </div>
  );
}
