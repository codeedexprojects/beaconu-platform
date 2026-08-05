import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import { studentsService } from "@/lib/services/students.service";
import type {
  ListStudentsQuery,
  UpdateStudentStatusInput,
} from "@beaconu/types";

export function useStudents(filters?: ListStudentsQuery) {
  return useQuery({
    queryKey: QUERY_KEYS.students(filters),
    queryFn: () => studentsService.getAll(filters),
  });
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.student(id),
    queryFn: () => studentsService.getById(id),
    enabled: !!id,
  });
}

export function useUpdateStudentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateStudentStatusInput;
    }) => studentsService.updateStatus(id, data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.students() });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.student(id) });
    },
  });
}
