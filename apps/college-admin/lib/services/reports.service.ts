import { api } from "../api";

const BASE = "/api/v1/college-admin/dashboard/reports";

function cycleQuery(admissionCycleId?: string): string {
  return admissionCycleId
    ? `?admission_cycle_id=${encodeURIComponent(admissionCycleId)}`
    : "";
}

export interface EnrollmentOverview {
  totalApplications: number;
  offersIssued: number;
  confirmedAdmissions: number;
}

export interface AdmissionsFunnel {
  initiated: number;
  feePaid: number;
  submitted: number;
  verified: number;
  assessment: number;
  offerIssued: number;
  tokenPaid: number;
  confirmed: number;
  overallConversionRate: number | null;
  avgDaysToAdmission: number | null;
}

export interface AgeGenderInsights {
  ageGroups: { bucket: string; count: number }[];
  genderDistribution: { gender: string; count: number }[];
  total: number;
}

export interface GeographicOrigin {
  domestic: number;
  international: number;
  topInternationalCountries: { country: string; count: number }[];
  topStates: { state: string; count: number }[];
  topDistricts: { district: string; count: number }[];
}

export async function getEnrollmentOverview(
  admissionCycleId?: string,
): Promise<EnrollmentOverview> {
  return api.get<EnrollmentOverview>(
    `${BASE}/enrollment-overview${cycleQuery(admissionCycleId)}`,
  );
}

export async function getAdmissionsFunnel(
  admissionCycleId?: string,
): Promise<AdmissionsFunnel> {
  return api.get<AdmissionsFunnel>(
    `${BASE}/funnel${cycleQuery(admissionCycleId)}`,
  );
}

export async function getAgeGenderInsights(
  admissionCycleId?: string,
): Promise<AgeGenderInsights> {
  return api.get<AgeGenderInsights>(
    `${BASE}/demographics${cycleQuery(admissionCycleId)}`,
  );
}

export async function getGeographicOrigin(
  admissionCycleId?: string,
): Promise<GeographicOrigin> {
  return api.get<GeographicOrigin>(
    `${BASE}/geography${cycleQuery(admissionCycleId)}`,
  );
}
