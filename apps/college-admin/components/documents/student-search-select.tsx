"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCollegeStudents } from "@/hooks/use-college-students";
import type { CollegeStudentListItem } from "@beaconu/types";

const PAGE_SIZE = 10;

interface StudentSearchSelectProps {
  value: CollegeStudentListItem | null;
  onChange: (student: CollegeStudentListItem | null) => void;
}

export function StudentSearchSelect({
  value,
  onChange,
}: StudentSearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timeout);
  }, [query]);

  // Reset to page 1 whenever the search term actually changes
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  const { data, isFetching } = useCollegeStudents(
    { search: debouncedQuery || undefined, page, limit: PAGE_SIZE },
    isOpen,
  );
  const results = data?.students ?? [];
  const meta = data?.meta;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function closeAndReset() {
    setIsOpen(false);
    setQuery("");
    setPage(1);
  }

  if (value) {
    return (
      <div className="flex items-center justify-between rounded-md border border-input px-3 py-2 text-sm">
        <div>
          <div className="font-medium">{value.fullName}</div>
          <div className="text-xs text-muted-foreground">
            {value.email ?? value.phoneNumber ?? value.id}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-muted-foreground hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50"
      >
        Select a student
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
          <div className="relative border-b p-2">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              className="pl-9"
              placeholder="Search by name, email, or phone"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="max-h-64 overflow-y-auto">
            {isFetching ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : results.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                No students found.
              </div>
            ) : (
              results.map((student) => (
                <button
                  key={student.id}
                  type="button"
                  className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-muted"
                  onClick={() => {
                    onChange(student);
                    closeAndReset();
                  }}
                >
                  <span className="font-medium">{student.fullName}</span>
                  <span className="text-xs text-muted-foreground">
                    {student.email ?? student.phoneNumber ?? student.id}
                  </span>
                </button>
              ))
            )}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-2 py-1.5">
              <span className="text-xs text-muted-foreground">
                Page {meta.page} of {meta.totalPages} · {meta.total} students
              </span>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={!meta.hasPreviousPage}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={!meta.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
