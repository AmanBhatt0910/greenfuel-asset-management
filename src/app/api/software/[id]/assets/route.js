// src/app/api/software/[id]/assets/route.js

import pool from "@/lib/db";
import { verifyAuth } from "@/lib/auth";

export async function GET(req, context) {

  const auth = verifyAuth(req);

  if (!auth.ok)
    return new Response(JSON.stringify({
      message: auth.error
    }), { status: 401 });

  const { id } = await context.params;

  try {

    const [rows] = await pool.query(
      `
      SELECT
        sa.id AS assignment_id,
        a.id AS asset_id,
        a.asset_code,
        a.make,
        a.model,
        a.serial_no,
        a.status,
        sa.assigned_at,
        sa.assigned_by
      FROM software_assignments sa
      JOIN assets a ON a.id = sa.asset_id
      WHERE sa.software_id = ?
      AND sa.removed_at IS NULL
      ORDER BY sa.assigned_at DESC
      `,
      [id]
    );

    return new Response(JSON.stringify(rows), { status: 200 });

  } catch (err) {

    console.error(err);

    return new Response(JSON.stringify({
      message: "Failed to fetch assets"
    }), { status: 500 });

  }

}