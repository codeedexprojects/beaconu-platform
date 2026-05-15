import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getPlatformPermissions,
  createPlatformPermission,
  updatePlatformPermission,
  deletePlatformPermission,
} from "@/lib/services/permissions.service";
import type {
  CreatePlatformPermissionInput,
  UpdatePlatformPermissionInput,
} from "@beaconu/validation";

export function usePermissions() {
  const query = useQuery({
    queryKey: QUERY_KEYS.permissionRegistry,
    queryFn: getPlatformPermissions,
  });
  useEffect(() => {
    if (query.error) toast.error(getErrorMessage(query.error));
  }, [query.error]);
  return query;
}

export function useCreatePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePlatformPermissionInput) =>
      createPlatformPermission(payload),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      toast.success("Permission created successfully");
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.permissionRegistry,
      });
    },
  });
}

export function useUpdatePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdatePlatformPermissionInput;
    }) => updatePlatformPermission(id, payload),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      toast.success("Permission updated successfully");
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.permissionRegistry,
      });
    },
  });
}

export function useDeletePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePlatformPermission(id),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      toast.success("Permission deleted successfully");
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.permissionRegistry,
      });
    },
  });
}
