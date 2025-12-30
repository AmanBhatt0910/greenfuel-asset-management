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

    const [rows] = await pool.query(
      "SELECT * FROM admins WHERE email = ?",
      [email]
    );

    if (!rows.length) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const user = rows[0];

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid password" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const response = NextResponse.json(
      { message: "Login successful", success: true },
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