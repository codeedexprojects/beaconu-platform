export type AdmissionCycleStatus = "open" | "closed" | "archived";

export interface AdmissionCycleItem {
  id: string;
  collegeId: string;
  applicationType: string;
  name: string;
  slug: string;
  admissionYear: string;
  programLevel: string;
  startsOn: string;
  endsOn: string | null;
  status: AdmissionCycleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdmissionCycleInput {
  application_type: string;
  name: string;
  admission_year: string;
  program_level: string;
  starts_on: string;
  ends_on?: string;
}

export interface UpdateAdmissionCycleInput {
  application_type?: string;
  name?: string;
  admission_year?: string;
  program_level?: string;
  starts_on?: string;
  ends_on?: string;
}
