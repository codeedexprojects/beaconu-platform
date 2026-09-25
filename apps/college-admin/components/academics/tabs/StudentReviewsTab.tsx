"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import * as z from "zod";
import { MessageSquare, Plus, Shapes, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

// Fixed emoji buckets, best to worst — matches the public rating breakdown bars.
const RATING_EMOJIS = ["😍", "😄", "🙂", "😐", "😠"] as const;

const ratingField = (label: string) =>
  z.coerce
    .number()
    .min(1, `${label} must be between 1 and 5`)
    .max(5, `${label} must be between 1 and 5`)
    .optional()
    .or(z.literal(""));

const countField = z.coerce
  .number()
  .min(0, "Cannot be negative")
  .optional()
  .or(z.literal(""));

const studentReviewsTabSchema = z.object({
  overallRating: z.object({
    rating: ratingField("Rating"),
    totalReviews: countField,
  }),
  ratingDistribution: z.array(
    z.object({
      emoji: z.string(),
      count: countField,
    }),
  ),
  categoryRatings: z
    .array(
      z.object({
        label: z.string().min(1, "Category name is required"),
        icon: z.string().optional(),
        rating: ratingField("Rating"),
      }),
    )
    .optional(),
  reviews: z
    .array(
      z.object({
        id: z.string().optional(),
        reviewer_name: z.string().optional(),
        date: z.string().optional(),
        rating: ratingField("Rating"),
        comment: z.string().min(1, "Review text is required"),
      }),
    )
    .optional(),
});

type StudentReviewsTabData = z.infer<typeof studentReviewsTabSchema>;

// Older payloads stored `overallRating` as a bare number, and may lack the
// fixed emoji buckets — normalise so the form always has the full shape.
function buildDefaults(payload: any): StudentReviewsTabData {
  const overall =
    payload?.overallRating && typeof payload.overallRating === "object"
      ? payload.overallRating
      : { rating: payload?.overallRating ?? "" };
  const saved: any[] = Array.isArray(payload?.ratingDistribution)
    ? payload.ratingDistribution
    : [];

  return {
    overallRating: {
      rating: overall.rating ?? "",
      totalReviews: overall.totalReviews ?? "",
    },
    ratingDistribution: RATING_EMOJIS.map((emoji) => ({
      emoji,
      count: saved.find((s) => s?.emoji === emoji)?.count ?? "",
    })),
    categoryRatings: payload?.categoryRatings ?? [],
    reviews: payload?.reviews ?? [],
  };
}

// Blocks the "Add" button while the last item's required field is empty.
function isLastItemIncomplete(items: any[], ...fields: string[]): boolean {
  if (!items || items.length === 0) return false;
  const last = items[items.length - 1];
  return fields.some((f) => !String(last?.[f] ?? "").trim());
}

function ReviewsEmptyState({
  label,
  icon: Icon,
}: {
  label: string;
  icon: typeof Shapes;
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

export function StudentReviewsTab({
  payload,
  onChange,
}: {
  payload: any;
  onChange: (updates: any) => void;
}) {
  const [deleteCategoryIdx, setDeleteCategoryIdx] = useState<number | null>(
    null,
  );
  const [deleteReviewIdx, setDeleteReviewIdx] = useState<number | null>(null);

  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<StudentReviewsTabData>({
    resolver: zodResolver(studentReviewsTabSchema as any),
    defaultValues: buildDefaults(payload),
  });

  const ratingDistribution = useFieldArray({
    control: control as any,
    name: "ratingDistribution",
  });
  const categoriesArray = useFieldArray({
    control: control as any,
    name: "categoryRatings",
  });
  const reviewsArray = useFieldArray({
    control: control as any,
    name: "reviews",
  });

  const watchedCategories = watch("categoryRatings") || [];
  const watchedReviews = watch("reviews") || [];

  useEffect(() => {
    const subscription = watch((value) => onChange(value));
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="block font-bold">Overall Rating</Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              Average rating (1-5)
            </Label>
            <Input
              type="number"
              step="0.1"
              min={1}
              max={5}
              placeholder="e.g. 4.5"
              {...register("overallRating.rating")}
            />
            {errors.overallRating?.rating && (
              <p className="text-xs text-destructive">
                {errors.overallRating.rating.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">
              Total reviews
            </Label>
            <Input
              type="number"
              min={0}
              placeholder="e.g. 2909"
              {...register("overallRating.totalReviews")}
            />
            {errors.overallRating?.totalReviews && (
              <p className="text-xs text-destructive">
                {errors.overallRating.totalReviews.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="block font-bold">Rating Breakdown</Label>
        <p className="text-xs text-muted-foreground">
          Number of reviews in each satisfaction bucket, best to worst.
        </p>
        <div className="space-y-2">
          {ratingDistribution.fields.map((field, idx) => (
            <div key={field.id} className="flex items-center gap-3">
              <span className="w-8 text-center text-xl">
                {RATING_EMOJIS[idx]}
              </span>
              <input
                type="hidden"
                {...register(`ratingDistribution.${idx}.emoji`)}
              />
              <Input
                type="number"
                min={0}
                placeholder="Count"
                {...register(`ratingDistribution.${idx}.count`)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="block font-bold">Category Ratings</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedCategories, "label")}
            title={
              isLastItemIncomplete(watchedCategories, "label")
                ? "Fill in the previous entry before adding another"
                : undefined
            }
            onClick={() =>
              categoriesArray.append({ label: "", icon: "", rating: "" })
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add Category
          </Button>
        </div>
        {categoriesArray.fields.length === 0 ? (
          <ReviewsEmptyState label="categories" icon={Shapes} />
        ) : (
          categoriesArray.fields.map((field, idx) => (
            <div
              key={field.id}
              className="space-y-2 border p-4 rounded-lg bg-muted/10"
            >
              <div className="flex gap-2 items-start">
                <div className="flex-1 space-y-1">
                  <Input
                    placeholder="Category (e.g. Faculty & Course)"
                    {...register(`categoryRatings.${idx}.label`)}
                  />
                  {errors.categoryRatings?.[idx]?.label && (
                    <p className="text-xs text-destructive">
                      {errors.categoryRatings[idx]?.label?.message}
                    </p>
                  )}
                </div>
                <div className="w-28 space-y-1">
                  <Input
                    type="number"
                    step="0.1"
                    min={1}
                    max={5}
                    placeholder="Rating"
                    {...register(`categoryRatings.${idx}.rating`)}
                  />
                  {errors.categoryRatings?.[idx]?.rating && (
                    <p className="text-xs text-destructive">
                      {errors.categoryRatings[idx]?.rating?.message}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteCategoryIdx(idx)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Icon (shown above the category name)
                </Label>
                <ImageUpload
                  value={watch(`categoryRatings.${idx}.icon`) || ""}
                  onChange={(url) =>
                    setValue(`categoryRatings.${idx}.icon`, url)
                  }
                  context={`student-reviews/category-icon-${idx}`}
                />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="block font-bold">Reviews</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLastItemIncomplete(watchedReviews, "comment")}
            title={
              isLastItemIncomplete(watchedReviews, "comment")
                ? "Fill in the previous entry before adding another"
                : undefined
            }
            onClick={() =>
              reviewsArray.append({
                id: "",
                reviewer_name: "",
                date: "",
                rating: "",
                comment: "",
              })
            }
          >
            <Plus className="h-4 w-4 mr-1" /> Add Review
          </Button>
        </div>
        {reviewsArray.fields.length === 0 ? (
          <ReviewsEmptyState label="reviews" icon={MessageSquare} />
        ) : (
          reviewsArray.fields.map((field, idx) => (
            <div
              key={field.id}
              className="space-y-2 border p-4 rounded-lg bg-muted/10"
            >
              <div className="grid grid-cols-[2fr_1.5fr_1fr_auto] gap-2 items-start">
                <Input
                  placeholder="Reviewer name (blank = Anonymous)"
                  {...register(`reviews.${idx}.reviewer_name`)}
                />
                <Input type="date" {...register(`reviews.${idx}.date`)} />
                <div className="space-y-1">
                  <Input
                    type="number"
                    step="0.5"
                    min={1}
                    max={5}
                    placeholder="Rating"
                    {...register(`reviews.${idx}.rating`)}
                  />
                  {errors.reviews?.[idx]?.rating && (
                    <p className="text-xs text-destructive">
                      {errors.reviews[idx]?.rating?.message}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteReviewIdx(idx)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <div className="space-y-1">
                <Textarea
                  placeholder="Review text..."
                  {...register(`reviews.${idx}.comment`)}
                />
                {errors.reviews?.[idx]?.comment && (
                  <p className="text-xs text-destructive">
                    {errors.reviews[idx]?.comment?.message}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={deleteCategoryIdx !== null}
        title="Remove Category"
        description="Remove this category rating? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteCategoryIdx(null)}
        onConfirm={() => {
          if (deleteCategoryIdx === null) return;
          categoriesArray.remove(deleteCategoryIdx);
          setDeleteCategoryIdx(null);
        }}
      />

      <ConfirmDialog
        open={deleteReviewIdx !== null}
        title="Remove Review"
        description="Remove this review? This cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        onCancel={() => setDeleteReviewIdx(null)}
        onConfirm={() => {
          if (deleteReviewIdx === null) return;
          reviewsArray.remove(deleteReviewIdx);
          setDeleteReviewIdx(null);
        }}
      />
    </div>
  );
}
