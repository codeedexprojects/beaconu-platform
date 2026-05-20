import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  academicTaxonomyService,
  type CreateDisciplineInput,
  type CreateSimpleTaxonomyInput,
  type UpdateDisciplineInput,
  type UpdateSimpleTaxonomyInput,
} from "@/lib/services/academic-taxonomy.service";

export function useStreams(isActive?: boolean) {
  return useQuery({
    queryKey: [...QUERY_KEYS.academicTaxonomy.streams, isActive],
    queryFn: () => academicTaxonomyService.getStreams(isActive),
  });
}

export function useDisciplines(isActive?: boolean) {
  return useQuery({
    queryKey: [...QUERY_KEYS.academicTaxonomy.disciplines, isActive],
    queryFn: () => academicTaxonomyService.getDisciplines(isActive),
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

export function useStudyLevels(isActive?: boolean) {
  return useQuery({
    queryKey: [...QUERY_KEYS.academicTaxonomy.studyLevels, isActive],
    queryFn: () => academicTaxonomyService.getStudyLevels(isActive),
  });
}

export function useProgramTypes(isActive?: boolean) {
  return useQuery({
    queryKey: [...QUERY_KEYS.academicTaxonomy.programTypes, isActive],
    queryFn: () => academicTaxonomyService.getProgramTypes(isActive),
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
