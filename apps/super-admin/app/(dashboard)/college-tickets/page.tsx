"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Search } from "lucide-react";

import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
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
import { useCollegeTickets } from "@/hooks/use-college-tickets";
import type { PlatformTicketStatus, PlatformTicketType } from "@beaconu/types";

const STATUS_OPTIONS: { label: string; value: PlatformTicketStatus | "all" }[] =
  [
    { label: "All Statuses", value: "all" },
    { label: "In Progress", value: "in_progress" },
    { label: "Awaiting Response", value: "awaiting_response" },
    { label: "Resolved", value: "resolved" },
    { label: "Closed", value: "closed" },
    { label: "Reopened", value: "reopened" },
  ];

const TYPE_OPTIONS: { label: string; value: PlatformTicketType | "all" }[] = [
  { label: "All Types", value: "all" },
  { label: "Query", value: "query" },
  { label: "Call Request", value: "call_request" },
];

const STATUS_BADGE_CLASS: Record<PlatformTicketStatus, string> = {
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  awaiting_response: "bg-red-50 text-red-700 border-red-200",
  resolved: "bg-green-50 text-green-700 border-green-200",
  closed: "bg-blue-50 text-blue-700 border-blue-200",
  reopened: "bg-amber-50 text-amber-700 border-amber-200",
};

const STATUS_LABEL: Record<PlatformTicketStatus, string> = {
  in_progress: "In Progress",
  awaiting_response: "Awaiting Response",
  resolved: "Resolved",
  closed: "Closed",
  reopened: "Reopened",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CollegeTicketsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PlatformTicketStatus | "all">("all");
  const [type, setType] = useState<PlatformTicketType | "all">("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = useCollegeTickets({
    search: search || undefined,
    status: status === "all" ? undefined : status,
    type: type === "all" ? undefined : type,
    page,
    limit,
  });

  const tickets = data?.tickets ?? [];
  const meta = data?.meta;
  const awaitingCount = tickets.filter(
    (t) => t.status === "awaiting_response",
  ).length;

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="College Queries"
        description="Queries and call requests raised by colleges"
      />

      <div className="flex-1 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by subject, ticket #, or college"
              className="pl-9 bg-background"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select
            value={type}
            onValueChange={(v) => {
              setType(v as PlatformTicketType | "all");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-44 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v as PlatformTicketStatus | "all");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-56 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {awaitingCount > 0 && (
            <Badge variant="destructive" className="px-3 py-1 self-center">
              {awaitingCount} awaiting response
            </Badge>
          )}
        </div>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>College</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((__, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : tickets.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      No queries raised yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map((ticket) => (
                    <TableRow
                      key={ticket.id}
                      className="cursor-pointer hover:bg-muted/30"
                      onClick={() =>
                        router.push(`/college-tickets/${ticket.id}`)
                      }
                    >
                      <TableCell>
                        <p className="font-semibold text-sm">
                          {ticket.collegeName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {ticket.raisedByName}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-sm">{ticket.subject}</p>
                        <p className="text-xs text-muted-foreground">
                          #{ticket.ticketNumber.slice(-6).toUpperCase()}
                        </p>
                      </TableCell>
                      <TableCell>
                        {ticket.type === "call_request" ? (
                          <span className="inline-flex items-center gap-1.5 text-sm">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            Call Request
                          </span>
                        ) : (
                          <span className="text-sm">Query</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={STATUS_BADGE_CLASS[ticket.status]}
                        >
                          {STATUS_LABEL[ticket.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(ticket.updatedAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

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
    </div>
  );
}
