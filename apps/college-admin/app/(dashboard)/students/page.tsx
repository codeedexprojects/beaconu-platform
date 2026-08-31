"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useEnrolledStudents } from "@/hooks/use-college-students";

const AVATAR_PALETTE = [
  "bg-neutral-100 text-neutral-700",
  "bg-amber-100 text-amber-800",
  "bg-blue-100 text-blue-800",
  "bg-emerald-100 text-emerald-800",
  "bg-violet-100 text-violet-800",
  "bg-rose-100 text-rose-800",
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function avatarColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++)
    hash = (hash + seed.charCodeAt(i)) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[hash];
}

const STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "On Leave", value: "on_leave" },
  { label: "Suspended", value: "suspended" },
  { label: "Completed", value: "completed" },
  { label: "Withdrawn", value: "withdrawn" },
];

export default function EnrolledStudentsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 24;

  const { data, isLoading } = useEnrolledStudents({
    search: search || undefined,
    status: status === "all" ? undefined : status,
    page,
    limit,
  });

  const students = data?.students ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-navy">
          Matriculated Learners
        </h1>
        <p className="text-sm text-muted-foreground">
          Every student enrolled at this college — click a profile for their
          full academic, document, and payment history.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search students, categories..."
            className="h-11 w-full rounded-full border border-border bg-white pl-10 pr-4 text-sm outline-none focus:border-gold"
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-11 w-full gap-2 rounded-full border-border bg-navy text-white sm:w-44 [&_svg]:text-white">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-white p-6"
            >
              <Skeleton className="mx-auto h-16 w-16 rounded-xl" />
              <Skeleton className="mx-auto mt-3 h-4 w-24" />
              <Skeleton className="mx-auto mt-2 h-3 w-20" />
            </div>
          ))}
        </div>
      ) : students.length === 0 ? (
        <div className="rounded-2xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          No enrolled students yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {students.map((student) => (
            <div
              key={student.enrollmentId}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-white p-6 text-center shadow-sm"
            >
              <span
                className={`flex h-16 w-16 items-center justify-center rounded-xl text-xl font-serif font-bold ${avatarColor(student.id)}`}
              >
                {initials(student.fullName)}
              </span>
              <p className="mt-1 font-serif text-lg font-bold text-navy">
                {student.fullName}
              </p>
              <p className="font-mono text-xs tracking-wide text-muted-foreground">
                {student.enrollmentNumber ?? student.id}
              </p>
              <Button
                variant="outline"
                className="mt-2 w-full rounded-lg border-border bg-muted/40 text-sm font-medium hover:bg-muted"
                onClick={() => router.push(`/students/${student.id}`)}
              >
                View Profile
              </Button>
            </div>
          ))}
        </div>
      )}

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
  );
}
