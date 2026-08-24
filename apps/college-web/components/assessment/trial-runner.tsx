"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { useTrialPaper, useSubmitTrial } from "@/hooks/use-assessment";
import { QuestionRenderer } from "@/components/assessment/question-types/question-renderer";
import { AssessmentAudioPlayer } from "@/components/assessment/audio-player";
import { AttemptStatusBar } from "@/components/assessment/attempt-header";
import { AttemptNavBar } from "@/components/assessment/attempt-nav-bar";
import { Button } from "@/components/ui/button";
import type { AnswerResponse, TrialResult } from "@beaconu/types";

interface TrialRunnerProps {
  templateId: string;
  onComplete: (result: TrialResult) => void;
  onExit: () => void;
}

function isEmptyResponse(response: AnswerResponse): boolean {
  return (
    !response.selectedOptionIds?.length &&
    !response.order?.length &&
    !response.blankAnswers?.length &&
    !response.text &&
    !response.audioUrl
  );
}

export function TrialRunner({
  templateId,
  onComplete,
  onExit,
}: TrialRunnerProps) {
  const { data: paper, isLoading, error } = useTrialPaper(templateId, true);
  const { mutate: submit, isPending } = useSubmitTrial(templateId);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerResponse>>({});

  const questions = paper?.questions ?? [];
  const current = questions[index];
  const answeredCount = useMemo(
    () =>
      Object.values(answers).filter((response) => !isEmptyResponse(response))
        .length,
    [answers],
  );

  function setAnswer(questionId: string, response: AnswerResponse) {
    setAnswers((prev) => ({ ...prev, [questionId]: response }));
  }

  function handleSubmit() {
    const payload = {
      answers: Object.entries(answers)
        .filter(([, response]) => !isEmptyResponse(response))
        .map(([question_id, response]) => ({ question_id, response })),
    };
    submit(payload, {
      onSuccess: (result) => {
        toast.success("Trial submitted");
        onComplete(result);
      },
      onError: (err) => {
        toast.error(getErrorMessage(err));
      },
    });
  }

  if (isLoading) {
    return <div className="h-64 animate-pulse rounded-2xl border bg-muted" />;
  }

  if (error) {
    return (
      <div className="space-y-3 rounded-2xl border border-border/60 p-5">
        <p className="text-sm text-destructive">{getErrorMessage(error)}</p>
        <Button type="button" variant="outline" onClick={onExit}>
          Back
        </Button>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="space-y-3 rounded-2xl border border-border/60 p-5">
        <p className="text-sm text-muted-foreground">
          This trial paper has no questions yet.
        </p>
        <Button type="button" variant="outline" onClick={onExit}>
          Back
        </Button>
      </div>
    );
  }

  const currentResponse = answers[current.id] ?? {};
  const isLast = index === questions.length - 1;

  return (
    <div className="space-y-4">
      <AttemptStatusBar
        questionOrder={index + 1}
        totalQuestions={questions.length}
        timeLeftSecs={null}
        sectionLabel={current.sectionName}
        onBack={onExit}
      />
      <p className="text-center text-xs text-muted-foreground">
        {answeredCount} of {questions.length} answered
      </p>

      <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-5">
        <div className="space-y-3">
          <div className="space-y-1">
            {current.content.text ? (
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {current.content.text}
              </p>
            ) : null}
            {current.content.question ? (
              <p className="text-sm font-medium text-foreground">
                {current.content.question}
              </p>
            ) : null}
            {current.content.imageUrl ? (
              <img
                src={current.content.imageUrl}
                alt="Question reference"
                className="mt-2 max-h-64 rounded-xl object-contain"
              />
            ) : null}
          </div>

          {current.content.audioUrl ? (
            <AssessmentAudioPlayer
              src={current.content.audioUrl}
              size="large"
              className="py-2"
            />
          ) : null}

          <QuestionRenderer
            content={current.content}
            response={currentResponse}
            onChange={(response) => setAnswer(current.id, response)}
          />
        </div>
      </div>

      <AttemptNavBar
        onPrevious={() => setIndex((i) => Math.max(0, i - 1))}
        previousDisabled={index === 0}
        onNext={() => {
          if (isLast) {
            handleSubmit();
            return;
          }
          setIndex((i) => Math.min(questions.length - 1, i + 1));
        }}
        isLast={isLast}
        isSubmitting={isPending}
      />
    </div>
  );
}
