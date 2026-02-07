// app/api/software/assign/route.js

import pool from "@/lib/db";
import { verifyAuth } from "@/lib/auth";
import { logHistory } from "@/lib/history";

export async function POST(req) {

  const auth = verifyAuth(req);

  if (!auth.ok)
    return new Response(JSON.stringify({
      message: auth.error
    }), { status: 401 });

  const conn = await pool.getConnection();

  try {

    const { software_id, asset_id } = await req.json();

    await conn.beginTransaction();

    /* Prevent duplicate assignment */
    const [[existing]] = await conn.query(
      `
      SELECT id FROM software_assignments
      WHERE software_id = ?
      AND asset_id = ?
      AND removed_at IS NULL
      `,
      [software_id, asset_id]
    );

    if (existing) {

      await conn.rollback();

      return new Response(JSON.stringify({
        message: "Software already assigned"
      }), { status: 409 });

    }

    /* Check seat availability */
    const [[software]] = await conn.query(
      `
      SELECT name, seats_total, seats_used
      FROM software
      WHERE id = ?
      `,
      [software_id]
    );

    if (software.seats_used >= software.seats_total) {

      await conn.rollback();

      return new Response(JSON.stringify({
        message: "No seats available"
      }), { status: 409 });

    }

    /* Assign */
    const [result] = await conn.query(
      `
      INSERT INTO software_assignments
      (software_id, asset_id, assigned_by)
      VALUES (?, ?, ?)
      `,
      [software_id, asset_id, auth.user.email]
    );

    await conn.query(
      `
      UPDATE software
      SET seats_used = seats_used + 1
      WHERE id = ?
      `,
      [software_id]
    );

    await logHistory({

      eventType: "SOFTWARE_ASSIGNED",

      assetId: asset_id,

      description: `${software.name} assigned`,

      performedBy: auth.user.email,

    });

    await conn.commit();

    return new Response(JSON.stringify({
      message: "Software assigned",
      assignment_id: result.insertId
    }), { status: 201 });

  }
  catch (err) {

    await conn.rollback();

    console.error(err);

    return new Response(JSON.stringify({
      message: "Assignment failed"
    }), { status: 500 });

  }
  finally {

    conn.release();

  }

}