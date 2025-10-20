import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ machine: string }> }) {
  try {
    const param = await params;
    const machine = param.machine;
    const result = await pool.query(
      `SELECT 
          TO_CHAR(DATE_TRUNC('hour', to_timestamp(datetime, 'DD-MM-YYYY HH24:MI:SS')), 'DD-MM-YYYY HH24:MI') AS date,
          ROUND(AVG(motor_temperature::numeric), 2) AS motor_temperature,
          ROUND(AVG(vibration::numeric), 2) AS vibration,
          ROUND(AVG(speed::numeric), 2) AS speed,
          ROUND(AVG(bearing_temperature::numeric), 2) AS bearing_temperature,
          ROUND(AVG(load_current::numeric), 2) AS load_current,
          ROUND(AVG(oil_pressure::numeric), 2) AS oil_pressure,
          ROUND(AVG(power_consumption::numeric), 2) AS power_consumption
      FROM machine_data
      WHERE machine = $1
        AND to_timestamp(datetime, 'DD-MM-YYYY HH24:MI:SS') >= NOW() - INTERVAL '24 HOURS'
      GROUP BY DATE_TRUNC('hour', to_timestamp(datetime, 'DD-MM-YYYY HH24:MI:SS'))
      ORDER BY DATE_TRUNC('hour', to_timestamp(datetime, 'DD-MM-YYYY HH24:MI:SS')) DESC
      LIMIT 24;`,
      [machine]
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Error fetching last 24h data:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch last 24h data" }, { status: 500 });
  }
}
