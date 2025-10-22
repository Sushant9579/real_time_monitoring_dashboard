import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

//  GET all alarms (Unacknowledged first)
export async function GET() {
  try {
    const result = await pool.query(
      `SELECT * FROM Alarm
       ORDER BY 
         CASE WHEN acknowledge_by = 'Unacknowledged' THEN 0 ELSE 1 END,
         creation_date DESC`
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error(" Error fetching alarms:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

//  PATCH to acknowledge an alarm
export async function PATCH(request: NextRequest) {
  try {
    const { id, acknowledgeBy } = await request.json();

    if (!id || !acknowledgeBy) {
      return NextResponse.json(
        { error: "Missing id or acknowledgeBy" },
        { status: 400 }
      );
    }

    // Generate current date-time in "DD-MM-YYYY HH:mm:ss" format
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const acknowledgeDate = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    // Update alarm record
    await pool.query(
      `UPDATE Alarm
       SET acknowledge_by = $1, acknowledge_date = $2
       WHERE id = $3`,
      [acknowledgeBy, acknowledgeDate, id]
    );

    return NextResponse.json({ message: " Alarm acknowledged successfully" });
  } catch (err) {
    console.error(" Error updating alarm:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
