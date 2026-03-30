// app/api/users/route.js
import pool from "@/lib/db";
import { checkPermission } from "@/lib/auth";

export async function GET(req) {
  const auth = await checkPermission(req, "view_issues");
    if (!auth.ok) return new Response(JSON.stringify({ message: auth.error }), { status: auth.error === "Unauthorized" ? 401 : 403 });

  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT 
        emp_code,
        employee_name,
        department,
        division,
        designation,
        location,
        phone,
        email
      FROM issues
      WHERE emp_code IS NOT NULL AND employee_name IS NOT NULL
      ORDER BY employee_name ASC
    `);

    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
