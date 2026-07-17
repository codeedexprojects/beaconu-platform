"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOtherCoursesOffered } from "@/lib/services/public-course.service";
import type { PublicOtherCoursesGroup } from "@beaconu/types";

interface OtherCoursesOfferedSectionProps {
  slug: string;
  courseId: string;
  initialGroups: PublicOtherCoursesGroup[];
  initialHasMore: boolean;
}

export function OtherCoursesOfferedSection({
  slug,
  courseId,
  initialGroups,
  initialHasMore,
}: OtherCoursesOfferedSectionProps) {
  const [groups, setGroups] = useState(initialGroups);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);

  async function loadMore() {
    setLoading(true);
    try {
      const nextPage = page + 1;
      const result = await getOtherCoursesOffered(
        slug,
        courseId,
        nextPage,
        10,
        search,
      );
      setGroups((prev) => [...prev, ...(result.list ?? [])]);
      setPage(nextPage);
      setHasMore(Boolean(result.pagination?.has_next_page));
    } finally {
      setLoading(false);
    }
  }

  async function runSearch(query: string) {
    setSearch(query);
    setSearching(true);
    try {
      const result = await getOtherCoursesOffered(slug, courseId, 1, 10, query);
      setGroups(result.list ?? []);
      setPage(1);
      setHasMore(Boolean(result.pagination?.has_next_page));
    } finally {
      setSearching(false);
    }
  }

  const hasContent = groups.some((g) => (g.courses?.length ?? 0) > 0);

  if (!hasContent && !search) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center text-sm text-muted-foreground sm:px-6">
        No other courses are listed for this college yet.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold tracking-tight">
          Other Courses Offered
        </h2>
        <div className="relative w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => runSearch(e.target.value)}
            placeholder="Search courses"
            className="w-full rounded-full border border-border/60 bg-background py-2 pl-9 pr-4 text-sm outline-none focus:border-foreground/30"
          />
        </div>
      </div>

      {searching ? (
        <div className="mt-6 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-6">
            {groups.map((group, i) => (
              <div key={group.studyLevel?.id ?? i}>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {group.studyLevel?.name}
                </p>
                <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {group.courses?.map((course) => (
                    <Link
                      key={course.id}
                      href={`/college/${slug}/courses/${course.id}`}
                      className="rounded-xl border border-border/60 p-4 transition-colors hover:border-foreground/30"
                    >
                      <p className="text-sm font-medium">{course.name}</p>
                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{course.duration}</span>
                        {course.fee ? (
                          <span className="font-medium text-foreground">
                            {course.fee}
                          </span>
                        ) : null}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {hasMore ? (
            <div className="mt-6 flex justify-center">
              <Button variant="outline" onClick={loadMore} disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Load more
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
