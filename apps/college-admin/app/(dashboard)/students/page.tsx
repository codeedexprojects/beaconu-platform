"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useEnrolledStudents } from "@/hooks/use-college-students";

const STATUS_BADGE_CLASS: Record<string, string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  on_leave: "bg-amber-50 text-amber-700 border-amber-200",
  suspended: "bg-red-50 text-red-700 border-red-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
  withdrawn: "bg-muted text-muted-foreground",
  course_switched: "bg-purple-50 text-purple-700 border-purple-200",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function EnrolledStudentsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = useEnrolledStudents({
    search: search || undefined,
    page,
    limit,
  });

  const students = data?.students ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Enrolled Students
          </h1>
          <p className="text-sm text-muted-foreground">
            Every student enrolled at this college — click a row for their full
            profile, hostel, commute, and payment history.
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or phone"
          className="pl-9 max-w-md"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Academic Year</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Enrolled On</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No enrolled students yet.
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow
                  key={student.enrollmentId}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/students/${student.id}`)}
                >
                  <TableCell>
                    <div className="font-medium">{student.fullName}</div>
                    <div className="text-xs text-muted-foreground">
                      {student.email ?? student.phoneNumber ?? student.id}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>{student.courseName}</div>
                    <div className="text-xs text-muted-foreground">
                      {student.courseCode}
                    </div>
                  </TableCell>
                  <TableCell>{student.academicYear}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        STATUS_BADGE_CLASS[student.enrollmentStatus] ??
                        "bg-muted text-muted-foreground"
                      }
                    >
                      {student.enrollmentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(student.enrolledAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
    </div>
  );
}
