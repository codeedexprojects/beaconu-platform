"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import * as z from "zod";
import { Plus, Trash2, GraduationCap } from "lucide-react";
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

const gradeRowSchema = z.object({
  percentage_range: z.string().optional(),
  grade: z.string().min(1, "Grade is required"),
  grade_color: z.string().optional(),
  grade_point: z.coerce.number().optional(),
});

const gradingScaleSchema = z.object({
  title: z.string().optional(),
  columns: z.array(z.string()).optional(),
  rows: z.array(gradeRowSchema).optional(),
});

const gradingTabSchema = z.object({
  grading_scale: gradingScaleSchema.optional(),
});

type GradingTabData = z.infer<typeof gradingTabSchema>;

// Blocks the "Add" button while the last item's required field is empty.
function isLastItemIncomplete(items: any[], ...fields: string[]): boolean {
  if (!items || items.length === 0) return false;
  const last = items[items.length - 1];
  return fields.some((f) => !String(last?.[f] ?? "").trim());
}

function GradeRowsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 bg-muted/20 py-8 text-center">
      <GraduationCap className="h-6 w-6 text-muted-foreground/40" />
      <span className="text-xs text-muted-foreground max-w-xs">
        No grade rows yet — click above to add your first one.
      </span>
    </div>
  );
}

export function GradingTab({
  payload,
  onChange,
}: {
  payload: any;
  onChange: (updates: any) => void;
}) {
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GradingTabData>({
    resolver: zodResolver(gradingTabSchema as any),
    values: payload,
  });

  const rowsArray = useFieldArray({
    control: control as any,
    name: "grading_scale.rows",
  });

  const watchedRows = watch("grading_scale.rows") || [];
  const watchedColumns = watch("grading_scale.columns") || [];

  useEffect(() => {
    const subscription = watch((value) => onChange(value));
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Grading Scale Title</Label>
        <Input
          placeholder="e.g. Grading Scale"
          {...register("grading_scale.title")}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Table Columns (comma-separated)</Label>
        <Input
          placeholder="e.g. Percentage of Marks, Grade, Grade Point"
          value={watchedColumns.join(", ")}
          onChange={(e) =>
            setValue("grading_scale.columns", e.target.value.split(",") as any)
          }
          onBlur={(e) =>
            setValue(
              "grading_scale.columns",
              e.target.value
                .split(",")
                .map((s: string) => s.trim())
                .filter(Boolean) as any,
            )
          }
        />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="font-bold">Grade Rows</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedRows, "grade")}
            onClick={() =>
              rowsArray.append({
                percentage_range: "",
                grade: "",
                grade_color: "green",
                grade_point: undefined,
              })
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add Row
          </Button>
        </div>
        {rowsArray.fields.length === 0 ? (
          <GradeRowsEmptyState />
        ) : (
          rowsArray.fields.map((field, ri) => (
            <div key={field.id} className="space-y-1">
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="Range (e.g. 90% - 100%)"
                  {...register(`grading_scale.rows.${ri}.percentage_range`)}
                />
                <Input
                  placeholder="Grade (e.g. O)"
                  className="w-20"
                  {...register(`grading_scale.rows.${ri}.grade`)}
                />
                <Select
                  value={watchedRows[ri]?.grade_color || "green"}
                  onValueChange={(val) =>
                    setValue(`grading_scale.rows.${ri}.grade_color`, val)
                  }
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Points"
                  className="w-20"
                  step="0.1"
                  {...register(`grading_scale.rows.${ri}.grade_point`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteIndex(ri)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              {errors.grading_scale?.rows?.[ri]?.grade && (
                <p className="text-xs text-destructive">
                  {errors.grading_scale.rows[ri]?.grade?.message}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={deleteIndex !== null}
        title="Remove Grade Row"
        description="Remove this grade row? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteIndex(null)}
        onConfirm={() => {
          if (deleteIndex === null) return;
          rowsArray.remove(deleteIndex);
          setDeleteIndex(null);
        }}
      />
    </div>
  );
}
