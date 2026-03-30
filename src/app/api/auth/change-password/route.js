// src/app/api/auth/change-password/route.js

import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { verifyAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * POST /api/auth/change-password
 * Allows an authenticated user to change their own password.
 * Body: { currentPassword: string, newPassword: string }
 * On first login, currentPassword is the temporary password.
 */
export async function POST(req) {
  try {
    const auth = verifyAuth(req);
    if (!auth.ok) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "currentPassword and newPassword are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: "New password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Fetch current password hash
    const [rows] = await pool.query(
      "SELECT id, passwordHash, must_change_password FROM users WHERE id = ?",
      [auth.user.id]
    );

    if (!rows.length) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const user = rows[0];

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { message: "Current password is incorrect" },
        { status: 401 }
      );
    }

    const newHash = await bcrypt.hash(newPassword, 12);

    await pool.query(
      "UPDATE users SET passwordHash = ?, must_change_password = 0 WHERE id = ?",
      [newHash, auth.user.id]
    );

    // Issue a fresh token without must_change_password flag
    const newToken = jwt.sign(
      {
        id: auth.user.id,
        email: auth.user.email,
        role: auth.user.role,
        must_change_password: false,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const response = NextResponse.json(
      { message: "Password changed successfully", success: true },
      { status: 200 }
    );

    response.cookies.set({
      name: "token",
      value: newToken,
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (err) {
    console.error("POST /api/auth/change-password error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
