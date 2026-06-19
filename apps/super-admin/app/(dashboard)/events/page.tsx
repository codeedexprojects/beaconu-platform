"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Search,
  Plus,
  MapPin,
  Clock,
  Users,
  Video,
  Ticket,
  Globe,
  Archive,
  ArchiveRestore,
  Pencil,
  Trash2,
  Loader2,
  Monitor,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useEvents,
  useUpdateEventStatus,
  useSoftDeleteEvent,
} from "@/hooks/use-events";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { EventListItem } from "@beaconu/types";

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Completed", value: "completed" },
  { label: "Archived", value: "archived" },
] as const;

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-amber-50 text-amber-700 border-amber-200",
  published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  archived: "bg-gray-50 text-gray-500 border-gray-200",
};

const MODE_CONFIG: Record<string, { icon: typeof Video; label: string }> = {
  online: { icon: Video, label: "Online" },
  offline: { icon: MapPin, label: "Offline" },
  hybrid: { icon: Monitor, label: "Hybrid" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function EventRow({ event }: { event: EventListItem }) {
  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdateEventStatus();
  const { mutate: softDelete, isPending: isDeleting } = useSoftDeleteEvent();

  const modeConf = MODE_CONFIG[event.event_mode] ?? MODE_CONFIG.offline;
  const ModeIcon = modeConf.icon;

  return (
    <div className="flex items-start gap-4 px-6 py-4 hover:bg-muted/30 transition-colors border-b last:border-0">
      {/* Left: Mode icon */}
      <div className="mt-0.5 p-2 rounded-full bg-muted shrink-0">
        <ModeIcon className="h-4 w-4" />
      </div>

      {/* Middle: Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize",
              STATUS_BADGE[event.status] ?? STATUS_BADGE.draft,
            )}
          >
            {event.status}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium text-muted-foreground capitalize">
            <ModeIcon className="h-2.5 w-2.5" />
            {modeConf.label}
          </span>
          {event.category && (
            <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {event.category}
            </span>
          )}
          {!event.is_free && (
            <span className="text-[10px] font-semibold text-primary">
              ₹{event.ticket_price}
            </span>
          )}
        </div>

        <p className="font-semibold text-foreground line-clamp-1">
          {event.title}
        </p>

        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(event.event_date)}
          </span>
          {event.start_time && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(event.start_time)}
              {event.end_time ? ` – ${formatTime(event.end_time)}` : ""}
            </span>
          )}
          {event.venue && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {event.venue}
            </span>
          )}
          <span className="inline-flex items-center gap-1 font-semibold text-primary">
            <Users className="h-3 w-3" />
            {event.registered_count}
            {event.total_seats ? `/${event.total_seats}` : ""} registered
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="shrink-0 flex items-center gap-1.5">
        {event.status === "draft" && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1 h-7 text-xs"
            disabled={isUpdatingStatus}
            onClick={() =>
              updateStatus(
                { id: event.id, status: "published" },
                { onSuccess: () => toast.success("Event published") },
              )
            }
          >
            {isUpdatingStatus ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Globe className="h-3 w-3" />
            )}
            Publish
          </Button>
        )}
        {event.status === "published" && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1 h-7 text-xs"
            disabled={isUpdatingStatus}
            onClick={() =>
              updateStatus(
                { id: event.id, status: "completed" },
                { onSuccess: () => toast.success("Event marked completed") },
              )
            }
          >
            <Ticket className="h-3 w-3" />
            Complete
          </Button>
        )}
        {event.status !== "archived" ? (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-muted-foreground"
            disabled={isDeleting}
            onClick={() =>
              softDelete(event.id, {
                onSuccess: () => toast.success("Event archived"),
              })
            }
          >
            {isDeleting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Archive className="h-3 w-3" />
            )}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-muted-foreground"
            disabled={isUpdatingStatus}
            onClick={() =>
              updateStatus(
                { id: event.id, status: "draft" },
                { onSuccess: () => toast.success("Event moved to draft") },
              )
            }
          >
            <ArchiveRestore className="h-3 w-3" />
          </Button>
        )}
        <Link href={`/events/${event.id}`}>
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

export default function EventsPage() {
  const [activeStatus, setActiveStatus] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useEvents({
    status: activeStatus || undefined,
    search: search || undefined,
    page,
  });

  const items = data?.data ?? [];
  const meta = data?.meta;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Events"
        description="Plan and manage educational fairs, webinars, and workshops"
      >
        <Link href="/events/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </Header>

      <div className="flex-1 p-6 space-y-4">
        <form onSubmit={handleSearch} className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 bg-background"
          />
        </form>

        {/* Status tabs */}
        <div className="flex gap-1 border-b">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setActiveStatus(tab.value);
                setPage(1);
              }}
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

        {/* Events list */}
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
                  ? `No ${activeStatus} events found.`
                  : "No events yet. Create one to get started."}
              </div>
            ) : (
              <div className="divide-y">
                {items.map((event) => (
                  <EventRow key={event.id} event={event} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {meta && meta.total > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {items.length} of {meta.total} events
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!meta.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
