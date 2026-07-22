"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TAB_LABELS: Record<string, string> = {
  course_info: "Course Info",
  admission_policy: "Admission Policy",
  placements: "Placements",
  fees: "Fees",
  financial_aid: "Financial Aid",
  student_housing: "Student Housing",
  exam_policy: "Exam Policy",
  faculty: "Faculty",
  review: "Reviews",
  library: "Library",
  clubs_associations: "Clubs & Associations",
  alliance: "Alliance",
  other_courses_offered: "Other Courses Offered",
  demo_graphics: "Demographics",
};

// tabId (snake_case, from the API) -> URL path segment (kebab-case route
// folder name). Kept explicit rather than deriving one from the other so a
// route rename can't silently produce a dead nav link.
const TAB_PATHS: Record<string, string> = {
  admission_policy: "admission-policy",
  placements: "placements",
  fees: "fees",
  financial_aid: "financial-aid",
  student_housing: "student-housing",
  exam_policy: "exam-policy",
  faculty: "faculty",
  review: "reviews",
  library: "library",
  clubs_associations: "clubs-associations",
  alliance: "alliance",
  other_courses_offered: "other-courses-offered",
  demo_graphics: "demo-graphics",
};

// Tabs get added here as each one is built — unhandled tabs render as
// plain (non-clickable) text instead of a link, so we never ship a dead link.
const IMPLEMENTED_TABS = new Set([
  "course_info",
  "admission_policy",
  "fees",
  "financial_aid",
  "exam_policy",
  "demo_graphics",
  "placements",
  "faculty",
  "review",
  "student_housing",
  "library",
  "clubs_associations",
  "alliance",
  "other_courses_offered",
]);

interface CourseTabNavProps {
  tabs: string[];
  basePath: string;
}

export function CourseTabNav({ tabs, basePath }: CourseTabNavProps) {
  const pathname = usePathname();

  if (tabs.length === 0) return null;

  return (
    <div className="sticky top-16 z-40 border-y border-border/60 bg-background/85 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl gap-6 overflow-x-auto px-4 sm:px-6">
        {tabs.map((tabId) => {
          const label = TAB_LABELS[tabId] ?? tabId;
          const href =
            tabId === "course_info"
              ? basePath
              : `${basePath}/${TAB_PATHS[tabId] ?? tabId}`;
          const isActive = pathname === href;
          const isImplemented = IMPLEMENTED_TABS.has(tabId);

          if (!isImplemented) {
            return (
              <span
                key={tabId}
                className="whitespace-nowrap py-3.5 text-sm text-muted-foreground/40"
              >
                {label}
              </span>
            );
          }

          return (
            <Link
              key={tabId}
              href={href}
              className={cn(
                "whitespace-nowrap border-b-2 py-3.5 text-sm transition-colors",
                isActive
                  ? "border-foreground font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
