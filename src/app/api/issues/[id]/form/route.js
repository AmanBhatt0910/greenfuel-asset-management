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

  /* ================= SPACING CONSTANTS ================= */
  const SECTION_GAP = 20; // Gap between major sections
  const SUBSECTION_GAP = 14; // Gap between subsections
  const LABEL_GAP = 11; // Gap between label and content

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
  const centerY = (topY, rowH, fontSize) => topY - rowH / 2 - fontSize / 2;

  // Helper function to calculate text height
  const calculateTextHeight = (text, fontSize, maxWidth, lineHeight = 12) => {
    const words = text.split(' ');
    let lines = 1;
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);
      
      if (testWidth > maxWidth && currentLine) {
        lines++;
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    return lines * lineHeight;
  };

  /* ================= HEADER ================= */
  const logoBytes = await fs.readFile(path.join(process.cwd(), "public/greenfuel-logo.png"));
  const logo = await pdfDoc.embedPng(logoBytes);
  const logoDims = logo.scale(0.095);
  page.drawImage(logo, {
    x: width / 2 - logoDims.width / 2,
    y: height - 75,
    width: logoDims.width,
    height: logoDims.height,
  });
  page.drawText("GF/IT/F03", {
    x: width - 80,
    y: height - 25,
    size: 9,
    font,
  });
  centerText("IT Assets Issue / Undertaking Form", height - 120, 13, bold);
  let y = height - 150;

  /* ================= EMPLOYEE DETAILS ================= */
  const empH = 92;
  drawBox(40, y - empH, 515, empH);
  [40, 120, 300, 400, 555].forEach((x) => vLine(x, y - empH, empH));
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
  y -= empH + SECTION_GAP;

  /* ================= ASSETS ISSUED ================= */
  page.drawText("Assets Issued:", { x: 40, y, size: 10, font: bold });
  y -= LABEL_GAP;
  const assetH = 56;
  drawBox(40, y - assetH, 515, assetH);
  [40, 70, 150, 250, 390, 470, 555].forEach((x) => vLine(x, y - assetH, assetH));
  const headers = ["S/No", "Asset Type", "Asset Code", "Make / Model", "Serial No", "IP Address"];
  const hx = [45, 80, 160, 250, 390, 470];
  headers.forEach((h, i) => page.drawText(h, { x: hx[i], y: y - 13, size: 8.5, font: bold }));
  hLine(40, y - 28, 515);
  const ay = centerY(y - 28, assetH - 28, 9);
  page.drawText("1", { x: 50, y: ay, size: 9, font });
  page.drawText(issue.asset_type || "Laptop/Desktop", { x: 80, y: ay, size: 9, font });
  page.drawText(issue.asset_code, { x: 160, y: ay, size: 9, font });
  page.drawText(`${issue.make || ""} ${issue.model || ""}`, { x: 250, y: ay, size: 9, font });
  page.drawText(issue.serial_no || "", { x: 390, y: ay, size: 9, font });
  page.drawText(issue.ip_address || "", { x: 470, y: ay, size: 9, font });
  y -= assetH + SECTION_GAP;

  /* ================= TERMS ================= */
  page.drawText("Terms & Condition", { x: 40, y, size: 10, font: bold });
  y -= LABEL_GAP;
  page.drawText("1. Users need to take care of the laptop.", {
    x: 40,
    y,
    size: 9,
    font,
    maxWidth: 515,
  });
  y -= SUBSECTION_GAP;
  page.drawText("2. User cannot load any software on the computer without IT Department permission.", {
    x: 40,
    y,
    size: 9,
    font,
    maxWidth: 515,
  });
  y -= SECTION_GAP;

  /* ================= POLICY DECLARATION ================= */
  page.drawText("Policy Declaration:", { x: 40, y, size: 10, font: bold });
  y -= LABEL_GAP;
  
  const policyText = issue.policy_declaration ||
    "Acknowledge receipt of the assets mentioned above and agree that the IT Assets on the laptop/notebook/desktop issued to me and the software installed will be used for Company purpose only. I will not load any additional software. If any software is found at the time of audit, I will take full responsibility for any legal issues and I will bear the commercial damage for that.";
  
  // Calculate required height for policy text
  const policyLineHeight = 12;
  const policyMaxWidth = 505;
  const policyTextHeight = calculateTextHeight(policyText, 9, policyMaxWidth, policyLineHeight);
  const policyBoxHeight = policyTextHeight + 20; // Add padding (10px top + 10px bottom)
  
  drawBox(40, y - policyBoxHeight, 515, policyBoxHeight);
  page.drawText(policyText, { 
    x: 45, 
    y: y - 16, 
    size: 9, 
    font, 
    maxWidth: policyMaxWidth,
    lineHeight: policyLineHeight
  });
  y -= policyBoxHeight + SECTION_GAP;

  /* ================= USER REMARKS ================= */
  page.drawText("User Remarks:", { x: 40, y, size: 9, font: bold });
  y -= LABEL_GAP;
  drawBox(40, y - 30, 515, 30);
  y -= 30 + SUBSECTION_GAP;
  const d = new Date();
  const dateStr = `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${d.getFullYear()}`;
  page.drawText(`Date: ${dateStr}`, { x: 40, y, size: 9, font });
  y -= SECTION_GAP + 4;

  /* ================= OS & SOFTWARE ================= */
  centerText("Operating Systems & Software Details", y, 11, bold);
  y -= SUBSECTION_GAP;
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
  [40, 140, 250, 400, 555].forEach((x) => vLine(x, y - osH, osH));
  const osRowH = osH / osRows.length;
  osRows.forEach((r, i) => {
    const ty = centerY(y - osRowH * i, osRowH, 9);
    page.drawText(r[0], { x: 45, y: ty, size: 9, font: bold });
    page.drawText(r[1] ?? "", { x: 145, y: ty, size: 9, font });
    page.drawText(r[2], { x: 255, y: ty, size: 9, font: bold });
    page.drawText(r[3] ?? "", { x: 420, y: ty, size: 9, font });
    if (i < osRows.length - 1) hLine(40, y - osRowH * (i + 1), 515);
  });
  y -= osH + SECTION_GAP;

  /* ================= SIGNATURES ================= */
  const boxW = 160,
    boxH = 46;
  const totalSignatureWidth = boxW * 3 + 20; // 3 boxes + 2 gaps of 10px each
  const startX = (width - totalSignatureWidth) / 2;
  
  drawBox(startX, y - boxH, boxW, boxH);
  drawBox(startX + boxW + 10, y - boxH, boxW, boxH);
  drawBox(startX + (boxW + 10) * 2, y - boxH, boxW, boxH);

  // Center the text below each box
  const label1 = "User Sign (Sign & Date)";
  const label2 = "Engineer Name & Sign";
  const label3 = "HOD Name & Sign";
  
  const label1Width = bold.widthOfTextAtSize(label1, 9);
  const label2Width = bold.widthOfTextAtSize(label2, 9);
  const label3Width = bold.widthOfTextAtSize(label3, 9);
  
  page.drawText(label1, { 
    x: startX + boxW / 2 - label1Width / 2, 
    y: y - boxH - 14, 
    size: 9, 
    font: bold 
  });
  page.drawText(label2, { 
    x: startX + boxW + 10 + boxW / 2 - label2Width / 2, 
    y: y - boxH - 14, 
    size: 9, 
    font: bold 
  });
  page.drawText(label3, { 
    x: startX + (boxW + 10) * 2 + boxW / 2 - label3Width / 2, 
    y: y - boxH - 14, 
    size: 9, 
    font: bold 
  });

  /* ================= RESPONSE ================= */
  const pdfBytes = await pdfDoc.save();
  return new Response(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="GF_IT_Issue_${issue.asset_code}_${issue.emp_code || "EMP"}.pdf"`,
    },
  });
}