"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import * as z from "zod";
import { BookOpen, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePublicCourses } from "@/hooks/use-public-courses";
import type { PublicCourseMaster } from "@/lib/services/public-courses.service";
import { ImageUpload } from "@/components/ui/image-upload";

export const courseSchema = z.object({
  name: z.string().min(2, "Course name is required"),
  code: z
    .string()
    .min(2, "Course code is required")
    .regex(
      /^[A-Z0-9-]+$/,
      "Course code can only contain uppercase letters, numbers, and hyphens",
    ),
  disciplineId: z.string().min(1, "Discipline is required"),
  studyLevelId: z.string().min(1, "Study level is required"),
  programTypeId: z.string().min(1, "Program type is required"),
  studyMode: z.string().min(1, "Study mode is required"),
  campusId: z.string().optional().or(z.literal("")),
  duration: z.string().optional().nullable(),
  intakeCapacity: z.coerce.number().optional().nullable(),
  eligibility: z.string().optional().nullable(),
  coverImageUrl: z.string().optional().nullable(),
});

export type CourseFormData = z.infer<typeof courseSchema>;

export function BasicDetailsTab({
  editingCourse,
  disciplines,
  studyLevels,
  programTypes,
  campuses,
  isCreating,
  isUpdating,
  uploadingField,
  onFieldUpload,
  onSubmit,
  onCancel,
}: {
  editingCourse: any | null;
  disciplines: any[];
  studyLevels: any[];
  programTypes: any[];
  campuses: any[];
  isCreating: boolean;
  isUpdating: boolean;
  uploadingField: string | null;
  onFieldUpload: (
    file: File | null,
    fieldKey: string,
    s3PathSuffix: string,
    onSuccess: (url: string) => void,
  ) => void;
  onSubmit: (data: CourseFormData) => void;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    trigger,
    reset,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema as any),
    defaultValues: { studyMode: "full_time" },
  });

  const [nameQuery, setNameQuery] = useState("");
  const [debouncedNameQuery, setDebouncedNameQuery] = useState("");
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  // Set only when a suggestion is actually picked this session — locks the
  // Discipline field to the selection's discipline. Left null when editing
  // an existing course whose name/discipline predate this catalog-only
  // requirement, so those stay editable until re-picked.
  const [selectedCourse, setSelectedCourse] =
    useState<PublicCourseMaster | null>(null);
  const nameFieldRef = useRef<HTMLDivElement>(null);
  const watchedDisciplineId = watch("disciplineId");
  const watchedCoverImageUrl = watch("coverImageUrl");

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedNameQuery(nameQuery), 300);
    return () => clearTimeout(handle);
  }, [nameQuery]);

  const { data: courseSuggestions = [], isFetching: isFetchingSuggestions } =
    usePublicCourses(debouncedNameQuery);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        nameFieldRef.current &&
        !nameFieldRef.current.contains(e.target as Node)
      ) {
        setIsSuggestionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (editingCourse) {
      reset({
        name: editingCourse.name || "",
        code: editingCourse.code || "",
        disciplineId: editingCourse.disciplineId || "",
        studyLevelId: editingCourse.studyLevelId || "",
        programTypeId: editingCourse.programTypeId || "",
        studyMode: editingCourse.studyMode || "full_time",
        campusId: editingCourse.campusId || "",
        duration: editingCourse.duration || "",
        intakeCapacity: editingCourse.intakeCapacity || null,
        eligibility: editingCourse.eligibility || "",
        coverImageUrl: editingCourse.coverImageUrl || "",
      });
      setNameQuery(editingCourse.name || "");
    } else {
      reset({
        studyMode: "full_time",
      });
      setNameQuery("");
    }
    setSelectedCourse(null);
  }, [editingCourse, reset]);

  return (
    <Card className="border border-border/80 shadow-md bg-card/60 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" /> Basic Details
        </CardTitle>
        <CardDescription>
          Primary properties of this academic program.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div
              className="space-y-2 md:col-span-2 relative"
              ref={nameFieldRef}
            >
              <Label htmlFor="name" className="font-semibold text-foreground">
                Course Name *
              </Label>
              <Input
                id="name"
                placeholder="Search the course catalog…"
                autoComplete="off"
                value={nameQuery}
                onChange={(e) => {
                  // Typing only drives search — it never sets the actual
                  // form value. Only picking a suggestion below does, so an
                  // unselected search string can't be submitted as a name.
                  setNameQuery(e.target.value);
                  setIsSuggestionsOpen(true);
                }}
                onFocus={() => setIsSuggestionsOpen(true)}
                onBlur={() => {
                  // Snap the visible text back to the last real selection
                  // if the user typed without picking anything.
                  setTimeout(() => {
                    setNameQuery(getValues("name") || "");
                  }, 150);
                }}
              />
              {isSuggestionsOpen && debouncedNameQuery.trim().length >= 2 && (
                <div className="absolute z-20 mt-1 w-full rounded-md border bg-popover shadow-md max-h-64 overflow-y-auto">
                  {isFetchingSuggestions ? (
                    <div className="px-3 py-2 text-xs text-muted-foreground">
                      Searching…
                    </div>
                  ) : courseSuggestions.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-muted-foreground">
                      No matching course in the catalog. Ask a platform admin to
                      add it under Academic Masters → Courses.
                    </div>
                  ) : (
                    courseSuggestions.map((course) => (
                      <button
                        type="button"
                        key={course.id}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                        onClick={() => {
                          setNameQuery(course.name);
                          setValue("name", course.name);
                          setValue("disciplineId", course.discipline.id);
                          trigger("name");
                          trigger("disciplineId");
                          setSelectedCourse(course);
                          setIsSuggestionsOpen(false);
                        }}
                      >
                        <p className="font-medium">{course.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {course.stream.name} &gt; {course.discipline.name}
                          {course.studyLevel
                            ? ` · ${course.studyLevel.name}`
                            : ""}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Must be selected from the platform course catalog — Discipline
                fills in automatically once you pick one.
              </p>
              {errors.name && (
                <p className="text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code" className="font-semibold text-foreground">
                Course Code *
              </Label>
              <Input
                id="code"
                placeholder="e.g. BTECH-CS"
                className="uppercase"
                {...register("code")}
                onKeyDown={(e) => {
                  if (e.key === " ") e.preventDefault();
                }}
              />
              {errors.code && (
                <p className="text-xs text-destructive">
                  {errors.code.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-foreground">
                Discipline *
              </Label>
              <Select
                value={watchedDisciplineId || undefined}
                onValueChange={(val) => {
                  setValue("disciplineId", val);
                  trigger("disciplineId");
                }}
                disabled={!!selectedCourse}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select discipline" />
                </SelectTrigger>
                <SelectContent>
                  {disciplines.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name} ({d.streamName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCourse && (
                <p className="text-xs text-muted-foreground">
                  Set from the selected course — pick a different course to
                  change it.
                </p>
              )}
              {errors.disciplineId && (
                <p className="text-xs text-destructive">
                  {errors.disciplineId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-foreground">
                Study Level *
              </Label>
              <Select
                onValueChange={(val) => {
                  setValue("studyLevelId", val);
                  trigger("studyLevelId");
                }}
                defaultValue={editingCourse?.studyLevelId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {studyLevels.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.studyLevelId && (
                <p className="text-xs text-destructive">
                  {errors.studyLevelId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-foreground">
                Program Type *
              </Label>
              <Select
                onValueChange={(val) => {
                  setValue("programTypeId", val);
                  trigger("programTypeId");
                }}
                defaultValue={editingCourse?.programTypeId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {programTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.programTypeId && (
                <p className="text-xs text-destructive">
                  {errors.programTypeId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-foreground">Campus</Label>
              <Select
                onValueChange={(val) => {
                  setValue("campusId", val);
                  trigger("campusId");
                }}
                defaultValue={editingCourse?.campusId || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select campus" />
                </SelectTrigger>
                <SelectContent>
                  {campuses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} {c.isMainCampus && "(Main)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-foreground">
                Study Mode *
              </Label>
              <Select
                onValueChange={(val) => {
                  setValue("studyMode", val);
                  trigger("studyMode");
                }}
                defaultValue={editingCourse?.studyMode || "full_time"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full Time</SelectItem>
                  <SelectItem value="part_time">Part Time</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="distance">Distance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="duration"
                className="font-semibold text-foreground"
              >
                Duration
              </Label>
              <Input
                id="duration"
                placeholder="e.g. 4 Years"
                {...register("duration")}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="intakeCapacity"
                className="font-semibold text-foreground"
              >
                Intake Capacity
              </Label>
              <Input
                id="intakeCapacity"
                type="number"
                placeholder="e.g. 60"
                {...register("intakeCapacity")}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="font-semibold text-foreground">
                Course Photo
              </Label>
              <ImageUpload
                value={watchedCoverImageUrl || ""}
                onChange={(url) =>
                  setValue("coverImageUrl", url, { shouldDirty: true })
                }
                context="courses/cover"
                className="max-w-sm"
              />
              <p className="text-xs text-muted-foreground">
                Shown on course cards on your public landing page.
              </p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label
                htmlFor="eligibility"
                className="font-semibold text-foreground"
              >
                Eligibility Criteria Text
              </Label>
              <Textarea
                id="eligibility"
                placeholder="e.g. 10+2 with 50% marks in PCM..."
                rows={3}
                {...register("eligibility")}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating || isUpdating}
              className="font-semibold"
            >
              {(isCreating || isUpdating) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save & Continue
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
