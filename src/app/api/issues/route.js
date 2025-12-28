// src/app/api/issues/route.js

import pool from "@/lib/db";
import { verifyAuth } from "@/lib/auth";
import { logHistory } from "@/lib/history";

/* ============================
   GET — Fetch all issued assets
============================ */
export async function GET(req) {
  const auth = verifyAuth(req);
  if (!auth.ok) {
    return new Response(JSON.stringify({ message: auth.error }), { status: 401 });
  }

  try {
    const [rows] = await pool.query(`
      SELECT
        i.id,
        i.employee_name,
        i.emp_code,
        i.department,
        i.division,
        i.designation,
        i.location,
        i.phone,
        i.hod,
        i.email,

        i.asset_type,
        i.asset_code,
        i.make_model,
        i.serial_no,
        i.ip_address,

        i.os_software,
        i.os_name,
        i.os_version,
        i.office_version,
        i.antivirus,
        i.windows_update,
        i.local_admin_removed,
        i.printer_configured,
        i.sap,
        i.backup_configured,
        i.zip_7,
        i.chrome,
        i.onedrive,
        i.laptop_bag,
        i.rmm_agent,
        i.hostname,
        i.physical_condition,

        i.terms,
        i.remarks,
        i.created_at
      FROM issues i
      INNER JOIN assets a
        ON a.asset_code = i.asset_code
      WHERE a.status = 'ISSUED'
      ORDER BY i.created_at DESC
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
    return new Response(JSON.stringify({ message: auth.error }), { status: 401 });
  }

  const conn = await pool.getConnection();

  try {
    const data = await req.json();
    await conn.beginTransaction();

    const [[asset]] = await conn.query(
      `SELECT status FROM assets WHERE asset_code = ? FOR UPDATE`,
      [data.asset_code]
    );

    if (!asset) {
      await conn.rollback();
      return new Response(JSON.stringify({ message: "Asset not found" }), { status: 404 });
    }

    if (asset.status !== "IN_STOCK") {
      await conn.rollback();
      return new Response(
        JSON.stringify({ message: "Asset cannot be issued in current state" }),
        { status: 409 }
      );
    }

    await conn.query(
      `
      INSERT INTO issues (
        employee_name, emp_code, department, division, designation,
        location, phone, hod, email,

        asset_type, asset_code, make_model, serial_no, ip_address,

        os_software, os_name, os_version, office_version,
        antivirus, windows_update, local_admin_removed,
        printer_configured, sap, backup_configured,
        zip_7, chrome, onedrive, laptop_bag,
        rmm_agent, hostname, physical_condition,

        terms, remarks
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?
      )
      `,
      [
        data.employee_name,
        data.emp_code,
        data.department,
        data.division,
        data.designation,
        data.location,
        data.phone,
        data.hod,
        data.email,

        data.asset_type,
        data.asset_code,
        data.make_model,
        data.serial_no,
        data.ip_address,

        data.os_software,
        data.os_name,
        data.os_version,
        data.office_version,
        data.antivirus,
        data.windows_update,
        data.local_admin_removed,
        data.printer_configured,
        data.sap,
        data.backup_configured,
        data.zip_7,
        data.chrome,
        data.onedrive,
        data.laptop_bag,
        data.rmm_agent,
        data.hostname,
        data.physical_condition,

        data.terms,
        data.remarks,
      ]
    );

    await conn.query(
      `UPDATE assets SET status = 'ISSUED' WHERE asset_code = ?`,
      [data.asset_code]
    );

    await logHistory({
      eventType: "ASSET_ISSUED",
      assetCode: data.asset_code,
      description: `Issued to ${data.employee_name} (${data.emp_code})`,
      performedBy: auth.user?.email || "IT Admin",
    });

    await conn.commit();

    return new Response(
      JSON.stringify({ message: "Issue created successfully" }),
      { status: 201 }
    );
  } catch (err) {
    await conn.rollback();
    console.error("POST /api/issues error:", err);
    return new Response(
      JSON.stringify({ message: "Failed to create issue" }),
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}
