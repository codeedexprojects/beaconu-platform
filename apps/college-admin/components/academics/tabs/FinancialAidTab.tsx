"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import * as z from "zod";
import { Plus, Trash2, HandCoins } from "lucide-react";
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

const scoreRangeSchema = z.object({
  id: z.string().optional(),
  range_label: z.string().min(1, "Range label is required"),
  discount_type: z.enum(["percentage", "amount"]).optional(),
  discount_value: z.union([z.string(), z.coerce.number()]).optional(),
  max_scholarship_amount: z.string().optional(),
  net_payable_amount: z.string().optional(),
});

const portEntrySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  terms_and_conditions: z.array(z.string()).optional(),
  score_ranges: z.array(scoreRangeSchema).optional(),
});

const concessionDetailsSchema = z.object({
  eligibility_criteria: z.array(z.string()).optional(),
  scholarship_amount: z.string().optional(),
  net_payable: z.string().optional(),
});

const concessionItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  discount_percent: z.union([z.string(), z.coerce.number()]).optional(),
  discount_label: z.string().optional(),
  accent_color: z.string().optional(),
  expanded: z.boolean().optional(),
  details_cta: z
    .object({ label: z.string().optional(), icon: z.string().optional() })
    .optional(),
  details: concessionDetailsSchema.optional(),
});

const financialAidTabSchema = z.object({
  merit_scholarship: z
    .object({
      title: z.string().optional(),
      port_entries: z.array(portEntrySchema).optional(),
    })
    .optional(),
  financial_concessions: z
    .object({
      items: z.array(concessionItemSchema).optional(),
      total_types: z.coerce.number().optional(),
      total_types_label: z.string().optional(),
    })
    .optional(),
});

type FinancialAidTabData = z.infer<typeof financialAidTabSchema>;

// Blocks the "Add" button while the last item's required field is empty.
function isLastItemIncomplete(items: any[], ...fields: string[]): boolean {
  if (!items || items.length === 0) return false;
  const last = items[items.length - 1];
  return fields.some((f) => !String(last?.[f] ?? "").trim());
}

// Blocks the "Add" button for flat string arrays while the last string is empty.
function isLastStringIncomplete(items: string[]): boolean {
  if (!items || items.length === 0) return false;
  return !String(items[items.length - 1] ?? "").trim();
}

function FinancialAidEmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 bg-muted/20 py-8 text-center">
      <HandCoins className="h-6 w-6 text-muted-foreground/40" />
      <span className="text-xs text-muted-foreground max-w-xs">
        No {label} yet — click above to add your first one.
      </span>
    </div>
  );
}

// One port entry inside "Merit Scholarship" — has two sibling nested arrays
// (terms_and_conditions[] and score_ranges[]), so it needs its own scoped
// useFieldArrays. Mirrors Profile's `CommuteRouteFields` pattern.
function PortEntryFields({
  portIdx,
  control,
  register,
  watch,
  errors,
  onRemoveEntry,
}: {
  portIdx: number;
  control: any;
  register: any;
  watch: any;
  errors: any;
  onRemoveEntry: () => void;
}) {
  const [deleteTermIdx, setDeleteTermIdx] = useState<number | null>(null);
  const [deleteRangeIdx, setDeleteRangeIdx] = useState<number | null>(null);

  const termsArray = useFieldArray({
    control,
    name: `merit_scholarship.port_entries.${portIdx}.terms_and_conditions`,
  });
  const scoreRangesArray = useFieldArray({
    control,
    name: `merit_scholarship.port_entries.${portIdx}.score_ranges`,
  });

  const watchedTerms: string[] =
    watch(`merit_scholarship.port_entries.${portIdx}.terms_and_conditions`) ||
    [];
  const watchedRanges: any[] =
    watch(`merit_scholarship.port_entries.${portIdx}.score_ranges`) || [];
  const entryErrors = errors?.merit_scholarship?.port_entries?.[portIdx];

  return (
    <div className="space-y-3 rounded-md border p-3 bg-muted/5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-1">
          <Input
            placeholder="e.g. JEE Main"
            {...register(`merit_scholarship.port_entries.${portIdx}.name`)}
          />
          {entryErrors?.name && (
            <p className="text-xs text-destructive">
              {entryErrors.name.message}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemoveEntry}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <div className="space-y-2 pl-2 border-l-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold">
            Terms &amp; Conditions
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastStringIncomplete(watchedTerms)}
            onClick={() => termsArray.append("")}
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
        {termsArray.fields.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            No terms added yet.
          </p>
        ) : (
          termsArray.fields.map((field, tIdx) => (
            <div key={field.id} className="flex gap-2 items-center">
              <Input
                placeholder="e.g. Offered on first-come, first-serve basis"
                {...register(
                  `merit_scholarship.port_entries.${portIdx}.terms_and_conditions.${tIdx}`,
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setDeleteTermIdx(tIdx)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))
        )}
      </div>

      <div className="space-y-2 pl-2 border-l-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold">Score Ranges</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedRanges, "range_label")}
            onClick={() =>
              scoreRangesArray.append({
                id: "",
                range_label: "",
                discount_type: "percentage",
                discount_value: "",
                max_scholarship_amount: "",
                net_payable_amount: "",
              })
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add Score Range
          </Button>
        </div>
        {scoreRangesArray.fields.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            No score ranges added yet.
          </p>
        ) : (
          scoreRangesArray.fields.map((field, rangeIdx) => (
            <div
              key={field.id}
              className="grid gap-2 md:grid-cols-2 border rounded-md p-2"
            >
              <div className="space-y-1">
                <Input
                  placeholder="Range Label (e.g. 1 - 1000)"
                  {...register(
                    `merit_scholarship.port_entries.${portIdx}.score_ranges.${rangeIdx}.range_label`,
                  )}
                />
                {entryErrors?.score_ranges?.[rangeIdx]?.range_label && (
                  <p className="text-xs text-destructive">
                    {entryErrors.score_ranges[rangeIdx]?.range_label?.message}
                  </p>
                )}
              </div>
              <Controller
                name={`merit_scholarship.port_entries.${portIdx}.score_ranges.${rangeIdx}.discount_type`}
                control={control}
                render={({ field: discountTypeField }) => (
                  <Select
                    value={discountTypeField.value || "percentage"}
                    onValueChange={(value) => discountTypeField.onChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Discount Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="amount">Amount</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              <Input
                type="number"
                placeholder={
                  watchedRanges[rangeIdx]?.discount_type === "amount"
                    ? "Discount Amount (e.g. 10000)"
                    : "Discount Percentage (e.g. 25)"
                }
                {...register(
                  `merit_scholarship.port_entries.${portIdx}.score_ranges.${rangeIdx}.discount_value`,
                )}
              />
              <Input
                placeholder="Max Scholarship Amount (e.g. Rs 75,000)"
                {...register(
                  `merit_scholarship.port_entries.${portIdx}.score_ranges.${rangeIdx}.max_scholarship_amount`,
                )}
              />
              <Input
                placeholder="Net Payable Amount (e.g. Rs 3,20,000)"
                {...register(
                  `merit_scholarship.port_entries.${portIdx}.score_ranges.${rangeIdx}.net_payable_amount`,
                )}
              />
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteRangeIdx(rangeIdx)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={deleteTermIdx !== null}
        title="Remove Term"
        description="Remove this term? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteTermIdx(null)}
        onConfirm={() => {
          if (deleteTermIdx === null) return;
          termsArray.remove(deleteTermIdx);
          setDeleteTermIdx(null);
        }}
      />

      <ConfirmDialog
        open={deleteRangeIdx !== null}
        title="Remove Score Range"
        description="Remove this score range? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteRangeIdx(null)}
        onConfirm={() => {
          if (deleteRangeIdx === null) return;
          scoreRangesArray.remove(deleteRangeIdx);
          setDeleteRangeIdx(null);
        }}
      />
    </div>
  );
}

// One concession item inside "Financial Concessions" — has its own nested
// details.eligibility_criteria[] array, so it needs its own scoped
// useFieldArray.
function ConcessionItemFields({
  itemIdx,
  control,
  register,
  watch,
  errors,
  onRemoveItem,
}: {
  itemIdx: number;
  control: any;
  register: any;
  watch: any;
  errors: any;
  onRemoveItem: () => void;
}) {
  const [deleteCriterionIdx, setDeleteCriterionIdx] = useState<number | null>(
    null,
  );

  const criteriaArray = useFieldArray({
    control,
    name: `financial_concessions.items.${itemIdx}.details.eligibility_criteria`,
  });

  const watchedCriteria: string[] =
    watch(
      `financial_concessions.items.${itemIdx}.details.eligibility_criteria`,
    ) || [];
  const itemErrors = errors?.financial_concessions?.items?.[itemIdx];

  return (
    <div className="space-y-3 rounded-md border p-4">
      <div className="flex items-center justify-between">
        <Label className="font-bold">Concession #{itemIdx + 1}</Label>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemoveItem}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <Label>Name</Label>
          <Input
            placeholder="e.g. Alumni"
            {...register(`financial_concessions.items.${itemIdx}.name`)}
          />
          {itemErrors?.name && (
            <p className="text-xs text-destructive">
              {itemErrors.name.message}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label>Discount Percent</Label>
          <Input
            type="number"
            placeholder="e.g. 15"
            {...register(
              `financial_concessions.items.${itemIdx}.discount_percent`,
            )}
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <Label>Scholarship Amount</Label>
          <Input
            placeholder="e.g. Rs75,000"
            {...register(
              `financial_concessions.items.${itemIdx}.details.scholarship_amount`,
            )}
          />
        </div>
        <div className="space-y-1">
          <Label>Net Payable</Label>
          <Input
            placeholder="e.g. Rs3,20,000"
            {...register(
              `financial_concessions.items.${itemIdx}.details.net_payable`,
            )}
          />
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t">
        <div className="flex items-center justify-between">
          <Label className="font-bold">Eligibility Criteria</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastStringIncomplete(watchedCriteria)}
            onClick={() => criteriaArray.append("")}
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
        {criteriaArray.fields.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            No eligibility criteria added yet.
          </p>
        ) : (
          criteriaArray.fields.map((field, cIdx) => (
            <div key={field.id} className="flex gap-2 items-center">
              <Input
                placeholder="e.g. Must have completed a full-time degree program."
                {...register(
                  `financial_concessions.items.${itemIdx}.details.eligibility_criteria.${cIdx}`,
                )}
              />
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

export function FinancialAidTab({
  payload,
  onChange,
}: {
  payload: any;
  onChange: (updates: any) => void;
}) {
  const [deletePortEntryIdx, setDeletePortEntryIdx] = useState<number | null>(
    null,
  );
  const [deleteConcessionIdx, setDeleteConcessionIdx] = useState<number | null>(
    null,
  );

  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useForm<FinancialAidTabData>({
    resolver: zodResolver(financialAidTabSchema as any),
    values: payload,
  });

  const portEntriesArray = useFieldArray({
    control: control as any,
    name: "merit_scholarship.port_entries",
  });

  const concessionItemsArray = useFieldArray({
    control: control as any,
    name: "financial_concessions.items",
  });

  const watchedPortEntries = watch("merit_scholarship.port_entries") || [];
  const watchedConcessionItems = watch("financial_concessions.items") || [];

  useEffect(() => {
    const subscription = watch((value) => {
      const items = value.financial_concessions?.items || [];
      onChange({
        ...value,
        financial_concessions: {
          ...(value.financial_concessions || {}),
          items,
          total_types: items.length,
          total_types_label: `${items.length} TYPES`,
        },
      });
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-md border p-4">
        <Label className="font-bold">Merit Scholarship</Label>
        <div className="space-y-1">
          <Label>Title</Label>
          <Input
            placeholder="Merit Scholarship"
            {...register("merit_scholarship.title")}
          />
        </div>

        <div className="space-y-3 pt-2 border-t">
          <div className="flex items-center justify-between">
            <Label className="font-bold">Port Entries</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLastItemIncomplete(watchedPortEntries, "name")}
              onClick={() =>
                portEntriesArray.append({
                  id: "",
                  name: "",
                  terms_and_conditions: [],
                  score_ranges: [],
                })
              }
            >
              <Plus className="h-4 w-4 mr-1" /> Add Port Entry
            </Button>
          </div>

          {portEntriesArray.fields.length === 0 ? (
            <FinancialAidEmptyState label="port entries" />
          ) : (
            portEntriesArray.fields.map((field, portIdx) => (
              <PortEntryFields
                key={field.id}
                portIdx={portIdx}
                control={control}
                register={register}
                watch={watch}
                errors={errors}
                onRemoveEntry={() => setDeletePortEntryIdx(portIdx)}
              />
            ))
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="font-bold">Financial Concessions</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedConcessionItems, "name")}
            onClick={() =>
              concessionItemsArray.append({
                name: "",
                discount_percent: 0,
                discount_label: "0% OFF",
                accent_color: "black",
                expanded: true,
                details_cta: {
                  label: "SHOW LESS",
                  icon: "",
                },
                details: {
                  eligibility_criteria: [],
                  scholarship_amount: "",
                  net_payable: "",
                },
              })
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add Concession
          </Button>
        </div>

        {concessionItemsArray.fields.length === 0 ? (
          <FinancialAidEmptyState label="financial concessions" />
        ) : (
          concessionItemsArray.fields.map((field, idx) => (
            <ConcessionItemFields
              key={field.id}
              itemIdx={idx}
              control={control}
              register={register}
              watch={watch}
              errors={errors}
              onRemoveItem={() => setDeleteConcessionIdx(idx)}
            />
          ))
        )}
      </div>

      <ConfirmDialog
        open={deletePortEntryIdx !== null}
        title="Remove Port Entry"
        description="Remove this port entry and all its terms and score ranges? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeletePortEntryIdx(null)}
        onConfirm={() => {
          if (deletePortEntryIdx === null) return;
          portEntriesArray.remove(deletePortEntryIdx);
          setDeletePortEntryIdx(null);
        }}
      />

      <ConfirmDialog
        open={deleteConcessionIdx !== null}
        title="Remove Concession"
        description="Remove this concession? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteConcessionIdx(null)}
        onConfirm={() => {
          if (deleteConcessionIdx === null) return;
          concessionItemsArray.remove(deleteConcessionIdx);
          setDeleteConcessionIdx(null);
        }}
      />
    </div>
  );
}
