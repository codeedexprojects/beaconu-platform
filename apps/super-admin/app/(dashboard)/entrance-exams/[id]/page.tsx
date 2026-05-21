"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, EyeOff, Eye, Clock } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";
import {
  useEntranceExam,
  useUpdateEntranceExam,
  useDeactivateEntranceExam,
  useActivateEntranceExam,
} from "@/hooks/use-entrance-exams";

const EXAM_LEVELS = ["national", "state", "university"] as const;

const STATUS_BADGE: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactive: "bg-gray-50 text-gray-500 border-gray-200",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function toDateInput(val: string | null | undefined): string {
  if (!val) return "";
  return val.split("T")[0];
}

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  code: z.string().trim().min(1, "Code is required").max(20),
  conducting_body: z.string().trim().max(255).optional().or(z.literal("")),
  exam_level: z.enum(EXAM_LEVELS),
  applicable_courses_input: z.string().optional(),
  eligibility: z.string().trim().optional(),
  description: z.string().trim().optional(),
  registration_start: z.string().optional().or(z.literal("")),
  registration_end: z.string().optional().or(z.literal("")),
  exam_date: z.string().optional().or(z.literal("")),
  result_date: z.string().optional().or(z.literal("")),
  official_website: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),
  status: z.enum(["active", "inactive"]),
});

type FormInput = z.infer<typeof schema>;

export default function EntranceExamDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: exam, isLoading } = useEntranceExam(id);
  const { mutate: update, isPending: isSaving } = useUpdateEntranceExam();
  const { mutate: deactivate, isPending: isDeactivating } =
    useDeactivateEntranceExam();
  const { mutate: activate, isPending: isActivating } =
    useActivateEntranceExam();

  const isInactive = exam?.status === "inactive";

  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      code: "",
      conducting_body: "",
      exam_level: "national",
      applicable_courses_input: "",
      eligibility: "",
      description: "",
      registration_start: "",
      registration_end: "",
      exam_date: "",
      result_date: "",
      official_website: "",
      status: "active",
    },
  });

  useEffect(() => {
    if (!exam) return;
    const courses = Array.isArray(exam.applicableCourses)
      ? exam.applicableCourses
      : [];
    form.reset({
      name: exam.name,
      code: exam.code,
      conducting_body: exam.conductingBody ?? "",
      exam_level: exam.examLevel as (typeof EXAM_LEVELS)[number],
      applicable_courses_input: courses.join(", "),
      eligibility: exam.eligibility ?? "",
      description: exam.description ?? "",
      registration_start: toDateInput(exam.registrationStart),
      registration_end: toDateInput(exam.registrationEnd),
      exam_date: toDateInput(exam.examDate),
      result_date: toDateInput(exam.resultDate),
      official_website: exam.officialWebsite ?? "",
      status: exam.status,
    });
  }, [exam, form]);

  function onSubmit(data: FormInput) {
    const courses = data.applicable_courses_input
      ? data.applicable_courses_input
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
      : [];

    update(
      {
        id,
        data: {
          name: data.name,
          code: data.code.toUpperCase(),
          conducting_body: data.conducting_body || undefined,
          exam_level: data.exam_level,
          applicable_courses: courses,
          eligibility: data.eligibility || undefined,
          description: data.description || undefined,
          registration_start: data.registration_start || null,
          registration_end: data.registration_end || null,
          exam_date: data.exam_date || null,
          result_date: data.result_date || null,
          official_website: data.official_website || undefined,
          status: data.status,
        },
      },
      {
        onSuccess: () => toast.success("Changes saved"),
      },
    );
  }

  function handleDeactivate() {
    deactivate(id, {
      onSuccess: () => toast.success("Exam deactivated"),
    });
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-full">
        <Header title="Entrance Exam" />
        <div className="flex-1 p-6 space-y-4 max-w-3xl">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="flex flex-col min-h-full">
        <Header title="Entrance Exam" />
        <div className="flex-1 p-6 text-center text-muted-foreground text-sm py-16">
          Exam not found.{" "}
          <Link href="/entrance-exams" className="text-primary hover:underline">
            Back to list
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Entrance Exam" description={exam.name}>
        {exam.status === "active" ? (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-muted-foreground"
            disabled={isDeactivating || isSaving}
            onClick={handleDeactivate}
          >
            {isDeactivating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
            {isDeactivating ? "Deactivating…" : "Deactivate"}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-muted-foreground"
            disabled={isActivating || isSaving}
            onClick={() =>
              activate(id, {
                onSuccess: () => toast.success("Exam activated"),
              })
            }
          >
            {isActivating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            {isActivating ? "Activating…" : "Activate"}
          </Button>
        )}
      </Header>

      <div className="flex-1 p-6 space-y-5 max-w-3xl">
        <Link
          href="/entrance-exams"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Entrance Exams
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
              STATUS_BADGE[exam.status],
            )}
          >
            {exam.status}
          </span>
          <span className="text-xs font-semibold uppercase bg-muted text-muted-foreground px-2.5 py-0.5 rounded-full">
            {exam.examLevel}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Created {formatDate(exam.createdAt)}
          </span>
        </div>

        {isInactive && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
            This exam is inactive and cannot be edited.
          </div>
        )}

        <Card className="border-none shadow-sm">
          <CardContent className="pt-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    disabled={isInactive}
                    {...form.register("name")}
                  />
                  {form.formState.errors.name && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="code">
                    Code <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="code"
                    disabled={isInactive}
                    {...form.register("code")}
                    className="font-mono"
                  />
                  {form.formState.errors.code && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.code.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="exam_level">
                    Exam Level <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={form.watch("exam_level")}
                    disabled={isInactive}
                    onValueChange={(v) =>
                      form.setValue(
                        "exam_level",
                        v as (typeof EXAM_LEVELS)[number],
                        {
                          shouldDirty: true,
                        },
                      )
                    }
                  >
                    <SelectTrigger id="exam_level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXAM_LEVELS.map((l) => (
                        <SelectItem key={l} value={l} className="capitalize">
                          {l.charAt(0).toUpperCase() + l.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="conducting_body">Conducting Body</Label>
                  <Input
                    id="conducting_body"
                    disabled={isInactive}
                    {...form.register("conducting_body")}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="applicable_courses_input">
                  Applicable Courses{" "}
                  <span className="text-muted-foreground font-normal">
                    (comma-separated)
                  </span>
                </Label>
                <Input
                  id="applicable_courses_input"
                  disabled={isInactive}
                  placeholder="e.g. B.Tech, BE, B.Arch"
                  {...form.register("applicable_courses_input")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="eligibility">Eligibility</Label>
                <Textarea
                  id="eligibility"
                  rows={3}
                  className="resize-none"
                  disabled={isInactive}
                  {...form.register("eligibility")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={5}
                  className="resize-y"
                  disabled={isInactive}
                  {...form.register("description")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="registration_start">Registration Start</Label>
                  <Input
                    id="registration_start"
                    type="date"
                    disabled={isInactive}
                    {...form.register("registration_start")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="registration_end">Registration End</Label>
                  <Input
                    id="registration_end"
                    type="date"
                    disabled={isInactive}
                    {...form.register("registration_end")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="exam_date">Exam Date</Label>
                  <Input
                    id="exam_date"
                    type="date"
                    disabled={isInactive}
                    {...form.register("exam_date")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="result_date">Result Date</Label>
                  <Input
                    id="result_date"
                    type="date"
                    disabled={isInactive}
                    {...form.register("result_date")}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="official_website">Official Website</Label>
                <Input
                  id="official_website"
                  type="url"
                  disabled={isInactive}
                  {...form.register("official_website")}
                />
                {form.formState.errors.official_website && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.official_website.message}
                  </p>
                )}
              </div>

              {!isInactive && (
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
