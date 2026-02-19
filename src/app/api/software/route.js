// api/software/route.js

import pool from "@/lib/db";
import { verifyAuth } from "@/lib/auth";
import { logHistory } from "@/lib/history";

/* ============================
   GET — List software
   - Default → All software
   - ?available=true → Only remaining seats
   - ?asset_id=1 → Exclude already assigned
============================ */
export async function GET(req) {
  const auth = verifyAuth(req);
  if (!auth.ok)
    return new Response(JSON.stringify({ message: auth.error }), { status: 401 });

  try {
    const { searchParams } = new URL(req.url);

    const assetId = searchParams.get("asset_id");
    const onlyAvailable = searchParams.get("available") === "true";

    let query = `
      SELECT
        s.id,
        s.name,
        s.version,
        s.vendor,
        s.license_type,
        s.license_key,
        s.purchase_date,
        s.expiry_date,
        s.seats_total,
        s.seats_used,
        s.created_at
      FROM software s
      WHERE s.deleted_at IS NULL
    `;

    const params = [];

    if (onlyAvailable) {
      query += ` AND s.seats_used < s.seats_total `;
    }

    if (assetId) {
      query += `
        AND s.id NOT IN (
          SELECT sa.software_id
          FROM software_assignments sa
          WHERE sa.asset_id = ?
          AND sa.removed_at IS NULL
        )
      `;
      params.push(assetId);
    }

    query += ` ORDER BY s.created_at DESC`;

    const [rows] = await pool.query(query, params);

    return new Response(JSON.stringify(rows), { status: 200 });

  } catch (err) {
    console.error("GET /api/software error:", err);
    return new Response(
      JSON.stringify({ message: "Failed to fetch software" }),
      { status: 500 }
    );
  }
}


/* ============================
   POST — Register software
============================ */
export async function POST(req) {
  const auth = verifyAuth(req);
  if (!auth.ok)
    return new Response(JSON.stringify({ message: auth.error }), { status: 401 });

  try {
    const data = await req.json();

    if (!data.name) {
      return new Response(JSON.stringify({ message: "Software name required" }), { status: 400 });
    }

    const [result] = await pool.query(
      `
      INSERT INTO software
      (name, version, vendor, license_type, license_key,
       purchase_date, expiry_date, seats_total, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.name,
        data.version || null,
        data.vendor || null,
        data.license_type || "PERPETUAL",
        data.license_key || null,
        data.purchase_date || null,
        data.expiry_date || null,
        data.seats_total || 1,
        data.notes || null,
      ]
    );

    await logHistory({
      eventType: "SOFTWARE_REGISTERED",
      description: `Software registered: ${data.name}`,
      performedBy: auth.user?.email,
    });

    return new Response(
      JSON.stringify({
        message: "Software registered",
        id: result.insertId,
      }),
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/software error:", err);
    return new Response(JSON.stringify({ message: "Failed to register software" }), { status: 500 });
  }
}