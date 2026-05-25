import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { collegesService } from "@/lib/services/colleges.service";

export function useInstitutionGroup(collegeId: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.institutionGroup(collegeId ?? ""),
    queryFn: () => collegesService.getGroup(collegeId!),
    enabled: !!collegeId,
  });
}

export function useEnableInstitutionGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      collegeId,
      data,
    }: {
      collegeId: string;
      data: { name: string; description?: string };
    }) => collegesService.enableGroup(collegeId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.institutionGroup(variables.collegeId),
      });
    },
  });
}

export function useDisableInstitutionGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (collegeId: string) => collegesService.disableGroup(collegeId),
    onSuccess: (_data, collegeId) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.institutionGroup(collegeId),
      });
    },
  });
}
