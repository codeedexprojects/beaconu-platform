"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, ArrowLeft, Plus, Save } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
import { useCollegeHostels, useCollegeLibraries } from "@/hooks/use-facilities";
import { getCollegeSlugFromPath, getPortalPath } from "@/lib/portal-path";
import {
  COURSE_TABS,
  type CourseTabId,
} from "@/components/academics/constants";
import { CourseListView } from "@/components/academics/CourseListView";
import { CourseTabSidebar } from "@/components/academics/CourseTabSidebar";
import {
  BasicDetailsTab,
  type CourseFormData,
} from "@/components/academics/tabs/BasicDetailsTab";
import { QuotasFeesTab } from "@/components/academics/tabs/QuotasFeesTab";
import { CourseInfoTab } from "@/components/academics/tabs/CourseInfoTab";
import { AdmissionPolicyTab } from "@/components/academics/tabs/AdmissionPolicyTab";
import { EligibilityCriteriaTab } from "@/components/academics/tabs/EligibilityCriteriaTab";
import { PlacementsTab } from "@/components/academics/tabs/PlacementsTab";
import { FeeStructureTab } from "@/components/academics/tabs/FeeStructureTab";
import { FinancialAidTab } from "@/components/academics/tabs/FinancialAidTab";
import { StudentHousingTab } from "@/components/academics/tabs/StudentHousingTab";
import { ExamPolicyTab } from "@/components/academics/tabs/ExamPolicyTab";
import { FacultyDirectoryTab } from "@/components/academics/tabs/FacultyDirectoryTab";
import { StudentReviewsTab } from "@/components/academics/tabs/StudentReviewsTab";
import { LibraryAssetsTab } from "@/components/academics/tabs/LibraryAssetsTab";
import { ClubsGroupsTab } from "@/components/academics/tabs/ClubsGroupsTab";
import { AlliancesTiesTab } from "@/components/academics/tabs/AlliancesTiesTab";
import { OtherOptionsTab } from "@/components/academics/tabs/OtherOptionsTab";
import { DemographicsTab } from "@/components/academics/tabs/DemographicsTab";
import { AccreditationsTab } from "@/components/academics/tabs/AccreditationsTab";
import { ExamEligibilityTab } from "@/components/academics/tabs/ExamEligibilityTab";

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
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [deleteCourseTarget, setDeleteCourseTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleCourseFieldUpload = async (
    file: File | null,
    fieldKey: string,
    s3PathSuffix: string,
    onSuccess: (url: string) => void,
  ) => {
    if (!file) return;
    try {
      setUploadingField(fieldKey);
      const permanentUrl = await uploadCollegeAdminFile(
        file,
        `courses/${editingCourse?.id || "draft"}/${s3PathSuffix}`,
      );
      onSuccess(permanentUrl);
      toast.success("File uploaded successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      toast.error(message);
    } finally {
      setUploadingField(null);
    }
  };

  const { data: courses = [], isLoading: isLoadingCourses } =
    useCollegeCourses();
  const { data: streams = [] } = useStreams();
  const { data: studyLevels = [] } = useStudyLevels();
  const { data: programTypes = [] } = useProgramTypes();
  const { data: campuses = [] } = useCollegeCampuses();
  const { data: hostels = [] } = useCollegeHostels();
  const { data: libraries = [] } = useCollegeLibraries();

  const { mutate: createCourse, isPending: isCreating } =
    useCreateCollegeCourse();
  const { mutate: updateCourse, isPending: isUpdating } =
    useUpdateCollegeCourse();
  const { mutate: deleteCourse, isPending: isDeletingCourse } =
    useDeleteCollegeCourse();

  // Tab Data hooks for the currently selected course (if editing)
  const { data: tabDataResponse, isLoading: isLoadingTabs } = useCourseTabs(
    editingCourse?.id,
    !!editingCourse?.id,
  );
  const { mutate: updateTab, isPending: isUpdatingTab } = useUpdateCourseTab();

  // Tab State - local JSON fields representing active tab data edits
  const [localTabState, setLocalTabState] = useState<any>({});

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
            coverImageUrl: data.coverImageUrl || null,
            referralCommissionAmount: data.referralCommissionAmount ?? null,
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
          coverImageUrl: data.coverImageUrl || null,
          referralCommissionAmount: data.referralCommissionAmount ?? null,
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

  const isValidUrl = (value: string) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const validateActiveTabPayload = (): string | null => {
    if (activeTab === "alliance") {
      const alliances = getActiveTabPayload().alliances || [];
      for (let i = 0; i < alliances.length; i++) {
        const a = alliances[i];
        const label = a.name?.trim() || `Alliance #${i + 1}`;
        if (!a.name?.trim())
          return `Alliance #${i + 1}: Partner name is required`;
        if (a.cover_image && !isValidUrl(a.cover_image))
          return `${label}: Cover image must be a valid URL`;
        if (a.logo && !isValidUrl(a.logo))
          return `${label}: Logo must be a valid URL`;
        for (const doc of a.details?.legal_documents || []) {
          if (!doc.title?.trim())
            return `${label}: every legal document needs a title`;
          if (doc.url && !isValidUrl(doc.url))
            return `${label}: document "${doc.title || "untitled"}" URL is invalid`;
        }
        const happeningsLink = a.details?.alliance_activities?.happenings_link;
        if (happeningsLink && !isValidUrl(happeningsLink))
          return `${label}: 'View Happenings' link must be a valid URL`;
        for (const act of a.details?.alliance_activities?.activities || []) {
          if (!act.title?.trim())
            return `${label}: every activity needs a title`;
          if (act.link && !isValidUrl(act.link))
            return `${label}: activity "${act.title || "untitled"}" link is invalid`;
        }
      }
    }

    if (activeTab === "clubs_associations") {
      const clubs = getActiveTabPayload().clubs || [];
      for (let i = 0; i < clubs.length; i++) {
        const c = clubs[i];
        const label = c.name?.trim() || `Club #${i + 1}`;
        if (!c.name?.trim()) return `Club #${i + 1}: Name is required`;
        if (c.cover_image && !isValidUrl(c.cover_image))
          return `${label}: Cover image must be a valid URL`;
        if (c.logo && !isValidUrl(c.logo))
          return `${label}: Logo must be a valid URL`;
        const happeningsLink = c.details?.recent_events?.happenings_link;
        if (happeningsLink && !isValidUrl(happeningsLink))
          return `${label}: 'View Happenings' link must be a valid URL`;
        for (const event of c.details?.recent_events?.events || []) {
          if (!event.title?.trim())
            return `${label}: every event needs a title`;
          if (event.link && !isValidUrl(event.link))
            return `${label}: event "${event.title || "untitled"}" link is invalid`;
        }
      }
    }

    if (activeTab === "course_info" && courseInfoSubTab === "general") {
      const accItems = getActiveTabPayload().accreditations?.items || [];
      for (let i = 0; i < accItems.length; i++) {
        const item = accItems[i];
        const hasAny =
          item.tag?.trim() ||
          item.image?.trim() ||
          item.document?.trim() ||
          item.title?.trim();
        if (hasAny) {
          if (!item.tag?.trim())
            return `Accreditation #${i + 1}: Tag is required`;
          if (!item.title?.trim())
            return `Accreditation #${i + 1}: Title is required`;
          if (!item.image?.trim() && !item.document?.trim())
            return `Accreditation #${i + 1}: Image or PDF document is required`;
        }
        if (item.image && !isValidUrl(item.image))
          return `Accreditation #${i + 1}: Image must be a valid URL`;
        if (item.document && !isValidUrl(item.document))
          return `Accreditation #${i + 1}: Document must be a valid URL`;
      }
    }

    return null;
  };

  const saveActiveTab = () => {
    if (!editingCourse?.id) return;
    // Quotas and Fee Structure are relational tabs (courses/:id/quotas,
    // courses/:id/fee-structures) — each row saves immediately via its own
    // mutation, there is no draft JSON to persist here. "basic" isn't a JSON
    // tab either — it's the course-details form, saved separately via
    // updateCourse — so it must never be sent to the tab-save endpoint.
    if (
      activeTab === "course_quotas" ||
      activeTab === "fees" ||
      activeTab === "basic"
    )
      return;

    const validationError = validateActiveTabPayload();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const tabPayload = localTabState[activeTab] || {};
    const dataWithId = { id: activeTab, ...tabPayload };

    updateTab(
      {
        courseId: editingCourse.id,
        tabName: activeTab,
        data: dataWithId,
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
    const course = courses.find((c: any) => c.id === id);
    setDeleteCourseTarget({ id, name: course?.name ?? "this program" });
  };

  const confirmDeleteCourse = () => {
    if (!deleteCourseTarget) return;
    deleteCourse(deleteCourseTarget.id, {
      onSuccess: () => {
        toast.success("Course deleted successfully");
        setDeleteCourseTarget(null);
      },
    });
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

  const saveAndGoToTab = (nextTabId: CourseTabId) => {
    // Quotas and Fee Structure have no draft JSON — each add/update/delete
    // action saves immediately, so Back/Next just navigates. "basic" isn't a
    // JSON tab either — it's the course-details form, saved separately via
    // updateCourse — so it must never be sent to the tab-save endpoint.
    if (
      activeTab === "course_quotas" ||
      activeTab === "fees" ||
      activeTab === "basic"
    ) {
      setActiveTab(nextTabId);
      return;
    }

    if (editingCourse?.id) {
      const tabPayload = localTabState[activeTab] || {};
      const dataWithId = { id: activeTab, ...tabPayload };
      updateTab(
        {
          courseId: editingCourse.id,
          tabName: activeTab,
          data: dataWithId,
        },
        {
          onSuccess: () => {
            toast.success(
              `${COURSE_TABS.find((t) => t.id === activeTab)?.label} tab saved!`,
            );
            setActiveTab(nextTabId);
          },
        },
      );
    } else {
      setActiveTab(nextTabId);
    }
  };

  const saveAndExit = () => {
    if (
      activeTab === "course_quotas" ||
      activeTab === "fees" ||
      activeTab === "basic"
    ) {
      setEditingCourse(null);
      setIsAdding(false);
      return;
    }

    if (editingCourse?.id) {
      const tabPayload = localTabState[activeTab] || {};
      const dataWithId = { id: activeTab, ...tabPayload };
      updateTab(
        {
          courseId: editingCourse.id,
          tabName: activeTab,
          data: dataWithId,
        },
        {
          onSuccess: () => {
            toast.success(
              `${COURSE_TABS.find((t) => t.id === activeTab)?.label} tab saved!`,
            );
            setEditingCourse(null);
            setIsAdding(false);
          },
        },
      );
    } else {
      setEditingCourse(null);
      setIsAdding(false);
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
            className="shadow-md font-semibold"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Course
          </Button>
        )}
      </div>

      {/* COURSE LIST VIEW */}
      {!isEditingOrAdding && (
        <CourseListView
          courses={courses}
          onEdit={(course) => {
            setEditingCourse(course);
            setActiveTab("basic");
          }}
          onDelete={handleDelete}
          onAddFirst={() => setIsAdding(true)}
        />
      )}

      {/* EDITING / ADDING WORKSPACE */}
      {isEditingOrAdding && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* TAB SIDEBAR */}
          <CourseTabSidebar
            activeTab={activeTab}
            hasEditingCourse={!!editingCourse}
            onSelectTab={saveAndGoToTab}
          />

          {/* EDIT WORKSPACE */}
          <main className="lg:col-span-9 space-y-6">
            {/* 1. BASIC DETAILS FORM */}
            {activeTab === "basic" && (
              <BasicDetailsTab
                editingCourse={editingCourse}
                disciplines={disciplines}
                studyLevels={studyLevels}
                programTypes={programTypes}
                campuses={campuses}
                isCreating={isCreating}
                isUpdating={isUpdating}
                uploadingField={uploadingField}
                onFieldUpload={handleCourseFieldUpload}
                onSubmit={handleBasicSubmit}
                onCancel={() => {
                  setEditingCourse(null);
                  setIsAdding(false);
                }}
              />
            )}

            {/* TAB CONFIGURE FORM (14 JSON TABS + QUOTAS & FEES) */}
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
                  {activeTab !== "course_quotas" && activeTab !== "fees" && (
                    <Button
                      onClick={saveActiveTab}
                      disabled={isUpdatingTab}
                      className="font-semibold"
                    >
                      {isUpdatingTab ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Tab
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-6 min-h-[300px]">
                  {activeTab === "course_quotas" ? (
                    <QuotasFeesTab courseId={editingCourse.id} />
                  ) : activeTab === "fees" ? (
                    <FeeStructureTab courseId={editingCourse.id} />
                  ) : isLoadingTabs ? (
                    <div className="flex h-48 items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      {/* COURSE INFO TAB */}
                      {activeTab === "course_info" && (
                        <CourseInfoTab
                          payload={getActiveTabPayload()}
                          onChange={updateActiveTabPayload}
                          subTab={courseInfoSubTab}
                          onSubTabChange={setCourseInfoSubTab}
                          editingCourseId={editingCourse?.id}
                          uploadingField={uploadingField}
                          onFieldUpload={handleCourseFieldUpload}
                        />
                      )}

                      {activeTab === "admission_policy" && (
                        <AdmissionPolicyTab
                          payload={getActiveTabPayload()}
                          onChange={updateActiveTabPayload}
                        />
                      )}

                      {activeTab === "eligibility_criteria" && (
                        <EligibilityCriteriaTab
                          payload={getActiveTabPayload()}
                          onChange={updateActiveTabPayload}
                        />
                      )}

                      {activeTab === "placements" && (
                        <PlacementsTab
                          payload={getActiveTabPayload()}
                          onChange={updateActiveTabPayload}
                          uploadingField={uploadingField}
                          onFieldUpload={handleCourseFieldUpload}
                        />
                      )}

                      {activeTab === "financial_aid" && (
                        <FinancialAidTab
                          payload={getActiveTabPayload()}
                          onChange={updateActiveTabPayload}
                        />
                      )}

                      {activeTab === "student_housing" && (
                        <StudentHousingTab
                          payload={getActiveTabPayload()}
                          onChange={updateActiveTabPayload}
                          hostels={hostels}
                        />
                      )}

                      {/* EXAM POLICY */}
                      {activeTab === "exam_policy" && (
                        <ExamPolicyTab
                          payload={getActiveTabPayload()}
                          onChange={updateActiveTabPayload}
                          subTab={examPolicySubTab}
                          onSubTabChange={setExamPolicySubTab}
                          uploadingField={uploadingField}
                          onFieldUpload={handleCourseFieldUpload}
                        />
                      )}

                      {/* FACULTY */}
                      {activeTab === "faculty" && (
                        <FacultyDirectoryTab
                          payload={getActiveTabPayload()}
                          onChange={updateActiveTabPayload}
                        />
                      )}

                      {activeTab === "review" && (
                        <StudentReviewsTab
                          payload={getActiveTabPayload()}
                          onChange={updateActiveTabPayload}
                        />
                      )}

                      {activeTab === "library" && (
                        <LibraryAssetsTab
                          payload={getActiveTabPayload()}
                          onChange={updateActiveTabPayload}
                          libraries={libraries}
                        />
                      )}

                      {/* CLUBS */}
                      {activeTab === "clubs_associations" && (
                        <ClubsGroupsTab
                          payload={getActiveTabPayload()}
                          onChange={updateActiveTabPayload}
                          uploadingField={uploadingField}
                          onFieldUpload={handleCourseFieldUpload}
                        />
                      )}

                      {activeTab === "alliance" && (
                        <AlliancesTiesTab
                          payload={getActiveTabPayload()}
                          onChange={updateActiveTabPayload}
                          uploadingField={uploadingField}
                          onFieldUpload={handleCourseFieldUpload}
                        />
                      )}

                      {activeTab === "other_courses_offered" && (
                        <OtherOptionsTab
                          payload={getActiveTabPayload()}
                          onChange={updateActiveTabPayload}
                        />
                      )}

                      {/* DEMOGRAPHICS */}
                      {activeTab === "demo_graphics" && (
                        <DemographicsTab
                          payload={getActiveTabPayload()}
                          onChange={updateActiveTabPayload}
                        />
                      )}

                      {activeTab === "accreditations" && (
                        <AccreditationsTab
                          payload={getActiveTabPayload()}
                          onChange={updateActiveTabPayload}
                        />
                      )}

                      {activeTab === "entrance_exam_eligibility" && (
                        <ExamEligibilityTab
                          payload={getActiveTabPayload()}
                          onChange={updateActiveTabPayload}
                        />
                      )}
                    </>
                  )}
                </CardContent>

                {/* BOTTOM TAB TOGGLE NAV */}
                <div className="flex justify-between items-center p-6 border-t bg-muted/10">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isUpdatingTab}
                    onClick={() => {
                      const idx = COURSE_TABS.findIndex(
                        (t) => t.id === activeTab,
                      );
                      if (idx > 0) saveAndGoToTab(COURSE_TABS[idx - 1].id);
                    }}
                  >
                    Back Tab
                  </Button>
                  <Button
                    type="button"
                    className="bg-zinc-800 hover:bg-zinc-900 text-white font-semibold"
                    disabled={isUpdatingTab}
                    onClick={() => {
                      const idx = COURSE_TABS.findIndex(
                        (t) => t.id === activeTab,
                      );
                      if (idx < COURSE_TABS.length - 1) {
                        saveAndGoToTab(COURSE_TABS[idx + 1].id);
                      } else {
                        saveAndExit();
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
                disabled={isUpdatingTab}
                onClick={saveAndExit}
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
            className="shadow-lg font-semibold"
            onClick={() =>
              router.push(getPortalPath(collegeSlug, "/setup/review"))
            }
          >
            Continue to Review
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={deleteCourseTarget !== null}
        title="Delete Program"
        description={
          deleteCourseTarget
            ? `Are you sure you want to delete "${deleteCourseTarget.name}"? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        variant="destructive"
        loading={isDeletingCourse}
        onCancel={() => setDeleteCourseTarget(null)}
        onConfirm={confirmDeleteCourse}
      />
    </div>
  );
}
