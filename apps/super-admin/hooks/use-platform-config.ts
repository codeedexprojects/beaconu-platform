import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getPlatformConfig,
  updatePlatformConfig,
  type UpdatePlatformConfigInput,
} from "@/lib/services/platform-config.service";

export function usePlatformConfig() {
  return useQuery({
    queryKey: QUERY_KEYS.platformConfig,
    queryFn: getPlatformConfig,
  });
}

export function useUpdatePlatformConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdatePlatformConfigInput) =>
      updatePlatformConfig(payload),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.platformConfig,
      });
    },
  });
}
