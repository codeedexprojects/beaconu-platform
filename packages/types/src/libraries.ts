// ── Public library endpoints (college-web) ───────────────────────────────────
// List and detail share the exact same shape — pure pass-through of the
// college_libraries JSONB columns, no transform layer.

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
  stats?: PublicLibraryStat[];
  availableResources?: { items?: PublicLibraryResourceItem[] };
  libraryHours?: { days?: PublicLibraryDayHours[] };
  facilities?: { items?: PublicLibraryFacilityItem[] };
}

// GET /courses/:courseId/tabs/library — hydrates the college's full library
// records for the ids the admin linked to this course (same shape as above).
export interface PublicLibraryTab {
  tab?: string;
  libraries?: PublicLibrary[];
}
