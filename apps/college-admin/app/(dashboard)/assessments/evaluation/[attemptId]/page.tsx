"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { getErrorMessage } from "@/lib/api";
import {
  useEvaluationDetail,
  useScoreAssessmentAnswer,
  usePublishAssessmentResult,
  useRestartAssessmentAttempt,
} from "@/hooks/use-assessments";
import type { EvaluationAnswerDetail } from "@beaconu/types";

function optionText(
  content: EvaluationAnswerDetail["content"],
  optionId: string,
): string {
  return content.options?.find((o) => o.id === optionId)?.text ?? optionId;
}

function OptionsComparison({ answer }: { answer: EvaluationAnswerDetail }) {
  const options = answer.content.options ?? [];
  const selected = new Set(answer.response?.selectedOptionIds ?? []);
  const correct = new Set(answer.answerKey?.correctOptionIds ?? []);

  return (
    <ul className="space-y-1">
      {options.map((o) => {
        const wasSelected = selected.has(o.id);
        const isCorrect = correct.has(o.id);
        return (
          <li
            key={o.id}
            className={
              isCorrect
                ? "rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1 text-sm dark:border-emerald-900 dark:bg-emerald-950"
                : wasSelected
                  ? "rounded-md border border-destructive/40 bg-destructive/10 px-2 py-1 text-sm"
                  : "rounded-md border px-2 py-1 text-sm text-muted-foreground"
            }
          >
            {o.text}
            {wasSelected && (
              <span className="ml-2 text-xs font-medium">
                (student&apos;s answer)
              </span>
            )}
            {isCorrect && (
              <span className="ml-2 text-xs font-medium">(correct)</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function OrderComparison({ answer }: { answer: EvaluationAnswerDetail }) {
  const given = answer.response?.order ?? [];
  const correct = answer.answerKey?.correctOrder ?? [];
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <p className="text-xs font-medium text-muted-foreground">
          Student&apos;s order
        </p>
        <ol className="list-decimal space-y-0.5 pl-5 text-sm">
          {given.length === 0 && (
            <li className="list-none text-muted-foreground">No answer</li>
          )}
          {given.map((id) => (
            <li key={id}>{optionText(answer.content, id)}</li>
          ))}
        </ol>
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">
          Correct order
        </p>
        <ol className="list-decimal space-y-0.5 pl-5 text-sm">
          {correct.map((id) => (
            <li key={id}>{optionText(answer.content, id)}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function AnswerBody({ answer }: { answer: EvaluationAnswerDetail }) {
  if (answer.content.options && answer.answerKey?.correctOptionIds) {
    return <OptionsComparison answer={answer} />;
  }
  if (answer.content.options && answer.answerKey?.correctOrder) {
    return <OrderComparison answer={answer} />;
  }
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">
        Student&apos;s response
      </p>
      <p className="rounded-md border bg-muted/30 p-2 text-sm">
        {answer.response?.text || "No text response submitted."}
      </p>
    </div>
  );
}

function ScoreBadge({ answer }: { answer: EvaluationAnswerDetail }) {
  if (answer.evaluationStatus === "pending") {
    return <Badge variant="destructive">Needs scoring</Badge>;
  }
  const score = answer.finalScore ?? answer.autoScore ?? 0;
  return (
    <Badge
      variant={
        answer.evaluationStatus === "auto_scored" ? "secondary" : "default"
      }
    >
      {score} / {answer.marks} ·{" "}
      {answer.evaluationStatus === "auto_scored" ? "auto-scored" : "evaluated"}
    </Badge>
  );
}

function ScoreForm({
  answer,
  attemptId,
}: {
  answer: EvaluationAnswerDetail;
  attemptId: string;
}) {
  const [score, setScore] = useState("");
  const [remarks, setRemarks] = useState("");
  const { mutate: scoreAnswer, isPending } =
    useScoreAssessmentAnswer(attemptId);

  function handleSave() {
    const manual_score = Number(score);
    if (score.trim() === "" || Number.isNaN(manual_score)) {
      toast.error("Enter a valid score");
      return;
    }
    if (manual_score < 0 || manual_score > answer.marks) {
      toast.error(`Score must be between 0 and ${answer.marks}`);
      return;
    }
    scoreAnswer(
      {
        answerId: answer.id,
        data: { manual_score, remarks: remarks.trim() || undefined },
      },
      {
        onSuccess: () => toast.success("Answer scored"),
      },
    );
  }

  return (
    <div className="flex flex-wrap items-end gap-2 rounded-md border border-dashed p-2">
      <div className="space-y-1">
        <Label htmlFor={`score-${answer.id}`} className="text-xs">
          Score (max {answer.marks})
        </Label>
        <Input
          id={`score-${answer.id}`}
          type="number"
          min={0}
          max={answer.marks}
          value={score}
          onChange={(e) => setScore(e.target.value)}
          className="h-8 w-24"
        />
      </div>
      <div className="min-w-40 flex-1 space-y-1">
        <Label htmlFor={`remarks-${answer.id}`} className="text-xs">
          Remarks (optional)
        </Label>
        <Textarea
          id={`remarks-${answer.id}`}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          className="h-8 min-h-8 py-1.5"
        />
      </div>
      <Button
        size="sm"
        className="h-8"
        onClick={handleSave}
        disabled={isPending}
      >
        {isPending ? "Saving..." : "Save Score"}
      </Button>
    </div>
  );
}

export default function EvaluationDetailPage() {
  const params = useParams<{ attemptId: string }>();
  const attemptId = params.attemptId;

  const { data: attempt, isLoading } = useEvaluationDetail(attemptId);
  const { mutate: publish, isPending: isPublishing } =
    usePublishAssessmentResult();
  const { mutate: restart, isPending: isRestarting } =
    useRestartAssessmentAttempt();
  const [restartOpen, setRestartOpen] = useState(false);

  function handlePublish() {
    publish(attemptId, {
      onSuccess: () => toast.success("Result published"),
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  function handleRestart() {
    restart(attemptId, {
      onSuccess: () => {
        toast.success("Assessment restarted");
        setRestartOpen(false);
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  if (isLoading || !attempt) {
    return (
      <div className="flex h-full flex-col gap-6 p-6">
        <Skeleton className="h-8 w-64" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const pendingCount = attempt.answers.filter(
    (a) => a.evaluationStatus === "pending",
  ).length;
  const canPublish =
    attempt.status === "under_evaluation" && pendingCount === 0;

  const sections = new Map<
    string,
    { name: string; answers: EvaluationAnswerDetail[] }
  >();
  for (const a of attempt.answers) {
    if (!sections.has(a.sectionId)) {
      sections.set(a.sectionId, { name: a.sectionName, answers: [] });
    }
    sections.get(a.sectionId)!.answers.push(a);
  }

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-6">
      <div className="flex items-start justify-between">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 -ml-2" asChild>
            <Link href="/assessments/evaluation">
              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
              Back to queue
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {attempt.studentName}
          </h1>
          {attempt.studentEmail && (
            <p className="text-sm text-muted-foreground">
              {attempt.studentEmail}
            </p>
          )}
          <div className="mt-2 flex items-center gap-2">
            <Badge>{attempt.status.replace(/_/g, " ")}</Badge>
            {attempt.totalScore != null && (
              <Badge variant="secondary">
                {attempt.totalScore.toFixed(2)} / {attempt.maxScore?.toFixed(2)}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setRestartOpen(true)}
            disabled={isRestarting}
          >
            <RotateCcw className="mr-1.5 h-4 w-4" />
            Restart Assessment
          </Button>
          {attempt.status === "under_evaluation" && (
            <Button
              onClick={handlePublish}
              disabled={!canPublish || isPublishing}
              title={
                !canPublish
                  ? `${pendingCount} answer(s) still need scoring`
                  : undefined
              }
            >
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              {isPublishing
                ? "Publishing..."
                : canPublish
                  ? "Publish Result"
                  : `${pendingCount} pending`}
            </Button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={restartOpen}
        onOpenChange={setRestartOpen}
        title="Restart Assessment"
        description="This will permanently erase all of this student's answers and restart the assessment from scratch — a fresh attempt, as if it had never been started. This cannot be undone."
        confirmLabel="Restart"
        variant="destructive"
        isPending={isRestarting}
        onConfirm={handleRestart}
      />

      <div className="space-y-6">
        {Array.from(sections.entries()).map(([sectionId, section]) => (
          <div key={sectionId} className="space-y-3">
            <h2 className="text-lg font-semibold">{section.name}</h2>
            {section.answers
              .sort((a, b) => a.questionOrder - b.questionOrder)
              .map((answer) => (
                <div
                  key={answer.id}
                  className="space-y-2 rounded-xl border p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">
                      #{answer.questionOrder + 1}{" "}
                      {answer.content.text && (
                        <span className="font-normal text-muted-foreground">
                          — {answer.content.text}
                        </span>
                      )}
                    </p>
                    <ScoreBadge answer={answer} />
                  </div>
                  <AnswerBody answer={answer} />
                  {answer.evaluationStatus === "pending" && (
                    <ScoreForm answer={answer} attemptId={attemptId} />
                  )}
                  {answer.evaluationRemarks && (
                    <p className="text-xs text-muted-foreground">
                      Remarks: {answer.evaluationRemarks}
                    </p>
                  )}
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
