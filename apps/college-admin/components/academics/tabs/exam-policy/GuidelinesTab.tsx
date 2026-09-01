"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import * as z from "zod";
import { Plus, Trash2, BookOpen } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { IconPickerField } from "@/components/icon-picker";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const academicPolicySchema = z.object({
  badge: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  read_more_cta: z.string().optional(),
  read_more_link: z
    .string()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),
  icon: z.string().optional(),
});

const guidelinesBannerSchema = z.object({
  tag: z.string().optional(),
  background_style: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  academic_policies: z.array(academicPolicySchema).optional(),
});

const guidelinesTabSchema = z.object({
  important_guidelines_banner: guidelinesBannerSchema.optional(),
});

type GuidelinesTabData = z.infer<typeof guidelinesTabSchema>;

// Blocks the "Add" button while the last item's required field is empty.
function isLastItemIncomplete(items: any[], ...fields: string[]): boolean {
  if (!items || items.length === 0) return false;
  const last = items[items.length - 1];
  return fields.some((f) => !String(last?.[f] ?? "").trim());
}

function PoliciesEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 bg-muted/20 py-8 text-center">
      <BookOpen className="h-6 w-6 text-muted-foreground/40" />
      <span className="text-xs text-muted-foreground max-w-xs">
        No academic policies yet — click above to add your first one.
      </span>
    </div>
  );
}

export function GuidelinesTab({
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
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GuidelinesTabData>({
    resolver: zodResolver(guidelinesTabSchema as any),
    values: payload,
  });

  const policiesArray = useFieldArray({
    control: control as any,
    name: "important_guidelines_banner.academic_policies",
  });

  const watchedPolicies =
    watch("important_guidelines_banner.academic_policies") || [];

  useEffect(() => {
    const subscription = watch((value) => onChange(value));
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <Label>Banner Tag</Label>
          <Input
            placeholder="e.g. ACADEMIC POLICIES"
            {...register("important_guidelines_banner.tag")}
          />
        </div>
        <div className="space-y-1">
          <Label>Background Style</Label>
          <Input
            placeholder="e.g. gradient_orange"
            {...register("important_guidelines_banner.background_style")}
          />
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label>Banner Title</Label>
          <Input
            placeholder="e.g. Important Guidelines"
            {...register("important_guidelines_banner.title")}
          />
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label>Banner Description</Label>
          <Textarea
            rows={2}
            placeholder="Brief description of the guidelines..."
            {...register("important_guidelines_banner.description")}
          />
        </div>
      </div>
      <div className="space-y-3 pt-4 border-t">
        <div className="flex justify-between items-center">
          <Label className="font-bold">Academic Policies</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedPolicies, "title")}
            onClick={() =>
              policiesArray.append({
                badge: "",
                title: "",
                description: "",
                read_more_cta: "Read More",
                read_more_link: "",
                icon: "",
              })
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add Policy
          </Button>
        </div>
        {policiesArray.fields.length === 0 ? (
          <PoliciesEmptyState />
        ) : (
          policiesArray.fields.map((field, pi) => (
            <div
              key={field.id}
              className="border p-4 rounded-xl space-y-3 bg-muted/5"
            >
              <div className="flex gap-3 items-start">
                <div className="flex-1 grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Badge Text</Label>
                    <Input
                      placeholder="e.g. Required: 75%"
                      {...register(
                        `important_guidelines_banner.academic_policies.${pi}.badge`,
                      )}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Policy Title</Label>
                    <Input
                      placeholder="e.g. Minimum Attendance"
                      {...register(
                        `important_guidelines_banner.academic_policies.${pi}.title`,
                      )}
                    />
                    {errors.important_guidelines_banner?.academic_policies?.[pi]
                      ?.title && (
                      <p className="text-xs text-destructive">
                        {
                          errors.important_guidelines_banner.academic_policies[
                            pi
                          ]?.title?.message
                        }
                      </p>
                    )}
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <Label className="text-xs">Description</Label>
                    <Textarea
                      rows={2}
                      placeholder="Policy description..."
                      {...register(
                        `important_guidelines_banner.academic_policies.${pi}.description`,
                      )}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Read More CTA Text</Label>
                    <Input
                      placeholder="e.g. Read More"
                      {...register(
                        `important_guidelines_banner.academic_policies.${pi}.read_more_cta`,
                      )}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Read More Link (optional)</Label>
                    <Input
                      placeholder="https://..."
                      {...register(
                        `important_guidelines_banner.academic_policies.${pi}.read_more_link`,
                      )}
                    />
                    {errors.important_guidelines_banner?.academic_policies?.[pi]
                      ?.read_more_link && (
                      <p className="text-xs text-destructive">
                        {
                          errors.important_guidelines_banner.academic_policies[
                            pi
                          ]?.read_more_link?.message
                        }
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Icon (optional)</Label>
                    <IconPickerField
                      value={watchedPolicies[pi]?.icon || ""}
                      onChange={(iconUrl) =>
                        setValue(
                          `important_guidelines_banner.academic_policies.${pi}.icon`,
                          iconUrl,
                        )
                      }
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteIndex(pi)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={deleteIndex !== null}
        title="Remove Policy"
        description="Remove this academic policy? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteIndex(null)}
        onConfirm={() => {
          if (deleteIndex === null) return;
          policiesArray.remove(deleteIndex);
          setDeleteIndex(null);
        }}
      />
    </div>
  );
}
