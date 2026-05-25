import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Eye } from "lucide-react";
import {
  getPublicBlogBySlug,
  getPublicBlogs,
} from "@/lib/services/blogs.server";
import { formatDate } from "@/lib/utils";
import { BlogHeader } from "@/components/blogs/BlogHeader";

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
    <main className="min-h-screen bg-[#F3F4F6]">
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

      <BlogHeader backHref="/blogs" backLabel="All blogs" title="All Blogs" />

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
        <article className="max-w-2xl mx-auto bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
          {/* Cover image */}
          {blog.coverImageUrl ? (
            <div className="relative h-64 md:h-80 w-full bg-gray-100">
              <Image
                src={blog.coverImageUrl}
                alt={blog.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            </div>
          ) : (
            <div className="h-48 w-full bg-gradient-to-br from-[#FEF0EB] to-[#FDE8D8] flex items-center justify-center">
              <svg
                width="52"
                height="52"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#E8521A"
                strokeWidth="1.4"
                opacity="0.35"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
              </svg>
            </div>
          )}

          <div className="p-5 md:p-8">
            {/* Tags */}
            {blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {blog.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF0EB] text-[#C04010] border border-[#E8521A]/15 uppercase tracking-wide"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-[24px] md:text-[28px] font-bold text-gray-900 leading-tight tracking-tight mb-3">
              {blog.title}
            </h1>

            {/* Summary */}
            {blog.summary && (
              <p className="text-[15px] text-gray-500 leading-relaxed mb-5 border-l-2 border-[#E8521A]/30 pl-4">
                {blog.summary}
              </p>
            )}

            {/* Author meta strip */}
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 mb-7">
              <div className="w-11 h-11 rounded-full bg-[#FEF0EB] border-2 border-white ring-1 ring-[#E8521A]/20 flex items-center justify-center shrink-0">
                <span className="text-[13px] font-bold text-[#E8521A]">
                  {blog.authorName?.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-gray-900 truncate">
                  {blog.authorName}
                </p>
                <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
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
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12,6 12,12 16,14" />
                    </svg>
                    {readingMins} min read
                  </span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 mb-7" />

            {/* Content body */}
            <div className="space-y-5">
              {blog.content.split("\n").map((paragraph: string, i: number) =>
                paragraph.trim() ? (
                  <p
                    key={i}
                    className="text-[15px] text-gray-700 leading-[1.8]"
                  >
                    {paragraph}
                  </p>
                ) : null,
              )}
            </div>
          </div>
        </article>

        {/* Back CTA */}
        <Link
          href="/blogs"
          className="max-w-2xl mx-auto mt-5 w-full h-12 rounded-2xl bg-[#E8521A] hover:bg-[#D04718] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-white text-[14px] font-semibold"
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
          Back to All Blogs
        </Link>
      </div>
    </main>
  );
}
