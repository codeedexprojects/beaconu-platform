"use client";

import { useState } from "react";
import { toast } from "sonner";
import { uploadCollegeAdminFile } from "@/lib/services/colleges.service";
import { GeneralOverviewTab } from "@/components/academics/tabs/course-info/GeneralOverviewTab";
import { AdmissionsTimelineTab } from "@/components/academics/tabs/course-info/AdmissionsTimelineTab";
import { AcademicsCurriculumTab } from "@/components/academics/tabs/course-info/AcademicsCurriculumTab";
import { FacilitiesTimingsTab } from "@/components/academics/tabs/course-info/FacilitiesTimingsTab";
import { CareerAlumniFaqsTab } from "@/components/academics/tabs/course-info/CareerAlumniFaqsTab";

const COURSE_INFO_SUB_TABS = [
  { id: "general", label: "General & Overview" },
  { id: "admissions", label: "Admissions & Dates" },
  { id: "academics", label: "Academics & Curriculum" },
  { id: "facilities", label: "Facilities & Timings" },
  { id: "alumni_faqs", label: "Career & Alumni / FAQs" },
];

export function CourseInfoTab({
  payload,
  onChange,
  subTab,
  onSubTabChange,
  editingCourseId,
  uploadingField,
  onFieldUpload,
}: {
  payload: any;
  onChange: (updates: any) => void;
  subTab: string;
  onSubTabChange: (subTab: string) => void;
  editingCourseId: string | undefined;
  uploadingField: string | null;
  onFieldUpload: (
    file: File | null,
    fieldKey: string,
    s3PathSuffix: string,
    onSuccess: (url: string) => void,
  ) => void;
}) {
  const [uploadingBrochure, setUploadingBrochure] = useState(false);
  const [uploadingAlumniIndex, setUploadingAlumniIndex] = useState<
    number | null
  >(null);

  const handleBrochureUpload = async (file: File | null) => {
    if (!file) return;

    try {
      setUploadingBrochure(true);
      const permanentUrl = await uploadCollegeAdminFile(
        file,
        `courses/${editingCourseId || "draft"}/brochure`,
      );
      onChange({
        curriculum: {
          ...(payload.curriculum || {}),
          brochure_link: permanentUrl,
        },
      });
      toast.success("Brochure uploaded successfully");
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
        `courses/${editingCourseId || "draft"}/featured-alumni-${idx}`,
      );
      const next = [...(payload.featuredAlumni?.items || [])];
      next[idx] = { ...next[idx], image: permanentUrl };
      onChange({
        featuredAlumni: {
          ...(payload.featuredAlumni || {}),
          items: next,
        },
      });
      toast.success("Alumni image uploaded successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      toast.error(message);
    } finally {
      setUploadingAlumniIndex(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-2 mb-6">
        <div className="flex overflow-x-auto scrollbar-none gap-2 w-full sm:w-auto">
          {COURSE_INFO_SUB_TABS.map((tab) => {
            const isSubActive = subTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSubTabChange(tab.id)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 border ${
                  isSubActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {subTab === "general" && (
        <GeneralOverviewTab
          payload={payload}
          onChange={onChange}
          uploadingField={uploadingField}
          onFieldUpload={onFieldUpload}
        />
      )}

      {subTab === "admissions" && (
        <AdmissionsTimelineTab payload={payload} onChange={onChange} />
      )}

      {subTab === "academics" && (
        <AcademicsCurriculumTab
          payload={payload}
          onChange={onChange}
          uploadingBrochure={uploadingBrochure}
          onBrochureUpload={handleBrochureUpload}
        />
      )}

      {subTab === "facilities" && (
        <FacilitiesTimingsTab
          payload={payload}
          onChange={onChange}
          uploadingField={uploadingField}
          onFieldUpload={onFieldUpload}
        />
      )}

      {subTab === "alumni_faqs" && (
        <CareerAlumniFaqsTab
          payload={payload}
          onChange={onChange}
          uploadingAlumniIndex={uploadingAlumniIndex}
          onAlumniImageUpload={handleAlumniImageUpload}
        />
      )}
    </div>
  );
}
