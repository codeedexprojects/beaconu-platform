import Link from "next/link";
import { BookOpen, FileText, DollarSign, Newspaper } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface InsightItem {
  id: number;
  title: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  highlight?: boolean;
  href?: string;
}

const insights: InsightItem[] = [
  {
    id: 1,
    title: "Entrance exam info",
    icon: BookOpen,
    color: "#3B82F6",
    bg: "#EFF6FF",
  },
  {
    id: 2,
    title: "Article",
    icon: FileText,
    color: "#6B7280",
    bg: "#F9FAFB",
    href: "/blogs",
  },
  {
    id: 3,
    title: "Financial Aid",
    icon: DollarSign,
    color: "#10B981",
    bg: "#ECFDF5",
  },
  {
    id: 4,
    title: "News & alert",
    icon: Newspaper,
    color: "#1A1A1A",
    bg: "#FEF3C7",
    highlight: true,
    href: "/news-alerts",
  },
];

export function InsightsUpdates() {
  return (
    <section className="px-4 md:px-6 lg:px-8">
      <h2 className="text-[17px] sm:text-xl font-bold text-[#111827] mb-3 sm:mb-4">
        Insights & Updates
      </h2>

      {/* Mobile: horizontal scroll | sm+: 4-column grid */}
      <div
        className="flex gap-5 overflow-x-auto sm:grid sm:grid-cols-4 sm:overflow-visible sm:gap-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {insights.map((item) => {
          const Icon = item.icon;
          const inner = (
            <>
              <div
                className="w-[68px] h-[68px] sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: item.bg }}
              >
                <Icon
                  className="h-7 w-7"
                  style={{ color: item.color }}
                  strokeWidth={1.8}
                />
              </div>
              <p className="text-[11px] sm:text-[12px] text-[#374151] text-center leading-tight max-w-[72px] sm:max-w-none">
                {item.highlight ? (
                  <>
                    <span className="bg-yellow-300 text-[#1A1A1A] px-0.5 rounded-sm font-medium">
                      News
                    </span>
                    {" & alert"}
                  </>
                ) : (
                  item.title
                )}
              </p>
            </>
          );
          const cls =
            "flex-shrink-0 sm:flex-shrink flex flex-col items-center gap-2 sm:bg-white sm:rounded-2xl sm:p-4 sm:shadow-sm sm:border sm:border-gray-100 sm:hover:shadow-md sm:transition-shadow";
          return item.href ? (
            <Link key={item.id} href={item.href} className={cls}>
              {inner}
            </Link>
          ) : (
            <button key={item.id} className={cls}>
              {inner}
            </button>
          );
        })}
        <div className="w-2 flex-shrink-0 sm:hidden" />
      </div>
    </section>
  );
}
