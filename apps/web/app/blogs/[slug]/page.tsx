import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Eye, User } from "lucide-react";
import {
  getPublicBlogBySlug,
  getPublicBlogs,
} from "@/lib/services/blogs.service";
import { formatDate } from "@/lib/utils";

export const revalidate = 3600;

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

  return (
    <main className="min-h-screen bg-background">
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
            wordCount: blog.content.split(/\s+/).length,
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

      {/* Cover image */}
      {blog.coverImageUrl && (
        <div className="relative h-64 w-full sm:h-80 bg-muted">
          <Image
            src={blog.coverImageUrl}
            alt={blog.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        </div>
      )}

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All Blogs
        </Link>

        {/* Tags */}
        {blog.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
          {blog.title}
        </h1>

        {blog.summary && (
          <p className="mt-3 text-lg text-muted-foreground">{blog.summary}</p>
        )}

        {/* Meta */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-b pb-4">
          <span className="inline-flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            {blog.authorName}
          </span>
          {blog.publishedAt && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(blog.publishedAt)}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            {blog.viewCount} views
          </span>
        </div>

        {/* Content */}
        <div className="mt-8 prose prose-slate max-w-none">
          {blog.content.split("\n").map((paragraph, i) =>
            paragraph.trim() ? (
              <p key={i} className="mb-4 text-foreground/90 leading-relaxed">
                {paragraph}
              </p>
            ) : null,
          )}
        </div>
      </div>
    </main>
  );
}
