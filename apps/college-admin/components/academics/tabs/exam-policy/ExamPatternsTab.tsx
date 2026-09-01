"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import * as z from "zod";
import { Plus, Trash2, X, ListChecks } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconPickerField } from "@/components/icon-picker";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const chartSegmentSchema = z.object({
  label: z.string().min(1, "Label is required"),
  percent: z.coerce.number().optional(),
});

const subtotalSchema = z.object({
  label: z.string().min(1, "Label is required"),
  marks: z.coerce.number().optional(),
});

const summaryCardSchema = z.object({
  label: z.string().min(1, "Label is required"),
  value: z.string().optional(),
});

const subComponentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  marks: z.coerce.number().optional(),
});

const componentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  marks: z.coerce.number().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  sub_components: z.array(subComponentSchema).optional(),
});

const assessmentSectionSchema = z.object({
  section: z.string().min(1, "Section is required"),
  components: z.array(componentSchema).optional(),
});

const examRowSchema = z.object({
  section: z.string().min(1, "Section is required"),
  subtitle: z.string().optional(),
  total_questions: z.coerce.number().optional(),
  attempt: z.coerce.number().optional(),
  marks: z.coerce.number().optional(),
});

const externalExamSectionSchema = z.object({
  section: z.string().min(1, "Section is required"),
  columns: z.array(z.string()).optional(),
  rows: z.array(examRowSchema).optional(),
});

const chartSchema = z.object({
  total: z.coerce.number().optional(),
  total_label: z.string().optional(),
  segments: z.array(chartSegmentSchema).optional(),
});

const examDurationSchema = z.object({
  label: z.string().optional(),
  value: z.string().optional(),
});

const patternSchema = z.object({
  pattern_type: z.string().min(1, "Pattern type is required"),
  duration: z.string().optional(),
  exam_duration: examDurationSchema.optional(),
  chart: chartSchema.optional(),
  subtotals: z.array(subtotalSchema).optional(),
  summary_cards: z.array(summaryCardSchema).optional(),
  internal_assessment: z.array(assessmentSectionSchema).optional(),
  external_examination: z.array(externalExamSectionSchema).optional(),
});

const examPatternsTabSchema = z.object({
  evaluation_patterns: z.array(patternSchema).optional(),
});

type ExamPatternsTabData = z.infer<typeof examPatternsTabSchema>;

// Blocks the "Add" button while the last item's required field is empty.
function isLastItemIncomplete(items: any[], ...fields: string[]): boolean {
  if (!items || items.length === 0) return false;
  const last = items[items.length - 1];
  return fields.some((f) => !String(last?.[f] ?? "").trim());
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 bg-muted/20 py-6 text-center">
      <ListChecks className="h-5 w-5 text-muted-foreground/40" />
      <span className="text-xs text-muted-foreground max-w-xs">
        No {label} yet — click above to add your first one.
      </span>
    </div>
  );
}

// Innermost level: owns the sub_components useFieldArray for one component.
function ComponentFields({
  patternIdx,
  sectionIdx,
  componentIdx,
  control,
  register,
  watch,
  setValue,
  errors,
  onRemoveComponent,
}: {
  patternIdx: number;
  sectionIdx: number;
  componentIdx: number;
  control: any;
  register: any;
  watch: any;
  setValue: any;
  errors: any;
  onRemoveComponent: () => void;
}) {
  const [deleteSubIdx, setDeleteSubIdx] = useState<number | null>(null);

  const basePath = `evaluation_patterns.${patternIdx}.internal_assessment.${sectionIdx}.components.${componentIdx}`;

  const subComponentsArray = useFieldArray({
    control,
    name: `${basePath}.sub_components`,
  });

  const watchedSubComponents: any[] = watch(`${basePath}.sub_components`) || [];
  const componentErrors =
    errors?.evaluation_patterns?.[patternIdx]?.internal_assessment?.[sectionIdx]
      ?.components?.[componentIdx];

  return (
    <div className="border p-3 rounded-lg space-y-2 bg-white/50">
      <div className="space-y-1">
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Name (e.g. Test Papers)"
            {...register(`${basePath}.name`)}
          />
          <Input
            type="number"
            placeholder="Marks"
            className="w-20"
            {...register(`${basePath}.marks`)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemoveComponent}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
        {componentErrors?.name && (
          <p className="text-xs text-destructive">
            {componentErrors.name.message}
          </p>
        )}
      </div>
      <Input
        placeholder="Description (optional)"
        {...register(`${basePath}.description`)}
      />
      <IconPickerField
        value={watch(`${basePath}.icon`) || ""}
        onChange={(iconUrl) => setValue(`${basePath}.icon`, iconUrl)}
      />

      {/* Sub-components */}
      <div className="pl-3 space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Sub-components</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            disabled={isLastItemIncomplete(watchedSubComponents, "name")}
            onClick={() =>
              subComponentsArray.append({ name: "", marks: undefined })
            }
          >
            <Plus className="h-3 w-3 mr-1" /> Add
          </Button>
        </div>
        {subComponentsArray.fields.length === 0 ? (
          <p className="text-[11px] text-muted-foreground/70 pl-1">
            No sub-components yet.
          </p>
        ) : (
          subComponentsArray.fields.map((field, sci) => (
            <div key={field.id} className="space-y-1">
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="Sub-component name"
                  className="h-7 text-xs"
                  {...register(`${basePath}.sub_components.${sci}.name`)}
                />
                <Input
                  type="number"
                  placeholder="Marks"
                  className="w-16 h-7 text-xs"
                  {...register(`${basePath}.sub_components.${sci}.marks`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setDeleteSubIdx(sci)}
                >
                  <X className="h-3 w-3 text-destructive" />
                </Button>
              </div>
              {componentErrors?.sub_components?.[sci]?.name && (
                <p className="text-xs text-destructive">
                  {componentErrors.sub_components[sci]?.name?.message}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={deleteSubIdx !== null}
        title="Remove Sub-component"
        description="Remove this sub-component? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteSubIdx(null)}
        onConfirm={() => {
          if (deleteSubIdx === null) return;
          subComponentsArray.remove(deleteSubIdx);
          setDeleteSubIdx(null);
        }}
      />
    </div>
  );
}

// Middle level: owns the components useFieldArray for one internal_assessment section.
function AssessmentSectionFields({
  patternIdx,
  sectionIdx,
  control,
  register,
  watch,
  setValue,
  errors,
  onRemoveSection,
}: {
  patternIdx: number;
  sectionIdx: number;
  control: any;
  register: any;
  watch: any;
  setValue: any;
  errors: any;
  onRemoveSection: () => void;
}) {
  const [deleteComponentIdx, setDeleteComponentIdx] = useState<number | null>(
    null,
  );

  const basePath = `evaluation_patterns.${patternIdx}.internal_assessment.${sectionIdx}`;

  const componentsArray = useFieldArray({
    control,
    name: `${basePath}.components`,
  });

  const watchedComponents: any[] = watch(`${basePath}.components`) || [];
  const sectionErrors =
    errors?.evaluation_patterns?.[patternIdx]?.internal_assessment?.[
      sectionIdx
    ];

  return (
    <div className="border p-3 rounded-lg space-y-3 bg-muted/10">
      <div className="space-y-1">
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Section name (e.g. ISA - Theory)"
            {...register(`${basePath}.section`)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemoveSection}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
        {sectionErrors?.section && (
          <p className="text-xs text-destructive">
            {sectionErrors.section.message}
          </p>
        )}
      </div>
      <div className="pl-3 space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-xs text-muted-foreground">Components</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedComponents, "name")}
            onClick={() =>
              componentsArray.append({
                name: "",
                marks: undefined,
                description: "",
                icon: "",
                sub_components: [],
              })
            }
          >
            <Plus className="h-3 w-3 mr-1" /> Add Component
          </Button>
        </div>
        {componentsArray.fields.length === 0 ? (
          <EmptyState label="components" />
        ) : (
          componentsArray.fields.map((field, ci) => (
            <ComponentFields
              key={field.id}
              patternIdx={patternIdx}
              sectionIdx={sectionIdx}
              componentIdx={ci}
              control={control}
              register={register}
              watch={watch}
              setValue={setValue}
              errors={errors}
              onRemoveComponent={() => setDeleteComponentIdx(ci)}
            />
          ))
        )}
      </div>

      <ConfirmDialog
        open={deleteComponentIdx !== null}
        title="Remove Component"
        description="Remove this component and all its sub-components? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteComponentIdx(null)}
        onConfirm={() => {
          if (deleteComponentIdx === null) return;
          componentsArray.remove(deleteComponentIdx);
          setDeleteComponentIdx(null);
        }}
      />
    </div>
  );
}

// Owns the rows useFieldArray for one external_examination section.
function ExternalExamSectionFields({
  patternIdx,
  sectionIdx,
  control,
  register,
  watch,
  setValue,
  errors,
  onRemoveSection,
}: {
  patternIdx: number;
  sectionIdx: number;
  control: any;
  register: any;
  watch: any;
  setValue: any;
  errors: any;
  onRemoveSection: () => void;
}) {
  const [deleteRowIdx, setDeleteRowIdx] = useState<number | null>(null);

  const basePath = `evaluation_patterns.${patternIdx}.external_examination.${sectionIdx}`;

  const rowsArray = useFieldArray({
    control,
    name: `${basePath}.rows`,
  });

  const watchedColumns: string[] = watch(`${basePath}.columns`) || [];
  const watchedRows: any[] = watch(`${basePath}.rows`) || [];
  const sectionErrors =
    errors?.evaluation_patterns?.[patternIdx]?.external_examination?.[
      sectionIdx
    ];

  return (
    <div className="border p-3 rounded-lg space-y-3 bg-muted/10">
      <div className="space-y-1">
        <div className="flex gap-2 items-center">
          <Input
            placeholder="Section name (e.g. ESA - Theory)"
            {...register(`${basePath}.section`)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemoveSection}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
        {sectionErrors?.section && (
          <p className="text-xs text-destructive">
            {sectionErrors.section.message}
          </p>
        )}
      </div>
      <Input
        placeholder="Columns (comma-separated, e.g. Section, Total Q, Attempt, Marks)"
        value={watchedColumns.join(", ")}
        onChange={(e) =>
          setValue(`${basePath}.columns`, e.target.value.split(",") as any)
        }
        onBlur={(e) =>
          setValue(
            `${basePath}.columns`,
            e.target.value
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean) as any,
          )
        }
      />
      <div className="pl-2 space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-xs text-muted-foreground">Rows</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedRows, "section")}
            onClick={() =>
              rowsArray.append({
                section: "",
                subtitle: "",
                total_questions: undefined,
                attempt: undefined,
                marks: undefined,
              })
            }
          >
            <Plus className="h-3 w-3 mr-1" /> Add Row
          </Button>
        </div>
        {rowsArray.fields.length === 0 ? (
          <EmptyState label="rows" />
        ) : (
          rowsArray.fields.map((field, ri) => (
            <div key={field.id} className="space-y-1">
              <div className="flex gap-2 items-center flex-wrap">
                <Input
                  placeholder="Section (e.g. Section A)"
                  className="flex-1 min-w-[120px]"
                  {...register(`${basePath}.rows.${ri}.section`)}
                />
                <Input
                  placeholder="Subtitle"
                  className="flex-1 min-w-[100px]"
                  {...register(`${basePath}.rows.${ri}.subtitle`)}
                />
                <Input
                  type="number"
                  placeholder="Total Q"
                  className="w-20"
                  {...register(`${basePath}.rows.${ri}.total_questions`)}
                />
                <Input
                  type="number"
                  placeholder="Attempt"
                  className="w-20"
                  {...register(`${basePath}.rows.${ri}.attempt`)}
                />
                <Input
                  type="number"
                  placeholder="Marks"
                  className="w-20"
                  {...register(`${basePath}.rows.${ri}.marks`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteRowIdx(ri)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              {sectionErrors?.rows?.[ri]?.section && (
                <p className="text-xs text-destructive">
                  {sectionErrors.rows[ri]?.section?.message}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={deleteRowIdx !== null}
        title="Remove Row"
        description="Remove this row? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteRowIdx(null)}
        onConfirm={() => {
          if (deleteRowIdx === null) return;
          rowsArray.remove(deleteRowIdx);
          setDeleteRowIdx(null);
        }}
      />
    </div>
  );
}

// The currently-expanded pattern's editor — owns FIVE scoped useFieldArrays.
function PatternFields({
  patternIdx,
  control,
  register,
  watch,
  setValue,
  errors,
  onRemovePattern,
}: {
  patternIdx: number;
  control: any;
  register: any;
  watch: any;
  setValue: any;
  errors: any;
  onRemovePattern: () => void;
}) {
  const [deleteSegmentIdx, setDeleteSegmentIdx] = useState<number | null>(null);
  const [deleteSubtotalIdx, setDeleteSubtotalIdx] = useState<number | null>(
    null,
  );
  const [deleteSummaryCardIdx, setDeleteSummaryCardIdx] = useState<
    number | null
  >(null);
  const [deleteSectionIdx, setDeleteSectionIdx] = useState<number | null>(null);
  const [deleteExamSectionIdx, setDeleteExamSectionIdx] = useState<
    number | null
  >(null);

  const basePath = `evaluation_patterns.${patternIdx}`;

  const segmentsArray = useFieldArray({
    control,
    name: `${basePath}.chart.segments`,
  });
  const subtotalsArray = useFieldArray({
    control,
    name: `${basePath}.subtotals`,
  });
  const summaryCardsArray = useFieldArray({
    control,
    name: `${basePath}.summary_cards`,
  });
  const internalAssessmentArray = useFieldArray({
    control,
    name: `${basePath}.internal_assessment`,
  });
  const externalExaminationArray = useFieldArray({
    control,
    name: `${basePath}.external_examination`,
  });

  const watchedSegments: any[] = watch(`${basePath}.chart.segments`) || [];
  const watchedSubtotals: any[] = watch(`${basePath}.subtotals`) || [];
  const watchedSummaryCards: any[] = watch(`${basePath}.summary_cards`) || [];
  const watchedInternalAssessment: any[] =
    watch(`${basePath}.internal_assessment`) || [];
  const watchedExternalExamination: any[] =
    watch(`${basePath}.external_examination`) || [];
  const patternErrors = errors?.evaluation_patterns?.[patternIdx];

  return (
    <div className="space-y-6 border p-4 rounded-xl bg-muted/5">
      {/* Pattern header */}
      <div className="flex gap-4 items-start">
        <div className="flex-1 grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">Pattern Type</Label>
            <Input
              placeholder="e.g. Course with Practical"
              {...register(`${basePath}.pattern_type`)}
            />
            {patternErrors?.pattern_type && (
              <p className="text-xs text-destructive">
                {patternErrors.pattern_type.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Duration</Label>
            <Input
              placeholder="e.g. 2 + 3 Hrs"
              {...register(`${basePath}.duration`)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Exam Duration Label</Label>
            <Input
              placeholder="e.g. DURATION"
              {...register(`${basePath}.exam_duration.label`)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Exam Duration Value</Label>
            <Input
              placeholder="e.g. 2 + 3 Hrs"
              {...register(`${basePath}.exam_duration.value`)}
            />
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemovePattern}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      {/* Chart Segments */}
      <div className="border-t pt-4 space-y-3">
        <div className="flex justify-between items-center">
          <Label className="font-bold text-sm">Chart Segments</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedSegments, "label")}
            onClick={() =>
              segmentsArray.append({ label: "", percent: undefined })
            }
          >
            <Plus className="h-3 w-3 mr-1" /> Add Segment
          </Button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">Chart Total</Label>
            <Input
              type="number"
              placeholder="100"
              {...register(`${basePath}.chart.total`)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Chart Total Label</Label>
            <Input
              placeholder="e.g. Total"
              {...register(`${basePath}.chart.total_label`)}
            />
          </div>
        </div>
        {segmentsArray.fields.length === 0 ? (
          <EmptyState label="chart segments" />
        ) : (
          segmentsArray.fields.map((field, si) => (
            <div key={field.id} className="space-y-1">
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="Label (e.g. Theory)"
                  {...register(`${basePath}.chart.segments.${si}.label`)}
                />
                <Input
                  type="number"
                  placeholder="%"
                  className="w-20"
                  {...register(`${basePath}.chart.segments.${si}.percent`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteSegmentIdx(si)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              {patternErrors?.chart?.segments?.[si]?.label && (
                <p className="text-xs text-destructive">
                  {patternErrors.chart.segments[si]?.label?.message}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Subtotals */}
      <div className="border-t pt-4 space-y-3">
        <div className="flex justify-between items-center">
          <Label className="font-bold text-sm">Subtotals</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedSubtotals, "label")}
            onClick={() =>
              subtotalsArray.append({ label: "", marks: undefined })
            }
          >
            <Plus className="h-3 w-3 mr-1" /> Add Subtotal
          </Button>
        </div>
        {subtotalsArray.fields.length === 0 ? (
          <EmptyState label="subtotals" />
        ) : (
          subtotalsArray.fields.map((field, si) => (
            <div key={field.id} className="space-y-1">
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="Label (e.g. ISA Theory)"
                  {...register(`${basePath}.subtotals.${si}.label`)}
                />
                <Input
                  type="number"
                  placeholder="Marks"
                  className="w-24"
                  {...register(`${basePath}.subtotals.${si}.marks`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteSubtotalIdx(si)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              {patternErrors?.subtotals?.[si]?.label && (
                <p className="text-xs text-destructive">
                  {patternErrors.subtotals[si]?.label?.message}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Summary Cards */}
      <div className="border-t pt-4 space-y-3">
        <div className="flex justify-between items-center">
          <Label className="font-bold text-sm">Summary Cards</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedSummaryCards, "label")}
            onClick={() => summaryCardsArray.append({ label: "", value: "" })}
          >
            <Plus className="h-3 w-3 mr-1" /> Add Card
          </Button>
        </div>
        {summaryCardsArray.fields.length === 0 ? (
          <EmptyState label="summary cards" />
        ) : (
          summaryCardsArray.fields.map((field, si) => (
            <div key={field.id} className="space-y-1">
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="Label (e.g. ISA THEORY)"
                  {...register(`${basePath}.summary_cards.${si}.label`)}
                />
                <Input
                  placeholder="Value (e.g. 20 Marks)"
                  {...register(`${basePath}.summary_cards.${si}.value`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteSummaryCardIdx(si)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              {patternErrors?.summary_cards?.[si]?.label && (
                <p className="text-xs text-destructive">
                  {patternErrors.summary_cards[si]?.label?.message}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Internal Assessment Sections */}
      <div className="border-t pt-4 space-y-4">
        <div className="flex justify-between items-center">
          <Label className="font-bold text-sm">
            Internal Assessment (ISA) Sections
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(
              watchedInternalAssessment,
              "section",
            )}
            onClick={() =>
              internalAssessmentArray.append({ section: "", components: [] })
            }
          >
            <Plus className="h-3 w-3 mr-1" /> Add Section
          </Button>
        </div>
        {internalAssessmentArray.fields.length === 0 ? (
          <EmptyState label="internal assessment sections" />
        ) : (
          internalAssessmentArray.fields.map((field, si) => (
            <AssessmentSectionFields
              key={field.id}
              patternIdx={patternIdx}
              sectionIdx={si}
              control={control}
              register={register}
              watch={watch}
              setValue={setValue}
              errors={errors}
              onRemoveSection={() => setDeleteSectionIdx(si)}
            />
          ))
        )}
      </div>

      {/* External Examination Sections */}
      <div className="border-t pt-4 space-y-4">
        <div className="flex justify-between items-center">
          <Label className="font-bold text-sm">
            External Examination (ESA) Sections
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(
              watchedExternalExamination,
              "section",
            )}
            onClick={() =>
              externalExaminationArray.append({
                section: "",
                columns: ["Section", "Total Q", "Attempt", "Marks"],
                rows: [],
              })
            }
          >
            <Plus className="h-3 w-3 mr-1" /> Add Section
          </Button>
        </div>
        {externalExaminationArray.fields.length === 0 ? (
          <EmptyState label="external examination sections" />
        ) : (
          externalExaminationArray.fields.map((field, ei) => (
            <ExternalExamSectionFields
              key={field.id}
              patternIdx={patternIdx}
              sectionIdx={ei}
              control={control}
              register={register}
              watch={watch}
              setValue={setValue}
              errors={errors}
              onRemoveSection={() => setDeleteExamSectionIdx(ei)}
            />
          ))
        )}
      </div>

      <ConfirmDialog
        open={deleteSegmentIdx !== null}
        title="Remove Chart Segment"
        description="Remove this chart segment? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteSegmentIdx(null)}
        onConfirm={() => {
          if (deleteSegmentIdx === null) return;
          segmentsArray.remove(deleteSegmentIdx);
          setDeleteSegmentIdx(null);
        }}
      />
      <ConfirmDialog
        open={deleteSubtotalIdx !== null}
        title="Remove Subtotal"
        description="Remove this subtotal? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteSubtotalIdx(null)}
        onConfirm={() => {
          if (deleteSubtotalIdx === null) return;
          subtotalsArray.remove(deleteSubtotalIdx);
          setDeleteSubtotalIdx(null);
        }}
      />
      <ConfirmDialog
        open={deleteSummaryCardIdx !== null}
        title="Remove Summary Card"
        description="Remove this summary card? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteSummaryCardIdx(null)}
        onConfirm={() => {
          if (deleteSummaryCardIdx === null) return;
          summaryCardsArray.remove(deleteSummaryCardIdx);
          setDeleteSummaryCardIdx(null);
        }}
      />
      <ConfirmDialog
        open={deleteSectionIdx !== null}
        title="Remove Internal Assessment Section"
        description="Remove this section and all its components? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteSectionIdx(null)}
        onConfirm={() => {
          if (deleteSectionIdx === null) return;
          internalAssessmentArray.remove(deleteSectionIdx);
          setDeleteSectionIdx(null);
        }}
      />
      <ConfirmDialog
        open={deleteExamSectionIdx !== null}
        title="Remove External Examination Section"
        description="Remove this section and all its rows? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteExamSectionIdx(null)}
        onConfirm={() => {
          if (deleteExamSectionIdx === null) return;
          externalExaminationArray.remove(deleteExamSectionIdx);
          setDeleteExamSectionIdx(null);
        }}
      />
    </div>
  );
}

export function ExamPatternsTab({
  payload,
  onChange,
}: {
  payload: any;
  onChange: (updates: any) => void;
  uploadingField?: string | null;
  onFieldUpload?: (
    file: File | null,
    fieldKey: string,
    s3PathSuffix: string,
    onSuccess: (url: string) => void,
  ) => void;
}) {
  const [examPolicyPatternIdx, setExamPolicyPatternIdx] = useState<number>(0);
  const [deletePatternIdx, setDeletePatternIdx] = useState<number | null>(null);

  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExamPatternsTabData>({
    resolver: zodResolver(examPatternsTabSchema as any),
    values: payload,
  });

  const patternsArray = useFieldArray({
    control: control as any,
    name: "evaluation_patterns",
  });

  const watchedPatterns = watch("evaluation_patterns") || [];

  useEffect(() => {
    const subscription = watch((value) => onChange(value));
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Label className="font-bold">Evaluation Patterns</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLastItemIncomplete(watchedPatterns, "pattern_type")}
          onClick={() => {
            const nextIdx = patternsArray.fields.length;
            patternsArray.append({
              pattern_type: "",
              duration: "",
              chart: { total: 100, total_label: "", segments: [] },
              subtotals: [],
              internal_assessment: [],
              external_examination: [],
              summary_cards: [],
              exam_duration: {
                label: "EXAM DURATION",
                value: "",
              },
            });
            setExamPolicyPatternIdx(nextIdx);
          }}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Pattern
        </Button>
      </div>

      {/* Pattern picker tabs */}
      {patternsArray.fields.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {patternsArray.fields.map((field, idx) => (
            <button
              key={field.id}
              type="button"
              onClick={() => setExamPolicyPatternIdx(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                examPolicyPatternIdx === idx
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {watchedPatterns[idx]?.pattern_type || `Pattern ${idx + 1}`}
            </button>
          ))}
        </div>
      )}

      {/* Active pattern editor */}
      {examPolicyPatternIdx < patternsArray.fields.length && (
        <PatternFields
          key={patternsArray.fields[examPolicyPatternIdx].id}
          patternIdx={examPolicyPatternIdx}
          control={control}
          register={register}
          watch={watch}
          setValue={setValue}
          errors={errors}
          onRemovePattern={() => setDeletePatternIdx(examPolicyPatternIdx)}
        />
      )}

      <ConfirmDialog
        open={deletePatternIdx !== null}
        title="Remove Pattern"
        description="Remove this evaluation pattern and all its data? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeletePatternIdx(null)}
        onConfirm={() => {
          if (deletePatternIdx === null) return;
          patternsArray.remove(deletePatternIdx);
          setExamPolicyPatternIdx(Math.max(0, deletePatternIdx - 1));
          setDeletePatternIdx(null);
        }}
      />
    </div>
  );
}
