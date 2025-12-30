// src/app/api/assets/[id]/history/route.js

import pool from "@/lib/db";
import { verifyAuth } from "@/lib/auth";

export async function GET(req, context) {
  const auth = verifyAuth(req);
  if (!auth.ok) {
    return new Response(JSON.stringify({ message: auth.error }), { status: 401 });
  }

  const params = await context.params;

  try {
    const [[asset]] = await pool.query(
      `SELECT id, asset_code, make, model, serial_no, status
       FROM assets
       WHERE id = ?`,
      [params.id]
    );

    if (!asset) {
      return new Response(
        JSON.stringify({ message: "Asset not found" }),
        { status: 404 }
      );
    }

    const timeline = [];

    const [issues] = await pool.query(
      `SELECT
        employee_name,
        emp_code,
        department,
        location,
        created_at
       FROM issues
       WHERE asset_code = ?`,
      [asset.asset_code]
    );

    issues.forEach((i) => {
      timeline.push({
        event_type: "ISSUED",
        employee_name: i.employee_name,
        emp_code: i.emp_code,
        department: i.department,
        location: i.location,
        event_date: i.created_at,
        performed_by: "IT Admin",
        display_message: `Issued to ${i.employee_name} (${i.emp_code})`,
        source: "ISSUE",
      });
    });

    const [transfers] = await pool.query(
      `SELECT
        from_emp_code,
        to_emp_code,
        transfer_date,
        created_at
       FROM transfers
       WHERE asset_code = ?`,
      [asset.asset_code]
    );

    transfers.forEach((t) => {
      timeline.push({
        event_type: "TRANSFER",
        from_emp_code: t.from_emp_code,
        to_emp_code: t.to_emp_code,
        event_date: t.transfer_date || t.created_at,
        performed_by: "IT Admin",
        display_message: `Transferred from ${t.from_emp_code} to ${t.to_emp_code}`,
        source: "TRANSFER",
      });
    });

    const [systemHistory] = await pool.query(
      `SELECT
        event_type,
        description,
        performed_by,
        created_at
       FROM asset_history
       WHERE asset_code = ?
       AND event_type NOT IN ('ASSET_ISSUED')`,
      [asset.asset_code]
    );

    systemHistory.forEach((h) => {
      timeline.push({
        event_type: h.event_type,
        description: h.description,
        performed_by: h.performed_by || "System",
        event_date: h.created_at,
        display_message: h.description,
        source: "SYSTEM",
      });
    });

    timeline.sort(
      (a, b) => new Date(b.event_date) - new Date(a.event_date)
    );

    return new Response(
      JSON.stringify({
        asset,
        timeline,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("GET asset history error:", err);
    return new Response(
      JSON.stringify({ message: "Failed to load asset history" }),
      { status: 500 }
    );
  }
}