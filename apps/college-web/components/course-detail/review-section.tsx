import Image from "next/image";
import { Star } from "lucide-react";
import { ReviewsList } from "@/components/course-detail/reviews-list";
import type { PublicReviewTab } from "@beaconu/types";

interface ReviewSectionProps {
  review: PublicReviewTab;
  slug: string;
  courseId: string;
}

export function ReviewSection({ review, slug, courseId }: ReviewSectionProps) {
  const breakdown = review.rating_breakdown?.items ?? [];
  const categories = review.category_ratings?.items ?? [];
  const recentReviews = review.recent_reviews?.items ?? [];

  const hasContent =
    Boolean(review.overall_rating) ||
    categories.length > 0 ||
    recentReviews.length > 0;

  if (!hasContent) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-muted-foreground sm:px-6">
        Reviews aren&apos;t available yet.
      </div>
    );
  }

  const maxCount = Math.max(...breakdown.map((b) => b.count ?? 0), 1);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {review.overall_rating ? (
          <div className="rounded-2xl border border-border/60 p-5">
            <p className="flex items-center gap-1 text-3xl font-bold tracking-tight">
              {review.overall_rating.average?.toFixed(1)}
              <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {review.overall_rating.total_reviews?.toLocaleString()} reviews
            </p>
          </div>
        ) : null}

        {breakdown.length > 0 ? (
          <div className="rounded-2xl border border-border/60 p-5 sm:col-span-1">
            <div className="space-y-1.5">
              {breakdown.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="w-6 shrink-0">{item.emoji}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-foreground"
                      style={{
                        width: `${((item.count ?? 0) / maxCount) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-xs text-muted-foreground">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {categories.length > 0 ? (
          <div className="rounded-2xl border border-border/60 p-5">
            <div className="space-y-2">
              {categories.map((cat, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="flex items-center gap-2">
                    {cat.icon ? (
                      <Image
                        src={cat.icon}
                        alt={cat.label ?? ""}
                        width={16}
                        height={16}
                        className="h-4 w-4 shrink-0 object-contain"
                      />
                    ) : null}
                    {cat.label}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    {cat.rating}
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {recentReviews.length > 0 ? (
        <div className="mt-10">
          <h2 className="text-xl font-bold tracking-tight">
            {review.recent_reviews?.title || "Reviews"}
          </h2>
          <div className="mt-5">
            <ReviewsList
              slug={slug}
              courseId={courseId}
              initialReviews={recentReviews}
              initialHasMore={Boolean(review.has_more)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
