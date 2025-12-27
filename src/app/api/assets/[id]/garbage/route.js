import pool from "@/lib/db";
import { verifyAuth } from "@/lib/auth";
import { logHistory } from "@/lib/history";

export async function POST(req, { params }) {
  const auth = verifyAuth(req);
  if (!auth.ok) {
    return new Response(JSON.stringify({ message: auth.error }), { status: 401 });
  }

  const assetId = params.id;
  const { reason } = await req.json();

  try {
    const [[asset]] = await pool.query(
      "SELECT asset_code FROM assets WHERE id = ?",
      [assetId]
    );

    if (!asset) {
      return new Response(JSON.stringify({ message: "Asset not found" }), { status: 404 });
    }

    await pool.query(
      "UPDATE assets SET status = 'GARBAGE' WHERE id = ?",
      [assetId]
    );

    await pool.query(
      "INSERT INTO garbage (asset_code, reason, disposed_date) VALUES (?, ?, CURDATE())",
      [asset.asset_code, reason || "Disposed"]
    );

    await logHistory({
      eventType: "ASSET_GARBAGE",
      assetCode: asset.asset_code,
      description: `Asset ${asset.asset_code} marked as garbage`,
      performedBy: auth.user?.email || "IT Admin",
    });

    return new Response(JSON.stringify({ message: "Asset marked as garbage" }), {
      status: 200,
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Failed to mark garbage" }), { status: 500 });
  }
}
