import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  loginCollegeAdmin,
  logoutCollegeAdmin,
  setupCollegeAccount,
  verifyCollegeSetupToken,
  type LoginInput,
  type SetupAccountInput,
} from "@/lib/services/auth.service";

export function useLoginCollegeAdmin() {
  return useMutation({
    mutationFn: (data: LoginInput) => loginCollegeAdmin(data),
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useSetupCollegeAccount() {
  return useMutation({
    mutationFn: (data: SetupAccountInput) => setupCollegeAccount(data),
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useVerifyCollegeSetupToken(token: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.setupTokenValidation(token ?? "missing"),
    queryFn: () => verifyCollegeSetupToken(token as string),
    enabled: Boolean(token),
    retry: false,
  });
}

export function useLogoutCollegeAdmin() {
  return useMutation({
    mutationFn: logoutCollegeAdmin,
  });
}
