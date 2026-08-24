import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import { institutesOfNationalImportanceService } from "@/lib/services/institutes-of-national-importance.service";
import type {
  CreateInstituteOfNationalImportanceInput,
  UpdateInstituteOfNationalImportanceInput,
} from "@beaconu/types";

export function useInstitutesOfNationalImportance(filters?: {
  is_active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: QUERY_KEYS.institutesOfNationalImportance(filters),
    queryFn: () => institutesOfNationalImportanceService.getAll(filters),
  });
}

export function useInstituteOfNationalImportance(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.instituteOfNationalImportance(id),
    queryFn: () => institutesOfNationalImportanceService.getById(id),
    enabled: !!id,
  });
}

export function useCreateInstituteOfNationalImportance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInstituteOfNationalImportanceInput) =>
      institutesOfNationalImportanceService.create(data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.institutesOfNationalImportance(),
      });
    },
  });
}

export function useUpdateInstituteOfNationalImportance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateInstituteOfNationalImportanceInput;
    }) => institutesOfNationalImportanceService.update(id, data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.institutesOfNationalImportance(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.instituteOfNationalImportance(id),
      });
    },
  });
}

export function useDeactivateInstituteOfNationalImportance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      institutesOfNationalImportanceService.deactivate(id),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.institutesOfNationalImportance(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.instituteOfNationalImportance(id),
      });
    },
  });
}

export function useActivateInstituteOfNationalImportance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      institutesOfNationalImportanceService.activate(id),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.institutesOfNationalImportance(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.instituteOfNationalImportance(id),
      });
    },
  });
}
