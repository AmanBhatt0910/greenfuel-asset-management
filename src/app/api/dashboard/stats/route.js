// src/app/api/dashboard/stats/route.js

import pool from "@/lib/db";
import { verifyAuth } from "@/lib/auth";

export async function GET(req) {
  const auth = verifyAuth(req);
  if (!auth.ok) {
    return new Response(
      JSON.stringify({ message: auth.error }),
      { status: 401 }
    );
  }

  try {
    const [[{ totalAssets }]] = await pool.query(
      `SELECT COUNT(*) AS totalAssets FROM assets`
    );

    const [[{ issuedAssets }]] = await pool.query(
      `SELECT COUNT(DISTINCT asset_code) AS issuedAssets FROM issues`
    );

    const [[{ garbageAssets }]] = await pool.query(
      `SELECT COUNT(*) AS garbageAssets FROM garbage`
    );

    const inStockAssets = totalAssets - issuedAssets - garbageAssets;

    return new Response(
      JSON.stringify({
        totalAssets,
        issuedAssets,
        inStockAssets,
        garbageAssets,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Dashboard stats error:", err);
    return new Response(
      JSON.stringify({ message: "Failed to load dashboard stats" }),
      { status: 500 }
    );
  }
}
