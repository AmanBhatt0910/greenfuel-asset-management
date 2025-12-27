import pool from "@/lib/db";
import { verifyAuth } from "@/lib/auth";
import { logHistory } from "@/lib/history";

// Fetch all issues
export async function GET(req) {
  const auth = verifyAuth(req);
  if (!auth.ok)
    return new Response(JSON.stringify({ message: auth.error }), { status: 401 });

  try {
    const [rows] = await pool.query(
      `SELECT id, employee_name, emp_code, department, division, designation, location,
              phone, hod, email, asset_type, asset_code, make_model, serial_no,
              ip_address, os_software, terms, hostname, remarks, created_at
       FROM issues
       ORDER BY created_at DESC`
    );

    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ message: "Failed to fetch issues" }),
      { status: 500 }
    );
  }
}

// Create a new issue
export async function POST(req) {
  const auth = verifyAuth(req);
  if (!auth.ok)
    return new Response(JSON.stringify({ message: auth.error }), { status: 401 });

  try {
    const data = await req.json();

    const [existing] = await pool.query(
      `SELECT id FROM issues WHERE asset_code = ?`,
      [data.asset_code]
    );

    if (existing.length > 0) {
      return new Response(
        JSON.stringify({
          message: `Asset ${data.asset_code} is already issued`,
        }),
        { status: 409 } // Conflict
      );
    }

    // ✅ Proceed with issue
    const query = `
      INSERT INTO issues
      (employee_name, emp_code, department, division, designation, location,
       phone, hod, email, asset_type, asset_code, make_model, serial_no,
       ip_address, os_software, terms, hostname, remarks)
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
      data.asset_code || null,
      data.make_model || null,
      data.serial_no || null,
      data.ip_address || null,
      data.os_software || null,
      data.terms || null,
      data.hostname || null,
      data.remarks || null,
    ];

    const [result] = await pool.query(query, values);

    // 🧾 History log
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
    console.error(err);
    return new Response(
      JSON.stringify({ message: "Failed to create issue" }),
      { status: 500 }
    );
  }
}
