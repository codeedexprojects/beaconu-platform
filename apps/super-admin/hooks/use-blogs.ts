import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  adminBlogsService,
  type SubmitBlogInput,
  type RejectBlogInput,
} from "@/lib/services/blogs.service";

export function useAdminBlogs(params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: QUERY_KEYS.adminBlogs(params),
    queryFn: () => adminBlogsService.list(params),
  });
}

export function useAdminBlog(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.adminBlog(id),
    queryFn: () => adminBlogsService.getById(id),
    enabled: !!id,
  });
}

export function useApproveBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminBlogsService.approve(id),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminBlogs() });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.adminBlog(id),
      });
    },
  });
}

export function useRejectBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectBlogInput }) =>
      adminBlogsService.reject(id, data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminBlogs() });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.adminBlog(id),
      });
    },
  });
}

export function useCreateAdminBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SubmitBlogInput) => adminBlogsService.submit(data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminBlogs() });
    },
  });
}
