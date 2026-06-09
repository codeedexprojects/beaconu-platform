import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getAmbassadors,
  createAmbassador,
} from "@/lib/services/ambassadors.service";
import type { CreateCampusAmbassadorInput } from "@beaconu/types";

export function useAmbassadors() {
  return useQuery({
    queryKey: QUERY_KEYS.ambassadors,
    queryFn: getAmbassadors,
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
