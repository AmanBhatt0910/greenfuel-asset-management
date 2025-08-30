import pool from "@/lib/db";

// GET a specific transfer by ID
export async function GET(req, { params }) {
  try {
    const { id } = params;
    const [rows] = await pool.query(
      `SELECT t.id, t.asset_code, t.from_emp_code, t.to_emp_code, 
              t.transfer_date, t.status, a.make, a.model, a.serial_no
       FROM transfers t
       LEFT JOIN assets a ON t.asset_code = a.asset_code
       WHERE t.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return new Response(JSON.stringify({ error: "Transfer not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(rows[0]), { status: 200 });
  } catch (error) {
    console.error(`GET /api/transfers/${params.id} error:`, error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// Update transfer status (and issues if Approved)
export async function PATCH(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { status, to_emp_code, to_emp_name, to_department, to_division, to_location } = body;

    if (!["Approved", "Rejected", "Pending"].includes(status)) {
      return new Response(JSON.stringify({ error: "Invalid status" }), { status: 400 });
    }

    // 1️⃣ Update transfer status
    const [result] = await pool.query("UPDATE transfers SET status = ? WHERE id = ?", [status, id]);
    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ error: "Transfer not found" }), { status: 404 });
    }

    // 2️⃣ If Approved, update issues table with new employee details
    if (status === "Approved") {
      const [transfer] = await pool.query("SELECT asset_code FROM transfers WHERE id = ?", [id]);
      if (transfer.length > 0) {
        const assetCode = transfer[0].asset_code;

        await pool.query(
          `UPDATE issues 
           SET emp_code = ?, employee_name = ?, department = ?, division = ?, location = ?
           WHERE asset_code = ?`,
          [to_emp_code, to_emp_name, to_department, to_division, to_location, assetCode]
        );
      }
    }

    return new Response(JSON.stringify({ message: "Transfer updated" }), { status: 200 });
  } catch (error) {
    console.error(`PATCH /api/transfers/${params.id} error:`, error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// Delete transfer
export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    const [result] = await pool.query("DELETE FROM transfers WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return new Response(JSON.stringify({ error: "Transfer not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: "Transfer deleted" }), { status: 200 });
  } catch (error) {
    console.error(`DELETE /api/transfers/${params.id} error:`, error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
