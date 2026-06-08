import { useMutation } from "@tanstack/react-query";
import { getErrorMessage } from "@/lib/api";
import { submitCounsellorRequest } from "@/lib/services/counsellor-requests.service";
import { toast } from "sonner";

export function useSubmitCounsellorRequest() {
  return useMutation({
    mutationFn: submitCounsellorRequest,
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
