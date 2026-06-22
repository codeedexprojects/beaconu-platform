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
  const [examPolicySubTab, setExamPolicySubTab] = useState<string>("patterns");
  const [examPolicyPatternIdx, setExamPolicyPatternIdx] = useState<number>(0);
  const [uploadingBrochure, setUploadingBrochure] = useState(false);
  const [uploadingAlumniIndex, setUploadingAlumniIndex] = useState<
    number | null
  >(null);
  const [uploadingFeePdf, setUploadingFeePdf] = useState(false);

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

  // ── Fees tab helpers ──────────────────────────────────────────────────────
  // Raw shape only — no icons/titles here. The public API
  // (transformPublicFeeTab in course-tabs.service.ts) decorates this at
  // read time, so the form only needs to capture the substance.
  const getFeeDetails = (): any[] => getActiveTabPayload().fee_details || [];

  const updateFeeDetails = (next: any[]) =>
    updateActiveTabPayload({ fee_details: next });

  const updateFeeDetail = (idx: number, patch: any) => {
    const next = [...getFeeDetails()];
    next[idx] = { ...next[idx], ...patch };
    updateFeeDetails(next);
  };

  const addFeeDetail = () => {
    updateFeeDetails([
      ...getFeeDetails(),
      {
        quota: "",
        gender: "",
        tuition_fees: [],
        additional_fees: [],
        one_time_payable_fees: [],
        deadlines_and_installments: [],
        fees_summary: { full_course_fee: "", booking_amount: "" },
      },
    ]);
  };

  const removeFeeDetail = (idx: number) => {
    updateFeeDetails(getFeeDetails().filter((_, i) => i !== idx));
  };

  const updateFeeDetailListItem = (
    detailIdx: number,
    field:
      | "tuition_fees"
      | "additional_fees"
      | "one_time_payable_fees"
      | "deadlines_and_installments",
    itemIdx: number,
    patch: any,
  ) => {
    const list = [...(getFeeDetails()[detailIdx]?.[field] || [])];
    list[itemIdx] = { ...list[itemIdx], ...patch };
    updateFeeDetail(detailIdx, { [field]: list });
  };

  const addFeeDetailListItem = (
    detailIdx: number,
    field:
      | "tuition_fees"
      | "additional_fees"
      | "one_time_payable_fees"
      | "deadlines_and_installments",
    emptyItem: any,
  ) => {
    const list = [...(getFeeDetails()[detailIdx]?.[field] || []), emptyItem];
    updateFeeDetail(detailIdx, { [field]: list });
  };

  const removeFeeDetailListItem = (
    detailIdx: number,
    field:
      | "tuition_fees"
      | "additional_fees"
      | "one_time_payable_fees"
      | "deadlines_and_installments",
    itemIdx: number,
  ) => {
    const list = (getFeeDetails()[detailIdx]?.[field] || []).filter(
      (_: any, i: number) => i !== itemIdx,
    );
    updateFeeDetail(detailIdx, { [field]: list });
  };

  const updateFeeStringList = (
    field: "whats_included" | "whats_excluded" | "refund_policy",
    next: string[],
  ) => updateActiveTabPayload({ [field]: next });

  const handleFeePdfUpload = async (file: File | null) => {
    if (!file) return;

    try {
      setUploadingFeePdf(true);
      const permanentUrl = await uploadCollegeAdminFile(
        file,
        `courses/${editingCourse?.id || "draft"}/fee-structure-pdf`,
      );
      updateActiveTabPayload({
        fee_structure_pdf: {
          ...(getActiveTabPayload().fee_structure_pdf || {}),
          url: permanentUrl,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        },
      });
      toast.success("Fee structure PDF uploaded to S3");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      toast.error(message);
    } finally {
      setUploadingFeePdf(false);
    }
  };

  // ── Financial Aid tab helpers ─────────────────────────────────────────────
  // Same idea as fees: raw shape only — transformPublicFinancialAidTab in
  // course-tabs.service.ts adds icons/titles/labels at read time.
  const getMeritScholarship = (): any =>
    getActiveTabPayload().merit_scholarship || {};

  const updateMeritScholarship = (patch: any) =>
    updateActiveTabPayload({
      merit_scholarship: { ...getMeritScholarship(), ...patch },
    });

  const updateMeritCalculator = (patch: any) =>
    updateMeritScholarship({
      calculator: { ...(getMeritScholarship().calculator || {}), ...patch },
    });

  const updateMeritFinalSummary = (patch: any) =>
    updateMeritScholarship({
      final_summary: {
        ...(getMeritScholarship().final_summary || {}),
        ...patch,
      },
    });

  const getConcessionItems = (): any[] =>
    getActiveTabPayload().financial_concessions?.items || [];

  const updateConcessionItems = (next: any[]) =>
    updateActiveTabPayload({
      financial_concessions: {
        ...(getActiveTabPayload().financial_concessions || {}),
        items: next,
        total_types: next.length,
      },
    });

  const updateConcessionItem = (idx: number, patch: any) => {
    const next = [...getConcessionItems()];
    next[idx] = { ...next[idx], ...patch };
    updateConcessionItems(next);
  };

  const addConcessionItem = () => {
    updateConcessionItems([
      ...getConcessionItems(),
      {
        name: "",
        discount_percent: 0,
        details: {
          eligibility_criteria: [],
          scholarship_amount: "",
          net_payable: "",
        },
      },
    ]);
  };

  const removeConcessionItem = (idx: number) => {
    updateConcessionItems(getConcessionItems().filter((_, i) => i !== idx));
  };

  const updateConcessionDetails = (idx: number, patch: any) => {
    const item = getConcessionItems()[idx];
    updateConcessionItem(idx, {
      details: { ...(item?.details || {}), ...patch },
    });
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
                        <div className="space-y-6">
                          <div className="space-y-1">
                            <Label>Fee Structure PDF</Label>
                            <Input
                              placeholder="https://example.com/fee-structure.pdf"
                              value={
                                getActiveTabPayload().fee_structure_pdf?.url ||
                                ""
                              }
                              onChange={(e) =>
                                updateActiveTabPayload({
                                  fee_structure_pdf: {
                                    ...(getActiveTabPayload()
                                      .fee_structure_pdf || {}),
                                    url: e.target.value,
                                  },
                                })
                              }
                            />
                            <Input
                              type="file"
                              accept="application/pdf"
                              disabled={uploadingFeePdf}
                              onChange={(e) =>
                                handleFeePdfUpload(e.target.files?.[0] ?? null)
                              }
                            />
                          </div>

                          {getFeeDetails().map((detail, dIdx) => (
                            <div
                              key={dIdx}
                              className="space-y-4 rounded-md border p-4"
                            >
                              <div className="flex items-center justify-between">
                                <Label className="font-bold">
                                  Fee Detail #{dIdx + 1}
                                </Label>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeFeeDetail(dIdx)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>

                              <div className="grid gap-3 md:grid-cols-2">
                                <div className="space-y-1">
                                  <Label>Quota</Label>
                                  <Input
                                    placeholder="e.g. Merit Quota"
                                    value={detail.quota || ""}
                                    onChange={(e) =>
                                      updateFeeDetail(dIdx, {
                                        quota: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label>Gender</Label>
                                  <Input
                                    placeholder="e.g. Boys / Girls"
                                    value={detail.gender || ""}
                                    onChange={(e) =>
                                      updateFeeDetail(dIdx, {
                                        gender: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              </div>

                              <div className="grid gap-3 md:grid-cols-2 pt-2 border-t">
                                <div className="space-y-1">
                                  <Label>Full Course Fee</Label>
                                  <Input
                                    placeholder="e.g. INR 1,48,750"
                                    value={
                                      detail.fees_summary?.full_course_fee || ""
                                    }
                                    onChange={(e) =>
                                      updateFeeDetail(dIdx, {
                                        fees_summary: {
                                          ...(detail.fees_summary || {}),
                                          full_course_fee: e.target.value,
                                        },
                                      })
                                    }
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label>Booking Amount</Label>
                                  <Input
                                    placeholder="e.g. INR 6,198"
                                    value={
                                      detail.fees_summary?.booking_amount || ""
                                    }
                                    onChange={(e) =>
                                      updateFeeDetail(dIdx, {
                                        fees_summary: {
                                          ...(detail.fees_summary || {}),
                                          booking_amount: e.target.value,
                                        },
                                      })
                                    }
                                  />
                                </div>
                              </div>

                              {/* Tuition Fees (per year) */}
                              <div className="space-y-2 pt-3 border-t">
                                <div className="flex items-center justify-between">
                                  <Label className="font-bold">
                                    Tuition Fees (Per Year)
                                  </Label>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      addFeeDetailListItem(
                                        dIdx,
                                        "tuition_fees",
                                        { year: "", amount: "" },
                                      )
                                    }
                                  >
                                    <Plus className="h-4 w-4 mr-1" /> Add Year
                                  </Button>
                                </div>
                                {(detail.tuition_fees || []).map(
                                  (row: any, rIdx: number) => (
                                    <div
                                      key={rIdx}
                                      className="flex gap-2 items-center"
                                    >
                                      <Input
                                        placeholder="e.g. 1st Year"
                                        value={row.year || ""}
                                        onChange={(e) =>
                                          updateFeeDetailListItem(
                                            dIdx,
                                            "tuition_fees",
                                            rIdx,
                                            { year: e.target.value },
                                          )
                                        }
                                      />
                                      <Input
                                        placeholder="e.g. Rs 1,25,276"
                                        value={row.amount || ""}
                                        onChange={(e) =>
                                          updateFeeDetailListItem(
                                            dIdx,
                                            "tuition_fees",
                                            rIdx,
                                            { amount: e.target.value },
                                          )
                                        }
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          removeFeeDetailListItem(
                                            dIdx,
                                            "tuition_fees",
                                            rIdx,
                                          )
                                        }
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>
                                  ),
                                )}
                              </div>

                              {/* Additional Fees */}
                              <div className="space-y-2 pt-3 border-t">
                                <div className="flex items-center justify-between">
                                  <Label className="font-bold">
                                    Additional Fees
                                  </Label>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      addFeeDetailListItem(
                                        dIdx,
                                        "additional_fees",
                                        { label: "", amount: "" },
                                      )
                                    }
                                  >
                                    <Plus className="h-4 w-4 mr-1" /> Add Fee
                                  </Button>
                                </div>
                                {(detail.additional_fees || []).map(
                                  (row: any, rIdx: number) => (
                                    <div
                                      key={rIdx}
                                      className="flex gap-2 items-center"
                                    >
                                      <Input
                                        placeholder="e.g. Examination Fees"
                                        value={row.label || ""}
                                        onChange={(e) =>
                                          updateFeeDetailListItem(
                                            dIdx,
                                            "additional_fees",
                                            rIdx,
                                            { label: e.target.value },
                                          )
                                        }
                                      />
                                      <Input
                                        placeholder="e.g. Rs 3,500"
                                        value={row.amount || ""}
                                        onChange={(e) =>
                                          updateFeeDetailListItem(
                                            dIdx,
                                            "additional_fees",
                                            rIdx,
                                            { amount: e.target.value },
                                          )
                                        }
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          removeFeeDetailListItem(
                                            dIdx,
                                            "additional_fees",
                                            rIdx,
                                          )
                                        }
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>
                                  ),
                                )}
                              </div>

                              {/* One-time Payable Fees */}
                              <div className="space-y-2 pt-3 border-t">
                                <div className="flex items-center justify-between">
                                  <Label className="font-bold">
                                    One-Time Payable Fees
                                  </Label>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      addFeeDetailListItem(
                                        dIdx,
                                        "one_time_payable_fees",
                                        { label: "", amount: "" },
                                      )
                                    }
                                  >
                                    <Plus className="h-4 w-4 mr-1" /> Add Fee
                                  </Button>
                                </div>
                                {(detail.one_time_payable_fees || []).map(
                                  (row: any, rIdx: number) => (
                                    <div
                                      key={rIdx}
                                      className="flex gap-2 items-center"
                                    >
                                      <Input
                                        placeholder="e.g. Application Fees"
                                        value={row.label || ""}
                                        onChange={(e) =>
                                          updateFeeDetailListItem(
                                            dIdx,
                                            "one_time_payable_fees",
                                            rIdx,
                                            { label: e.target.value },
                                          )
                                        }
                                      />
                                      <Input
                                        placeholder="e.g. Rs 1,500"
                                        value={row.amount || ""}
                                        onChange={(e) =>
                                          updateFeeDetailListItem(
                                            dIdx,
                                            "one_time_payable_fees",
                                            rIdx,
                                            { amount: e.target.value },
                                          )
                                        }
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          removeFeeDetailListItem(
                                            dIdx,
                                            "one_time_payable_fees",
                                            rIdx,
                                          )
                                        }
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>
                                  ),
                                )}
                              </div>

                              {/* Deadlines & Installments */}
                              <div className="space-y-2 pt-3 border-t">
                                <div className="flex items-center justify-between">
                                  <Label className="font-bold">
                                    Deadlines & Installments
                                  </Label>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      addFeeDetailListItem(
                                        dIdx,
                                        "deadlines_and_installments",
                                        { due: "", label: "", amount: "" },
                                      )
                                    }
                                  >
                                    <Plus className="h-4 w-4 mr-1" /> Add
                                    Installment
                                  </Button>
                                </div>
                                {(detail.deadlines_and_installments || []).map(
                                  (row: any, rIdx: number) => (
                                    <div
                                      key={rIdx}
                                      className="flex gap-2 items-center"
                                    >
                                      <Input
                                        placeholder="Due (e.g. Within 10 Days)"
                                        value={row.due || ""}
                                        onChange={(e) =>
                                          updateFeeDetailListItem(
                                            dIdx,
                                            "deadlines_and_installments",
                                            rIdx,
                                            { due: e.target.value },
                                          )
                                        }
                                      />
                                      <Input
                                        placeholder="Label (e.g. 1st Installment)"
                                        value={row.label || ""}
                                        onChange={(e) =>
                                          updateFeeDetailListItem(
                                            dIdx,
                                            "deadlines_and_installments",
                                            rIdx,
                                            { label: e.target.value },
                                          )
                                        }
                                      />
                                      <Input
                                        placeholder="e.g. Rs 25,000"
                                        value={row.amount || ""}
                                        onChange={(e) =>
                                          updateFeeDetailListItem(
                                            dIdx,
                                            "deadlines_and_installments",
                                            rIdx,
                                            { amount: e.target.value },
                                          )
                                        }
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          removeFeeDetailListItem(
                                            dIdx,
                                            "deadlines_and_installments",
                                            rIdx,
                                          )
                                        }
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addFeeDetail}
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add Fee Detail
                            (Quota + Gender)
                          </Button>

                          {(
                            [
                              {
                                field: "whats_included" as const,
                                label: "What's Included",
                                placeholder: "e.g. Tuition Fees",
                              },
                              {
                                field: "whats_excluded" as const,
                                label: "What's Excluded",
                                placeholder: "e.g. Uniform Dress",
                              },
                              {
                                field: "refund_policy" as const,
                                label: "Refund Policy",
                                placeholder:
                                  "e.g. Booking amount refundable within limited time",
                              },
                            ] as const
                          ).map(({ field, label, placeholder }) => (
                            <div
                              key={field}
                              className="space-y-2 pt-4 border-t"
                            >
                              <div className="flex items-center justify-between">
                                <Label className="font-bold">{label}</Label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    updateFeeStringList(field, [
                                      ...(getActiveTabPayload()[field] || []),
                                      "",
                                    ])
                                  }
                                >
                                  <Plus className="h-4 w-4 mr-1" /> Add
                                </Button>
                              </div>
                              {(getActiveTabPayload()[field] || []).map(
                                (item: string, idx: number) => (
                                  <div
                                    key={idx}
                                    className="flex gap-2 items-center"
                                  >
                                    <Input
                                      placeholder={placeholder}
                                      value={item}
                                      onChange={(e) => {
                                        const next = [
                                          ...(getActiveTabPayload()[field] ||
                                            []),
                                        ];
                                        next[idx] = e.target.value;
                                        updateFeeStringList(field, next);
                                      }}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        const next = (
                                          getActiveTabPayload()[field] || []
                                        ).filter(
                                          (_: string, i: number) => i !== idx,
                                        );
                                        updateFeeStringList(field, next);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                ),
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* FINANCIAL AID */}
                      {activeTab === "financial_aid" && (
                        <div className="space-y-6">
                          <div className="space-y-4 rounded-md border p-4">
                            <Label className="font-bold">
                              Merit Scholarship
                            </Label>
                            <div className="space-y-1">
                              <Label>Title</Label>
                              <Input
                                placeholder="Merit Scholarship"
                                value={getMeritScholarship().title || ""}
                                onChange={(e) =>
                                  updateMeritScholarship({
                                    title: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 pt-2 border-t">
                              <div className="space-y-1">
                                <Label>Max Scholarship</Label>
                                <Input
                                  placeholder="e.g. Rs1,50,000"
                                  value={
                                    getMeritScholarship().final_summary
                                      ?.max_scholarship || ""
                                  }
                                  onChange={(e) =>
                                    updateMeritFinalSummary({
                                      max_scholarship: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="space-y-1">
                                <Label>Net Payable Fees</Label>
                                <Input
                                  placeholder="e.g. Rs2,45,000"
                                  value={
                                    getMeritScholarship().final_summary
                                      ?.net_payable_fees || ""
                                  }
                                  onChange={(e) =>
                                    updateMeritFinalSummary({
                                      net_payable_fees: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>

                            {(
                              [
                                {
                                  path: "port_of_entry_options" as const,
                                  label: "Port of Entry Options",
                                  placeholder: "e.g. JEE Main",
                                  scope: "calculator" as const,
                                },
                                {
                                  path: "rank_range_options" as const,
                                  label: "Rank Range Options",
                                  placeholder: "e.g. 1 - 1000",
                                  scope: "calculator" as const,
                                },
                                {
                                  path: "terms_and_conditions" as const,
                                  label: "Terms & Conditions",
                                  placeholder:
                                    "e.g. Offered on first-come, first-serve basis",
                                  scope: "root" as const,
                                },
                              ] as const
                            ).map(({ path, label, placeholder, scope }) => {
                              const list: string[] =
                                (scope === "calculator"
                                  ? getMeritScholarship().calculator?.[path]
                                  : getMeritScholarship()[path]) || [];
                              const setList = (next: string[]) =>
                                scope === "calculator"
                                  ? updateMeritCalculator({ [path]: next })
                                  : updateMeritScholarship({ [path]: next });

                              return (
                                <div
                                  key={path}
                                  className="space-y-2 pt-2 border-t"
                                >
                                  <div className="flex items-center justify-between">
                                    <Label className="font-bold">{label}</Label>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setList([...list, ""])}
                                    >
                                      <Plus className="h-4 w-4 mr-1" /> Add
                                    </Button>
                                  </div>
                                  {list.map((item, idx) => (
                                    <div
                                      key={idx}
                                      className="flex gap-2 items-center"
                                    >
                                      <Input
                                        placeholder={placeholder}
                                        value={item}
                                        onChange={(e) => {
                                          const next = [...list];
                                          next[idx] = e.target.value;
                                          setList(next);
                                        }}
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          setList(
                                            list.filter((_, i) => i !== idx),
                                          )
                                        }
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              );
                            })}
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label className="font-bold">
                                Financial Concessions
                              </Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addConcessionItem}
                              >
                                <Plus className="h-4 w-4 mr-1" /> Add Concession
                              </Button>
                            </div>

                            {getConcessionItems().map((item, idx) => (
                              <div
                                key={idx}
                                className="space-y-3 rounded-md border p-4"
                              >
                                <div className="flex items-center justify-between">
                                  <Label className="font-bold">
                                    Concession #{idx + 1}
                                  </Label>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeConcessionItem(idx)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                  <div className="space-y-1">
                                    <Label>Name</Label>
                                    <Input
                                      placeholder="e.g. Alumni"
                                      value={item.name || ""}
                                      onChange={(e) =>
                                        updateConcessionItem(idx, {
                                          name: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label>Discount Percent</Label>
                                    <Input
                                      type="number"
                                      placeholder="e.g. 15"
                                      value={item.discount_percent ?? ""}
                                      onChange={(e) =>
                                        updateConcessionItem(idx, {
                                          discount_percent: Number(
                                            e.target.value,
                                          ),
                                        })
                                      }
                                    />
                                  </div>
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                  <div className="space-y-1">
                                    <Label>Scholarship Amount</Label>
                                    <Input
                                      placeholder="e.g. Rs75,000"
                                      value={
                                        item.details?.scholarship_amount || ""
                                      }
                                      onChange={(e) =>
                                        updateConcessionDetails(idx, {
                                          scholarship_amount: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label>Net Payable</Label>
                                    <Input
                                      placeholder="e.g. Rs3,20,000"
                                      value={item.details?.net_payable || ""}
                                      onChange={(e) =>
                                        updateConcessionDetails(idx, {
                                          net_payable: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                </div>

                                <div className="space-y-2 pt-2 border-t">
                                  <div className="flex items-center justify-between">
                                    <Label className="font-bold">
                                      Eligibility Criteria
                                    </Label>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        updateConcessionDetails(idx, {
                                          eligibility_criteria: [
                                            ...(item.details
                                              ?.eligibility_criteria || []),
                                            "",
                                          ],
                                        })
                                      }
                                    >
                                      <Plus className="h-4 w-4 mr-1" /> Add
                                    </Button>
                                  </div>
                                  {(
                                    item.details?.eligibility_criteria || []
                                  ).map((criterion: string, cIdx: number) => (
                                    <div
                                      key={cIdx}
                                      className="flex gap-2 items-center"
                                    >
                                      <Input
                                        placeholder="e.g. Must have completed a full-time degree program."
                                        value={criterion}
                                        onChange={(e) => {
                                          const next = [
                                            ...(item.details
                                              ?.eligibility_criteria || []),
                                          ];
                                          next[cIdx] = e.target.value;
                                          updateConcessionDetails(idx, {
                                            eligibility_criteria: next,
                                          });
                                        }}
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          const next = (
                                            item.details
                                              ?.eligibility_criteria || []
                                          ).filter(
                                            (_: string, i: number) =>
                                              i !== cIdx,
                                          );
                                          updateConcessionDetails(idx, {
                                            eligibility_criteria: next,
                                          });
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
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
                          {/* Sub-tab nav */}
                          <div className="flex border-b overflow-x-auto scrollbar-none gap-2 pb-2">
                            {[
                              { id: "patterns", label: "Evaluation Patterns" },
                              { id: "grading", label: "Grading Scale" },
                              {
                                id: "guidelines",
                                label: "Academic Guidelines",
                              },
                              {
                                id: "special",
                                label: "Projects / OJT / Internship",
                              },
                            ].map((st) => (
                              <button
                                key={st.id}
                                type="button"
                                onClick={() => setExamPolicySubTab(st.id)}
                                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 border ${
                                  examPolicySubTab === st.id
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                    : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                              >
                                {st.label}
                              </button>
                            ))}
                          </div>

                          {/* EVALUATION PATTERNS */}
                          {examPolicySubTab === "patterns" && (
                            <div className="space-y-6">
                              <div className="flex justify-between items-center">
                                <Label className="font-bold">
                                  Evaluation Patterns
                                </Label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const next = [
                                      ...(getActiveTabPayload()
                                        .evaluation_patterns || []),
                                      {
                                        pattern_type: "",
                                        duration: "",
                                        chart: { total: 100, segments: [] },
                                        subtotals: [],
                                        internal_assessment: [],
                                        external_examination: [],
                                        summary_cards: [],
                                        exam_duration: {
                                          label: "EXAM DURATION",
                                          value: "",
                                        },
                                      },
                                    ];
                                    updateActiveTabPayload({
                                      evaluation_patterns: next,
                                    });
                                    setExamPolicyPatternIdx(next.length - 1);
                                  }}
                                >
                                  <Plus className="h-4 w-4 mr-1" /> Add Pattern
                                </Button>
                              </div>

                              {(getActiveTabPayload().evaluation_patterns || [])
                                .length > 0 && (
                                <div className="flex gap-2 flex-wrap">
                                  {(
                                    getActiveTabPayload().evaluation_patterns ||
                                    []
                                  ).map((p: any, idx: number) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() =>
                                        setExamPolicyPatternIdx(idx)
                                      }
                                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                        examPolicyPatternIdx === idx
                                          ? "bg-indigo-600 text-white border-indigo-600"
                                          : "border-border text-muted-foreground hover:bg-muted"
                                      }`}
                                    >
                                      {p.pattern_type || `Pattern ${idx + 1}`}
                                    </button>
                                  ))}
                                </div>
                              )}

                              {(() => {
                                const patterns =
                                  getActiveTabPayload().evaluation_patterns ||
                                  [];
                                const pi = examPolicyPatternIdx;
                                if (pi >= patterns.length) return null;
                                const pat = patterns[pi] || {};
                                const updatePattern = (updates: any) => {
                                  const next = [...patterns];
                                  next[pi] = { ...next[pi], ...updates };
                                  updateActiveTabPayload({
                                    evaluation_patterns: next,
                                  });
                                };
                                return (
                                  <div className="space-y-6 border p-4 rounded-xl bg-muted/5">
                                    {/* Pattern header */}
                                    <div className="flex gap-4 items-start">
                                      <div className="flex-1 grid gap-4 md:grid-cols-2">
                                        <div className="space-y-1">
                                          <Label className="text-xs">
                                            Pattern Type
                                          </Label>
                                          <Input
                                            placeholder="e.g. Course with Practical"
                                            value={pat.pattern_type || ""}
                                            onChange={(e) =>
                                              updatePattern({
                                                pattern_type: e.target.value,
                                              })
                                            }
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label className="text-xs">
                                            Duration
                                          </Label>
                                          <Input
                                            placeholder="e.g. 2 + 3 Hrs"
                                            value={pat.duration || ""}
                                            onChange={(e) =>
                                              updatePattern({
                                                duration: e.target.value,
                                              })
                                            }
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label className="text-xs">
                                            Exam Duration Label
                                          </Label>
                                          <Input
                                            placeholder="e.g. DURATION"
                                            value={
                                              pat.exam_duration?.label || ""
                                            }
                                            onChange={(e) =>
                                              updatePattern({
                                                exam_duration: {
                                                  ...(pat.exam_duration || {}),
                                                  label: e.target.value,
                                                },
                                              })
                                            }
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label className="text-xs">
                                            Exam Duration Value
                                          </Label>
                                          <Input
                                            placeholder="e.g. 2 + 3 Hrs"
                                            value={
                                              pat.exam_duration?.value || ""
                                            }
                                            onChange={(e) =>
                                              updatePattern({
                                                exam_duration: {
                                                  ...(pat.exam_duration || {}),
                                                  value: e.target.value,
                                                },
                                              })
                                            }
                                          />
                                        </div>
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          const next = patterns.filter(
                                            (_: any, i: number) => i !== pi,
                                          );
                                          updateActiveTabPayload({
                                            evaluation_patterns: next,
                                          });
                                          setExamPolicyPatternIdx(
                                            Math.max(0, pi - 1),
                                          );
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>

                                    {/* Chart Segments */}
                                    <div className="border-t pt-4 space-y-3">
                                      <div className="flex justify-between items-center">
                                        <Label className="font-bold text-sm">
                                          Chart Segments
                                        </Label>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            const segs = [
                                              ...(pat.chart?.segments || []),
                                              {
                                                label: "",
                                                percent: 0,
                                                color: "#FF6B00",
                                              },
                                            ];
                                            updatePattern({
                                              chart: {
                                                ...(pat.chart || {
                                                  total: 100,
                                                }),
                                                segments: segs,
                                              },
                                            });
                                          }}
                                        >
                                          <Plus className="h-3 w-3 mr-1" /> Add
                                          Segment
                                        </Button>
                                      </div>
                                      {(pat.chart?.segments || []).map(
                                        (seg: any, si: number) => (
                                          <div
                                            key={si}
                                            className="flex gap-2 items-center"
                                          >
                                            <Input
                                              placeholder="Label (e.g. Theory)"
                                              value={seg.label || ""}
                                              onChange={(e) => {
                                                const segs = [
                                                  ...(pat.chart?.segments ||
                                                    []),
                                                ];
                                                segs[si] = {
                                                  ...segs[si],
                                                  label: e.target.value,
                                                };
                                                updatePattern({
                                                  chart: {
                                                    ...(pat.chart || {
                                                      total: 100,
                                                    }),
                                                    segments: segs,
                                                  },
                                                });
                                              }}
                                            />
                                            <Input
                                              type="number"
                                              placeholder="%"
                                              className="w-20"
                                              value={seg.percent ?? ""}
                                              onChange={(e) => {
                                                const segs = [
                                                  ...(pat.chart?.segments ||
                                                    []),
                                                ];
                                                segs[si] = {
                                                  ...segs[si],
                                                  percent: Number(
                                                    e.target.value,
                                                  ),
                                                };
                                                updatePattern({
                                                  chart: {
                                                    ...(pat.chart || {
                                                      total: 100,
                                                    }),
                                                    segments: segs,
                                                  },
                                                });
                                              }}
                                            />
                                            <Input
                                              placeholder="#color"
                                              className="w-32"
                                              value={seg.color || ""}
                                              onChange={(e) => {
                                                const segs = [
                                                  ...(pat.chart?.segments ||
                                                    []),
                                                ];
                                                segs[si] = {
                                                  ...segs[si],
                                                  color: e.target.value,
                                                };
                                                updatePattern({
                                                  chart: {
                                                    ...(pat.chart || {
                                                      total: 100,
                                                    }),
                                                    segments: segs,
                                                  },
                                                });
                                              }}
                                            />
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="icon"
                                              onClick={() => {
                                                const segs = (
                                                  pat.chart?.segments || []
                                                ).filter(
                                                  (_: any, i: number) =>
                                                    i !== si,
                                                );
                                                updatePattern({
                                                  chart: {
                                                    ...(pat.chart || {
                                                      total: 100,
                                                    }),
                                                    segments: segs,
                                                  },
                                                });
                                              }}
                                            >
                                              <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                          </div>
                                        ),
                                      )}
                                    </div>

                                    {/* Subtotals */}
                                    <div className="border-t pt-4 space-y-3">
                                      <div className="flex justify-between items-center">
                                        <Label className="font-bold text-sm">
                                          Subtotals
                                        </Label>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            updatePattern({
                                              subtotals: [
                                                ...(pat.subtotals || []),
                                                { label: "", marks: 0 },
                                              ],
                                            })
                                          }
                                        >
                                          <Plus className="h-3 w-3 mr-1" /> Add
                                          Subtotal
                                        </Button>
                                      </div>
                                      {(pat.subtotals || []).map(
                                        (st: any, si: number) => (
                                          <div
                                            key={si}
                                            className="flex gap-2 items-center"
                                          >
                                            <Input
                                              placeholder="Label (e.g. ISA Theory)"
                                              value={st.label || ""}
                                              onChange={(e) => {
                                                const next = [
                                                  ...(pat.subtotals || []),
                                                ];
                                                next[si] = {
                                                  ...next[si],
                                                  label: e.target.value,
                                                };
                                                updatePattern({
                                                  subtotals: next,
                                                });
                                              }}
                                            />
                                            <Input
                                              type="number"
                                              placeholder="Marks"
                                              className="w-24"
                                              value={st.marks ?? ""}
                                              onChange={(e) => {
                                                const next = [
                                                  ...(pat.subtotals || []),
                                                ];
                                                next[si] = {
                                                  ...next[si],
                                                  marks: Number(e.target.value),
                                                };
                                                updatePattern({
                                                  subtotals: next,
                                                });
                                              }}
                                            />
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="icon"
                                              onClick={() =>
                                                updatePattern({
                                                  subtotals: (
                                                    pat.subtotals || []
                                                  ).filter(
                                                    (_: any, i: number) =>
                                                      i !== si,
                                                  ),
                                                })
                                              }
                                            >
                                              <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                          </div>
                                        ),
                                      )}
                                    </div>

                                    {/* Summary Cards */}
                                    <div className="border-t pt-4 space-y-3">
                                      <div className="flex justify-between items-center">
                                        <Label className="font-bold text-sm">
                                          Summary Cards
                                        </Label>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            updatePattern({
                                              summary_cards: [
                                                ...(pat.summary_cards || []),
                                                { label: "", value: "" },
                                              ],
                                            })
                                          }
                                        >
                                          <Plus className="h-3 w-3 mr-1" /> Add
                                          Card
                                        </Button>
                                      </div>
                                      {(pat.summary_cards || []).map(
                                        (sc: any, si: number) => (
                                          <div
                                            key={si}
                                            className="flex gap-2 items-center"
                                          >
                                            <Input
                                              placeholder="Label (e.g. ISA THEORY)"
                                              value={sc.label || ""}
                                              onChange={(e) => {
                                                const next = [
                                                  ...(pat.summary_cards || []),
                                                ];
                                                next[si] = {
                                                  ...next[si],
                                                  label: e.target.value,
                                                };
                                                updatePattern({
                                                  summary_cards: next,
                                                });
                                              }}
                                            />
                                            <Input
                                              placeholder="Value (e.g. 20 Marks)"
                                              value={sc.value || ""}
                                              onChange={(e) => {
                                                const next = [
                                                  ...(pat.summary_cards || []),
                                                ];
                                                next[si] = {
                                                  ...next[si],
                                                  value: e.target.value,
                                                };
                                                updatePattern({
                                                  summary_cards: next,
                                                });
                                              }}
                                            />
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="icon"
                                              onClick={() =>
                                                updatePattern({
                                                  summary_cards: (
                                                    pat.summary_cards || []
                                                  ).filter(
                                                    (_: any, i: number) =>
                                                      i !== si,
                                                  ),
                                                })
                                              }
                                            >
                                              <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                          </div>
                                        ),
                                      )}
                                    </div>

                                    {/* Internal Assessment Sections */}
                                    <div className="border-t pt-4 space-y-4">
                                      <div className="flex justify-between items-center">
                                        <Label className="font-bold text-sm">
                                          Internal Assessment (ISA) Sections
                                        </Label>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            updatePattern({
                                              internal_assessment: [
                                                ...(pat.internal_assessment ||
                                                  []),
                                                { section: "", components: [] },
                                              ],
                                            })
                                          }
                                        >
                                          <Plus className="h-3 w-3 mr-1" /> Add
                                          Section
                                        </Button>
                                      </div>
                                      {(pat.internal_assessment || []).map(
                                        (ias: any, si: number) => (
                                          <div
                                            key={si}
                                            className="border p-3 rounded-lg space-y-3 bg-muted/10"
                                          >
                                            <div className="flex gap-2 items-center">
                                              <Input
                                                placeholder="Section name (e.g. ISA - Theory)"
                                                value={ias.section || ""}
                                                onChange={(e) => {
                                                  const next = [
                                                    ...(pat.internal_assessment ||
                                                      []),
                                                  ];
                                                  next[si] = {
                                                    ...next[si],
                                                    section: e.target.value,
                                                  };
                                                  updatePattern({
                                                    internal_assessment: next,
                                                  });
                                                }}
                                              />
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                  updatePattern({
                                                    internal_assessment: (
                                                      pat.internal_assessment ||
                                                      []
                                                    ).filter(
                                                      (_: any, i: number) =>
                                                        i !== si,
                                                    ),
                                                  })
                                                }
                                              >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                              </Button>
                                            </div>
                                            <div className="pl-3 space-y-2">
                                              <div className="flex justify-between items-center">
                                                <Label className="text-xs text-muted-foreground">
                                                  Components
                                                </Label>
                                                <Button
                                                  type="button"
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => {
                                                    const sections = [
                                                      ...(pat.internal_assessment ||
                                                        []),
                                                    ];
                                                    sections[si] = {
                                                      ...sections[si],
                                                      components: [
                                                        ...(sections[si]
                                                          .components || []),
                                                        {
                                                          name: "",
                                                          marks: 0,
                                                          description: "",
                                                          icon: "",
                                                          sub_components: [],
                                                        },
                                                      ],
                                                    };
                                                    updatePattern({
                                                      internal_assessment:
                                                        sections,
                                                    });
                                                  }}
                                                >
                                                  <Plus className="h-3 w-3 mr-1" />{" "}
                                                  Add Component
                                                </Button>
                                              </div>
                                              {(ias.components || []).map(
                                                (comp: any, ci: number) => (
                                                  <div
                                                    key={ci}
                                                    className="border p-3 rounded-lg space-y-2 bg-white/50"
                                                  >
                                                    <div className="flex gap-2 items-center">
                                                      <Input
                                                        placeholder="Name (e.g. Test Papers)"
                                                        value={comp.name || ""}
                                                        onChange={(e) => {
                                                          const sections = [
                                                            ...(pat.internal_assessment ||
                                                              []),
                                                          ];
                                                          const comps = [
                                                            ...(sections[si]
                                                              .components ||
                                                              []),
                                                          ];
                                                          comps[ci] = {
                                                            ...comps[ci],
                                                            name: e.target
                                                              .value,
                                                          };
                                                          sections[si] = {
                                                            ...sections[si],
                                                            components: comps,
                                                          };
                                                          updatePattern({
                                                            internal_assessment:
                                                              sections,
                                                          });
                                                        }}
                                                      />
                                                      <Input
                                                        type="number"
                                                        placeholder="Marks"
                                                        className="w-20"
                                                        value={comp.marks ?? ""}
                                                        onChange={(e) => {
                                                          const sections = [
                                                            ...(pat.internal_assessment ||
                                                              []),
                                                          ];
                                                          const comps = [
                                                            ...(sections[si]
                                                              .components ||
                                                              []),
                                                          ];
                                                          comps[ci] = {
                                                            ...comps[ci],
                                                            marks: Number(
                                                              e.target.value,
                                                            ),
                                                          };
                                                          sections[si] = {
                                                            ...sections[si],
                                                            components: comps,
                                                          };
                                                          updatePattern({
                                                            internal_assessment:
                                                              sections,
                                                          });
                                                        }}
                                                      />
                                                      <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                          const sections = [
                                                            ...(pat.internal_assessment ||
                                                              []),
                                                          ];
                                                          sections[si] = {
                                                            ...sections[si],
                                                            components: (
                                                              sections[si]
                                                                .components ||
                                                              []
                                                            ).filter(
                                                              (
                                                                _: any,
                                                                i: number,
                                                              ) => i !== ci,
                                                            ),
                                                          };
                                                          updatePattern({
                                                            internal_assessment:
                                                              sections,
                                                          });
                                                        }}
                                                      >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                      </Button>
                                                    </div>
                                                    <Input
                                                      placeholder="Description (optional)"
                                                      value={
                                                        comp.description || ""
                                                      }
                                                      onChange={(e) => {
                                                        const sections = [
                                                          ...(pat.internal_assessment ||
                                                            []),
                                                        ];
                                                        const comps = [
                                                          ...(sections[si]
                                                            .components || []),
                                                        ];
                                                        comps[ci] = {
                                                          ...comps[ci],
                                                          description:
                                                            e.target.value,
                                                        };
                                                        sections[si] = {
                                                          ...sections[si],
                                                          components: comps,
                                                        };
                                                        updatePattern({
                                                          internal_assessment:
                                                            sections,
                                                        });
                                                      }}
                                                    />
                                                    {/* Sub-components */}
                                                    <div className="pl-3 space-y-1">
                                                      <div className="flex justify-between items-center">
                                                        <span className="text-xs text-muted-foreground">
                                                          Sub-components
                                                        </span>
                                                        <Button
                                                          type="button"
                                                          variant="ghost"
                                                          size="sm"
                                                          className="h-6 text-xs"
                                                          onClick={() => {
                                                            const sections = [
                                                              ...(pat.internal_assessment ||
                                                                []),
                                                            ];
                                                            const comps = [
                                                              ...(sections[si]
                                                                .components ||
                                                                []),
                                                            ];
                                                            comps[ci] = {
                                                              ...comps[ci],
                                                              sub_components: [
                                                                ...(comps[ci]
                                                                  .sub_components ||
                                                                  []),
                                                                {
                                                                  name: "",
                                                                  marks: 0,
                                                                },
                                                              ],
                                                            };
                                                            sections[si] = {
                                                              ...sections[si],
                                                              components: comps,
                                                            };
                                                            updatePattern({
                                                              internal_assessment:
                                                                sections,
                                                            });
                                                          }}
                                                        >
                                                          <Plus className="h-3 w-3 mr-1" />{" "}
                                                          Add
                                                        </Button>
                                                      </div>
                                                      {(
                                                        comp.sub_components ||
                                                        []
                                                      ).map(
                                                        (
                                                          sc: any,
                                                          sci: number,
                                                        ) => (
                                                          <div
                                                            key={sci}
                                                            className="flex gap-2 items-center"
                                                          >
                                                            <Input
                                                              placeholder="Sub-component name"
                                                              className="h-7 text-xs"
                                                              value={
                                                                sc.name || ""
                                                              }
                                                              onChange={(e) => {
                                                                const sections =
                                                                  [
                                                                    ...(pat.internal_assessment ||
                                                                      []),
                                                                  ];
                                                                const comps = [
                                                                  ...(sections[
                                                                    si
                                                                  ]
                                                                    .components ||
                                                                    []),
                                                                ];
                                                                const subs = [
                                                                  ...(comps[ci]
                                                                    .sub_components ||
                                                                    []),
                                                                ];
                                                                subs[sci] = {
                                                                  ...subs[sci],
                                                                  name: e.target
                                                                    .value,
                                                                };
                                                                comps[ci] = {
                                                                  ...comps[ci],
                                                                  sub_components:
                                                                    subs,
                                                                };
                                                                sections[si] = {
                                                                  ...sections[
                                                                    si
                                                                  ],
                                                                  components:
                                                                    comps,
                                                                };
                                                                updatePattern({
                                                                  internal_assessment:
                                                                    sections,
                                                                });
                                                              }}
                                                            />
                                                            <Input
                                                              type="number"
                                                              placeholder="Marks"
                                                              className="w-16 h-7 text-xs"
                                                              value={
                                                                sc.marks ?? ""
                                                              }
                                                              onChange={(e) => {
                                                                const sections =
                                                                  [
                                                                    ...(pat.internal_assessment ||
                                                                      []),
                                                                  ];
                                                                const comps = [
                                                                  ...(sections[
                                                                    si
                                                                  ]
                                                                    .components ||
                                                                    []),
                                                                ];
                                                                const subs = [
                                                                  ...(comps[ci]
                                                                    .sub_components ||
                                                                    []),
                                                                ];
                                                                subs[sci] = {
                                                                  ...subs[sci],
                                                                  marks: Number(
                                                                    e.target
                                                                      .value,
                                                                  ),
                                                                };
                                                                comps[ci] = {
                                                                  ...comps[ci],
                                                                  sub_components:
                                                                    subs,
                                                                };
                                                                sections[si] = {
                                                                  ...sections[
                                                                    si
                                                                  ],
                                                                  components:
                                                                    comps,
                                                                };
                                                                updatePattern({
                                                                  internal_assessment:
                                                                    sections,
                                                                });
                                                              }}
                                                            />
                                                            <Button
                                                              type="button"
                                                              variant="ghost"
                                                              size="icon"
                                                              className="h-7 w-7"
                                                              onClick={() => {
                                                                const sections =
                                                                  [
                                                                    ...(pat.internal_assessment ||
                                                                      []),
                                                                  ];
                                                                const comps = [
                                                                  ...(sections[
                                                                    si
                                                                  ]
                                                                    .components ||
                                                                    []),
                                                                ];
                                                                comps[ci] = {
                                                                  ...comps[ci],
                                                                  sub_components:
                                                                    (
                                                                      comps[ci]
                                                                        .sub_components ||
                                                                      []
                                                                    ).filter(
                                                                      (
                                                                        _: any,
                                                                        i: number,
                                                                      ) =>
                                                                        i !==
                                                                        sci,
                                                                    ),
                                                                };
                                                                sections[si] = {
                                                                  ...sections[
                                                                    si
                                                                  ],
                                                                  components:
                                                                    comps,
                                                                };
                                                                updatePattern({
                                                                  internal_assessment:
                                                                    sections,
                                                                });
                                                              }}
                                                            >
                                                              <X className="h-3 w-3 text-destructive" />
                                                            </Button>
                                                          </div>
                                                        ),
                                                      )}
                                                    </div>
                                                  </div>
                                                ),
                                              )}
                                            </div>
                                          </div>
                                        ),
                                      )}
                                    </div>

                                    {/* External Examination Sections */}
                                    <div className="border-t pt-4 space-y-4">
                                      <div className="flex justify-between items-center">
                                        <Label className="font-bold text-sm">
                                          External Examination (ESA) Sections
                                        </Label>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            updatePattern({
                                              external_examination: [
                                                ...(pat.external_examination ||
                                                  []),
                                                {
                                                  section: "",
                                                  columns: [
                                                    "Section",
                                                    "Total Q",
                                                    "Attempt",
                                                    "Marks",
                                                  ],
                                                  rows: [],
                                                },
                                              ],
                                            })
                                          }
                                        >
                                          <Plus className="h-3 w-3 mr-1" /> Add
                                          Section
                                        </Button>
                                      </div>
                                      {(pat.external_examination || []).map(
                                        (ext: any, ei: number) => (
                                          <div
                                            key={ei}
                                            className="border p-3 rounded-lg space-y-3 bg-muted/10"
                                          >
                                            <div className="flex gap-2 items-center">
                                              <Input
                                                placeholder="Section name (e.g. ESA - Theory)"
                                                value={ext.section || ""}
                                                onChange={(e) => {
                                                  const next = [
                                                    ...(pat.external_examination ||
                                                      []),
                                                  ];
                                                  next[ei] = {
                                                    ...next[ei],
                                                    section: e.target.value,
                                                  };
                                                  updatePattern({
                                                    external_examination: next,
                                                  });
                                                }}
                                              />
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                  updatePattern({
                                                    external_examination: (
                                                      pat.external_examination ||
                                                      []
                                                    ).filter(
                                                      (_: any, i: number) =>
                                                        i !== ei,
                                                    ),
                                                  })
                                                }
                                              >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                              </Button>
                                            </div>
                                            <Input
                                              placeholder="Columns (comma-separated, e.g. Section, Total Q, Attempt, Marks)"
                                              value={(ext.columns || []).join(
                                                ", ",
                                              )}
                                              onChange={(e) => {
                                                const next = [
                                                  ...(pat.external_examination ||
                                                    []),
                                                ];
                                                next[ei] = {
                                                  ...next[ei],
                                                  columns: e.target.value
                                                    .split(",")
                                                    .map((s: string) =>
                                                      s.trim(),
                                                    )
                                                    .filter(Boolean),
                                                };
                                                updatePattern({
                                                  external_examination: next,
                                                });
                                              }}
                                            />
                                            <div className="pl-2 space-y-2">
                                              <div className="flex justify-between items-center">
                                                <Label className="text-xs text-muted-foreground">
                                                  Rows
                                                </Label>
                                                <Button
                                                  type="button"
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => {
                                                    const next = [
                                                      ...(pat.external_examination ||
                                                        []),
                                                    ];
                                                    next[ei] = {
                                                      ...next[ei],
                                                      rows: [
                                                        ...(next[ei].rows ||
                                                          []),
                                                        {
                                                          section: "",
                                                          subtitle: "",
                                                          total_questions: 0,
                                                          attempt: 0,
                                                          marks: 0,
                                                        },
                                                      ],
                                                    };
                                                    updatePattern({
                                                      external_examination:
                                                        next,
                                                    });
                                                  }}
                                                >
                                                  <Plus className="h-3 w-3 mr-1" />{" "}
                                                  Add Row
                                                </Button>
                                              </div>
                                              {(ext.rows || []).map(
                                                (row: any, ri: number) => (
                                                  <div
                                                    key={ri}
                                                    className="flex gap-2 items-center flex-wrap"
                                                  >
                                                    <Input
                                                      placeholder="Section (e.g. Section A)"
                                                      className="flex-1 min-w-[120px]"
                                                      value={row.section || ""}
                                                      onChange={(e) => {
                                                        const next = [
                                                          ...(pat.external_examination ||
                                                            []),
                                                        ];
                                                        const rows = [
                                                          ...(next[ei].rows ||
                                                            []),
                                                        ];
                                                        rows[ri] = {
                                                          ...rows[ri],
                                                          section:
                                                            e.target.value,
                                                        };
                                                        next[ei] = {
                                                          ...next[ei],
                                                          rows,
                                                        };
                                                        updatePattern({
                                                          external_examination:
                                                            next,
                                                        });
                                                      }}
                                                    />
                                                    <Input
                                                      placeholder="Subtitle"
                                                      className="flex-1 min-w-[100px]"
                                                      value={row.subtitle || ""}
                                                      onChange={(e) => {
                                                        const next = [
                                                          ...(pat.external_examination ||
                                                            []),
                                                        ];
                                                        const rows = [
                                                          ...(next[ei].rows ||
                                                            []),
                                                        ];
                                                        rows[ri] = {
                                                          ...rows[ri],
                                                          subtitle:
                                                            e.target.value,
                                                        };
                                                        next[ei] = {
                                                          ...next[ei],
                                                          rows,
                                                        };
                                                        updatePattern({
                                                          external_examination:
                                                            next,
                                                        });
                                                      }}
                                                    />
                                                    <Input
                                                      type="number"
                                                      placeholder="Total Q"
                                                      className="w-20"
                                                      value={
                                                        row.total_questions ??
                                                        ""
                                                      }
                                                      onChange={(e) => {
                                                        const next = [
                                                          ...(pat.external_examination ||
                                                            []),
                                                        ];
                                                        const rows = [
                                                          ...(next[ei].rows ||
                                                            []),
                                                        ];
                                                        rows[ri] = {
                                                          ...rows[ri],
                                                          total_questions:
                                                            Number(
                                                              e.target.value,
                                                            ),
                                                        };
                                                        next[ei] = {
                                                          ...next[ei],
                                                          rows,
                                                        };
                                                        updatePattern({
                                                          external_examination:
                                                            next,
                                                        });
                                                      }}
                                                    />
                                                    <Input
                                                      type="number"
                                                      placeholder="Attempt"
                                                      className="w-20"
                                                      value={row.attempt ?? ""}
                                                      onChange={(e) => {
                                                        const next = [
                                                          ...(pat.external_examination ||
                                                            []),
                                                        ];
                                                        const rows = [
                                                          ...(next[ei].rows ||
                                                            []),
                                                        ];
                                                        rows[ri] = {
                                                          ...rows[ri],
                                                          attempt: Number(
                                                            e.target.value,
                                                          ),
                                                        };
                                                        next[ei] = {
                                                          ...next[ei],
                                                          rows,
                                                        };
                                                        updatePattern({
                                                          external_examination:
                                                            next,
                                                        });
                                                      }}
                                                    />
                                                    <Input
                                                      type="number"
                                                      placeholder="Marks"
                                                      className="w-20"
                                                      value={row.marks ?? ""}
                                                      onChange={(e) => {
                                                        const next = [
                                                          ...(pat.external_examination ||
                                                            []),
                                                        ];
                                                        const rows = [
                                                          ...(next[ei].rows ||
                                                            []),
                                                        ];
                                                        rows[ri] = {
                                                          ...rows[ri],
                                                          marks: Number(
                                                            e.target.value,
                                                          ),
                                                        };
                                                        next[ei] = {
                                                          ...next[ei],
                                                          rows,
                                                        };
                                                        updatePattern({
                                                          external_examination:
                                                            next,
                                                        });
                                                      }}
                                                    />
                                                    <Button
                                                      type="button"
                                                      variant="ghost"
                                                      size="icon"
                                                      onClick={() => {
                                                        const next = [
                                                          ...(pat.external_examination ||
                                                            []),
                                                        ];
                                                        next[ei] = {
                                                          ...next[ei],
                                                          rows: (
                                                            next[ei].rows || []
                                                          ).filter(
                                                            (
                                                              _: any,
                                                              i: number,
                                                            ) => i !== ri,
                                                          ),
                                                        };
                                                        updatePattern({
                                                          external_examination:
                                                            next,
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
                                        ),
                                      )}
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          )}

                          {/* GRADING SCALE */}
                          {examPolicySubTab === "grading" && (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Grading Scale Title</Label>
                                <Input
                                  placeholder="e.g. Grading Scale"
                                  value={
                                    getActiveTabPayload().grading_scale
                                      ?.title || ""
                                  }
                                  onChange={(e) =>
                                    updateActiveTabPayload({
                                      grading_scale: {
                                        ...(getActiveTabPayload()
                                          .grading_scale || {}),
                                        title: e.target.value,
                                      },
                                    })
                                  }
                                />
                              </div>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <Label className="font-bold">
                                    Grade Rows
                                  </Label>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const rows = [
                                        ...(getActiveTabPayload().grading_scale
                                          ?.rows || []),
                                        {
                                          percentage_range: "",
                                          grade: "",
                                          grade_color: "green",
                                          grade_point: 0,
                                        },
                                      ];
                                      updateActiveTabPayload({
                                        grading_scale: {
                                          ...(getActiveTabPayload()
                                            .grading_scale || {}),
                                          rows,
                                        },
                                      });
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-1" /> Add Row
                                  </Button>
                                </div>
                                {(
                                  getActiveTabPayload().grading_scale?.rows ||
                                  []
                                ).map((row: any, ri: number) => (
                                  <div
                                    key={ri}
                                    className="flex gap-2 items-center"
                                  >
                                    <Input
                                      placeholder="Range (e.g. 90% - 100%)"
                                      value={row.percentage_range || ""}
                                      onChange={(e) => {
                                        const rows = [
                                          ...(getActiveTabPayload()
                                            .grading_scale?.rows || []),
                                        ];
                                        rows[ri] = {
                                          ...rows[ri],
                                          percentage_range: e.target.value,
                                        };
                                        updateActiveTabPayload({
                                          grading_scale: {
                                            ...(getActiveTabPayload()
                                              .grading_scale || {}),
                                            rows,
                                          },
                                        });
                                      }}
                                    />
                                    <Input
                                      placeholder="Grade (e.g. O)"
                                      className="w-20"
                                      value={row.grade || ""}
                                      onChange={(e) => {
                                        const rows = [
                                          ...(getActiveTabPayload()
                                            .grading_scale?.rows || []),
                                        ];
                                        rows[ri] = {
                                          ...rows[ri],
                                          grade: e.target.value,
                                        };
                                        updateActiveTabPayload({
                                          grading_scale: {
                                            ...(getActiveTabPayload()
                                              .grading_scale || {}),
                                            rows,
                                          },
                                        });
                                      }}
                                    />
                                    <Select
                                      value={row.grade_color || "green"}
                                      onValueChange={(val) => {
                                        const rows = [
                                          ...(getActiveTabPayload()
                                            .grading_scale?.rows || []),
                                        ];
                                        rows[ri] = {
                                          ...rows[ri],
                                          grade_color: val,
                                        };
                                        updateActiveTabPayload({
                                          grading_scale: {
                                            ...(getActiveTabPayload()
                                              .grading_scale || {}),
                                            rows,
                                          },
                                        });
                                      }}
                                    >
                                      <SelectTrigger className="w-24">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="green">
                                          Green
                                        </SelectItem>
                                        <SelectItem value="blue">
                                          Blue
                                        </SelectItem>
                                        <SelectItem value="orange">
                                          Orange
                                        </SelectItem>
                                        <SelectItem value="red">Red</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Input
                                      type="number"
                                      placeholder="Points"
                                      className="w-20"
                                      step="0.1"
                                      value={row.grade_point ?? ""}
                                      onChange={(e) => {
                                        const rows = [
                                          ...(getActiveTabPayload()
                                            .grading_scale?.rows || []),
                                        ];
                                        rows[ri] = {
                                          ...rows[ri],
                                          grade_point: Number(e.target.value),
                                        };
                                        updateActiveTabPayload({
                                          grading_scale: {
                                            ...(getActiveTabPayload()
                                              .grading_scale || {}),
                                            rows,
                                          },
                                        });
                                      }}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        const rows = (
                                          getActiveTabPayload().grading_scale
                                            ?.rows || []
                                        ).filter(
                                          (_: any, i: number) => i !== ri,
                                        );
                                        updateActiveTabPayload({
                                          grading_scale: {
                                            ...(getActiveTabPayload()
                                              .grading_scale || {}),
                                            rows,
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
                          )}

                          {/* ACADEMIC GUIDELINES BANNER */}
                          {examPolicySubTab === "guidelines" && (
                            <div className="space-y-6">
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-1">
                                  <Label>Banner Tag</Label>
                                  <Input
                                    placeholder="e.g. ACADEMIC POLICIES"
                                    value={
                                      getActiveTabPayload()
                                        .important_guidelines_banner?.tag || ""
                                    }
                                    onChange={(e) =>
                                      updateActiveTabPayload({
                                        important_guidelines_banner: {
                                          ...(getActiveTabPayload()
                                            .important_guidelines_banner || {}),
                                          tag: e.target.value,
                                        },
                                      })
                                    }
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label>Background Style</Label>
                                  <Input
                                    placeholder="e.g. gradient_orange"
                                    value={
                                      getActiveTabPayload()
                                        .important_guidelines_banner
                                        ?.background_style || ""
                                    }
                                    onChange={(e) =>
                                      updateActiveTabPayload({
                                        important_guidelines_banner: {
                                          ...(getActiveTabPayload()
                                            .important_guidelines_banner || {}),
                                          background_style: e.target.value,
                                        },
                                      })
                                    }
                                  />
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                  <Label>Banner Title</Label>
                                  <Input
                                    placeholder="e.g. Important Guidelines"
                                    value={
                                      getActiveTabPayload()
                                        .important_guidelines_banner?.title ||
                                      ""
                                    }
                                    onChange={(e) =>
                                      updateActiveTabPayload({
                                        important_guidelines_banner: {
                                          ...(getActiveTabPayload()
                                            .important_guidelines_banner || {}),
                                          title: e.target.value,
                                        },
                                      })
                                    }
                                  />
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                  <Label>Banner Description</Label>
                                  <Textarea
                                    rows={2}
                                    placeholder="Brief description of the guidelines..."
                                    value={
                                      getActiveTabPayload()
                                        .important_guidelines_banner
                                        ?.description || ""
                                    }
                                    onChange={(e) =>
                                      updateActiveTabPayload({
                                        important_guidelines_banner: {
                                          ...(getActiveTabPayload()
                                            .important_guidelines_banner || {}),
                                          description: e.target.value,
                                        },
                                      })
                                    }
                                  />
                                </div>
                              </div>
                              <div className="space-y-3 pt-4 border-t">
                                <div className="flex justify-between items-center">
                                  <Label className="font-bold">
                                    Academic Policies
                                  </Label>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const policies = [
                                        ...(getActiveTabPayload()
                                          .important_guidelines_banner
                                          ?.academic_policies || []),
                                        {
                                          badge: "",
                                          title: "",
                                          description: "",
                                          read_more_link: "",
                                          icon: "",
                                        },
                                      ];
                                      updateActiveTabPayload({
                                        important_guidelines_banner: {
                                          ...(getActiveTabPayload()
                                            .important_guidelines_banner || {}),
                                          academic_policies: policies,
                                        },
                                      });
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-1" /> Add Policy
                                  </Button>
                                </div>
                                {(
                                  getActiveTabPayload()
                                    .important_guidelines_banner
                                    ?.academic_policies || []
                                ).map((policy: any, pi: number) => (
                                  <div
                                    key={pi}
                                    className="border p-4 rounded-xl space-y-3 bg-muted/5"
                                  >
                                    <div className="flex gap-3 items-start">
                                      <div className="flex-1 grid gap-3 md:grid-cols-2">
                                        <div className="space-y-1">
                                          <Label className="text-xs">
                                            Badge Text
                                          </Label>
                                          <Input
                                            placeholder="e.g. Required: 75%"
                                            value={policy.badge || ""}
                                            onChange={(e) => {
                                              const policies = [
                                                ...(getActiveTabPayload()
                                                  .important_guidelines_banner
                                                  ?.academic_policies || []),
                                              ];
                                              policies[pi] = {
                                                ...policies[pi],
                                                badge: e.target.value,
                                              };
                                              updateActiveTabPayload({
                                                important_guidelines_banner: {
                                                  ...(getActiveTabPayload()
                                                    .important_guidelines_banner ||
                                                    {}),
                                                  academic_policies: policies,
                                                },
                                              });
                                            }}
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label className="text-xs">
                                            Policy Title
                                          </Label>
                                          <Input
                                            placeholder="e.g. Minimum Attendance"
                                            value={policy.title || ""}
                                            onChange={(e) => {
                                              const policies = [
                                                ...(getActiveTabPayload()
                                                  .important_guidelines_banner
                                                  ?.academic_policies || []),
                                              ];
                                              policies[pi] = {
                                                ...policies[pi],
                                                title: e.target.value,
                                              };
                                              updateActiveTabPayload({
                                                important_guidelines_banner: {
                                                  ...(getActiveTabPayload()
                                                    .important_guidelines_banner ||
                                                    {}),
                                                  academic_policies: policies,
                                                },
                                              });
                                            }}
                                          />
                                        </div>
                                        <div className="space-y-1 md:col-span-2">
                                          <Label className="text-xs">
                                            Description
                                          </Label>
                                          <Textarea
                                            rows={2}
                                            placeholder="Policy description..."
                                            value={policy.description || ""}
                                            onChange={(e) => {
                                              const policies = [
                                                ...(getActiveTabPayload()
                                                  .important_guidelines_banner
                                                  ?.academic_policies || []),
                                              ];
                                              policies[pi] = {
                                                ...policies[pi],
                                                description: e.target.value,
                                              };
                                              updateActiveTabPayload({
                                                important_guidelines_banner: {
                                                  ...(getActiveTabPayload()
                                                    .important_guidelines_banner ||
                                                    {}),
                                                  academic_policies: policies,
                                                },
                                              });
                                            }}
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label className="text-xs">
                                            Read More Link (optional)
                                          </Label>
                                          <Input
                                            placeholder="https://..."
                                            value={policy.read_more_link || ""}
                                            onChange={(e) => {
                                              const policies = [
                                                ...(getActiveTabPayload()
                                                  .important_guidelines_banner
                                                  ?.academic_policies || []),
                                              ];
                                              policies[pi] = {
                                                ...policies[pi],
                                                read_more_link: e.target.value,
                                              };
                                              updateActiveTabPayload({
                                                important_guidelines_banner: {
                                                  ...(getActiveTabPayload()
                                                    .important_guidelines_banner ||
                                                    {}),
                                                  academic_policies: policies,
                                                },
                                              });
                                            }}
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label className="text-xs">
                                            Icon URL (optional)
                                          </Label>
                                          <Input
                                            placeholder="https://cdn.example.com/icon.png"
                                            value={policy.icon || ""}
                                            onChange={(e) => {
                                              const policies = [
                                                ...(getActiveTabPayload()
                                                  .important_guidelines_banner
                                                  ?.academic_policies || []),
                                              ];
                                              policies[pi] = {
                                                ...policies[pi],
                                                icon: e.target.value,
                                              };
                                              updateActiveTabPayload({
                                                important_guidelines_banner: {
                                                  ...(getActiveTabPayload()
                                                    .important_guidelines_banner ||
                                                    {}),
                                                  academic_policies: policies,
                                                },
                                              });
                                            }}
                                          />
                                        </div>
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          const policies = (
                                            getActiveTabPayload()
                                              .important_guidelines_banner
                                              ?.academic_policies || []
                                          ).filter(
                                            (_: any, i: number) => i !== pi,
                                          );
                                          updateActiveTabPayload({
                                            important_guidelines_banner: {
                                              ...(getActiveTabPayload()
                                                .important_guidelines_banner ||
                                                {}),
                                              academic_policies: policies,
                                            },
                                          });
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* PROJECTS / OJT / INTERNSHIP */}
                          {examPolicySubTab === "special" && (
                            <div className="space-y-8">
                              {/* Projects & Dissertation */}
                              <div className="border p-4 rounded-xl space-y-4 bg-muted/5">
                                <h4 className="font-bold text-sm">
                                  Projects & Dissertation
                                </h4>
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center">
                                    <Label className="text-xs font-semibold">
                                      Marks Distribution Segments
                                    </Label>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const segs = [
                                          ...(getActiveTabPayload()
                                            .projects_dissertation
                                            ?.marks_distribution_bar
                                            ?.segments || []),
                                          {
                                            label: "",
                                            percent: 0,
                                            color: "#3B82F6",
                                          },
                                        ];
                                        updateActiveTabPayload({
                                          projects_dissertation: {
                                            ...(getActiveTabPayload()
                                              .projects_dissertation || {}),
                                            marks_distribution_bar: {
                                              ...(getActiveTabPayload()
                                                .projects_dissertation
                                                ?.marks_distribution_bar || {}),
                                              segments: segs,
                                            },
                                          },
                                        });
                                      }}
                                    >
                                      <Plus className="h-3 w-3 mr-1" /> Add
                                      Segment
                                    </Button>
                                  </div>
                                  {(
                                    getActiveTabPayload().projects_dissertation
                                      ?.marks_distribution_bar?.segments || []
                                  ).map((seg: any, si: number) => (
                                    <div
                                      key={si}
                                      className="flex gap-2 items-center"
                                    >
                                      <Input
                                        placeholder="Label"
                                        value={seg.label || ""}
                                        onChange={(e) => {
                                          const segs = [
                                            ...(getActiveTabPayload()
                                              .projects_dissertation
                                              ?.marks_distribution_bar
                                              ?.segments || []),
                                          ];
                                          segs[si] = {
                                            ...segs[si],
                                            label: e.target.value,
                                          };
                                          updateActiveTabPayload({
                                            projects_dissertation: {
                                              ...(getActiveTabPayload()
                                                .projects_dissertation || {}),
                                              marks_distribution_bar: {
                                                ...(getActiveTabPayload()
                                                  .projects_dissertation
                                                  ?.marks_distribution_bar ||
                                                  {}),
                                                segments: segs,
                                              },
                                            },
                                          });
                                        }}
                                      />
                                      <Input
                                        type="number"
                                        placeholder="%"
                                        className="w-20"
                                        value={seg.percent ?? ""}
                                        onChange={(e) => {
                                          const segs = [
                                            ...(getActiveTabPayload()
                                              .projects_dissertation
                                              ?.marks_distribution_bar
                                              ?.segments || []),
                                          ];
                                          segs[si] = {
                                            ...segs[si],
                                            percent: Number(e.target.value),
                                          };
                                          updateActiveTabPayload({
                                            projects_dissertation: {
                                              ...(getActiveTabPayload()
                                                .projects_dissertation || {}),
                                              marks_distribution_bar: {
                                                ...(getActiveTabPayload()
                                                  .projects_dissertation
                                                  ?.marks_distribution_bar ||
                                                  {}),
                                                segments: segs,
                                              },
                                            },
                                          });
                                        }}
                                      />
                                      <Input
                                        placeholder="#color"
                                        className="w-28"
                                        value={seg.color || ""}
                                        onChange={(e) => {
                                          const segs = [
                                            ...(getActiveTabPayload()
                                              .projects_dissertation
                                              ?.marks_distribution_bar
                                              ?.segments || []),
                                          ];
                                          segs[si] = {
                                            ...segs[si],
                                            color: e.target.value,
                                          };
                                          updateActiveTabPayload({
                                            projects_dissertation: {
                                              ...(getActiveTabPayload()
                                                .projects_dissertation || {}),
                                              marks_distribution_bar: {
                                                ...(getActiveTabPayload()
                                                  .projects_dissertation
                                                  ?.marks_distribution_bar ||
                                                  {}),
                                                segments: segs,
                                              },
                                            },
                                          });
                                        }}
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          const segs = (
                                            getActiveTabPayload()
                                              .projects_dissertation
                                              ?.marks_distribution_bar
                                              ?.segments || []
                                          ).filter(
                                            (_: any, i: number) => i !== si,
                                          );
                                          updateActiveTabPayload({
                                            projects_dissertation: {
                                              ...(getActiveTabPayload()
                                                .projects_dissertation || {}),
                                              marks_distribution_bar: {
                                                ...(getActiveTabPayload()
                                                  .projects_dissertation
                                                  ?.marks_distribution_bar ||
                                                  {}),
                                                segments: segs,
                                              },
                                            },
                                          });
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                                <div className="border-t pt-3 space-y-2">
                                  <div className="flex justify-between items-center">
                                    <Label className="text-xs font-semibold">
                                      Internal Assessment Components
                                    </Label>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const comps = [
                                          ...(getActiveTabPayload()
                                            .projects_dissertation
                                            ?.internal_assessment?.[0]
                                            ?.components || []),
                                          { name: "", marks: 0 },
                                        ];
                                        updateActiveTabPayload({
                                          projects_dissertation: {
                                            ...(getActiveTabPayload()
                                              .projects_dissertation || {}),
                                            internal_assessment: [
                                              {
                                                section:
                                                  "Components of Internal Evaluation",
                                                components: comps,
                                              },
                                            ],
                                          },
                                        });
                                      }}
                                    >
                                      <Plus className="h-3 w-3 mr-1" /> Add
                                    </Button>
                                  </div>
                                  {(
                                    getActiveTabPayload().projects_dissertation
                                      ?.internal_assessment?.[0]?.components ||
                                    []
                                  ).map((comp: any, ci: number) => (
                                    <div
                                      key={ci}
                                      className="flex gap-2 items-center"
                                    >
                                      <Input
                                        placeholder="Component name"
                                        value={comp.name || ""}
                                        onChange={(e) => {
                                          const comps = [
                                            ...(getActiveTabPayload()
                                              .projects_dissertation
                                              ?.internal_assessment?.[0]
                                              ?.components || []),
                                          ];
                                          comps[ci] = {
                                            ...comps[ci],
                                            name: e.target.value,
                                          };
                                          updateActiveTabPayload({
                                            projects_dissertation: {
                                              ...(getActiveTabPayload()
                                                .projects_dissertation || {}),
                                              internal_assessment: [
                                                {
                                                  section:
                                                    "Components of Internal Evaluation",
                                                  components: comps,
                                                },
                                              ],
                                            },
                                          });
                                        }}
                                      />
                                      <Input
                                        type="number"
                                        placeholder="Marks"
                                        className="w-20"
                                        value={comp.marks ?? ""}
                                        onChange={(e) => {
                                          const comps = [
                                            ...(getActiveTabPayload()
                                              .projects_dissertation
                                              ?.internal_assessment?.[0]
                                              ?.components || []),
                                          ];
                                          comps[ci] = {
                                            ...comps[ci],
                                            marks: Number(e.target.value),
                                          };
                                          updateActiveTabPayload({
                                            projects_dissertation: {
                                              ...(getActiveTabPayload()
                                                .projects_dissertation || {}),
                                              internal_assessment: [
                                                {
                                                  section:
                                                    "Components of Internal Evaluation",
                                                  components: comps,
                                                },
                                              ],
                                            },
                                          });
                                        }}
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          const comps = (
                                            getActiveTabPayload()
                                              .projects_dissertation
                                              ?.internal_assessment?.[0]
                                              ?.components || []
                                          ).filter(
                                            (_: any, i: number) => i !== ci,
                                          );
                                          updateActiveTabPayload({
                                            projects_dissertation: {
                                              ...(getActiveTabPayload()
                                                .projects_dissertation || {}),
                                              internal_assessment: [
                                                {
                                                  section:
                                                    "Components of Internal Evaluation",
                                                  components: comps,
                                                },
                                              ],
                                            },
                                          });
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                                <div className="border-t pt-3 space-y-2">
                                  <div className="flex justify-between items-center">
                                    <Label className="text-xs font-semibold">
                                      External Assessment Components
                                    </Label>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const comps = [
                                          ...(getActiveTabPayload()
                                            .projects_dissertation
                                            ?.external_examination?.[0]
                                            ?.components || []),
                                          { name: "", marks: 0 },
                                        ];
                                        updateActiveTabPayload({
                                          projects_dissertation: {
                                            ...(getActiveTabPayload()
                                              .projects_dissertation || {}),
                                            external_examination: [
                                              {
                                                section:
                                                  "Components of External Assessment",
                                                components: comps,
                                              },
                                            ],
                                          },
                                        });
                                      }}
                                    >
                                      <Plus className="h-3 w-3 mr-1" /> Add
                                    </Button>
                                  </div>
                                  {(
                                    getActiveTabPayload().projects_dissertation
                                      ?.external_examination?.[0]?.components ||
                                    []
                                  ).map((comp: any, ci: number) => (
                                    <div
                                      key={ci}
                                      className="flex gap-2 items-center"
                                    >
                                      <Input
                                        placeholder="Component name"
                                        value={comp.name || ""}
                                        onChange={(e) => {
                                          const comps = [
                                            ...(getActiveTabPayload()
                                              .projects_dissertation
                                              ?.external_examination?.[0]
                                              ?.components || []),
                                          ];
                                          comps[ci] = {
                                            ...comps[ci],
                                            name: e.target.value,
                                          };
                                          updateActiveTabPayload({
                                            projects_dissertation: {
                                              ...(getActiveTabPayload()
                                                .projects_dissertation || {}),
                                              external_examination: [
                                                {
                                                  section:
                                                    "Components of External Assessment",
                                                  components: comps,
                                                },
                                              ],
                                            },
                                          });
                                        }}
                                      />
                                      <Input
                                        type="number"
                                        placeholder="Marks"
                                        className="w-20"
                                        value={comp.marks ?? ""}
                                        onChange={(e) => {
                                          const comps = [
                                            ...(getActiveTabPayload()
                                              .projects_dissertation
                                              ?.external_examination?.[0]
                                              ?.components || []),
                                          ];
                                          comps[ci] = {
                                            ...comps[ci],
                                            marks: Number(e.target.value),
                                          };
                                          updateActiveTabPayload({
                                            projects_dissertation: {
                                              ...(getActiveTabPayload()
                                                .projects_dissertation || {}),
                                              external_examination: [
                                                {
                                                  section:
                                                    "Components of External Assessment",
                                                  components: comps,
                                                },
                                              ],
                                            },
                                          });
                                        }}
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          const comps = (
                                            getActiveTabPayload()
                                              .projects_dissertation
                                              ?.external_examination?.[0]
                                              ?.components || []
                                          ).filter(
                                            (_: any, i: number) => i !== ci,
                                          );
                                          updateActiveTabPayload({
                                            projects_dissertation: {
                                              ...(getActiveTabPayload()
                                                .projects_dissertation || {}),
                                              external_examination: [
                                                {
                                                  section:
                                                    "Components of External Assessment",
                                                  components: comps,
                                                },
                                              ],
                                            },
                                          });
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                                <div className="border-t pt-3 space-y-2">
                                  <div className="flex justify-between items-center">
                                    <Label className="text-xs font-semibold">
                                      Summary Cards
                                    </Label>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const cards = [
                                          ...(getActiveTabPayload()
                                            .projects_dissertation
                                            ?.summary_cards || []),
                                          { label: "", value: "" },
                                        ];
                                        updateActiveTabPayload({
                                          projects_dissertation: {
                                            ...(getActiveTabPayload()
                                              .projects_dissertation || {}),
                                            summary_cards: cards,
                                          },
                                        });
                                      }}
                                    >
                                      <Plus className="h-3 w-3 mr-1" /> Add
                                    </Button>
                                  </div>
                                  {(
                                    getActiveTabPayload().projects_dissertation
                                      ?.summary_cards || []
                                  ).map((sc: any, si: number) => (
                                    <div
                                      key={si}
                                      className="flex gap-2 items-center"
                                    >
                                      <Input
                                        placeholder="Label"
                                        value={sc.label || ""}
                                        onChange={(e) => {
                                          const cards = [
                                            ...(getActiveTabPayload()
                                              .projects_dissertation
                                              ?.summary_cards || []),
                                          ];
                                          cards[si] = {
                                            ...cards[si],
                                            label: e.target.value,
                                          };
                                          updateActiveTabPayload({
                                            projects_dissertation: {
                                              ...(getActiveTabPayload()
                                                .projects_dissertation || {}),
                                              summary_cards: cards,
                                            },
                                          });
                                        }}
                                      />
                                      <Input
                                        placeholder="Value (e.g. 30 Marks)"
                                        value={sc.value || ""}
                                        onChange={(e) => {
                                          const cards = [
                                            ...(getActiveTabPayload()
                                              .projects_dissertation
                                              ?.summary_cards || []),
                                          ];
                                          cards[si] = {
                                            ...cards[si],
                                            value: e.target.value,
                                          };
                                          updateActiveTabPayload({
                                            projects_dissertation: {
                                              ...(getActiveTabPayload()
                                                .projects_dissertation || {}),
                                              summary_cards: cards,
                                            },
                                          });
                                        }}
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          const cards = (
                                            getActiveTabPayload()
                                              .projects_dissertation
                                              ?.summary_cards || []
                                          ).filter(
                                            (_: any, i: number) => i !== si,
                                          );
                                          updateActiveTabPayload({
                                            projects_dissertation: {
                                              ...(getActiveTabPayload()
                                                .projects_dissertation || {}),
                                              summary_cards: cards,
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

                              {/* OJT Evaluation */}
                              <div className="border p-4 rounded-xl space-y-4 bg-muted/5">
                                <h4 className="font-bold text-sm">
                                  OJT Evaluation
                                </h4>
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-1">
                                    <Label className="text-xs">
                                      Section Title
                                    </Label>
                                    <Input
                                      placeholder="e.g. OJT ASSESSMENT CRITERIA"
                                      value={
                                        getActiveTabPayload().ojt_evaluation
                                          ?.section_title || ""
                                      }
                                      onChange={(e) =>
                                        updateActiveTabPayload({
                                          ojt_evaluation: {
                                            ...(getActiveTabPayload()
                                              .ojt_evaluation || {}),
                                            section_title: e.target.value,
                                          },
                                        })
                                      }
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">
                                      Total Summary Label
                                    </Label>
                                    <Input
                                      placeholder="e.g. TOTAL ASSESSMENT"
                                      value={
                                        getActiveTabPayload().ojt_evaluation
                                          ?.total_summary?.label || ""
                                      }
                                      onChange={(e) =>
                                        updateActiveTabPayload({
                                          ojt_evaluation: {
                                            ...(getActiveTabPayload()
                                              .ojt_evaluation || {}),
                                            total_summary: {
                                              ...(getActiveTabPayload()
                                                .ojt_evaluation
                                                ?.total_summary || {}),
                                              label: e.target.value,
                                            },
                                          },
                                        })
                                      }
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">
                                      Total Summary Value
                                    </Label>
                                    <Input
                                      placeholder="e.g. 100 Marks"
                                      value={
                                        getActiveTabPayload().ojt_evaluation
                                          ?.total_summary?.value || ""
                                      }
                                      onChange={(e) =>
                                        updateActiveTabPayload({
                                          ojt_evaluation: {
                                            ...(getActiveTabPayload()
                                              .ojt_evaluation || {}),
                                            total_summary: {
                                              ...(getActiveTabPayload()
                                                .ojt_evaluation
                                                ?.total_summary || {}),
                                              value: e.target.value,
                                            },
                                          },
                                        })
                                      }
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <Label className="text-xs font-semibold">
                                      Criteria Components
                                    </Label>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const comps = [
                                          ...(getActiveTabPayload()
                                            .ojt_evaluation?.components || []),
                                          { name: "", marks: 0 },
                                        ];
                                        updateActiveTabPayload({
                                          ojt_evaluation: {
                                            ...(getActiveTabPayload()
                                              .ojt_evaluation || {}),
                                            components: comps,
                                          },
                                        });
                                      }}
                                    >
                                      <Plus className="h-3 w-3 mr-1" /> Add
                                    </Button>
                                  </div>
                                  {(
                                    getActiveTabPayload().ojt_evaluation
                                      ?.components || []
                                  ).map((comp: any, ci: number) => (
                                    <div
                                      key={ci}
                                      className="flex gap-2 items-center"
                                    >
                                      <Input
                                        placeholder="Criterion name"
                                        value={comp.name || ""}
                                        onChange={(e) => {
                                          const comps = [
                                            ...(getActiveTabPayload()
                                              .ojt_evaluation?.components ||
                                              []),
                                          ];
                                          comps[ci] = {
                                            ...comps[ci],
                                            name: e.target.value,
                                          };
                                          updateActiveTabPayload({
                                            ojt_evaluation: {
                                              ...(getActiveTabPayload()
                                                .ojt_evaluation || {}),
                                              components: comps,
                                            },
                                          });
                                        }}
                                      />
                                      <Input
                                        type="number"
                                        placeholder="Marks"
                                        className="w-20"
                                        value={comp.marks ?? ""}
                                        onChange={(e) => {
                                          const comps = [
                                            ...(getActiveTabPayload()
                                              .ojt_evaluation?.components ||
                                              []),
                                          ];
                                          comps[ci] = {
                                            ...comps[ci],
                                            marks: Number(e.target.value),
                                          };
                                          updateActiveTabPayload({
                                            ojt_evaluation: {
                                              ...(getActiveTabPayload()
                                                .ojt_evaluation || {}),
                                              components: comps,
                                            },
                                          });
                                        }}
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          const comps = (
                                            getActiveTabPayload().ojt_evaluation
                                              ?.components || []
                                          ).filter(
                                            (_: any, i: number) => i !== ci,
                                          );
                                          updateActiveTabPayload({
                                            ojt_evaluation: {
                                              ...(getActiveTabPayload()
                                                .ojt_evaluation || {}),
                                              components: comps,
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

                              {/* Internship Evaluation */}
                              <div className="border p-4 rounded-xl space-y-4 bg-muted/5">
                                <h4 className="font-bold text-sm">
                                  Internship Evaluation
                                </h4>
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-1">
                                    <Label className="text-xs">
                                      Section Title
                                    </Label>
                                    <Input
                                      placeholder="e.g. COMPONENTS OF INTERNSHIP EVALUATION"
                                      value={
                                        getActiveTabPayload()
                                          .internship_evaluation
                                          ?.section_title || ""
                                      }
                                      onChange={(e) =>
                                        updateActiveTabPayload({
                                          internship_evaluation: {
                                            ...(getActiveTabPayload()
                                              .internship_evaluation || {}),
                                            section_title: e.target.value,
                                          },
                                        })
                                      }
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">
                                      Total Summary Label
                                    </Label>
                                    <Input
                                      placeholder="e.g. TOTAL EVALUATION"
                                      value={
                                        getActiveTabPayload()
                                          .internship_evaluation?.total_summary
                                          ?.label || ""
                                      }
                                      onChange={(e) =>
                                        updateActiveTabPayload({
                                          internship_evaluation: {
                                            ...(getActiveTabPayload()
                                              .internship_evaluation || {}),
                                            total_summary: {
                                              ...(getActiveTabPayload()
                                                .internship_evaluation
                                                ?.total_summary || {}),
                                              label: e.target.value,
                                            },
                                          },
                                        })
                                      }
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">
                                      Total Summary Value
                                    </Label>
                                    <Input
                                      placeholder="e.g. 100 Marks"
                                      value={
                                        getActiveTabPayload()
                                          .internship_evaluation?.total_summary
                                          ?.value || ""
                                      }
                                      onChange={(e) =>
                                        updateActiveTabPayload({
                                          internship_evaluation: {
                                            ...(getActiveTabPayload()
                                              .internship_evaluation || {}),
                                            total_summary: {
                                              ...(getActiveTabPayload()
                                                .internship_evaluation
                                                ?.total_summary || {}),
                                              value: e.target.value,
                                            },
                                          },
                                        })
                                      }
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <Label className="text-xs font-semibold">
                                      Internship Components
                                    </Label>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const comps = [
                                          ...(getActiveTabPayload()
                                            .internship_evaluation
                                            ?.components || []),
                                          { name: "", marks: 0 },
                                        ];
                                        updateActiveTabPayload({
                                          internship_evaluation: {
                                            ...(getActiveTabPayload()
                                              .internship_evaluation || {}),
                                            components: comps,
                                          },
                                        });
                                      }}
                                    >
                                      <Plus className="h-3 w-3 mr-1" /> Add
                                    </Button>
                                  </div>
                                  {(
                                    getActiveTabPayload().internship_evaluation
                                      ?.components || []
                                  ).map((comp: any, ci: number) => (
                                    <div
                                      key={ci}
                                      className="flex gap-2 items-center"
                                    >
                                      <Input
                                        placeholder="Component name"
                                        value={comp.name || ""}
                                        onChange={(e) => {
                                          const comps = [
                                            ...(getActiveTabPayload()
                                              .internship_evaluation
                                              ?.components || []),
                                          ];
                                          comps[ci] = {
                                            ...comps[ci],
                                            name: e.target.value,
                                          };
                                          updateActiveTabPayload({
                                            internship_evaluation: {
                                              ...(getActiveTabPayload()
                                                .internship_evaluation || {}),
                                              components: comps,
                                            },
                                          });
                                        }}
                                      />
                                      <Input
                                        type="number"
                                        placeholder="Marks"
                                        className="w-20"
                                        value={comp.marks ?? ""}
                                        onChange={(e) => {
                                          const comps = [
                                            ...(getActiveTabPayload()
                                              .internship_evaluation
                                              ?.components || []),
                                          ];
                                          comps[ci] = {
                                            ...comps[ci],
                                            marks: Number(e.target.value),
                                          };
                                          updateActiveTabPayload({
                                            internship_evaluation: {
                                              ...(getActiveTabPayload()
                                                .internship_evaluation || {}),
                                              components: comps,
                                            },
                                          });
                                        }}
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          const comps = (
                                            getActiveTabPayload()
                                              .internship_evaluation
                                              ?.components || []
                                          ).filter(
                                            (_: any, i: number) => i !== ci,
                                          );
                                          updateActiveTabPayload({
                                            internship_evaluation: {
                                              ...(getActiveTabPayload()
                                                .internship_evaluation || {}),
                                              components: comps,
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
                            </div>
                          )}
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
