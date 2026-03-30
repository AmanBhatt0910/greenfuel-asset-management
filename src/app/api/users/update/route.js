// src/app/api/users/update/route.js

import pool from "@/lib/db";
import { checkPermission } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * PUT /api/users/update
 * Updates user details. Requires manage_users permission.
 */
export async function PUT(req) {
  try {
    const permCheck = await checkPermission(req, "manage_users");
    if (!permCheck.ok) {
      return NextResponse.json({ message: permCheck.error }, { status: 403 });
    }

    const { userId, first_name, last_name, department, role_name, status } =
      await req.json();

    if (!userId) {
      return NextResponse.json(
        { message: "userId is required" },
        { status: 400 }
      );
    }

    const setClauses = [];
    const params = [];

    if (first_name !== undefined) {
      setClauses.push("first_name = ?");
      params.push(first_name);
    }
    if (last_name !== undefined) {
      setClauses.push("last_name = ?");
      params.push(last_name);
    }
    if (department !== undefined) {
      setClauses.push("department = ?");
      params.push(department);
    }
    if (status !== undefined) {
      setClauses.push("status = ?");
      params.push(status);
    }
    if (role_name) {
      const [roleRows] = await pool.query(
        "SELECT id FROM roles WHERE name = ?",
        [role_name]
      );
      if (!roleRows.length) {
        return NextResponse.json({ message: "Invalid role" }, { status: 400 });
      }
      setClauses.push("role_id = ?");
      params.push(roleRows[0].id);
    }

    if (setClauses.length === 0) {
      return NextResponse.json(
        { message: "No fields to update" },
        { status: 400 }
      );
    }

    params.push(userId);
    await pool.query(
      `UPDATE users SET ${setClauses.join(", ")} WHERE id = ?`,
      params
    );

    return NextResponse.json(
      { message: "User updated successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("PUT /api/users/update error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
