"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ListChecks } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePendingShortlist } from "@/hooks/use-applications";

const STAGE_LABEL: Record<string, string> = {
  submitted: "Submitted",
  assessment_completed: "Assessment Completed",
  interview_completed: "Interview Completed",
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function PendingShortlistPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const { data, isLoading } = usePendingShortlist(search || undefined);
  const items = data ?? [];

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-5">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <ListChecks className="h-6 w-6 text-primary" />
          Pending Shortlisting
        </h1>
        <p className="text-sm text-muted-foreground">
          Applicants who have reached the point in their cycle where they can be
          shortlisted — no assessment/interview left to wait on.
        </p>
      </div>

      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by student name or application #"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
                <TableHead className="py-4">Current Stage</TableHead>
                <TableHead className="py-4">Reached On</TableHead>
                <TableHead className="w-[140px] py-4 pr-6 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b last:border-0">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j} className="py-4">
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-20 text-center text-muted-foreground"
                  >
                    No applicants are currently pending shortlisting.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow
                    key={item.applicationCourseId}
                    className="cursor-pointer border-b last:border-0 transition-colors hover:bg-muted/30"
                    onClick={() =>
                      router.push(
                        `/pending-shortlist/${item.applicationCourseId}`,
                      )
                    }
                  >
                    <TableCell className="py-4 pl-6">
                      <p className="text-sm font-medium">{item.studentName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.studentEmail ?? "—"}
                      </p>
                    </TableCell>
                    <TableCell className="py-4">
                      <p className="text-sm font-medium">{item.courseName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.courseCode}
                        {item.isPrimary ? " · Primary" : ""}
                      </p>
                    </TableCell>
                    <TableCell className="py-4 text-sm">
                      {item.admissionCycleName}
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant="secondary">
                        {STAGE_LABEL[item.currentStage] ?? item.currentStage}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 text-sm text-muted-foreground">
                      {formatDate(item.statusUpdatedAt)}
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(
                            `/pending-shortlist/${item.applicationCourseId}`,
                          );
                        }}
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
