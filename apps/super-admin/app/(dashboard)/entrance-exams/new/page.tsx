"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
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
import { useCreateEntranceExam } from "@/hooks/use-entrance-exams";

const EXAM_LEVELS = ["national", "state", "university"] as const;

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  code: z.string().trim().min(1, "Code is required").max(20),
  conducting_body: z.string().trim().max(255).optional().or(z.literal("")),
  exam_level: z.enum(EXAM_LEVELS, { error: "Exam level is required" }),
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
});

type FormInput = z.infer<typeof schema>;

export default function NewEntranceExamPage() {
  const router = useRouter();
  const { mutate: create, isPending } = useCreateEntranceExam();

  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      code: "",
      conducting_body: "",
      exam_level: undefined,
      applicable_courses_input: "",
      eligibility: "",
      description: "",
      registration_start: "",
      registration_end: "",
      exam_date: "",
      result_date: "",
      official_website: "",
    },
  });

  function onSubmit(data: FormInput) {
    const courses = data.applicable_courses_input
      ? data.applicable_courses_input
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
      : [];

    create(
      {
        name: data.name,
        code: data.code.toUpperCase(),
        conducting_body: data.conducting_body || undefined,
        exam_level: data.exam_level,
        applicable_courses: courses,
        eligibility: data.eligibility || undefined,
        description: data.description || undefined,
        registration_start: data.registration_start || undefined,
        registration_end: data.registration_end || undefined,
        exam_date: data.exam_date || undefined,
        result_date: data.result_date || undefined,
        official_website: data.official_website || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Entrance exam created");
          router.push("/entrance-exams");
        },
      },
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header title="New Entrance Exam" />

      <div className="flex-1 p-6 space-y-5 max-w-3xl">
        <Link
          href="/entrance-exams"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Entrance Exams
        </Link>

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
                    placeholder="e.g. JEE Main"
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
                    placeholder="e.g. JEE-MAIN"
                    {...form.register("code")}
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
                    onValueChange={(v) =>
                      form.setValue(
                        "exam_level",
                        v as (typeof EXAM_LEVELS)[number],
                        {
                          shouldValidate: true,
                        },
                      )
                    }
                  >
                    <SelectTrigger id="exam_level">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXAM_LEVELS.map((l) => (
                        <SelectItem key={l} value={l} className="capitalize">
                          {l.charAt(0).toUpperCase() + l.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.exam_level && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.exam_level.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="conducting_body">
                    Conducting Body{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="conducting_body"
                    placeholder="e.g. NTA"
                    {...form.register("conducting_body")}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="applicable_courses_input">
                  Applicable Courses{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional, comma-separated)
                  </span>
                </Label>
                <Input
                  id="applicable_courses_input"
                  placeholder="e.g. B.Tech, BE, B.Arch"
                  {...form.register("applicable_courses_input")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="eligibility">
                  Eligibility{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="eligibility"
                  rows={3}
                  className="resize-none"
                  placeholder="Describe eligibility criteria…"
                  {...form.register("eligibility")}
                />
              </div>

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
                  className="resize-y"
                  placeholder="About the exam…"
                  {...form.register("description")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="registration_start">Registration Start</Label>
                  <Input
                    id="registration_start"
                    type="date"
                    {...form.register("registration_start")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="registration_end">Registration End</Label>
                  <Input
                    id="registration_end"
                    type="date"
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
                    {...form.register("exam_date")}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="result_date">Result Date</Label>
                  <Input
                    id="result_date"
                    type="date"
                    {...form.register("result_date")}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="official_website">
                  Official Website{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="official_website"
                  type="url"
                  placeholder="https://example.com"
                  {...form.register("official_website")}
                />
                {form.formState.errors.official_website && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.official_website.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/entrance-exams")}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isPending ? "Creating…" : "Create Exam"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
