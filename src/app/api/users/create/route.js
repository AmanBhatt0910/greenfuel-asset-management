// src/app/api/users/create/route.js

import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { checkPermission } from "@/lib/auth";
import { generateTempPassword } from "@/lib/password";
import { sendWelcomeEmail } from "@/lib/email";
import { NextResponse } from "next/server";

/**
 * POST /api/users/create
 * Admin creates a new user with a specified role.
 * The system generates a temporary password and emails the user.
 */
export async function POST(req) {
  try {
    const permCheck = await checkPermission(req, "manage_users");
    if (!permCheck.ok) {
      return NextResponse.json({ message: permCheck.error }, { status: 403 });
    }

    const { email, first_name, last_name, role_name, department } =
      await req.json();

    if (!email || !role_name) {
      return NextResponse.json(
        { message: "email and role_name are required" },
        { status: 400 }
      );
    }

    // Resolve role
    const [roleRows] = await pool.query(
      "SELECT id FROM roles WHERE name = ?",
      [role_name]
    );
    if (!roleRows.length) {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 });
    }
    const roleId = roleRows[0].id;

    // Generate and hash temporary password
    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    // Insert user
    const [result] = await pool.query(
      `INSERT INTO users
         (email, passwordHash, role_id, first_name, last_name, department,
          status, must_change_password, created_by)
       VALUES (?, ?, ?, ?, ?, ?, 'active', 1, ?)`,
      [
        email,
        passwordHash,
        roleId,
        first_name || null,
        last_name || null,
        department || null,
        permCheck.user.id,
      ]
    );

    // Send welcome email (non-blocking – log errors but don't fail the request)
    try {
      await sendWelcomeEmail({
        to: email,
        firstName: first_name || email,
        tempPassword,
        role: role_name,
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError.message);
    }

    return NextResponse.json(
      {
        message: "User created successfully",
        userId: result.insertId,
        tempPassword, // returned so admin can share manually if email fails
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/users/create error:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { message: "A user with that email already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
