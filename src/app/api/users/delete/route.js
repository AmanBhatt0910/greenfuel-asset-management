// src/app/api/users/delete/route.js

import pool from "@/lib/db";
import { checkPermission } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * DELETE /api/users/delete
 * Soft-deletes a user by setting their status to 'inactive'.
 * Requires manage_users permission.
 */
export async function DELETE(req) {
  try {
    const permCheck = await checkPermission(req, "manage_users");
    if (!permCheck.ok) {
      return NextResponse.json({ message: permCheck.error }, { status: 403 });
    }

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { message: "userId is required" },
        { status: 400 }
      );
    }

    // Prevent self-deactivation
    if (userId === permCheck.user.id) {
      return NextResponse.json(
        { message: "You cannot deactivate your own account" },
        { status: 400 }
      );
    }

    await pool.query(
      "UPDATE users SET status = 'inactive' WHERE id = ?",
      [userId]
    );

    return NextResponse.json(
      { message: "User deactivated successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE /api/users/delete error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
