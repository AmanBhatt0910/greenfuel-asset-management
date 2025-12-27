import pool from "@/lib/db";
import { verifyAuth } from "@/lib/auth";
import { logHistory } from "@/lib/history";

export async function POST(req, { params }) {
  const auth = verifyAuth(req);
  if (!auth.ok) {
    return new Response(JSON.stringify({ message: auth.error }), { status: 401 });
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [[issue]] = await conn.query(
      `SELECT asset_code FROM issues WHERE id = ?`,
      [params.id]
    );

    if (!issue) {
      await conn.rollback();
      return new Response(JSON.stringify({ message: "Issue not found" }), { status: 404 });
    }

    const [[asset]] = await conn.query(
      `SELECT status FROM assets WHERE asset_code = ? FOR UPDATE`,
      [issue.asset_code]
    );

    if (asset.status !== "ISSUED") {
      await conn.rollback();
      return new Response(
        JSON.stringify({ message: "Asset is not currently issued" }),
        { status: 409 }
      );
    }

    await conn.query(
      `UPDATE assets SET status = 'IN_STOCK' WHERE asset_code = ?`,
      [issue.asset_code]
    );

    await logHistory({
      eventType: "ASSET_RETURNED",
      assetCode: issue.asset_code,
      description: "Asset returned to inventory",
      performedBy: auth.user?.email || "IT Admin",
    });

    await conn.commit();

    return new Response(
      JSON.stringify({ message: "Asset returned successfully" }),
      { status: 200 }
    );
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return new Response(
      JSON.stringify({ message: "Failed to return asset" }),
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}
