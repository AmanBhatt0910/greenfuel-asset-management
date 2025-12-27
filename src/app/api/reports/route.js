import pool from "@/lib/db";
import { verifyAuth } from "@/lib/auth";


export async function GET(req) {
  const auth = verifyAuth(req);
  if (!auth.ok) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  let rows = [];
  let filename = "report.csv";

  try {
    switch (type) {
      case "assets":
        filename = "all-assets.csv";
        [rows] = await pool.query(`
          SELECT asset_code, make, model, serial_no, vendor, status, created_at
          FROM assets
          ORDER BY created_at DESC
        `);
        break;

      case "issued":
        filename = "issued-assets.csv";
        [rows] = await pool.query(`
          SELECT asset_code, employee_name, emp_code, department, created_at
          FROM issues
          ORDER BY created_at DESC
        `);
        break;

      case "garbage":
        filename = "garbage-assets.csv";
        [rows] = await pool.query(`
          SELECT g.asset_code, g.reason, g.disposed_date, a.make, a.model
          FROM garbage g
          LEFT JOIN assets a ON g.asset_code = a.asset_code
          ORDER BY g.created_at DESC
        `);
        break;

      case "transfers":
        filename = "transfer-history.csv";
        [rows] = await pool.query(`
          SELECT asset_code, from_emp_code, to_emp_code, transfer_date, status
          FROM transfers
          ORDER BY created_at DESC
        `);
        break;

      default:
        return new Response("Invalid report type", { status: 400 });
    }

    /* Convert to CSV */
    if (rows.length === 0) {
    return new Response("No data available for this report", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
    });
    }


    const headers = Object.keys(rows[0]).join(",");
    const csvRows = rows.map(r =>
      Object.values(r)
        .map(v => `"${String(v ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );

    const csv = [headers, ...csvRows].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("REPORT ERROR:", err);
    return new Response("Failed to generate report", { status: 500 });
  }
}
