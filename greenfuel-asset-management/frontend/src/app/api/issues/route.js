import pool from "@/lib/db";

// GET all issues
export async function GET() {
  const [rows] = await pool.query("SELECT * FROM issues");
  return new Response(JSON.stringify(rows), { status: 200 });
}

// POST new issue
export async function POST(req) {
  const data = await req.json();
  const query = `
    INSERT INTO issues (employee_name, emp_code, department, division, designation, location, phone, hod, email, asset_type, asset_code, make_model, serial_no, ip_address, os_software, terms, hostname, remarks)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
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
    data.terms,
    data.hostname,
    data.remarks,
  ];
  await pool.query(query, values);
  return new Response(JSON.stringify({ message: "Issue created" }), { status: 201 });
}
