import pool from "@/lib/db";
import { verifyAuth } from "@/lib/auth";

export async function GET(req, context) {
  const auth = verifyAuth(req);
  if (!auth.ok) {
    return new Response(JSON.stringify({ message: auth.error }), { status: 401 });
  }

  try {
    const params = await context.params; // ✅ IMPORTANT
    const id = params.id;

    const [rows] = await pool.query(
      `SELECT *
       FROM issues
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ message: "Issue not found" }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify(rows[0]), { status: 200 });
  } catch (err) {
    console.error("GET issue by id error:", err);
    return new Response(
      JSON.stringify({ message: "Failed to fetch issue" }),
      { status: 500 }
    );
  }
}

export async function PUT(req, context) {
  const auth = verifyAuth(req);
  if (!auth.ok) {
    return new Response(JSON.stringify({ message: auth.error }), { status: 401 });
  }

  try {
    const params = await context.params;
    const id = params.id;
    const data = await req.json();

    const query = `
      UPDATE issues SET
        employee_name = ?,
        emp_code = ?,
        department = ?,
        division = ?,
        designation = ?,
        location = ?,
        phone = ?,
        email = ?,
        ip_address = ?,
        os_software = ?,
        hostname = ?,
        remarks = ?,
        terms = ?
      WHERE id = ?
    `;

    const values = [
      data.employee_name ?? null,
      data.emp_code ?? null,
      data.department ?? null,
      data.division ?? null,
      data.designation ?? null,
      data.location ?? null,
      data.phone ?? null,
      data.email ?? null,
      data.ip_address ?? null,
      data.os_software ?? null,
      data.hostname ?? null,
      data.remarks ?? null,
      data.terms ?? null,
      id,
    ];

    await pool.query(query, values);

    return new Response(
      JSON.stringify({ message: "Issue updated successfully" }),
      { status: 200 }
    );
  } catch (err) {
    console.error("PUT issue error:", err);
    return new Response(
      JSON.stringify({ message: "Failed to update issue" }),
      { status: 500 }
    );
  }
}
