import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getAssociateAdmins,
  updateAssociateStatus,
  approveEmployee,
} from "@/lib/services/associate-admins.service";

export function useAssociateAdmins() {
  const query = useQuery({
    queryKey: QUERY_KEYS.associateAdmins,
    queryFn: getAssociateAdmins,
  });
  useEffect(() => {
    if (query.error) toast.error(getErrorMessage(query.error));
  }, [query.error]);
  return query;
}

export function useUpdateAssociateStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateAssociateStatus(id, status),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.associateAdmins,
      });
    },
  });
}

export function useApproveEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      approveEmployee(id, status),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.associateAdmins,
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.adminProfiles,
      });
    },
  });
}
