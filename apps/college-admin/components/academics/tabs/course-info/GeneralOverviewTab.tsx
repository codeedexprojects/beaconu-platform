"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import * as z from "zod";
import { Plus, Trash2, Info, Sparkles, Award } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const quickInfoItemSchema = z.object({
  label: z.string().min(1, "Label is required"),
  value: z.string().optional(),
});

const highlightItemSchema = z.object({
  text: z.string().min(1, "Text is required"),
});

const accreditationItemSchema = z.object({
  tag: z.string().min(1, "Tag is required"),
  image: z.string().optional(),
  document: z.string().optional(),
  title: z.string().optional(),
});

const generalOverviewTabSchema = z.object({
  name: z.string().optional(),
  quick_info: z.array(quickInfoItemSchema).optional(),
  highlights: z
    .object({
      title: z.string().optional(),
      items: z.array(highlightItemSchema).optional(),
    })
    .optional(),
  accreditations: z
    .object({
      title: z.string().optional(),
      items: z.array(accreditationItemSchema).optional(),
    })
    .optional(),
});

type GeneralOverviewTabData = z.infer<typeof generalOverviewTabSchema>;

// Blocks the "Add" button while the last item's required field is empty.
function isLastItemIncomplete(items: any[], ...fields: string[]): boolean {
  if (!items || items.length === 0) return false;
  const last = items[items.length - 1];
  return fields.some((f) => !String(last?.[f] ?? "").trim());
}

function GeneralOverviewEmptyState({
  label,
  icon: Icon,
}: {
  label: string;
  icon: typeof Info;
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

export function GeneralOverviewTab({
  payload,
  onChange,
  uploadingField,
  onFieldUpload,
}: {
  payload: any;
  onChange: (updates: any) => void;
  uploadingField: string | null;
  onFieldUpload: (
    file: File | null,
    fieldKey: string,
    s3PathSuffix: string,
    onSuccess: (url: string) => void,
  ) => void;
}) {
  const [deleteQuickInfoIdx, setDeleteQuickInfoIdx] = useState<number | null>(
    null,
  );
  const [deleteHighlightIdx, setDeleteHighlightIdx] = useState<number | null>(
    null,
  );
  const [deleteAccreditationIdx, setDeleteAccreditationIdx] = useState<
    number | null
  >(null);

  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GeneralOverviewTabData>({
    resolver: zodResolver(generalOverviewTabSchema as any),
    values: payload,
  });

  const quickInfoArray = useFieldArray({
    control: control as any,
    name: "quick_info",
  });
  const highlightItemsArray = useFieldArray({
    control: control as any,
    name: "highlights.items",
  });
  const accreditationItemsArray = useFieldArray({
    control: control as any,
    name: "accreditations.items",
  });

  const watchedQuickInfo = watch("quick_info") || [];
  const watchedHighlightItems = watch("highlights.items") || [];
  const watchedAccreditationItems = watch("accreditations.items") || [];

  useEffect(() => {
    const subscription = watch((value) => onChange(value));
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Course Info Name</Label>
        <Input
          placeholder="e.g. MBA Digital Transformation"
          {...register("name")}
        />
      </div>

      <div className="border p-4 rounded-xl space-y-4 bg-muted/10">
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-sm text-foreground">Quick Info</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedQuickInfo, "label")}
            onClick={() => quickInfoArray.append({ label: "", value: "" })}
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
        {quickInfoArray.fields.length === 0 ? (
          <GeneralOverviewEmptyState label="quick info items" icon={Info} />
        ) : (
          quickInfoArray.fields.map((field, idx) => (
            <div key={field.id} className="space-y-1">
              <div className="grid gap-2 grid-cols-12 items-center">
                <Input
                  placeholder="Label (e.g. DURATION)"
                  className="col-span-5"
                  {...register(`quick_info.${idx}.label`)}
                />
                <Input
                  placeholder="Value (e.g. 24 months)"
                  className="col-span-6"
                  {...register(`quick_info.${idx}.value`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="col-span-1"
                  onClick={() => setDeleteQuickInfoIdx(idx)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              {errors?.quick_info?.[idx]?.label && (
                <p className="text-xs text-destructive">
                  {errors.quick_info[idx]?.label?.message}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      <div className="border p-4 rounded-xl space-y-4 bg-muted/10">
        <div className="flex justify-between items-center">
          <div>
            <Label className="font-bold text-sm">Highlights</Label>
            <p className="text-xs text-muted-foreground">Title</p>
          </div>
          <Input
            placeholder="e.g. Program Highlights"
            className="w-60"
            {...register("highlights.title")}
          />
        </div>
        <div className="flex justify-between items-center pt-2">
          <Label className="text-xs font-semibold">Items</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedHighlightItems, "text")}
            onClick={() => highlightItemsArray.append({ text: "" })}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Highlight
          </Button>
        </div>
        {highlightItemsArray.fields.length === 0 ? (
          <GeneralOverviewEmptyState label="highlights" icon={Sparkles} />
        ) : (
          highlightItemsArray.fields.map((field, idx) => (
            <div key={field.id} className="space-y-1">
              <div className="flex gap-2 items-start">
                <Textarea
                  placeholder="Highlight text"
                  rows={2}
                  {...register(`highlights.items.${idx}.text`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteHighlightIdx(idx)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              {errors?.highlights?.items?.[idx]?.text && (
                <p className="text-xs text-destructive">
                  {errors.highlights.items[idx]?.text?.message}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      <div className="border p-4 rounded-xl space-y-4 bg-muted/10">
        <div className="flex justify-between items-center">
          <div>
            <Label className="font-bold text-sm">Accreditations</Label>
            <p className="text-xs text-muted-foreground">Title</p>
          </div>
          <Input
            placeholder="e.g. Course Accolades"
            className="w-60"
            {...register("accreditations.title")}
          />
        </div>
        <div className="flex justify-between items-center pt-2">
          <Label className="text-xs font-semibold">Items</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedAccreditationItems, "tag")}
            onClick={() =>
              accreditationItemsArray.append({
                tag: "",
                image: "",
                document: "",
                title: "",
              })
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
        {accreditationItemsArray.fields.length === 0 ? (
          <GeneralOverviewEmptyState label="accreditations" icon={Award} />
        ) : (
          accreditationItemsArray.fields.map((field, idx) => (
            <div key={field.id} className="space-y-2 pt-2 pb-4 border-b">
              <div className="grid gap-2 grid-cols-2">
                <div>
                  <Label className="text-xs">Tag</Label>
                  <Input
                    placeholder="e.g. MAHE Rank 3"
                    {...register(`accreditations.items.${idx}.tag`)}
                  />
                  {errors?.accreditations?.items?.[idx]?.tag && (
                    <p className="text-xs text-destructive">
                      {errors.accreditations.items[idx]?.tag?.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-xs">Image</Label>
                  <ImageUpload
                    value={watch(`accreditations.items.${idx}.image`) || ""}
                    onChange={(url) =>
                      setValue(`accreditations.items.${idx}.image`, url)
                    }
                    context={`general-overview/accreditation-image-${idx}`}
                  />
                </div>
                <div>
                  <Label className="text-xs">Certificate (PDF)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="application/pdf"
                      disabled={uploadingField === `accreditation_doc_${idx}`}
                      onChange={(e) =>
                        onFieldUpload(
                          e.target.files?.[0] ?? null,
                          `accreditation_doc_${idx}`,
                          `accreditations/document_${idx}`,
                          (url) =>
                            setValue(
                              `accreditations.items.${idx}.document`,
                              url,
                            ),
                        )
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Title</Label>
                  <Input
                    placeholder="e.g. India's top #131"
                    {...register(`accreditations.items.${idx}.title`)}
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setDeleteAccreditationIdx(idx)}
              >
                <Trash2 className="h-4 w-4 mr-1 text-destructive" />
                Remove
              </Button>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={deleteQuickInfoIdx !== null}
        title="Remove Quick Info"
        description="Remove this quick info item? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteQuickInfoIdx(null)}
        onConfirm={() => {
          if (deleteQuickInfoIdx === null) return;
          quickInfoArray.remove(deleteQuickInfoIdx);
          setDeleteQuickInfoIdx(null);
        }}
      />

      <ConfirmDialog
        open={deleteHighlightIdx !== null}
        title="Remove Highlight"
        description="Remove this highlight? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteHighlightIdx(null)}
        onConfirm={() => {
          if (deleteHighlightIdx === null) return;
          highlightItemsArray.remove(deleteHighlightIdx);
          setDeleteHighlightIdx(null);
        }}
      />

      <ConfirmDialog
        open={deleteAccreditationIdx !== null}
        title="Remove Accreditation"
        description="Remove this accreditation? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteAccreditationIdx(null)}
        onConfirm={() => {
          if (deleteAccreditationIdx === null) return;
          accreditationItemsArray.remove(deleteAccreditationIdx);
          setDeleteAccreditationIdx(null);
        }}
      />
    </div>
  );
}
