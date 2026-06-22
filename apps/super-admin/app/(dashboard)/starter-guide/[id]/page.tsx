"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Eye, EyeOff, Video, Upload } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useStarterGuideVideo,
  useUpdateStarterGuideVideo,
  useDeactivateStarterGuideVideo,
  useActivateStarterGuideVideo,
  usePresignStarterGuideVideoUpload,
} from "@/hooks/use-starter-guide-videos";

const schema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  display_order: z.coerce.number().int().min(0),
});
type FormValues = z.infer<typeof schema>;

export default function StarterGuideVideoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const fileRef = useRef<HTMLInputElement>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  const { data: video, isLoading } = useStarterGuideVideo(id);
  const { mutate: update, isPending: isUpdating } =
    useUpdateStarterGuideVideo();
  const { mutate: deactivate, isPending: isDeactivating } =
    useDeactivateStarterGuideVideo();
  const { mutate: activate, isPending: isActivating } =
    useActivateStarterGuideVideo();
  const { mutateAsync: presign } = usePresignStarterGuideVideoUpload();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", display_order: 0 },
  });

  useEffect(() => {
    if (video) {
      form.reset({ title: video.title, display_order: video.displayOrder });
    }
  }, [video, form]);

  async function onSubmit(values: FormValues) {
    let videoKey: string | undefined;

    if (newFile) {
      try {
        setIsUploadingVideo(true);
        const mime = newFile.type as "video/mp4" | "video/webm";
        const { uploadUrl, key } = await presign({
          mime_type: mime,
          file_size_bytes: newFile.size,
        });
        await fetch(uploadUrl, {
          method: "PUT",
          body: newFile,
          headers: { "Content-Type": mime },
        });
        videoKey = key;
      } catch {
        setIsUploadingVideo(false);
        return;
      } finally {
        setIsUploadingVideo(false);
      }
    }

    update(
      {
        id,
        data: {
          title: values.title,
          display_order: values.display_order,
          ...(videoKey ? { video_key: videoKey } : {}),
        },
      },
      { onSuccess: () => toast.success("Video updated") },
    );
  }

  const isStatusPending = isDeactivating || isActivating;
  const isSaving = isUpdating || isUploadingVideo;

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-full">
        <div className="border-b bg-background px-6 py-4">
          <Skeleton className="h-7 w-48 mb-1" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="p-6 max-w-xl space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!video) return null;

  return (
    <div className="flex flex-col min-h-full">
      <Header title={video.title} description={`ID: ${video.id}`}>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
              video.isActive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-gray-50 text-gray-500 border-gray-200",
            )}
          >
            {video.isActive ? "Active" : "Inactive"}
          </span>
          {video.isActive ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={isStatusPending}
              onClick={() =>
                deactivate(id, {
                  onSuccess: () => toast.success("Video deactivated"),
                })
              }
            >
              {isDeactivating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <EyeOff className="h-3.5 w-3.5" />
              )}
              Deactivate
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={isStatusPending}
              onClick={() =>
                activate(id, {
                  onSuccess: () => toast.success("Video activated"),
                })
              }
            >
              {isActivating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
              Activate
            </Button>
          )}
          <Link href="/starter-guide">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Button>
          </Link>
        </div>
      </Header>

      <div className="flex-1 p-6 max-w-xl space-y-6">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Current Video
            </CardTitle>
          </CardHeader>
          <CardContent>
            <video
              src={video.videoUrl}
              controls
              className="w-full rounded-md max-h-56 bg-black"
            />
          </CardContent>
        </Card>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...form.register("title")} />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_order">Display Order</Label>
            <Input
              id="display_order"
              type="number"
              min={0}
              {...form.register("display_order")}
            />
          </div>

          <div className="space-y-2">
            <Label>Replace Video </Label>
            <div
              className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {newFile ? (
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Video className="h-4 w-4 text-primary" />
                  <span className="font-medium truncate max-w-xs">
                    {newFile.name}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    ({(newFile.size / 1024 / 1024).toFixed(1)} MB)
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                  <Upload className="h-4 w-4" />
                  <span>Click to select a new video</span>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="video/mp4,video/webm"
              className="hidden"
              onChange={(e) => setNewFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <Button type="submit" disabled={isSaving} className="w-full gap-2">
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isUploadingVideo ? "Uploading video…" : "Save Changes"}
          </Button>
        </form>
      </div>
    </div>
  );
}
