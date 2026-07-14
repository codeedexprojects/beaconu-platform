import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getCollegeQuotas,
  getCollegeQuotaUsage,
  createCollegeQuota,
  updateCollegeQuota,
  deleteCollegeQuota,
  type CreateQuotaInput,
  type UpdateQuotaInput,
} from "@/lib/services/colleges.service";

export function useCollegeQuotas(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.quotas,
    queryFn: () => getCollegeQuotas(true),
    enabled,
  });
}

export function useQuotaUsage(id: string, enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.quotaUsage(id),
    queryFn: () => getCollegeQuotaUsage(id),
    enabled,
  });
}

export function useCreateQuota() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateQuotaInput) => createCollegeQuota(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quotas });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateQuota() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQuotaInput }) =>
      updateCollegeQuota(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quotas });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteQuota() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCollegeQuota(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quotas });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
