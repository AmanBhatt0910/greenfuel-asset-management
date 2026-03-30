// src/lib/auth.js

import jwt from "jsonwebtoken";
import pool from "@/lib/db";

export function verifyAuth(req) {
  try {
    let token = null;

    // Try Authorization header first
    const auth = req.headers.get("authorization");
    if (auth && auth.startsWith("Bearer ")) {
      token = auth.slice(7);
    }

    // If no Authorization header, try cookie
    if (!token) {
      const cookieHeader = req.headers.get("cookie") || "";
      const match = cookieHeader.match(/token=([^;]+)/);
      token = match?.[1];
    }

    if (!token) {
      return { ok: false, error: "Missing token" };
    }

    // Decode the token if it's URL-encoded
    token = decodeURIComponent(token);

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return { ok: true, user: payload, payload };
  } catch (e) {
    console.error("Auth verification error:", e.message);
    return { ok: false, error: "Invalid or expired token" };
  }
}

/**
 * Verify the JWT and check that the authenticated user holds the given
 * permission in the database. Returns { ok, user } or { ok, error }.
 */
export async function checkPermission(req, permission) {
  const auth = verifyAuth(req);
  if (!auth.ok) {
    return { ok: false, error: "Unauthorized" };
  }

  try {
    const [rows] = await pool.query(
      `SELECT p.name
       FROM permissions p
       INNER JOIN role_permissions rp ON p.id = rp.permission_id
       INNER JOIN users u ON u.role_id = rp.role_id
       WHERE u.id = ? AND p.name = ?`,
      [auth.user.id, permission]
    );

    if (rows.length === 0) {
      return { ok: false, error: "Insufficient permissions" };
    }

    return { ok: true, user: auth.user };
  } catch (error) {
    console.error("Permission check error:", error);
    return { ok: false, error: "Error checking permissions" };
  }
}