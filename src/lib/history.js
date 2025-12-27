import pool from "@/lib/db";

export async function logHistory({
  eventType,
  assetCode,
  assetId = null,
  description,
  performedBy = "System",
}) {
  const query = `
    INSERT INTO asset_history
    (event_type, asset_code, asset_id, description, performed_by)
    VALUES (?, ?, ?, ?, ?)
  `;

  const values = [
    eventType,
    assetCode || null,
    assetId,
    description,
    performedBy,
  ];

  await pool.query(query, values);
}
