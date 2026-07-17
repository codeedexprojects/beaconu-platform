"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Search, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getClubsList } from "@/lib/services/public-course.service";
import type { PublicClubPreview } from "@beaconu/types";

interface ClubsListProps {
  slug: string;
  courseId: string;
  basePath: string;
  initialClubs: PublicClubPreview[];
  initialHasMore: boolean;
}

export function ClubsList({
  slug,
  courseId,
  basePath,
  initialClubs,
  initialHasMore,
}: ClubsListProps) {
  const [clubs, setClubs] = useState(initialClubs);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);

  async function loadMore() {
    setLoading(true);
    try {
      const nextPage = page + 1;
      const result = await getClubsList(slug, courseId, nextPage, 12, search);
      setClubs((prev) => [...prev, ...(result.list ?? [])]);
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
      const result = await getClubsList(slug, courseId, 1, 12, query);
      setClubs(result.list ?? []);
      setPage(1);
      setHasMore(Boolean(result.pagination?.has_next_page));
    } finally {
      setSearching(false);
    }
  }

  return (
    <div>
      <div className="relative w-64">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => runSearch(e.target.value)}
          placeholder="Search clubs"
          className="w-full rounded-full border border-border/60 bg-background py-2 pl-9 pr-4 text-sm outline-none focus:border-foreground/30"
        />
      </div>

      {searching ? (
        <div className="mt-6 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : clubs.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No clubs found.</p>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clubs.map((club) => (
              <Link
                key={club.id}
                href={`${basePath}/${club.id}`}
                className="overflow-hidden rounded-2xl border border-border/60 transition-colors hover:border-foreground/30"
              >
                <div className="relative h-28 w-full bg-muted">
                  {club.cover_image ? (
                    <Image
                      src={club.cover_image}
                      alt={club.name ?? "Club"}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Users className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">
                      {club.name}
                    </p>
                    {club.category ? (
                      <Badge variant="secondary">{club.category}</Badge>
                    ) : null}
                  </div>
                  {club.about?.description ? (
                    <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
                      {club.about.description}
                    </p>
                  ) : null}
                </div>
              </Link>
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
