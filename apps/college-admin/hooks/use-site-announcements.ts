import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getSiteAnnouncements,
  createSiteAnnouncement,
  updateSiteAnnouncement,
  deleteSiteAnnouncement,
  reorderSiteAnnouncements,
} from "@/lib/services/site-announcements.service";
import type {
  CreateSiteAnnouncementInput,
  UpdateSiteAnnouncementInput,
} from "@beaconu/types";

export function useSiteAnnouncements() {
  return useQuery({
    queryKey: QUERY_KEYS.siteAnnouncements,
    queryFn: getSiteAnnouncements,
  });
}

export function useCreateSiteAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSiteAnnouncementInput) =>
      createSiteAnnouncement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.siteAnnouncements,
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateSiteAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateSiteAnnouncementInput;
    }) => updateSiteAnnouncement(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.siteAnnouncements,
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteSiteAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSiteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.siteAnnouncements,
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useReorderSiteAnnouncements() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderedIds: string[]) => reorderSiteAnnouncements(orderedIds),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.siteAnnouncements,
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
