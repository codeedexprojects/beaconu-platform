import { Star } from "lucide-react";
import type { PublicCollegeReview } from "@beaconu/types";

interface ReviewsSectionProps {
  reviews: PublicCollegeReview[];
}

function formatReviewDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function ReviewsSection({ reviews }: ReviewsSectionProps) {
  if (reviews.length === 0) return null;

  return (
    <section id="reviews" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
        What Students Say
      </h2>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="rounded-2xl border border-border/60 p-5"
          >
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < review.rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            {review.reviewText ? (
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {review.reviewText}
              </p>
            ) : null}
            <p className="mt-4 text-xs text-muted-foreground/70">
              {review.reviewType === "campus_life"
                ? "Campus Life"
                : "Faculty & Course"}{" "}
              · {formatReviewDate(review.createdAt)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
