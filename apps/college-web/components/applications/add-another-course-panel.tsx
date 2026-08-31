"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useAddApplicationCourse,
  useCourseCatalogue,
} from "@/hooks/use-application";

interface AddAnotherCoursePanelProps {
  applicationId: string;
  cycleId: string;
  existingCourseIds: string[];
}

const inputCls =
  "h-11 w-full rounded-xl border-0 bg-field px-3.5 text-sm outline-none transition-colors focus:bg-field-focus focus-visible:ring-2 focus-visible:ring-headerTeal/40";

export function AddAnotherCoursePanel({
  applicationId,
  cycleId,
  existingCourseIds,
}: AddAnotherCoursePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: courses, isLoading } = useCourseCatalogue(
    cycleId,
    search || undefined,
    isOpen,
  );
  const { mutate: addCourse, isPending } =
    useAddApplicationCourse(applicationId);

  const availableCourses = (courses ?? []).filter(
    (course) => !existingCourseIds.includes(course.courseId),
  );

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex h-14 w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-headerTeal/40 text-sm font-medium text-headerTeal-dark hover:bg-headerTeal/5"
      >
        <Plus className="h-4 w-4" />
        Add Another Course
      </button>
    );
  }

  return (
    <div className="rounded-2xl bg-groupBg p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Add Another Course</p>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>

      <input
        className={cn(inputCls, "mt-3")}
        placeholder="Search courses..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="mt-2 max-h-56 space-y-2 overflow-y-auto">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading courses…</p>
        ) : availableCourses.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No more courses available.
          </p>
        ) : (
          availableCourses.map((course) => (
            <div
              key={course.courseId}
              className="flex items-center justify-between rounded-xl bg-background p-3 text-sm"
            >
              <span>
                <span className="font-medium">{course.courseName}</span>
                <span className="ml-1.5 text-muted-foreground">
                  ({course.courseCode})
                </span>
              </span>
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  addCourse(
                    { course_id: course.courseId },
                    {
                      onSuccess: () => {
                        toast.success("Course added");
                        setIsOpen(false);
                        setSearch("");
                      },
                    },
                  )
                }
                className="flex h-8 items-center gap-1 rounded-full bg-headerTeal-dark px-3 text-xs font-medium text-white disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : null}
                Add
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
