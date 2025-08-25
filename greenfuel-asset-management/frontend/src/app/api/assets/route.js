import pool from "@/lib/db";

// GET all assets
export async function GET() {
  const [rows] = await pool.query("SELECT * FROM assets");
  return new Response(JSON.stringify(rows), { status: 200 });
}

// POST new asset
export async function POST(req) {
  const data = await req.json();
  const query = `
    INSERT INTO assets (asset_code, make, model, serial_no, po_no, invoice_no, invoice_date, amount, vendor, warranty_years, warranty_start, warranty_end)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    data.asset_code,
    data.make,
    data.model,
    data.serial_no,
    data.po_no,
    data.invoice_no,
    data.invoice_date,
    data.amount,
    data.vendor,
    data.warranty_years,
    data.warranty_start,
    data.warranty_end,
  ];
  await pool.query(query, values);
  return new Response(JSON.stringify({ message: "Asset created" }), { status: 201 });
}
