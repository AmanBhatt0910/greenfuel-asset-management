// src/app/api/software/assign/[id]/route.js

import pool from "@/lib/db";
import { verifyAuth } from "@/lib/auth";
import { logHistory } from "@/lib/history";

export async function DELETE(req, context) {

  const auth = verifyAuth(req);

  if (!auth.ok)
    return new Response(JSON.stringify({ message: auth.error }), { status: 401 });

  const { id } = await context.params;

  const conn = await pool.getConnection();

  try {

    await conn.beginTransaction();

    const [[assignment]] = await conn.query(
      `
      SELECT software_id, asset_id
      FROM software_assignments
      WHERE id = ?
      `,
      [id]
    );

    if (!assignment)
      throw new Error("Assignment not found");

    await conn.query(
      `
      UPDATE software_assignments
      SET removed_at = NOW()
      WHERE id = ?
      `,
      [id]
    );

    await conn.query(
      `
      UPDATE software
      SET seats_used = seats_used - 1
      WHERE id = ?
      `,
      [assignment.software_id]
    );

    await logHistory({

      eventType: "SOFTWARE_REMOVED",

      assetId: assignment.asset_id,

      description: `Software ID ${assignment.software_id} removed`,

      performedBy: auth.user.email,

    });

    await conn.commit();

    return new Response(JSON.stringify({ message: "Software removed" }), { status: 200 });

  } catch (err) {

    await conn.rollback();

    console.error(err);

    return new Response(JSON.stringify({ message: "Removal failed" }), { status: 500 });

  } finally {

    conn.release();

  }
}