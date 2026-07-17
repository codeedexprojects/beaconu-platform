"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, Star, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCourseReviewsPage } from "@/lib/services/public-course.service";
import type { PublicCourseReviewItem } from "@beaconu/types";

interface ReviewsListProps {
  slug: string;
  courseId: string;
  initialReviews: PublicCourseReviewItem[];
  initialHasMore: boolean;
}

function formatReviewDate(date?: string): string {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "numeric",
  }).format(parsed);
}

export function ReviewsList({
  slug,
  courseId,
  initialReviews,
  initialHasMore,
}: ReviewsListProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    setLoading(true);
    try {
      const nextPage = page + 1;
      const result = await getCourseReviewsPage(slug, courseId, nextPage);
      setReviews((prev) => [...prev, ...(result.reviews ?? [])]);
      setPage(nextPage);
      setHasMore(Boolean(result.pagination?.has_next_page));
    } finally {
      setLoading(false);
    }
  }

  if (reviews.length === 0) return null;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review, i) => (
          <div
            key={review.id ?? i}
            className="rounded-2xl border border-border/60 p-5"
          >
            <div className="flex items-center gap-2.5">
              {review.reviewer_avatar ? (
                <Image
                  src={review.reviewer_avatar}
                  alt={review.reviewer_name ?? "Reviewer"}
                  width={32}
                  height={32}
                  className="h-8 w-8 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" />
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {review.reviewer_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatReviewDate(review.date)}
                </p>
              </div>
            </div>
            <div className="mt-2.5 flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, starIndex) => {
                const rating = review.rating ?? 0;
                const filled = starIndex + 1 <= Math.round(rating);
                return (
                  <Star
                    key={starIndex}
                    className={
                      filled
                        ? "h-3.5 w-3.5 fill-amber-400 text-amber-400"
                        : "h-3.5 w-3.5 text-muted-foreground/30"
                    }
                  />
                );
              })}
            </div>
            <p className="mt-2.5 text-sm text-muted-foreground">
              {review.comment}
            </p>
          </div>
        ))}
      </div>

      {hasMore ? (
        <div className="mt-6 flex justify-center">
          <Button variant="outline" onClick={loadMore} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Load more
          </Button>
        </div>
      ) : null}
    </div>
  );
}
