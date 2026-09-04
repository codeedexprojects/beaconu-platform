import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Eye, Clock, ArrowLeft } from "lucide-react";
import {
  getPublicBlogBySlug,
  getPublicBlogs,
} from "@/lib/services/blogs.server";
import { formatDate } from "@/lib/utils";
import { SiteNav } from "@/components/landing/site-nav";
import { SiteFooter } from "@/components/landing/site-footer";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const result = await getPublicBlogs({ limit: 1000 });
    return result.data.map((blog) => ({ slug: blog.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const blog = await getPublicBlogBySlug(slug);
    const url = `https://beaconu.com/blogs/${blog.slug}`;
    return {
      title: `${blog.title} | BeaconU`,
      description: blog.summary ?? undefined,
      keywords: blog.tags.length > 0 ? blog.tags : undefined,
      alternates: { canonical: url },
      robots: { index: true, follow: true },
      openGraph: {
        title: blog.title,
        description: blog.summary ?? undefined,
        url,
        siteName: "BeaconU",
        type: "article",
        publishedTime: blog.publishedAt ?? undefined,
        modifiedTime: blog.updatedAt,
        authors: [blog.authorName],
        tags: blog.tags,
        images: blog.coverImageUrl
          ? [{ url: blog.coverImageUrl, alt: blog.title }]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title: blog.title,
        description: blog.summary ?? undefined,
        images: blog.coverImageUrl ? [blog.coverImageUrl] : [],
      },
    };
  } catch {
    return { title: "Blog | BeaconU" };
  }
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;

  let blog;
  try {
    blog = await getPublicBlogBySlug(slug);
  } catch {
    notFound();
  }

  const wordCount = blog.content.split(/\s+/).length;
  const readingMins = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <main className="min-h-screen bg-cream">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://beaconu.com/blogs/${blog.slug}`,
            },
            url: `https://beaconu.com/blogs/${blog.slug}`,
            headline: blog.title,
            description: blog.summary ?? "",
            keywords: blog.tags.join(", "),
            wordCount,
            author: { "@type": "Person", name: blog.authorName },
            datePublished: blog.publishedAt,
            dateModified: blog.updatedAt,
            image: blog.coverImageUrl
              ? {
                  "@type": "ImageObject",
                  url: blog.coverImageUrl,
                  caption: blog.title,
                }
              : undefined,
            publisher: {
              "@type": "Organization",
              name: "BeaconU",
              url: "https://beaconu.com",
            },
          }),
        }}
      />

      <SiteNav />

      <div className="mx-auto max-w-3xl px-4 pb-16 pt-28 md:px-6">
        <Link
          href="/blogs"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-label transition-colors hover:text-landing"
        >
          <ArrowLeft size={15} aria-hidden />
          All Blogs
        </Link>

        <article>
          {/* Cover image */}
          {blog.coverImageUrl ? (
            <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-gray-100 md:h-80">
              <Image
                src={blog.coverImageUrl}
                alt={blog.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          ) : (
            <div className="flex h-48 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-landing/10 to-landing/20">
              <svg
                width="52"
                height="52"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#F46A12"
                strokeWidth="1.4"
                opacity="0.35"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
              </svg>
            </div>
          )}

          <div className="pt-7">
            {/* Tags */}
            {blog.tags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-1.5">
                {blog.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full border border-landing/15 bg-landing/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-landing-dark"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="mb-3 font-sans text-[26px] font-black leading-tight tracking-tight text-navy-dark md:text-[32px]">
              {blog.title}
            </h1>

            {/* Summary */}
            {blog.summary && (
              <p className="mb-5 border-l-2 border-landing/30 pl-4 text-[15px] leading-relaxed text-gray-label">
                {blog.summary}
              </p>
            )}

            {/* Author meta strip */}
            <div className="mb-7 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-landing/10 ring-1 ring-landing/20">
                <span className="text-[13px] font-bold text-landing">
                  {blog.authorName?.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold text-navy-dark">
                  {blog.authorName}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                  {blog.publishedAt && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                      <Calendar size={11} aria-hidden />
                      {formatDate(blog.publishedAt)}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                    <Eye size={11} aria-hidden />
                    {blog.viewCount.toLocaleString()} views
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                    <Clock size={11} aria-hidden />
                    {readingMins} min read
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-7 border-t border-navy-dark/5" />

            {/* Content body */}
            <div className="space-y-5">
              {blog.content.split("\n").map((paragraph: string, i: number) =>
                paragraph.trim() ? (
                  <p
                    key={i}
                    className="text-[15px] leading-[1.8] text-navy-dark/80"
                  >
                    {paragraph}
                  </p>
                ) : null,
              )}
            </div>
          </div>
        </article>
      </div>

      <SiteFooter />
    </main>
  );
}
