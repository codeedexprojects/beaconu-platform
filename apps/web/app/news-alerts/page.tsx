import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Search, Bell, FileText, BookOpen, DollarSign, Calendar, Trophy } from "lucide-react";
import { getPublishedNewsAlerts } from "@/lib/services/news-alerts.service";
import { formatDate } from "@/lib/utils";
import { BlogHeader } from "@/components/blogs/BlogHeader";
import type { NewsAlertListItem } from "@beaconu/types";

export const revalidate = 3600;

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

const CATEGORY_COLORS: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  news: { bg: "#EFF6FF", text: "#3B82F6", icon: <FileText size={14} /> },
  alert: { bg: "#FEF2F2", text: "#EF4444", icon: <Bell size={14} /> },
  admission: { bg: "#F0FDF4", text: "#22C55E", icon: <BookOpen size={14} /> },
  exam: { bg: "#FFF7ED", text: "#F97316", icon: <FileText size={14} /> },
  scholarship: { bg: "#ECFDF5", text: "#10B981", icon: <DollarSign size={14} /> },
  event: { bg: "#FAF5FF", text: "#A855F7", icon: <Calendar size={14} /> },
  result: { bg: "#FFF1F2", text: "#F43F5E", icon: <Trophy size={14} /> },
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
    <main className="min-h-screen bg-[#F3F4F6]">
      <BlogHeader backHref="/(app)/home" backLabel="Home" title="News & Alerts">
        <div className="flex gap-2.5 pb-3">
          <form
            action="/news-alerts"
            method="GET"
            className="flex-1 flex items-center gap-2 h-10 bg-gray-50 border-[1.5px] border-gray-200 rounded-xl px-3.5 focus-within:border-[#E8521A] transition-colors"
          >
            {category && <input type="hidden" name="category" value={category} />}
            <Search className="shrink-0 text-gray-400" size={15} aria-hidden />
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search updates..."
              autoComplete="off"
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none min-w-0"
            />
          </form>
          <form action="/news-alerts" method="GET">
            {search && <input type="hidden" name="search" value={search} />}
            {category && <input type="hidden" name="category" value={category} />}
            <button
              type="submit"
              aria-label="Search"
              className="w-10 h-10 rounded-xl bg-[#E8521A] hover:bg-[#D04718] active:scale-95 transition-all flex items-center justify-center shrink-0"
            >
              <Search size={16} color="white" aria-hidden />
            </button>
          </form>
        </div>

        {/* Category chips */}
        <div
          className="flex gap-2 pb-3 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {CATEGORY_FILTERS.map((c) => (
            <Link
              key={c.value}
              href={`/news-alerts${c.value ? `?category=${c.value}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
              className={`shrink-0 px-3 py-1 rounded-full text-[12px] font-semibold border transition-colors ${
                category === c.value
                  ? "bg-[#E8521A] text-white border-[#E8521A]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#E8521A] hover:text-[#E8521A]"
              }`}
            >
              {c.label}
            </Link>
          ))}
        </div>
      </BlogHeader>

      <div className="max-w-2xl mx-auto px-4 py-5">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#FEF0EB] flex items-center justify-center">
              <Bell size={28} color="#E8521A" strokeWidth={1.8} />
            </div>
            <p className="text-[16px] font-bold text-gray-900">No alerts found</p>
            <p className="text-[13px] text-gray-500 text-center max-w-xs">
              {search || category
                ? "No alerts match your filters. Try adjusting them."
                : "No news or alerts have been published yet. Check back soon!"}
            </p>
            {(search || category) && (
              <Link
                href="/news-alerts"
                className="mt-1 h-11 px-6 rounded-full bg-[#E8521A] hover:bg-[#D04718] text-white text-sm font-semibold flex items-center transition-colors"
              >
                Clear filters
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
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
                className="h-11 px-5 rounded-full border-[1.5px] border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-[#E8521A] hover:text-[#E8521A] transition-colors flex items-center gap-1.5"
              >
                ← Previous
              </Link>
            )}
            <span className="text-[13px] font-medium text-gray-400 px-2">
              Page {page}
            </span>
            {meta.hasNext && (
              <Link
                href={`/news-alerts?page=${page + 1}${search ? `&search=${encodeURIComponent(search)}` : ""}${category ? `&category=${category}` : ""}`}
                className="h-11 px-5 rounded-full border-[1.5px] border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-[#E8521A] hover:text-[#E8521A] transition-colors flex items-center gap-1.5"
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

  return (
    <Link
      href={`/news-alerts/${alert.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.10)] transition-shadow"
    >
      {alert.coverImageUrl && (
        <div className="relative h-40 w-full overflow-hidden bg-gray-100">
          <Image
            src={alert.coverImageUrl}
            alt={alert.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 672px) 100vw, 672px"
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2.5">
          <span
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize"
            style={{ backgroundColor: style.bg, color: style.text }}
          >
            {style.icon}
            {alert.category}
          </span>
          <span className="text-[11px] text-gray-400">
            {formatDate(alert.publishedAt ?? alert.createdAt)}
          </span>
        </div>

        <h2 className="text-[15px] font-bold text-gray-900 leading-snug mb-1.5 group-hover:text-[#E8521A] transition-colors">
          {alert.title}
        </h2>

        {alert.summary && (
          <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2 mb-4">
            {alert.summary}
          </p>
        )}

        <div className="flex items-center gap-1 text-[13px] font-semibold text-[#E8521A] group-hover:gap-2 transition-all">
          Read more
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
