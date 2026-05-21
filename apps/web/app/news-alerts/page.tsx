import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Bell } from "lucide-react";
import { getPublishedNewsAlerts } from "@/lib/services/news-alerts.service";
import { formatDate } from "@/lib/utils";
import type { NewsAlertListItem } from "@beaconu/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "News & Alerts | BeaconU",
  description:
    "Stay updated with the latest admission news, exam alerts, scholarships, and college updates.",
  robots: { index: true, follow: true },
};

const CATEGORY_FILTERS = [
  { value: "", label: "All" },
  { value: "news", label: "News" },
  { value: "alert", label: "Alerts" },
  { value: "admission", label: "Admission" },
  { value: "exam", label: "Exams" },
  { value: "scholarship", label: "Scholarships" },
  { value: "event", label: "Events" },
  { value: "result", label: "Results" },
] as const;

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  news: { bg: "#EFF6FF", text: "#3B82F6" },
  alert: { bg: "#FEF2F2", text: "#EF4444" },
  admission: { bg: "#F0FDF4", text: "#22C55E" },
  exam: { bg: "#FFF7ED", text: "#F97316" },
  scholarship: { bg: "#ECFDF5", text: "#10B981" },
  event: { bg: "#FAF5FF", text: "#A855F7" },
  result: { bg: "#FFF1F2", text: "#F43F5E" },
};

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string; category?: string }>;
}

export default async function NewsAlertsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const search = params.search ?? "";
  const category = params.category ?? "";

  const { data: alerts, meta } = await getPublishedNewsAlerts({
    page,
    limit: 12,
    search: search || undefined,
    category: category || undefined,
  }).catch(() => ({
    data: [],
    meta: { total: 0, page: 1, limit: 12, hasNext: false },
  }));

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href="/home"
              className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#E8521A] hover:text-[#E8521A] hover:bg-[#FEF0EB] transition-colors shrink-0"
              aria-label="Back to home"
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
            <div>
              <h1 className="text-[20px] font-bold text-gray-900 leading-tight">
                <span className="bg-[#FEF0EB] text-[#E8521A] px-1.5 rounded">
                  News
                </span>
                {" & Alerts"}
              </h1>
              <p className="text-[12px] text-gray-400 mt-0.5">
                Latest updates on admissions, exams & more
              </p>
            </div>
          </div>

          {/* Category chips */}
          <div
            className="flex gap-2 overflow-x-auto pb-0.5"
            style={{ scrollbarWidth: "none" }}
          >
            {CATEGORY_FILTERS.map((c) => (
              <Link
                key={c.value}
                href={`/news-alerts${c.value ? `?category=${c.value}` : ""}${search ? `${c.value ? "&" : "?"}search=${encodeURIComponent(search)}` : ""}`}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-all ${
                  category === c.value
                    ? "bg-[#1A1A2E] text-white border-[#1A1A2E]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900"
                }`}
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

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
              {search || category
                ? "No alerts match your filters. Try adjusting them."
                : "No news or alerts have been published yet. Check back soon!"}
            </p>
            {(search || category) && (
              <Link
                href="/news-alerts"
                className="mt-1 h-10 px-5 rounded-full bg-[#E8521A] hover:bg-[#D04718] text-white text-sm font-semibold flex items-center transition-colors"
              >
                Clear filters
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
                href={`/news-alerts?page=${page - 1}${search ? `&search=${encodeURIComponent(search)}` : ""}${category ? `&category=${category}` : ""}`}
                className="h-10 px-5 rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-gray-400 transition-colors flex items-center gap-1.5"
              >
                ← Previous
              </Link>
            )}
            <span className="text-[13px] text-gray-400 px-2">Page {page}</span>
            {meta.hasNext && (
              <Link
                href={`/news-alerts?page=${page + 1}${search ? `&search=${encodeURIComponent(search)}` : ""}${category ? `&category=${category}` : ""}`}
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
  const style = CATEGORY_COLORS[alert.category] ?? CATEGORY_COLORS["news"];
  const tags = Array.isArray(alert.tags) ? alert.tags : [];

  return (
    <Link
      href={`/news-alerts/${alert.slug}`}
      className="group flex items-start gap-3 bg-white rounded-2xl border border-gray-100 p-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.09)] transition-shadow"
    >
      {/* Thumbnail */}
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
        <div
          className="w-24 h-24 md:w-28 md:h-28 rounded-xl shrink-0 flex items-center justify-center"
          style={{ backgroundColor: style.bg }}
        >
          <Bell size={24} style={{ color: style.text }} strokeWidth={1.8} />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0 py-0.5">
        {/* Category + date row */}
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
            style={{ backgroundColor: style.bg, color: style.text }}
          >
            {alert.category}
          </span>
          <span className="text-[11px] text-gray-400">
            {formatDate(alert.publishedAt ?? alert.createdAt)}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-[14px] md:text-[15px] font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-[#E8521A] transition-colors mb-1">
          {alert.title}
        </h2>

        {/* Summary */}
        {alert.summary && (
          <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2 mb-1.5">
            {alert.summary}
          </p>
        )}

        {/* Tags as hashtags */}
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
