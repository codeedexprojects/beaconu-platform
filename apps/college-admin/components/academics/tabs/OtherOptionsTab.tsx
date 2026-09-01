"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import * as z from "zod";
import { Plus, Trash2, Route } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const otherOptionItemSchema = z.object({
  courseName: z.string().min(1, "Course name is required"),
  duration: z.string().optional(),
});

const otherOptionsTabSchema = z.object({
  list: z.array(otherOptionItemSchema).optional(),
});

type OtherOptionsTabData = z.infer<typeof otherOptionsTabSchema>;

// Blocks the "Add" button while the last item's required field is empty.
function isLastItemIncomplete(items: any[], ...fields: string[]): boolean {
  if (!items || items.length === 0) return false;
  const last = items[items.length - 1];
  return fields.some((f) => !String(last?.[f] ?? "").trim());
}

function OtherOptionsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 bg-muted/20 py-8 text-center">
      <Route className="h-6 w-6 text-muted-foreground/40" />
      <span className="text-xs text-muted-foreground max-w-xs">
        No related pathways yet — click above to add your first one.
      </span>
    </div>
  );
}

export function OtherOptionsTab({
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
    formState: { errors },
  } = useForm<OtherOptionsTabData>({
    resolver: zodResolver(otherOptionsTabSchema as any),
    values: payload,
  });

  const listArray = useFieldArray({
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="block font-bold">Related Pathways / Courses</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLastItemIncomplete(watchedList, "courseName")}
          onClick={() => listArray.append({ courseName: "", duration: "" })}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Course Lineage
        </Button>
      </div>

      {listArray.fields.length === 0 ? (
        <OtherOptionsEmptyState />
      ) : (
        listArray.fields.map((field, idx) => (
          <div
            key={field.id}
            className="flex gap-2 items-start border p-3 rounded-lg bg-muted/10"
          >
            <div className="flex-1 space-y-1">
              <Input
                placeholder="Course Name"
                {...register(`list.${idx}.courseName`)}
              />
              {errors.list?.[idx]?.courseName && (
                <p className="text-xs text-destructive">
                  {errors.list[idx]?.courseName?.message}
                </p>
              )}
            </div>
            <Input
              placeholder="Duration"
              {...register(`list.${idx}.duration`)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setDeleteIndex(idx)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))
      )}

      <ConfirmDialog
        open={deleteIndex !== null}
        title="Remove Course Lineage"
        description="Remove this related pathway? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteIndex(null)}
        onConfirm={() => {
          if (deleteIndex === null) return;
          listArray.remove(deleteIndex);
          setDeleteIndex(null);
        }}
      />
    </div>
  );
}
