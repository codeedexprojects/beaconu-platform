import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import * as service from "@/lib/services/platform-admins-mgmt.service";

const MGMT_KEY = ["platform-admins-mgmt"];

export function usePlatformAdminsList() {
  return useQuery({ queryKey: MGMT_KEY, queryFn: service.getPlatformAdmins });
}

export function usePlatformAdminMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: MGMT_KEY });
    void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminProfiles });
  };

  const create = useMutation({
    mutationFn: service.createPlatformAdmin,
    onSuccess: () => invalidate(),
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      service.updatePlatformAdmin(id, data),
    onSuccess: () => invalidate(),
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const updateStatus = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "active" | "inactive";
    }) => service.updatePlatformAdminStatus(id, { status }),
    onSuccess: () => {
      toast.success("Status updated");
      invalidate();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: service.deletePlatformAdmin,
    onSuccess: () => {
      toast.success("Admin deleted");
      invalidate();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return { create, update, updateStatus, remove };
}
