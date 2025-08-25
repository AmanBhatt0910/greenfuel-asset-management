import pool from "@/lib/db";

export async function GET() {
  const [rows] = await pool.query("SELECT * FROM transfers");
  return new Response(JSON.stringify(rows), { status: 200 });
}

export async function POST(req) {
  const data = await req.json();
  const query = `
    INSERT INTO transfers (from_emp_code, to_emp_code, asset_code, transfer_date, status)
    VALUES (?, ?, ?, ?, ?)
  `;
  const values = [data.from_emp_code, data.to_emp_code, data.asset_code, data.transfer_date, data.status];
  await pool.query(query, values);
  return new Response(JSON.stringify({ message: "Transfer created" }), { status: 201 });
}
