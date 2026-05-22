import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Search, LogIn, LayoutDashboard, Eye, ArrowRight } from "lucide-react";
import { cookies } from "next/headers";
import { getPublicBlogs } from "@/lib/services/blogs.service";
import { formatDate } from "@/lib/utils";
import { BLOG_TOKEN_KEY } from "@/lib/constants";
import { BlogHeader } from "@/components/blogs/BlogHeader";
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

  const cookieStore = await cookies();
  const isLoggedIn = !!cookieStore.get(BLOG_TOKEN_KEY)?.value;

  const { data: blogs, meta } = await getPublicBlogs({
    page,
    limit: 12,
    search: search || undefined,
  }).catch(() => ({
    data: [],
    meta: { total: 0, page: 1, limit: 12, hasNext: false },
  }));

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
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

      <BlogHeader
        backHref="/home"
        backLabel="Home"
        title="Student Blogs"
        rightAction={
          isLoggedIn ? (
            <Link
              href="/my/blogs"
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-[#FEF0EB] text-[#E8521A] text-[13px] font-semibold hover:bg-[#FDDFD1] transition-colors"
            >
              <LayoutDashboard size={14} aria-hidden />
              My Blogs
            </Link>
          ) : (
            <Link
              href="/blog-login"
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full border-[1.5px] border-gray-200 text-gray-600 text-[13px] font-semibold hover:border-[#E8521A] hover:text-[#E8521A] transition-colors"
            >
              <LogIn size={14} aria-hidden />
              Login
            </Link>
          )
        }
      >
        {/* Search */}
        <div className="flex gap-2.5 pb-3">
          <form
            action="/blogs"
            method="GET"
            className="flex-1 flex items-center gap-2 h-10 bg-gray-50 border-[1.5px] border-gray-200 rounded-xl px-3.5 focus-within:border-[#E8521A] transition-colors"
          >
            <Search className="shrink-0 text-gray-400" size={15} aria-hidden />
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search articles, topics..."
              autoComplete="off"
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none min-w-0"
            />
            {search && (
              <Link
                href="/blogs"
                aria-label="Clear search"
                className="text-gray-400 hover:text-gray-600 transition-colors"
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
              className="w-10 h-10 rounded-xl bg-[#E8521A] hover:bg-[#D04718] active:scale-95 transition-all flex items-center justify-center shrink-0"
            >
              <Search size={16} color="white" aria-hidden />
            </button>
          </form>
        </div>
        {search && (
          <div className="pb-2.5">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#E8521A] bg-[#FEF0EB] px-3 py-1 rounded-full">
              {meta.total} result{meta.total !== 1 ? "s" : ""} for &ldquo;
              {search}&rdquo;
            </span>
          </div>
        )}
      </BlogHeader>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
        {blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#FEF0EB] flex items-center justify-center">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#E8521A"
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
            <p className="text-[17px] font-bold text-gray-900">
              No blogs found
            </p>
            <p className="text-[13px] text-gray-500 text-center max-w-xs">
              {search
                ? `No articles match "${search}". Try a different keyword.`
                : "No blogs have been published yet. Check back soon!"}
            </p>
            {search && (
              <Link
                href="/blogs"
                className="mt-1 h-11 px-6 rounded-full bg-[#E8521A] hover:bg-[#D04718] text-white text-sm font-semibold flex items-center transition-colors"
              >
                Clear search
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
                className="h-11 px-5 rounded-full border-[1.5px] border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-[#E8521A] hover:text-[#E8521A] transition-colors flex items-center gap-1.5"
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
            <span className="text-[13px] font-medium text-gray-400 px-2">
              Page {page}
            </span>
            {meta.hasNext && (
              <Link
                href={`/blogs?page=${page + 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                className="h-11 px-5 rounded-full border-[1.5px] border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-[#E8521A] hover:text-[#E8521A] transition-colors flex items-center gap-1.5"
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
    </main>
  );
}

function BlogCard({ blog }: { blog: Blog }) {
  return (
    <Link
      href={`/blogs/${blog.slug}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Cover */}
      {blog.coverImageUrl ? (
        <div className="relative h-44 w-full flex-shrink-0 overflow-hidden bg-gray-100">
          <Image
            src={blog.coverImageUrl}
            alt={blog.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className="h-40 w-full flex-shrink-0 bg-gradient-to-br from-[#FEF0EB] to-[#FDE8D8] flex items-center justify-center">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#E8521A"
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
      <div className="flex-1 flex flex-col p-4">
        {/* Author */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-[#FEF0EB] ring-1 ring-[#E8521A]/20 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-[#E8521A]">
              {blog.authorName?.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-gray-700 truncate">
              {blog.authorName}
            </p>
            <p className="text-[10px] text-gray-400">
              {formatDate(blog.publishedAt ?? blog.createdAt)}
            </p>
          </div>
        </div>

        {/* Tags */}
        {blog.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {blog.tags.slice(0, 2).map((tag: string) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#FEF0EB] text-[#C04010] border border-[#E8521A]/15 uppercase tracking-wide"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h2 className="text-[14px] font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-[#E8521A] transition-colors mb-1.5">
          {blog.title}
        </h2>

        {/* Summary */}
        {blog.summary && (
          <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2 mb-3">
            {blog.summary}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
            <Eye size={11} aria-hidden />
            {blog.viewCount.toLocaleString()} views
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#E8521A] group-hover:gap-2 transition-all">
            Read <ArrowRight size={11} />
          </span>
        </div>
      </div>
    </Link>
  );
}
