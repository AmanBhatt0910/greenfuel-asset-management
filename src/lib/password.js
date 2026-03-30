// src/lib/password.js

/**
 * Generates a random temporary password.
 *
 * Characters are chosen to avoid visually ambiguous glyphs
 * (e.g. I/l/1, O/0) that are easy to mis-read in emails.
 *
 * @param {number} length - Desired password length (default 12)
 * @returns {string} Random temporary password
 */
export function generateTempPassword(length = 12) {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
