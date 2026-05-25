import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import { financialAidLoansService } from "@/lib/services/financial-aid-loans.service";
import type { Paginated } from "@/lib/api";
import type {
  EducationLoanListItem,
  CreateEducationLoanInput,
  UpdateEducationLoanInput,
} from "@beaconu/types";

export function useEducationLoans(params?: {
  status?: string;
  loan_type?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery<Paginated<EducationLoanListItem>>({
    queryKey: QUERY_KEYS.educationLoans(params),
    queryFn: () => financialAidLoansService.list(params),
  });
}

export function useEducationLoan(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.educationLoan(id),
    queryFn: () => financialAidLoansService.getById(id),
    enabled: !!id,
  });
}

export function useCreateEducationLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEducationLoanInput) =>
      financialAidLoansService.create(data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.educationLoans(),
      });
    },
  });
}

export function useUpdateEducationLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateEducationLoanInput;
    }) => financialAidLoansService.update(id, data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.educationLoans(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.educationLoan(id),
      });
    },
  });
}

export function useDeactivateEducationLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financialAidLoansService.deactivate(id),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.educationLoans(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.educationLoan(id),
      });
    },
  });
}

export function useActivateEducationLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financialAidLoansService.activate(id),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.educationLoans(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.educationLoan(id),
      });
    },
  });
}
