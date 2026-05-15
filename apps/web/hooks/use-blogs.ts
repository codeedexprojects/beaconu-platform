"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  blogAuthorService,
  type SubmitBlogInput,
  type UpdateBlogInput,
} from "@/lib/services/blogs.service";

export function useMyBlogs(
  userType: string,
  params?: { status?: string; page?: number },
) {
  const query = useQuery({
    queryKey: QUERY_KEYS.myBlogs(params?.status, params?.page),
    queryFn: () => blogAuthorService.list(userType, params),
  });
  useEffect(() => {
    if (query.error) toast.error(getErrorMessage(query.error));
  }, [query.error]);
  return query;
}

export function useMyBlog(userType: string, id: string) {
  const query = useQuery({
    queryKey: QUERY_KEYS.myBlog(id),
    queryFn: () => blogAuthorService.getById(userType, id),
    enabled: !!id,
  });
  useEffect(() => {
    if (query.error) toast.error(getErrorMessage(query.error));
  }, [query.error]);
  return query;
}

export function useSubmitBlog(userType: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SubmitBlogInput) =>
      blogAuthorService.submit(userType, data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myBlogs() });
    },
  });
}

export function useUpdateBlog(userType: string, id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateBlogInput) =>
      blogAuthorService.update(userType, id, data),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myBlogs() });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myBlog(id) });
    },
  });
}
