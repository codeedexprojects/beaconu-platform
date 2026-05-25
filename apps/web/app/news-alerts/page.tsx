import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Bell } from "lucide-react";
import { getPublishedNewsAlerts } from "@/lib/services/news-alerts.service";
import { formatDate } from "@/lib/utils";
import { BlogHeader } from "@/components/blogs/BlogHeader";
import type { NewsAlertListItem } from "@beaconu/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "News & Alerts | BeaconU",
  description:
    "Stay updated with the latest admission news, exam alerts, scholarships, and college updates.",
  robots: { index: true, follow: true },
};

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function NewsAlertsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const search = params.search ?? "";

  const { data: alerts, meta } = await getPublishedNewsAlerts({
    page,
    limit: 12,
    search: search || undefined,
  }).catch(() => ({
    data: [],
    meta: { total: 0, page: 1, limit: 12, hasNext: false },
  }));

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      <BlogHeader backHref="/home" backLabel="Home" title="News & Alerts" />

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-5">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#FEF0EB] flex items-center justify-center">
              <Bell size={28} color="#E8521A" strokeWidth={1.8} />
            </div>
            <p className="text-[16px] font-bold text-gray-900">
              No alerts found
            </p>
            <p className="text-[13px] text-gray-500 text-center max-w-xs">
              {search
                ? "No alerts match your search. Try a different term."
                : "No news or alerts have been published yet. Check back soon!"}
            </p>
            {search && (
              <Link
                href="/news-alerts"
                className="mt-1 h-10 px-5 rounded-full bg-[#E8521A] hover:bg-[#D04718] text-white text-sm font-semibold flex items-center transition-colors"
              >
                Clear search
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {alerts.map((alert) => (
              <NewsAlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        )}

        {(page > 1 || meta.hasNext) && (
          <div className="mt-8 flex items-center justify-center gap-3">
            {page > 1 && (
              <Link
                href={`/news-alerts?page=${page - 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                className="h-10 px-5 rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-gray-400 transition-colors flex items-center gap-1.5"
              >
                ← Previous
              </Link>
            )}
            <span className="text-[13px] text-gray-400 px-2">Page {page}</span>
            {meta.hasNext && (
              <Link
                href={`/news-alerts?page=${page + 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
                className="h-10 px-5 rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-gray-400 transition-colors flex items-center gap-1.5"
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

function NewsAlertCard({ alert }: { alert: NewsAlertListItem }) {
  const tags = Array.isArray(alert.tags) ? alert.tags : [];

  return (
    <Link
      href={`/news-alerts/${alert.slug}`}
      className="group flex items-start gap-3 bg-white rounded-2xl border border-gray-100 p-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.09)] transition-shadow"
    >
      {alert.coverImageUrl ? (
        <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden shrink-0 bg-gray-100">
          <Image
            src={alert.coverImageUrl}
            alt={alert.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="112px"
          />
        </div>
      ) : (
        <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl shrink-0 flex items-center justify-center bg-[#FEF0EB]">
          <Bell size={24} color="#E8521A" strokeWidth={1.8} />
        </div>
      )}

      <div className="flex-1 min-w-0 py-0.5">
        <span className="text-[11px] text-gray-400">
          {formatDate(alert.publishedAt ?? alert.createdAt)}
        </span>

        <h2 className="text-[14px] md:text-[15px] font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-[#E8521A] transition-colors mb-1 mt-0.5">
          {alert.title}
        </h2>

        {alert.summary && (
          <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2 mb-1.5">
            {alert.summary}
          </p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[11px] text-[#E8521A] font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
