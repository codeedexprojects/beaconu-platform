import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getPlatformRoles,
  getPlatformPermissions,
  createPlatformRole,
  updatePlatformRolePermissions,
  type CreatePlatformRoleInput,
  type UpdateRolePermissionsInput,
} from "@/lib/services/roles.service";

export function usePlatformRoles() {
  const query = useQuery({
    queryKey: QUERY_KEYS.platformRoles,
    queryFn: getPlatformRoles,
  });
  useEffect(() => {
    if (query.error) toast.error(getErrorMessage(query.error));
  }, [query.error]);
  return query;
}

export function usePlatformPermissions() {
  const query = useQuery({
    queryKey: QUERY_KEYS.platformPerms,
    queryFn: getPlatformPermissions,
  });
  useEffect(() => {
    if (query.error) toast.error(getErrorMessage(query.error));
  }, [query.error]);
  return query;
}

export function useCreatePlatformRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePlatformRoleInput) =>
      createPlatformRole(payload),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.platformRoles,
      });
    },
  });
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      roleId,
      payload,
    }: {
      roleId: string;
      payload: UpdateRolePermissionsInput;
    }) => updatePlatformRolePermissions(roleId, payload),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.platformRoles,
      });
    },
  });
}
