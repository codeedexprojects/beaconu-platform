"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  Clock,
  GraduationCap,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Course } from "@/lib/services/colleges.service";

const RING_RADIUS = 24;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function completionColor(percent: number): string {
  if (percent >= 90) return "stroke-emerald-500";
  if (percent >= 50) return "stroke-gold";
  return "stroke-red-500";
}

function CompletionRing({ percent }: { percent: number }) {
  const offset = RING_CIRCUMFERENCE * (1 - percent / 100);
  return (
    <div className="relative h-14 w-14 shrink-0">
      <svg viewBox="0 0 56 56" className="h-14 w-14 -rotate-90">
        <circle
          cx="28"
          cy="28"
          r={RING_RADIUS}
          fill="none"
          strokeWidth="4"
          className="stroke-muted"
        />
        <circle
          cx="28"
          cy="28"
          r={RING_RADIUS}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={offset}
          className={completionColor(percent)}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-navy">
        {percent}%
      </span>
    </div>
  );
}

export function CourseListView({
  courses,
  onEdit,
  onDelete,
  onAddFirst,
}: {
  courses: Course[];
  onEdit: (course: Course) => void;
  onDelete: (id: string) => void;
  onAddFirst: () => void;
}) {
  const [search, setSearch] = useState("");
  const [studyLevelFilter, setStudyLevelFilter] = useState("all");
  const [disciplineFilter, setDisciplineFilter] = useState("all");

  const studyLevelOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const c of courses) {
      if (c.studyLevel) seen.set(c.studyLevel.id, c.studyLevel.name);
    }
    return Array.from(seen, ([id, name]) => ({ id, name }));
  }, [courses]);

  const disciplineOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const c of courses) {
      if (c.discipline) seen.set(c.discipline.id, c.discipline.name);
    }
    return Array.from(seen, ([id, name]) => ({ id, name }));
  }, [courses]);

  const filtered = courses.filter((course) => {
    if (
      search.trim() &&
      !course.name.toLowerCase().includes(search.trim().toLowerCase())
    ) {
      return false;
    }
    if (
      studyLevelFilter !== "all" &&
      course.studyLevel?.id !== studyLevelFilter
    ) {
      return false;
    }
    if (
      disciplineFilter !== "all" &&
      course.discipline?.id !== disciplineFilter
    ) {
      return false;
    }
    return true;
  });

  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilterCount =
    (studyLevelFilter !== "all" ? 1 : 0) + (disciplineFilter !== "all" ? 1 : 0);

  if (courses.length === 0) {
    return (
      <Card className="border-dashed bg-muted/5 py-12">
        <CardContent className="flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold tracking-tight mb-2">
            No programs configured
          </h3>
          <p className="text-muted-foreground max-w-sm mb-6 text-sm">
            Start building your academic catalog by configuring your first
            course offering.
          </p>
          <Button onClick={onAddFirst} size="lg" className="font-semibold">
            <Plus className="h-5 w-5 mr-2" /> Add First Course
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for programs, degrees, or keywords..."
            className="h-11 w-full rounded-full border border-border bg-white pl-10 pr-4 text-sm outline-none focus:border-gold"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setFiltersOpen((v) => !v)}
          className="h-11 shrink-0 gap-2 rounded-full border-border bg-white"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          Filter
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[11px] font-semibold text-white">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {filtersOpen && (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 sm:flex-row">
          <div className="flex-1">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Level
            </p>
            <Select
              value={studyLevelFilter}
              onValueChange={setStudyLevelFilter}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All levels</SelectItem>
                {studyLevelOptions.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    {opt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Discipline
            </p>
            <Select
              value={disciplineFilter}
              onValueChange={setDisciplineFilter}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All disciplines</SelectItem>
                {disciplineOptions.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    {opt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed py-16 text-center text-sm text-muted-foreground">
          No programs match your search or filters.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((course) => (
            <div
              key={course.id}
              className="group relative flex flex-col gap-4 rounded-2xl border-y border-r border-y-border border-r-border border-l-4 border-l-gold bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <button
                type="button"
                onClick={() => onDelete(course.id)}
                aria-label="Delete program"
                className="absolute right-4 top-4 hidden h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive group-hover:flex"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>

              <div className="min-w-0 flex-1">
                <h4 className="mb-2 font-serif text-lg font-bold leading-snug text-navy">
                  {course.name}
                </h4>
                <div className="space-y-1.5 border-t pt-2 text-xs text-muted-foreground">
                  {(course.department?.name ?? course.discipline?.name) && (
                    <p className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-gold" />
                      {course.department?.name ?? course.discipline?.name}
                    </p>
                  )}
                  {course.duration && (
                    <p className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-gold" />
                      {course.duration}
                    </p>
                  )}
                  {course.studyLevel?.name && (
                    <p className="flex items-center gap-2">
                      <GraduationCap className="h-3.5 w-3.5 text-gold" />
                      {course.studyLevel.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-center gap-2">
                <CompletionRing percent={course.setupCompletionPercent ?? 0} />
                <Button
                  size="sm"
                  className="rounded-full bg-gold px-4 text-xs font-semibold uppercase tracking-wide text-white hover:bg-gold/90"
                  onClick={() => onEdit(course)}
                >
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
