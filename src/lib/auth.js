// src/lib/auth.js

import jwt from "jsonwebtoken";

export function verifyAuth(req) {
  try {
    let token = null;

    const auth = req.headers.get("authorization");
    if (auth && auth.startsWith("Bearer ")) {
      token = auth.slice(7);
    }

    if (!token) {
      const cookie = req.headers.get("cookie") || "";
      const match = cookie.match(/token=([^;]+)/);
      token = match?.[1];
    }

    if (!token) {
      return { ok: false, error: "Missing token" };
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return { ok: true, payload };
  } catch (e) {
    return { ok: false, error: "Invalid or expired token" };
  }
}
