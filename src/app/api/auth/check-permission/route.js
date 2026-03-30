// src/app/api/auth/check-permission/route.js

import { checkPermission } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * POST /api/auth/check-permission
 * Body: { permission: string }
 * Returns { allowed: boolean }
 */
export async function POST(req) {
  try {
    const { permission } = await req.json();

    if (!permission) {
      return NextResponse.json(
        { message: "permission is required" },
        { status: 400 }
      );
    }

    const result = await checkPermission(req, permission);
    return NextResponse.json({ allowed: result.ok }, { status: 200 });
  } catch (err) {
    console.error("POST /api/auth/check-permission error:", err);
    return NextResponse.json({ allowed: false }, { status: 200 });
  }
}
