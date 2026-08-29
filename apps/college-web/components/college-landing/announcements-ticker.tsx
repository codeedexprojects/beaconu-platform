import { Radio } from "lucide-react";
import type { PublicSiteAnnouncement } from "@beaconu/types";

interface AnnouncementsTickerProps {
  announcements: PublicSiteAnnouncement[];
}

function formatTickerDate(iso: string): string {
  return new Date(iso)
    .toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
    .toUpperCase();
}

function TickerItem({
  announcement,
}: {
  announcement: PublicSiteAnnouncement;
}) {
  const dateClass = announcement.highlighted
    ? "text-red-500"
    : "text-headerTeal";

  const content = (
    <span className="flex shrink-0 items-center gap-2 px-6 text-sm text-foreground">
      <span className={`font-bold ${dateClass}`}>
        {formatTickerDate(announcement.date)}
      </span>
      {announcement.title}
    </span>
  );

  if (announcement.link) {
    return (
      <a
        href={announcement.link}
        target="_blank"
        rel="noreferrer"
        className="hover:text-headerTeal-dark"
      >
        {content}
      </a>
    );
  }

  return content;
}

export function AnnouncementsTicker({
  announcements,
}: AnnouncementsTickerProps) {
  if (announcements.length === 0) return null;

  return (
    <div className="overflow-hidden bg-[#F9F9F9F2]">
      <div className="flex items-center">
        <span className="flex shrink-0 items-center gap-2 bg-headerTeal-dark px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white">
          <Radio className="h-3.5 w-3.5" />
          Updates
        </span>
        <div className="relative min-w-0 flex-1 overflow-hidden py-2.5">
          <div className="flex w-max animate-marquee items-center">
            {announcements.map((item, i) => (
              <TickerItem key={`${item.id}-a-${i}`} announcement={item} />
            ))}
            <span className="flex shrink-0 items-center" aria-hidden="true">
              {announcements.map((item, i) => (
                <TickerItem key={`${item.id}-b-${i}`} announcement={item} />
              ))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
