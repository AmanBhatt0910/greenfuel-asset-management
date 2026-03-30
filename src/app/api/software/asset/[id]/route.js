import pool from "@/lib/db";
import { checkPermission } from "@/lib/auth";

export async function GET(req, context) {
  const auth = await checkPermission(req, "view_software");
  if (!auth.ok)
    return new Response(JSON.stringify({ message: auth.error }), { status: auth.error === "Unauthorized" ? 401 : 403 });

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