"use client";

import { useEffect } from "react";
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
  onSubmit: (data: CourseFormData) => void;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    reset,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema as any),
    defaultValues: { studyMode: "full_time" },
  });

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
      });
    } else {
      reset({
        studyMode: "full_time",
      });
    }
  }, [editingCourse, reset]);

  return (
    <Card className="border border-border/80 shadow-md bg-card/60 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-indigo-500" /> Basic Details
        </CardTitle>
        <CardDescription>
          Primary properties of this academic program.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name" className="font-semibold text-foreground">
                Course Name *
              </Label>
              <Input
                id="name"
                placeholder="e.g. B.Tech Computer Science"
                {...register("name")}
              />
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
                onValueChange={(val) => {
                  setValue("disciplineId", val);
                  trigger("disciplineId");
                }}
                defaultValue={editingCourse?.disciplineId}
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
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
