"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Clock,
  FileWarning,
  ReceiptText,
  RotateCcw,
  ShoppingCart,
  Ticket,
  Award,
  XCircle,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import { getErrorMessage } from "@/lib/api";
import { useFinanceInsights } from "@/hooks/use-payments";
import type { FinanceInsights } from "@/lib/services/payments.service";

const AGING_COLORS: Record<string, string> = {
  not_yet_due: "bg-emerald-400",
  overdue_1_30: "bg-amber-300",
  overdue_31_60: "bg-amber-500",
  overdue_61_90: "bg-orange-600",
  overdue_90_plus: "bg-red-600",
  no_due_date: "bg-slate-300",
};

function SectionHeading({ title, hint }: { title: string; hint: string }) {
  return (
    <div>
      <h3 className="font-bold text-base">{title}</h3>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function Tile({
  icon: Icon,
  label,
  amount,
  count,
  countLabel,
  tone,
  href,
}: {
  icon: React.ElementType;
  label: string;
  amount: number;
  count: number;
  countLabel: string;
  tone: "neutral" | "warning" | "danger";
  href?: string;
}) {
  const body = (
    <Card
      className={cn(
        "border-none shadow-sm h-full transition-colors",
        href && "hover:bg-muted/40",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              tone === "danger" && count > 0
                ? "bg-red-50 text-red-600"
                : tone === "warning" && count > 0
                  ? "bg-amber-50 text-amber-600"
                  : "bg-slate-100 text-slate-500",
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
          {href && (
            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </div>
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-lg font-bold">{formatCurrency(amount)}</p>
        <p className="text-xs text-muted-foreground">
          {formatNumber(count)} {countLabel}
        </p>
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

function ReceivablesAging({
  receivables,
}: {
  receivables: FinanceInsights["receivables"];
}) {
  const { totalOutstanding, aging } = receivables;
  return (
    <Card className="border-none shadow-sm h-full">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm">Receivables Aging</h4>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </div>
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Total outstanding
        </p>
        <p className="text-2xl font-bold">{formatCurrency(totalOutstanding)}</p>

        {totalOutstanding > 0 ? (
          <>
            <div className="mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
              {aging
                .filter((b) => b.amount > 0)
                .map((b) => (
                  <div
                    key={b.key}
                    className={AGING_COLORS[b.key] ?? "bg-slate-300"}
                    style={{ width: `${(b.amount / totalOutstanding) * 100}%` }}
                    title={`${b.label}: ${formatCurrency(b.amount)}`}
                  />
                ))}
            </div>
            <div className="mt-4 space-y-2">
              {aging.map((b) => (
                <div
                  key={b.key}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        AGING_COLORS[b.key] ?? "bg-slate-300",
                      )}
                    />
                    <span className="text-muted-foreground">{b.label}</span>
                  </div>
                  <span className="font-semibold tabular-nums">
                    {formatCurrency(b.amount)}
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                      ({b.count})
                    </span>
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Course fees billed to students. Application, token, hostel and
              commute fees aren&apos;t owed until paid, so they aren&apos;t
              counted here.
            </p>
          </>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            No outstanding balances.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function RevenueByCourse({
  rows,
}: {
  rows: FinanceInsights["revenueByCourse"];
}) {
  const total = rows.reduce((sum, r) => sum + r.amount, 0);
  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <CardContent className="p-5">
        <h4 className="font-bold text-sm mb-3">Revenue by Course</h4>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No payments recorded yet
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2 font-semibold">Course</th>
                  <th className="pb-2 font-semibold text-right">Payments</th>
                  <th className="pb-2 font-semibold text-right">Revenue</th>
                  <th className="pb-2 font-semibold text-right w-40">Share</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const share = total > 0 ? (row.amount / total) * 100 : 0;
                  return (
                    <tr
                      key={row.courseId ?? "unlinked"}
                      className="border-t border-border/60"
                    >
                      <td
                        className={cn(
                          "py-2.5 pr-3",
                          row.courseId === null &&
                            "text-muted-foreground italic",
                        )}
                      >
                        {row.courseName}
                      </td>
                      <td className="py-2.5 text-right tabular-nums">
                        {formatNumber(row.count)}
                      </td>
                      <td className="py-2.5 text-right font-semibold tabular-nums">
                        {formatCurrency(row.amount)}
                      </td>
                      <td className="py-2.5">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-amber-400"
                              style={{ width: `${share}%` }}
                            />
                          </div>
                          <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
                            {share.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function InsightsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-5 w-40" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="h-72 w-full rounded-xl lg:col-span-1" />
        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-36 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-56 w-full rounded-xl" />
    </div>
  );
}

export function FinanceInsightsSection() {
  const { data, isLoading, error } = useFinanceInsights();

  if (isLoading) return <InsightsSkeleton />;
  if (error || !data) {
    return (
      <Card className="border-none shadow-sm">
        <CardContent className="flex items-center justify-center gap-2 p-6 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" />
          {getErrorMessage(error)}
        </CardContent>
      </Card>
    );
  }

  const { refunds, tokenPipeline, scholarships } = data;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <SectionHeading
          title="Collections Health"
          hint="Money owed, stuck, or unaccounted for"
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <ReceivablesAging receivables={data.receivables} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:col-span-2">
            <Tile
              icon={FileWarning}
              label="Awaiting verification"
              amount={data.awaitingVerification.amount}
              count={data.awaitingVerification.count}
              countLabel="offline payments to review"
              tone="warning"
              href="/payments"
            />
            <Tile
              icon={XCircle}
              label="Failed / rejected"
              amount={data.failedPayments.amount}
              count={data.failedPayments.count}
              countLabel="fees with failed attempts, not yet paid"
              tone="danger"
            />
            <Tile
              icon={ShoppingCart}
              label="Abandoned checkouts"
              amount={data.abandonedPayments.amount}
              count={data.abandonedPayments.count}
              countLabel="checkouts left unfinished over 24h"
              tone="warning"
            />
            <Tile
              icon={ReceiptText}
              label="Missing receipts"
              amount={data.missingReceipts.amount}
              count={data.missingReceipts.count}
              countLabel="completed payments without a receipt"
              tone="danger"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <SectionHeading
          title="Pipeline & Outflows"
          hint="Money expected in, and money going back out"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/applications">
            <Card className="border-none shadow-sm h-full transition-colors hover:bg-muted/40">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Ticket className="h-4 w-4" />
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Expected token revenue
                </p>
                <p className="mt-1 text-lg font-bold">
                  {formatCurrency(tokenPipeline.expectedAmount)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(tokenPipeline.expectedCount)} live offers
                  awaiting token
                </p>
                {tokenPipeline.lapsedCount > 0 && (
                  <p className="mt-2 text-xs text-amber-700">
                    {formatNumber(tokenPipeline.lapsedCount)} lapsed offers (
                    {formatCurrency(tokenPipeline.lapsedAmount)}) past validity,
                    still unpaid
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>

          <Link href="/seat-cancellations">
            <Card className="border-none shadow-sm h-full transition-colors hover:bg-muted/40">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                    <RotateCcw className="h-4 w-4" />
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Refunds paid out
                </p>
                <p className="mt-1 text-lg font-bold">
                  {formatCurrency(refunds.refundedAmount)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(refunds.refundedCount)} processed
                </p>
                <div className="mt-2 space-y-0.5 text-xs">
                  <p
                    className={cn(
                      refunds.pendingRefundCount > 0
                        ? "text-amber-700"
                        : "text-muted-foreground",
                    )}
                  >
                    {formatCurrency(refunds.pendingRefundAmount)} owed across{" "}
                    {formatNumber(refunds.pendingRefundCount)} pending
                  </p>
                  <p className="text-muted-foreground">
                    {formatCurrency(refunds.penaltiesCollected)} penalties
                    collected
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/scholarships/requests">
            <Card className="border-none shadow-sm h-full transition-colors hover:bg-muted/40">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                    <Award className="h-4 w-4" />
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Scholarships approved
                </p>
                <p className="mt-1 text-lg font-bold">
                  {formatCurrency(scholarships.approvedDiscountAmount)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(scholarships.approvedCount)} students
                </p>
                {scholarships.pendingCount > 0 && (
                  <p className="mt-2 text-xs text-amber-700">
                    {formatNumber(scholarships.pendingCount)} requests awaiting
                    review
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      <RevenueByCourse rows={data.revenueByCourse} />
    </div>
  );
}
