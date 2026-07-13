import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  createSubmissionRequest,
  getSubmissionRequests,
  reviewSubmission,
  getDocumentRequests,
  startReviewDocumentRequest,
  sendForApprovalDocumentRequest,
  approveDocumentRequest,
  issueDocumentRequest,
  rejectDocumentRequest,
  getDocumentTemplates,
  createDocumentTemplate,
  updateDocumentTemplate,
  activateDocumentTemplate,
  deactivateDocumentTemplate,
  type DocumentListFilters,
} from "@/lib/services/documents.service";
import type {
  CreateSubmissionRequestInput,
  ReviewSubmissionInput,
  IssueDocumentRequestInput,
  RejectDocumentRequestInput,
  CreateDocumentTemplateInput,
  UpdateDocumentTemplateInput,
} from "@beaconu/types";

// ── Direction A: documents requested FROM students ─────────────────────────

export function useSubmissionRequests(filters: DocumentListFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.submissionRequests(filters),
    queryFn: () => getSubmissionRequests(filters),
  });
}

export function useCreateSubmissionRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSubmissionRequestInput) =>
      createSubmissionRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.submissionRequests(),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useReviewSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      data,
    }: {
      requestId: string;
      data: ReviewSubmissionInput;
    }) => reviewSubmission(requestId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.submissionRequests(),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// ── Direction B: documents requested BY students ────────────────────────────

export function useDocumentRequests(filters: DocumentListFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.documentRequests(filters),
    queryFn: () => getDocumentRequests(filters),
  });
}

export function useStartReviewDocumentRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => startReviewDocumentRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.documentRequests(),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useSendForApprovalDocumentRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) =>
      sendForApprovalDocumentRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.documentRequests(),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useApproveDocumentRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => approveDocumentRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.documentRequests(),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useIssueDocumentRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      data,
    }: {
      requestId: string;
      data: IssueDocumentRequestInput;
    }) => issueDocumentRequest(requestId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.documentRequests(),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useRejectDocumentRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      data,
    }: {
      requestId: string;
      data: RejectDocumentRequestInput;
    }) => rejectDocumentRequest(requestId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.documentRequests(),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

// ── Document templates: catalog of documents students can request ────────

export function useDocumentTemplates(includeInactive = false) {
  return useQuery({
    queryKey: QUERY_KEYS.documentTemplates(includeInactive),
    queryFn: () => getDocumentTemplates(includeInactive),
  });
}

export function useCreateDocumentTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDocumentTemplateInput) =>
      createDocumentTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["college-document-templates"],
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateDocumentTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      templateId,
      data,
    }: {
      templateId: string;
      data: UpdateDocumentTemplateInput;
    }) => updateDocumentTemplate(templateId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["college-document-templates"],
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useActivateDocumentTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) => activateDocumentTemplate(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["college-document-templates"],
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeactivateDocumentTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) => deactivateDocumentTemplate(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["college-document-templates"],
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
