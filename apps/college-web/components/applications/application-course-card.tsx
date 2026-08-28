"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Lock, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useChangeCourseQuota,
  useWithdrawApplicationCourse,
} from "@/hooks/use-application";
import type { ApplicationPaymentSummaryCourse } from "@beaconu/types";

interface ApplicationCourseCardProps {
  applicationId: string;
  course: ApplicationPaymentSummaryCourse;
  isLocked: boolean;
  canWithdraw: boolean;
}

export function ApplicationCourseCard({
  applicationId,
  course,
  isLocked,
  canWithdraw,
}: ApplicationCourseCardProps) {
  const [pendingQuotaId, setPendingQuotaId] = useState<string | null>(null);
  const { mutate: changeQuota, isPending: isChangingQuota } =
    useChangeCourseQuota(applicationId);
  const { mutate: withdraw, isPending: isWithdrawing } =
    useWithdrawApplicationCourse(applicationId);

  const selectedQuotaSeatId = course.selectedQuota?.courseQuotaSeatId ?? null;

  function handleSelectQuota(courseQuotaSeatId: string) {
    if (isLocked || selectedQuotaSeatId === courseQuotaSeatId) return;
    setPendingQuotaId(courseQuotaSeatId);
    changeQuota(
      {
        appCourseId: course.applicationCourseId,
        input: { course_quota_seat_id: courseQuotaSeatId },
      },
      {
        onSuccess: () => {
          toast.success("Quota updated");
        },
        onSettled: () => setPendingQuotaId(null),
      },
    );
  }

  return (
    <div className="rounded-2xl bg-field p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-headerTeal-dark">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Already Selected
        </div>
        {isLocked ? (
          <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : canWithdraw ? (
          <button
            type="button"
            disabled={isWithdrawing}
            onClick={() =>
              withdraw(course.applicationCourseId, {
                onSuccess: () => toast.success("Course removed"),
              })
            }
            className="text-muted-foreground hover:text-destructive disabled:opacity-50"
            aria-label="Remove course"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <p className="mt-2 font-semibold">{course.courseName}</p>
      <p className="text-sm text-muted-foreground">
        {course.courseCode}
        {course.isPrimary ? " · Primary" : ""}
      </p>

      <p className="mt-3 text-xs font-medium text-muted-foreground">
        Select Quota
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {course.quotaOptions.map((quota) => {
          const isSelected = selectedQuotaSeatId === quota.courseQuotaSeatId;
          const isPending =
            isChangingQuota && pendingQuotaId === quota.courseQuotaSeatId;
          return (
            <button
              key={quota.courseQuotaSeatId}
              type="button"
              disabled={isLocked || isChangingQuota}
              onClick={() => handleSelectQuota(quota.courseQuotaSeatId)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed",
                isSelected
                  ? "bg-headerTeal-dark text-white"
                  : "bg-background text-foreground hover:bg-field-focus",
                isPending && "opacity-60",
              )}
            >
              {quota.quotaName}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Application Fee</span>
        <span className="font-semibold">₹{course.applicationFee}</span>
      </div>
    </div>
  );
}
