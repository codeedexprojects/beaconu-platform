import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getNotices,
  getNotice,
  createNotice,
  updateNotice,
  archiveNotice,
  restoreNotice,
  type NoticeListFilters,
} from "@/lib/services/notice.service";
import type { CreateNoticeInput, UpdateNoticeInput } from "@beaconu/types";

export function useNotices(filters: NoticeListFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.notices(filters),
    queryFn: () => getNotices(filters),
  });
}

export function useNotice(id: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.notice(id ?? ""),
    queryFn: () => getNotice(id as string),
    enabled: !!id,
  });
}

export function useCreateNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateNoticeInput) => createNotice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notices() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNoticeInput }) =>
      updateNotice(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notices() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notice(id) });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useArchiveNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => archiveNotice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notices() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useRestoreNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => restoreNotice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.notices() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
