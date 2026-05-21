"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Calendar,
  Globe,
  Award,
  ChevronRight,
  GraduationCap,
  EyeOff,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useEntranceExams,
  useDeactivateEntranceExam,
} from "@/hooks/use-entrance-exams";
import { toast } from "sonner";
import type { EntranceExamListItem } from "@beaconu/types";

const LEVEL_TABS = [
  { label: "All", value: "" },
  { label: "National", value: "national" },
  { label: "State", value: "state" },
  { label: "University", value: "university" },
] as const;

const STATUS_BADGE: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactive: "bg-gray-50 text-gray-500 border-gray-200",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ExamCard({ exam }: { exam: EntranceExamListItem }) {
  const { mutate: deactivate, isPending } = useDeactivateEntranceExam();

  return (
    <Card className="border-none shadow-sm hover:ring-1 hover:ring-primary/20 transition-all">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize",
                STATUS_BADGE[exam.status],
              )}
            >
              {exam.status}
            </span>
            <span className="text-[10px] font-semibold uppercase text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {exam.examLevel}
            </span>
          </div>
        </div>

        <p className="font-bold text-base leading-tight">{exam.name}</p>
        {exam.conductingBody && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {exam.conductingBody}
          </p>
        )}

        <div className="space-y-1.5 mt-4">
          {exam.examDate && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              Exam:{" "}
              <span className="text-foreground font-medium">
                {formatDate(exam.examDate)}
              </span>
            </div>
          )}
          {exam.registrationEnd && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              Reg. ends:{" "}
              <span className="text-foreground font-medium">
                {formatDate(exam.registrationEnd)}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Award className="h-3.5 w-3.5 shrink-0" />
            Code:{" "}
            <span className="text-foreground font-semibold font-mono">
              {exam.code}
            </span>
          </div>
          {exam.officialWebsite && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Globe className="h-3.5 w-3.5 shrink-0" />
              <span className="text-primary truncate underline">
                {exam.officialWebsite.replace(/^https?:\/\//, "")}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Link href={`/entrance-exams/${exam.id}`} className="flex-1">
            <Button
              variant="ghost"
              className="w-full h-9 group justify-between px-2"
            >
              <span className="text-xs font-medium">Manage Details</span>
              <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          {exam.status === "active" && (
            <Button
              size="sm"
              variant="ghost"
              className="h-9 w-9 p-0 text-muted-foreground shrink-0"
              disabled={isPending}
              title="Deactivate"
              onClick={() =>
                deactivate(exam.id, {
                  onSuccess: () => toast.success("Exam deactivated"),
                })
              }
            >
              <EyeOff className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function EntranceExamsPage() {
  const [activeLevel, setActiveLevel] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading } = useEntranceExams({
    exam_level: activeLevel || undefined,
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
        title="Entrance Exams"
        description="Manage information and dates for national and state level entrance exams"
      >
        <Link href="/entrance-exams/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Exam
          </Button>
        </Link>
      </Header>

      <div className="flex-1 p-6 space-y-4">
        <form onSubmit={handleSearch} className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exams…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 bg-background"
          />
        </form>

        <div className="flex gap-1 border-b">
          {LEVEL_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveLevel(tab.value)}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                activeLevel === tab.value
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
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            {activeLevel
              ? `No ${activeLevel} level exams found.`
              : "No entrance exams yet. Add one to get started."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((exam) => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>
        )}

        {meta && meta.total > 0 && (
          <p className="text-xs text-muted-foreground text-right">
            Showing {items.length} of {meta.total} exams
          </p>
        )}
      </div>
    </div>
  );
}
