import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getAmbassadors,
  getAmbassador,
  createAmbassador,
  updateAmbassador,
} from "@/lib/services/ambassadors.service";
import type {
  CreateCampusAmbassadorInput,
  UpdateCampusAmbassadorInput,
} from "@beaconu/types";

export function useAmbassadors() {
  return useQuery({
    queryKey: QUERY_KEYS.ambassadors,
    queryFn: getAmbassadors,
  });
}

export function useAmbassador(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ambassador(id),
    queryFn: () => getAmbassador(id),
    enabled: !!id,
  });
}

export function useCreateAmbassador() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCampusAmbassadorInput) => createAmbassador(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ambassadors });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateAmbassador(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateCampusAmbassadorInput) =>
      updateAmbassador(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ambassadors });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ambassador(id) });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
