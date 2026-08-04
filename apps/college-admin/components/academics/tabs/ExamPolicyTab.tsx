"use client";

import { ExamPatternsTab } from "@/components/academics/tabs/exam-policy/ExamPatternsTab";
import { GradingTab } from "@/components/academics/tabs/exam-policy/GradingTab";
import { GuidelinesTab } from "@/components/academics/tabs/exam-policy/GuidelinesTab";
import { SpecialCasesTab } from "@/components/academics/tabs/exam-policy/SpecialCasesTab";

const EXAM_POLICY_SUB_TABS = [
  { id: "patterns", label: "Evaluation Patterns" },
  { id: "grading", label: "Grading Scale" },
  { id: "guidelines", label: "Academic Guidelines" },
  { id: "special", label: "Projects / OJT / Internship" },
];

export function ExamPolicyTab({
  payload,
  onChange,
  subTab,
  onSubTabChange,
  uploadingField,
  onFieldUpload,
}: {
  payload: any;
  onChange: (updates: any) => void;
  subTab: string;
  onSubTabChange: (subTab: string) => void;
  uploadingField: string | null;
  onFieldUpload: (
    file: File | null,
    fieldKey: string,
    s3PathSuffix: string,
    onSuccess: (url: string) => void,
  ) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex border-b overflow-x-auto scrollbar-none gap-2 pb-2">
        {EXAM_POLICY_SUB_TABS.map((st) => (
          <button
            key={st.id}
            type="button"
            onClick={() => onSubTabChange(st.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 border ${
              subTab === st.id
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {subTab === "patterns" && (
        <ExamPatternsTab
          payload={payload}
          onChange={onChange}
          uploadingField={uploadingField}
          onFieldUpload={onFieldUpload}
        />
      )}

      {subTab === "grading" && (
        <GradingTab payload={payload} onChange={onChange} />
      )}

      {subTab === "guidelines" && (
        <GuidelinesTab
          payload={payload}
          onChange={onChange}
          uploadingField={uploadingField}
          onFieldUpload={onFieldUpload}
        />
      )}

      {subTab === "special" && (
        <SpecialCasesTab payload={payload} onChange={onChange} />
      )}
    </div>
  );
}
