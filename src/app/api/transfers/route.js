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
  try {
    const data = await req.json();

    // Format date properly
    const transferDate = data.transfer_date
      ? new Date(data.transfer_date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    const query = `
      INSERT INTO transfers (from_emp_code, to_emp_code, asset_code, transfer_date, status)
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [
      data.from_emp_code,
      data.to_emp_code,
      data.asset_code,
      transferDate,
      data.status || "Pending",
    ];

    const [result] = await pool.query(query, values);

    await logHistory({
      eventType: "ASSET_TRANSFERRED",
      assetCode: data.asset_code,
      description: `Asset ${data.asset_code} transferred from ${data.from_emp_code} to ${data.to_emp_code}`,
      performedBy: "System",
    });

    return new Response(
      JSON.stringify({ message: "Transfer created", id: result.insertId }),
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/transfers error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
