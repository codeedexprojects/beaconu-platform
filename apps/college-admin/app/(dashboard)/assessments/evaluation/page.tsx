"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useEvaluationQueue } from "@/hooks/use-assessments";
import type { AttemptStatus } from "@beaconu/types";

type StatusFilter = "all" | "needs_review" | "published";

const STATUS_FILTER_PARAMS: Record<StatusFilter, string[] | undefined> = {
  all: undefined,
  // "evaluated" is a transient in-between state (publish() sets it, then
  // immediately "result_published" in the same call) — grouped with
  // "under_evaluation" since it still means "not yet published".
  needs_review: ["under_evaluation", "evaluated"],
  published: ["result_published"],
};

const STATUS_VARIANT: Record<
  AttemptStatus,
  "default" | "outline" | "secondary" | "destructive"
> = {
  not_started: "outline",
  in_progress: "outline",
  completed: "secondary",
  auto_submitted: "secondary",
  terminated: "destructive",
  under_evaluation: "secondary",
  evaluated: "default",
  result_published: "default",
};

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AssessmentEvaluationQueuePage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [needsScoringOnly, setNeedsScoringOnly] = useState(false);

  const { data: allAttempts, isLoading } = useEvaluationQueue(
    STATUS_FILTER_PARAMS[statusFilter],
  );

  const attempts = useMemo(() => {
    if (!allAttempts) return allAttempts;
    return needsScoringOnly
      ? allAttempts.filter((a) => a.pendingCount > 0)
      : allAttempts;
  }, [allAttempts, needsScoringOnly]);

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 -ml-2" asChild>
            <Link href="/assessments">
              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
              Back
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            Evaluation Queue
          </h1>
          <p className="text-sm text-muted-foreground">
            Attempts awaiting review — score any subjective answers, then
            publish the result.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={needsScoringOnly ? "default" : "outline"}
            onClick={() => setNeedsScoringOnly((v) => !v)}
          >
            Needs scoring
          </Button>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="needs_review">Needs Review</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : !attempts || attempts.length === 0 ? (
        <div className="rounded-xl border py-20 text-center text-muted-foreground">
          No attempts currently need evaluation.
        </div>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Pending</TableHead>
                <TableHead>Auto-scored</TableHead>
                <TableHead>Evaluated</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="sr-only">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attempts.map((a) => (
                <TableRow key={a.id} className="cursor-pointer">
                  <TableCell>
                    <Link
                      href={`/assessments/evaluation/${a.id}`}
                      className="block"
                    >
                      <p className="font-medium">{a.studentName}</p>
                      {a.studentEmail && (
                        <p className="text-xs text-muted-foreground">
                          {a.studentEmail}
                        </p>
                      )}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[a.status]}>
                      {a.status.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(a.completedAt)}
                  </TableCell>
                  <TableCell>
                    {a.pendingCount > 0 ? (
                      <Badge variant="destructive">{a.pendingCount}</Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{a.autoScoredCount}</TableCell>
                  <TableCell className="text-sm">{a.evaluatedCount}</TableCell>
                  <TableCell className="text-sm">
                    {a.totalScore != null
                      ? `${a.totalScore.toFixed(2)} / ${a.maxScore?.toFixed(2)}`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/assessments/evaluation/${a.id}`}>
                        Review
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
