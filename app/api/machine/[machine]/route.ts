import pool from "@/lib/db"; // your PostgreSQL pool
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params:Promise< { machine: string }> }) {
  try {
    const param =await params;
    const machine = param.machine;

    const result = await pool.query(
      `SELECT motor_temperature,vibration,speed,bearing_temperature,load_current,power_consumption,oil_pressure, datetime
       FROM machine_data
       WHERE machine = $1
       ORDER BY datetime DESC
       LIMIT 1`,
      [machine]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: "No data found for this machine" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error fetching machine value:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
