"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Landmark,
  Eye,
  EyeOff,
  ChevronRight,
  TrendingDown,
  BadgePercent,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useEducationLoans,
  useDeactivateEducationLoan,
  useActivateEducationLoan,
} from "@/hooks/use-financial-aid-loans";
import { toast } from "sonner";
import type { EducationLoanListItem } from "@beaconu/types";

const TYPE_TABS = [
  { label: "All", value: "" },
  { label: "Domestic", value: "domestic" },
  { label: "Abroad", value: "abroad" },
  { label: "Both", value: "both" },
] as const;

const STATUS_BADGE: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactive: "bg-gray-50 text-gray-500 border-gray-200",
};

const TYPE_BADGE: Record<string, string> = {
  domestic: "bg-blue-50 text-blue-700",
  abroad: "bg-violet-50 text-violet-700",
  both: "bg-amber-50 text-amber-700",
};

function LoanCard({ loan }: { loan: EducationLoanListItem }) {
  const { mutate: deactivate, isPending: isDeactivating } =
    useDeactivateEducationLoan();
  const { mutate: activate, isPending: isActivating } =
    useActivateEducationLoan();
  const isPending = isDeactivating || isActivating;

  return (
    <Card className="border-none shadow-sm hover:ring-1 hover:ring-primary/20 transition-all">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0">
            <Landmark className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {loan.tag && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">
                <BadgePercent className="h-3 w-3" />
                {loan.tag}
              </span>
            )}
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize",
                STATUS_BADGE[loan.status],
              )}
            >
              {loan.status}
            </span>
            <span
              className={cn(
                "text-[10px] font-semibold capitalize px-2 py-0.5 rounded-full",
                TYPE_BADGE[loan.loanType],
              )}
            >
              {loan.loanType}
            </span>
          </div>
        </div>

        <p className="font-bold text-base leading-tight">{loan.bankName}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {loan.productName}
        </p>

        <div className="space-y-1.5 mt-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingDown className="h-3.5 w-3.5 shrink-0" />
            Interest:{" "}
            <span className="text-foreground font-semibold">
              {loan.interestRate}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <BadgePercent className="h-3.5 w-3.5 shrink-0" />
            Max:{" "}
            <span className="text-foreground font-medium">
              {loan.maxAmount}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Landmark className="h-3.5 w-3.5 shrink-0" />
            Processing:{" "}
            <span className="text-foreground font-medium">
              {loan.processingFee}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Moratorium:{" "}
            <span className="text-foreground font-medium">
              {loan.moratorium}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Link href={`/financial-aid/${loan.id}`} className="flex-1">
            <Button
              variant="ghost"
              className="w-full h-9 group justify-between px-2"
            >
              <span className="text-xs font-medium">Manage Details</span>
              <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          {loan.status === "active" ? (
            <Button
              size="sm"
              variant="ghost"
              className="h-9 w-9 p-0 text-muted-foreground shrink-0"
              disabled={isPending}
              title="Deactivate"
              onClick={() =>
                deactivate(loan.id, {
                  onSuccess: () => toast.success("Loan deactivated"),
                })
              }
            >
              <EyeOff className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="h-9 w-9 p-0 text-muted-foreground shrink-0"
              disabled={isPending}
              title="Activate"
              onClick={() =>
                activate(loan.id, {
                  onSuccess: () => toast.success("Loan activated"),
                })
              }
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function FinancialAidPage() {
  const [activeLoanType, setActiveLoanType] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading } = useEducationLoans({
    loan_type: activeLoanType || undefined,
    search: search || undefined,
  });

  const items = data?.data ?? [];
  const meta = data?.meta;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header
        title="Financial Aid"
        description="Manage education loan products shown to students"
      >
        <Link href="/financial-aid/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Loan
          </Button>
        </Link>
      </Header>

      <div className="flex-1 p-6 space-y-4">
        <form onSubmit={handleSearch} className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by bank or product name…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 bg-background"
          />
        </form>

        <div className="flex gap-1 border-b">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveLoanType(tab.value)}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                activeLoanType === tab.value
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-none shadow-sm">
                <CardContent className="p-5 space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-2/3" />
                    <Skeleton className="h-3.5 w-1/2" />
                    <Skeleton className="h-3.5 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            {activeLoanType || search
              ? "No loans match your filters."
              : "No education loans yet. Add one to get started."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((loan) => (
              <LoanCard key={loan.id} loan={loan} />
            ))}
          </div>
        )}

        {meta && meta.total > 0 && (
          <p className="text-xs text-muted-foreground text-right">
            Showing {items.length} of {meta.total} loans
          </p>
        )}
      </div>
    </div>
  );
}
