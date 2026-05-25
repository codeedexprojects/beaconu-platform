import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/lib/query-keys";
import {
  getProgramTypes,
  getStreams,
  getStudyLevels,
  getUniversities,
} from "@/lib/services/lookups.service";

export function useStreams(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.lookupsStreams,
    queryFn: getStreams,
    enabled,
  });
}

export function useStudyLevels(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.lookupsStudyLevels,
    queryFn: getStudyLevels,
    enabled,
  });
}

export function useProgramTypes(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.lookupsProgramTypes,
    queryFn: getProgramTypes,
    enabled,
  });
}

export function useUniversities(enabled = true) {
  return useQuery({
    queryKey: QUERY_KEYS.lookupsUniversities,
    queryFn: getUniversities,
    enabled,
  });
}
