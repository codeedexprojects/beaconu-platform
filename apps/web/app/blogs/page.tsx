import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { getPublicBlogs } from "@/lib/services/blogs.service";
import { formatDate } from "@/lib/utils";

export const revalidate = 3600;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}): Promise<Metadata> {
  const { page, search } = await searchParams;
  const pageNum = Number(page ?? 1);
  const canonical =
    pageNum > 1
      ? `https://beaconu.com/blogs?page=${pageNum}`
      : "https://beaconu.com/blogs";

  return {
    title: search ? `Search: "${search}" | Blogs | BeaconU` : "Blogs | BeaconU",
    description:
      "Explore stories, guides, and experiences from students across India's top colleges.",
    keywords: [
      "student blogs",
      "college life",
      "India colleges",
      "BeaconU blogs",
    ],
    alternates: { canonical },
    robots: { index: !search, follow: true },
    openGraph: {
      title: "Blogs | BeaconU",
      description:
        "Explore stories, guides, and experiences from students across India's top colleges.",
      url: canonical,
      type: "website",
    },
  };
}

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function BlogsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const search = params.search ?? "";

  const { data: blogs, meta } = await getPublicBlogs({
    page,
    limit: 12,
    search: search || undefined,
  }).catch(() => ({
    data: [],
    meta: { total: 0, page: 1, limit: 12, hasNext: false },
  }));

  return (
    <main className="min-h-screen bg-background">
      {/* BreadcrumbList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://beaconu.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Blogs",
                item: "https://beaconu.com/blogs",
              },
            ],
          }),
        }}
      />
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <h1 className="text-3xl font-bold text-foreground">Blog</h1>
          <p className="mt-1 text-muted-foreground">
            Stories and insights from students across India
          </p>

          {/* Search — server-side full navigation */}
          <form
            action="/blogs"
            className="mt-4 flex items-center gap-2 max-w-md"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Search articles…"
                className="flex h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Search
            </button>
            {search && (
              <Link
                href="/blogs"
                className="inline-flex h-9 items-center rounded-lg border px-3 text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                Clear
              </Link>
            )}
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {blogs.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            {search ? `No results for "${search}"` : "No blogs published yet."}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <Link
                key={blog.id}
                href={`/blogs/${blog.slug}`}
                className="group flex flex-col rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow"
              >
                {blog.coverImageUrl && (
                  <div className="relative h-44 w-full overflow-hidden bg-muted">
                    <Image
                      src={blog.coverImageUrl}
                      alt={blog.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-4">
                  {/* Tags */}
                  {blog.tags.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1">
                      {blog.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <h2 className="font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    {blog.title}
                  </h2>

                  {blog.summary && (
                    <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2 flex-1">
                      {blog.summary}
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium truncate">
                      {blog.authorName}
                    </span>
                    <span>{formatDate(blog.publishedAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {(page > 1 || meta.hasNext) && (
          <div className="mt-10 flex items-center justify-center gap-3">
            {page > 1 && (
              <Link
                href={`/blogs?page=${page - 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                className="inline-flex h-9 items-center rounded-lg border px-4 text-sm font-medium hover:bg-muted transition-colors"
              >
                ← Previous
              </Link>
            )}
            <span className="text-sm text-muted-foreground">Page {page}</span>
            {meta.hasNext && (
              <Link
                href={`/blogs?page=${page + 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                className="inline-flex h-9 items-center rounded-lg border px-4 text-sm font-medium hover:bg-muted transition-colors"
              >
                Next →
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
