"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import * as z from "zod";
import { Loader2, ArrowRight, ArrowLeft, Plus, BookOpen } from "lucide-react";
import { toast } from "sonner";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  useCollegeCampuses,
  useCollegeCourses,
  useCollegeProfile,
  useCreateCollegeCourse,
} from "@/hooks/use-colleges";
import {
  useProgramTypes,
  useStreams,
  useStudyLevels,
} from "@/hooks/use-lookups";
import { getCollegeSlugFromPath, getPortalPath } from "@/lib/portal-path";

const courseSchema = z.object({
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
  intakeCapacity: z.coerce
    .number()
    .min(1, "Capacity must be at least 1")
    .max(10000, "Capacity cannot exceed 10000")
    .optional()
    .or(z.literal("")),
  duration: z
    .string()
    .min(2, "Duration must be at least 2 characters")
    .max(50, "Duration cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),
  eligibility: z
    .string()
    .min(2, "Eligibility must be at least 2 characters")
    .max(200, "Eligibility cannot exceed 200 characters")
    .optional()
    .or(z.literal("")),
  campusId: z.string().optional().or(z.literal("")),
});

type CourseFormData = z.infer<typeof courseSchema>;

export default function SetupAcademicsPage() {
  const router = useRouter();
  const collegeSlug =
    typeof window === "undefined"
      ? null
      : getCollegeSlugFromPath(window.location.pathname, window.location.host);
  const [isAdding, setIsAdding] = useState(false);

  const { data: courses = [], isLoading: isLoadingCourses } =
    useCollegeCourses();
  const { data: profile } = useCollegeProfile();
  const { data: streams = [] } = useStreams();
  const { data: studyLevels = [] } = useStudyLevels();
  const { data: programTypes = [] } = useProgramTypes();
  const { data: campuses = [] } = useCollegeCampuses();
  const { mutate: createCourse, isPending } = useCreateCollegeCourse();

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

  const onSubmit = (data: CourseFormData) => {
    createCourse(
      {
        ...data,
        intakeCapacity: data.intakeCapacity || null,
        duration: data.duration || null,
        eligibility: data.eligibility || null,
        campusId: data.campusId || null,
      },
      {
        onSuccess: () => {
          toast.success("Course added successfully");
          setIsAdding(false);
          reset();
        },
      },
    );
  };

  const hasCourses = courses.length > 0;

  const configuredCourseName =
    ((profile?.profileSections?.course_info as any)?.course_name as string) ||
    "";
  const configuredAdmissionDetails =
    ((profile?.profileSections?.course_info as any)?.admissions?.[0]
      ?.basic_details as
      | {
          duration?: string;
          study_mode?: string;
          academic_cycle?: string;
          total_credits?: number;
          course_category?: string;
        }
      | undefined) || undefined;

  // Flatten streams to get all disciplines
  const disciplines = streams.flatMap((s) => {
    if (!Array.isArray(s.disciplines)) return [];
    return s.disciplines.map((d) => ({ ...d, streamName: s.name }));
  });

  if (isLoadingCourses) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
          <div>
            <CardTitle>Academic Programs</CardTitle>
            <CardDescription>
              Add the courses and programs offered by your institution.
            </CardDescription>
          </div>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Button>
          )}
        </CardHeader>
        <CardContent className="pt-6">
          {hasCourses && !isAdding && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Card key={course.id} className="overflow-hidden">
                  <div className="p-4 bg-muted/30">
                    <h4 className="font-semibold text-sm mb-1">
                      {course.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      {course.code}
                    </p>
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <p>• {course.studyLevel?.name}</p>
                      <p>• {course.discipline?.name}</p>
                      <p>• {course.programType?.name}</p>
                      {course.campus && <p>• Campus: {course.campus.name}</p>}
                      {configuredCourseName &&
                        configuredCourseName.trim() === course.name.trim() && (
                          <>
                            <p className="pt-1 font-medium text-foreground/90">
                              Course Info Details
                            </p>
                            {configuredAdmissionDetails?.duration && (
                              <p>
                                • Duration:{" "}
                                {configuredAdmissionDetails.duration}
                              </p>
                            )}
                            {configuredAdmissionDetails?.study_mode && (
                              <p>
                                • Study Mode:{" "}
                                {configuredAdmissionDetails.study_mode}
                              </p>
                            )}
                            {configuredAdmissionDetails?.academic_cycle && (
                              <p>
                                • Academic Cycle:{" "}
                                {configuredAdmissionDetails.academic_cycle}
                              </p>
                            )}
                            {configuredAdmissionDetails?.total_credits !=
                              null && (
                              <p>
                                • Credits:{" "}
                                {configuredAdmissionDetails.total_credits}
                              </p>
                            )}
                            {configuredAdmissionDetails?.course_category && (
                              <p>
                                • Category:{" "}
                                {configuredAdmissionDetails.course_category}
                              </p>
                            )}
                          </>
                        )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {!hasCourses && !isAdding && (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No courses added</h3>
              <p className="text-muted-foreground mt-2 mb-6">
                Add the academic programs available at your college.
              </p>
              <Button onClick={() => setIsAdding(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Course
              </Button>
            </div>
          )}

          {isAdding && (
            <form
              onSubmit={handleSubmit(onSubmit, () => {
                toast.error("Please fix the errors before saving");
              })}
              className="space-y-4 bg-muted/20 p-6 rounded-xl border"
            >
              <h4 className="font-medium flex items-center gap-2 mb-4">
                <BookOpen className="h-4 w-4 text-primary" />
                New Course Details
              </h4>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name">Course Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Bachelor of Technology in Computer Science"
                    aria-invalid={!!errors.name}
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">Course Code</Label>
                  <Input
                    id="code"
                    placeholder="e.g. BTECH-CS"
                    aria-invalid={!!errors.code}
                    {...register("code")}
                  />
                  {errors.code && (
                    <p className="text-sm text-destructive">
                      {errors.code.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Discipline</Label>
                  <Select
                    onValueChange={(val) => {
                      setValue("disciplineId", val);
                      void trigger("disciplineId");
                    }}
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
                    <p className="text-sm text-destructive">
                      {errors.disciplineId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Study Level</Label>
                  <Select
                    onValueChange={(val) => {
                      setValue("studyLevelId", val);
                      void trigger("studyLevelId");
                    }}
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
                    <p className="text-sm text-destructive">
                      {errors.studyLevelId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Program Type</Label>
                  <Select
                    onValueChange={(val) => {
                      setValue("programTypeId", val);
                      void trigger("programTypeId");
                    }}
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
                    <p className="text-sm text-destructive">
                      {errors.programTypeId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Campus (optional)</Label>
                  <Select
                    onValueChange={(val) => {
                      setValue("campusId", val);
                      void trigger("campusId");
                    }}
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
                  {errors.campusId && (
                    <p className="text-sm text-destructive">
                      {errors.campusId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Study Mode</Label>
                  <Select
                    onValueChange={(val) => {
                      setValue("studyMode", val);
                      void trigger("studyMode");
                    }}
                    defaultValue="full_time"
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
                  {errors.studyMode && (
                    <p className="text-sm text-destructive">
                      {errors.studyMode.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (optional)</Label>
                  <Input
                    id="duration"
                    placeholder="e.g. 4 Years"
                    aria-invalid={!!errors.duration}
                    {...register("duration")}
                  />
                  {errors.duration && (
                    <p className="text-sm text-destructive">
                      {errors.duration.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eligibility">Eligibility (optional)</Label>
                  <Input
                    id="eligibility"
                    placeholder="e.g. 10+2 with PCM"
                    aria-invalid={!!errors.eligibility}
                    {...register("eligibility")}
                  />
                  {errors.eligibility && (
                    <p className="text-sm text-destructive">
                      {errors.eligibility.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="intakeCapacity">
                    Intake Capacity (optional)
                  </Label>
                  <Input
                    id="intakeCapacity"
                    type="number"
                    aria-invalid={!!errors.intakeCapacity}
                    {...register("intakeCapacity")}
                  />
                  {errors.intakeCapacity && (
                    <p className="text-sm text-destructive">
                      {errors.intakeCapacity.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                {hasCourses && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsAdding(false)}
                  >
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={isPending}>
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Course
                </Button>
              </div>
            </form>
          )}

          <div className="flex justify-between pt-8 border-t mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push(getPortalPath(collegeSlug, "/setup/campuses"))
              }
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={() =>
                router.push(getPortalPath(collegeSlug, "/setup/review"))
              }
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
