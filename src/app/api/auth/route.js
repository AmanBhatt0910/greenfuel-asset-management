import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    const [rows] = await pool.query("SELECT * FROM admins WHERE email = ?", [email]);

    if (!rows.length) {
      return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });
    }

    const user = rows[0];
    const isValid = await bcrypt.compare(password, user.passwordHash); // Correct column
    if (!isValid) {
      return new Response(JSON.stringify({ message: "Invalid password" }), { status: 401 });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return new Response(JSON.stringify({ token, message: "Login successful" }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}
