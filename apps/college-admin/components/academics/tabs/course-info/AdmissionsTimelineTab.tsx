"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import * as z from "zod";
import { Plus, Trash2, CalendarClock, CalendarDays } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const bannerSchema = z.object({
  enabled: z.boolean().optional(),
  tag: z.string().optional(),
  message: z.string().optional(),
  progress_percentage: z.coerce.number().optional(),
});

const admissionBatchSchema = z.object({
  label: z.string().min(1, "Label is required"),
  status: z.string().optional(),
  banner: bannerSchema,
});

const keyDateSchema = z.object({
  date: z.string().optional(),
  label: z.string().min(1, "Label is required"),
  status: z.string().optional(),
});

const admissionsTimelineTabSchema = z.object({
  admission_batches: z.array(admissionBatchSchema).optional(),
  keyDates: z
    .object({
      title: z.string().optional(),
      items: z.array(keyDateSchema).optional(),
    })
    .optional(),
});

type AdmissionsTimelineTabData = z.infer<typeof admissionsTimelineTabSchema>;

// Blocks the "Add" button while the last item's required field is empty.
function isLastItemIncomplete(items: any[], ...fields: string[]): boolean {
  if (!items || items.length === 0) return false;
  const last = items[items.length - 1];
  return fields.some((f) => !String(last?.[f] ?? "").trim());
}

function AdmissionsEmptyState({
  label,
  icon: Icon,
}: {
  label: string;
  icon: typeof CalendarClock;
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

export function AdmissionsTimelineTab({
  payload,
  onChange,
}: {
  payload: any;
  onChange: (updates: any) => void;
}) {
  const [deleteBatchIdx, setDeleteBatchIdx] = useState<number | null>(null);
  const [deleteKeyDateIdx, setDeleteKeyDateIdx] = useState<number | null>(null);

  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AdmissionsTimelineTabData>({
    resolver: zodResolver(admissionsTimelineTabSchema as any),
    values: payload,
  });

  const admissionBatchesArray = useFieldArray({
    control: control as any,
    name: "admission_batches",
  });
  const keyDateItemsArray = useFieldArray({
    control: control as any,
    name: "keyDates.items",
  });

  const watchedBatches = watch("admission_batches") || [];
  const watchedKeyDateItems = watch("keyDates.items") || [];

  useEffect(() => {
    const subscription = watch((value) => onChange(value));
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="font-bold text-foreground">Admission Batches</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedBatches, "label")}
            onClick={() =>
              admissionBatchesArray.append({
                label: "",
                status: "upcoming",
                banner: {
                  enabled: true,
                  tag: "",
                  message: "",
                  progress_percentage: 0,
                },
              })
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add Batch
          </Button>
        </div>
        {admissionBatchesArray.fields.length === 0 ? (
          <AdmissionsEmptyState
            label="admission batches"
            icon={CalendarClock}
          />
        ) : (
          admissionBatchesArray.fields.map((field, idx) => (
            <div
              key={field.id}
              className="border p-4 rounded-lg space-y-3 bg-muted/5"
            >
              <div className="grid gap-3 grid-cols-3">
                <div className="space-y-1">
                  <Label className="text-xs">Label</Label>
                  <Input
                    placeholder="e.g. Admissions 2025"
                    {...register(`admission_batches.${idx}.label`)}
                  />
                  {errors?.admission_batches?.[idx]?.label && (
                    <p className="text-xs text-destructive">
                      {errors.admission_batches[idx]?.label?.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-xs">Status</Label>
                  <Controller
                    name={`admission_batches.${idx}.status`}
                    control={control}
                    render={({ field: statusField }) => (
                      <Select
                        value={statusField.value || "upcoming"}
                        onValueChange={(val) => statusField.onChange(val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="upcoming">Upcoming</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteBatchIdx(idx)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="border-t pt-3 space-y-2">
                <h5 className="font-semibold text-xs">Banner Settings</h5>
                <div className="grid gap-2 grid-cols-4">
                  <div>
                    <Label className="text-xs">Tag</Label>
                    <Input
                      placeholder="e.g. ADMISSIONS OPEN"
                      {...register(`admission_batches.${idx}.banner.tag`)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Message</Label>
                    <Input
                      placeholder="e.g. Limited seats..."
                      {...register(`admission_batches.${idx}.banner.message`)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Progress %</Label>
                    <Input
                      type="number"
                      placeholder="e.g. 90"
                      {...register(
                        `admission_batches.${idx}.banner.progress_percentage`,
                      )}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <input
                      type="checkbox"
                      checked={watchedBatches[idx]?.banner?.enabled || false}
                      onChange={(e) =>
                        setValue(
                          `admission_batches.${idx}.banner.enabled`,
                          e.target.checked,
                        )
                      }
                      className="w-4 h-4"
                    />
                    <Label className="text-xs cursor-pointer">Enabled</Label>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="space-y-3 pt-4 border-t">
        <div className="flex justify-between items-center">
          <div>
            <Label className="font-bold">Key Dates</Label>
            <p className="text-xs text-muted-foreground">Title</p>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Title"
              className="w-60"
              {...register("keyDates.title")}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLastItemIncomplete(watchedKeyDateItems, "label")}
              onClick={() =>
                keyDateItemsArray.append({
                  date: "",
                  label: "",
                  status: "",
                })
              }
            >
              <Plus className="h-4 w-4 mr-1" /> Add Date
            </Button>
          </div>
        </div>
        {keyDateItemsArray.fields.length === 0 ? (
          <AdmissionsEmptyState label="key dates" icon={CalendarDays} />
        ) : (
          keyDateItemsArray.fields.map((field, idx) => (
            <div
              key={field.id}
              className="border p-3 rounded-lg space-y-2 bg-muted/5"
            >
              <div className="grid gap-2 grid-cols-4">
                <Input
                  type="date"
                  className="col-span-1"
                  {...register(`keyDates.items.${idx}.date`)}
                />
                <div className="col-span-1 space-y-1">
                  <Input
                    placeholder="Label"
                    {...register(`keyDates.items.${idx}.label`)}
                  />
                  {errors?.keyDates?.items?.[idx]?.label && (
                    <p className="text-xs text-destructive">
                      {errors.keyDates.items[idx]?.label?.message}
                    </p>
                  )}
                </div>
                <Controller
                  name={`keyDates.items.${idx}.status`}
                  control={control}
                  render={({ field: statusField }) => (
                    <Select
                      value={statusField.value || ""}
                      onValueChange={(value) => statusField.onChange(value)}
                    >
                      <SelectTrigger className="col-span-1">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="col-span-1"
                  onClick={() => setDeleteKeyDateIdx(idx)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={deleteBatchIdx !== null}
        title="Remove Admission Batch"
        description="Remove this admission batch? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteBatchIdx(null)}
        onConfirm={() => {
          if (deleteBatchIdx === null) return;
          admissionBatchesArray.remove(deleteBatchIdx);
          setDeleteBatchIdx(null);
        }}
      />

      <ConfirmDialog
        open={deleteKeyDateIdx !== null}
        title="Remove Key Date"
        description="Remove this key date? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteKeyDateIdx(null)}
        onConfirm={() => {
          if (deleteKeyDateIdx === null) return;
          keyDateItemsArray.remove(deleteKeyDateIdx);
          setDeleteKeyDateIdx(null);
        }}
      />
    </div>
  );
}
