import pool from "@/lib/db";
import { verifyAuth } from "@/lib/auth";

export async function GET(req) {
  const auth = verifyAuth(req);
  if (!auth.ok) {
    return new Response(JSON.stringify({ message: auth.error }), { status: 401 });
  }

  const [rows] = await pool.query(`
    SELECT id, event_type, asset_code, description, performed_by, created_at
    FROM asset_history
    ORDER BY created_at DESC
  `);

  return new Response(JSON.stringify(rows), { status: 200 });
}