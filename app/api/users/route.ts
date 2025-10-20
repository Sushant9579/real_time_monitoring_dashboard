import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET — Fetch all users
export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM user_data ORDER BY id ASC");
    return NextResponse.json({ success: true, users: result.rows });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// POST — Add new user
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO user_data (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, email, password, role]
    );

    return NextResponse.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error("Error adding user:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
