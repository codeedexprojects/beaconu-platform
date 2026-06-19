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
import { useCounsellorWalletTransactions } from "@/hooks/use-counsellors";
import { getErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format-datetime";

const PAGE_LIMIT = 10;

export function CounsellorWalletTransactionsTable({
  counsellorId,
}: {
  counsellorId: string;
}) {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useCounsellorWalletTransactions(
    counsellorId,
    { page, limit: PAGE_LIMIT },
  );

  const transactions = data?.transactions ?? [];
  const meta = data?.transactions_meta;

  if (!isLoading && !error && transactions.length === 0 && page === 1) {
    return null;
  }

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm">Wallet Transactions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Balance After</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-1 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="text-sm">{getErrorMessage(error)}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell className="text-sm">
                    {formatDate(txn.created_at)}
                  </TableCell>
                  <TableCell className="text-sm capitalize">
                    {txn.type}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {txn.description ?? "—"}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    ₹{txn.amount}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    ₹{txn.balance_after}
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
