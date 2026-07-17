import Image from "next/image";
import {
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  PublicCourseAccreditations,
  PublicCourseCareerOpportunities,
  PublicCourseCertificationsBlock,
  PublicCourseClassTimings,
  PublicCourseFeaturedAlumni,
  PublicCourseFlexibleExitOptions,
  PublicCourseHigherEducationCertifications,
  PublicCourseHighlights,
  PublicCourseKeyDates,
  PublicCourseSimpleNameList,
  PublicCourseStructure,
  PublicCourseStudentForum,
  PublicCourseValueAddedCourses,
} from "@beaconu/types";

export function HighlightsBlock({
  highlights,
}: {
  highlights: PublicCourseHighlights;
}) {
  const items = highlights.items ?? [];
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h2 className="text-xl font-bold tracking-tight">
        {highlights.title || "Highlights"}
      </h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-2.5 rounded-2xl border border-border/60 p-4"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-foreground/70" />
            <p className="text-sm">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function AccreditationsBlock({
  accreditations,
}: {
  accreditations: PublicCourseAccreditations;
}) {
  const items = accreditations.items ?? [];
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h2 className="text-xl font-bold tracking-tight">
        {accreditations.title || "Accreditations"}
      </h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-2xl border border-border/60 p-4"
          >
            {item.image ? (
              <Image
                src={item.image}
                alt={item.title ?? "Accreditation"}
                width={36}
                height={36}
                className="h-9 w-9 shrink-0 rounded-lg object-contain"
              />
            ) : null}
            <div className="min-w-0">
              {item.tag ? (
                <p className="truncate text-xs uppercase tracking-wide text-muted-foreground">
                  {item.tag}
                </p>
              ) : null}
              <p className="truncate text-sm font-medium">{item.title}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const KEY_DATE_STATUS_STYLES: Record<string, string> = {
  urgent: "border-destructive/40 text-destructive",
  active: "border-foreground/40",
  inactive: "border-border/60 text-muted-foreground/60",
};

export function KeyDatesBlock({
  keyDates,
}: {
  keyDates: PublicCourseKeyDates;
}) {
  const items = keyDates.items ?? [];
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h2 className="text-xl font-bold tracking-tight">
        {keyDates.title || "Key Dates"}
      </h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <div
            key={i}
            className={cn(
              "rounded-2xl border p-4",
              item.status
                ? KEY_DATE_STATUS_STYLES[item.status]
                : "border-border/60",
            )}
          >
            <p className="text-sm font-semibold">{item.date}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CourseStructureBlock({
  structure,
}: {
  structure: PublicCourseStructure;
}) {
  const segments = structure.segments ?? [];
  if (segments.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h2 className="text-xl font-bold tracking-tight">
        {structure.title || "Course Structure"}
      </h2>
      {structure.subtitle ? (
        <p className="mt-1 text-sm text-muted-foreground">
          {structure.subtitle}
        </p>
      ) : null}
      <div className="mt-5 space-y-2">
        {segments.map((segment, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 p-4"
          >
            <div>
              <p className="text-sm font-medium">{segment.label}</p>
              {segment.details ? (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {segment.details}
                </p>
              ) : null}
            </div>
            {typeof segment.credits === "number" ? (
              <Badge variant="secondary">{segment.credits} credits</Badge>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export function ValueAddedCoursesBlock({
  value,
}: {
  value: PublicCourseValueAddedCourses;
}) {
  const items = value.items ?? [];
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h2 className="text-xl font-bold tracking-tight">
        {value.title || "Value Added Courses"}
      </h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-2xl border border-border/60 p-4">
            <p className="text-sm font-medium">{item.name}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {item.credit_label ? <span>{item.credit_label}</span> : null}
              {item.delivery_mode_label ? (
                <span>· {item.delivery_mode_label}</span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CareerOpportunitiesBlock({
  career,
}: {
  career: PublicCourseCareerOpportunities;
}) {
  const items = career.items ?? [];
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h2 className="text-xl font-bold tracking-tight">
        {career.title || "Career Opportunities"}
      </h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 p-4"
          >
            <p className="text-sm font-medium">{item.role}</p>
            <span className="text-sm text-muted-foreground">
              {item.salary_range}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function HigherEducationCertificationsBlock({
  certs,
}: {
  certs: PublicCourseHigherEducationCertifications;
}) {
  const groups = [certs.global, certs.postgraduation].filter(
    (g): g is NonNullable<typeof g> => Boolean(g && (g.items?.length ?? 0) > 0),
  );
  if (groups.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h2 className="text-xl font-bold tracking-tight">
        Higher Education & Certifications
      </h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {groups.map((group, i) => (
          <div key={i} className="rounded-2xl border border-border/60 p-5">
            <p className="text-sm font-semibold">{group.title}</p>
            <ul className="mt-3 space-y-1.5">
              {group.items?.map((item, j) => (
                <li key={j} className="text-sm text-muted-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FlexibleExitOptionsBlock({
  exit,
}: {
  exit: PublicCourseFlexibleExitOptions;
}) {
  const items = exit.items ?? [];
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h2 className="text-xl font-bold tracking-tight">
        {exit.title || "Flexible Exit Options"}
      </h2>
      {exit.subtitle ? (
        <p className="mt-1 text-sm text-muted-foreground">{exit.subtitle}</p>
      ) : null}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-2xl border border-border/60 p-4">
            <p className="text-sm font-medium">{item.title}</p>
            {item.description ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {item.description}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export function ClassTimingsBlock({
  timings,
}: {
  timings: PublicCourseClassTimings;
}) {
  const schedule = timings.schedule ?? [];
  if (schedule.length === 0) return null;

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h2 className="text-xl font-bold tracking-tight">
        {timings.title || "Class Timings"}
      </h2>
      {timings.subtitle ? (
        <p className="mt-1 text-sm text-muted-foreground">{timings.subtitle}</p>
      ) : null}
      <div className="mt-5 divide-y divide-border/60 rounded-2xl border border-border/60">
        {schedule.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between px-5 py-3 text-sm"
          >
            <span className="font-medium">{item.day}</span>
            <span className="text-muted-foreground">{item.time}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SimpleNameListBlock({
  list,
}: {
  list: PublicCourseSimpleNameList;
}) {
  const items = list.items ?? [];
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h2 className="text-xl font-bold tracking-tight">{list.title}</h2>
      <div className="mt-5 flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span
            key={i}
            className="rounded-full border border-border/60 px-3.5 py-1.5 text-sm"
          >
            {item.name}
          </span>
        ))}
      </div>
    </section>
  );
}

export function FeaturedAlumniBlock({
  alumni,
}: {
  alumni: PublicCourseFeaturedAlumni;
}) {
  const items = alumni.items ?? [];
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
        <Sparkles className="h-5 w-5" />
        {alumni.title || "Featured Alumni"}
      </h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-2xl border border-border/60 p-5">
            <div className="flex items-center gap-3">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name ?? "Alumni"}
                  width={44}
                  height={44}
                  className="h-11 w-11 shrink-0 rounded-full object-cover"
                />
              ) : null}
              <div>
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.designation}
                </p>
              </div>
            </div>
            {(item.career_progression?.length ?? 0) > 0 ? (
              <ul className="mt-3 space-y-1.5 border-t border-border/60 pt-3">
                {item.career_progression?.map((step, j) => (
                  <li key={j} className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {step.year}
                    </span>{" "}
                    — {step.description}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

export function StudentForumBlock({
  forum,
}: {
  forum: PublicCourseStudentForum;
}) {
  if (!forum.enabled || !forum.link) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <a
        href={forum.link}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 p-6 hover:border-foreground/30"
      >
        <div className="flex items-center gap-3">
          <MessageCircle className="h-6 w-6" />
          <div>
            <p className="text-sm font-semibold">{forum.title}</p>
            {forum.description ? (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {forum.description}
              </p>
            ) : null}
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-medium">
          {forum.cta_label || "Join"} <ExternalLink className="h-3.5 w-3.5" />
        </span>
      </a>
    </section>
  );
}

export function CertificationsBlock({
  certifications,
}: {
  certifications: PublicCourseCertificationsBlock;
}) {
  const items = certifications.items ?? [];
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h2 className="text-xl font-bold tracking-tight">
        {certifications.title || "Certifications"}
      </h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-2xl border border-border/60 p-5">
            {item.tag ? <Badge variant="secondary">{item.tag}</Badge> : null}
            <p className="mt-2 text-sm font-medium">{item.title}</p>
            {item.description ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {item.description}
              </p>
            ) : null}
            {item.link ? (
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium hover:underline"
              >
                {item.cta_label || "Learn more"}{" "}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
