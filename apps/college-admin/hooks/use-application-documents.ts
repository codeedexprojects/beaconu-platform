import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getDocumentsUnderReview,
  getPartiallyVerifiedDocuments,
  getDocumentVerificationDetail,
  verifyApplicationDocument,
  rejectApplicationDocument,
} from "@/lib/services/application-documents.service";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getErrorMessage } from "@/lib/api";

export function useDocumentsUnderReview(
  page: number,
  search?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: QUERY_KEYS.documentsUnderReview(page, search),
    queryFn: () => getDocumentsUnderReview(page, 20, search),
    enabled,
  });
}

export function usePartiallyVerifiedDocuments(
  page: number,
  search?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: QUERY_KEYS.partiallyVerifiedDocuments(page, search),
    queryFn: () => getPartiallyVerifiedDocuments(page, 20, search),
    enabled,
  });
}

export function useDocumentVerificationDetail(applicationId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.documentVerificationDetail(applicationId),
    queryFn: () => getDocumentVerificationDetail(applicationId),
    enabled: !!applicationId,
  });
}

function invalidateDocumentQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  applicationId: string,
) {
  void queryClient.invalidateQueries({
    queryKey: QUERY_KEYS.documentVerificationDetail(applicationId),
  });
  void queryClient.invalidateQueries({
    queryKey: QUERY_KEYS.documentsUnderReview(),
  });
  void queryClient.invalidateQueries({
    queryKey: QUERY_KEYS.partiallyVerifiedDocuments(),
  });
}

export function useVerifyDocument(applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => verifyApplicationDocument(documentId),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => invalidateDocumentQueries(queryClient, applicationId),
  });
}

export function useRejectDocument(applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      documentId,
      reason,
    }: {
      documentId: string;
      reason: string;
    }) => rejectApplicationDocument(documentId, reason),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => invalidateDocumentQueries(queryClient, applicationId),
  });
}
