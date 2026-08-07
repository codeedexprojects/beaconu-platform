import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getFeeStructures,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  type CreateFeeStructureInput,
  type UpdateFeeStructureInput,
} from "@/lib/services/colleges.service";

export function useFeeStructures(courseId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.feeStructures(courseId ?? ""),
    queryFn: () => getFeeStructures(courseId as string),
    enabled: !!courseId,
  });
}

export function useCreateFeeStructure(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFeeStructureInput) =>
      createFeeStructure(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.feeStructures(courseId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateFeeStructure(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      feeStructureId,
      data,
    }: {
      feeStructureId: string;
      data: UpdateFeeStructureInput;
    }) => updateFeeStructure(courseId, feeStructureId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.feeStructures(courseId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteFeeStructure(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (feeStructureId: string) =>
      deleteFeeStructure(courseId, feeStructureId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.feeStructures(courseId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
