// src/lib/permissions.js

import pool from "@/lib/db";

export const PERMISSIONS = {
  VIEW_DASHBOARD:   "view_dashboard",
  MANAGE_USERS:     "manage_users",
  MANAGE_ASSETS:    "manage_assets",
  VIEW_ASSETS:      "view_assets",
  MANAGE_ISSUES:    "manage_issues",
  VIEW_ISSUES:      "view_issues",
  MANAGE_REPORTS:   "manage_reports",
  VIEW_REPORTS:     "view_reports",
  MANAGE_TRANSFERS: "manage_transfers",
  VIEW_TRANSFERS:   "view_transfers",
  MANAGE_SOFTWARE:  "manage_software",
  VIEW_SOFTWARE:    "view_software",
  VIEW_HISTORY:     "view_history",
};

export const ROLES = {
  ADMIN:    "admin",
  MANAGER:  "manager",
  EMPLOYEE: "employee",
};

/**
 * Get all permissions granted to a user (by userId).
 */
export async function getUserPermissions(userId) {
  try {
    const [rows] = await pool.query(
      `SELECT p.name
       FROM permissions p
       INNER JOIN role_permissions rp ON p.id = rp.permission_id
       INNER JOIN users u ON u.role_id = rp.role_id
       WHERE u.id = ?`,
      [userId]
    );
    return rows.map((r) => r.name);
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    return [];
  }
}

/**
 * Returns true when the user has the given permission.
 */
export async function hasPermission(userId, permission) {
  const perms = await getUserPermissions(userId);
  return perms.includes(permission);
}

/**
 * Returns true when the user has at least one of the supplied permissions.
 */
export async function hasAnyPermission(userId, permissionList) {
  const perms = await getUserPermissions(userId);
  return permissionList.some((p) => perms.includes(p));
}

/**
 * Returns true when the user has every one of the supplied permissions.
 */
export async function hasAllPermissions(userId, permissionList) {
  const perms = await getUserPermissions(userId);
  return permissionList.every((p) => perms.includes(p));
}
