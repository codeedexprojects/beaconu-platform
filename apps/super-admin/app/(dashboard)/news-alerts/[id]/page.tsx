"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Globe, Archive, Loader2, Clock } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useNewsAlert,
  useUpdateNewsAlert,
  usePublishNewsAlert,
  useArchiveNewsAlert,
} from "@/hooks/use-news-alerts";

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
    hour: "2-digit",
    minute: "2-digit",
  });
}

const schema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  summary: z.string().trim().max(500).optional(),
  content: z.string().trim().min(1, "Content is required"),
  cover_image_url: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),
  tags_input: z.string().optional(),
  source: z.string().trim().max(500).optional(),
});

type FormInput = z.infer<typeof schema>;

export default function NewsAlertDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: alert, isLoading } = useNewsAlert(id);
  const { mutate: update, isPending: isSaving } = useUpdateNewsAlert();
  const { mutate: publish, isPending: isPublishing } = usePublishNewsAlert();
  const { mutate: archive, isPending: isArchiving } = useArchiveNewsAlert();

  const isArchived = alert?.status === "archived";

  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      summary: "",
      content: "",
      cover_image_url: "",
      tags_input: "",
      source: "",
    },
  });

  useEffect(() => {
    if (!alert) return;
    const tags = Array.isArray(alert.tags) ? alert.tags : [];
    form.reset({
      title: alert.title,
      summary: alert.summary ?? "",
      content: alert.content,
      cover_image_url: alert.coverImageUrl ?? "",
      tags_input: tags.join(", "),
      source: alert.source ?? "",
    });
  }, [alert, form]);

  function onSubmit(data: FormInput) {
    const tags = data.tags_input
      ? data.tags_input
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    update(
      {
        id,
        data: {
          title: data.title,
          summary: data.summary || undefined,
          content: data.content,
          cover_image_url: data.cover_image_url || undefined,
          tags: tags.length > 0 ? tags : [],
          source: data.source || undefined,
        },
      },
      {
        onSuccess: () => toast.success("Changes saved"),
      },
    );
  }

  function handlePublish() {
    publish(id, {
      onSuccess: () => toast.success("News alert published"),
    });
  }

  function handleArchive() {
    archive(id, {
      onSuccess: () => {
        toast.success("News alert archived");
        router.push("/news-alerts");
      },
    });
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-full">
        <Header title="News Alert" />
        <div className="flex-1 p-6 space-y-4 max-w-3xl">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="flex flex-col min-h-full">
        <Header title="News Alert" />
        <div className="flex-1 p-6 text-center text-muted-foreground text-sm py-16">
          News alert not found.{" "}
          <Link href="/news-alerts" className="text-primary hover:underline">
            Back to list
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header title="News Alert" description={alert.title}>
        <div className="flex items-center gap-2">
          {alert.status === "draft" && (
            <Button
              size="sm"
              className="gap-1.5"
              disabled={isPublishing || isSaving}
              onClick={handlePublish}
            >
              {isPublishing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Globe className="h-4 w-4" />
              )}
              {isPublishing ? "Publishing…" : "Publish"}
            </Button>
          )}
          {!isArchived && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-muted-foreground"
              disabled={isArchiving || isSaving}
              onClick={handleArchive}
            >
              {isArchiving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Archive className="h-4 w-4" />
              )}
              {isArchiving ? "Archiving…" : "Archive"}
            </Button>
          )}
        </div>
      </Header>

      <div className="flex-1 p-6 space-y-5 max-w-3xl">
        <Link
          href="/news-alerts"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to News & Alerts
        </Link>

        {/* Status + timestamps */}
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
              STATUS_BADGE[alert.status],
            )}
          >
            {alert.status}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {alert.publishedAt
              ? `Published ${formatDate(alert.publishedAt)}`
              : `Created ${formatDate(alert.createdAt)}`}
          </span>
        </div>

        {isArchived && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
            This alert is archived and cannot be edited.
          </div>
        )}

        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                <Label htmlFor="summary">
                  Summary{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="summary"
                  rows={2}
                  className="resize-none"
                  disabled={isArchived}
                  {...form.register("summary")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="content">
                  Content <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="content"
                  rows={14}
                  className="resize-y"
                  disabled={isArchived}
                  {...form.register("content")}
                />
                {form.formState.errors.content && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.content.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cover_image_url">
                  Cover Image URL{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="cover_image_url"
                  type="url"
                  disabled={isArchived}
                  {...form.register("cover_image_url")}
                />
                {form.formState.errors.cover_image_url && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.cover_image_url.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tags_input">
                  Tags{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional, comma-separated)
                  </span>
                </Label>
                <Input
                  id="tags_input"
                  placeholder="e.g. NEET, Medical, Entrance"
                  disabled={isArchived}
                  {...form.register("tags_input")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="source">
                  Source{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="source"
                  disabled={isArchived}
                  {...form.register("source")}
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
      </div>
    </div>
  );
}
