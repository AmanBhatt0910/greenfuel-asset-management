import pool from "@/lib/db";
import { verifyAuth } from "@/lib/auth";

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
        data.purchase_date,
        data.expiry_date,
        data.seats_total,
        data.notes,
        id,
      ]
    );

    return new Response(JSON.stringify({ message: "Software updated" }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Update failed" }), { status: 500 });
  }
}