import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getErrorMessage } from "@/lib/api";
import {
  applyForScholarship,
  listScholarshipConfigs,
} from "@/lib/services/scholarship.service";
import type { CreateScholarshipApplicationInput } from "@beaconu/types";

export function useAvailableScholarships(collegeId: string, enabled: boolean) {
  return useQuery({
    queryKey: QUERY_KEYS.scholarshipConfigs(collegeId),
    queryFn: () => listScholarshipConfigs(collegeId),
    enabled: enabled && !!collegeId,
  });
}

export function useApplyForScholarship(applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateScholarshipApplicationInput) =>
      applyForScholarship(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.applicationStatus(applicationId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
