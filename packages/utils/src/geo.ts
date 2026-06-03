import { State, City } from "country-state-city";

export interface GeoOption {
  value: string;
  label: string;
}

export function getIndiaStates(): GeoOption[] {
  return State.getStatesOfCountry("IN").map((s) => ({
    value: s.name,
    label: s.name,
  }));
}

export function getIndiaDistricts(stateName: string): GeoOption[] {
  const state = State.getStatesOfCountry("IN").find(
    (s) => s.name === stateName,
  );
  if (!state) return [];
  return City.getCitiesOfState("IN", state.isoCode).map((c) => ({
    value: c.name,
    label: c.name,
  }));
}
