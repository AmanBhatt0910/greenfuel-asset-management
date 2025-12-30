// src/lib/auth.js

import jwt from "jsonwebtoken";

export function verifyAuth(req) {
  try {
    let token = null;

    // Try Authorization header first
    const auth = req.headers.get("authorization");
    if (auth && auth.startsWith("Bearer ")) {
      token = auth.slice(7);
    }

    // If no Authorization header, try cookie
    if (!token) {
      const cookieHeader = req.headers.get("cookie") || "";
      const match = cookieHeader.match(/token=([^;]+)/);
      token = match?.[1];
    }

    if (!token) {
      return { ok: false, error: "Missing token" };
    }

    // Decode the token if it's URL-encoded
    token = decodeURIComponent(token);

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return { ok: true, user: payload, payload };
  } catch (e) {
    console.error("Auth verification error:", e.message);
    return { ok: false, error: "Invalid or expired token" };
  }
}