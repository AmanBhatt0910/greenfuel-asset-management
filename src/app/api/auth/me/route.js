// src/app/api/auth/me/route.js

import { verifyAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * GET /api/auth/me
 * Returns the currently logged-in user's basic info from the JWT payload.
 */
export async function GET(req) {
  const auth = verifyAuth(req);
  if (!auth.ok) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id, email, role, must_change_password } = auth.user;
  return NextResponse.json({ id, email, role, must_change_password }, { status: 200 });
}
