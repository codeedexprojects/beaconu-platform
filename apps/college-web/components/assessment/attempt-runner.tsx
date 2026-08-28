"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/api";
import {
  useAttemptSectionQuestion,
  useAttemptSections,
  useRecordAntiCheatEvent,
  useSaveAnswer,
  useSubmitAttempt,
} from "@/hooks/use-assessment";
import { QuestionRenderer } from "@/components/assessment/question-types/question-renderer";
import { AssessmentAudioPlayer } from "@/components/assessment/audio-player";
import { AttemptStatusBar } from "@/components/assessment/attempt-header";
import { AttemptNavBar } from "@/components/assessment/attempt-nav-bar";
import { AttemptReview } from "@/components/assessment/attempt-review";
import { useQuestionTimer } from "@/components/assessment/use-question-timer";
import type { AnswerResponse, AssessmentAttemptItem } from "@beaconu/types";

interface AttemptRunnerProps {
  attempt: AssessmentAttemptItem;
  onComplete: () => void;
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

export function AttemptRunner({ attempt, onComplete }: AttemptRunnerProps) {
  const router = useRouter();
  const attemptId = attempt.id;
  const { data: sections, isLoading: isLoadingSections } = useAttemptSections(
    attemptId,
    true,
  );
  const [sectionIndex, setSectionIndex] = useState(0);
  const [questionOrder, setQuestionOrder] = useState(1);
  const [isReviewing, setIsReviewing] = useState(false);
  const currentSection = sections?.[sectionIndex];

  const {
    data: page,
    isLoading: isLoadingQuestion,
    error: questionError,
  } = useAttemptSectionQuestion(
    attemptId,
    currentSection?.sectionId,
    questionOrder,
    !!currentSection && !isReviewing,
  );

  const { mutate: saveAnswerMutation } = useSaveAnswer(attemptId);
  const { mutate: submitAttemptMutation, isPending: isSubmitting } =
    useSubmitAttempt(attemptId);
  const { mutate: recordAntiCheat } = useRecordAntiCheatEvent(attemptId);

  const [localResponse, setLocalResponse] = useState<AnswerResponse>({});
  const [isFlagged, setIsFlagged] = useState(false);
  const questionStartRef = useRef<number>(0);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Whole-attempt countdown — the sum of every section's real time budget,
  // running continuously from the moment the attempt starts and never
  // resetting on question/section navigation.
  const totalDurationSecs = sections
    ? sections.reduce((sum, s) => sum + s.timeLimitMins * 60, 0)
    : null;
  const timeLeftSecs = useQuestionTimer(totalDurationSecs, attemptId);

  // Reset local answer state whenever the loaded question changes, seeded
  // from whatever was previously saved for it (myAnswer).
  useEffect(() => {
    if (!page) return;
    setLocalResponse(page.question.myAnswer?.response ?? {});
    setIsFlagged(page.question.myAnswer?.isFlagged ?? false);
    questionStartRef.current = Date.now();
  }, [page]);

  // Anti-cheat: report tab visibility changes. The backend's auto-submit
  // sweep terminates the attempt if the last event was tab_hidden more than
  // 10s ago (server-side timer, not client-side) — this only needs to
  // report the visibility transitions accurately.
  useEffect(() => {
    function handleVisibilityChange() {
      recordAntiCheat(document.hidden ? "tab_hidden" : "tab_visible");
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId]);

  function persistAnswer(
    questionId: string,
    response: AnswerResponse,
    flagged: boolean,
  ) {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      const timeSpentSecs = Math.round(
        (Date.now() - questionStartRef.current) / 1000,
      );
      saveAnswerMutation({
        questionId,
        response: isEmptyResponse(response) ? undefined : response,
        isFlagged: flagged,
        timeSpentSecs,
      });
    }, 600);
  }

  function handleResponseChange(response: AnswerResponse) {
    setLocalResponse(response);
    if (page) persistAnswer(page.question.questionId, response, isFlagged);
  }

  function toggleFlag() {
    if (!page) return;
    const next = !isFlagged;
    setIsFlagged(next);
    persistAnswer(page.question.questionId, localResponse, next);
  }

  function goToQuestion(order: number) {
    setQuestionOrder(order);
  }

  function goToNextSection() {
    if (!sections) return;
    if (sectionIndex < sections.length - 1) {
      setSectionIndex((i) => i + 1);
      setQuestionOrder(1);
    }
  }

  function goToPreviousSection() {
    if (sectionIndex > 0) {
      setSectionIndex((i) => i - 1);
      setQuestionOrder(1);
    }
  }

  function goToNext() {
    if (!page) return;
    if (!page.hasNext && isLastSection) {
      setIsReviewing(true);
      return;
    }
    if (page.hasNext) {
      goToQuestion(questionOrder + 1);
    } else {
      goToNextSection();
    }
  }

  function jumpToQuestion(
    targetSectionIndex: number,
    targetQuestionOrder: number,
  ) {
    setIsReviewing(false);
    setSectionIndex(targetSectionIndex);
    setQuestionOrder(targetQuestionOrder);
  }

  function handleSubmit() {
    submitAttemptMutation(undefined, {
      onSuccess: () => {
        toast.success("Assessment submitted");
        onComplete();
      },
      onError: (err) => {
        toast.error(getErrorMessage(err));
      },
    });
  }

  if (isLoadingSections) {
    return <div className="h-64 animate-pulse rounded-2xl border bg-muted" />;
  }

  if (!sections || sections.length === 0 || !currentSection) {
    return (
      <p className="rounded-2xl border border-border/60 p-5 text-sm text-muted-foreground">
        This assessment has no sections configured yet.
      </p>
    );
  }

  const isLastSection = sectionIndex === sections.length - 1;

  if (isReviewing) {
    return (
      <div className="space-y-4">
        <AttemptStatusBar
          questionOrder={sections.reduce((sum, s) => sum + s.answeredCount, 0)}
          totalQuestions={sections.reduce((sum, s) => sum + s.questionCount, 0)}
          timeLeftSecs={timeLeftSecs}
          sectionLabel="Review"
          onBack={() => setIsReviewing(false)}
        />
        <AttemptReview
          attemptId={attemptId}
          sections={sections}
          onJumpToQuestion={jumpToQuestion}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AttemptStatusBar
        questionOrder={page?.questionOrder ?? questionOrder}
        totalQuestions={page?.totalQuestions ?? currentSection.questionCount}
        timeLeftSecs={timeLeftSecs}
        sectionLabel={currentSection.name}
        onBack={() => router.back()}
      />

      {sections.length > 1 ? (
        <div className="flex gap-1 overflow-x-auto rounded-full bg-field p-1">
          {sections.map((section, i) => (
            <button
              key={section.id}
              type="button"
              onClick={() => {
                setSectionIndex(i);
                setQuestionOrder(1);
              }}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-colors",
                i === sectionIndex
                  ? "bg-headerTeal-dark text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {section.name}
              <span className="ml-1.5 opacity-70">
                {section.answeredCount}/{section.questionCount}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {isLoadingQuestion || !page ? (
        <div className="h-48 animate-pulse rounded-2xl border bg-muted" />
      ) : questionError ? (
        <p className="text-sm text-destructive">
          {getErrorMessage(questionError)}
        </p>
      ) : (
        <>
          <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {page.question.questionTypeName}
            </p>
            <div className="space-y-3 border-t border-border/40 pt-4">
              <div className="space-y-1">
                {page.question.content.text ? (
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {page.question.content.text}
                  </p>
                ) : null}
                {page.question.content.question ? (
                  <p className="text-sm font-medium text-foreground">
                    {page.question.content.question}
                  </p>
                ) : null}
                {page.question.content.imageUrl ? (
                  <img
                    src={page.question.content.imageUrl}
                    alt="Question reference"
                    className="mt-2 max-h-64 rounded-xl object-contain"
                  />
                ) : null}
              </div>

              {page.question.content.audioUrl ? (
                <AssessmentAudioPlayer
                  src={page.question.content.audioUrl}
                  size="large"
                  className="py-2"
                />
              ) : null}

              <QuestionRenderer
                content={page.question.content}
                response={localResponse}
                onChange={handleResponseChange}
                responseFormat={page.question.responseFormat}
              />
            </div>
          </div>

          <AttemptNavBar
            onPrevious={() => {
              if (page.hasPrevious) {
                goToQuestion(questionOrder - 1);
              } else {
                goToPreviousSection();
              }
            }}
            previousDisabled={!page.hasPrevious && sectionIndex === 0}
            onNext={goToNext}
            onSkip={goToNext}
            isFlagged={isFlagged}
            onToggleFlag={toggleFlag}
            isLast={!page.hasNext && isLastSection}
            isSubmitting={isSubmitting}
          />
        </>
      )}
    </div>
  );
}
