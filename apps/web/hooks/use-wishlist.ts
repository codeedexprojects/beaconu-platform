"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "@/lib/services/wishlist.service";

export function useWishlist(page = 1, limit = 20) {
  return useQuery({
    queryKey: QUERY_KEYS.wishlist(page),
    queryFn: () => getWishlist(page, limit),
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (collegeId: string) => addToWishlist(collegeId),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wishlist() });
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (collegeId: string) => removeFromWishlist(collegeId),
    onError: (error) => toast.error(getErrorMessage(error)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wishlist() });
    },
  });
}
