import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getPlatformRoles,
  getPlatformPermissions,
  createPlatformRole,
  updatePlatformRolePermissions,
  deletePlatformRole,
  type CreatePlatformRoleInput,
  type UpdateRolePermissionsInput,
} from "@/lib/services/roles.service";

export function usePlatformRoles() {
  return useQuery({
    queryKey: QUERY_KEYS.platformRoles,
    queryFn: getPlatformRoles,
  });
}

export function usePlatformPermissions() {
  return useQuery({
    queryKey: QUERY_KEYS.platformPerms,
    queryFn: getPlatformPermissions,
  });
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

export function useDeletePlatformRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roleId: string) => deletePlatformRole(roleId),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.platformRoles,
      });
    },
  });
}
