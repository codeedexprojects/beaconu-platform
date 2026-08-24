import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import {
  getAssessmentStart,
  getAttemptOverview,
  getAttemptSections,
  getMyAttempt,
  getSectionQuestion,
  getTrialPaper,
  recordAntiCheatEvent,
  saveAnswer,
  startAttempt,
  submitAttempt,
  submitTrial,
} from "@/lib/services/assessment.service";
import type {
  AnswerResponse,
  AntiCheatEventType,
  SubmitTrialInput,
} from "@beaconu/types";

export function useAssessmentStart(applicationId: string, enabled: boolean) {
  return useQuery({
    queryKey: QUERY_KEYS.assessmentStart(applicationId),
    queryFn: () => getAssessmentStart(applicationId),
    enabled,
  });
}

export function useTrialPaper(
  templateId: string | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: QUERY_KEYS.trialPaper(templateId ?? ""),
    queryFn: () => getTrialPaper(templateId!),
    enabled: enabled && !!templateId,
  });
}

export function useSubmitTrial(templateId: string | undefined) {
  return useMutation({
    mutationFn: (input: SubmitTrialInput) => submitTrial(templateId!, input),
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useStartAttempt(applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => startAttempt(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.assessmentStart(applicationId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useMyAttempt(attemptId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: QUERY_KEYS.myAttempt(attemptId ?? ""),
    queryFn: () => getMyAttempt(attemptId!),
    enabled: enabled && !!attemptId,
  });
}

export function useAttemptSections(
  attemptId: string | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: QUERY_KEYS.attemptSections(attemptId ?? ""),
    queryFn: () => getAttemptSections(attemptId!),
    enabled: enabled && !!attemptId,
  });
}

export function useAttemptSectionQuestion(
  attemptId: string | undefined,
  sectionId: string | undefined,
  questionOrder: number,
  enabled: boolean,
) {
  return useQuery({
    queryKey: QUERY_KEYS.attemptSectionQuestion(
      attemptId ?? "",
      sectionId ?? "",
      questionOrder,
    ),
    queryFn: () => getSectionQuestion(attemptId!, sectionId!, questionOrder),
    enabled: enabled && !!attemptId && !!sectionId,
  });
}

export function useAttemptOverview(
  attemptId: string | undefined,
  sectionId: string | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: QUERY_KEYS.attemptOverview(attemptId ?? "", sectionId ?? ""),
    queryFn: () => getAttemptOverview(attemptId!, sectionId!),
    enabled: enabled && !!attemptId && !!sectionId,
  });
}

export function useSaveAnswer(attemptId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      questionId,
      response,
      isFlagged,
      timeSpentSecs,
    }: {
      questionId: string;
      response?: AnswerResponse;
      isFlagged?: boolean;
      timeSpentSecs?: number;
    }) =>
      saveAnswer(attemptId, questionId, {
        response,
        is_flagged: isFlagged,
        time_spent_secs: timeSpentSecs,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.attemptSections(attemptId),
      });
      // Every attemptSectionQuestion page whose myAnswer could now be stale
      // — not just the one just saved. This matters most after jumping back
      // from the review screen: revisiting an earlier question and saving a
      // change must not leave OTHER already-cached questions (fetched
      // during the original pass through the paper) showing outdated
      // myAnswer data once the student navigates back to them.
      queryClient.invalidateQueries({
        queryKey: ["attempt-section-question", attemptId],
      });
      queryClient.invalidateQueries({
        queryKey: ["attempt-overview", attemptId],
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useRecordAntiCheatEvent(attemptId: string) {
  return useMutation({
    mutationFn: (type: AntiCheatEventType) =>
      recordAntiCheatEvent(attemptId, type),
  });
}

export function useSubmitAttempt(attemptId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => submitAttempt(attemptId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.myAttempt(attemptId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
