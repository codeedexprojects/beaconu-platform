import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, GraduationCap } from "lucide-react";
import type { PublicCourseListItem } from "@beaconu/types";

interface CoursesSectionProps {
  courses: PublicCourseListItem[];
  subdomain: string;
}

export function CoursesSection({ courses, subdomain }: CoursesSectionProps) {
  if (courses.length === 0) return null;

  const featured = courses.slice(0, 8);

  return (
    <section id="courses" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-headerTeal">
            <span className="h-px w-6 bg-headerTeal" />
            Academics
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Featured Programmes
          </h2>
        </div>
        <Link
          href={`/college/${subdomain}#courses`}
          className="flex items-center gap-1 text-sm font-medium text-headerTeal hover:text-headerTeal-dark"
        >
          View All Programmes
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="no-scrollbar mt-8 flex gap-5 overflow-x-auto pb-2">
        {featured.map((course) => (
          <Link
            key={course.id}
            href={`/college/${subdomain}/courses/${course.id}`}
            className="flex w-80 shrink-0 flex-col overflow-hidden rounded-2xl border border-border/60 bg-white transition-colors hover:border-foreground/30"
          >
            <div className="relative h-48 w-full border-b-4 border-headerTeal-dark bg-muted">
              {course.coverImageUrl ? (
                <Image
                  src={course.coverImageUrl}
                  alt={course.name}
                  fill
                  sizes="320px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/60">
                  <GraduationCap className="h-12 w-12 text-muted-foreground/40" />
                </div>
              )}
            </div>
            <div className="p-5">
              <h3 className="min-h-[2.75rem] text-base font-semibold leading-snug">
                {course.name}
              </h3>
              <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-sm font-medium text-headerTeal">
                View Course Details
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
