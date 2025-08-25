
import pool from "@/lib/db";
import { verifyAuth } from "@/lib/auth";

// Helper to convert JS date/ISO to MySQL DATE
const formatDate = (d) => {
  if (!d) return null;
  const date = new Date(d);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export async function GET(req, { params }) {
  const auth = verifyAuth(req);
  if (!auth.ok) return new Response(JSON.stringify({ message: auth.error }), { status: 401 });

  const { id } = params;

  try {
    const [rows] = await pool.query(
      `SELECT id, asset_code, make, model, serial_no, po_no, invoice_no, invoice_date,
              amount, vendor, warranty_years, warranty_start, warranty_end, created_at
       FROM assets
       WHERE id = ?`,
      [id]
    );

    if (!rows.length) return new Response(JSON.stringify({ message: "Asset not found" }), { status: 404 });
    return new Response(JSON.stringify(rows[0]), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Failed to fetch asset" }), { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const auth = verifyAuth(req);
  if (!auth.ok) return new Response(JSON.stringify({ message: auth.error }), { status: 401 });

  const { id } = params;
  const data = await req.json();

  try {
    const query = `
      UPDATE assets SET
      asset_code = ?, make = ?, model = ?, serial_no = ?, po_no = ?, invoice_no = ?,
      invoice_date = ?, amount = ?, vendor = ?, warranty_years = ?, warranty_start = ?, warranty_end = ?
      WHERE id = ?
    `;

    const values = [
      data.asset_code || null,
      data.make || null,
      data.model || null,
      data.serial_no || null,
      data.po_no || null,
      data.invoice_no || null,
      formatDate(data.invoice_date),
      data.amount ?? null,
      data.vendor || null,
      data.warranty_years ?? null,
      formatDate(data.warranty_start),
      formatDate(data.warranty_end),
      id,
    ];

    const [result] = await pool.query(query, values);
    if (result.affectedRows === 0) return new Response(JSON.stringify({ message: "Asset not found" }), { status: 404 });

    return new Response(JSON.stringify({ message: "Asset updated successfully" }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Failed to update asset" }), { status: 500 });
  }
}
