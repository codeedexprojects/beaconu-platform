import { Country, State, City } from "country-state-city";

export interface GeoOption {
  value: string;
  label: string;
}

export interface CountryOption {
  code: string;
  name: string;
  dialCode: string;
}

export interface StateOption {
  code: string;
  name: string;
}

export function getCountries(search?: string): CountryOption[] {
  const all = Country.getAllCountries().map((c) => ({
    code: c.isoCode,
    name: c.name,
    dialCode: `+${c.phonecode}`,
  }));
  if (!search) return all;
  const q = search.toLowerCase();
  return all.filter((c) => c.name.toLowerCase().includes(q));
}

export function getStatesOfCountry(countryCode: string): StateOption[] {
  return State.getStatesOfCountry(countryCode).map((s) => ({
    code: s.isoCode,
    name: s.name,
  }));
}

export function getCitiesOfState(
  countryCode: string,
  stateCode: string,
): GeoOption[] {
  return City.getCitiesOfState(countryCode, stateCode).map((c) => ({
    value: c.name,
    label: c.name,
  }));
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
