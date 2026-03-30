// src/app/api/users/list/route.js

import pool from "@/lib/db";
import { checkPermission } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * GET /api/users/list
 * Returns all users. Requires manage_users permission.
 */
export async function GET(req) {
  try {
    const permCheck = await checkPermission(req, "manage_users");
    if (!permCheck.ok) {
      return NextResponse.json({ message: permCheck.error }, { status: 403 });
    }

    const [users] = await pool.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.department,
              r.name AS role, u.status, u.must_change_password, u.created_at
       FROM users u
       INNER JOIN roles r ON u.role_id = r.id
       ORDER BY u.created_at DESC`
    );

    return NextResponse.json(users, { status: 200 });
  } catch (err) {
    console.error("GET /api/users/list error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
