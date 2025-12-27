// src/app/api/issues/route.js

// src/app/api/issues/route.js

import pool from "@/lib/db";
import { verifyAuth } from "@/lib/auth";
import { logHistory } from "@/lib/history";

/* ============================
   GET — Fetch all issues
============================ */
export async function GET(req) {
  const auth = verifyAuth(req);
  if (!auth.ok) {
    return new Response(
      JSON.stringify({ message: auth.error }),
      { status: 401 }
    );
  }

  try {
    const [rows] = await pool.query(`
      SELECT
        id,
        employee_name,
        emp_code,
        department,
        division,
        designation,
        location,
        phone,
        hod,
        email,
        asset_type,
        asset_code,
        make_model,
        serial_no,
        ip_address,
        os_software,
        terms,
        hostname,
        remarks,
        created_at
      FROM issues
      ORDER BY created_at DESC
    `);

    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (err) {
    console.error("GET /api/issues error:", err);
    return new Response(
      JSON.stringify({ message: "Failed to fetch issues" }),
      { status: 500 }
    );
  }
}

/* ============================
   POST — Issue asset
============================ */
export async function POST(req) {
  const auth = verifyAuth(req);
  if (!auth.ok) {
    return new Response(
      JSON.stringify({ message: auth.error }),
      { status: 401 }
    );
  }

  try {
    const data = await req.json();

    /* 🔒 Check asset status */
    const [[asset]] = await pool.query(
      `SELECT status FROM assets WHERE asset_code = ?`,
      [data.asset_code]
    );

    if (!asset) {
      return new Response(
        JSON.stringify({ message: "Asset not found" }),
        { status: 404 }
      );
    }

    if (asset.status !== "IN_STOCK") {
      return new Response(
        JSON.stringify({
          message: `Asset ${data.asset_code} is not available for issue`,
        }),
        { status: 409 }
      );
    }

    /* Create issue */
    const query = `
      INSERT INTO issues
      (
        employee_name,
        emp_code,
        department,
        division,
        designation,
        location,
        phone,
        hod,
        email,
        asset_type,
        asset_code,
        make_model,
        serial_no,
        ip_address,
        os_software,
        terms,
        hostname,
        remarks
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      data.employee_name || null,
      data.emp_code || null,
      data.department || null,
      data.division || null,
      data.designation || null,
      data.location || null,
      data.phone || null,
      data.hod || null,
      data.email || null,
      data.asset_type || null,
      data.asset_code,
      data.make_model || null,
      data.serial_no || null,
      data.ip_address || null,
      data.os_software || null,
      data.terms || null,
      data.hostname || null,
      data.remarks || null,
    ];

    const [result] = await pool.query(query, values);

    /* 🔄 Update asset status */
    await pool.query(
      `UPDATE assets SET status = 'ISSUED' WHERE asset_code = ?`,
      [data.asset_code]
    );

    /* 🧾 History */
    await logHistory({
      eventType: "ASSET_ISSUED",
      assetCode: data.asset_code,
      description: `Asset ${data.asset_code} issued to ${data.employee_name} (${data.emp_code})`,
      performedBy: auth.user?.email || "IT Admin",
    });

    return new Response(
      JSON.stringify({
        message: "Issue created successfully",
        id: result.insertId,
      }),
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/issues error:", err);
    return new Response(
      JSON.stringify({ message: "Failed to create issue" }),
      { status: 500 }
    );
  }
}
