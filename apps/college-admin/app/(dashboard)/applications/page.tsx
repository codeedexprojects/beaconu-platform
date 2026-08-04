"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Users } from "lucide-react";

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
import { useApplications } from "@/hooks/use-applications";
import { useAdmissionCycles } from "@/hooks/use-admission-cycles";

const FORM_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
};

const FORM_STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  draft: "secondary",
  submitted: "default",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
};

const PAYMENT_STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  paid: "default",
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ApplicationsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [cycleFilter, setCycleFilter] = useState("");
  const [formStatusFilter, setFormStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data: cycles } = useAdmissionCycles();

  const { data, isLoading } = useApplications({
    search: search || undefined,
    admission_cycle_id: cycleFilter || undefined,
    form_status: formStatusFilter || undefined,
    fee_payment_status: paymentStatusFilter || undefined,
    page,
    limit: 20,
  });

  const applications = data?.applications ?? [];
  const meta = data?.meta;

  const hasFilters =
    search || cycleFilter || formStatusFilter || paymentStatusFilter;

  function clearFilters() {
    setSearch("");
    setCycleFilter("");
    setFormStatusFilter("");
    setPaymentStatusFilter("");
    setPage(1);
  }

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Applications</h1>
          <p className="text-sm text-muted-foreground">
            Every student application submitted at your college
          </p>
        </div>
        {meta && (
          <div className="flex items-center gap-1.5 rounded-md border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{meta.total} total applications</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name, email, application #..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="h-9 pl-9"
          />
        </div>

        <Select
          value={cycleFilter}
          onValueChange={(v) => {
            setCycleFilter(v === "all" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-9 w-56">
            <SelectValue placeholder="All admission cycles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All admission cycles</SelectItem>
            {(cycles ?? []).map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={formStatusFilter}
          onValueChange={(v) => {
            setFormStatusFilter(v === "all" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-9 w-44">
            <SelectValue placeholder="All form statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All form statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={paymentStatusFilter}
          onValueChange={(v) => {
            setPaymentStatusFilter(v === "all" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-9 w-44">
            <SelectValue placeholder="All payment statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payment statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-hidden rounded-xl border shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-[160px] py-4 pl-6 text-xs font-semibold uppercase tracking-wide">
                  Application #
                </TableHead>
                <TableHead className="w-[220px] py-4 text-xs font-semibold uppercase tracking-wide">
                  Student
                </TableHead>
                <TableHead className="w-[220px] py-4 text-xs font-semibold uppercase tracking-wide">
                  Course(s)
                </TableHead>
                <TableHead className="w-[180px] py-4 text-xs font-semibold uppercase tracking-wide">
                  Admission Cycle
                </TableHead>
                <TableHead className="w-[120px] py-4 text-xs font-semibold uppercase tracking-wide">
                  Form Status
                </TableHead>
                <TableHead className="w-[120px] py-4 text-xs font-semibold uppercase tracking-wide">
                  Payment
                </TableHead>
                <TableHead className="w-[140px] py-4 pr-6 text-xs font-semibold uppercase tracking-wide">
                  Submitted
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="border-b last:border-0">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <TableCell key={j} className="py-4">
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : applications.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-20 text-center text-muted-foreground"
                  >
                    No applications found.
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((app) => {
                  const primaryCourse =
                    app.courses.find((c) => c.isPrimary) ?? app.courses[0];
                  const extraCount = Math.max(app.courses.length - 1, 0);
                  return (
                    <TableRow
                      key={app.id}
                      className="cursor-pointer border-b last:border-0 transition-colors hover:bg-muted/30"
                      onClick={() => router.push(`/applications/${app.id}`)}
                    >
                      <TableCell className="py-4 pl-6 font-mono text-xs">
                        {app.applicationNumber}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-0.5">
                          <p className="font-medium leading-snug">
                            {app.studentName}
                          </p>
                          {app.studentEmail && (
                            <p className="max-w-[200px] truncate text-xs text-muted-foreground">
                              {app.studentEmail}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-sm">
                        {primaryCourse ? (
                          <div className="space-y-0.5">
                            <p className="font-medium">
                              {primaryCourse.courseName}
                            </p>
                            {extraCount > 0 && (
                              <p className="text-xs text-muted-foreground">
                                +{extraCount} more
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4 text-sm">
                        {app.admissionCycleName}
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge
                          variant={
                            FORM_STATUS_VARIANTS[app.formStatus] ?? "secondary"
                          }
                        >
                          {FORM_STATUS_LABELS[app.formStatus] ?? app.formStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge
                          variant={
                            PAYMENT_STATUS_VARIANTS[app.feePaymentStatus] ??
                            "secondary"
                          }
                        >
                          {PAYMENT_STATUS_LABELS[app.feePaymentStatus] ??
                            app.feePaymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 pr-6 text-sm text-muted-foreground">
                        {formatDate(app.submittedAt)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {meta && meta.total > 20 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {meta.page} of {Math.ceil(meta.total / 20)} · {meta.total}{" "}
            total
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!meta.hasNext}
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
