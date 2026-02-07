import pool from "@/lib/db";
import { verifyAuth } from "@/lib/auth";
import { logHistory } from "@/lib/history";

export async function POST(req) {
  const auth = verifyAuth(req);
  if (!auth.ok)
    return new Response(JSON.stringify({ message: auth.error }), { status: 401 });

  const conn = await pool.getConnection();

  try {
    const { software_id, asset_id } = await req.json();

    await conn.beginTransaction();

    await conn.query(
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
      description: `Software ID ${software_id} assigned`,
      performedBy: auth.user.email,
    });

    await conn.commit();

    return new Response(JSON.stringify({ message: "Software assigned" }), { status: 201 });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return new Response(JSON.stringify({ message: "Assignment failed" }), { status: 500 });
  } finally {
    conn.release();
  }
}