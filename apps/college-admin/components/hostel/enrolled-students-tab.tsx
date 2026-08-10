"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useCollegeHostelEnrollments } from "@/hooks/use-facilities";
import { EnrollmentDetailDialog } from "./enrollment-detail-dialog";
import type { HostelRoomTypeDto } from "@/lib/services/colleges.service";

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  active: "default",
  inactive: "secondary",
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function EnrolledStudentsTab({
  hostelId,
  roomTypes,
}: {
  hostelId: string;
  roomTypes: HostelRoomTypeDto[];
}) {
  const [search, setSearch] = useState("");
  const [roomTypeId, setRoomTypeId] = useState<string>("all");
  const [status, setStatus] = useState<string>("active");
  const [page, setPage] = useState(1);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<
    string | null
  >(null);
  const limit = 20;

  const { data, isLoading } = useCollegeHostelEnrollments({
    hostel_id: hostelId,
    search: search || undefined,
    room_type_id: roomTypeId === "all" ? undefined : roomTypeId,
    status: status === "all" ? undefined : status,
    page,
    limit,
  });

  const enrollments = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by student name, email, or phone"
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={roomTypeId}
          onValueChange={(v) => {
            setRoomTypeId(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="All Room Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Room Types</SelectItem>
            {roomTypes.map((rt) => (
              <SelectItem key={rt.id} value={rt.id}>
                {rt.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Room Type</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Mess Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Enrolled From</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : enrollments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No students have enrolled in this hostel yet.
                </TableCell>
              </TableRow>
            ) : (
              enrollments.map((enrollment) => (
                <TableRow
                  key={enrollment.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedEnrollmentId(enrollment.id)}
                >
                  <TableCell>
                    <div className="font-medium">
                      {enrollment.student.fullName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {enrollment.student.email ??
                        enrollment.student.phoneNumber ??
                        "—"}
                    </div>
                  </TableCell>
                  <TableCell>{enrollment.roomType.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{enrollment.roomPlanType}</Badge>
                  </TableCell>
                  <TableCell>
                    {enrollment.messPlan ? enrollment.messPlan.name : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={STATUS_VARIANTS[enrollment.status] ?? "outline"}
                    >
                      {enrollment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(enrollment.enrolledFrom)}
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

      <EnrollmentDetailDialog
        enrollmentId={selectedEnrollmentId}
        onClose={() => setSelectedEnrollmentId(null)}
      />
    </div>
  );
}
