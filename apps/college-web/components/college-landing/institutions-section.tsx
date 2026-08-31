"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  PublicInstitutionsAcrossWorldSection,
  PublicInstitutionDepartment,
} from "@beaconu/types";

interface InstitutionsSectionProps {
  section: PublicInstitutionsAcrossWorldSection;
  subdomain: string;
}

function formatFee(fee: string | null, currency: string): string {
  if (!fee) return "Fee not available";
  const amount = Number(fee);
  if (!Number.isFinite(amount)) return "Fee not available";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function DepartmentCourses({
  department,
}: {
  department: PublicInstitutionDepartment;
}) {
  const [activeTab, setActiveTab] = useState(
    department.program_type_tabs.selected ||
      department.program_type_tabs.options[0] ||
      "",
  );

  const courses = department.courses;

  return (
    <div>
      {department.program_type_tabs.options.length > 0 ? (
        <div className="flex items-center gap-6 border-b border-border/60">
          {department.program_type_tabs.options.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "-mb-px border-b-2 pb-3 text-sm font-medium transition-colors",
                activeTab === tab
                  ? "border-headerTeal-dark text-headerTeal-dark"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-5 space-y-4">
        {courses.length > 0 ? (
          courses.map((course) => (
            <div key={course.id} className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-base font-semibold">{course.name}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {course.duration ? <span>{course.duration}</span> : null}
                {course.mode ? <span>{course.mode}</span> : null}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                <p className="text-xs text-muted-foreground">Starting from</p>
                <p className="text-sm font-bold">
                  {formatFee(course.fee, course.currency)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            No active programs listed yet.
          </p>
        )}
      </div>
    </div>
  );
}

export function InstitutionsSection({
  section,
  subdomain,
}: InstitutionsSectionProps) {
  const locations = useMemo(() => {
    const seen = new Map<string, string>();
    for (const institution of section.institutions) {
      const label = [institution.city, institution.state]
        .filter(Boolean)
        .join(" - ");
      if (label && !seen.has(label)) seen.set(label, label);
    }
    return Array.from(seen.values());
  }, [section.institutions]);

  const defaultLocation = useMemo(() => {
    const active = section.institutions.find((i) => i.selected);
    if (!active) return locations[0] ?? null;
    return (
      [active.city, active.state].filter(Boolean).join(" - ") ||
      locations[0] ||
      null
    );
  }, [section.institutions, locations]);

  const [activeLocation, setActiveLocation] = useState<string | null>(
    defaultLocation,
  );

  const visibleInstitutions = useMemo(() => {
    if (!activeLocation) return section.institutions;
    return section.institutions.filter(
      (i) => [i.city, i.state].filter(Boolean).join(" - ") === activeLocation,
    );
  }, [section.institutions, activeLocation]);

  const [activeInstitutionId, setActiveInstitutionId] = useState<string | null>(
    () =>
      visibleInstitutions.find((i) => i.selected)?.id ??
      visibleInstitutions[0]?.id ??
      null,
  );

  const activeInstitution =
    visibleInstitutions.find((i) => i.id === activeInstitutionId) ??
    visibleInstitutions[0] ??
    null;

  const [activeDepartmentId, setActiveDepartmentId] = useState<string | null>(
    () => activeInstitution?.departments[0]?.id ?? null,
  );

  if (section.institutions.length === 0) return null;

  function selectLocation(label: string) {
    setActiveLocation(label);
    const first = section.institutions.find(
      (i) => [i.city, i.state].filter(Boolean).join(" - ") === label,
    );
    setActiveInstitutionId(first?.id ?? null);
    setActiveDepartmentId(first?.departments[0]?.id ?? null);
  }

  function selectInstitution(id: string) {
    setActiveInstitutionId(id);
    const institution = section.institutions.find((i) => i.id === id);
    setActiveDepartmentId(institution?.departments[0]?.id ?? null);
  }

  const activeDepartment =
    activeInstitution?.departments.find((d) => d.id === activeDepartmentId) ??
    activeInstitution?.departments[0] ??
    null;

  return (
    <section id="institutions" className="pb-16">
      <div className="relative bg-[#E6F7FF] py-10">
        <Link
          href={`/college/${subdomain}`}
          className="absolute left-4 top-6 flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted sm:left-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {section.title}
          </h1>
          {section.group ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Part of {section.group.name}.
            </p>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        {locations.length > 1 ? (
          <div className="flex flex-wrap items-center gap-2">
            <p className="mr-1 text-sm font-semibold text-foreground">
              Campus Locations :
            </p>
            {locations.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => selectLocation(label)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  activeLocation === label
                    ? "bg-headerTeal-dark text-white"
                    : "border border-border/60 bg-white text-foreground hover:bg-field",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        ) : null}

        <div className="no-scrollbar mt-5 flex gap-4 overflow-x-auto pb-2">
          {visibleInstitutions.map((institution) => (
            <button
              key={institution.id}
              type="button"
              onClick={() => selectInstitution(institution.id)}
              className={cn(
                "w-56 shrink-0 overflow-hidden rounded-2xl border-2 bg-white text-left shadow-sm transition-shadow",
                activeInstitution?.id === institution.id
                  ? "border-headerTeal-dark"
                  : "border-transparent hover:shadow-md",
              )}
            >
              <div className="relative h-24 w-full bg-muted">
                {institution.logoUrl ? (
                  <Image
                    src={institution.logoUrl}
                    alt={`${institution.name} logo`}
                    fill
                    sizes="224px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Building2 className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                )}
                {activeInstitution?.id === institution.id ? (
                  <span className="absolute left-2 top-2 rounded-full bg-headerTeal-dark px-2.5 py-1 text-[10px] font-semibold text-white">
                    Viewing
                  </span>
                ) : null}
              </div>
              <div className="p-3">
                <p className="line-clamp-2 text-sm font-semibold leading-snug">
                  {institution.name}
                </p>
              </div>
            </button>
          ))}
        </div>

        {activeInstitution && activeInstitution.departments.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-[260px_1fr]">
            <div>
              <p className="mb-3 text-sm font-semibold text-foreground">
                Departments
              </p>
              <div className="space-y-2.5">
                {activeInstitution.departments.map((department) => (
                  <button
                    key={department.id}
                    type="button"
                    onClick={() => setActiveDepartmentId(department.id)}
                    className={cn(
                      "w-full rounded-xl border px-4 py-3 text-left transition-colors",
                      activeDepartmentId === department.id
                        ? "border-headerTeal-dark bg-white shadow-sm"
                        : "border-transparent bg-field hover:bg-field-focus",
                    )}
                  >
                    <p className="text-sm font-medium text-foreground">
                      {department.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {department.programs_available} program
                      {department.programs_available === 1 ? "" : "s"} available
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              {activeDepartment ? (
                <DepartmentCourses department={activeDepartment} />
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
