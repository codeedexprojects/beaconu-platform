"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useCounsellorSessions } from "@/hooks/use-counsellors";
import { getErrorMessage } from "@/lib/api";
import { formatDate, formatTime } from "@/lib/format-datetime";

const PAGE_LIMIT = 10;

export function CounsellorSessionsTable({
  counsellorId,
}: {
  counsellorId: string;
}) {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useCounsellorSessions(counsellorId, {
    page,
    limit: PAGE_LIMIT,
  });

  const sessions = data?.data ?? [];
  const meta = data?.meta;

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm">Sessions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Fee</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-1 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="text-sm">{getErrorMessage(error)}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : sessions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-sm text-muted-foreground py-8"
                >
                  No sessions yet
                </TableCell>
              </TableRow>
            ) : (
              sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {session.student.full_name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {session.student.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(session.scheduled_date)}
                    <div className="text-[10px] text-muted-foreground">
                      {formatTime(session.start_time)} –{" "}
                      {formatTime(session.end_time)}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm capitalize">
                    {session.session_type}
                  </TableCell>
                  <TableCell className="text-sm capitalize">
                    {session.session_mode.replace("_", " ")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        session.status === "completed"
                          ? "success"
                          : session.status === "cancelled"
                            ? "destructive"
                            : "secondary"
                      }
                      className="capitalize"
                    >
                      {session.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        session.payment_status === "paid"
                          ? "success"
                          : "secondary"
                      }
                      className="capitalize"
                    >
                      {session.payment_status}
                    </Badge>
                    {session.transaction_id && (
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        {session.transaction_id}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {session.session_fee !== null
                      ? `₹${session.session_fee}`
                      : "Free"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-muted-foreground">
              Page {meta.page} of {meta.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
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
      </CardContent>
    </Card>
  );
}
