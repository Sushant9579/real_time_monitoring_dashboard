import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }:{ params: Promise< { machine: string }> }) {
  try {
    const param =await params;
    const machine = param.machine;

    const result = await pool.query(
      `SELECT motor_temperature,vibration,speed,bearing_temperature,load_current,power_consumption,oil_pressure, datetime
       FROM machine_data
       WHERE machine = $1
       ORDER BY id DESC
       LIMIT 10`,
      [machine]
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Error fetching last 10 machine values:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
