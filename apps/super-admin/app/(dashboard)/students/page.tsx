"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Search,
  GraduationCap,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useStudents, useUpdateStudentStatus } from "@/hooks/use-students";
import { getErrorMessage } from "@/lib/api";
import type {
  AdminStudentListItem,
  StudentAccountStatus,
} from "@beaconu/types";

const STATUS_VARIANT: Record<string, "success" | "secondary" | "destructive"> =
  {
    active: "success",
    suspended: "destructive",
    inactive: "secondary",
  };

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useStudents({
    search: search || undefined,
    status:
      statusFilter === "all"
        ? undefined
        : (statusFilter as StudentAccountStatus),
    page,
    limit: 20,
  });
  const students = data?.data ?? [];
  const meta = data?.meta;

  const updateStatusMutation = useUpdateStudentStatus();
  const [statusTarget, setStatusTarget] = useState<{
    student: AdminStudentListItem;
    nextStatus: StudentAccountStatus;
  } | null>(null);

  function handleToggleClick(student: AdminStudentListItem) {
    setStatusTarget({
      student,
      nextStatus: student.status === "suspended" ? "active" : "suspended",
    });
  }

  function confirmStatusChange() {
    if (!statusTarget) return;
    updateStatusMutation.mutate(
      {
        id: statusTarget.student.id,
        data: { status: statusTarget.nextStatus },
      },
      {
        onSuccess: () => {
          toast.success(
            statusTarget.nextStatus === "suspended"
              ? `"${statusTarget.student.fullName}" suspended`
              : `"${statusTarget.student.fullName}" activated`,
          );
          setStatusTarget(null);
        },
      },
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Students"
        description="View and manage all registered students across the platform"
      />

      <div className="flex-1 space-y-4 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 bg-background"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[160px] bg-background">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {meta && (
            <Badge variant="info" className="px-3 py-1 gap-1.5">
              {meta.total} Students
            </Badge>
          )}
        </div>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground font-medium">
                  Loading students...
                </p>
              </div>
            ) : error ? (
              <div className="py-20 text-center text-sm text-destructive">
                {getErrorMessage(error)}
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-10 text-muted-foreground"
                      >
                        No students found
                      </TableCell>
                    </TableRow>
                  ) : (
                    students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                              <GraduationCap className="h-5 w-5" />
                            </div>
                            <span className="font-medium text-sm">
                              {student.fullName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                            {student.email && (
                              <span className="flex items-center gap-1.5">
                                <Mail className="h-3 w-3" />
                                {student.email}
                              </span>
                            )}
                            {student.phoneNumber && (
                              <span className="flex items-center gap-1.5">
                                <Phone className="h-3 w-3" />
                                {student.phoneCountryCode}
                                {student.phoneNumber}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px]">
                            {student.source}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-xs">
                            {student.isEmailVerified ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                            Email
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              STATUS_VARIANT[student.status] ?? "secondary"
                            }
                          >
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(student.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleClick(student)}
                          >
                            {student.status === "suspended"
                              ? "Activate"
                              : "Suspend"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {students.length} of {meta.total} students
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {meta.page} of {meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={statusTarget !== null}
        title={
          statusTarget?.nextStatus === "suspended"
            ? "Suspend Student"
            : "Activate Student"
        }
        description={
          statusTarget
            ? `${statusTarget.nextStatus === "suspended" ? "Suspend" : "Activate"} "${statusTarget.student.fullName}"'s account?`
            : ""
        }
        confirmLabel={
          statusTarget?.nextStatus === "suspended" ? "Suspend" : "Activate"
        }
        variant={
          statusTarget?.nextStatus === "suspended" ? "destructive" : "default"
        }
        loading={updateStatusMutation.isPending}
        onCancel={() => setStatusTarget(null)}
        onConfirm={confirmStatusChange}
      />
    </div>
  );
}
