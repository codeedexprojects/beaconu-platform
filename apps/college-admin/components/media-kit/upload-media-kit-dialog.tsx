"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCollegeCoursesMinimal } from "@/hooks/use-colleges";
import { useCreateMediaKit } from "@/hooks/use-media-kit";
import { uploadCollegeAdminFile } from "@/lib/services/colleges.service";
import { getErrorMessage } from "@/lib/api";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024;

const uploadSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required"),
    asset_type: z.enum(["poster", "video", "brochure"]),
    scope: z.enum(["campus_wide", "course_specific"]),
    course_id: z.string().optional(),
  })
  .refine((data) => data.scope !== "course_specific" || !!data.course_id, {
    message: "Select a course",
    path: ["course_id"],
  });
type UploadFormValues = z.infer<typeof uploadSchema>;

export function UploadMediaKitDialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: courses } = useCollegeCoursesMinimal(open);
  const { mutate: create, isPending: isCreating } = useCreateMediaKit();

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      asset_type: "poster",
      scope: "campus_wide",
      course_id: "",
    },
  });

  const scope = form.watch("scope");
  const assetType = form.watch("asset_type");
  const isPending = uploading || isCreating;

  function resetAndClose() {
    form.reset();
    setFile(null);
    setOpen(false);
  }

  async function onSubmit(values: UploadFormValues) {
    if (!file) {
      toast.error("Choose a file to upload");
      return;
    }
    const maxSize =
      values.asset_type === "video"
        ? MAX_VIDEO_SIZE_BYTES
        : MAX_FILE_SIZE_BYTES;
    if (file.size > maxSize) {
      toast.error(`File must not exceed ${maxSize / (1024 * 1024)} MB`);
      return;
    }

    setUploading(true);
    try {
      const fileUrl = await uploadCollegeAdminFile(file, "media-kit");
      create(
        {
          title: values.title,
          asset_type: values.asset_type,
          scope: values.scope,
          course_id:
            values.scope === "course_specific" ? values.course_id : undefined,
          file_url: fileUrl,
          file_name: file.name,
          file_size_bytes: file.size,
        },
        {
          onSuccess: () => {
            toast.success("Media kit item uploaded");
            resetAndClose();
          },
        },
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => (v ? setOpen(true) : resetAndClose())}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          Upload Asset
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Media Kit Asset</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input {...form.register("title")} />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Asset Type</Label>
            <Select
              value={assetType}
              onValueChange={(v) =>
                form.setValue("asset_type", v as UploadFormValues["asset_type"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="poster">Poster</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="brochure">Brochure</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Scope</Label>
            <Select
              value={scope}
              onValueChange={(v) => {
                form.setValue("scope", v as UploadFormValues["scope"]);
                if (v === "campus_wide") form.setValue("course_id", "");
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="campus_wide">Campus Wide</SelectItem>
                <SelectItem value="course_specific">Course Specific</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {scope === "course_specific" && (
            <div className="space-y-1.5">
              <Label>Course</Label>
              <Select
                value={form.watch("course_id")}
                onValueChange={(v) => form.setValue("course_id", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.course_id && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.course_id.message}
                </p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <Label>File</Label>
            <Input
              type="file"
              accept={
                assetType === "video"
                  ? "video/mp4,video/webm,video/quicktime"
                  : assetType === "brochure"
                    ? "application/pdf"
                    : "image/jpeg,image/png,image/webp"
              }
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <p className="text-xs text-muted-foreground">
              {assetType === "video" ? "Up to 50 MB" : "Up to 10 MB"}
            </p>
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            Upload
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
