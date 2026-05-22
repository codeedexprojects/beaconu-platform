"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Globe,
  Archive,
  ArchiveRestore,
  FileText,
  Clock,
  Pencil,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useNewsAlerts,
  usePublishNewsAlert,
  useArchiveNewsAlert,
  useUnarchiveNewsAlert,
} from "@/hooks/use-news-alerts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { NewsAlertListItem } from "@beaconu/types";

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
] as const;

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-amber-50 text-amber-700 border-amber-200",
  published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  archived: "bg-gray-50 text-gray-500 border-gray-200",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function NewsAlertRow({ item }: { item: NewsAlertListItem }) {
  const { mutate: publish, isPending: isPublishing } = usePublishNewsAlert();
  const { mutate: archive, isPending: isArchiving } = useArchiveNewsAlert();
  const { mutate: unarchive, isPending: isUnarchiving } =
    useUnarchiveNewsAlert();

  return (
    <div className="flex items-start gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
      <div className="mt-0.5 p-2 rounded-full bg-muted shrink-0">
        <FileText className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize",
              STATUS_BADGE[item.status],
            )}
          >
            {item.status}
          </span>
        </div>
        <p className="font-semibold text-foreground line-clamp-1">
          {item.title}
        </p>
        {item.summary && (
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
            {item.summary}
          </p>
        )}
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground mt-1.5">
          <Clock className="h-3 w-3" />
          {item.publishedAt
            ? `Published ${formatDate(item.publishedAt)}`
            : `Created ${formatDate(item.createdAt)}`}
        </span>
      </div>

      <div className="shrink-0 flex items-center gap-2">
        {item.status === "draft" && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1 h-7 text-xs"
            disabled={isPublishing}
            onClick={() =>
              publish(item.id, {
                onSuccess: () => toast.success("News alert published"),
              })
            }
          >
            <Globe className="h-3 w-3" />
            Publish
          </Button>
        )}
        {item.status === "archived" ? (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-muted-foreground"
            disabled={isUnarchiving}
            onClick={() =>
              unarchive(item.id, {
                onSuccess: () => toast.success("News alert moved to draft"),
              })
            }
          >
            <ArchiveRestore className="h-3 w-3" />
          </Button>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-muted-foreground"
            disabled={isArchiving}
            onClick={() =>
              archive(item.id, {
                onSuccess: () => toast.success("News alert archived"),
              })
            }
          >
            <Archive className="h-3 w-3" />
          </Button>
        )}
        <Link href={`/news-alerts/${item.id}`}>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-muted-foreground"
            aria-label="Edit"
          >
            <Pencil className="h-3 w-3" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function NewsAlertsPage() {
  const [activeStatus, setActiveStatus] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading } = useNewsAlerts({
    status: activeStatus || undefined,
    search: search || undefined,
  });

  const items = data?.data ?? [];
  const meta = data?.meta;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="News & Alerts"
        description="Publish important updates, admission news, and system alerts"
      >
        <Link href="/news-alerts/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Alert
          </Button>
        </Link>
      </Header>

      <div className="flex-1 p-6 space-y-4">
        <form onSubmit={handleSearch} className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search alerts…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 bg-background"
          />
        </form>

        <div className="flex gap-1 border-b">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveStatus(tab.value)}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                activeStatus === tab.value
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Card className="border-none shadow-sm">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="divide-y">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-7 w-20 rounded" />
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="py-16 text-center text-sm text-muted-foreground">
                {activeStatus
                  ? `No ${activeStatus} alerts found.`
                  : "No news alerts yet. Create one to get started."}
              </div>
            ) : (
              <div className="divide-y">
                {items.map((item) => (
                  <NewsAlertRow key={item.id} item={item} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {meta && meta.total > 0 && (
          <p className="text-xs text-muted-foreground text-right">
            Showing {items.length} of {meta.total} alerts
          </p>
        )}
      </div>
    </div>
  );
}
