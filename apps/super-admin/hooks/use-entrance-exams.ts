import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import { entranceExamsService } from "@/lib/services/entrance-exams.service";
import type { Paginated } from "@/lib/api";
import type {
  EntranceExamListItem,
  CreateEntranceExamInput,
  UpdateEntranceExamInput,
} from "@beaconu/types";

export function useEntranceExams(params?: {
  status?: string;
  exam_level?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery<Paginated<EntranceExamListItem>>({
    queryKey: QUERY_KEYS.entranceExams(params),
    queryFn: () => entranceExamsService.list(params),
  });
}

export function useEntranceExam(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.entranceExam(id),
    queryFn: () => entranceExamsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateEntranceExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEntranceExamInput) =>
      entranceExamsService.create(data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.entranceExams(),
      });
    },
  });
}

export function useUpdateEntranceExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEntranceExamInput }) =>
      entranceExamsService.update(id, data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.entranceExams(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.entranceExam(id),
      });
    },
  });
}

export function useDeactivateEntranceExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => entranceExamsService.deactivate(id),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.entranceExams(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.entranceExam(id),
      });
    },
  });
}

export function useActivateEntranceExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => entranceExamsService.activate(id),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.entranceExams(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.entranceExam(id),
      });
    },
  });
}
