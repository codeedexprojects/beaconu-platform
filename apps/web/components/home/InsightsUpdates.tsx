import { BookOpen, FileText, DollarSign, Newspaper } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface InsightItem {
  id: number;
  title: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  highlight?: boolean;
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
  },
];

export function InsightsUpdates() {
  return (
    <section className="px-4">
      <h2 className="text-[17px] font-bold text-[#111827] mb-3">
        Insights & Updates
      </h2>

      <div
        className="flex gap-5 overflow-x-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {insights.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className="flex-shrink-0 flex flex-col items-center gap-2"
            >
              <div
                className="w-[68px] h-[68px] rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: item.bg }}
              >
                <Icon
                  className="h-7 w-7"
                  style={{ color: item.color }}
                  strokeWidth={1.8}
                />
              </div>
              <p className="text-[11px] text-[#374151] text-center leading-tight max-w-[72px]">
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
            </button>
          );
        })}
        <div className="w-2 flex-shrink-0" />
      </div>
    </section>
  );
}
