export interface PublicLibraryStat {
  label?: string;
  value?: string;
}

export interface PublicLibraryResourceItem {
  name?: string;
  count?: string;
}

export interface PublicLibraryDayHours {
  day?: string;
  working_hours_start?: string;
  working_hours_end?: string;
  transaction_hours_start?: string;
  transaction_hours_end?: string;
}

export interface PublicLibraryFacilityItem {
  name?: string;
  image?: string;
}

export interface PublicLibrary {
  id: string;
  type?: "central" | "department" | string;
  departmentId?: string | null;
  name: string;
  coverImageUrl?: string | null;
  stats?: PublicLibraryStat[];
  availableResources?: { items?: PublicLibraryResourceItem[] };
  libraryHours?: { days?: PublicLibraryDayHours[] };
  facilities?: { items?: PublicLibraryFacilityItem[] };
}

export interface PublicLibraryTab {
  tab?: string;
  libraries?: PublicLibrary[];
}
