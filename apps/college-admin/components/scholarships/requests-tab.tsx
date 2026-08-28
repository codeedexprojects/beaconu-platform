"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useScholarshipApplications } from "@/hooks/use-scholarships";
import type { ScholarshipApplicationItem } from "@beaconu/types";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function ScholarshipRequestsTab() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [search, setSearch] = useState("");

  const { data: applications, isLoading } = useScholarshipApplications(
    statusFilter === "all" ? undefined : statusFilter,
  );

  const filtered = (applications ?? []).filter((item) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      item.studentName.toLowerCase().includes(q) ||
      item.applicationNumber.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-xl font-bold text-navy">
        Scholarship Requests
      </h2>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or applicant ID..."
            className="h-11 w-full rounded-full border border-border bg-white pl-10 pr-4 text-sm outline-none focus:border-gold"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-11 w-full gap-2 rounded-full border-border bg-white sm:w-44">
            <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-gold" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          No {statusFilter !== "all" ? statusFilter : ""} scholarship requests.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((item: ScholarshipApplicationItem) => (
            <div
              key={item.id}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-white p-5 text-center shadow-sm"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-navy text-lg font-semibold text-white">
                {initials(item.studentName)}
              </span>
              <p className="font-serif text-base font-bold text-navy">
                {item.studentName}
              </p>
              <span className="rounded-full bg-gold-pale px-2.5 py-0.5 text-[11px] font-medium text-navy">
                {item.applicationNumber}
              </span>
              <Button
                size="icon"
                className="mt-1 h-9 w-9 rounded-full bg-navy text-white hover:bg-navy/90"
                onClick={() => router.push(`/scholarships/requests/${item.id}`)}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
