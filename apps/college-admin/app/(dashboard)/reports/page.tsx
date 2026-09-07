"use client";

import { useState } from "react";
import { useAdmissionCycles } from "@/hooks/use-admission-cycles";
import { EnrollmentOverviewSection } from "@/components/reports/enrollment-overview-section";
import { AdmissionsFunnelSection } from "@/components/reports/admissions-funnel-section";
import { AgeGenderSection } from "@/components/reports/age-gender-section";
import { GeographicOriginSection } from "@/components/reports/geographic-origin-section";

export default function ReportsPage() {
  const [admissionCycleId, setAdmissionCycleId] = useState<string>("");
  const { data: cycles = [] } = useAdmissionCycles();

  const cycleFilter = admissionCycleId || undefined;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Reports &amp; Demographics
          </h1>
          <p className="text-sm text-muted-foreground">
            Admissions performance and applicant insights, refreshed every 15
            minutes.
          </p>
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          value={admissionCycleId}
          onChange={(e) => setAdmissionCycleId(e.target.value)}
        >
          <option value="">All Admission Cycles</option>
          {cycles.map((cycle) => (
            <option key={cycle.id} value={cycle.id}>
              {cycle.name}
            </option>
          ))}
        </select>
      </div>

      <EnrollmentOverviewSection admissionCycleId={cycleFilter} />
      <AdmissionsFunnelSection admissionCycleId={cycleFilter} />
      <AgeGenderSection admissionCycleId={cycleFilter} />
      <GeographicOriginSection admissionCycleId={cycleFilter} />
    </div>
  );
}
