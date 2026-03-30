// src/app/api/auth/route.js

import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined!");
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    // Query the users table (RBAC) first; fall back to legacy admins table.
    let user = null;

    const [userRows] = await pool.query(
      `SELECT u.id, u.email, u.passwordHash, u.must_change_password,
              u.first_name, u.last_name, r.name AS role
       FROM users u
       INNER JOIN roles r ON u.role_id = r.id
       WHERE u.email = ? AND u.status = 'active'`,
      [email]
    );

    if (userRows.length) {
      user = userRows[0];
    } else {
      // Legacy fallback – admins table
      const [adminRows] = await pool.query(
        "SELECT * FROM admins WHERE email = ?",
        [email]
      );
      if (adminRows.length) {
        user = { ...adminRows[0], role: adminRows[0].role || "admin", must_change_password: 0 };
      }
    }

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid password" },
        { status: 401 }
      );
    }

    const mustChangePassword = Boolean(user.must_change_password);

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        must_change_password: mustChangePassword,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const response = NextResponse.json(
      {
        message: "Login successful",
        success: true,
        must_change_password: mustChangePassword,
      },
      { status: 200 }
    );

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (err) {
    console.error("Auth error:", err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
