import { NextResponse } from "next/server";
import pool from "@/lib/db";

// Update user data
export async function PUT(req: Request, { params }: { params:Promise <{ id: string }> }) {
  const param = await params;
  const userId = Number(param.id)
  try {
    const body = await req.json();
    const { name, email, role,password } = body;

    if (!name || !email || !role || !password) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    const result = await pool.query(
      "UPDATE user_data SET name = $1, email = $2, role = $3,password = $4 WHERE id = $5 RETURNING *",
      [name, email, role,password, userId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// Delete user
export async function DELETE(_: Request, { params }: { params:Promise <{ id: string }> }) {
  const param =await params;
  const userId = Number(param.id)

  try {
    const result = await pool.query("DELETE FROM user_data WHERE id = $1 RETURNING *", [userId]);

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
