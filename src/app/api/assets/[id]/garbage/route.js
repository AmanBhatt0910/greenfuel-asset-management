import pool from "@/lib/db";
import { verifyAuth } from "@/lib/auth";
import { logHistory } from "@/lib/history";

export async function POST(req, { params }) {
  const auth = verifyAuth(req);
  if (!auth.ok) {
    return new Response(JSON.stringify({ message: auth.error }), { status: 401 });
  }

  const { reason } = await req.json();
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [[asset]] = await conn.query(
      `SELECT asset_code, status FROM assets WHERE id = ? FOR UPDATE`,
      [params.id]
    );

    if (!asset) {
      await conn.rollback();
      return new Response(JSON.stringify({ message: "Asset not found" }), { status: 404 });
    }

    if (asset.status !== "IN_STOCK") {
      await conn.rollback();
      return new Response(
        JSON.stringify({ message: "Only IN_STOCK assets can be marked as garbage" }),
        { status: 409 }
      );
    }

    await conn.query(
      `UPDATE assets SET status = 'GARBAGE' WHERE id = ?`,
      [params.id]
    );

    await conn.query(
      `INSERT INTO garbage (asset_code, reason, disposed_date)
       VALUES (?, ?, CURDATE())`,
      [asset.asset_code, reason || "Disposed"]
    );

    await logHistory({
      eventType: "ASSET_GARBAGE",
      assetCode: asset.asset_code,
      description: `Asset ${asset.asset_code} marked as garbage`,
      performedBy: auth.user?.email || "IT Admin",
    });

    await conn.commit();

    return new Response(
      JSON.stringify({ message: "Asset marked as garbage" }),
      { status: 200 }
    );
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return new Response(
      JSON.stringify({ message: "Failed to mark garbage" }),
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}
