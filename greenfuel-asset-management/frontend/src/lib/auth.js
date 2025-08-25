import jwt from "jsonwebtoken";

export function verifyAuth(req) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return { ok: false, error: "Missing token" };

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return { ok: true, payload };
  } catch (e) {
    return { ok: false, error: "Invalid or expired token" };
  }
}
