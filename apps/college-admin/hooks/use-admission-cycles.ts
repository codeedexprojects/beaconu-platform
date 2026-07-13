import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getAdmissionCycles,
  createAdmissionCycle,
  updateAdmissionCycle,
  deleteAdmissionCycle,
  type AdmissionCycleListFilters,
} from "@/lib/services/admission-cycles.service";
import type {
  CreateAdmissionCycleInput,
  UpdateAdmissionCycleInput,
} from "@beaconu/types";

export function useAdmissionCycles(filters: AdmissionCycleListFilters = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.admissionCycles(filters),
    queryFn: () => getAdmissionCycles(filters),
  });
}

export function useCreateAdmissionCycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAdmissionCycleInput) => createAdmissionCycle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admissionCycles() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateAdmissionCycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateAdmissionCycleInput;
    }) => updateAdmissionCycle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admissionCycles() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteAdmissionCycle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAdmissionCycle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.admissionCycles() });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
