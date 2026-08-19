import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { getErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import {
  addApplicationCourse,
  changeCourseQuota,
  confirmApplicationPayment,
  getAdmissionCycle,
  getApplicationStatus,
  getCourseCatalogue,
  getFormDetails,
  getMyApplication,
  getPaymentSummary,
  initiateApplicationPayment,
  listAdmissionCycles,
  listMyApplications,
  listRequiredDocuments,
  listUploadedDocuments,
  registerDocuments,
  startApplication,
  submitApplication,
  updateAchievementsDetails,
  updateAddressDetails,
  updateDeclaration,
  updateDiplomaDetails,
  updateEntranceExamDetails,
  updateFamilyDetails,
  updatePersonalDetails,
  updatePgDetails,
  updateTenthGradeDetails,
  updateTwelfthGradeDetails,
  updateUndergraduateDetails,
  withdrawApplicationCourse,
} from "@/lib/services/application.service";
import type {
  AchievementsDetailsInput,
  AddApplicationCourseInput,
  AddressDetailsInput,
  ApplicationFormDetailsSection,
  ChangeApplicationCourseQuotaInput,
  DeclarationInput,
  DiplomaDetailsInput,
  EntranceExamDetailsInput,
  FamilyDetailsInput,
  PersonalDetailsInput,
  PgDetailsInput,
  RegisterApplicationDocumentInput,
  StartApplicationInput,
  TenthGradeDetailsInput,
  TwelfthGradeDetailsInput,
  UndergraduateDetailsInput,
} from "@beaconu/types";

export function useAdmissionCycles(collegeId: string, enabled: boolean) {
  return useQuery({
    queryKey: QUERY_KEYS.admissionCycles(collegeId),
    queryFn: () => listAdmissionCycles(collegeId),
    enabled,
  });
}

export function useAdmissionCycle(cycleId: string, enabled: boolean) {
  return useQuery({
    queryKey: QUERY_KEYS.admissionCycle(cycleId),
    queryFn: () => getAdmissionCycle(cycleId),
    enabled,
  });
}

export function useCourseCatalogue(
  cycleId: string,
  search: string | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: QUERY_KEYS.courseCatalogue(cycleId, search),
    queryFn: () => getCourseCatalogue(cycleId, search),
    enabled,
  });
}

export function useMyApplications(enabled: boolean) {
  return useQuery({
    queryKey: QUERY_KEYS.myApplications,
    queryFn: () => listMyApplications(),
    enabled,
  });
}

export function useMyApplication(applicationId: string, enabled: boolean) {
  return useQuery({
    queryKey: QUERY_KEYS.myApplication(applicationId),
    queryFn: () => getMyApplication(applicationId),
    enabled,
  });
}

export function useApplicationStatus(
  cycleId: string,
  applicationId: string,
  enabled: boolean,
) {
  return useQuery({
    queryKey: QUERY_KEYS.applicationStatus(applicationId),
    queryFn: () => getApplicationStatus(cycleId, applicationId),
    enabled,
  });
}

export function usePaymentSummary(applicationId: string, enabled: boolean) {
  return useQuery({
    queryKey: QUERY_KEYS.applicationPaymentSummary(applicationId),
    queryFn: () => getPaymentSummary(applicationId),
    enabled,
  });
}

export function useFormDetails<S extends ApplicationFormDetailsSection>(
  applicationId: string,
  section: S,
  enabled: boolean,
) {
  return useQuery({
    queryKey: QUERY_KEYS.applicationFormDetails(applicationId, section),
    queryFn: () => getFormDetails(applicationId, section),
    enabled,
  });
}

export function useUpdatePersonalDetails(applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PersonalDetailsInput) =>
      updatePersonalDetails(applicationId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.applicationFormDetails(
          applicationId,
          "personal_details",
        ),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.myApplication(applicationId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateFamilyDetails(applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: FamilyDetailsInput) =>
      updateFamilyDetails(applicationId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.applicationFormDetails(
          applicationId,
          "family_details",
        ),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.myApplication(applicationId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateAddressDetails(applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddressDetailsInput) =>
      updateAddressDetails(applicationId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.applicationFormDetails(
          applicationId,
          "address_details",
        ),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.myApplication(applicationId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

/** No GET prefill available yet — the backend's getFormDetails section enum
 * doesn't include tenth_grade/twelfth_grade (deferred backend gap, see
 * project plan). This mutation only writes; the form always starts blank. */
export function useUpdateTenthGradeDetails(applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TenthGradeDetailsInput) =>
      updateTenthGradeDetails(applicationId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.myApplication(applicationId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

/** No GET prefill available yet — same deferred backend gap as
 * useUpdateTenthGradeDetails above. */
export function useUpdateTwelfthGradeDetails(applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TwelfthGradeDetailsInput) =>
      updateTwelfthGradeDetails(applicationId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.myApplication(applicationId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

/** No GET prefill available yet — same deferred backend gap as
 * useUpdateTenthGradeDetails above. */
export function useUpdateUndergraduateDetails(applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UndergraduateDetailsInput) =>
      updateUndergraduateDetails(applicationId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.myApplication(applicationId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

/** No GET prefill available yet — same deferred backend gap as
 * useUpdateTenthGradeDetails above. PG shares the exact same shape as
 * Undergraduate on the backend (pgDetailsSchema is a literal alias of
 * undergraduateDetailsSchema), so this hook mirrors
 * useUpdateUndergraduateDetails except for the endpoint it hits. */
export function useUpdatePgDetails(applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PgDetailsInput) =>
      updatePgDetails(applicationId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.myApplication(applicationId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

/** No GET prefill available yet — same deferred backend gap as
 * useUpdateTenthGradeDetails above. Diploma shares the exact same shape as
 * Undergraduate/PG on the backend (diplomaDetailsSchema is a literal alias
 * of undergraduateDetailsSchema too). */
export function useUpdateDiplomaDetails(applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DiplomaDetailsInput) =>
      updateDiplomaDetails(applicationId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.myApplication(applicationId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateAchievementsDetails(applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AchievementsDetailsInput) =>
      updateAchievementsDetails(applicationId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.applicationFormDetails(
          applicationId,
          "achievements_details",
        ),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.myApplication(applicationId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

/** No GET prefill available yet — same deferred backend gap as
 * useUpdateTenthGradeDetails above (entrance_exam_details lives on the
 * Application row, not selected by APPLICATION_SELECT, see project plan). */
export function useUpdateEntranceExamDetails(applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: EntranceExamDetailsInput) =>
      updateEntranceExamDetails(applicationId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.myApplication(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.applicationFormDetails(
          applicationId,
          "entrance_exam_details",
        ),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useRequiredDocuments(applicationId: string, enabled: boolean) {
  return useQuery({
    queryKey: QUERY_KEYS.requiredDocuments(applicationId),
    queryFn: () => listRequiredDocuments(applicationId),
    enabled,
  });
}

export function useUploadedDocuments(applicationId: string, enabled: boolean) {
  return useQuery({
    queryKey: QUERY_KEYS.uploadedDocuments(applicationId),
    queryFn: () => listUploadedDocuments(applicationId),
    enabled,
  });
}

export function useRegisterDocuments(applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documents: RegisterApplicationDocumentInput[]) =>
      registerDocuments(applicationId, documents),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.requiredDocuments(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.uploadedDocuments(applicationId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateDeclaration(applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DeclarationInput) =>
      updateDeclaration(applicationId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.myApplication(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.applicationFormDetails(
          applicationId,
          "declaration",
        ),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useSubmitApplication(applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => submitApplication(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.myApplication(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.applicationStatus(applicationId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

/** No real payment gateway is wired up on the backend yet (mock provider
 * only — verifyPayment always returns true). Runs initiate then immediately
 * confirms with the mock's own providerOrderId as provider_payment_id, so
 * feePaymentStatus flips to paid in dev/staging today. When a real Razorpay
 * provider lands, this needs to open checkout.js between initiate and
 * confirm instead of chaining them automatically. */
export function usePayApplicationFee(applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const order = await initiateApplicationPayment(applicationId);
      if (order.status === "completed") return order;
      return confirmApplicationPayment(applicationId, {
        transaction_id: order.id,
        provider_payment_id: order.providerOrderId ?? order.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.myApplication(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.applicationPaymentSummary(applicationId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useStartApplication(cycleId: string) {
  return useMutation({
    mutationFn: (input: StartApplicationInput) =>
      startApplication(cycleId, input),
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useAddApplicationCourse(applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddApplicationCourseInput) =>
      addApplicationCourse(applicationId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.myApplication(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.applicationPaymentSummary(applicationId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useWithdrawApplicationCourse(applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appCourseId: string) =>
      withdrawApplicationCourse(applicationId, appCourseId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.myApplication(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.applicationPaymentSummary(applicationId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useChangeCourseQuota(applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      appCourseId,
      input,
    }: {
      appCourseId: string;
      input: ChangeApplicationCourseQuotaInput;
    }) => changeCourseQuota(applicationId, appCourseId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.myApplication(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.applicationPaymentSummary(applicationId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
