import { Star } from "lucide-react";
import type { PublicHostelReviews } from "@beaconu/types";

interface HostelReviewsSectionProps {
  reviews: PublicHostelReviews;
}

export function HostelReviewsSection({ reviews }: HostelReviewsSectionProps) {
  const items = reviews.items ?? [];
  if (items.length === 0) return null;

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold tracking-tight">
          {reviews.title || "Reviews & Ratings"}
        </h2>
        {reviews.summary ? (
          <span className="flex items-center gap-1.5 text-sm">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-medium">{reviews.summary.average}</span>
            <span className="text-muted-foreground">
              {reviews.summary.total_reviews_label}
            </span>
          </span>
        ) : null}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((review) => (
          <div
            key={review.id}
            className="rounded-2xl border border-border/60 p-4"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                {review.reviewer_initials}
              </span>
              <div>
                <p className="text-sm font-medium">{review.reviewer_name}</p>
                <p className="text-xs text-muted-foreground">{review.posted}</p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={
                    i < (review.rating ?? 0)
                      ? "h-3.5 w-3.5 fill-amber-400 text-amber-400"
                      : "h-3.5 w-3.5 text-muted-foreground/30"
                  }
                />
              ))}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {review.comment}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
