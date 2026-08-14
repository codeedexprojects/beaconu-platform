"use client";

import { useState } from "react";
import { Search, UserCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getErrorMessage } from "@/lib/api";
import {
  usePendingEnrollments,
  useEnrollPendingCourse,
} from "@/hooks/use-applications";
import type { PendingEnrollmentItem } from "@beaconu/types";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function PendingEnrollmentPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = usePendingEnrollments({
    search: search || undefined,
    page,
    limit,
  });
  const { mutate: enroll, isPending: isEnrolling } = useEnrollPendingCourse();

  const [enrollTarget, setEnrollTarget] =
    useState<PendingEnrollmentItem | null>(null);

  const requests = data?.requests ?? [];
  const meta = data?.meta;

  function confirmEnroll() {
    if (!enrollTarget) return;
    enroll(enrollTarget.applicationCourseId, {
      onSuccess: () => {
        toast.success(`"${enrollTarget.studentName}" enrolled`);
        setEnrollTarget(null);
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <UserCheck className="h-6 w-6 text-primary" />
            Pending Enrollment
          </h1>
          <p className="text-sm text-muted-foreground">
            Students whose token fee is paid and are ready to be enrolled.
          </p>
        </div>
      </div>

      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by student name, email, or application #"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-xl border shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="py-4 pl-6">Student</TableHead>
                <TableHead className="py-4">Course</TableHead>
                <TableHead className="py-4">Admission Cycle</TableHead>
                <TableHead className="py-4">Application Fee</TableHead>
                <TableHead className="py-4">Token Amount</TableHead>
                <TableHead className="py-4">Token Paid On</TableHead>
                <TableHead className="w-[160px] py-4 pr-6 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b last:border-0">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <TableCell key={j} className="py-4">
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-20 text-center text-muted-foreground"
                  >
                    No students are currently pending enrollment.
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((r) => (
                  <TableRow
                    key={r.applicationCourseId}
                    className="border-b last:border-0 transition-colors hover:bg-muted/30"
                  >
                    <TableCell className="py-4 pl-6">
                      <p className="text-sm font-medium">{r.studentName}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.studentEmail ?? "—"}
                      </p>
                    </TableCell>
                    <TableCell className="py-4">
                      <p className="text-sm font-medium">{r.courseName}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.courseCode}
                        {r.isPrimary ? " · Primary" : ""}
                      </p>
                    </TableCell>
                    <TableCell className="py-4 text-sm">
                      {r.admissionCycleName}
                    </TableCell>
                    <TableCell className="py-4 text-sm">
                      ₹{r.applicationFee}
                    </TableCell>
                    <TableCell className="py-4 text-sm">
                      {r.tokenAmount ? `₹${r.tokenAmount}` : "—"}
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      {formatDate(r.statusUpdatedAt)}
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right">
                      <Button
                        size="sm"
                        onClick={() => setEnrollTarget(r)}
                        disabled={isEnrolling}
                      >
                        Mark Enrolled
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {meta.page} of {meta.totalPages} · {meta.total} total
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasPreviousPage}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={enrollTarget !== null}
        title="Mark Enrolled"
        description={
          enrollTarget
            ? `Enroll "${enrollTarget.studentName}" into "${enrollTarget.courseName}"? This decrements the course's quota seat count and cannot be undone.`
            : ""
        }
        confirmLabel="Enroll"
        loading={isEnrolling}
        onCancel={() => setEnrollTarget(null)}
        onConfirm={confirmEnroll}
      />
    </div>
  );
}
