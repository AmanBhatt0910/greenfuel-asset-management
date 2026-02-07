import pool from "@/lib/db";
import { verifyAuth } from "@/lib/auth";

export async function GET(req, context) {
  const auth = verifyAuth(req);
  if (!auth.ok)
    return new Response(JSON.stringify({ message: auth.error }), { status: 401 });

  const { id } = await context.params;

  try {
    const [rows] = await pool.query(
      `
      SELECT
        sa.id AS assignment_id,
        s.id AS software_id,
        s.name,
        s.version,
        s.vendor,
        s.license_type,
        sa.assigned_at
      FROM software_assignments sa
      JOIN software s ON sa.software_id = s.id
      WHERE sa.asset_id = ?
      AND sa.removed_at IS NULL
      `,
      [id]
    );

    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Failed to fetch assigned software" }), { status: 500 });
  }
}