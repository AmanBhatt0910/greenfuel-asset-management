// src/app/api/software/[id]/route.js

import pool from "@/lib/db";
import { verifyAuth } from "@/lib/auth";
import { logHistory } from "@/lib/history";

export async function GET(req, context) {
  const auth = verifyAuth(req);
  if (!auth.ok)
    return new Response(JSON.stringify({ message: auth.error }), { status: 401 });

  const { id } = await context.params;

  try {
    const [rows] = await pool.query(
      `SELECT * FROM software WHERE id = ?`,
      [id]
    );

    if (!rows.length)
      return new Response(JSON.stringify({ message: "Software not found" }), { status: 404 });

    return new Response(JSON.stringify(rows[0]), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Failed to fetch software" }), { status: 500 });
  }
}

export async function PUT(req, context) {
  const auth = verifyAuth(req);
  if (!auth.ok)
    return new Response(JSON.stringify({ message: auth.error }), { status: 401 });

  const { id } = await context.params;
  const data = await req.json();
  
  const normalizeDate = (d) =>
  d ? new Date(d).toISOString().slice(0, 10) : null;

  try {
    await pool.query(
      `
      UPDATE software SET
      name = ?, version = ?, vendor = ?, license_type = ?,
      license_key = ?, purchase_date = ?, expiry_date = ?,
      seats_total = ?, notes = ?
      WHERE id = ?
      `,
    [
      data.name,
      data.version,
      data.vendor,
      data.license_type,
      data.license_key,
      normalizeDate(data.purchase_date),
      normalizeDate(data.expiry_date),
      data.seats_total,
      data.notes,
      id,
    ]
    );

    await logHistory({
      eventType: "SOFTWARE_UPDATED",
      description: `Software updated: ${data.name}`,
      performedBy: auth.user.email,
    });

    return new Response(JSON.stringify({ message: "Software updated" }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Update failed" }), { status: 500 });
  }
}


export async function DELETE(req, context) {

  const auth = verifyAuth(req);

  if (!auth.ok)
    return new Response(
      JSON.stringify({ message: auth.error }),
      { status: 401 }
    );

  const { id } = context.params;

  const conn = await pool.getConnection();

  try {

    await conn.beginTransaction();

    const [[software]] = await conn.query(
      `SELECT name FROM software WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );

    if (!software) {
      await conn.rollback();
      return new Response(
        JSON.stringify({ message: "Software not found" }),
        { status: 404 }
      );
    }

    await conn.query(
      `UPDATE software SET deleted_at = NOW() WHERE id = ?`,
      [id]
    );

    await logHistory({
      eventType: "SOFTWARE_DELETED",
      description: `Software deleted: ${software.name}`,
      performedBy: auth.user.email,
    });

    await conn.commit();

    return new Response(
      JSON.stringify({ message: "Software deleted successfully" }),
      { status: 200 }
    );

  } catch (err) {

    await conn.rollback();

    console.error(err);

    return new Response(
      JSON.stringify({ message: "Delete failed" }),
      { status: 500 }
    );

  } finally {

    conn.release();

  }

}