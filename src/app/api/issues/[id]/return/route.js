import pool from "@/lib/db";
import { verifyAuth } from "@/lib/auth";
import { logHistory } from "@/lib/history";

export async function POST(req, { params }) {
  const auth = verifyAuth(req);
  if (!auth.ok) {
    return new Response(JSON.stringify({ message: auth.error }), { status: 401 });
  }

  const issueId = params.id;

  try {
    const [[issue]] = await pool.query(
      "SELECT asset_code, employee_name FROM issues WHERE id = ?",
      [issueId]
    );

    if (!issue) {
      return new Response(JSON.stringify({ message: "Issue not found" }), { status: 404 });
    }

    await pool.query(
      "UPDATE assets SET status = 'IN_STOCK' WHERE asset_code = ?",
      [issue.asset_code]
    );

    await logHistory({
      eventType: "ASSET_RETURNED",
      assetCode: issue.asset_code,
      description: `Asset ${issue.asset_code} returned from ${issue.employee_name}`,
      performedBy: auth.user?.email || "IT Admin",
    });

    return new Response(JSON.stringify({ message: "Asset returned to inventory" }), {
      status: 200,
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Failed to return asset" }), { status: 500 });
  }
}
