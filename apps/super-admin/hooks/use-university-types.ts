import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  universityTypesService,
  type CreateUniversityTypeInput,
  type UpdateUniversityTypeInput,
} from "@/lib/services/university-types.service";

export function useUniversityTypes(isActive?: boolean) {
  return useQuery({
    queryKey: [...QUERY_KEYS.universityTypes, isActive],
    queryFn: () => universityTypesService.getAll(isActive),
  });
}

export function useUniversityType(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.universityType(id),
    queryFn: () => universityTypesService.getById(id),
    enabled: !!id,
  });
}

export function useCreateUniversityType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUniversityTypeInput) =>
      universityTypesService.create(data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.universityTypes,
      });
    },
  });
}

export function useUpdateUniversityType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateUniversityTypeInput;
    }) => universityTypesService.update(id, data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.universityTypes,
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.universityType(id),
      });
    },
  });
}

export function useDisableUniversityType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => universityTypesService.disable(id),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.universityTypes,
      });
    },
  });
}

export function useRemoveUniversityType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => universityTypesService.remove(id),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.universityTypes,
      });
    },
  });
}
