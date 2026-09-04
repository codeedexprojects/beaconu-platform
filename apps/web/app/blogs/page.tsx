import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Search, Eye, ArrowRight } from "lucide-react";
import { getPublicBlogs } from "@/lib/services/blogs.server";
import { formatDate } from "@/lib/utils";
import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";
import type { Blog } from "@/lib/services/blogs.service";

export const dynamic = "force-dynamic";

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
    <main className="min-h-screen bg-cream">
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

      <SiteNav />

      <div className="mx-auto max-w-5xl px-4 pb-6 pt-28 md:px-6">
        <div className="mb-8 flex flex-col gap-1">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-landing">
            Stories from campus
          </p>
          <h1 className="font-sans text-3xl font-black tracking-tight text-navy-dark sm:text-4xl">
            BeaconU Blog
          </h1>
        </div>

        {/* Search */}
        <div className="mb-8 flex gap-2.5">
          <form
            action="/blogs"
            method="GET"
            className="flex h-11 flex-1 items-center gap-2 rounded-xl border-[1.5px] border-navy-dark/10 bg-white px-3.5 transition-colors focus-within:border-landing"
          >
            <Search className="shrink-0 text-gray-400" size={16} aria-hidden />
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search articles, topics..."
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent text-sm text-navy-dark outline-none placeholder:text-gray-400"
            />
            {search && (
              <Link
                href="/blogs"
                aria-label="Clear search"
                className="text-gray-400 transition-colors hover:text-navy-dark"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </Link>
            )}
          </form>
          <form action="/blogs" method="GET">
            {search && <input type="hidden" name="search" value={search} />}
            <button
              type="submit"
              aria-label="Search"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-landing transition-all hover:bg-landing-dark active:scale-95"
            >
              <Search size={17} color="white" aria-hidden />
            </button>
          </form>
        </div>
        {search && (
          <div className="-mt-4 mb-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-landing/10 px-3 py-1 text-xs font-medium text-landing">
              {meta.total} result{meta.total !== 1 ? "s" : ""} for &ldquo;
              {search}&rdquo;
            </span>
          </div>
        )}

        {blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-landing/10">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#F46A12"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <p className="text-[17px] font-bold text-navy-dark">
              No blogs found
            </p>
            <p className="max-w-xs text-center text-[13px] text-gray-label">
              {search
                ? `No articles match "${search}". Try a different keyword.`
                : "No blogs have been published yet. Check back soon!"}
            </p>
            {search && (
              <Link
                href="/blogs"
                className="mt-1 flex h-11 items-center rounded-full bg-landing px-6 text-sm font-semibold text-white transition-colors hover:bg-landing-dark"
              >
                Clear search
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        )}

        {(page > 1 || meta.hasNext) && (
          <div className="mt-10 flex items-center justify-center gap-3">
            {page > 1 && (
              <Link
                href={`/blogs?page=${page - 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                className="flex h-11 items-center gap-1.5 rounded-full border-[1.5px] border-navy-dark/10 bg-white px-5 text-sm font-semibold text-navy-dark transition-colors hover:border-landing hover:text-landing"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Previous
              </Link>
            )}
            <span className="px-2 text-[13px] font-medium text-gray-400">
              Page {page}
            </span>
            {meta.hasNext && (
              <Link
                href={`/blogs?page=${page + 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                className="flex h-11 items-center gap-1.5 rounded-full border-[1.5px] border-navy-dark/10 bg-white px-5 text-sm font-semibold text-navy-dark transition-colors hover:border-landing hover:text-landing"
              >
                Next
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        )}
      </div>

      <SiteFooter />
    </main>
  );
}

function BlogCard({ blog }: { blog: Blog }) {
  return (
    <Link
      href={`/blogs/${blog.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-navy-dark/5 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,0,0,0.10)]"
    >
      {/* Cover */}
      {blog.coverImageUrl ? (
        <div className="relative h-44 w-full flex-shrink-0 overflow-hidden bg-gray-100">
          <Image
            src={blog.coverImageUrl}
            alt={blog.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className="flex h-40 w-full flex-shrink-0 items-center justify-center bg-gradient-to-br from-landing/10 to-landing/20">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#F46A12"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.35"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14,2 14,8 20,8" />
          </svg>
        </div>
      )}

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        {/* Author */}
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-landing/10 ring-1 ring-landing/20">
            <span className="text-[10px] font-bold text-landing">
              {blog.authorName?.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold text-navy-dark">
              {blog.authorName}
            </p>
            <p className="text-[10px] text-gray-400">
              {formatDate(blog.publishedAt ?? blog.createdAt)}
            </p>
          </div>
        </div>

        {/* Tags */}
        {blog.tags?.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {blog.tags.slice(0, 2).map((tag: string) => (
              <span
                key={tag}
                className="rounded-full border border-landing/15 bg-landing/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-landing-dark"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h2 className="mb-1.5 line-clamp-2 text-[14px] font-bold leading-snug text-navy-dark transition-colors group-hover:text-landing">
          {blog.title}
        </h2>

        {/* Summary */}
        {blog.summary && (
          <p className="mb-3 line-clamp-2 text-[12px] leading-relaxed text-gray-label">
            {blog.summary}
          </p>
        )}

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between border-t border-navy-dark/5 pt-3">
          <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
            <Eye size={11} aria-hidden />
            {blog.viewCount.toLocaleString()} views
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-landing transition-all group-hover:gap-2">
            Read <ArrowRight size={11} />
          </span>
        </div>
      </div>
    </Link>
  );
}
