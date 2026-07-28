import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import { educationBoardsService } from "@/lib/services/education-boards.service";
import type {
  CreateEducationBoardInput,
  UpdateEducationBoardInput,
} from "@beaconu/types";

export function useEducationBoards(filters?: {
  grade?: string;
  is_active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: QUERY_KEYS.educationBoards(filters),
    queryFn: () => educationBoardsService.getAll(filters),
  });
}

export function useEducationBoard(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.educationBoard(id),
    queryFn: () => educationBoardsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateEducationBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEducationBoardInput) =>
      educationBoardsService.create(data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.educationBoards(),
      });
    },
  });
}

export function useUpdateEducationBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateEducationBoardInput;
    }) => educationBoardsService.update(id, data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.educationBoards(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.educationBoard(id),
      });
    },
  });
}

export function useDeactivateEducationBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => educationBoardsService.deactivate(id),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.educationBoards(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.educationBoard(id),
      });
    },
  });
}

export function useActivateEducationBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => educationBoardsService.activate(id),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.educationBoards(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.educationBoard(id),
      });
    },
  });
}
