"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Clock, ExternalLink, Users } from "lucide-react";

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
import { useCollegeCampusVisits } from "@/hooks/use-campus-visits";
import { useAmbassadors } from "@/hooks/use-ambassadors";
import type { CampusVisitStatus } from "@beaconu/types";

const STATUS_LABELS: Record<CampusVisitStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  reassigned: "Reassigned",
  rejected: "Rejected",
};

const STATUS_VARIANTS: Record<
  CampusVisitStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  confirmed: "default",
  completed: "outline",
  cancelled: "destructive",
  reassigned: "secondary",
  rejected: "destructive",
};

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00Z").toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function CampusVisitsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [ambassadorFilter, setAmbassadorFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data: ambassadorsData } = useAmbassadors();
  const ambassadors = ambassadorsData ?? [];

  const { data, isLoading } = useCollegeCampusVisits({
    status: statusFilter || undefined,
    date: dateFilter || undefined,
    ambassador_id: ambassadorFilter || undefined,
    page,
    limit: 20,
  });

  const visits = data?.visits ?? [];
  const meta = data?.meta;

  const hasFilters = statusFilter || dateFilter || ambassadorFilter;

  function clearFilters() {
    setStatusFilter("");
    setDateFilter("");
    setAmbassadorFilter("");
    setPage(1);
  }

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campus Visits</h1>
          <p className="text-sm text-muted-foreground">
            All scheduled visits across your campus
          </p>
        </div>
        {meta && (
          <div className="flex items-center gap-1.5 rounded-md border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{meta.total} total visits</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v === "all" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-9 w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="reassigned">Reassigned</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value);
            setPage(1);
          }}
          className="h-9 w-44"
        />

        <Select
          value={ambassadorFilter}
          onValueChange={(v) => {
            setAmbassadorFilter(v === "all" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-9 w-56">
            <SelectValue placeholder="All ambassadors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ambassadors</SelectItem>
            {ambassadors.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.fullName}
                {a.campusCode ? ` · ${a.campusCode}` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden rounded-xl border shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-[220px] py-4 pl-6 text-xs font-semibold uppercase tracking-wide">
                  Visitor
                </TableHead>
                <TableHead className="w-[200px] py-4 text-xs font-semibold uppercase tracking-wide">
                  Contact
                </TableHead>
                <TableHead className="w-[180px] py-4 text-xs font-semibold uppercase tracking-wide">
                  Ambassador
                </TableHead>
                <TableHead className="w-[180px] py-4 text-xs font-semibold uppercase tracking-wide">
                  Date &amp; Time
                </TableHead>
                <TableHead className="w-[100px] py-4 text-xs font-semibold uppercase tracking-wide">
                  Guests
                </TableHead>
                <TableHead className="w-[120px] py-4 text-xs font-semibold uppercase tracking-wide">
                  Status
                </TableHead>
                <TableHead className="w-[80px] py-4 pr-6" />
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
              ) : visits.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-20 text-center text-muted-foreground"
                  >
                    No campus visits found.
                  </TableCell>
                </TableRow>
              ) : (
                visits.map((visit) => (
                  <TableRow
                    key={visit.id}
                    className="border-b last:border-0 transition-colors hover:bg-muted/30"
                  >
                    <TableCell className="py-4 pl-6">
                      <div className="space-y-0.5">
                        <p className="font-medium leading-snug">
                          {visit.studentName}
                        </p>
                        {visit.reasonForVisit && (
                          <p className="max-w-[200px] truncate text-xs text-muted-foreground">
                            {visit.reasonForVisit}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="space-y-0.5 text-sm">
                        {visit.email && (
                          <p className="truncate max-w-[180px]">
                            {visit.email}
                          </p>
                        )}
                        {visit.phoneNumber && (
                          <p className="text-muted-foreground">
                            {visit.phoneNumber}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-sm">
                      {visit.ambassador ? (
                        <div className="space-y-0.5">
                          <p className="font-medium">
                            {visit.ambassador.fullName}
                          </p>
                          {visit.ambassador.campusCode && (
                            <p className="text-xs text-muted-foreground">
                              {visit.ambassador.campusCode}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          Unassigned
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col gap-1 text-sm">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          {formatDate(visit.proposedDate)}
                        </span>
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {visit.proposedTime}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-sm">
                      {visit.additionalVisitorsCount > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                          <Users className="h-3 w-3" />+
                          {visit.additionalVisitorsCount}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant={STATUS_VARIANTS[visit.status]}>
                        {STATUS_LABELS[visit.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 text-xs"
                        asChild
                      >
                        <Link href={`/campus-visits/${visit.id}`}>
                          <ExternalLink className="h-3.5 w-3.5" />
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
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
