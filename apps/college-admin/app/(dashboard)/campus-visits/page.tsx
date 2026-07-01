"use client";

import { useState } from "react";
import { Calendar, Clock, Users } from "lucide-react";

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
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campus Visits</h1>
          <p className="text-sm text-muted-foreground">
            All scheduled visits across your campus
          </p>
        </div>
        {meta && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {meta.total} total visits
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v === "all" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44">
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
          className="w-44"
        />

        <Select
          value={ambassadorFilter}
          onValueChange={(v) => {
            setAmbassadorFilter(v === "all" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-52">
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
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Visitor</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Ambassador</TableHead>
              <TableHead>Date &amp; Time</TableHead>
              <TableHead>Guests</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : visits.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-muted-foreground"
                >
                  No campus visits found.
                </TableCell>
              </TableRow>
            ) : (
              visits.map((visit) => (
                <TableRow key={visit.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{visit.studentName}</p>
                      {visit.reasonForVisit && (
                        <p className="max-w-xs truncate text-xs text-muted-foreground">
                          {visit.reasonForVisit}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {visit.email && <p>{visit.email}</p>}
                      {visit.phoneNumber && (
                        <p className="text-muted-foreground">
                          {visit.phoneNumber}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {visit.ambassador ? (
                      <div>
                        <p>{visit.ambassador.fullName}</p>
                        {visit.ambassador.campusCode && (
                          <p className="text-xs text-muted-foreground">
                            {visit.ambassador.campusCode}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {formatDate(visit.proposedDate)}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {visit.proposedTime}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {visit.additionalVisitorsCount > 0
                      ? `+${visit.additionalVisitorsCount}`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[visit.status]}>
                      {STATUS_LABELS[visit.status]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {meta && meta.total > 20 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {meta.page} · {meta.total} total
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
