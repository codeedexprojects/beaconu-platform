import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getAssessmentSections,
  toggleAssessmentSection,
  getQuestionTypes,
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getAssessmentTemplates,
  getAssessmentTemplate,
  createAssessmentTemplate,
  updateAssessmentTemplate,
  activateAssessmentTemplate,
  archiveAssessmentTemplate,
  generateAssessmentPaper,
  getAssessmentPapers,
  getAssessmentPaper,
  approveAssessmentPaper,
  renameAssessmentPaper,
  deleteAssessmentPaper,
  getAssessmentSlots,
  createAssessmentSlot,
  updateAssessmentSlot,
  toggleAssessmentSlot,
  getEvaluationQueue,
  getEvaluationDetail,
  scoreAssessmentAnswer,
  publishAssessmentResult,
  restartAssessmentAttempt,
} from "@/lib/services/assessments.service";
import type {
  CreateQuestionInput,
  UpdateQuestionInput,
  QuestionListQuery,
  CreateTemplateInput,
  UpdateTemplateInput,
  GeneratePaperInput,
  CreateSlotInput,
  UpdateSlotInput,
  ScoreOverrideInput,
} from "@beaconu/types";

export function useAssessmentSections() {
  return useQuery({
    queryKey: QUERY_KEYS.assessmentSections,
    queryFn: getAssessmentSections,
  });
}

export function useToggleAssessmentSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, isActive }: { slug: string; isActive: boolean }) =>
      toggleAssessmentSection(slug, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.assessmentSections,
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useQuestionTypes(slug: string) {
  return useQuery({
    queryKey: QUERY_KEYS.assessmentQuestionTypes(slug),
    queryFn: () => getQuestionTypes(slug),
  });
}

export function useQuestions(slug: string, filters: QuestionListQuery = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.assessmentQuestions(slug, filters),
    queryFn: () => getQuestions(slug, filters),
  });
}

export function useCreateQuestion(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateQuestionInput) => createQuestion(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.assessmentQuestions(slug),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateQuestion(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQuestionInput }) =>
      updateQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.assessmentQuestions(slug),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteQuestion(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.assessmentQuestions(slug),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useAssessmentTemplates() {
  return useQuery({
    queryKey: QUERY_KEYS.assessmentTemplates,
    queryFn: getAssessmentTemplates,
  });
}

export function useAssessmentTemplate(id: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.assessmentTemplate(id),
    queryFn: () => getAssessmentTemplate(id),
    enabled,
  });
}

export function useCreateAssessmentTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTemplateInput) => createAssessmentTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.assessmentTemplates,
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateAssessmentTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTemplateInput }) =>
      updateAssessmentTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.assessmentTemplates,
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useActivateAssessmentTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => activateAssessmentTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.assessmentTemplates,
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useArchiveAssessmentTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => archiveAssessmentTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.assessmentTemplates,
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useAssessmentPapers(templateId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.assessmentPapers(templateId),
    queryFn: () => getAssessmentPapers(templateId),
  });
}

export function useAssessmentPaper(id: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.assessmentPaper(id),
    queryFn: () => getAssessmentPaper(id),
    enabled,
  });
}

export function useGenerateAssessmentPaper(templateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GeneratePaperInput) =>
      generateAssessmentPaper(templateId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.assessmentPapers(templateId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useApproveAssessmentPaper(templateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveAssessmentPaper(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.assessmentPapers(templateId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useRenameAssessmentPaper(templateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      renameAssessmentPaper(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.assessmentPapers(templateId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteAssessmentPaper(templateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAssessmentPaper(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.assessmentPapers(templateId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useAssessmentSlots(templateId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.assessmentSlots(templateId),
    queryFn: () => getAssessmentSlots(templateId),
  });
}

export function useCreateAssessmentSlot(templateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSlotInput) =>
      createAssessmentSlot(templateId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.assessmentSlots(templateId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateAssessmentSlot(templateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSlotInput }) =>
      updateAssessmentSlot(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.assessmentSlots(templateId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useToggleAssessmentSlot(templateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleAssessmentSlot(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.assessmentSlots(templateId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useEvaluationQueue(status?: string[]) {
  return useQuery({
    queryKey: QUERY_KEYS.evaluationQueue(status),
    queryFn: () => getEvaluationQueue(status),
  });
}

export function useEvaluationDetail(attemptId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.evaluationDetail(attemptId),
    queryFn: () => getEvaluationDetail(attemptId),
  });
}

export function useScoreAssessmentAnswer(attemptId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      answerId,
      data,
    }: {
      answerId: string;
      data: ScoreOverrideInput;
    }) => scoreAssessmentAnswer(answerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.evaluationDetail(attemptId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.evaluationQueue() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function usePublishAssessmentResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attemptId: string) => publishAssessmentResult(attemptId),
    onSuccess: (_data, attemptId) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.evaluationDetail(attemptId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.evaluationQueue() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useRestartAssessmentAttempt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attemptId: string) => restartAssessmentAttempt(attemptId),
    onSuccess: (_data, attemptId) => {
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.evaluationDetail(attemptId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.evaluationQueue() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
