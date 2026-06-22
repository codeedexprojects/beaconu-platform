"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useCounsellorSlots } from "@/hooks/use-counsellors";
import { getErrorMessage } from "@/lib/api";
import { formatDate, formatTime } from "@/lib/format-datetime";

const PAGE_LIMIT = 10;

export function CounsellorSlotsTable({
  counsellorId,
  status,
  title,
  emptyMessage,
}: {
  counsellorId: string;
  status: "available" | "booked";
  title: string;
  emptyMessage: string;
}) {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useCounsellorSlots(counsellorId, status, {
    page,
    limit: PAGE_LIMIT,
  });

  const slots = data?.data ?? [];
  const meta = data?.meta;

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead className="text-right">Fee</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-4 w-12 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-1 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="text-sm">{getErrorMessage(error)}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : slots.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-sm text-muted-foreground py-6"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              slots.map((slot) => (
                <TableRow key={slot.id}>
                  <TableCell className="text-sm">
                    {formatDate(slot.available_date)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    ₹{slot.session_fee}
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
