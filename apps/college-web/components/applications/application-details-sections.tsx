"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/ui/stepper";
import { PersonalDetailsForm } from "@/components/applications/personal-details-form";
import { FamilyDetailsForm } from "@/components/applications/family-details-form";
import { AddressDetailsForm } from "@/components/applications/address-details-form";
import { TenthGradeForm } from "@/components/applications/tenth-grade-form";
import { TwelfthGradeForm } from "@/components/applications/twelfth-grade-form";
import {
  DiplomaForm,
  PgForm,
  UndergraduateForm,
} from "@/components/applications/undergraduate-form";
import { AchievementsDetailsForm } from "@/components/applications/achievements-details-form";
import { EntranceExamForm } from "@/components/applications/entrance-exam-form";
import { DocumentsSection } from "@/components/applications/documents-section";
import { DeclarationForm } from "@/components/applications/declaration-form";

interface ApplicationDetailsSectionsProps {
  applicationId: string;
}

const steps = [
  { key: "personal", label: "Personal Details" },
  { key: "family", label: "Family Details" },
  { key: "address", label: "Address Details" },
  { key: "academic", label: "Academic Records" },
  { key: "achievements", label: "Achievements" },
  { key: "entrance_exam", label: "Entrance Exam" },
  { key: "documents", label: "Documents" },
  { key: "declaration", label: "Declaration" },
] as const;

type StepKey = (typeof steps)[number]["key"];

const academicSubTabs = [
  { key: "tenth_grade", label: "10th Grade" },
  { key: "twelfth_grade", label: "12th Grade" },
  { key: "undergraduate", label: "Undergraduate" },
  { key: "pg", label: "PG" },
  { key: "diploma", label: "Diploma" },
] as const;

type AcademicSubTabKey = (typeof academicSubTabs)[number]["key"];

function AcademicRecordsStep({
  applicationId,
  onContinue,
}: {
  applicationId: string;
  onContinue: () => void;
}) {
  const [activeSubTab, setActiveSubTab] =
    useState<AcademicSubTabKey>("tenth_grade");

  return (
    <div className="space-y-4">
      <div className="flex gap-1 overflow-x-auto rounded-full bg-field p-1">
        {academicSubTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveSubTab(tab.key)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              activeSubTab === tab.key
                ? "bg-accentOrange text-accentOrange-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === "tenth_grade" ? (
        <TenthGradeForm applicationId={applicationId} />
      ) : null}
      {activeSubTab === "twelfth_grade" ? (
        <TwelfthGradeForm applicationId={applicationId} />
      ) : null}
      {activeSubTab === "undergraduate" ? (
        <UndergraduateForm applicationId={applicationId} />
      ) : null}
      {activeSubTab === "pg" ? <PgForm applicationId={applicationId} /> : null}
      {activeSubTab === "diploma" ? (
        <DiplomaForm applicationId={applicationId} />
      ) : null}

      {/* This step contains multiple independent sub-forms, each with its
          own Save button that already persists on click — so "Continue"
          here only advances the wizard, it does not itself save anything. */}
      <Button
        type="button"
        onClick={onContinue}
        className="h-14 w-full rounded-full border-0 bg-gradient-to-r from-[hsl(var(--accent-orange-gradient-from))] to-[hsl(var(--accent-orange-gradient-to))] text-base font-semibold text-accentOrange-foreground shadow-md hover:opacity-95"
      >
        Continue
      </Button>
    </div>
  );
}

export function ApplicationDetailsSections({
  applicationId,
}: ApplicationDetailsSectionsProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const activeKey: StepKey = steps[currentStep - 1]!.key;

  function goToNextStep() {
    setCurrentStep((s) => Math.min(s + 1, steps.length));
  }

  function goToPreviousStep() {
    setCurrentStep((s) => Math.max(s - 1, 1));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={goToPreviousStep}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-field hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        ) : null}
        <Stepper
          currentStep={currentStep}
          totalSteps={steps.length}
          className="flex-1"
        />
      </div>

      {activeKey === "personal" ? (
        <PersonalDetailsForm
          applicationId={applicationId}
          onSaved={goToNextStep}
        />
      ) : null}
      {activeKey === "family" ? (
        <FamilyDetailsForm
          applicationId={applicationId}
          onSaved={goToNextStep}
        />
      ) : null}
      {activeKey === "address" ? (
        <AddressDetailsForm
          applicationId={applicationId}
          onSaved={goToNextStep}
        />
      ) : null}
      {activeKey === "academic" ? (
        <AcademicRecordsStep
          applicationId={applicationId}
          onContinue={goToNextStep}
        />
      ) : null}
      {activeKey === "achievements" ? (
        <AchievementsDetailsForm
          applicationId={applicationId}
          onSaved={goToNextStep}
        />
      ) : null}
      {activeKey === "entrance_exam" ? (
        <EntranceExamForm
          applicationId={applicationId}
          onSaved={goToNextStep}
        />
      ) : null}
      {activeKey === "documents" ? (
        <DocumentsSection
          applicationId={applicationId}
          onSaved={goToNextStep}
        />
      ) : null}
      {activeKey === "declaration" ? (
        <DeclarationForm applicationId={applicationId} />
      ) : null}
    </div>
  );
}
