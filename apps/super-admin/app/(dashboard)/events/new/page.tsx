"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ui/image-upload";
import { useCreateEvent } from "@/hooks/use-events";

const schema = z.object({
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
  event_mode: z.enum(["online", "offline", "hybrid"], {
    required_error: "Select an event mode",
  }),
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

type FormInput = z.infer<typeof schema>;

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

export default function NewEventPage() {
  const router = useRouter();
  const { mutate, isPending } = useCreateEvent();

  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
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

  const isFree = form.watch("is_free");
  const eventMode = form.watch("event_mode");

  function onSubmit(data: FormInput) {
    mutate(
      {
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
      {
        onSuccess: () => {
          toast.success("Event saved as draft");
          router.push("/events");
        },
      },
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Create Event"
        description="Saved as draft — publish from the events list when ready"
      />

      <div className="flex-1 p-6">
        <Card className="border-none shadow-sm max-w-3xl">
          <CardContent className="pt-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. Career Guidance Workshop 2025"
                  {...form.register("title")}
                />
                {form.formState.errors.title && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="description">
                  Description{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="description"
                  rows={4}
                  placeholder="Describe the event in detail…"
                  className="resize-y"
                  {...form.register("description")}
                />
              </div>

              {/* Cover Image */}
              <ImageUpload
                label="Cover Image"
                value={form.watch("cover_image_url") ?? ""}
                onChange={(url) =>
                  form.setValue("cover_image_url", url, {
                    shouldValidate: true,
                  })
                }
                context="event-covers"
              />

              {/* Category + Event Mode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={form.watch("category")}
                    onValueChange={(v) =>
                      form.setValue("category", v, { shouldValidate: true })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c} className="capitalize">
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.category && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.category.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label>
                    Event Mode <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={form.watch("event_mode")}
                    onValueChange={(v) =>
                      form.setValue(
                        "event_mode",
                        v as "online" | "offline" | "hybrid",
                        {
                          shouldValidate: true,
                        },
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="offline">Offline</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Speaker Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="speaker_name">Speaker Name</Label>
                  <Input
                    id="speaker_name"
                    placeholder="e.g. Dr. Priya Sharma"
                    {...form.register("speaker_name")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="speaker_title">Speaker Title</Label>
                  <Input
                    id="speaker_title"
                    placeholder="e.g. Career Counsellor"
                    {...form.register("speaker_title")}
                  />
                </div>
              </div>

              {/* Organizer */}
              <div className="space-y-1.5">
                <Label htmlFor="organizer">Organizer</Label>
                <Input
                  id="organizer"
                  placeholder="e.g. BeaconU"
                  {...form.register("organizer")}
                />
              </div>

              {/* Date + Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="event_date">
                    Event Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="event_date"
                    type="date"
                    {...form.register("event_date")}
                  />
                  {form.formState.errors.event_date && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.event_date.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="time"
                    {...form.register("start_time")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="time"
                    {...form.register("end_time")}
                  />
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-1.5">
                <Label htmlFor="duration">
                  Duration{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="duration"
                  placeholder="e.g. 3 hours"
                  {...form.register("duration")}
                />
              </div>

              {/* Venue / Online Link (conditional) */}
              {(eventMode === "offline" || eventMode === "hybrid") && (
                <div className="space-y-1.5">
                  <Label htmlFor="venue">Venue</Label>
                  <Input
                    id="venue"
                    placeholder="e.g. BeaconU Hub, Bangalore"
                    {...form.register("venue")}
                  />
                </div>
              )}
              {(eventMode === "online" || eventMode === "hybrid") && (
                <div className="space-y-1.5">
                  <Label htmlFor="online_link">Online Link</Label>
                  <Input
                    id="online_link"
                    placeholder="e.g. https://zoom.us/j/..."
                    {...form.register("online_link")}
                  />
                  {form.formState.errors.online_link && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.online_link.message}
                    </p>
                  )}
                </div>
              )}

              {/* Free / Paid toggle */}
              <div className="flex items-center gap-3 rounded-lg border p-4">
                <Switch
                  checked={isFree}
                  onCheckedChange={(v) => form.setValue("is_free", v)}
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
                    {...form.register("ticket_price")}
                  />
                </div>
              )}

              {/* Total Seats */}
              <div className="space-y-1.5">
                <Label htmlFor="total_seats">
                  Total Seats{" "}
                  <span className="text-muted-foreground font-normal">
                    (leave empty for unlimited)
                  </span>
                </Label>
                <Input
                  id="total_seats"
                  type="number"
                  min={1}
                  placeholder="e.g. 200"
                  {...form.register("total_seats")}
                />
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isPending ? "Saving…" : "Save as Draft"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
