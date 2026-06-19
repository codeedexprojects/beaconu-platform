"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@/lib/zod-resolver";
import * as z from "zod";
import {
  Loader2,
  ArrowRight,
  ArrowLeft,
  Plus,
  BookOpen,
  GraduationCap,
  Briefcase,
  Users,
  Compass,
  FileText,
  Save,
  X,
  Building,
  Award,
  Globe,
  Star,
  Layers,
  DollarSign,
  Trash2,
  Sparkles,
  Check,
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadCollegeAdminFile } from "@/lib/services/colleges.service";

import {
  useCollegeCampuses,
  useCollegeCourses,
  useCreateCollegeCourse,
  useUpdateCollegeCourse,
  useDeleteCollegeCourse,
  useCourseTabs,
  useUpdateCourseTab,
} from "@/hooks/use-colleges";
import {
  useProgramTypes,
  useStreams,
  useStudyLevels,
} from "@/hooks/use-lookups";
import { getCollegeSlugFromPath, getPortalPath } from "@/lib/portal-path";

// 14 course-specific tabs plus the basic configuration tab
const COURSE_TABS = [
  {
    id: "basic",
    label: "Basic Details",
    icon: BookOpen,
    desc: "Primary course settings, stream, mode, and eligibility",
  },
  {
    id: "course_info",
    label: "Course Info",
    icon: Compass,
    desc: "Key highlights, timings, exit options, and labs",
  },
  {
    id: "admission_policy",
    label: "Admission Policy",
    icon: GraduationCap,
    desc: "Intake capacities, seat matrix, and entrance exams",
  },
  {
    id: "placements",
    label: "Placements",
    icon: Briefcase,
    desc: "Salary package stats and top hiring recruiters",
  },
  {
    id: "fees",
    label: "Fees & Dues",
    icon: DollarSign,
    desc: "Tuition, one-time fees, and semester structures",
  },
  {
    id: "financial_aid",
    label: "Financial Aid",
    icon: Award,
    desc: "Merit scholarships and upfront concessions",
  },
  {
    id: "student_housing",
    label: "Student Housing",
    icon: Building,
    desc: "Hostel rooms, mess details, and housing rules",
  },
  {
    id: "exam_policy",
    label: "Exam Policy",
    icon: FileText,
    desc: "Internal/External marks weights and grading rules",
  },
  {
    id: "faculty",
    label: "Faculty Directory",
    icon: Users,
    desc: "Professors, designations, and academic experience",
  },
  {
    id: "review",
    label: "Student Reviews",
    icon: Star,
    desc: "Average rating score and student feedback comments",
  },
  {
    id: "library",
    label: "Library Assets",
    icon: BookOpen,
    desc: "Book volumes, digital journals, and library details",
  },
  {
    id: "clubs_associations",
    label: "Clubs & Groups",
    icon: Sparkles,
    desc: "Student societies, associations, and clubs",
  },
  {
    id: "alliance",
    label: "Alliances & Ties",
    icon: Globe,
    desc: "Industrial and global academic partnerships",
  },
  {
    id: "other_courses_offered",
    label: "Other Options",
    icon: Layers,
    desc: "Alternate pathways and related course linkages",
  },
  {
    id: "demo_graphics",
    label: "Demographics",
    icon: Users,
    desc: "Gender ratio, state diversity, and stats",
  },
] as const;

type CourseTabId = (typeof COURSE_TABS)[number]["id"];

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
  campusId: z.string().optional().or(z.literal("")),
  duration: z.string().optional().nullable(),
  intakeCapacity: z.coerce.number().optional().nullable(),
  eligibility: z.string().optional().nullable(),
});

type CourseFormData = z.infer<typeof courseSchema>;

export default function SetupAcademicsPage() {
  const router = useRouter();
  const collegeSlug =
    typeof window === "undefined"
      ? null
      : getCollegeSlugFromPath(window.location.pathname, window.location.host);

  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState<CourseTabId>("basic");
  const [courseInfoSubTab, setCourseInfoSubTab] = useState<string>("general");
  const [uploadingBrochure, setUploadingBrochure] = useState(false);
  const [uploadingAlumniIndex, setUploadingAlumniIndex] = useState<
    number | null
  >(null);

  const { data: courses = [], isLoading: isLoadingCourses } =
    useCollegeCourses();
  const { data: streams = [] } = useStreams();
  const { data: studyLevels = [] } = useStudyLevels();
  const { data: programTypes = [] } = useProgramTypes();
  const { data: campuses = [] } = useCollegeCampuses();

  const { mutate: createCourse, isPending: isCreating } =
    useCreateCollegeCourse();
  const { mutate: updateCourse, isPending: isUpdating } =
    useUpdateCollegeCourse();
  const { mutate: deleteCourse } = useDeleteCollegeCourse();

  // Tab Data hooks for the currently selected course (if editing)
  const { data: tabDataResponse, isLoading: isLoadingTabs } = useCourseTabs(
    editingCourse?.id,
    !!editingCourse?.id,
  );
  const { mutate: updateTab, isPending: isUpdatingTab } = useUpdateCourseTab();

  // Tab State - local JSON fields representing active tab data edits
  const [localTabState, setLocalTabState] = useState<any>({});

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

  // Sync basic details when editing
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

  // Sync tab state when server response changes
  useEffect(() => {
    if (tabDataResponse?.tabData) {
      setLocalTabState(tabDataResponse.tabData);
    } else {
      setLocalTabState({});
    }
  }, [tabDataResponse]);

  const handleBasicSubmit = (data: CourseFormData) => {
    if (editingCourse) {
      updateCourse(
        {
          id: editingCourse.id,
          data: {
            name: data.name,
            code: data.code,
            disciplineId: data.disciplineId,
            studyLevelId: data.studyLevelId,
            programTypeId: data.programTypeId,
            studyMode: data.studyMode,
            campusId: data.campusId || null,
            duration: data.duration || null,
            intakeCapacity: data.intakeCapacity || null,
            eligibility: data.eligibility || null,
          },
        },
        {
          onSuccess: (updated) => {
            toast.success("Course basic details updated!");
            setEditingCourse(updated);
          },
        },
      );
    } else {
      createCourse(
        {
          name: data.name,
          code: data.code,
          disciplineId: data.disciplineId,
          studyLevelId: data.studyLevelId,
          programTypeId: data.programTypeId,
          studyMode: data.studyMode,
          campusId: data.campusId || null,
          duration: data.duration || null,
          intakeCapacity: data.intakeCapacity || null,
          eligibility: data.eligibility || null,
          tabData: {},
        },
        {
          onSuccess: (created) => {
            toast.success("Course entry created! Now configure course tabs.");
            setEditingCourse(created);
            setActiveTab("course_info");
          },
        },
      );
    }
  };

  const saveActiveTab = () => {
    if (!editingCourse?.id) return;

    const tabPayload = localTabState[activeTab] || {};

    updateTab(
      {
        courseId: editingCourse.id,
        tabName: activeTab,
        data: tabPayload,
      },
      {
        onSuccess: () => {
          toast.success(
            `${COURSE_TABS.find((t) => t.id === activeTab)?.label} tab saved!`,
          );
        },
      },
    );
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this program?")) {
      deleteCourse(id, {
        onSuccess: () => {
          toast.success("Course deleted successfully");
        },
      });
    }
  };

  const disciplines = streams.flatMap((s) => {
    if (!Array.isArray(s.disciplines)) return [];
    return s.disciplines.map((d) => ({ ...d, streamName: s.name }));
  });

  const getActiveTabPayload = () => {
    return localTabState[activeTab] || {};
  };

  const updateActiveTabPayload = (updates: any) => {
    setLocalTabState((prev: any) => ({
      ...prev,
      [activeTab]: {
        ...(prev[activeTab] || {}),
        ...updates,
      },
    }));
  };

  const handleBrochureUpload = async (file: File | null) => {
    if (!file) return;

    try {
      setUploadingBrochure(true);
      const permanentUrl = await uploadCollegeAdminFile(
        file,
        `courses/${editingCourse?.id || "draft"}/brochure`,
      );
      updateActiveTabPayload({
        curriculum: {
          ...(getActiveTabPayload().curriculum || {}),
          brochure_link: permanentUrl,
        },
      });
      toast.success("Brochure uploaded to S3");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      toast.error(message);
    } finally {
      setUploadingBrochure(false);
    }
  };

  const handleAlumniImageUpload = async (file: File | null, idx: number) => {
    if (!file) return;

    try {
      setUploadingAlumniIndex(idx);
      const permanentUrl = await uploadCollegeAdminFile(
        file,
        `courses/${editingCourse?.id || "draft"}/featured-alumni-${idx}`,
      );
      const next = [...(getActiveTabPayload().featured_alumni || [])];
      next[idx] = { ...next[idx], image: permanentUrl };
      updateActiveTabPayload({ featured_alumni: next });
      toast.success("Alumni image uploaded to S3");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      toast.error(message);
    } finally {
      setUploadingAlumniIndex(null);
    }
  };

  if (isLoadingCourses) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isEditingOrAdding = isAdding || editingCourse !== null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-16">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/60">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
            Academic Programs
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Configure courses, eligibility constraints, placement rates, and
            housing.
          </p>
        </div>
        {!isEditingOrAdding && (
          <Button
            onClick={() => {
              setIsAdding(true);
              setActiveTab("basic");
            }}
            size="lg"
            className="shadow-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Course
          </Button>
        )}
      </div>

      {/* COURSE LIST VIEW */}
      {!isEditingOrAdding && (
        <>
          {courses.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {courses.map((course) => (
                <Card
                  key={course.id}
                  className="group overflow-hidden border border-border/80 bg-card/60 backdrop-blur-md transition-all hover:shadow-lg hover:border-indigo-400/40"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-indigo-600" />
                      </div>
                      <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                        {course.code}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-lg mb-1 line-clamp-1">
                        {course.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Study Mode: {course.studyMode?.replace("_", " ")}
                      </p>
                    </div>
                    <div className="space-y-2 text-xs text-muted-foreground pt-2 border-t">
                      <p className="flex items-center gap-2">
                        <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                        {course.studyLevel?.name}
                      </p>
                      <p className="flex items-center gap-2">
                        <Layers className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                        {course.discipline?.name}
                      </p>
                      {course.campus && (
                        <p className="text-indigo-600 font-semibold mt-2">
                          Campus: {course.campus.name}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 pt-4 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingCourse(course);
                          setActiveTab("basic");
                        }}
                      >
                        Edit Details
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(course.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed bg-muted/5 py-12">
              <CardContent className="flex flex-col items-center justify-center text-center">
                <div className="h-16 w-16 rounded-full bg-indigo-50 flex items-center justify-center mb-6">
                  <BookOpen className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-2">
                  No programs configured
                </h3>
                <p className="text-muted-foreground max-w-sm mb-6 text-sm">
                  Start building your academic catalog by configuring your first
                  course offering.
                </p>
                <Button
                  onClick={() => setIsAdding(true)}
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  <Plus className="h-5 w-5 mr-2" /> Add First Course
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* EDITING / ADDING WORKSPACE */}
      {isEditingOrAdding && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* TAB SIDEBAR */}
          <aside className="lg:col-span-3 space-y-2">
            {COURSE_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isDisabled = !editingCourse && tab.id !== "basic";

              return (
                <button
                  key={tab.id}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    setActiveTab(tab.id);
                  }}
                  className={`w-full flex flex-col items-start gap-1 p-4 rounded-xl text-left transition-all border ${
                    isActive
                      ? "bg-indigo-600/5 border-indigo-600/30 text-indigo-900 shadow-sm font-semibold ring-1 ring-indigo-500/20"
                      : isDisabled
                        ? "opacity-50 cursor-not-allowed border-transparent text-muted-foreground"
                        : "border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-5 w-5 ${isActive ? "text-indigo-600" : "text-muted-foreground"}`}
                    />
                    <span className="text-sm font-bold">{tab.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground/80 line-clamp-1 pl-8">
                    {tab.desc}
                  </span>
                </button>
              );
            })}
          </aside>

          {/* EDIT WORKSPACE */}
          <main className="lg:col-span-9 space-y-6">
            {/* 1. BASIC DETAILS FORM */}
            {activeTab === "basic" && (
              <Card className="border border-border/80 shadow-md bg-card/60 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-indigo-500" /> Basic
                    Details
                  </CardTitle>
                  <CardDescription>
                    Primary properties of this academic program.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={handleSubmit(handleBasicSubmit)}
                    className="space-y-6"
                  >
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2 md:col-span-2">
                        <Label
                          htmlFor="name"
                          className="font-semibold text-foreground"
                        >
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
                        <Label
                          htmlFor="code"
                          className="font-semibold text-foreground"
                        >
                          Course Code *
                        </Label>
                        <Input
                          id="code"
                          placeholder="e.g. BTECH-CS"
                          className="uppercase"
                          {...register("code")}
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
                        <Label className="font-semibold text-foreground">
                          Campus
                        </Label>
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
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setEditingCourse(null);
                          setIsAdding(false);
                        }}
                      >
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
            )}

            {/* TAB CONFIGURE FORM (14 JSON TABS) */}
            {activeTab !== "basic" && editingCourse && (
              <Card className="border border-border/80 shadow-md bg-card/60 backdrop-blur-md">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      {COURSE_TABS.find((t) => t.id === activeTab)?.label}
                    </CardTitle>
                    <CardDescription>
                      Configure tab data for &apos;{editingCourse.name}&apos;.
                    </CardDescription>
                  </div>
                  <Button
                    onClick={saveActiveTab}
                    disabled={isUpdatingTab}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                  >
                    {isUpdatingTab ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Tab
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6 min-h-[300px]">
                  {isLoadingTabs ? (
                    <div className="flex h-48 items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      {/* COURSE INFO TAB */}
                      {activeTab === "course_info" && (
                        <div className="space-y-4">
                          <div className="flex border-b overflow-x-auto scrollbar-none gap-2 pb-2 mb-6">
                            {[
                              { id: "general", label: "General & Overview" },
                              { id: "admissions", label: "Admissions & Dates" },
                              {
                                id: "academics",
                                label: "Academics & Curriculum",
                              },
                              {
                                id: "facilities",
                                label: "Facilities & Timings",
                              },
                              {
                                id: "alumni_faqs",
                                label: "Career & Alumni / FAQs",
                              },
                            ].map((subTab) => {
                              const isSubActive =
                                courseInfoSubTab === subTab.id;
                              return (
                                <button
                                  key={subTab.id}
                                  type="button"
                                  onClick={() => setCourseInfoSubTab(subTab.id)}
                                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 border ${
                                    isSubActive
                                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                      : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                                  }`}
                                >
                                  {subTab.label}
                                </button>
                              );
                            })}
                          </div>

                          {/* 1. GENERAL & OVERVIEW SUB-TAB */}
                          {courseInfoSubTab === "general" && (
                            <div className="space-y-6">
                              <div className="space-y-2">
                                <Label>Course Info Name</Label>
                                <Input
                                  placeholder="e.g. MBA Digital Transformation"
                                  value={
                                    getActiveTabPayload().course_name || ""
                                  }
                                  onChange={(e) =>
                                    updateActiveTabPayload({
                                      course_name: e.target.value,
                                    })
                                  }
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Program Description (About)</Label>
                                <Textarea
                                  rows={3}
                                  placeholder="Overview description..."
                                  value={getActiveTabPayload().about || ""}
                                  onChange={(e) =>
                                    updateActiveTabPayload({
                                      about: e.target.value,
                                    })
                                  }
                                />
                              </div>

                              {/* Overview Section */}
                              <div className="border p-4 rounded-xl space-y-4 bg-muted/10">
                                <h4 className="font-bold text-sm text-foreground">
                                  Program Overview Details
                                </h4>
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-1">
                                    <Label className="text-xs">Duration</Label>
                                    <Input
                                      placeholder="e.g. 24 months"
                                      value={
                                        getActiveTabPayload().overview
                                          ?.duration || ""
                                      }
                                      onChange={(e) =>
                                        updateActiveTabPayload({
                                          overview: {
                                            ...(getActiveTabPayload()
                                              .overview || {}),
                                            duration: e.target.value,
                                          },
                                        })
                                      }
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">
                                      Study Mode
                                    </Label>
                                    <Select
                                      value={
                                        getActiveTabPayload().overview
                                          ?.study_mode || ""
                                      }
                                      onValueChange={(val) =>
                                        updateActiveTabPayload({
                                          overview: {
                                            ...(getActiveTabPayload()
                                              .overview || {}),
                                            study_mode: val,
                                          },
                                        })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select mode" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Regular">
                                          Regular
                                        </SelectItem>
                                        <SelectItem value="Part-time">
                                          Part-time
                                        </SelectItem>
                                        <SelectItem value="Online">
                                          Online
                                        </SelectItem>
                                        <SelectItem value="Distance">
                                          Distance
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">
                                      Academic Cycle
                                    </Label>
                                    <Input
                                      placeholder="e.g. Semester"
                                      value={
                                        getActiveTabPayload().overview
                                          ?.academic_cycle || ""
                                      }
                                      onChange={(e) =>
                                        updateActiveTabPayload({
                                          overview: {
                                            ...(getActiveTabPayload()
                                              .overview || {}),
                                            academic_cycle: e.target.value,
                                          },
                                        })
                                      }
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">Credits</Label>
                                    <Input
                                      type="number"
                                      placeholder="e.g. 102"
                                      value={
                                        getActiveTabPayload().overview
                                          ?.credits ?? ""
                                      }
                                      onChange={(e) =>
                                        updateActiveTabPayload({
                                          overview: {
                                            ...(getActiveTabPayload()
                                              .overview || {}),
                                            credits: e.target.value
                                              ? Number(e.target.value)
                                              : "",
                                          },
                                        })
                                      }
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">
                                      Gender Accepted
                                    </Label>
                                    <Select
                                      value={
                                        getActiveTabPayload().overview
                                          ?.gender_accepted || ""
                                      }
                                      onValueChange={(val) =>
                                        updateActiveTabPayload({
                                          overview: {
                                            ...(getActiveTabPayload()
                                              .overview || {}),
                                            gender_accepted: val,
                                          },
                                        })
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select gender option" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Co-ed">
                                          Co-ed
                                        </SelectItem>
                                        <SelectItem value="Female Only">
                                          Female Only
                                        </SelectItem>
                                        <SelectItem value="Male Only">
                                          Male Only
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">
                                      Course Category
                                    </Label>
                                    <Input
                                      placeholder="e.g. Self Financing"
                                      value={
                                        getActiveTabPayload().overview
                                          ?.course_category || ""
                                      }
                                      onChange={(e) =>
                                        updateActiveTabPayload({
                                          overview: {
                                            ...(getActiveTabPayload()
                                              .overview || {}),
                                            course_category: e.target.value,
                                          },
                                        })
                                      }
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Highlights */}
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <Label className="font-bold">
                                    Program Highlights
                                  </Label>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const next = [
                                        ...(getActiveTabPayload()
                                          .program_highlights || []),
                                        { tag: "", title: "" },
                                      ];
                                      updateActiveTabPayload({
                                        program_highlights: next,
                                      });
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-1" /> Add
                                    Highlight
                                  </Button>
                                </div>
                                {(
                                  getActiveTabPayload().program_highlights || []
                                ).map((h: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="flex gap-2 items-center"
                                  >
                                    <Input
                                      placeholder="Tag (e.g. NBA Accreditated)"
                                      value={h.tag || ""}
                                      onChange={(e) => {
                                        const next = [
                                          ...(getActiveTabPayload()
                                            .program_highlights || []),
                                        ];
                                        next[idx] = {
                                          ...next[idx],
                                          tag: e.target.value,
                                        };
                                        updateActiveTabPayload({
                                          program_highlights: next,
                                        });
                                      }}
                                    />
                                    <Input
                                      placeholder="Headline Title"
                                      value={h.title || ""}
                                      onChange={(e) => {
                                        const next = [
                                          ...(getActiveTabPayload()
                                            .program_highlights || []),
                                        ];
                                        next[idx] = {
                                          ...next[idx],
                                          title: e.target.value,
                                        };
                                        updateActiveTabPayload({
                                          program_highlights: next,
                                        });
                                      }}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        const next = (
                                          getActiveTabPayload()
                                            .program_highlights || []
                                        ).filter(
                                          (_: any, i: number) => i !== idx,
                                        );
                                        updateActiveTabPayload({
                                          program_highlights: next,
                                        });
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                ))}
                              </div>

                              {/* Accolades */}
                              <div className="space-y-3 pt-4 border-t">
                                <div className="flex justify-between items-center">
                                  <Label className="font-bold">
                                    Course Accolades
                                  </Label>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const current =
                                        getActiveTabPayload()
                                          .course_accolades || [];
                                      updateActiveTabPayload({
                                        course_accolades: [...current, ""],
                                      });
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-1" /> Add
                                    Accolade
                                  </Button>
                                </div>
                                {(
                                  getActiveTabPayload().course_accolades || []
                                ).map((acc: string, idx: number) => (
                                  <div
                                    key={idx}
                                    className="flex gap-2 items-center"
                                  >
                                    <Input
                                      placeholder="e.g. Ranked #1 for Digital Transformation"
                                      value={acc || ""}
                                      onChange={(e) => {
                                        const next = [
                                          ...(getActiveTabPayload()
                                            .course_accolades || []),
                                        ];
                                        next[idx] = e.target.value;
                                        updateActiveTabPayload({
                                          course_accolades: next,
                                        });
                                      }}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        const next = (
                                          getActiveTabPayload()
                                            .course_accolades || []
                                        ).filter(
                                          (_: any, i: number) => i !== idx,
                                        );
                                        updateActiveTabPayload({
                                          course_accolades: next,
                                        });
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 2. ADMISSIONS & TIMELINE SUB-TAB */}
                          {courseInfoSubTab === "admissions" && (
                            <div className="space-y-6">
                              {/* Admission Status Object */}
                              <div className="border p-4 rounded-xl space-y-4 bg-muted/10">
                                <h4 className="font-bold text-sm text-foreground">
                                  Admission Status
                                </h4>
                                <div className="grid gap-4 md:grid-cols-3">
                                  <div className="space-y-1">
                                    <Label className="text-xs">
                                      Status Tag
                                    </Label>
                                    <Input
                                      placeholder="e.g. Admissions Open"
                                      value={
                                        getActiveTabPayload().admission_status
                                          ?.tag || ""
                                      }
                                      onChange={(e) =>
                                        updateActiveTabPayload({
                                          admission_status: {
                                            ...(getActiveTabPayload()
                                              .admission_status || {}),
                                            tag: e.target.value,
                                          },
                                        })
                                      }
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">
                                      Seat Availability (%)
                                    </Label>
                                    <Input
                                      type="number"
                                      placeholder="e.g. 90"
                                      value={
                                        getActiveTabPayload().admission_status
                                          ?.seat_availability_percent ?? ""
                                      }
                                      onChange={(e) =>
                                        updateActiveTabPayload({
                                          admission_status: {
                                            ...(getActiveTabPayload()
                                              .admission_status || {}),
                                            seat_availability_percent: e.target
                                              .value
                                              ? Number(e.target.value)
                                              : "",
                                          },
                                        })
                                      }
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">
                                      Urgency Label
                                    </Label>
                                    <Input
                                      placeholder="e.g. Limited seats available"
                                      value={
                                        getActiveTabPayload().admission_status
                                          ?.urgency_label || ""
                                      }
                                      onChange={(e) =>
                                        updateActiveTabPayload({
                                          admission_status: {
                                            ...(getActiveTabPayload()
                                              .admission_status || {}),
                                            urgency_label: e.target.value,
                                          },
                                        })
                                      }
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Admissions Timeline Array */}
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <Label className="font-bold text-foreground">
                                    Intake Admissions
                                  </Label>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const next = [
                                        ...(getActiveTabPayload().admissions ||
                                          []),
                                        { label: "", status: "upcoming" },
                                      ];
                                      updateActiveTabPayload({
                                        admissions: next,
                                      });
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-1" /> Add
                                    Admission Cycle
                                  </Button>
                                </div>
                                {(getActiveTabPayload().admissions || []).map(
                                  (adm: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className="flex gap-2 items-center border p-3 rounded-lg bg-muted/5"
                                    >
                                      <Input
                                        placeholder="e.g. Admissions 2025"
                                        value={adm.label || ""}
                                        onChange={(e) => {
                                          const next = [
                                            ...(getActiveTabPayload()
                                              .admissions || []),
                                          ];
                                          next[idx] = {
                                            ...next[idx],
                                            label: e.target.value,
                                          };
                                          updateActiveTabPayload({
                                            admissions: next,
                                          });
                                        }}
                                      />
                                      <Select
                                        value={adm.status || "upcoming"}
                                        onValueChange={(val) => {
                                          const next = [
                                            ...(getActiveTabPayload()
                                              .admissions || []),
                                          ];
                                          next[idx] = {
                                            ...next[idx],
                                            status: val,
                                          };
                                          updateActiveTabPayload({
                                            admissions: next,
                                          });
                                        }}
                                      >
                                        <SelectTrigger className="w-[180px]">
                                          <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="open">
                                            Open
                                          </SelectItem>
                                          <SelectItem value="upcoming">
                                            Upcoming
                                          </SelectItem>
                                          <SelectItem value="closed">
                                            Closed
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          const next = (
                                            getActiveTabPayload().admissions ||
                                            []
                                          ).filter(
                                            (_: any, i: number) => i !== idx,
                                          );
                                          updateActiveTabPayload({
                                            admissions: next,
                                          });
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>
                                  ),
                                )}
                              </div>

                              {/* Key Dates Array */}
                              <div className="space-y-3 pt-4 border-t">
                                <div className="flex justify-between items-center">
                                  <Label className="font-bold">Key Dates</Label>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const next = [
                                        ...(getActiveTabPayload().key_dates ||
                                          []),
                                        { label: "", date: "" },
                                      ];
                                      updateActiveTabPayload({
                                        key_dates: next,
                                      });
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-1" /> Add Key
                                    Date
                                  </Button>
                                </div>
                                {(getActiveTabPayload().key_dates || []).map(
                                  (kd: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className="flex gap-2 items-center border p-3 rounded-lg bg-muted/5"
                                    >
                                      <Input
                                        placeholder="Date Label (e.g. Admission Deadline)"
                                        value={kd.label || ""}
                                        onChange={(e) => {
                                          const next = [
                                            ...(getActiveTabPayload()
                                              .key_dates || []),
                                          ];
                                          next[idx] = {
                                            ...next[idx],
                                            label: e.target.value,
                                          };
                                          updateActiveTabPayload({
                                            key_dates: next,
                                          });
                                        }}
                                      />
                                      <Input
                                        placeholder="Date (e.g. 15th August 2025)"
                                        value={kd.date || ""}
                                        onChange={(e) => {
                                          const next = [
                                            ...(getActiveTabPayload()
                                              .key_dates || []),
                                          ];
                                          next[idx] = {
                                            ...next[idx],
                                            date: e.target.value,
                                          };
                                          updateActiveTabPayload({
                                            key_dates: next,
                                          });
                                        }}
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          const next = (
                                            getActiveTabPayload().key_dates ||
                                            []
                                          ).filter(
                                            (_: any, i: number) => i !== idx,
                                          );
                                          updateActiveTabPayload({
                                            key_dates: next,
                                          });
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          )}

                          {/* 3. ACADEMICS & CURRICULUM SUB-TAB */}
                          {courseInfoSubTab === "academics" && (
                            <div className="space-y-6">
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                  <Label>Total Credits</Label>
                                  <Input
                                    type="number"
                                    placeholder="e.g. 102"
                                    value={
                                      getActiveTabPayload().total_credits ?? ""
                                    }
                                    onChange={(e) =>
                                      updateActiveTabPayload({
                                        total_credits: e.target.value
                                          ? Number(e.target.value)
                                          : "",
                                      })
                                    }
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label>Brochure Link</Label>
                                  <Input
                                    placeholder="https://example.com/brochure.pdf"
                                    value={
                                      getActiveTabPayload().curriculum
                                        ?.brochure_link || ""
                                    }
                                    onChange={(e) =>
                                      updateActiveTabPayload({
                                        curriculum: {
                                          ...(getActiveTabPayload()
                                            .curriculum || {}),
                                          brochure_link: e.target.value,
                                        },
                                      })
                                    }
                                  />
                                  <Input
                                    type="file"
                                    accept="application/pdf,image/jpeg,image/png,image/webp"
                                    disabled={uploadingBrochure}
                                    onChange={(e) =>
                                      handleBrochureUpload(
                                        e.target.files?.[0] ?? null,
                                      )
                                    }
                                  />
                                </div>
                              </div>

                              {/* Semesters inside Curriculum */}
                              <div className="space-y-3 pt-4 border-t">
                                <div className="flex justify-between items-center">
                                  <Label className="font-bold">Semesters</Label>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const currentSemesters =
                                        getActiveTabPayload().curriculum
                                          ?.semesters || [];
                                      updateActiveTabPayload({
                                        curriculum: {
                                          ...(getActiveTabPayload()
                                            .curriculum || {}),
                                          semesters: [
                                            ...currentSemesters,
                                            { label: "", description: "" },
                                          ],
                                        },
                                      });
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-1" /> Add
                                    Semester
                                  </Button>
                                </div>
                                {(
                                  getActiveTabPayload().curriculum?.semesters ||
                                  []
                                ).map((sem: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="flex gap-2 items-start border p-3 rounded-lg bg-muted/5"
                                  >
                                    <div className="flex-1 space-y-2">
                                      <Input
                                        placeholder="Semester Label (e.g. Semester I)"
                                        value={sem.label || ""}
                                        onChange={(e) => {
                                          const next = [
                                            ...(getActiveTabPayload().curriculum
                                              ?.semesters || []),
                                          ];
                                          next[idx] = {
                                            ...next[idx],
                                            label: e.target.value,
                                          };
                                          updateActiveTabPayload({
                                            curriculum: {
                                              ...(getActiveTabPayload()
                                                .curriculum || {}),
                                              semesters: next,
                                            },
                                          });
                                        }}
                                      />
                                      <Textarea
                                        placeholder="Semester Details / Core Subjects"
                                        rows={2}
                                        value={sem.description || ""}
                                        onChange={(e) => {
                                          const next = [
                                            ...(getActiveTabPayload().curriculum
                                              ?.semesters || []),
                                          ];
                                          next[idx] = {
                                            ...next[idx],
                                            description: e.target.value,
                                          };
                                          updateActiveTabPayload({
                                            curriculum: {
                                              ...(getActiveTabPayload()
                                                .curriculum || {}),
                                              semesters: next,
                                            },
                                          });
                                        }}
                                      />
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        const next = (
                                          getActiveTabPayload().curriculum
                                            ?.semesters || []
                                        ).filter(
                                          (_: any, i: number) => i !== idx,
                                        );
                                        updateActiveTabPayload({
                                          curriculum: {
                                            ...(getActiveTabPayload()
                                              .curriculum || {}),
                                            semesters: next,
                                          },
                                        });
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                ))}
                              </div>

                              {/* Course Structure Array */}
                              <div className="space-y-3 pt-4 border-t">
                                <div className="flex justify-between items-center">
                                  <Label className="font-bold">
                                    Course Structure
                                  </Label>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const next = [
                                        ...(getActiveTabPayload()
                                          .course_structure || []),
                                        { title: "", details: "" },
                                      ];
                                      updateActiveTabPayload({
                                        course_structure: next,
                                      });
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-1" /> Add
                                    Structure Group
                                  </Button>
                                </div>
                                {(
                                  getActiveTabPayload().course_structure || []
                                ).map((cs: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="flex gap-2 items-start border p-3 rounded-lg bg-muted/5"
                                  >
                                    <div className="flex-1 space-y-2">
                                      <Input
                                        placeholder="Group Title (e.g. Core Electives)"
                                        value={cs.title || ""}
                                        onChange={(e) => {
                                          const next = [
                                            ...(getActiveTabPayload()
                                              .course_structure || []),
                                          ];
                                          next[idx] = {
                                            ...next[idx],
                                            title: e.target.value,
                                          };
                                          updateActiveTabPayload({
                                            course_structure: next,
                                          });
                                        }}
                                      />
                                      <Input
                                        placeholder="Details (e.g. 12 Credits, 4 Subjects)"
                                        value={cs.details || ""}
                                        onChange={(e) => {
                                          const next = [
                                            ...(getActiveTabPayload()
                                              .course_structure || []),
                                          ];
                                          next[idx] = {
                                            ...next[idx],
                                            details: e.target.value,
                                          };
                                          updateActiveTabPayload({
                                            course_structure: next,
                                          });
                                        }}
                                      />
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        const next = (
                                          getActiveTabPayload()
                                            .course_structure || []
                                        ).filter(
                                          (_: any, i: number) => i !== idx,
                                        );
                                        updateActiveTabPayload({
                                          course_structure: next,
                                        });
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                ))}
                              </div>

                              {/* Value Added Courses Array of strings */}
                              <div className="space-y-3 pt-4 border-t">
                                <div className="flex justify-between items-center">
                                  <Label className="font-bold">
                                    Value Added Courses
                                  </Label>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const next = [
                                        ...(getActiveTabPayload()
                                          .value_added_courses || []),
                                        "",
                                      ];
                                      updateActiveTabPayload({
                                        value_added_courses: next,
                                      });
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-1" /> Add Value
                                    Course
                                  </Button>
                                </div>
                                {(
                                  getActiveTabPayload().value_added_courses ||
                                  []
                                ).map((vac: string, idx: number) => (
                                  <div
                                    key={idx}
                                    className="flex gap-2 items-center"
                                  >
                                    <Input
                                      placeholder="e.g. AI Ethics & Compliance"
                                      value={vac || ""}
                                      onChange={(e) => {
                                        const next = [
                                          ...(getActiveTabPayload()
                                            .value_added_courses || []),
                                        ];
                                        next[idx] = e.target.value;
                                        updateActiveTabPayload({
                                          value_added_courses: next,
                                        });
                                      }}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        const next = (
                                          getActiveTabPayload()
                                            .value_added_courses || []
                                        ).filter(
                                          (_: any, i: number) => i !== idx,
                                        );
                                        updateActiveTabPayload({
                                          value_added_courses: next,
                                        });
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                ))}
                              </div>

                              {/* Higher Education Object */}
                              <div className="border p-4 rounded-xl space-y-4 bg-muted/10">
                                <h4 className="font-bold text-sm text-foreground">
                                  Higher Education Pathways
                                </h4>

                                <div className="space-y-3">
                                  <div className="flex justify-between items-center">
                                    <Label className="text-xs">
                                      Global Certifications
                                    </Label>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const current =
                                          getActiveTabPayload().higher_education
                                            ?.global_certifications || [];
                                        updateActiveTabPayload({
                                          higher_education: {
                                            ...(getActiveTabPayload()
                                              .higher_education || {}),
                                            global_certifications: [
                                              ...current,
                                              "",
                                            ],
                                          },
                                        });
                                      }}
                                    >
                                      <Plus className="h-3 w-3 mr-1" /> Add
                                      Certification
                                    </Button>
                                  </div>
                                  {(
                                    getActiveTabPayload().higher_education
                                      ?.global_certifications || []
                                  ).map((gc: string, idx: number) => (
                                    <div
                                      key={idx}
                                      className="flex gap-2 items-center"
                                    >
                                      <Input
                                        placeholder="e.g. AWS Solutions Architect"
                                        value={gc || ""}
                                        onChange={(e) => {
                                          const next = [
                                            ...(getActiveTabPayload()
                                              .higher_education
                                              ?.global_certifications || []),
                                          ];
                                          next[idx] = e.target.value;
                                          updateActiveTabPayload({
                                            higher_education: {
                                              ...(getActiveTabPayload()
                                                .higher_education || {}),
                                              global_certifications: next,
                                            },
                                          });
                                        }}
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          const next = (
                                            getActiveTabPayload()
                                              .higher_education
                                              ?.global_certifications || []
                                          ).filter(
                                            (_: any, i: number) => i !== idx,
                                          );
                                          updateActiveTabPayload({
                                            higher_education: {
                                              ...(getActiveTabPayload()
                                                .higher_education || {}),
                                              global_certifications: next,
                                            },
                                          });
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>

                                <div className="space-y-3 pt-3 border-t">
                                  <div className="flex justify-between items-center">
                                    <Label className="text-xs">
                                      Postgraduation Options
                                    </Label>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const current =
                                          getActiveTabPayload().higher_education
                                            ?.postgraduation || [];
                                        updateActiveTabPayload({
                                          higher_education: {
                                            ...(getActiveTabPayload()
                                              .higher_education || {}),
                                            postgraduation: [...current, ""],
                                          },
                                        });
                                      }}
                                    >
                                      <Plus className="h-3 w-3 mr-1" /> Add
                                      Postgrad Path
                                    </Button>
                                  </div>
                                  {(
                                    getActiveTabPayload().higher_education
                                      ?.postgraduation || []
                                  ).map((pg: string, idx: number) => (
                                    <div
                                      key={idx}
                                      className="flex gap-2 items-center"
                                    >
                                      <Input
                                        placeholder="e.g. M.Tech Research, PhD"
                                        value={pg || ""}
                                        onChange={(e) => {
                                          const next = [
                                            ...(getActiveTabPayload()
                                              .higher_education
                                              ?.postgraduation || []),
                                          ];
                                          next[idx] = e.target.value;
                                          updateActiveTabPayload({
                                            higher_education: {
                                              ...(getActiveTabPayload()
                                                .higher_education || {}),
                                              postgraduation: next,
                                            },
                                          });
                                        }}
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          const next = (
                                            getActiveTabPayload()
                                              .higher_education
                                              ?.postgraduation || []
                                          ).filter(
                                            (_: any, i: number) => i !== idx,
                                          );
                                          updateActiveTabPayload({
                                            higher_education: {
                                              ...(getActiveTabPayload()
                                                .higher_education || {}),
                                              postgraduation: next,
                                            },
                                          });
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Flexible Exit Options */}
                              <div className="space-y-3 pt-4 border-t">
                                <div className="flex justify-between items-center">
                                  <Label className="font-bold">
                                    Flexible Exit Options
                                  </Label>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const next = [
                                        ...(getActiveTabPayload()
                                          .flexible_exit_options || []),
                                        "",
                                      ];
                                      updateActiveTabPayload({
                                        flexible_exit_options: next,
                                      });
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-1" /> Add Exit
                                    Option
                                  </Button>
                                </div>
                                {(
                                  getActiveTabPayload().flexible_exit_options ||
                                  []
                                ).map((feo: string, idx: number) => (
                                  <div
                                    key={idx}
                                    className="flex gap-2 items-center"
                                  >
                                    <Input
                                      placeholder="e.g. Diploma after 1 year, Advanced Diploma after 2 years"
                                      value={feo || ""}
                                      onChange={(e) => {
                                        const next = [
                                          ...(getActiveTabPayload()
                                            .flexible_exit_options || []),
                                        ];
                                        next[idx] = e.target.value;
                                        updateActiveTabPayload({
                                          flexible_exit_options: next,
                                        });
                                      }}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        const next = (
                                          getActiveTabPayload()
                                            .flexible_exit_options || []
                                        ).filter(
                                          (_: any, i: number) => i !== idx,
                                        );
                                        updateActiveTabPayload({
                                          flexible_exit_options: next,
                                        });
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 4. FACILITIES & TIMINGS SUB-TAB */}
                          {courseInfoSubTab === "facilities" && (
                            <div className="space-y-6">
                              {/* Class Timings Array */}
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <Label className="font-bold">
                                    Class Timings
                                  </Label>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const next = [
                                        ...(getActiveTabPayload()
                                          .class_timings || []),
                                        "",
                                      ];
                                      updateActiveTabPayload({
                                        class_timings: next,
                                      });
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-1" /> Add Timing
                                  </Button>
                                </div>
                                {(
                                  getActiveTabPayload().class_timings || []
                                ).map((ct: string, idx: number) => (
                                  <div
                                    key={idx}
                                    className="flex gap-2 items-center"
                                  >
                                    <Input
                                      placeholder="e.g. Mon-Fri: 9:00 AM to 4:00 PM"
                                      value={ct || ""}
                                      onChange={(e) => {
                                        const next = [
                                          ...(getActiveTabPayload()
                                            .class_timings || []),
                                        ];
                                        next[idx] = e.target.value;
                                        updateActiveTabPayload({
                                          class_timings: next,
                                        });
                                      }}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        const next = (
                                          getActiveTabPayload().class_timings ||
                                          []
                                        ).filter(
                                          (_: any, i: number) => i !== idx,
                                        );
                                        updateActiveTabPayload({
                                          class_timings: next,
                                        });
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                ))}
                              </div>

                              {/* Industry Tools Array */}
                              <div className="space-y-3 pt-4 border-t">
                                <div className="flex justify-between items-center">
                                  <Label className="font-bold">
                                    Industry Tools
                                  </Label>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const next = [
                                        ...(getActiveTabPayload()
                                          .industry_tools || []),
                                        "",
                                      ];
                                      updateActiveTabPayload({
                                        industry_tools: next,
                                      });
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-1" /> Add
                                    Industry Tool
                                  </Button>
                                </div>
                                {(
                                  getActiveTabPayload().industry_tools || []
                                ).map((tool: string, idx: number) => (
                                  <div
                                    key={idx}
                                    className="flex gap-2 items-center"
                                  >
                                    <Input
                                      placeholder="e.g. Python, Docker, Tableau"
                                      value={tool || ""}
                                      onChange={(e) => {
                                        const next = [
                                          ...(getActiveTabPayload()
                                            .industry_tools || []),
                                        ];
                                        next[idx] = e.target.value;
                                        updateActiveTabPayload({
                                          industry_tools: next,
                                        });
                                      }}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        const next = (
                                          getActiveTabPayload()
                                            .industry_tools || []
                                        ).filter(
                                          (_: any, i: number) => i !== idx,
                                        );
                                        updateActiveTabPayload({
                                          industry_tools: next,
                                        });
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                ))}
                              </div>

                              {/* Lab Facilities Array */}
                              <div className="space-y-3 pt-4 border-t">
                                <div className="flex justify-between items-center">
                                  <Label className="font-bold">
                                    Lab Facilities
                                  </Label>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const next = [
                                        ...(getActiveTabPayload()
                                          .lab_facilities || []),
                                        "",
                                      ];
                                      updateActiveTabPayload({
                                        lab_facilities: next,
                                      });
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-1" /> Add Lab
                                    Facility
                                  </Button>
                                </div>
                                {(
                                  getActiveTabPayload().lab_facilities || []
                                ).map((lab: string, idx: number) => (
                                  <div
                                    key={idx}
                                    className="flex gap-2 items-center"
                                  >
                                    <Input
                                      placeholder="e.g. Advanced IoT & Robotics Lab"
                                      value={lab || ""}
                                      onChange={(e) => {
                                        const next = [
                                          ...(getActiveTabPayload()
                                            .lab_facilities || []),
                                        ];
                                        next[idx] = e.target.value;
                                        updateActiveTabPayload({
                                          lab_facilities: next,
                                        });
                                      }}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        const next = (
                                          getActiveTabPayload()
                                            .lab_facilities || []
                                        ).filter(
                                          (_: any, i: number) => i !== idx,
                                        );
                                        updateActiveTabPayload({
                                          lab_facilities: next,
                                        });
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                ))}
                              </div>

                              {/* Classroom Facilities Array */}
                              <div className="space-y-3 pt-4 border-t">
                                <div className="flex justify-between items-center">
                                  <Label className="font-bold">
                                    Classroom Facilities
                                  </Label>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const next = [
                                        ...(getActiveTabPayload()
                                          .classroom_facilities || []),
                                        "",
                                      ];
                                      updateActiveTabPayload({
                                        classroom_facilities: next,
                                      });
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-1" /> Add
                                    Classroom Facility
                                  </Button>
                                </div>
                                {(
                                  getActiveTabPayload().classroom_facilities ||
                                  []
                                ).map((cr: string, idx: number) => (
                                  <div
                                    key={idx}
                                    className="flex gap-2 items-center"
                                  >
                                    <Input
                                      placeholder="e.g. Smart Projector, Centrally Air-Conditioned"
                                      value={cr || ""}
                                      onChange={(e) => {
                                        const next = [
                                          ...(getActiveTabPayload()
                                            .classroom_facilities || []),
                                        ];
                                        next[idx] = e.target.value;
                                        updateActiveTabPayload({
                                          classroom_facilities: next,
                                        });
                                      }}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        const next = (
                                          getActiveTabPayload()
                                            .classroom_facilities || []
                                        ).filter(
                                          (_: any, i: number) => i !== idx,
                                        );
                                        updateActiveTabPayload({
                                          classroom_facilities: next,
                                        });
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                ))}
                              </div>

                              {/* Bonus Certification Object */}
                              <div className="border p-4 rounded-xl space-y-4 bg-muted/10">
                                <h4 className="font-bold text-sm text-foreground">
                                  Bonus Certification
                                </h4>
                                <div className="space-y-3">
                                  <div className="space-y-1">
                                    <Label className="text-xs">
                                      Certification Name
                                    </Label>
                                    <Input
                                      placeholder="e.g. Professional Scrum Master"
                                      value={
                                        getActiveTabPayload()
                                          .bonus_certification?.name || ""
                                      }
                                      onChange={(e) =>
                                        updateActiveTabPayload({
                                          bonus_certification: {
                                            ...(getActiveTabPayload()
                                              .bonus_certification || {}),
                                            name: e.target.value,
                                          },
                                        })
                                      }
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">
                                      Certification Note / Description
                                    </Label>
                                    <Input
                                      placeholder="e.g. Included as part of semester 3 curricula"
                                      value={
                                        getActiveTabPayload()
                                          .bonus_certification?.note || ""
                                      }
                                      onChange={(e) =>
                                        updateActiveTabPayload({
                                          bonus_certification: {
                                            ...(getActiveTabPayload()
                                              .bonus_certification || {}),
                                            note: e.target.value,
                                          },
                                        })
                                      }
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">
                                      Certificate / Syllabus Link
                                    </Label>
                                    <Input
                                      placeholder="https://example.com/syllabus.pdf"
                                      value={
                                        getActiveTabPayload()
                                          .bonus_certification
                                          ?.certificate_link || ""
                                      }
                                      onChange={(e) =>
                                        updateActiveTabPayload({
                                          bonus_certification: {
                                            ...(getActiveTabPayload()
                                              .bonus_certification || {}),
                                            certificate_link: e.target.value,
                                          },
                                        })
                                      }
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 5. CAREER & ALUMNI / FAQS SUB-TAB */}
                          {courseInfoSubTab === "alumni_faqs" && (
                            <div className="space-y-6">
                              {/* Career Opportunities Array */}
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <Label className="font-bold">
                                    Career Opportunities
                                  </Label>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const next = [
                                        ...(getActiveTabPayload()
                                          .career_opportunities || []),
                                        "",
                                      ];
                                      updateActiveTabPayload({
                                        career_opportunities: next,
                                      });
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-1" /> Add
                                    Opportunity
                                  </Button>
                                </div>
                                {(
                                  getActiveTabPayload().career_opportunities ||
                                  []
                                ).map((co: string, idx: number) => (
                                  <div
                                    key={idx}
                                    className="flex gap-2 items-center"
                                  >
                                    <Input
                                      placeholder="e.g. Digital Transformation Consultant, Product Manager"
                                      value={co || ""}
                                      onChange={(e) => {
                                        const next = [
                                          ...(getActiveTabPayload()
                                            .career_opportunities || []),
                                        ];
                                        next[idx] = e.target.value;
                                        updateActiveTabPayload({
                                          career_opportunities: next,
                                        });
                                      }}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        const next = (
                                          getActiveTabPayload()
                                            .career_opportunities || []
                                        ).filter(
                                          (_: any, i: number) => i !== idx,
                                        );
                                        updateActiveTabPayload({
                                          career_opportunities: next,
                                        });
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                ))}
                              </div>

                              {/* Featured Alumni Array */}
                              <div className="space-y-3 pt-4 border-t">
                                <div className="flex justify-between items-center">
                                  <Label className="font-bold text-foreground">
                                    Featured Alumni
                                  </Label>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const next = [
                                        ...(getActiveTabPayload()
                                          .featured_alumni || []),
                                        {
                                          name: "",
                                          company: "",
                                          designation: "",
                                          image: "",
                                        },
                                      ];
                                      updateActiveTabPayload({
                                        featured_alumni: next,
                                      });
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-1" /> Add
                                    Alumnus
                                  </Button>
                                </div>
                                {(
                                  getActiveTabPayload().featured_alumni || []
                                ).map((al: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="flex gap-2 items-start border p-3 rounded-lg bg-muted/5"
                                  >
                                    <div className="flex-1 space-y-2">
                                      <Input
                                        placeholder="Alumni Name"
                                        value={al.name || ""}
                                        onChange={(e) => {
                                          const next = [
                                            ...(getActiveTabPayload()
                                              .featured_alumni || []),
                                          ];
                                          next[idx] = {
                                            ...next[idx],
                                            name: e.target.value,
                                          };
                                          updateActiveTabPayload({
                                            featured_alumni: next,
                                          });
                                        }}
                                      />
                                      <div className="grid gap-2 grid-cols-2">
                                        <Input
                                          placeholder="Company"
                                          value={al.company || ""}
                                          onChange={(e) => {
                                            const next = [
                                              ...(getActiveTabPayload()
                                                .featured_alumni || []),
                                            ];
                                            next[idx] = {
                                              ...next[idx],
                                              company: e.target.value,
                                            };
                                            updateActiveTabPayload({
                                              featured_alumni: next,
                                            });
                                          }}
                                        />
                                        <Input
                                          placeholder="Designation"
                                          value={al.designation || ""}
                                          onChange={(e) => {
                                            const next = [
                                              ...(getActiveTabPayload()
                                                .featured_alumni || []),
                                            ];
                                            next[idx] = {
                                              ...next[idx],
                                              designation: e.target.value,
                                            };
                                            updateActiveTabPayload({
                                              featured_alumni: next,
                                            });
                                          }}
                                        />
                                      </div>
                                      <Input
                                        placeholder="Image Link"
                                        value={al.image || ""}
                                        onChange={(e) => {
                                          const next = [
                                            ...(getActiveTabPayload()
                                              .featured_alumni || []),
                                          ];
                                          next[idx] = {
                                            ...next[idx],
                                            image: e.target.value,
                                          };
                                          updateActiveTabPayload({
                                            featured_alumni: next,
                                          });
                                        }}
                                      />
                                      <Input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        disabled={uploadingAlumniIndex === idx}
                                        onChange={(e) =>
                                          handleAlumniImageUpload(
                                            e.target.files?.[0] ?? null,
                                            idx,
                                          )
                                        }
                                      />
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        const next = (
                                          getActiveTabPayload()
                                            .featured_alumni || []
                                        ).filter(
                                          (_: any, i: number) => i !== idx,
                                        );
                                        updateActiveTabPayload({
                                          featured_alumni: next,
                                        });
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                ))}
                              </div>

                              {/* FAQs Array */}
                              <div className="space-y-3 pt-4 border-t">
                                <div className="flex justify-between items-center">
                                  <Label className="font-bold">FAQs</Label>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const next = [
                                        ...(getActiveTabPayload().faqs || []),
                                        { question: "", answer: "" },
                                      ];
                                      updateActiveTabPayload({ faqs: next });
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-1" /> Add FAQ
                                  </Button>
                                </div>
                                {(getActiveTabPayload().faqs || []).map(
                                  (faq: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className="flex gap-2 items-start border p-3 rounded-lg bg-muted/5"
                                    >
                                      <div className="flex-1 space-y-2">
                                        <Input
                                          placeholder="Question"
                                          value={faq.question || ""}
                                          onChange={(e) => {
                                            const next = [
                                              ...(getActiveTabPayload().faqs ||
                                                []),
                                            ];
                                            next[idx] = {
                                              ...next[idx],
                                              question: e.target.value,
                                            };
                                            updateActiveTabPayload({
                                              faqs: next,
                                            });
                                          }}
                                        />
                                        <Textarea
                                          placeholder="Answer"
                                          rows={2}
                                          value={faq.answer || ""}
                                          onChange={(e) => {
                                            const next = [
                                              ...(getActiveTabPayload().faqs ||
                                                []),
                                            ];
                                            next[idx] = {
                                              ...next[idx],
                                              answer: e.target.value,
                                            };
                                            updateActiveTabPayload({
                                              faqs: next,
                                            });
                                          }}
                                        />
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          const next = (
                                            getActiveTabPayload().faqs || []
                                          ).filter(
                                            (_: any, i: number) => i !== idx,
                                          );
                                          updateActiveTabPayload({
                                            faqs: next,
                                          });
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>
                                  ),
                                )}
                              </div>

                              {/* Student Forum Object */}
                              <div className="border p-4 rounded-xl space-y-4 bg-muted/10">
                                <h4 className="font-bold text-sm text-foreground">
                                  Student Forum & Admissions Contact
                                </h4>
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-1">
                                    <Label className="text-xs">
                                      Admission Team Contact
                                    </Label>
                                    <Input
                                      placeholder="e.g. +91 99999 88888"
                                      value={
                                        getActiveTabPayload().student_forum
                                          ?.admission_team_contact || ""
                                      }
                                      onChange={(e) =>
                                        updateActiveTabPayload({
                                          student_forum: {
                                            ...(getActiveTabPayload()
                                              .student_forum || {}),
                                            admission_team_contact:
                                              e.target.value,
                                          },
                                        })
                                      }
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">
                                      Ex-Student Chat / Community Link
                                    </Label>
                                    <Input
                                      placeholder="https://community.example.com"
                                      value={
                                        getActiveTabPayload().student_forum
                                          ?.ex_student_chat || ""
                                      }
                                      onChange={(e) =>
                                        updateActiveTabPayload({
                                          student_forum: {
                                            ...(getActiveTabPayload()
                                              .student_forum || {}),
                                            ex_student_chat: e.target.value,
                                          },
                                        })
                                      }
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ADMISSION POLICY */}
                      {activeTab === "admission_policy" && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Admission Policy Summary</Label>
                            <Textarea
                              rows={3}
                              placeholder="Describe the overall admission flow..."
                              value={getActiveTabPayload().policySummary || ""}
                              onChange={(e) =>
                                updateActiveTabPayload({
                                  policySummary: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
                            <div className="space-y-1">
                              <Label>
                                National Level Entrance exams accepted
                              </Label>
                              <Input
                                placeholder="JEE Main, NEET"
                                value={
                                  getActiveTabPayload().entranceExams?.nationalLevel?.join(
                                    ", ",
                                  ) || ""
                                }
                                onChange={(e) =>
                                  updateActiveTabPayload({
                                    entranceExams: {
                                      ...(getActiveTabPayload().entranceExams ||
                                        {}),
                                      nationalLevel: e.target.value
                                        .split(",")
                                        .map((s) => s.trim())
                                        .filter(Boolean),
                                    },
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>State Level Entrance exams accepted</Label>
                              <Input
                                placeholder="KCET, MHT-CET"
                                value={
                                  getActiveTabPayload().entranceExams?.stateLevel?.join(
                                    ", ",
                                  ) || ""
                                }
                                onChange={(e) =>
                                  updateActiveTabPayload({
                                    entranceExams: {
                                      ...(getActiveTabPayload().entranceExams ||
                                        {}),
                                      stateLevel: e.target.value
                                        .split(",")
                                        .map((s) => s.trim())
                                        .filter(Boolean),
                                    },
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* PLACEMENTS */}
                      {activeTab === "placements" && (
                        <div className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-1">
                              <Label>Average Salary Package</Label>
                              <Input
                                placeholder="e.g. 7.5 LPA"
                                value={
                                  getActiveTabPayload().placement_stats
                                    ?.averagePackage || ""
                                }
                                onChange={(e) =>
                                  updateActiveTabPayload({
                                    placement_stats: {
                                      ...(getActiveTabPayload()
                                        .placement_stats || {}),
                                      averagePackage: e.target.value,
                                    },
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Highest Salary Package</Label>
                              <Input
                                placeholder="e.g. 45 LPA"
                                value={
                                  getActiveTabPayload().placement_stats
                                    ?.highestPackage || ""
                                }
                                onChange={(e) =>
                                  updateActiveTabPayload({
                                    placement_stats: {
                                      ...(getActiveTabPayload()
                                        .placement_stats || {}),
                                      highestPackage: e.target.value,
                                    },
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Placement Percentage</Label>
                              <Input
                                placeholder="e.g. 96%"
                                value={
                                  getActiveTabPayload().placement_stats
                                    ?.placementPercentage || ""
                                }
                                onChange={(e) =>
                                  updateActiveTabPayload({
                                    placement_stats: {
                                      ...(getActiveTabPayload()
                                        .placement_stats || {}),
                                      placementPercentage: e.target.value,
                                    },
                                  })
                                }
                              />
                            </div>
                          </div>

                          <div className="space-y-2 pt-4 border-t">
                            <Label>Placement Growth Summary Description</Label>
                            <Textarea
                              placeholder="Highlight top recruiting companies and statistics growth..."
                              value={getActiveTabPayload().growthSummary || ""}
                              onChange={(e) =>
                                updateActiveTabPayload({
                                  growthSummary: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                      )}

                      {/* FEES */}
                      {activeTab === "fees" && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Annual/Semester Tuition Fees Details</Label>
                            <Textarea
                              placeholder="Highlight tuition fees and deposit details..."
                              value={
                                getActiveTabPayload().tuitionFeesSummary || ""
                              }
                              onChange={(e) =>
                                updateActiveTabPayload({
                                  tuitionFeesSummary: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="space-y-3 pt-4 border-t">
                            <Label className="block font-bold">
                              One-Time / Extra Admission Fees
                            </Label>
                            {(getActiveTabPayload().one_time_fees || []).map(
                              (f: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex gap-2 items-center"
                                >
                                  <Input
                                    placeholder="Fee Name (e.g. Security Deposit)"
                                    value={f.name || ""}
                                    onChange={(e) => {
                                      const next = [
                                        ...(getActiveTabPayload()
                                          .one_time_fees || []),
                                      ];
                                      next[idx].name = e.target.value;
                                      updateActiveTabPayload({
                                        one_time_fees: next,
                                      });
                                    }}
                                  />
                                  <Input
                                    placeholder="Amount (e.g. 10,000)"
                                    value={f.amount || ""}
                                    onChange={(e) => {
                                      const next = [
                                        ...(getActiveTabPayload()
                                          .one_time_fees || []),
                                      ];
                                      next[idx].amount = e.target.value;
                                      updateActiveTabPayload({
                                        one_time_fees: next,
                                      });
                                    }}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      const next = (
                                        getActiveTabPayload().one_time_fees ||
                                        []
                                      ).filter(
                                        (_: any, i: number) => i !== idx,
                                      );
                                      updateActiveTabPayload({
                                        one_time_fees: next,
                                      });
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              ),
                            )}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const next = [
                                  ...(getActiveTabPayload().one_time_fees ||
                                    []),
                                  { name: "", amount: "" },
                                ];
                                updateActiveTabPayload({ one_time_fees: next });
                              }}
                            >
                              Add One-time Fee
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* FINANCIAL AID */}
                      {activeTab === "financial_aid" && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Merit Scholarship criteria</Label>
                            <Textarea
                              placeholder="Eligibility criteria based on scores/ranks..."
                              value={
                                getActiveTabPayload().meritScholarship
                                  ?.description || ""
                              }
                              onChange={(e) =>
                                updateActiveTabPayload({
                                  meritScholarship: {
                                    title: "Merit Scholarship",
                                    description: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>

                          <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
                            <div className="space-y-1">
                              <Label>Upfront Fee Discount Concession</Label>
                              <Input
                                placeholder="e.g. 10% upfront payment discount"
                                value={
                                  getActiveTabPayload().upfrontFeeConcession
                                    ?.discount || ""
                                }
                                onChange={(e) =>
                                  updateActiveTabPayload({
                                    upfrontFeeConcession: {
                                      discount: e.target.value,
                                      details:
                                        "For paying annual fee in single lump-sum",
                                    },
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* STUDENT HOUSING */}
                      {activeTab === "student_housing" && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Hostel & Housing Summary</Label>
                            <Textarea
                              placeholder="Describe AC/Non-AC hostel rooms, food facilities..."
                              value={getActiveTabPayload().summary || ""}
                              onChange={(e) =>
                                updateActiveTabPayload({
                                  summary: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                      )}

                      {/* EXAM POLICY */}
                      {activeTab === "exam_policy" && (
                        <div className="space-y-4">
                          <Label className="block font-bold">
                            Marks Evaluation Rules
                          </Label>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                              <Label>Internal Assessment (Weight %)</Label>
                              <Input
                                type="number"
                                placeholder="e.g. 40"
                                value={
                                  getActiveTabPayload().course_with_practical
                                    ?.internalMarks || ""
                                }
                                onChange={(e) =>
                                  updateActiveTabPayload({
                                    course_with_practical: {
                                      ...(getActiveTabPayload()
                                        .course_with_practical || {}),
                                      internalMarks: Number(e.target.value),
                                    },
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Semester Exams (Weight %)</Label>
                              <Input
                                type="number"
                                placeholder="e.g. 60"
                                value={
                                  getActiveTabPayload().course_with_practical
                                    ?.externalMarks || ""
                                }
                                onChange={(e) =>
                                  updateActiveTabPayload({
                                    course_with_practical: {
                                      ...(getActiveTabPayload()
                                        .course_with_practical || {}),
                                      externalMarks: Number(e.target.value),
                                    },
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* FACULTY */}
                      {activeTab === "faculty" && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="block font-bold">
                              Faculty Members
                            </Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const next = [
                                  ...(getActiveTabPayload().list || []),
                                  { name: "", designation: "", experience: "" },
                                ];
                                updateActiveTabPayload({ list: next });
                              }}
                            >
                              Add Faculty
                            </Button>
                          </div>
                          {(getActiveTabPayload().list || []).map(
                            (f: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex gap-2 items-center border p-3 rounded-lg bg-muted/10"
                              >
                                <Input
                                  placeholder="Faculty Name"
                                  value={f.name || ""}
                                  onChange={(e) => {
                                    const next = [
                                      ...(getActiveTabPayload().list || []),
                                    ];
                                    next[idx].name = e.target.value;
                                    updateActiveTabPayload({ list: next });
                                  }}
                                />
                                <Input
                                  placeholder="Designation (e.g. HOD CS)"
                                  value={f.designation || ""}
                                  onChange={(e) => {
                                    const next = [
                                      ...(getActiveTabPayload().list || []),
                                    ];
                                    next[idx].designation = e.target.value;
                                    updateActiveTabPayload({ list: next });
                                  }}
                                />
                                <Input
                                  placeholder="Experience (e.g. 12 Years)"
                                  value={f.experience || ""}
                                  onChange={(e) => {
                                    const next = [
                                      ...(getActiveTabPayload().list || []),
                                    ];
                                    next[idx].experience = e.target.value;
                                    updateActiveTabPayload({ list: next });
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const next = (
                                      getActiveTabPayload().list || []
                                    ).filter((_: any, i: number) => i !== idx);
                                    updateActiveTabPayload({ list: next });
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            ),
                          )}
                        </div>
                      )}

                      {/* REVIEWS */}
                      {activeTab === "review" && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>
                              Overall Student Satisfaction Rating (1-5)
                            </Label>
                            <Input
                              type="number"
                              placeholder="e.g. 4.5"
                              value={getActiveTabPayload().overallRating || ""}
                              onChange={(e) =>
                                updateActiveTabPayload({
                                  overallRating: Number(e.target.value),
                                })
                              }
                            />
                          </div>
                        </div>
                      )}

                      {/* LIBRARY */}
                      {activeTab === "library" && (
                        <div className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                              <Label>Library Area (Sq Feet)</Label>
                              <Input
                                type="number"
                                placeholder="e.g. 12000"
                                value={getActiveTabPayload().areaSqFeet || ""}
                                onChange={(e) =>
                                  updateActiveTabPayload({
                                    areaSqFeet: Number(e.target.value),
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Total Seat Capacity</Label>
                              <Input
                                type="number"
                                placeholder="e.g. 300"
                                value={getActiveTabPayload().totalSeats || ""}
                                onChange={(e) =>
                                  updateActiveTabPayload({
                                    totalSeats: Number(e.target.value),
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* CLUBS */}
                      {activeTab === "clubs_associations" && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="block font-bold">
                              Clubs & Associations
                            </Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const next = [
                                  ...(getActiveTabPayload().clubs || []),
                                  { name: "", description: "" },
                                ];
                                updateActiveTabPayload({ clubs: next });
                              }}
                            >
                              Add Club
                            </Button>
                          </div>
                          {(getActiveTabPayload().clubs || []).map(
                            (c: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex gap-2 items-center border p-3 rounded-lg bg-muted/10"
                              >
                                <Input
                                  placeholder="Club Name"
                                  value={c.name || ""}
                                  onChange={(e) => {
                                    const next = [
                                      ...(getActiveTabPayload().clubs || []),
                                    ];
                                    next[idx].name = e.target.value;
                                    updateActiveTabPayload({ clubs: next });
                                  }}
                                />
                                <Input
                                  placeholder="Short description..."
                                  value={c.description || ""}
                                  onChange={(e) => {
                                    const next = [
                                      ...(getActiveTabPayload().clubs || []),
                                    ];
                                    next[idx].description = e.target.value;
                                    updateActiveTabPayload({ clubs: next });
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const next = (
                                      getActiveTabPayload().clubs || []
                                    ).filter((_: any, i: number) => i !== idx);
                                    updateActiveTabPayload({ clubs: next });
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            ),
                          )}
                        </div>
                      )}

                      {/* ALLIANCES */}
                      {activeTab === "alliance" && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="block font-bold">
                              Industrial & International Partnerships
                            </Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const next = [
                                  ...(getActiveTabPayload().alliances || []),
                                  { partnerName: "", type: "Industrial" },
                                ];
                                updateActiveTabPayload({ alliances: next });
                              }}
                            >
                              Add Alliance
                            </Button>
                          </div>
                          {(getActiveTabPayload().alliances || []).map(
                            (a: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex gap-2 items-center border p-3 rounded-lg bg-muted/10"
                              >
                                <Input
                                  placeholder="Partner Company/Uni"
                                  value={a.partnerName || ""}
                                  onChange={(e) => {
                                    const next = [
                                      ...(getActiveTabPayload().alliances ||
                                        []),
                                    ];
                                    next[idx].partnerName = e.target.value;
                                    updateActiveTabPayload({ alliances: next });
                                  }}
                                />
                                <Input
                                  placeholder="Alliance Type"
                                  value={a.type || ""}
                                  onChange={(e) => {
                                    const next = [
                                      ...(getActiveTabPayload().alliances ||
                                        []),
                                    ];
                                    next[idx].type = e.target.value;
                                    updateActiveTabPayload({ alliances: next });
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const next = (
                                      getActiveTabPayload().alliances || []
                                    ).filter((_: any, i: number) => i !== idx);
                                    updateActiveTabPayload({ alliances: next });
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            ),
                          )}
                        </div>
                      )}

                      {/* OTHER COURSES */}
                      {activeTab === "other_courses_offered" && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <Label className="block font-bold">
                              Related Pathways / Courses
                            </Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const next = [
                                  ...(getActiveTabPayload().list || []),
                                  { courseName: "", duration: "" },
                                ];
                                updateActiveTabPayload({ list: next });
                              }}
                            >
                              Add Course Lineage
                            </Button>
                          </div>
                          {(getActiveTabPayload().list || []).map(
                            (c: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex gap-2 items-center border p-3 rounded-lg bg-muted/10"
                              >
                                <Input
                                  placeholder="Course Name"
                                  value={c.courseName || ""}
                                  onChange={(e) => {
                                    const next = [
                                      ...(getActiveTabPayload().list || []),
                                    ];
                                    next[idx].courseName = e.target.value;
                                    updateActiveTabPayload({ list: next });
                                  }}
                                />
                                <Input
                                  placeholder="Duration"
                                  value={c.duration || ""}
                                  onChange={(e) => {
                                    const next = [
                                      ...(getActiveTabPayload().list || []),
                                    ];
                                    next[idx].duration = e.target.value;
                                    updateActiveTabPayload({ list: next });
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const next = (
                                      getActiveTabPayload().list || []
                                    ).filter((_: any, i: number) => i !== idx);
                                    updateActiveTabPayload({ list: next });
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            ),
                          )}
                        </div>
                      )}

                      {/* DEMOGRAPHICS */}
                      {activeTab === "demo_graphics" && (
                        <div className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-1">
                              <Label>Male Students Ratio %</Label>
                              <Input
                                type="number"
                                placeholder="e.g. 60"
                                value={
                                  getActiveTabPayload().stats?.maleRatio || ""
                                }
                                onChange={(e) =>
                                  updateActiveTabPayload({
                                    stats: {
                                      ...(getActiveTabPayload().stats || {}),
                                      maleRatio: Number(e.target.value),
                                    },
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Female Students Ratio %</Label>
                              <Input
                                type="number"
                                placeholder="e.g. 40"
                                value={
                                  getActiveTabPayload().stats?.femaleRatio || ""
                                }
                                onChange={(e) =>
                                  updateActiveTabPayload({
                                    stats: {
                                      ...(getActiveTabPayload().stats || {}),
                                      femaleRatio: Number(e.target.value),
                                    },
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Out-of-State Ratio %</Label>
                              <Input
                                type="number"
                                placeholder="e.g. 25"
                                value={
                                  getActiveTabPayload().stats
                                    ?.outOfStateRatio || ""
                                }
                                onChange={(e) =>
                                  updateActiveTabPayload({
                                    stats: {
                                      ...(getActiveTabPayload().stats || {}),
                                      outOfStateRatio: Number(e.target.value),
                                    },
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>

                {/* BOTTOM TAB TOGGLE NAV */}
                <div className="flex justify-between items-center p-6 border-t bg-muted/10">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const idx = COURSE_TABS.findIndex(
                        (t) => t.id === activeTab,
                      );
                      if (idx > 0) setActiveTab(COURSE_TABS[idx - 1].id);
                    }}
                  >
                    Back Tab
                  </Button>
                  <Button
                    type="button"
                    className="bg-zinc-800 hover:bg-zinc-900 text-white font-semibold"
                    onClick={() => {
                      const idx = COURSE_TABS.findIndex(
                        (t) => t.id === activeTab,
                      );
                      if (idx < COURSE_TABS.length - 1) {
                        setActiveTab(COURSE_TABS[idx + 1].id);
                      } else {
                        setEditingCourse(null);
                        setIsAdding(false);
                      }
                    }}
                  >
                    Next Tab
                  </Button>
                </div>
              </Card>
            )}

            {/* EXIT WORKSPACE BAR */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => {
                  setEditingCourse(null);
                  setIsAdding(false);
                }}
              >
                Back to Programs List
              </Button>
            </div>
          </main>
        </div>
      )}

      {/* BOTTOM WIDE ACTIONS */}
      {!isEditingOrAdding && (
        <div className="flex justify-between pt-8 border-t mt-8">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() =>
              router.push(getPortalPath(collegeSlug, "/setup/campuses"))
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campuses
          </Button>
          <Button
            size="lg"
            className="shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            onClick={() =>
              router.push(getPortalPath(collegeSlug, "/setup/review"))
            }
          >
            Continue to Review
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
