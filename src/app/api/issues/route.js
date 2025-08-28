import pool from "@/lib/db";
import { verifyAuth } from "@/lib/auth";

// Fetch all issues
export async function GET(req) {
  const auth = verifyAuth(req);
  if (!auth.ok) return new Response(JSON.stringify({ message: auth.error }), { status: 401 });

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
    return new Response(JSON.stringify({ message: "Failed to fetch issues" }), { status: 500 });
  }
}

// Create a new issue
export async function POST(req) {
  const auth = verifyAuth(req);
  if (!auth.ok) return new Response(JSON.stringify({ message: auth.error }), { status: 401 });

  try {
    const data = await req.json();

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
      data.os_software || null, // could be a JSON string from multiple configs
      data.terms || null,
      data.hostname || null,
      data.remarks || null,
    ];

    const [result] = await pool.query(query, values);

    return new Response(
      JSON.stringify({ message: "Issue created successfully", id: result.insertId }),
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Failed to create issue" }), { status: 500 });
  }
}
