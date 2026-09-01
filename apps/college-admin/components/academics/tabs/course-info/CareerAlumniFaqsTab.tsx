"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import * as z from "zod";
import {
  Plus,
  Trash2,
  Briefcase,
  Users,
  TrendingUp,
  HelpCircle,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const careerOpportunitySchema = z.object({
  role: z.string().min(1, "Role is required"),
  salary_range: z.string().optional(),
});

const careerProgressionEntrySchema = z.object({
  year: z.string().min(1, "Year is required"),
  description: z.string().optional(),
});

const featuredAlumnusSchema = z.object({
  name: z.string().min(1, "Name is required"),
  image: z.string().optional(),
  designation: z.string().optional(),
  career_progression: z.array(careerProgressionEntrySchema).optional(),
});

const faqItemSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().optional(),
});

const careerAlumniFaqsTabSchema = z.object({
  career_opportunities: z.array(careerOpportunitySchema).optional(),
  featuredAlumni: z
    .object({ items: z.array(featuredAlumnusSchema).optional() })
    .optional(),
  faqs: z
    .object({
      title: z.string().optional(),
      items: z.array(faqItemSchema).optional(),
    })
    .optional(),
});

type CareerAlumniFaqsTabData = z.infer<typeof careerAlumniFaqsTabSchema>;

// Blocks the "Add" button while the last item's required field is empty.
function isLastItemIncomplete(items: any[], ...fields: string[]): boolean {
  if (!items || items.length === 0) return false;
  const last = items[items.length - 1];
  return fields.some((f) => !String(last?.[f] ?? "").trim());
}

function CareerAlumniFaqsEmptyState({
  label,
  icon: Icon,
}: {
  label: string;
  icon: typeof Briefcase;
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

// Normalizes career_opportunities[] entries that may currently be either a
// plain string or {role, salary_range} into a flat {role, salary_range} shape
// before seeding the RHF form's `values`.
function normalizeCareerOpportunities(raw: any): {
  role: string;
  salary_range: string;
}[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((co) =>
    typeof co === "string"
      ? { role: co, salary_range: "" }
      : { role: co?.role || "", salary_range: co?.salary_range || "" },
  );
}

// Normalizes faqs, which may currently be either a bare array or
// {title, items: []}, into a flat {title, items: []} shape before seeding
// the RHF form's `values`.
function normalizeFaqs(raw: any): {
  title: string;
  items: { question: string; answer: string }[];
} {
  const items: any[] = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.items)
      ? raw.items
      : [];
  const title = !raw || Array.isArray(raw) ? "" : raw.title || "";
  return {
    title,
    items: items.map((faq) => ({
      question: faq?.question || "",
      answer: faq?.answer || "",
    })),
  };
}

// One alumnus in "Featured Alumni" — has its own nested career_progression[]
// array, so it needs its own useFieldArray scoped to this alumnus's index.
// Mirrors FacultyDirectoryTab's FacultyMemberFields pattern.
function AlumnusFields({
  alumnusIdx,
  control,
  register,
  watch,
  errors,
  uploadingAlumniIndex,
  onAlumniImageUpload,
  onRemoveAlumnus,
}: {
  alumnusIdx: number;
  control: any;
  register: any;
  watch: any;
  errors: any;
  uploadingAlumniIndex: number | null;
  onAlumniImageUpload: (file: File | null, idx: number) => void;
  onRemoveAlumnus: () => void;
}) {
  const [deleteProgressionIdx, setDeleteProgressionIdx] = useState<
    number | null
  >(null);

  const progressionArray = useFieldArray({
    control,
    name: `featuredAlumni.items.${alumnusIdx}.career_progression`,
  });

  const watchedProgression: any[] =
    watch(`featuredAlumni.items.${alumnusIdx}.career_progression`) || [];
  const alumnusErrors = errors?.featuredAlumni?.items?.[alumnusIdx];

  return (
    <div className="border p-3 rounded-lg bg-muted/5 space-y-3">
      <div className="flex gap-2 items-center">
        <div className="flex-1 space-y-1">
          <Input
            className="flex-1"
            placeholder="Alumni Name"
            {...register(`featuredAlumni.items.${alumnusIdx}.name`)}
          />
          {alumnusErrors?.name && (
            <p className="text-xs text-destructive">
              {alumnusErrors.name.message}
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemoveAlumnus}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <Input
        placeholder="Designation"
        {...register(`featuredAlumni.items.${alumnusIdx}.designation`)}
      />

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Image URL</Label>
        <Input
          placeholder="https://..."
          {...register(`featuredAlumni.items.${alumnusIdx}.image`)}
        />
        <Input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={uploadingAlumniIndex === alumnusIdx}
          onChange={(e) =>
            onAlumniImageUpload(e.target.files?.[0] ?? null, alumnusIdx)
          }
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="text-xs text-muted-foreground">
            Career Progression
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedProgression, "year")}
            onClick={() =>
              progressionArray.append({ year: "", description: "" })
            }
          >
            <Plus className="h-3 w-3 mr-1" /> Add Entry
          </Button>
        </div>
        {progressionArray.fields.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            No career progression entries added yet.
          </p>
        ) : (
          progressionArray.fields.map((field, cpIdx) => (
            <div
              key={field.id}
              className="border p-2 rounded space-y-2 bg-background"
            >
              <div className="flex gap-2 items-center">
                <div className="w-24 space-y-1">
                  <Input
                    placeholder="Year"
                    {...register(
                      `featuredAlumni.items.${alumnusIdx}.career_progression.${cpIdx}.year`,
                    )}
                  />
                  {alumnusErrors?.career_progression?.[cpIdx]?.year && (
                    <p className="text-xs text-destructive">
                      {alumnusErrors.career_progression[cpIdx]?.year?.message}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteProgressionIdx(cpIdx)}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
              <Textarea
                placeholder="Description"
                rows={2}
                {...register(
                  `featuredAlumni.items.${alumnusIdx}.career_progression.${cpIdx}.description`,
                )}
              />
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={deleteProgressionIdx !== null}
        title="Remove Career Progression Entry"
        description="Remove this career progression entry? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteProgressionIdx(null)}
        onConfirm={() => {
          if (deleteProgressionIdx === null) return;
          progressionArray.remove(deleteProgressionIdx);
          setDeleteProgressionIdx(null);
        }}
      />
    </div>
  );
}

export function CareerAlumniFaqsTab({
  payload,
  onChange,
  uploadingAlumniIndex,
  onAlumniImageUpload,
}: {
  payload: any;
  onChange: (updates: any) => void;
  uploadingAlumniIndex: number | null;
  onAlumniImageUpload: (file: File | null, idx: number) => void;
}) {
  const [deleteOpportunityIdx, setDeleteOpportunityIdx] = useState<
    number | null
  >(null);
  const [deleteAlumnusIdx, setDeleteAlumnusIdx] = useState<number | null>(null);
  const [deleteFaqIdx, setDeleteFaqIdx] = useState<number | null>(null);

  const values = useMemo(
    () => ({
      ...payload,
      career_opportunities: normalizeCareerOpportunities(
        payload?.career_opportunities,
      ),
      faqs: normalizeFaqs(payload?.faqs),
    }),

    [payload],
  );

  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useForm<CareerAlumniFaqsTabData>({
    resolver: zodResolver(careerAlumniFaqsTabSchema as any),
    values,
  });

  const opportunitiesArray = useFieldArray({
    control: control as any,
    name: "career_opportunities",
  });
  const alumniArray = useFieldArray({
    control: control as any,
    name: "featuredAlumni.items",
  });
  const faqItemsArray = useFieldArray({
    control: control as any,
    name: "faqs.items",
  });

  const watchedOpportunities = watch("career_opportunities") || [];
  const watchedAlumni = watch("featuredAlumni.items") || [];
  const watchedFaqItems = watch("faqs.items") || [];

  useEffect(() => {
    const subscription = watch((value) => onChange(value));
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="font-bold">Career Opportunities</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedOpportunities, "role")}
            onClick={() =>
              opportunitiesArray.append({ role: "", salary_range: "" })
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add Opportunity
          </Button>
        </div>
        {opportunitiesArray.fields.length === 0 ? (
          <CareerAlumniFaqsEmptyState
            label="career opportunities"
            icon={Briefcase}
          />
        ) : (
          opportunitiesArray.fields.map((field, idx) => (
            <div key={field.id} className="space-y-1">
              <div className="flex gap-2 items-center">
                <Input
                  className="flex-1"
                  placeholder="e.g. Digital Transformation Consultant, Product Manager"
                  {...register(`career_opportunities.${idx}.role`)}
                />
                <Input
                  className="w-36"
                  placeholder="LPA Range (e.g. 6-10 LPA)"
                  {...register(`career_opportunities.${idx}.salary_range`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteOpportunityIdx(idx)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              {errors?.career_opportunities?.[idx]?.role && (
                <p className="text-xs text-destructive">
                  {errors.career_opportunities[idx]?.role?.message}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      <div className="space-y-3 pt-4 border-t">
        <div className="flex justify-between items-center">
          <Label className="font-bold text-foreground">Featured Alumni</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedAlumni, "name")}
            onClick={() =>
              alumniArray.append({
                name: "",
                image: "",
                designation: "",
                career_progression: [],
              })
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add Alumnus
          </Button>
        </div>
        {alumniArray.fields.length === 0 ? (
          <CareerAlumniFaqsEmptyState label="featured alumni" icon={Users} />
        ) : (
          alumniArray.fields.map((field, idx) => (
            <AlumnusFields
              key={field.id}
              alumnusIdx={idx}
              control={control}
              register={register}
              watch={watch}
              errors={errors}
              uploadingAlumniIndex={uploadingAlumniIndex}
              onAlumniImageUpload={onAlumniImageUpload}
              onRemoveAlumnus={() => setDeleteAlumnusIdx(idx)}
            />
          ))
        )}
      </div>

      <div className="border p-4 rounded-xl space-y-4 bg-muted/10">
        <div className="flex justify-between items-center">
          <div>
            <Label className="font-bold text-sm">FAQs</Label>
            <p className="text-xs text-muted-foreground">Section Title</p>
          </div>
          <Input
            placeholder="e.g. Frequently Asked Questions"
            className="w-60"
            {...register("faqs.title")}
          />
        </div>
        <div className="flex justify-between items-center pt-2">
          <Label className="text-xs font-semibold">Questions & Answers</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedFaqItems, "question")}
            onClick={() => faqItemsArray.append({ question: "", answer: "" })}
          >
            <Plus className="h-4 w-4 mr-1" /> Add FAQ
          </Button>
        </div>
        {faqItemsArray.fields.length === 0 ? (
          <CareerAlumniFaqsEmptyState label="FAQs" icon={HelpCircle} />
        ) : (
          faqItemsArray.fields.map((field, idx) => (
            <div
              key={field.id}
              className="flex gap-2 items-start border p-3 rounded-lg bg-background"
            >
              <div className="flex-1 space-y-2">
                <div className="space-y-1">
                  <Input
                    placeholder="Question"
                    {...register(`faqs.items.${idx}.question`)}
                  />
                  {errors?.faqs?.items?.[idx]?.question && (
                    <p className="text-xs text-destructive">
                      {errors.faqs.items[idx]?.question?.message}
                    </p>
                  )}
                </div>
                <Textarea
                  placeholder="Answer"
                  rows={2}
                  {...register(`faqs.items.${idx}.answer`)}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setDeleteFaqIdx(idx)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={deleteOpportunityIdx !== null}
        title="Remove Career Opportunity"
        description="Remove this career opportunity? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteOpportunityIdx(null)}
        onConfirm={() => {
          if (deleteOpportunityIdx === null) return;
          opportunitiesArray.remove(deleteOpportunityIdx);
          setDeleteOpportunityIdx(null);
        }}
      />

      <ConfirmDialog
        open={deleteAlumnusIdx !== null}
        title="Remove Alumnus"
        description="Remove this alumnus and their career progression? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteAlumnusIdx(null)}
        onConfirm={() => {
          if (deleteAlumnusIdx === null) return;
          alumniArray.remove(deleteAlumnusIdx);
          setDeleteAlumnusIdx(null);
        }}
      />

      <ConfirmDialog
        open={deleteFaqIdx !== null}
        title="Remove FAQ"
        description="Remove this FAQ? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteFaqIdx(null)}
        onConfirm={() => {
          if (deleteFaqIdx === null) return;
          faqItemsArray.remove(deleteFaqIdx);
          setDeleteFaqIdx(null);
        }}
      />
    </div>
  );
}
