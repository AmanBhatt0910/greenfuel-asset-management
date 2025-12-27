// src/app/api/transfers/route.js

import pool from "@/lib/db";
import { logHistory } from "@/lib/history";


// GET all transfers (joined with asset details)
export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT t.id, t.asset_code, t.from_emp_code, t.to_emp_code, 
             t.transfer_date, t.status, a.make, a.model, a.serial_no
      FROM transfers t
      LEFT JOIN assets a ON t.asset_code = a.asset_code
      ORDER BY t.created_at DESC
    `);
    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (error) {
    console.error("GET /api/transfers error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// POST a new transfer request
export async function POST(req) {
  const auth = verifyAuth(req);
  if (!auth.ok) {
    return new Response(JSON.stringify({ message: auth.error }), { status: 401 });
  }

  try {
    const data = await req.json();

    const [[asset]] = await pool.query(
      `SELECT status FROM assets WHERE asset_code = ?`,
      [data.asset_code]
    );

    if (!asset || asset.status !== "ISSUED") {
      return new Response(
        JSON.stringify({ message: "Only ISSUED assets can be transferred" }),
        { status: 409 }
      );
    }

    await pool.query(
      `INSERT INTO transfers
       (from_emp_code, to_emp_code, asset_code, transfer_date, status)
       VALUES (?, ?, ?, CURDATE(), 'COMPLETED')`,
      [data.from_emp_code, data.to_emp_code, data.asset_code]
    );

    await logHistory({
      eventType: "ASSET_TRANSFERRED",
      assetCode: data.asset_code,
      description: `Transferred from ${data.from_emp_code} to ${data.to_emp_code}`,
      performedBy: auth.user?.email || "IT Admin",
    });

    return new Response(
      JSON.stringify({ message: "Transfer completed" }),
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ message: "Failed to transfer asset" }),
      { status: 500 }
    );
  }
}
