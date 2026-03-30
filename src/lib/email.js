// src/lib/email.js

import nodemailer from "nodemailer";

/**
 * Creates a nodemailer transporter from environment variables.
 * Set SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASS in your .env file.
 */
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const FROM_ADDRESS =
  process.env.SMTP_FROM || `"Greenfuel Asset Management" <noreply@greenfuelenergy.in>`;

/**
 * Send a welcome / account-invitation email to a newly created user.
 *
 * @param {Object} options
 * @param {string} options.to           - Recipient email address
 * @param {string} options.firstName    - Recipient first name
 * @param {string} options.tempPassword - System-generated temporary password
 * @param {string} options.role         - Assigned role (admin / manager / employee)
 * @param {string} [options.loginUrl]   - Login page URL (defaults to env variable)
 */
export async function sendWelcomeEmail({ to, firstName, tempPassword, role, loginUrl }) {
  const url = loginUrl || process.env.APP_URL || "http://localhost:5000";

  const transporter = createTransporter();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #22c55e, #16a34a); padding: 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .body { padding: 32px; }
    .body p { color: #374151; line-height: 1.6; }
    .credentials { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 20px; margin: 24px 0; }
    .credentials p { margin: 8px 0; color: #166534; font-size: 15px; }
    .credentials strong { color: #14532d; }
    .btn { display: inline-block; background: #22c55e; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; margin: 16px 0; }
    .footer { padding: 20px 32px; background: #f9fafb; text-align: center; font-size: 12px; color: #9ca3af; }
    .warning { color: #b45309; background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 12px 16px; margin-top: 20px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌿 Greenfuel Asset Management</h1>
    </div>
    <div class="body">
      <p>Hi <strong>${firstName}</strong>,</p>
      <p>
        Welcome to the Greenfuel Asset Management System! An administrator has created
        an account for you with the role of <strong>${role.charAt(0).toUpperCase() + role.slice(1)}</strong>.
      </p>

      <div class="credentials">
        <p>📧 <strong>Email:</strong> ${to}</p>
        <p>🔑 <strong>Temporary Password:</strong> ${tempPassword}</p>
      </div>

      <p>Click the button below to log in for the first time:</p>
      <a class="btn" href="${url}">Login to Greenfuel</a>

      <div class="warning">
        ⚠️ <strong>Important:</strong> You will be asked to set a new password when you log in
        for the first time. Your temporary password will no longer work after you change it.
      </div>

      <p style="margin-top: 24px;">
        If you have any questions, please contact your system administrator.
      </p>
    </div>
    <div class="footer">
      This email was sent by the Greenfuel Asset Management System. Please do not reply.
    </div>
  </div>
</body>
</html>
  `.trim();

  await transporter.sendMail({
    from: FROM_ADDRESS,
    to,
    subject: "Your Greenfuel Asset Management Account",
    html,
    text: `Hi ${firstName},\n\nWelcome to Greenfuel Asset Management!\n\nYour login details:\nEmail: ${to}\nTemporary Password: ${tempPassword}\n\nPlease log in at ${url} and change your password immediately.\n\nThis is a system-generated email. Please do not reply.`,
  });
}

/**
 * Send a password-reset email containing a new temporary password.
 *
 * @param {Object} options
 * @param {string} options.to           - Recipient email address
 * @param {string} options.firstName    - Recipient first name
 * @param {string} options.tempPassword - New system-generated temporary password
 * @param {string} [options.loginUrl]   - Login page URL
 */
export async function sendPasswordResetEmail({ to, firstName, tempPassword, loginUrl }) {
  const url = loginUrl || process.env.APP_URL || "http://localhost:5000";

  const transporter = createTransporter();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); padding: 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .body { padding: 32px; }
    .body p { color: #374151; line-height: 1.6; }
    .credentials { background: #eff6ff; border: 1px solid #93c5fd; border-radius: 8px; padding: 20px; margin: 24px 0; }
    .credentials p { margin: 8px 0; color: #1e40af; font-size: 15px; }
    .credentials strong { color: #1e3a8a; }
    .btn { display: inline-block; background: #3b82f6; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; margin: 16px 0; }
    .footer { padding: 20px 32px; background: #f9fafb; text-align: center; font-size: 12px; color: #9ca3af; }
    .warning { color: #b45309; background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 12px 16px; margin-top: 20px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔒 Password Reset</h1>
    </div>
    <div class="body">
      <p>Hi <strong>${firstName}</strong>,</p>
      <p>
        An administrator has reset your password for the Greenfuel Asset Management System.
        Your new temporary credentials are below.
      </p>

      <div class="credentials">
        <p>📧 <strong>Email:</strong> ${to}</p>
        <p>🔑 <strong>Temporary Password:</strong> ${tempPassword}</p>
      </div>

      <p>Click the button below to log in and set a new permanent password:</p>
      <a class="btn" href="${url}">Login to Greenfuel</a>

      <div class="warning">
        ⚠️ <strong>Important:</strong> You will be required to change your password
        immediately after logging in.
      </div>

      <p style="margin-top: 24px;">
        If you did not request this reset, please contact your system administrator immediately.
      </p>
    </div>
    <div class="footer">
      This email was sent by the Greenfuel Asset Management System. Please do not reply.
    </div>
  </div>
</body>
</html>
  `.trim();

  await transporter.sendMail({
    from: FROM_ADDRESS,
    to,
    subject: "Greenfuel Asset Management — Password Reset",
    html,
    text: `Hi ${firstName},\n\nYour password has been reset.\n\nEmail: ${to}\nNew Temporary Password: ${tempPassword}\n\nPlease log in at ${url} and change your password immediately.\n\nThis is a system-generated email. Please do not reply.`,
  });
}
