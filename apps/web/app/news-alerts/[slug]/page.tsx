import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar } from "lucide-react";
import {
  getPublishedNewsAlertBySlug,
  getPublishedNewsAlerts,
} from "@/lib/services/news-alerts.service";
import { formatDate } from "@/lib/utils";
import { BlogHeader } from "@/components/blogs/BlogHeader";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const result = await getPublishedNewsAlerts({ limit: 1000 });
    return result.data.map((alert) => ({ slug: alert.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const alert = await getPublishedNewsAlertBySlug(slug);
    return {
      title: `${alert.title} | BeaconU`,
      description: alert.summary ?? undefined,
      robots: { index: true, follow: true },
    };
  } catch {
    return { title: "News Alert | BeaconU" };
  }
}

export default async function NewsAlertDetailPage({ params }: Props) {
  const { slug } = await params;

  let alert;
  try {
    alert = await getPublishedNewsAlertBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#F3F4F6]">
      <BlogHeader backHref="/news-alerts" backLabel="News & Alerts" title={alert.category.charAt(0).toUpperCase() + alert.category.slice(1)} />

      <article className="max-w-2xl mx-auto px-4 py-6">
        {alert.coverImageUrl && (
          <div className="relative h-52 w-full overflow-hidden rounded-2xl bg-gray-100 mb-5">
            <Image
              src={alert.coverImageUrl}
              alt={alert.title}
              fill
              className="object-cover"
              sizes="(max-width: 672px) 100vw, 672px"
              priority
            />
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize bg-[#FEF0EB] text-[#E8521A] mb-3">
            {alert.category}
          </span>

          <h1 className="text-[20px] font-bold text-gray-900 leading-snug mb-3">
            {alert.title}
          </h1>

          <div className="flex items-center gap-1.5 text-[12px] text-gray-400 mb-5">
            <Calendar size={12} />
            <span>{formatDate(alert.publishedAt ?? alert.createdAt)}</span>
          </div>

          {alert.summary && (
            <p className="text-[14px] text-gray-600 font-medium leading-relaxed mb-5 pb-5 border-b border-gray-100">
              {alert.summary}
            </p>
          )}

          <div className="prose prose-sm max-w-none text-gray-700 text-[14px] leading-relaxed whitespace-pre-wrap">
            {alert.content}
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/news-alerts"
            className="inline-flex items-center gap-1.5 h-11 px-6 rounded-full border-[1.5px] border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-[#E8521A] hover:text-[#E8521A] transition-colors"
          >
            ← Back to News & Alerts
          </Link>
        </div>
      </article>
    </main>
  );
}
