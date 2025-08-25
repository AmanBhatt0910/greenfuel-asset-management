import pool from "@/lib/db";

export async function GET() {
  const [rows] = await pool.query("SELECT * FROM garbage");
  return new Response(JSON.stringify(rows), { status: 200 });
}

export async function POST(req) {
  const data = await req.json();
  const query = `INSERT INTO garbage (asset_code, reason, disposed_date) VALUES (?, ?, ?)`;
  const values = [data.asset_code, data.reason, data.disposed_date];
  await pool.query(query, values);
  return new Response(JSON.stringify({ message: "Marked as garbage" }), { status: 201 });
}
