import pool from "@/lib/db";
import { verifyAuth } from "@/lib/auth";

export async function GET(req, { params }) {
  const auth = verifyAuth(req);
  if (!auth.ok) {
    return new Response(JSON.stringify({ message: auth.error }), { status: 401 });
  }

  try {
    // 1️⃣ Get asset
    const [[asset]] = await pool.query(
      `SELECT id, asset_code, make, model, serial_no, status
       FROM assets
       WHERE id = ?`,
      [params.id]
    );

    if (!asset) {
      return new Response(JSON.stringify({ message: "Asset not found" }), { status: 404 });
    }

    // 2️⃣ Issues (who used it)
    const [issues] = await pool.query(
      `SELECT
        employee_name,
        emp_code,
        department,
        location,
        created_at AS event_date,
        'ISSUED' AS event_type
       FROM issues
       WHERE asset_code = ?`,
      [asset.asset_code]
    );

    // 3️⃣ Transfers
    const [transfers] = await pool.query(
      `SELECT
        from_emp_code,
        to_emp_code,
        transfer_date AS event_date,
        'TRANSFER' AS event_type
       FROM transfers
       WHERE asset_code = ?`,
      [asset.asset_code]
    );

    // 4️⃣ System history
    const [systemHistory] = await pool.query(
      `SELECT
        event_type,
        description,
        performed_by,
        created_at AS event_date
       FROM asset_history
       WHERE asset_code = ?`,
      [asset.asset_code]
    );

    // 5️⃣ Merge & sort timeline
    const timeline = [
      ...issues.map(i => ({ ...i, source: "ISSUE" })),
      ...transfers.map(t => ({ ...t, source: "TRANSFER" })),
      ...systemHistory.map(h => ({ ...h, source: "SYSTEM" })),
    ].sort((a, b) => new Date(b.event_date) - new Date(a.event_date));

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
