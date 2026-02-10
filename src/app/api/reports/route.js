// src/app/api/reports/route.js

import pool from "@/lib/db";
import { verifyAuth } from "@/lib/auth";

export async function GET(req) {
  const auth = verifyAuth(req);
  if (!auth.ok) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  let rows = [];
  let filename = "report.csv";

  try {
    switch (type) {
      case "assets":
        filename = "all-assets.csv";
        [rows] = await pool.query(`
          SELECT 
            a.asset_code AS 'Asset Code',
            a.make AS 'Make',
            a.model AS 'Model',
            a.serial_no AS 'Serial Number',
            a.po_no AS 'PO Number',
            a.invoice_no AS 'Invoice Number',
            DATE_FORMAT(a.invoice_date, '%Y-%m-%d') AS 'Invoice Date',
            CONCAT('₹', FORMAT(a.amount, 2)) AS 'Amount',
            a.vendor AS 'Vendor',
            a.warranty_years AS 'Warranty (Years)',
            DATE_FORMAT(a.warranty_start, '%Y-%m-%d') AS 'Warranty Start',
            DATE_FORMAT(a.warranty_end, '%Y-%m-%d') AS 'Warranty End',
            a.status AS 'Status',
            CASE 
              WHEN a.status = 'ISSUED' THEN COALESCE(i.employee_name, 'Unknown')
              ELSE '-'
            END AS 'Current User',
            CASE 
              WHEN a.status = 'ISSUED' THEN COALESCE(i.emp_code, '-')
              ELSE '-'
            END AS 'Employee Code',
            CASE 
              WHEN a.status = 'ISSUED' THEN COALESCE(i.department, '-')
              ELSE '-'
            END AS 'Department',
            CASE 
              WHEN a.status = 'ISSUED' THEN COALESCE(i.location, '-')
              ELSE '-'
            END AS 'Location',
            DATE_FORMAT(a.created_at, '%Y-%m-%d %H:%i:%s') AS 'Registered Date'
          FROM assets a
          LEFT JOIN (
            SELECT asset_code, employee_name, emp_code, department, location,
                   ROW_NUMBER() OVER (PARTITION BY asset_code ORDER BY created_at DESC) as rn
            FROM issues
          ) i ON a.asset_code = i.asset_code AND i.rn = 1
          ORDER BY a.created_at DESC
        `);
        break;

      case "issued":
        filename = "issued-assets.csv";
        [rows] = await pool.query(`
          SELECT 
            i.asset_code AS 'Asset Code',
            a.make AS 'Make',
            a.model AS 'Model',
            a.serial_no AS 'Serial Number',
            i.employee_name AS 'Employee Name',
            i.emp_code AS 'Employee Code',
            i.department AS 'Department',
            i.division AS 'Division',
            i.designation AS 'Designation',
            i.location AS 'Location',
            i.phone AS 'Phone',
            i.email AS 'Email',
            i.hod AS 'HOD',
            i.asset_type AS 'Asset Type',
            i.ip_address AS 'IP Address',
            i.hostname AS 'Hostname',
            i.os_name AS 'OS Name',
            i.os_version AS 'OS Version',
            i.office_version AS 'Office Version',
            i.antivirus AS 'Antivirus',
            i.windows_update AS 'Windows Update',
            i.local_admin_removed AS 'Local Admin Removed',
            i.printer_configured AS 'Printer Configured',
            i.sap AS 'SAP',
            i.backup_configured AS 'Backup Configured',
            i.zip_7 AS '7-Zip',
            i.chrome AS 'Chrome',
            i.onedrive AS 'OneDrive',
            i.laptop_bag AS 'Laptop Bag',
            i.rmm_agent AS 'RMM Agent',
            i.physical_condition AS 'Physical Condition',
            i.remarks AS 'Remarks',
            DATE_FORMAT(i.created_at, '%Y-%m-%d %H:%i:%s') AS 'Issue Date'
          FROM issues i
          LEFT JOIN assets a ON i.asset_code = a.asset_code
          WHERE a.status = 'ISSUED'
          ORDER BY i.created_at DESC
        `);
        break;

      case "garbage":
        filename = "garbage-assets.csv";
        [rows] = await pool.query(`
          SELECT 
            g.asset_code AS 'Asset Code',
            a.make AS 'Make',
            a.model AS 'Model',
            a.serial_no AS 'Serial Number',
            a.vendor AS 'Vendor',
            CONCAT('₹', FORMAT(a.amount, 2)) AS 'Original Amount',
            g.reason AS 'Disposal Reason',
            DATE_FORMAT(g.disposed_date, '%Y-%m-%d') AS 'Disposed Date',
            DATE_FORMAT(g.created_at, '%Y-%m-%d %H:%i:%s') AS 'Marked as Garbage'
          FROM garbage g
          LEFT JOIN assets a ON g.asset_code = a.asset_code
          ORDER BY g.created_at DESC
        `);
        break;

      case "transfers":
        filename = "transfer-history.csv";
        [rows] = await pool.query(`
          SELECT 
            t.asset_code AS 'Asset Code',
            a.make AS 'Make',
            a.model AS 'Model',
            t.from_emp_code AS 'From Employee Code',
            t.from_emp_name AS 'From Employee Name',
            t.to_emp_code AS 'To Employee Code',
            t.to_emp_name AS 'To Employee Name',
            DATE_FORMAT(t.transfer_date, '%Y-%m-%d') AS 'Transfer Date',
            t.reason AS 'Transfer Reason',
            t.status AS 'Status',
            DATE_FORMAT(t.created_at, '%Y-%m-%d %H:%i:%s') AS 'Created At'
          FROM transfers t
          LEFT JOIN assets a ON t.asset_code = a.asset_code
          ORDER BY t.created_at DESC
        `);
        break;

      case "software_inventory":
        filename = "software-inventory.csv";
        [rows] = await pool.query(`
          SELECT
            s.id AS 'Software ID',
            s.name AS 'Software Name',
            COALESCE(s.version, '-') AS 'Version',
            COALESCE(s.vendor, '-') AS 'Vendor',
            s.license_type AS 'License Type',
            COALESCE(s.license_key, '-') AS 'License Key',
            COALESCE(s.seats_total, 0) AS 'Total Seats',
            COALESCE(s.seats_used, 0) AS 'Seats Used',
            (COALESCE(s.seats_total,0) - COALESCE(s.seats_used,0)) AS 'Available Seats',
            CONCAT(
              ROUND(
                (COALESCE(s.seats_used,0) /
                NULLIF(COALESCE(s.seats_total,0),0)) * 100,
                2
              ),
              '%'
            ) AS 'Utilization',
            DATE_FORMAT(s.purchase_date, '%Y-%m-%d') AS 'Purchase Date',
            DATE_FORMAT(s.expiry_date, '%Y-%m-%d') AS 'Expiry Date',
            COALESCE(REPLACE(REPLACE(s.notes, '\n',' '), '\r',' '), '-') AS 'Notes',
            DATE_FORMAT(s.created_at, '%Y-%m-%d %H:%i:%s') AS 'Created At',
            CASE
              WHEN s.deleted_at IS NULL THEN 'ACTIVE'
              ELSE 'DELETED'
            END AS 'Record Status',
            DATE_FORMAT(s.deleted_at, '%Y-%m-%d %H:%i:%s') AS 'Deleted At'
          FROM software s
          ORDER BY s.created_at DESC
        `);
      break;

      case "software_assignments":
        filename = "software-assignments.csv";
        [rows] = await pool.query(`
          SELECT
            s.name AS 'Software Name',
            s.version AS 'Version',
            a.asset_code AS 'Asset Code',
            a.make AS 'Make',
            a.model AS 'Model',
            a.serial_no AS 'Serial Number',
            DATE_FORMAT(sa.assigned_at, '%Y-%m-%d %H:%i:%s') AS 'Assigned At',
            DATE_FORMAT(sa.removed_at, '%Y-%m-%d %H:%i:%s') AS 'Removed At',
            CASE
              WHEN sa.removed_at IS NULL THEN 'ACTIVE'
              ELSE 'REMOVED'
            END AS 'Status'
          FROM software_assignments sa
          JOIN software s ON sa.software_id = s.id
          JOIN assets a ON sa.asset_id = a.id
          ORDER BY sa.assigned_at DESC
        `);
        break;

      case "software_seats":
        filename = "software-license-utilization.csv";
        [rows] = await pool.query(`
          SELECT
            s.name AS 'Software Name',
            s.version AS 'Version',
            s.seats_total AS 'Total Licenses',
            s.seats_used AS 'Used Licenses',
            (s.seats_total - s.seats_used) AS 'Available Licenses',
            CONCAT(
              ROUND(
                (s.seats_used / NULLIF(s.seats_total,0)) * 100,
                2
              ),
              '%'
            ) AS 'Utilization'
          FROM software s
          WHERE s.deleted_at IS NULL
          ORDER BY s.seats_used DESC
        `);
        break;

      default:
        return new Response("Invalid report type", { status: 400 });
    }

    /* Convert to CSV */
    if (rows.length === 0) {
      return new Response("No data available for this report", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const headers = Object.keys(rows[0]).join(",");
    const csvRows = rows.map(r =>
      Object.values(r)
        .map(v => {
          const val = String(v ?? "-").replace(/"/g, '""');
          return `"${val}"`;
        })
        .join(",")
    );

    const csv = [headers, ...csvRows].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return new Response(
        JSON.stringify({
          message: "This license key already exists"
        }),
        { status: 409 }
      );
    }
    console.error(err);
    return new Response(
      JSON.stringify({
        message: "Failed to register software"
      }),
      { status: 500 }
    );
  }
}