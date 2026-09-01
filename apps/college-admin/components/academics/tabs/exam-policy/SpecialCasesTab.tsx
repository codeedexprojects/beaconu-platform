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

const nameMarksItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  marks: z.coerce.number().optional(),
});

const marksSegmentSchema = z.object({
  label: z.string().min(1, "Label is required"),
  percent: z.coerce.number().optional(),
  color: z.string().optional(),
});

const labelValueItemSchema = z.object({
  label: z.string().min(1, "Label is required"),
  value: z.string().optional(),
});

const marksDistributionBarSchema = z.object({
  title: z.string().optional(),
  total_label: z.string().optional(),
  segments: z.array(marksSegmentSchema).optional(),
});

const sectionComponentsSchema = z.object({
  section: z.string().optional(),
  components: z.array(nameMarksItemSchema).optional(),
});

const projectsDissertationSchema = z.object({
  marks_distribution_bar: marksDistributionBarSchema.optional(),
  internal_assessment: z.array(sectionComponentsSchema).optional(),
  external_examination: z.array(sectionComponentsSchema).optional(),
  summary_cards: z.array(labelValueItemSchema).optional(),
});

const totalSummarySchema = z.object({
  label: z.string().optional(),
  value: z.string().optional(),
});

const ojtOrInternshipSchema = z.object({
  section_title: z.string().optional(),
  total_summary: totalSummarySchema.optional(),
  columns: z.array(z.string()).optional(),
  components: z.array(nameMarksItemSchema).optional(),
});

const specialCasesTabSchema = z.object({
  projects_dissertation: projectsDissertationSchema.optional(),
  ojt_evaluation: ojtOrInternshipSchema.optional(),
  internship_evaluation: ojtOrInternshipSchema.optional(),
});

type SpecialCasesTabData = z.infer<typeof specialCasesTabSchema>;

// Blocks the "Add" button while the last item's required field is empty.
function isLastItemIncomplete(items: any[], ...fields: string[]): boolean {
  if (!items || items.length === 0) return false;
  const last = items[items.length - 1];
  return fields.some((f) => !String(last?.[f] ?? "").trim());
}

function SpecialCasesEmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 bg-muted/20 py-8 text-center">
      <ListChecks className="h-6 w-6 text-muted-foreground/40" />
      <span className="text-xs text-muted-foreground max-w-xs">
        No {label} yet — click above to add your first one.
      </span>
    </div>
  );
}

type DeleteArray =
  | "segments"
  | "internal"
  | "external"
  | "summary"
  | "ojt"
  | "internship";

export function SpecialCasesTab({
  payload,
  onChange,
}: {
  payload: any;
  onChange: (updates: any) => void;
}) {
  const [deleteTarget, setDeleteTarget] = useState<{
    array: DeleteArray;
    index: number;
  } | null>(null);

  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SpecialCasesTabData>({
    resolver: zodResolver(specialCasesTabSchema as any),
    values: payload,
  });

  const segmentsArray = useFieldArray({
    control: control as any,
    name: "projects_dissertation.marks_distribution_bar.segments",
  });
  const internalComponentsArray = useFieldArray({
    control: control as any,
    name: "projects_dissertation.internal_assessment.0.components",
  });
  const externalComponentsArray = useFieldArray({
    control: control as any,
    name: "projects_dissertation.external_examination.0.components",
  });
  const summaryCardsArray = useFieldArray({
    control: control as any,
    name: "projects_dissertation.summary_cards",
  });
  const ojtComponentsArray = useFieldArray({
    control: control as any,
    name: "ojt_evaluation.components",
  });
  const internshipComponentsArray = useFieldArray({
    control: control as any,
    name: "internship_evaluation.components",
  });

  const watchedSegments =
    watch("projects_dissertation.marks_distribution_bar.segments") || [];
  const watchedInternalComponents =
    watch("projects_dissertation.internal_assessment.0.components") || [];
  const watchedExternalComponents =
    watch("projects_dissertation.external_examination.0.components") || [];
  const watchedSummaryCards =
    watch("projects_dissertation.summary_cards") || [];
  const watchedOjtColumns = watch("ojt_evaluation.columns") || [];
  const watchedOjtComponents = watch("ojt_evaluation.components") || [];
  const watchedInternshipColumns = watch("internship_evaluation.columns") || [];
  const watchedInternshipComponents =
    watch("internship_evaluation.components") || [];

  useEffect(() => {
    const subscription = watch((value) => onChange(value));
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  return (
    <div className="space-y-8">
      <div className="border p-4 rounded-xl space-y-4 bg-muted/5">
        <h4 className="font-bold text-sm">Projects & Dissertation</h4>
        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Marks Distribution Title</Label>
              <Input
                placeholder="e.g. Marks Distribution"
                {...register(
                  "projects_dissertation.marks_distribution_bar.title",
                )}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Total Label</Label>
              <Input
                placeholder="e.g. Total: 100"
                {...register(
                  "projects_dissertation.marks_distribution_bar.total_label",
                )}
              />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <Label className="text-xs font-semibold">
              Marks Distribution Segments
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLastItemIncomplete(watchedSegments, "label")}
              onClick={() =>
                segmentsArray.append({
                  label: "",
                  percent: undefined,
                  color: "#3B82F6",
                })
              }
            >
              <Plus className="h-3 w-3 mr-1" /> Add Segment
            </Button>
          </div>
          {segmentsArray.fields.length === 0 ? (
            <SpecialCasesEmptyState label="segments" />
          ) : (
            segmentsArray.fields.map((field, si) => (
              <div key={field.id} className="space-y-1">
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Label"
                    {...register(
                      `projects_dissertation.marks_distribution_bar.segments.${si}.label`,
                    )}
                  />
                  <Input
                    type="number"
                    placeholder="%"
                    className="w-20"
                    {...register(
                      `projects_dissertation.marks_distribution_bar.segments.${si}.percent`,
                    )}
                  />
                  <Input
                    placeholder="#color"
                    className="w-28"
                    {...register(
                      `projects_dissertation.marks_distribution_bar.segments.${si}.color`,
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setDeleteTarget({ array: "segments", index: si })
                    }
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                {errors.projects_dissertation?.marks_distribution_bar
                  ?.segments?.[si]?.label && (
                  <p className="text-xs text-destructive">
                    {
                      errors.projects_dissertation.marks_distribution_bar
                        .segments[si]?.label?.message
                    }
                  </p>
                )}
              </div>
            ))
          )}
        </div>
        <div className="border-t pt-3 space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-semibold">
              Internal Assessment Components
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLastItemIncomplete(watchedInternalComponents, "name")}
              onClick={() => {
                setValue(
                  "projects_dissertation.internal_assessment.0.section",
                  "Components of Internal Evaluation",
                );
                internalComponentsArray.append({ name: "", marks: undefined });
              }}
            >
              <Plus className="h-3 w-3 mr-1" /> Add
            </Button>
          </div>
          {internalComponentsArray.fields.length === 0 ? (
            <SpecialCasesEmptyState label="components" />
          ) : (
            internalComponentsArray.fields.map((field, ci) => (
              <div key={field.id} className="space-y-1">
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Component name"
                    {...register(
                      `projects_dissertation.internal_assessment.0.components.${ci}.name`,
                    )}
                  />
                  <Input
                    type="number"
                    placeholder="Marks"
                    className="w-20"
                    {...register(
                      `projects_dissertation.internal_assessment.0.components.${ci}.marks`,
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setDeleteTarget({ array: "internal", index: ci })
                    }
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                {errors.projects_dissertation?.internal_assessment?.[0]
                  ?.components?.[ci]?.name && (
                  <p className="text-xs text-destructive">
                    {
                      errors.projects_dissertation.internal_assessment[0]
                        ?.components?.[ci]?.name?.message
                    }
                  </p>
                )}
              </div>
            ))
          )}
        </div>
        <div className="border-t pt-3 space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-semibold">
              External Assessment Components
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLastItemIncomplete(watchedExternalComponents, "name")}
              onClick={() => {
                setValue(
                  "projects_dissertation.external_examination.0.section",
                  "Components of External Assessment",
                );
                externalComponentsArray.append({ name: "", marks: undefined });
              }}
            >
              <Plus className="h-3 w-3 mr-1" /> Add
            </Button>
          </div>
          {externalComponentsArray.fields.length === 0 ? (
            <SpecialCasesEmptyState label="components" />
          ) : (
            externalComponentsArray.fields.map((field, ci) => (
              <div key={field.id} className="space-y-1">
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Component name"
                    {...register(
                      `projects_dissertation.external_examination.0.components.${ci}.name`,
                    )}
                  />
                  <Input
                    type="number"
                    placeholder="Marks"
                    className="w-20"
                    {...register(
                      `projects_dissertation.external_examination.0.components.${ci}.marks`,
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setDeleteTarget({ array: "external", index: ci })
                    }
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                {errors.projects_dissertation?.external_examination?.[0]
                  ?.components?.[ci]?.name && (
                  <p className="text-xs text-destructive">
                    {
                      errors.projects_dissertation.external_examination[0]
                        ?.components?.[ci]?.name?.message
                    }
                  </p>
                )}
              </div>
            ))
          )}
        </div>
        <div className="border-t pt-3 space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-xs font-semibold">Summary Cards</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLastItemIncomplete(watchedSummaryCards, "label")}
              onClick={() => summaryCardsArray.append({ label: "", value: "" })}
            >
              <Plus className="h-3 w-3 mr-1" /> Add
            </Button>
          </div>
          {summaryCardsArray.fields.length === 0 ? (
            <SpecialCasesEmptyState label="summary cards" />
          ) : (
            summaryCardsArray.fields.map((field, si) => (
              <div key={field.id} className="space-y-1">
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Label"
                    {...register(
                      `projects_dissertation.summary_cards.${si}.label`,
                    )}
                  />
                  <Input
                    placeholder="Value (e.g. 30 Marks)"
                    {...register(
                      `projects_dissertation.summary_cards.${si}.value`,
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setDeleteTarget({ array: "summary", index: si })
                    }
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                {errors.projects_dissertation?.summary_cards?.[si]?.label && (
                  <p className="text-xs text-destructive">
                    {
                      errors.projects_dissertation.summary_cards[si]?.label
                        ?.message
                    }
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="border p-4 rounded-xl space-y-4 bg-muted/5">
        <h4 className="font-bold text-sm">OJT Evaluation</h4>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">Section Title</Label>
            <Input
              placeholder="e.g. OJT ASSESSMENT CRITERIA"
              {...register("ojt_evaluation.section_title")}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Total Summary Label</Label>
            <Input
              placeholder="e.g. TOTAL ASSESSMENT"
              {...register("ojt_evaluation.total_summary.label")}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Total Summary Value</Label>
            <Input
              placeholder="e.g. 100 Marks"
              {...register("ojt_evaluation.total_summary.value")}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label className="text-xs">Table Columns (comma-separated)</Label>
            <Input
              placeholder="e.g. Criterion, Marks"
              value={watchedOjtColumns.join(", ")}
              onChange={(e) =>
                setValue(
                  "ojt_evaluation.columns",
                  e.target.value.split(",") as any,
                )
              }
              onBlur={(e) =>
                setValue(
                  "ojt_evaluation.columns",
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
          <div className="flex justify-between items-center">
            <Label className="text-xs font-semibold">Criteria Components</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLastItemIncomplete(watchedOjtComponents, "name")}
              onClick={() =>
                ojtComponentsArray.append({ name: "", marks: undefined })
              }
            >
              <Plus className="h-3 w-3 mr-1" /> Add
            </Button>
          </div>
          {ojtComponentsArray.fields.length === 0 ? (
            <SpecialCasesEmptyState label="components" />
          ) : (
            ojtComponentsArray.fields.map((field, ci) => (
              <div key={field.id} className="space-y-1">
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Criterion name"
                    {...register(`ojt_evaluation.components.${ci}.name`)}
                  />
                  <Input
                    type="number"
                    placeholder="Marks"
                    className="w-20"
                    {...register(`ojt_evaluation.components.${ci}.marks`)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTarget({ array: "ojt", index: ci })}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                {errors.ojt_evaluation?.components?.[ci]?.name && (
                  <p className="text-xs text-destructive">
                    {errors.ojt_evaluation.components[ci]?.name?.message}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="border p-4 rounded-xl space-y-4 bg-muted/5">
        <h4 className="font-bold text-sm">Internship Evaluation</h4>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">Section Title</Label>
            <Input
              placeholder="e.g. COMPONENTS OF INTERNSHIP EVALUATION"
              {...register("internship_evaluation.section_title")}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Total Summary Label</Label>
            <Input
              placeholder="e.g. TOTAL EVALUATION"
              {...register("internship_evaluation.total_summary.label")}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Total Summary Value</Label>
            <Input
              placeholder="e.g. 100 Marks"
              {...register("internship_evaluation.total_summary.value")}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label className="text-xs">Table Columns (comma-separated)</Label>
            <Input
              placeholder="e.g. Component, Marks"
              value={watchedInternshipColumns.join(", ")}
              onChange={(e) =>
                setValue(
                  "internship_evaluation.columns",
                  e.target.value.split(",") as any,
                )
              }
              onBlur={(e) =>
                setValue(
                  "internship_evaluation.columns",
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
          <div className="flex justify-between items-center">
            <Label className="text-xs font-semibold">
              Internship Components
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLastItemIncomplete(
                watchedInternshipComponents,
                "name",
              )}
              onClick={() =>
                internshipComponentsArray.append({
                  name: "",
                  marks: undefined,
                })
              }
            >
              <Plus className="h-3 w-3 mr-1" /> Add
            </Button>
          </div>
          {internshipComponentsArray.fields.length === 0 ? (
            <SpecialCasesEmptyState label="components" />
          ) : (
            internshipComponentsArray.fields.map((field, ci) => (
              <div key={field.id} className="space-y-1">
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Component name"
                    {...register(`internship_evaluation.components.${ci}.name`)}
                  />
                  <Input
                    type="number"
                    placeholder="Marks"
                    className="w-20"
                    {...register(
                      `internship_evaluation.components.${ci}.marks`,
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setDeleteTarget({ array: "internship", index: ci })
                    }
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                {errors.internship_evaluation?.components?.[ci]?.name && (
                  <p className="text-xs text-destructive">
                    {errors.internship_evaluation.components[ci]?.name?.message}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Remove Item"
        description="Remove this item? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          const { array, index } = deleteTarget;
          if (array === "segments") segmentsArray.remove(index);
          else if (array === "internal") internalComponentsArray.remove(index);
          else if (array === "external") externalComponentsArray.remove(index);
          else if (array === "summary") summaryCardsArray.remove(index);
          else if (array === "ojt") ojtComponentsArray.remove(index);
          else if (array === "internship")
            internshipComponentsArray.remove(index);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
