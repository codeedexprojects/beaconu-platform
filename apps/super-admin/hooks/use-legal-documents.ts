import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getLegalDocuments,
  saveLegalDocument,
  setLegalDocumentStatus,
} from "@/lib/services/legal-documents.service";
import type {
  LegalDocumentStatus,
  LegalDocumentType,
  UpsertLegalDocumentInput,
} from "@beaconu/types";

export function useLegalDocuments() {
  return useQuery({
    queryKey: QUERY_KEYS.legalDocuments,
    queryFn: getLegalDocuments,
  });
}

export function useSaveLegalDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      docType,
      payload,
    }: {
      docType: LegalDocumentType;
      payload: UpsertLegalDocumentInput;
    }) => saveLegalDocument(docType, payload),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.legalDocuments,
      });
    },
  });
}

export function useSetLegalDocumentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      docType,
      status,
    }: {
      docType: LegalDocumentType;
      status: LegalDocumentStatus;
    }) => setLegalDocumentStatus(docType, status),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.legalDocuments,
      });
    },
  });
}
