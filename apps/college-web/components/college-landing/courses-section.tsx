import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { PublicCourseListItem } from "@beaconu/types";

interface CoursesSectionProps {
  courses: PublicCourseListItem[];
  subdomain: string;
}

export function CoursesSection({ courses, subdomain }: CoursesSectionProps) {
  if (courses.length === 0) return null;

  return (
    <section id="courses" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Courses & Programs
        </h2>
        <Badge variant="outline">{courses.length} programs</Badge>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/college/${subdomain}/courses/${course.id}`}
            className="flex flex-col rounded-2xl border border-border/60 p-5 transition-colors hover:border-foreground/30"
          >
            <div className="flex items-center justify-between gap-2">
              <Badge variant="secondary">
                {course.studyLevel?.name ?? "Program"}
              </Badge>
              {course.duration ? (
                <span className="text-xs text-muted-foreground">
                  {course.duration}
                </span>
              ) : null}
            </div>

            <h3 className="mt-3.5 min-h-[2.75rem] text-sm font-semibold leading-snug">
              {course.name}
            </h3>

            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>{course.code}</span>
              <span>{course.discipline?.name ?? "General"}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
