import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  academicTaxonomyService,
  type TaxonomyListParams,
  type CreateDisciplineInput,
  type CreateSimpleTaxonomyInput,
  type UpdateDisciplineInput,
  type UpdateSimpleTaxonomyInput,
} from "@/lib/services/academic-taxonomy.service";

export function useStreams(params: TaxonomyListParams = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.academicTaxonomy.streams, params],
    queryFn: () => academicTaxonomyService.getStreams(params),
  });
}

export function useAllActiveStreams() {
  return useQuery({
    queryKey: [...QUERY_KEYS.academicTaxonomy.streams, "all-active"],
    queryFn: () => academicTaxonomyService.getAllActiveStreams(),
  });
}

export function useDisciplines(params: TaxonomyListParams = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.academicTaxonomy.disciplines, params],
    queryFn: () => academicTaxonomyService.getDisciplines(params),
  });
}

export function useCreateStream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSimpleTaxonomyInput) =>
      academicTaxonomyService.createStream(data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.academicTaxonomy.streams,
      });
    },
  });
}

export function useUpdateStream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateSimpleTaxonomyInput;
    }) => academicTaxonomyService.updateStream(id, data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.academicTaxonomy.streams,
      });
    },
  });
}

export function useEnableStream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => academicTaxonomyService.enableStream(id),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.academicTaxonomy.streams,
      });
    },
  });
}

export function useDisableStream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => academicTaxonomyService.disableStream(id),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.academicTaxonomy.streams,
      });
    },
  });
}

export function useStudyLevels(params: TaxonomyListParams = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.academicTaxonomy.studyLevels, params],
    queryFn: () => academicTaxonomyService.getStudyLevels(params),
  });
}

export function useProgramTypes(params: TaxonomyListParams = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.academicTaxonomy.programTypes, params],
    queryFn: () => academicTaxonomyService.getProgramTypes(params),
  });
}

export function useCreateDiscipline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDisciplineInput) =>
      academicTaxonomyService.createDiscipline(data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.academicTaxonomy.disciplines,
      });
    },
  });
}

export function useUpdateDiscipline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDisciplineInput }) =>
      academicTaxonomyService.updateDiscipline(id, data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.academicTaxonomy.disciplines,
      });
    },
  });
}

export function useEnableDiscipline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => academicTaxonomyService.enableDiscipline(id),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.academicTaxonomy.disciplines,
      });
    },
  });
}

export function useDisableDiscipline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => academicTaxonomyService.disableDiscipline(id),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.academicTaxonomy.disciplines,
      });
    },
  });
}

export function useCreateStudyLevel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSimpleTaxonomyInput) =>
      academicTaxonomyService.createStudyLevel(data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.academicTaxonomy.studyLevels,
      });
    },
  });
}

export function useUpdateStudyLevel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateSimpleTaxonomyInput;
    }) => academicTaxonomyService.updateStudyLevel(id, data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.academicTaxonomy.studyLevels,
      });
    },
  });
}

export function useEnableStudyLevel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => academicTaxonomyService.enableStudyLevel(id),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.academicTaxonomy.studyLevels,
      });
    },
  });
}

export function useDisableStudyLevel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => academicTaxonomyService.disableStudyLevel(id),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.academicTaxonomy.studyLevels,
      });
    },
  });
}

export function useCreateProgramType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSimpleTaxonomyInput) =>
      academicTaxonomyService.createProgramType(data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.academicTaxonomy.programTypes,
      });
    },
  });
}

export function useUpdateProgramType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateSimpleTaxonomyInput;
    }) => academicTaxonomyService.updateProgramType(id, data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.academicTaxonomy.programTypes,
      });
    },
  });
}

export function useEnableProgramType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => academicTaxonomyService.enableProgramType(id),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.academicTaxonomy.programTypes,
      });
    },
  });
}

export function useDisableProgramType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => academicTaxonomyService.disableProgramType(id),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.academicTaxonomy.programTypes,
      });
    },
  });
}
