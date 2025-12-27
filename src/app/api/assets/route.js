// src/app/api/assets/route.js

import pool from "@/lib/db";
import { verifyAuth } from "@/lib/auth";
import { logHistory } from "@/lib/history";

/* ============================
   GET — Fetch assets
============================ */
export async function GET(req) {
  const auth = verifyAuth(req);
  if (!auth.ok) {
    return new Response(
      JSON.stringify({ message: auth.error }),
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const availableOnly = searchParams.get("available") === "true";

    let query = `
      SELECT
        id,
        asset_code,
        make,
        model,
        serial_no,
        po_no,
        invoice_no,
        invoice_date,
        amount,
        vendor,
        warranty_years,
        warranty_start,
        warranty_end,
        status,
        created_at
      FROM assets
    `;

    if (availableOnly) {
      query += ` WHERE status = 'IN_STOCK'`;
    }

    query += ` ORDER BY created_at DESC`;

    const [rows] = await pool.query(query);
    return new Response(JSON.stringify(rows), { status: 200 });
  } catch (err) {
    console.error("GET /api/assets error:", err);
    return new Response(
      JSON.stringify({ message: "Failed to fetch assets" }),
      { status: 500 }
    );
  }
}

/* ============================
   POST — Register asset
============================ */
export async function POST(req) {
  const auth = verifyAuth(req);
  if (!auth.ok) {
    return new Response(
      JSON.stringify({ message: auth.error }),
      { status: 401 }
    );
  }

  try {
    const data = await req.json();

    const required = ["asset_code", "serial_no"];
    for (const field of required) {
      if (!data[field] || String(data[field]).trim() === "") {
        return new Response(
          JSON.stringify({ message: `Missing field: ${field}` }),
          { status: 400 }
        );
      }
    }

    const query = `
      INSERT INTO assets
      (
        asset_code,
        make,
        model,
        serial_no,
        po_no,
        invoice_no,
        invoice_date,
        amount,
        vendor,
        warranty_years,
        warranty_start,
        warranty_end,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'IN_STOCK')
    `;

    const values = [
      data.asset_code,
      data.make || null,
      data.model || null,
      data.serial_no,
      data.po_no || null,
      data.invoice_no || null,
      data.invoice_date || null,
      data.amount ?? null,
      data.vendor || null,
      data.warranty_years ?? null,
      data.warranty_start || null,
      data.warranty_end || null,
    ];

    const [result] = await pool.query(query, values);

    await logHistory({
      eventType: "ASSET_REGISTERED",
      assetCode: data.asset_code,
      assetId: result.insertId,
      description: `Asset ${data.asset_code} registered`,
      performedBy: auth.user?.email || "System",
    });

    return new Response(
      JSON.stringify({
        message: "Asset created successfully",
        id: result.insertId,
      }),
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/assets error:", err);
    return new Response(
      JSON.stringify({ message: "Failed to create asset" }),
      { status: 500 }
    );
  }
}
