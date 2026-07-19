export type AdminRole = "admin" | "content_admin" | "super_admin" | "support_admin";

export interface AdminSession {
  email: string;
  expiresAt: number;
  id: string;
  name: string;
  role: AdminRole;
}

const permissions: Record<AdminRole, string[]> = {
  admin: [
    "Content",
    "Exercise Database",
    "Feedback",
    "Food Database",
    "Notifications",
    "Overview",
    "Settings",
    "Users",
  ],
  super_admin: [
    "Admin Users",
    "Audit Logs",
    "Content",
    "Exercise Database",
    "Feedback",
    "Food Database",
    "Notifications",
    "Overview",
    "Settings",
    "Users",
  ],
  content_admin: [
    "Content",
    "Exercise Database",
    "Food Database",
    "Notifications",
    "Overview",
    "Settings",
  ],
  support_admin: ["Feedback", "Overview", "Users"],
};

export function normalizeAdminRole(role: string): AdminRole {
  if (role === "super_admin") {
    return "super_admin";
  }

  if (role === "admin" || role === "content_admin" || role === "support_admin") {
    return role;
  }

  return "admin";
}

export function isSuperAdmin(role: AdminRole) {
  return role === "super_admin";
}

export function canAccess(role: AdminRole, area: string) {
  return permissions[role]?.includes(area) ?? false;
}

export function getAllowedAreas(role: AdminRole) {
  return permissions[role] ?? [];
}
