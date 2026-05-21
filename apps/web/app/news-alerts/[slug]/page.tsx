import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, ExternalLink } from "lucide-react";
import {
  getPublishedNewsAlertBySlug,
  getPublishedNewsAlerts,
} from "@/lib/services/news-alerts.service";
import { formatDate } from "@/lib/utils";

export const revalidate = 60;

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
    const tags = Array.isArray(alert.tags) ? alert.tags : [];
    return {
      title: `${alert.title} | BeaconU`,
      description: alert.summary ?? undefined,
      keywords: tags.length > 0 ? tags : undefined,
      robots: { index: true, follow: true },
      openGraph: {
        title: alert.title,
        description: alert.summary ?? undefined,
        images: alert.coverImageUrl
          ? [{ url: alert.coverImageUrl, alt: alert.title }]
          : [],
      },
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

  const tags = Array.isArray(alert.tags) ? alert.tags : [];

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      {/* Back nav */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 md:px-6 h-14 flex items-center gap-3">
          <Link
            href="/news-alerts"
            className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#E8521A] hover:text-[#E8521A] hover:bg-[#FEF0EB] transition-colors shrink-0"
            aria-label="Back to news"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-[14px] font-semibold text-gray-700">
            News & Alerts
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-5">
        <article className="max-w-2xl mx-auto">
          {/* Cover image */}
          {alert.coverImageUrl ? (
            <div className="relative h-52 md:h-72 w-full overflow-hidden rounded-2xl bg-gray-900 mb-5">
              <Image
                src={alert.coverImageUrl}
                alt={alert.title}
                fill
                className="object-cover opacity-80"
                sizes="(max-width: 672px) 100vw, 672px"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                <h1 className="text-[18px] md:text-[22px] font-bold text-white leading-snug">
                  {alert.title}
                </h1>
              </div>
            </div>
          ) : (
            <div className="w-full rounded-2xl mb-5 overflow-hidden">
              <div className="h-28 flex items-end p-4 bg-[#FEF0EB]">
                <h1 className="text-[20px] md:text-[24px] font-bold text-gray-900 leading-snug">
                  {alert.title}
                </h1>
              </div>
            </div>
          )}

          {/* Meta card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
            {alert.coverImageUrl && (
              <div className="px-5 pt-5 pb-0">
                <h1 className="text-[20px] md:text-[24px] font-bold text-gray-900 leading-tight">
                  {alert.title}
                </h1>
              </div>
            )}

            <div className="px-5 py-4 flex flex-wrap items-center gap-3 border-b border-gray-50">
              <div className="flex items-center gap-1.5 text-[12px] text-gray-400">
                <Calendar size={13} />
                <span>{formatDate(alert.publishedAt ?? alert.createdAt)}</span>
              </div>
              {alert.source && (
                <div className="flex items-center gap-1 text-[12px] text-gray-500">
                  <ExternalLink size={12} />
                  <span className="font-medium">{alert.source}</span>
                </div>
              )}
            </div>

            {tags.length > 0 && (
              <div className="px-5 py-3 flex flex-wrap gap-1.5 border-b border-gray-50">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[12px] text-[#E8521A] font-semibold"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {alert.summary && (
              <div className="px-5 py-4 border-b border-gray-50">
                <p className="text-[14px] text-gray-600 font-medium leading-relaxed">
                  {alert.summary}
                </p>
              </div>
            )}

            <div className="px-5 py-5 space-y-4">
              {alert.content.split("\n").map((paragraph, i) =>
                paragraph.trim() ? (
                  <p
                    key={i}
                    className="text-[14px] text-gray-700 leading-[1.85]"
                  >
                    {paragraph}
                  </p>
                ) : null,
              )}
            </div>
          </div>

          <Link
            href="/news-alerts"
            className="mt-5 w-full h-12 rounded-2xl bg-[#1A1A2E] hover:bg-[#2a2a4a] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-white text-[14px] font-semibold"
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
            Back to News & Alerts
          </Link>
        </article>
      </div>
    </main>
  );
}
