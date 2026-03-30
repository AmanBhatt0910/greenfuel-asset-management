import pool from "@/lib/db";
import { checkPermission } from "@/lib/auth";

export async function GET(req) {
  const auth = await checkPermission(req, "view_history");
  if (!auth.ok) {
    return new Response(JSON.stringify({ message: auth.error }), { status: auth.error === "Unauthorized" ? 401 : 403 });
  }

  const [rows] = await pool.query(`
    SELECT id, event_type, asset_code, description, performed_by, created_at
    FROM asset_history
    ORDER BY created_at DESC
  `);

  return new Response(JSON.stringify(rows), { status: 200 });
}