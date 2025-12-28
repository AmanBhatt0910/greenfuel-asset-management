// src/app/api/issues/[id]/form/route.js

export const runtime = "nodejs";

import pool from "@/lib/db";
import { verifyAuth } from "@/lib/auth";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs/promises";
import path from "path";

export async function GET(req, ctx) {
  /* ================= AUTH ================= */
  const auth = verifyAuth(req);
  if (!auth.ok) return new Response("Unauthorized", { status: 401 });

  /* ================= PARAM ================= */
  const { id: issueId } = await ctx.params;
  if (!issueId) return new Response("Missing issue id", { status: 400 });

  /* ================= FETCH DATA ================= */
  const [[issue]] = await pool.query(
    `
    SELECT i.*, a.make, a.model
    FROM issues i
    LEFT JOIN assets a ON a.asset_code = i.asset_code
    WHERE i.id = ?
    `,
    [issueId]
  );

  if (!issue) return new Response("Issue not found", { status: 404 });

  /* ================= PDF INIT ================= */
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const line = rgb(0.65, 0.65, 0.65);

  /* ================= HELPERS ================= */
  const drawBox = (x, y, w, h) =>
    page.drawRectangle({ x, y, width: w, height: h, borderWidth: 1, borderColor: line });

  const vLine = (x, y, h) =>
    page.drawLine({ start: { x, y }, end: { x, y: y + h }, thickness: 0.6, color: line });

  const hLine = (x, y, w) =>
    page.drawLine({ start: { x, y }, end: { x: x + w, y }, thickness: 0.6, color: line });

  const centerText = (t, y, s, f = font) => {
    const w = f.widthOfTextAtSize(t, s);
    page.drawText(t, { x: width / 2 - w / 2, y, size: s, font: f });
  };

  const centerY = (topY, rowH, fontSize) =>
    topY - rowH / 2 - fontSize / 2;

  /* ================= HEADER ================= */
  const logoBytes = await fs.readFile(path.join(process.cwd(), "public/greenfuel-logo.png"));
  const logo = await pdfDoc.embedPng(logoBytes);
  const logoDims = logo.scale(0.095);

  page.drawImage(logo, {
    x: width / 2 - logoDims.width / 2,
    y: height - 92,
    width: logoDims.width,
    height: logoDims.height,
  });

  page.drawText("GF/IT/F03", {
    x: width - 80,
    y: height - 16,
    size: 9,
    font,
  });

  centerText("IT Assets Issue / Undertaking Form", height - 138, 13, bold);

  let y = height - 170;

  /* ================= EMPLOYEE DETAILS ================= */
  const empH = 92;
  drawBox(40, y - empH, 515, empH);
  [40, 120, 300, 400, 555].forEach(x => vLine(x, y - empH, empH));

  const empRows = [
    ["Name", issue.employee_name, "Emp Code", issue.emp_code],
    ["Department", issue.department, "Designation", issue.designation],
    ["Location", issue.location, "Phone No", issue.phone],
    ["HOD", issue.hod || "", "Email Id", issue.email],
  ];

  const empRowH = empH / empRows.length;

  empRows.forEach((r, i) => {
    const ty = centerY(y - empRowH * i, empRowH, 9);
    page.drawText(r[0], { x: 45, y: ty, size: 9, font: bold });
    page.drawText(r[1] ?? "", { x: 125, y: ty, size: 9, font });
    page.drawText(r[2], { x: 305, y: ty, size: 9, font: bold });
    page.drawText(r[3] ?? "", { x: 405, y: ty, size: 9, font });
    if (i < empRows.length - 1) hLine(40, y - empRowH * (i + 1), 515);
  });

  y -= empH + 18;

  /* ================= ASSETS ISSUED ================= */
  page.drawText("Assets Issued:", { x: 40, y, size: 10, font: bold });
  y -= 14;

  const assetH = 56;
  drawBox(40, y - assetH, 515, assetH);
  [40, 70, 150, 250, 390, 470, 555].forEach(x => vLine(x, y - assetH, assetH));

  const headers = ["S/No", "Asset Type", "Asset Code", "Make / Model", "Serial No", "IP Address"];
  const hx = [45, 80, 160, 250, 390, 470];

  headers.forEach((h, i) =>
    page.drawText(h, { x: hx[i], y: y - 13, size: 8.5, font: bold })
  );

  hLine(40, y - 28, 515);

  const ay = centerY(y - 28, assetH - 28, 9);
  page.drawText("1", { x: 50, y: ay, size: 9, font });
  page.drawText(issue.asset_type || "Laptop/Desktop", { x: 80, y: ay, size: 9, font });
  page.drawText(issue.asset_code, { x: 160, y: ay, size: 9, font });
  page.drawText(`${issue.make || ""} ${issue.model || ""}`, { x: 250, y: ay, size: 9, font });
  page.drawText(issue.serial_no || "", { x: 390, y: ay, size: 9, font });
  page.drawText(issue.ip_address || "", { x: 470, y: ay, size: 9, font });

  y -= assetH + 18;

  /* ================= TERMS ================= */
  page.drawText("Terms & Condition", { x: 40, y, size: 10, font: bold });
  y -= 14;
  page.drawText(issue.terms || "1. Users need to take care of the laptop.", {
    x: 40,
    y,
    size: 9,
    font,
    maxWidth: 515,
  });

  y -= 18;

  /* ================= POLICY DECLARATION ================= */
  page.drawText("Policy Declaration:", { x: 40, y, size: 10, font: bold });
  y -= 14;

  drawBox(40, y - 62, 515, 62);
  page.drawText(
    issue.policy_declaration ||
      "Acknowledged receipt of the assets mentioned above and agree that the IT Assets issued will be used for Company purpose only.",
    { x: 45, y: y - 18, size: 9, font, maxWidth: 505 }
  );

  y -= 78;

  /* ================= USER REMARKS ================= */
  page.drawText("User Remarks:", { x: 40, y, size: 9, font: bold });
  y -= 14;
  drawBox(40, y - 30, 515, 30);

  y -= 42;
  const d = new Date();
  const dateStr = `${String(d.getDate()).padStart(2, "0")}-${String(
    d.getMonth() + 1
  ).padStart(2, "0")}-${d.getFullYear()}`;
  page.drawText(`Date: ${dateStr}`, { x: 40, y, size: 9, font });

  y -= 26;

  /* ================= OS & SOFTWARE ================= */
  centerText("Operating Systems & Software Details", y, 11, bold);
  y -= 14;

  const osRows = [
    ["Operating System", `${issue.os_name || ""} ${issue.os_version || ""}`, "Printer Configured", issue.printer_configured],
    ["Microsoft Office", issue.office_version, "Windows Update", issue.windows_update],
    ["Antivirus", issue.antivirus, "Local Admin Removed", issue.local_admin_removed],
    ["SAP", issue.sap, "Backup Configured", issue.backup_configured],
    ["7 Zip", issue.zip_7, "Asset Tag", issue.asset_tag],
    ["Chrome", issue.chrome, "OneDrive Configured", issue.onedrive],
    ["Laptop Bag", issue.laptop_bag, "RMM Agent", issue.rmm_agent],
    ["Hostname", issue.hostname, "Physical Condition", issue.physical_condition],
  ];

  const osH = osRows.length * 14 + 12;
  drawBox(40, y - osH, 515, osH);
  [40, 140, 250, 400, 555].forEach(x => vLine(x, y - osH, osH));

  const osRowH = osH / osRows.length;
  osRows.forEach((r, i) => {
    const ty = centerY(y - osRowH * i, osRowH, 9);
    page.drawText(r[0], { x: 45, y: ty, size: 9, font: bold });
    page.drawText(r[1] ?? "", { x: 145, y: ty, size: 9, font });
    page.drawText(r[2], { x: 255, y: ty, size: 9, font: bold });
    page.drawText(r[3] ?? "", { x: 420, y: ty, size: 9, font });
    if (i < osRows.length - 1) hLine(40, y - osRowH * (i + 1), 515);
  });

  y -= osH + 14;

  /* ================= SIGNATURES ================= */
  const boxW = 160, boxH = 46;
  drawBox(40, y - boxH, boxW, boxH);
  drawBox(220, y - boxH, boxW, boxH);
  drawBox(400, y - boxH, boxW, boxH);

  page.drawText("User Sign (Sign & Date)", { x: 50, y: y - boxH - 11, size: 9, font: bold });
  page.drawText("Engineer Name & Sign", { x: 230, y: y - boxH - 11, size: 9, font: bold });
  page.drawText("HOD Name & Sign", { x: 410, y: y - boxH - 11, size: 9, font: bold });

  /* ================= RESPONSE ================= */
  const pdfBytes = await pdfDoc.save();
  return new Response(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="GF_IT_Issue_${issue.asset_code}_${issue.emp_code || "EMP"}.pdf"`,
    },
  });
}
