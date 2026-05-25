"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  blogAuthorService,
  type SubmitBlogInput,
  type UpdateBlogInput,
} from "@/lib/services/blogs.service";

export function useMyBlogs(params?: { status?: string; page?: number }) {
  return useQuery({
    queryKey: QUERY_KEYS.myBlogs(params?.status, params?.page),
    queryFn: () => blogAuthorService.list(params),
  });
}

export function useMyBlog(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.myBlog(id),
    queryFn: () => blogAuthorService.getById(id),
    enabled: !!id,
  });
}

export function useSubmitBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SubmitBlogInput) => blogAuthorService.submit(data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myBlogs() });
    },
  });
}

export function useUpdateBlog(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateBlogInput) => blogAuthorService.update(id, data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myBlogs() });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myBlog(id) });
    },
  });
}
