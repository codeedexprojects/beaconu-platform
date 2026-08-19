import { api } from "@/lib/api";

export interface CountryOption {
  code: string;
  name: string;
  dialCode: string;
}

export interface StateOption {
  code: string;
  name: string;
}

export async function listCountries(): Promise<CountryOption[]> {
  return api.get(`/api/v1/public/countries?page=1&limit=300`);
}

export async function listStatesOfCountry(
  countryCode: string,
): Promise<StateOption[]> {
  return api.get(`/api/v1/public/countries/${countryCode}/states`);
}

export interface IndiaStateOption {
  code: string;
  name: string;
}

export async function listIndiaStates(): Promise<IndiaStateOption[]> {
  return api.get(`/api/v1/public/india-states?page=1&limit=100`);
}

export interface MediumOption {
  code: string;
  name: string;
}

export async function listMediums(): Promise<MediumOption[]> {
  return api.get(`/api/v1/public/mediums?page=1&limit=100`);
}
