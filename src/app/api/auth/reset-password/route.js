// src/app/api/auth/reset-password/route.js

import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { checkPermission } from "@/lib/auth";
import { generateTempPassword } from "@/lib/password";
import { sendPasswordResetEmail } from "@/lib/email";
import { NextResponse } from "next/server";

/**
 * POST /api/auth/reset-password
 * Admin resets a user's password. The system generates a new temporary
 * password and emails it to the user.
 * Body: { userId: number }
 * Requires manage_users permission.
 */
export async function POST(req) {
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

    const [rows] = await pool.query(
      "SELECT id, email, first_name FROM users WHERE id = ?",
      [userId]
    );

    if (!rows.length) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const user = rows[0];
    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    await pool.query(
      "UPDATE users SET passwordHash = ?, must_change_password = 1 WHERE id = ?",
      [passwordHash, userId]
    );

    // Send reset email (non-blocking)
    try {
      await sendPasswordResetEmail({
        to: user.email,
        firstName: user.first_name || user.email,
        tempPassword,
      });
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError.message);
    }

    return NextResponse.json(
      {
        message: "Password reset successfully",
        tempPassword, // returned so admin can share manually if email fails
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("POST /api/auth/reset-password error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
