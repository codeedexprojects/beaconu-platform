import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getCollegePermissions,
  getCollegeRoles,
  createCollegeRole,
  updateCollegeRole,
  deleteCollegeRole,
  getStaffDirectory,
  inviteStaffMember,
  updateStaffMember,
  type CreateCollegeRoleInput,
  type UpdateCollegeRoleInput,
  type InviteStaffInput,
  type UpdateStaffInput,
} from "@/lib/services/colleges.service";

export function useCollegePermissions(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.permissions,
    queryFn: getCollegePermissions,
    enabled,
  });
}

export function useCollegeRoles(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.roles,
    queryFn: getCollegeRoles,
    enabled,
  });
}

export function useCreateCollegeRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCollegeRoleInput) => createCollegeRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.roles });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateCollegeRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCollegeRoleInput }) =>
      updateCollegeRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.roles });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteCollegeRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCollegeRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.roles });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useStaffDirectory(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.staff,
    queryFn: getStaffDirectory,
    enabled,
  });
}

export function useInviteStaffMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InviteStaffInput) => inviteStaffMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.staff });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateStaffMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStaffInput }) =>
      updateStaffMember(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.staff });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
