import pool from "@/lib/db";
import { verifyAuth } from "@/lib/auth";

export async function DELETE(req, context) {
  const auth = verifyAuth(req);
  if (!auth.ok)
    return new Response(JSON.stringify({ message: auth.error }), { status: 401 });

  const { id } = await context.params;

  try {
    await pool.query(
      `
      UPDATE software_assignments
      SET removed_at = NOW()
      WHERE id = ?
      `,
      [id]
    );

    return new Response(JSON.stringify({ message: "Software removed" }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Removal failed" }), { status: 500 });
  }
}