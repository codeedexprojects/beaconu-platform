import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  listCountries,
  listIndiaStates,
  listMediums,
  listStatesOfCountry,
} from "@/lib/services/geo.service";

export function useCountries() {
  return useQuery({
    queryKey: QUERY_KEYS.countries,
    queryFn: () => listCountries(),
    staleTime: Infinity,
  });
}

export function useStatesOfCountry(countryCode: string, enabled: boolean) {
  return useQuery({
    queryKey: QUERY_KEYS.statesOfCountry(countryCode),
    queryFn: () => listStatesOfCountry(countryCode),
    enabled,
    staleTime: Infinity,
  });
}

export function useIndiaStates() {
  return useQuery({
    queryKey: QUERY_KEYS.indiaStates,
    queryFn: () => listIndiaStates(),
    staleTime: Infinity,
  });
}

export function useMediums() {
  return useQuery({
    queryKey: QUERY_KEYS.mediums,
    // The backend stores medium_of_instruction as a display name string, and
    // the source data has multiple codes sharing the same name (e.g.
    // "chhattisgarhi" and "hne" both display "Chhattisgarhi") — dedupe by
    // name here since that's what the dropdown's value/key is keyed on.
    queryFn: async () => {
      const mediums = await listMediums();
      const seen = new Set<string>();
      return mediums.filter((medium) => {
        if (seen.has(medium.name)) return false;
        seen.add(medium.name);
        return true;
      });
    },
    staleTime: Infinity,
  });
}
