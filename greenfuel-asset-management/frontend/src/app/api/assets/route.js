import pool from "@/lib/db";
import { verifyAuth } from "@/lib/auth";

export async function GET(req) {
  const auth = verifyAuth(req);
  if (!auth.ok) return new Response(JSON.stringify({ message: auth.error }), { status: 401 });

  try {
    const [rows] = await pool.query(
      `SELECT id, asset_code, make, model, serial_no, po_no, invoice_no, invoice_date,
              amount, vendor, warranty_years, warranty_start, warranty_end, created_at
       FROM assets
       ORDER BY created_at DESC`
    );
    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Failed to fetch assets" }), { status: 500 });
  }
}

export async function POST(req) {
  const auth = verifyAuth(req);
  if (!auth.ok) return new Response(JSON.stringify({ message: auth.error }), { status: 401 });

  try {
    const data = await req.json();
    const required = ["asset_code", "serial_no"];
    for (const k of required) {
      if (!data[k] || String(data[k]).trim() === "") {
        return new Response(JSON.stringify({ message: `Missing field: ${k}` }), { status: 400 });
      }
    }

    const query = `
      INSERT INTO assets
      (asset_code, make, model, serial_no, po_no, invoice_no, invoice_date,
       amount, vendor, warranty_years, warranty_start, warranty_end)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      data.asset_code || null,
      data.make || null,
      data.model || null,
      data.serial_no || null,
      data.po_no || null,
      data.invoice_no || null,
      data.invoice_date || null,
      data.amount ?? null,
      data.vendor || null,
      data.warranty_years ?? null,
      data.warranty_start || null,
      data.warranty_end || null,
    ];

    const [result] = await pool.query(query, values);
    return new Response(JSON.stringify({ message: "Asset created", id: result.insertId }), { status: 201 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Failed to create asset" }), { status: 500 });
  }
}
