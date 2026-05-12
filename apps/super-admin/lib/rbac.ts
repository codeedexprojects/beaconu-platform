export type AdminRole = "super_admin" | "sub_admin";

// All available permissions in the super-admin panel
export type Permission =
  | "colleges.view"
  | "colleges.manage"
  | "universities.view"
  | "universities.manage"
  | "university-types.view"
  | "university-types.manage"
  | "students.view"
  | "leads.view"
  | "leads.manage"
  | "counsellors.view"
  | "counsellors.manage"
  | "content.view"
  | "content.manage"
  | "exams.view"
  | "exams.manage"
  | "events.view"
  | "events.manage"
  | "admins.view"
  | "admins.manage"
  | "settings.view"
  | "settings.manage";

const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  super_admin: [
    "colleges.view",
    "colleges.manage",
    "universities.view",
    "universities.manage",
    "university-types.view",
    "university-types.manage",
    "students.view",
    "leads.view",
    "leads.manage",
    "counsellors.view",
    "counsellors.manage",
    "content.view",
    "content.manage",
    "exams.view",
    "exams.manage",
    "events.view",
    "events.manage",
    "admins.view",
    "admins.manage",
    "settings.view",
    "settings.manage",
  ],
  sub_admin: [
    "colleges.view",
    "universities.view",
    "university-types.view",
    "students.view",
    "leads.view",
    "leads.manage",
    "counsellors.view",
    "content.view",
    "exams.view",
    "events.view",
  ],
};

export function can(role: AdminRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canAny(role: AdminRole, permissions: Permission[]): boolean {
  return permissions.some((p) => can(role, p));
}
