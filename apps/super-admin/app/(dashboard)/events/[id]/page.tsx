"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  Globe,
  Archive,
  ArchiveRestore,
  Loader2,
  Clock,
  Users,
  Video as VideoIcon,
  Calendar,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ui/image-upload";
import { cn } from "@/lib/utils";
import {
  useEvent,
  useUpdateEvent,
  useUpdateEventStatus,
  useSoftDeleteEvent,
  useUploadRecording,
  useEventRegistrations,
} from "@/hooks/use-events";

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-amber-50 text-amber-700 border-amber-200",
  published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  archived: "bg-gray-50 text-gray-500 border-gray-200",
};

const CATEGORIES = [
  "workshop",
  "webinar",
  "seminar",
  "fair",
  "conference",
  "meetup",
  "hackathon",
  "orientation",
  "other",
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const editSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  description: z.string().trim().optional(),
  cover_image_url: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),
  category: z.string().trim().min(1, "Category is required").max(30),
  speaker_name: z.string().trim().max(255).optional(),
  speaker_title: z.string().trim().max(255).optional(),
  organizer: z.string().trim().max(255).optional(),
  event_date: z.string().min(1, "Event date is required"),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  duration: z.string().trim().max(50).optional(),
  event_mode: z.enum(["online", "offline", "hybrid"]),
  venue: z.string().trim().max(255).optional(),
  online_link: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  is_free: z.boolean().default(true),
  ticket_price: z.coerce.number().min(0).default(0),
  total_seats: z.coerce
    .number()
    .int()
    .min(1)
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

type EditFormInput = z.infer<typeof editSchema>;

const recordingSchema = z.object({
  recording_url: z.string().url("Enter a valid recording URL"),
  is_youtube_video: z.boolean().default(false),
  recording_duration: z.string().trim().max(20).optional(),
  recorded_at: z.string().optional(),
});

type RecordingFormInput = z.infer<typeof recordingSchema>;

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"details" | "registrations">(
    "details",
  );

  const { data: event, isLoading } = useEvent(id);
  const { mutate: update, isPending: isSaving } = useUpdateEvent();
  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdateEventStatus();
  const { mutate: softDelete, isPending: isDeleting } = useSoftDeleteEvent();
  const { mutate: uploadRecording, isPending: isUploading } =
    useUploadRecording();
  const { data: registrationsData, isLoading: isLoadingRegs } =
    useEventRegistrations(id);

  const isArchived = event?.status === "archived";
  const isCompleted = event?.status === "completed";

  // Edit form
  const form = useForm<EditFormInput>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      title: "",
      description: "",
      cover_image_url: "",
      category: "",
      speaker_name: "",
      speaker_title: "",
      organizer: "",
      event_date: "",
      start_time: "",
      end_time: "",
      duration: "",
      event_mode: "offline",
      venue: "",
      online_link: "",
      is_free: true,
      ticket_price: 0,
      total_seats: undefined,
    },
  });

  // Recording form
  const recForm = useForm<RecordingFormInput>({
    resolver: zodResolver(recordingSchema),
    defaultValues: {
      recording_url: "",
      is_youtube_video: false,
      recording_duration: "",
      recorded_at: "",
    },
  });

  useEffect(() => {
    if (!event) return;
    // Parse date + time from ISO
    const dateStr = event.event_date
      ? new Date(event.event_date).toISOString().split("T")[0]
      : "";
    const startStr = event.start_time
      ? new Date(event.start_time).toISOString().split("T")[1]?.slice(0, 5)
      : "";
    const endStr = event.end_time
      ? new Date(event.end_time).toISOString().split("T")[1]?.slice(0, 5)
      : "";

    form.reset({
      title: event.title,
      description: event.description ?? "",
      cover_image_url: event.cover_image_url ?? "",
      category: event.category,
      speaker_name: event.speaker_name ?? "",
      speaker_title: event.speaker_title ?? "",
      organizer: event.organizer ?? "",
      event_date: dateStr,
      start_time: startStr,
      end_time: endStr,
      duration: event.duration ?? "",
      event_mode: event.event_mode as "online" | "offline" | "hybrid",
      venue: event.venue ?? "",
      online_link: event.online_link ?? "",
      is_free: event.is_free,
      ticket_price: event.ticket_price ?? 0,
      total_seats: event.total_seats ?? undefined,
    });

    // Pre-fill recording form if exists
    if (event.recording_url) {
      recForm.reset({
        recording_url: event.recording_url,
        is_youtube_video: Boolean(event.is_youtube_video),
        recording_duration: event.recording_duration ?? "",
        recorded_at: event.recorded_at
          ? new Date(event.recorded_at).toISOString().split("T")[0]
          : "",
      });
    }
  }, [event, form, recForm]);

  const isFree = form.watch("is_free");
  const eventMode = form.watch("event_mode");

  function onSubmit(data: EditFormInput) {
    update(
      {
        id,
        data: {
          title: data.title,
          description: data.description || undefined,
          cover_image_url: data.cover_image_url || undefined,
          category: data.category,
          speaker_name: data.speaker_name || undefined,
          speaker_title: data.speaker_title || undefined,
          organizer: data.organizer || undefined,
          event_date: data.event_date,
          start_time: data.start_time || undefined,
          end_time: data.end_time || undefined,
          duration: data.duration || undefined,
          event_mode: data.event_mode,
          venue: data.venue || undefined,
          online_link: data.online_link || undefined,
          is_free: data.is_free,
          ticket_price: data.is_free ? 0 : data.ticket_price,
          total_seats:
            data.total_seats && data.total_seats > 0
              ? data.total_seats
              : undefined,
        },
      },
      { onSuccess: () => toast.success("Event updated") },
    );
  }

  function onUploadRecording(data: RecordingFormInput) {
    uploadRecording(
      {
        id,
        data: {
          recording_url: data.recording_url,
          is_youtube_video: data.is_youtube_video,
          recording_duration: data.recording_duration || undefined,
          recorded_at: data.recorded_at || undefined,
        },
      },
      { onSuccess: () => toast.success("Recording uploaded") },
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-full">
        <Header title="Event" />
        <div className="flex-1 p-6 space-y-4 max-w-3xl">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col min-h-full">
        <Header title="Event" />
        <div className="flex-1 p-6 text-center text-muted-foreground text-sm py-16">
          Event not found.{" "}
          <Link href="/events" className="text-primary hover:underline">
            Back to list
          </Link>
        </div>
      </div>
    );
  }

  const registrations = registrationsData?.data ?? [];

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Event" description={event.title}>
        <div className="flex items-center gap-2">
          {event.status === "draft" && (
            <Button
              size="sm"
              className="gap-1.5"
              disabled={isUpdatingStatus || isSaving}
              onClick={() =>
                updateStatus(
                  { id, status: "published" },
                  { onSuccess: () => toast.success("Event published") },
                )
              }
            >
              {isUpdatingStatus ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Globe className="h-4 w-4" />
              )}
              Publish
            </Button>
          )}
          {event.status === "published" && (
            <Button
              size="sm"
              className="gap-1.5"
              disabled={isUpdatingStatus}
              onClick={() =>
                updateStatus(
                  { id, status: "completed" },
                  { onSuccess: () => toast.success("Event marked completed") },
                )
              }
            >
              <CheckCircle2 className="h-4 w-4" />
              Complete
            </Button>
          )}
          {isArchived ? (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-muted-foreground"
              disabled={isUpdatingStatus}
              onClick={() =>
                updateStatus(
                  { id, status: "draft" },
                  { onSuccess: () => toast.success("Event moved to draft") },
                )
              }
            >
              <ArchiveRestore className="h-4 w-4" />
              Unarchive
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-muted-foreground"
              disabled={isDeleting || isSaving}
              onClick={() =>
                softDelete(id, {
                  onSuccess: () => {
                    toast.success("Event archived");
                    router.push("/events");
                  },
                })
              }
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Archive className="h-4 w-4" />
              )}
              Archive
            </Button>
          )}
        </div>
      </Header>

      <div className="flex-1 p-6 space-y-5 max-w-4xl">
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Link>

        {/* Status + stats */}
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
              STATUS_BADGE[event.status] ?? STATUS_BADGE.draft,
            )}
          >
            {event.status}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDate(event.event_date)}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
            <Users className="h-3 w-3" />
            {event.registered_count}
            {event.total_seats ? `/${event.total_seats}` : ""} registered
          </span>
          {event.has_recording && (
            <span className="inline-flex items-center gap-1 text-xs text-blue-600">
              <VideoIcon className="h-3 w-3" />
              Recording available
            </span>
          )}
        </div>

        {isArchived && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
            This event is archived and cannot be edited.
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b">
          <button
            onClick={() => setActiveTab("details")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === "details"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab("registrations")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === "registrations"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            Registrations ({event.registered_count})
          </button>
        </div>

        {activeTab === "details" && (
          <div className="space-y-6">
            {/* Edit Form */}
            <Card className="border-none shadow-sm">
              <CardContent className="pt-6">
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="title">
                      Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      disabled={isArchived}
                      {...form.register("title")}
                    />
                    {form.formState.errors.title && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      rows={4}
                      className="resize-y"
                      disabled={isArchived}
                      {...form.register("description")}
                    />
                  </div>

                  <ImageUpload
                    label="Cover Image"
                    value={form.watch("cover_image_url") ?? ""}
                    onChange={(url) =>
                      form.setValue("cover_image_url", url, {
                        shouldValidate: true,
                      })
                    }
                    context="event-covers"
                    disabled={isArchived}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Category</Label>
                      <Select
                        value={form.watch("category")}
                        onValueChange={(v) =>
                          form.setValue("category", v, {
                            shouldValidate: true,
                          })
                        }
                        disabled={isArchived}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((c) => (
                            <SelectItem
                              key={c}
                              value={c}
                              className="capitalize"
                            >
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Event Mode</Label>
                      <Select
                        value={form.watch("event_mode")}
                        onValueChange={(v) =>
                          form.setValue(
                            "event_mode",
                            v as "online" | "offline" | "hybrid",
                            { shouldValidate: true },
                          )
                        }
                        disabled={isArchived}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="offline">Offline</SelectItem>
                          <SelectItem value="online">Online</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="speaker_name">Speaker Name</Label>
                      <Input
                        id="speaker_name"
                        disabled={isArchived}
                        {...form.register("speaker_name")}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="speaker_title">Speaker Title</Label>
                      <Input
                        id="speaker_title"
                        disabled={isArchived}
                        {...form.register("speaker_title")}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="organizer">Organizer</Label>
                    <Input
                      id="organizer"
                      disabled={isArchived}
                      {...form.register("organizer")}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="event_date">Event Date</Label>
                      <Input
                        id="event_date"
                        type="date"
                        disabled={isArchived}
                        {...form.register("event_date")}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="start_time">Start Time</Label>
                      <Input
                        id="start_time"
                        type="time"
                        disabled={isArchived}
                        {...form.register("start_time")}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="end_time">End Time</Label>
                      <Input
                        id="end_time"
                        type="time"
                        disabled={isArchived}
                        {...form.register("end_time")}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      disabled={isArchived}
                      {...form.register("duration")}
                    />
                  </div>

                  {(eventMode === "offline" || eventMode === "hybrid") && (
                    <div className="space-y-1.5">
                      <Label htmlFor="venue">Venue</Label>
                      <Input
                        id="venue"
                        disabled={isArchived}
                        {...form.register("venue")}
                      />
                    </div>
                  )}
                  {(eventMode === "online" || eventMode === "hybrid") && (
                    <div className="space-y-1.5">
                      <Label htmlFor="online_link">Online Link</Label>
                      <Input
                        id="online_link"
                        disabled={isArchived}
                        {...form.register("online_link")}
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-3 rounded-lg border p-4">
                    <Switch
                      checked={isFree}
                      onCheckedChange={(v) => form.setValue("is_free", v)}
                      disabled={isArchived}
                    />
                    <div>
                      <p className="text-sm font-medium">Free Event</p>
                      <p className="text-xs text-muted-foreground">
                        Toggle off to set a ticket price
                      </p>
                    </div>
                  </div>
                  {!isFree && (
                    <div className="space-y-1.5">
                      <Label htmlFor="ticket_price">Ticket Price (₹)</Label>
                      <Input
                        id="ticket_price"
                        type="number"
                        min={0}
                        step="0.01"
                        disabled={isArchived}
                        {...form.register("ticket_price")}
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="total_seats">Total Seats</Label>
                    <Input
                      id="total_seats"
                      type="number"
                      min={1}
                      disabled={isArchived}
                      {...form.register("total_seats")}
                    />
                  </div>

                  {!isArchived && (
                    <div className="flex items-center justify-end gap-3 pt-2 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => form.reset()}
                        disabled={isSaving || !form.formState.isDirty}
                      >
                        Discard
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSaving || !form.formState.isDirty}
                      >
                        {isSaving && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {isSaving ? "Saving…" : "Save Changes"}
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Recording Upload — show for completed events */}
            {(isCompleted || event.has_recording) && (
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <VideoIcon className="h-4 w-4" />
                    Event Recording
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={recForm.handleSubmit(onUploadRecording)}
                    className="space-y-4"
                  >
                    <div className="space-y-1.5">
                      <Label htmlFor="recording_url">
                        Recording URL{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="recording_url"
                        placeholder="https://..."
                        disabled={isArchived}
                        {...recForm.register("recording_url")}
                      />
                      {recForm.formState.errors.recording_url && (
                        <p className="text-xs text-destructive">
                          {recForm.formState.errors.recording_url.message}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border p-3">
                      <Switch
                        checked={recForm.watch("is_youtube_video")}
                        onCheckedChange={(v) =>
                          recForm.setValue("is_youtube_video", v, {
                            shouldValidate: true,
                          })
                        }
                        disabled={isArchived}
                      />
                      <div>
                        <p className="text-sm font-medium">YouTube Video</p>
                        <p className="text-xs text-muted-foreground">
                          Turn on if recording URL is a YouTube link
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="recording_duration">Duration</Label>
                        <Input
                          id="recording_duration"
                          placeholder="e.g. 2h 45m"
                          disabled={isArchived}
                          {...recForm.register("recording_duration")}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="recorded_at">Recorded Date</Label>
                        <Input
                          id="recorded_at"
                          type="date"
                          disabled={isArchived}
                          {...recForm.register("recorded_at")}
                        />
                      </div>
                    </div>
                    {!isArchived && (
                      <div className="flex justify-end">
                        <Button type="submit" disabled={isUploading}>
                          {isUploading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          {event.has_recording
                            ? "Update Recording"
                            : "Upload Recording"}
                        </Button>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === "registrations" && (
          <Card className="border-none shadow-sm">
            <CardContent className="p-0">
              {isLoadingRegs ? (
                <div className="divide-y">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 px-6 py-3.5"
                    >
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : registrations.length === 0 ? (
                <div className="py-16 text-center text-sm text-muted-foreground">
                  No registrations yet.
                </div>
              ) : (
                <div className="divide-y">
                  {registrations.map((reg: any) => (
                    <div
                      key={reg.id}
                      className="flex items-center gap-4 px-6 py-3.5 hover:bg-muted/30 transition-colors"
                    >
                      <div className="p-2 rounded-full bg-muted shrink-0">
                        <Users className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          {reg.student_name ?? "Unknown Student"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {reg.student_email ?? reg.student_id}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize",
                          reg.status === "registered"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-red-50 text-red-700 border-red-200",
                        )}
                      >
                        {reg.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(reg.registered_at)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
