import pool from "@/lib/db";
import { verifyAuth } from "@/lib/auth";
import { logHistory } from "@/lib/history";

/* ============================
   GET — All transfers
============================ */
export async function GET(req) {
  const auth = verifyAuth(req);
  if (!auth.ok) {
    return new Response(JSON.stringify({ message: auth.error }), { status: 401 });
  }

  try {
    const [rows] = await pool.query(`
      SELECT 
        t.id,
        t.asset_code,
        t.from_emp_code,
        t.to_emp_code,
        t.transfer_date,
        t.status,
        a.make,
        a.model,
        a.serial_no
      FROM transfers t
      LEFT JOIN assets a ON a.asset_code = t.asset_code
      ORDER BY t.created_at DESC
    `);

    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (err) {
    console.error("GET /api/transfers error:", err);
    return new Response(
      JSON.stringify({ message: "Failed to fetch transfers" }),
      { status: 500 }
    );
  }
}

/* ============================
   POST — Transfer asset immediately
============================ */
export async function POST(req) {
  const auth = verifyAuth(req);
  if (!auth.ok) {
    return new Response(JSON.stringify({ message: auth.error }), { status: 401 });
  }

  const conn = await pool.getConnection();

  try {
    const data = await req.json();

    await conn.beginTransaction();

    /* 1️⃣ Validate asset */
    const [[asset]] = await conn.query(
      `SELECT status FROM assets WHERE asset_code = ? FOR UPDATE`,
      [data.asset_code]
    );

    if (!asset || asset.status !== "ISSUED") {
      await conn.rollback();
      return new Response(
        JSON.stringify({ message: "Only ISSUED assets can be transferred" }),
        { status: 409 }
      );
    }

    /* 2️⃣ Insert transfer record */
    await conn.query(
      `INSERT INTO transfers
       (from_emp_code, to_emp_code, asset_code, transfer_date, status)
       VALUES (?, ?, ?, CURDATE(), 'COMPLETED')`,
      [data.from_emp_code, data.to_emp_code, data.asset_code]
    );

    /* 3️⃣ Update issue ownership */
    await conn.query(
      `UPDATE issues
       SET emp_code = ?, employee_name = ?, department = ?, division = ?, location = ?
       WHERE asset_code = ?`,
      [
        data.to_emp_code,
        data.to_emp_name,
        data.to_department,
        data.to_division,
        data.to_location,
        data.asset_code,
      ]
    );

    /* 4️⃣ History */
    await logHistory({
      eventType: "ASSET_TRANSFERRED",
      assetCode: data.asset_code,
      description: `Asset transferred from ${data.from_emp_code} to ${data.to_emp_code}`,
      performedBy: auth.user?.email || "IT Admin",
    });

    await conn.commit();

    return new Response(
      JSON.stringify({ message: "Asset transferred successfully" }),
      { status: 201 }
    );
  } catch (err) {
    await conn.rollback();
    console.error("POST /api/transfers error:", err);
    return new Response(
      JSON.stringify({ message: "Failed to transfer asset" }),
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}
