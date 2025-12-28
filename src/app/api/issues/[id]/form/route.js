// src/app/api/issues/[id]/form/route.js

export const runtime = "nodejs";

import pool from "@/lib/db";
import { verifyAuth } from "@/lib/auth";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs/promises";
import path from "path";

export async function GET(req, ctx) {
  const auth = verifyAuth(req);
  if (!auth.ok) return new Response("Unauthorized", { status: 401 });

  const { id: issueId } = await ctx.params;
  if (!issueId) return new Response("Missing issue id", { status: 400 });

  const [[issue]] = await pool.query(
    `SELECT i.*, a.make, a.model
     FROM issues i
     LEFT JOIN assets a ON a.asset_code = i.asset_code
     WHERE i.id = ?`,
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
    page.drawLine({ start: { x, y }, end: { x, y: y + h }, thickness: 0.7, color: line });

  const hLine = (x, y, w) =>
    page.drawLine({ start: { x, y }, end: { x: x + w, y }, thickness: 0.7, color: line });

  const centerText = (t, y, s, f = font) => {
    const w = f.widthOfTextAtSize(t, s);
    page.drawText(t, { x: width / 2 - w / 2, y, size: s, font: f });
  };

  /* ================= HEADER ================= */
  const logoBytes = await fs.readFile(path.join(process.cwd(), "public/greenfuel-logo.png"));
  const logo = await pdfDoc.embedPng(logoBytes);
  const logoDims = logo.scale(0.12);

  page.drawImage(logo, {
    x: width / 2 - logoDims.width / 2,
    y: height - 105,
    width: logoDims.width,
    height: logoDims.height,
  });

  page.drawText("GF/IT/F03", {
    x: width - 80,
    y: height - 18,
    size: 9,
    font,
  });

  centerText("IT Assets Issue / Undertaking Form", height - 145, 13, bold);

  let y = height - 185;

  /* ================= EMPLOYEE DETAILS ================= */
  const empH = 96;
  drawBox(40, y - empH, 515, empH);
  [40, 120, 300, 400, 555].forEach(x => vLine(x, y - empH, empH));

  const empRows = [
    ["Name", issue.employee_name, "Emp Code", issue.emp_code],
    ["Department", issue.department, "Designation", issue.designation],
    ["Location", issue.location, "Phone No", issue.phone],
    ["HOD", issue.hod || "", "Email Id", issue.email],
  ];

  const rowH = empH / 4;
  empRows.forEach((r, i) => {
    const ty = y - rowH * (i + 0.65);
    page.drawText(r[0], { x: 45, y: ty, size: 9, font: bold });
    page.drawText(r[1], { x: 125, y: ty, size: 9, font });
    page.drawText(r[2], { x: 305, y: ty, size: 9, font: bold });
    page.drawText(r[3], { x: 405, y: ty, size: 9, font });
    if (i < 3) hLine(40, y - rowH * (i + 1), 515);
  });

  y -= empH + 26;

  /* ================= ASSETS ISSUED ================= */
  page.drawText("Assets Issued:", { x: 40, y, size: 10, font: bold });
  y -= 16;

  const assetH = 60;
  drawBox(40, y - assetH, 515, assetH);
  [40, 70, 150, 250, 390, 470, 555].forEach(x => vLine(x, y - assetH, assetH));

  const headers = ["S/No", "Asset Type", "Asset Code", "Make / Model", "Serial No", "IP Address"];
  headers.forEach((h, i) =>
    page.drawText(h, { x: [45,80,160,250,390,470][i], y: y - 14, size: 8.5, font: bold })
  );

  hLine(40, y - 30, 515);

  const ay = y - 48;
  page.drawText("1", { x: 50, y: ay, size: 9, font });
  page.drawText("Laptop/Desktop", { x: 80, y: ay, size: 9, font });
  page.drawText(issue.asset_code, { x: 160, y: ay, size: 9, font });
  page.drawText(`${issue.make} ${issue.model}`, { x: 250, y: ay, size: 9, font });
  page.drawText(issue.serial_no, { x: 390, y: ay, size: 9, font });
  page.drawText(issue.ip_address || "", { x: 470, y: ay, size: 9, font });

  y -= assetH + 28;

  /* ================= TERMS ================= */
  page.drawText("Terms & Condition", { x: 40, y, size: 10, font: bold });
  y -= 16;
  page.drawText("1. Users need to take care of the laptop.", { x: 40, y, size: 9, font });
  y -= 14;
  page.drawText(
    "2. User cannot load any software on the computer without IT Department permission.",
    { x: 40, y, size: 9, font }
  );

  y -= 24;

  /* ================= POLICY DECLARATION ================= */
  page.drawText("Policy Declaration:", { x: 40, y, size: 10, font: bold });
  y -= 16;

  drawBox(40, y - 72, 515, 72);
  page.drawText(
    "Acknowledged receipt of the assets mentioned above and agree that the IT Assets on the laptop/notebook/desktop issued to me and the software installed will be used for Company purpose only. I will not load any additional software. If any software is found at the time of audit, I will take full responsibility for any legal issues and I will bear the commercial damage for that.",
    { x: 45, y: y - 18, size: 9, font, maxWidth: 505 }
  );

  y -= 98;

  /* ================= USER REMARKS ================= */
  page.drawText("User Remarks:", { x: 40, y, size: 9, font: bold });
  y -= 16;
  drawBox(40, y - 36, 515, 36);

  y -= 50;
  const d = new Date();
  const dateStr = `${String(d.getDate()).padStart(2,"0")}-${String(d.getMonth()+1).padStart(2,"0")}-${d.getFullYear()}`;
  page.drawText(`Date: ${dateStr}`, { x: 40, y, size: 9, font });

  y -= 36;

  /* ================= OS & SOFTWARE DETAILS ================= */
  centerText("Operating Systems & Software Details", y, 11, bold);
  y -= 18;

  const osH = 144;
  drawBox(40, y - osH, 515, osH);
  [40, 250, 400, 555].forEach(x => vLine(x, y - osH, osH));

  const osRows = [
    ["Operating System", "WINDOWS 11 PRO", "Printer Configured", "YES"],
    ["Microsoft Office", "OFFICE 2021", "Windows Update", "YES"],
    ["Antivirus", "SOPHOS", "Local Admin Removed", "YES"],
    ["SAP", "YES", "Backup Configured", "YES"],
    ["7 Zip", "YES", "Asset Tag", "NO"],
    ["Chrome", "YES", "OneDrive Configured", "YES"],
    ["Laptop Bag", "YES", "RMM Agent", "KASEYA (VSA)"],
    ["Cleaned", "YES", "Physical Condition", "Good"],
  ];

  const osRowH = osH / osRows.length;
  osRows.forEach((r, i) => {
    const ty = y - osRowH * (i + 0.7);
    page.drawText(r[0], { x: 45, y: ty, size: 9, font: bold });
    page.drawText(r[1], { x: 140, y: ty, size: 9, font });
    page.drawText(r[2], { x: 255, y: ty, size: 9, font: bold });
    page.drawText(r[3], { x: 420, y: ty, size: 9, font });
    if (i < osRows.length - 1) hLine(40, y - osRowH * (i + 1), 515);
  });

  y -= osH + 30;

  /* ================= SIGNATURES ================= */
  const boxW = 160, boxH = 55;
  drawBox(40, y - boxH, boxW, boxH);
  drawBox(220, y - boxH, boxW, boxH);
  drawBox(400, y - boxH, boxW, boxH);

  page.drawText("User Sign (Sign & Date)", { x: 50, y: y - boxH - 14, size: 9, font: bold });
  page.drawText("Engineer Name & Sign", { x: 230, y: y - boxH - 14, size: 9, font: bold });
  page.drawText("HOD Name & Sign", { x: 410, y: y - boxH - 14, size: 9, font: bold });

  /* ================= RESPONSE ================= */
  const pdfBytes = await pdfDoc.save();
  return new Response(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="GF_IT_Issue_${issue.asset_code}.pdf"`,
    },
  });
}
