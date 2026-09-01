"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import * as z from "zod";
import { Plus, Trash2, GraduationCap } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const examEligibilityItemSchema = z.object({
  name: z.string().min(1, "Exam name is required"),
  level: z.string().optional(),
  min_qualifying_marks: z.string().optional(),
  description: z.string().optional(),
});

const examEligibilityTabSchema = z.object({
  exams: z.array(examEligibilityItemSchema).optional(),
});

type ExamEligibilityTabData = z.infer<typeof examEligibilityTabSchema>;

// Blocks the "Add" button while the last item's required field is empty.
function isLastItemIncomplete(items: any[], ...fields: string[]): boolean {
  if (!items || items.length === 0) return false;
  const last = items[items.length - 1];
  return fields.some((f) => !String(last?.[f] ?? "").trim());
}

function ExamEligibilityEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 bg-muted/20 py-8 text-center">
      <GraduationCap className="h-6 w-6 text-muted-foreground/40" />
      <span className="text-xs text-muted-foreground max-w-xs">
        No entrance exams yet — click below to add your first one.
      </span>
    </div>
  );
}

export function ExamEligibilityTab({
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
  } = useForm<ExamEligibilityTabData>({
    resolver: zodResolver(examEligibilityTabSchema as any),
    values: payload,
  });

  const examsArray = useFieldArray({
    control: control as any,
    name: "exams",
  });

  const watchedExams = watch("exams") || [];

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
            <CardTitle className="text-lg font-bold">
              Entrance Exam Eligibility
            </CardTitle>
            <CardDescription>
              National/state entrance exams accepted and the qualifying marks
              required.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedExams, "name")}
            onClick={() =>
              examsArray.append({
                name: "",
                level: "",
                min_qualifying_marks: "",
                description: "",
              })
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add Exam
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {examsArray.fields.length === 0 ? (
            <ExamEligibilityEmptyState />
          ) : (
            <div className="space-y-3">
              {examsArray.fields.map((field, idx) => (
                <div
                  key={field.id}
                  className="flex gap-2 items-start border p-3 rounded-lg bg-muted/5"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1 space-y-1">
                        <Input
                          className="flex-1"
                          placeholder="Exam Name (e.g. JEE Main)"
                          {...register(`exams.${idx}.name`)}
                        />
                        {errors.exams?.[idx]?.name && (
                          <p className="text-xs text-destructive">
                            {errors.exams[idx]?.name?.message}
                          </p>
                        )}
                      </div>
                      <Input
                        className="w-40"
                        placeholder="Level (National/State)"
                        {...register(`exams.${idx}.level`)}
                      />
                      <Input
                        className="w-48"
                        placeholder="Min Qualifying Marks (e.g. 60%ile)"
                        {...register(`exams.${idx}.min_qualifying_marks`)}
                      />
                    </div>
                    <Textarea
                      rows={2}
                      placeholder="Description (optional)"
                      {...register(`exams.${idx}.description`)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteIndex(idx)}
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
        open={deleteIndex !== null}
        title="Remove Exam"
        description="Remove this entrance exam? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteIndex(null)}
        onConfirm={() => {
          if (deleteIndex === null) return;
          examsArray.remove(deleteIndex);
          setDeleteIndex(null);
        }}
      />
    </div>
  );
}
