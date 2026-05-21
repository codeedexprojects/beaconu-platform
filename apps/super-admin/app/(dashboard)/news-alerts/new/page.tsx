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
import { useCreateNewsAlert } from "@/hooks/use-news-alerts";

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

export default function NewNewsAlertPage() {
  const router = useRouter();
  const { mutate, isPending } = useCreateNewsAlert();

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

  function onSubmit(data: FormInput) {
    const tags = data.tags_input
      ? data.tags_input
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
    mutate(
      {
        title: data.title,
        summary: data.summary || undefined,
        content: data.content,
        cover_image_url: data.cover_image_url || undefined,
        tags: tags.length > 0 ? tags : undefined,
        source: data.source || undefined,
      },
      {
        onSuccess: () => {
          toast.success("News alert saved as draft");
          router.push("/news-alerts");
        },
      },
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="New News Alert"
        description="Saved as draft — publish from the list when ready"
      />

      <div className="flex-1 p-6">
        <Card className="border-none shadow-sm max-w-3xl">
          <CardContent className="pt-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. NEET PG Exam Dates Announced"
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
                  placeholder="Brief summary shown in listings (max 500 chars)"
                  className="resize-none"
                  {...form.register("summary")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="content">
                  Content <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="content"
                  rows={12}
                  placeholder="Write the full alert or news content here…"
                  className="resize-y"
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
                  placeholder="https://example.com/image.jpg"
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
                  placeholder="e.g. NTA, Ministry of Education"
                  {...form.register("source")}
                />
              </div>

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
