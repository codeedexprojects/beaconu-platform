"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Wallet,
  GraduationCap,
  Bus,
  BedDouble,
  FileText,
  AlertTriangle,
  Download,
  PieChart,
  FilterX,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { cn } from "@/lib/utils";
import { useCollegeCoursesMinimal } from "@/hooks/use-colleges";
import {
  useFinanceOverview,
  useFinanceTransactions,
} from "@/hooks/use-payments";
import { downloadFinanceTransactionsCsv } from "@/lib/services/payments.service";
import type { FinanceFilters } from "@/lib/services/payments.service";

const FEE_TYPE_OPTIONS = [
  { value: "application_fee", label: "Application Fee" },
  { value: "token_fee", label: "Token Fee" },
  { value: "tuition_fee", label: "Tuition Fee" },
  { value: "semester_fees", label: "Semester Fees" },
  { value: "commute_fee", label: "Commute Fee" },
  { value: "hostel_booking_fee", label: "Hostel Booking Fee" },
];

const METHOD_OPTIONS = [
  { value: "mock", label: "Online Payment" },
  { value: "demand_draft", label: "Demand Draft" },
  { value: "bank_transfer", label: "Bank Transfer" },
];

const DONUT_COLORS: Record<string, string> = {
  mock: "#F5B400",
  demand_draft: "#3B82F6",
  bank_transfer: "#10B981",
};
const FALLBACK_COLORS = ["#8B5CF6", "#EC4899", "#14B8A6"];

const STATUS_BADGE: Record<
  string,
  { label: string; variant: "success" | "destructive" | "warning" }
> = {
  success: { label: "Success", variant: "success" },
  failed: { label: "Failed", variant: "destructive" },
  pending: { label: "Pending", variant: "warning" },
};

type DatePreset = "today" | "yesterday" | "custom";

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function presetToRange(preset: DatePreset): { from?: string; to?: string } {
  const today = new Date();
  if (preset === "today") {
    const d = toDateOnly(today);
    return { from: d, to: d };
  }
  if (preset === "yesterday") {
    const y = new Date(today);
    y.setDate(y.getDate() - 1);
    const d = toDateOnly(y);
    return { from: d, to: d };
  }
  return {};
}

function formatCr(amount: string | number): string {
  const value = Number(amount);
  if (Number.isNaN(value)) return "₹0";
  const crores = value / 1_00_00_000;
  if (Math.abs(crores) >= 0.01) {
    return `₹${crores.toFixed(1)} Cr`;
  }
  const lakhs = value / 1_00_000;
  if (Math.abs(lakhs) >= 0.01) {
    return `₹${lakhs.toFixed(1)} L`;
  }
  return `₹${value.toLocaleString("en-IN")}`;
}

function formatRupees(amount: string | number): string {
  const value = Number(amount);
  if (Number.isNaN(value)) return "₹0";
  return `₹${value.toLocaleString("en-IN")}`;
}

function StatCard({
  icon: Icon,
  label,
  amount,
  iconClassName,
}: {
  icon: React.ElementType;
  label: string;
  amount: string;
  iconClassName: string;
}) {
  return (
    <Card className="border-none shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg",
              iconClassName,
            )}
          >
            <Icon className="h-4.5 w-4.5" />
          </div>
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mt-3">
          {label}
        </p>
        <p className="text-2xl font-bold mt-1">{formatCr(amount)}</p>
      </CardContent>
    </Card>
  );
}

function PaymentMethodDonut({
  data,
}: {
  data: { method: string; label: string; amount: string; percentage: number }[];
}) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No payments recorded yet
      </p>
    );
  }

  const radius = 60;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * radius;

  const segments = data.reduce<
    { method: string; color: string; dasharray: string; offset: number }[]
  >((acc, row, i) => {
    const color =
      DONUT_COLORS[row.method] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length];
    const segment = (row.percentage / 100) * circumference;
    const previousOffset = acc.length > 0 ? acc[acc.length - 1].offset : 0;
    const previousSegment =
      acc.length > 0 ? Number(acc[acc.length - 1].dasharray.split(" ")[0]) : 0;
    const offset = previousOffset + previousSegment;
    acc.push({
      method: row.method,
      color,
      dasharray: `${segment} ${circumference - segment}`,
      offset,
    });
    return acc;
  }, []);

  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0">
        <svg width="150" height="150" viewBox="0 0 150 150">
          <g transform="translate(75,75) rotate(-90)">
            <circle
              r={radius}
              fill="none"
              stroke="#F1F5F9"
              strokeWidth={strokeWidth}
            />
            {segments.map((seg) => (
              <circle
                key={seg.method}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={seg.dasharray}
                strokeDashoffset={-seg.offset}
              />
            ))}
          </g>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] font-medium text-muted-foreground">
            TOTAL
          </span>
          <span className="text-lg font-bold">100%</span>
        </div>
      </div>
      <div className="flex-1 space-y-2.5">
        {data.map((row, i) => {
          const color =
            DONUT_COLORS[row.method] ??
            FALLBACK_COLORS[i % FALLBACK_COLORS.length];
          return (
            <div
              key={row.method}
              className="flex items-center justify-between gap-4 text-sm"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-muted-foreground">{row.label}</span>
              </div>
              <span className="font-semibold">{row.percentage}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function FinancePage() {
  const [datePreset, setDatePreset] = useState<DatePreset>("today");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [courseId, setCourseId] = useState<string>("all");
  const [feeCategory, setFeeCategory] = useState<string>("all");
  const [paymentMethod, setPaymentMethod] = useState<string>("all");
  const [page, setPage] = useState(1);

  const transactionDateRange = useMemo(
    () =>
      datePreset === "custom"
        ? { from: customFrom || undefined, to: customTo || undefined }
        : presetToRange(datePreset),
    [datePreset, customFrom, customTo],
  );

  const transactionFilters: FinanceFilters = useMemo(
    () => ({
      from_date: transactionDateRange.from,
      to_date: transactionDateRange.to,
      course_id: courseId === "all" ? undefined : courseId,
      fee_category: feeCategory === "all" ? undefined : feeCategory,
      payment_method: paymentMethod === "all" ? undefined : paymentMethod,
    }),
    [transactionDateRange, courseId, feeCategory, paymentMethod],
  );

  // Summary cards are "Overall Performance" — all-time totals, deliberately
  // NOT scoped to the Transactions History table's date filter below.
  const { data: overview, isLoading: isOverviewLoading } = useFinanceOverview(
    {},
  );
  const { data: txResult, isLoading: isTxLoading } = useFinanceTransactions({
    ...transactionFilters,
    page,
    limit: 20,
  });
  const { data: courses } = useCollegeCoursesMinimal();

  const transactions = txResult?.data ?? [];
  const meta = txResult?.meta;

  const hasActiveFilters =
    courseId !== "all" ||
    feeCategory !== "all" ||
    paymentMethod !== "all" ||
    datePreset !== "today";

  function clearFilters() {
    setDatePreset("today");
    setCustomFrom("");
    setCustomTo("");
    setCourseId("all");
    setFeeCategory("all");
    setPaymentMethod("all");
    setPage(1);
  }

  async function handleExport() {
    try {
      await downloadFinanceTransactionsCsv(transactionFilters);
    } catch {
      toast.error("Failed to export transactions");
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      <div className="p-6 space-y-6">
        {/* Total Revenue banner */}
        <Card className="border-none bg-[#0B1220] text-white shadow-sm overflow-hidden">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400 text-black">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-white/60">
                  Total Revenue
                </p>
                {isOverviewLoading ? (
                  <Skeleton className="h-7 w-24 mt-1 bg-white/10" />
                ) : (
                  <p className="text-2xl font-bold mt-0.5">
                    {formatCr(overview?.totalRevenue ?? "0")}
                  </p>
                )}
              </div>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30">
              Overall Performance
            </Badge>
          </CardContent>
        </Card>

        {/* Category cards */}
        {isOverviewLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-none shadow-sm">
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-7 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard
              icon={GraduationCap}
              label="Tuition Fees"
              amount={overview?.categories.tuitionFees ?? "0"}
              iconClassName="bg-blue-50 text-blue-600"
            />
            <StatCard
              icon={Bus}
              label="Commute Booking"
              amount={overview?.categories.commuteBooking ?? "0"}
              iconClassName="bg-orange-50 text-orange-600"
            />
            <StatCard
              icon={BedDouble}
              label="Student Housing Booking"
              amount={overview?.categories.studentHousingBooking ?? "0"}
              iconClassName="bg-purple-50 text-purple-600"
            />
            <StatCard
              icon={FileText}
              label="Application Fees"
              amount={overview?.categories.applicationFees ?? "0"}
              iconClassName="bg-emerald-50 text-emerald-600"
            />
          </div>
        )}

        {/* Payment Method + Overdue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-none shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm">Payment Method</h3>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </div>
              {isOverviewLoading ? (
                <Skeleton className="h-36 w-full" />
              ) : (
                <PaymentMethodDonut
                  data={overview?.paymentMethodBreakdown ?? []}
                />
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm">Overdue</h3>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Total Overdue Balance
              </p>
              {isOverviewLoading ? (
                <Skeleton className="h-8 w-28 mt-1" />
              ) : (
                <p className="text-2xl font-bold text-destructive mt-1">
                  {formatCr(overview?.overdueBalance ?? "0")}
                </p>
              )}
              <div className="mt-5 flex items-center justify-between text-xs">
                <span className="text-muted-foreground uppercase tracking-wide font-semibold">
                  Collection vs Target
                </span>
                <span className="font-semibold">
                  {overview?.collectionVsTargetPercent ?? 0}%
                </span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-400"
                  style={{
                    width: `${overview?.collectionVsTargetPercent ?? 0}%`,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions History */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 className="font-bold text-base">Transactions History</h3>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={datePreset === "today" ? "default" : "outline"}
                  onClick={() => {
                    setDatePreset("today");
                    setPage(1);
                  }}
                >
                  Today
                </Button>
                <Button
                  size="sm"
                  variant={datePreset === "yesterday" ? "default" : "outline"}
                  onClick={() => {
                    setDatePreset("yesterday");
                    setPage(1);
                  }}
                >
                  Yesterday
                </Button>
                <Button
                  size="sm"
                  variant={datePreset === "custom" ? "default" : "outline"}
                  onClick={() => {
                    setDatePreset("custom");
                    setPage(1);
                  }}
                >
                  Custom Range
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={handleExport}
                >
                  <Download className="h-3.5 w-3.5" />
                  CSV
                </Button>
              </div>
            </div>

            {datePreset === "custom" && (
              <div className="flex items-center gap-2 mb-4">
                <Input
                  type="date"
                  value={customFrom}
                  onChange={(e) => {
                    setCustomFrom(e.target.value);
                    setPage(1);
                  }}
                  className="w-40"
                />
                <span className="text-sm text-muted-foreground">to</span>
                <Input
                  type="date"
                  value={customTo}
                  onChange={(e) => {
                    setCustomTo(e.target.value);
                    setPage(1);
                  }}
                  className="w-40"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Select
                value={courseId}
                onValueChange={(v) => {
                  setCourseId(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Programs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {(courses ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={feeCategory}
                onValueChange={(v) => {
                  setFeeCategory(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Fee Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fee Types</SelectItem>
                  {FEE_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={paymentMethod}
                onValueChange={(v) => {
                  setPaymentMethod(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  {METHOD_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground"
                  onClick={clearFilters}
                >
                  <FilterX className="h-3.5 w-3.5" />
                  Clear Filters
                </Button>
              )}
            </div>

            {isTxLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">
                No transactions found for the selected filters
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Student / ID</TableHead>
                      <TableHead>Transaction Ref</TableHead>
                      <TableHead>Fee Type</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((txn) => {
                      const statusInfo =
                        STATUS_BADGE[txn.status] ?? STATUS_BADGE.pending;
                      return (
                        <TableRow key={txn.id}>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {new Date(txn.time).toLocaleTimeString("en-IN", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </TableCell>
                          <TableCell>
                            <p className="font-semibold text-sm">
                              {txn.studentName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {txn.studentId}
                            </p>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {txn.transactionNumber}
                          </TableCell>
                          <TableCell className="text-sm">
                            {FEE_TYPE_OPTIONS.find(
                              (f) => f.value === txn.feeCategory,
                            )?.label ??
                              txn.feeCategory ??
                              "—"}
                          </TableCell>
                          <TableCell className="text-sm">
                            {txn.paymentMethodLabel}
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={cn(
                                "text-sm font-semibold",
                                txn.direction === "credit"
                                  ? "text-emerald-600"
                                  : "text-destructive",
                              )}
                            >
                              {txn.direction === "credit" ? "+" : "-"}
                              {formatRupees(txn.amount)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant={statusInfo.variant}>
                              {statusInfo.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {meta && meta.total > 0 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Showing {transactions.length} of {meta.total} transactions
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
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
      </div>
    </div>
  );
}
