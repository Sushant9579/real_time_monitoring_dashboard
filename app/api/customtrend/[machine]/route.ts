import { NextResponse } from "next/server";
import pool from "@/lib/db"; // adjust path as needed

export async function GET(request: Request, { params }: { params: Promise<{ machine: string }> }) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const param = await params; 
  const machine = param.machine;

  if (!start || !end) {
    return NextResponse.json({ error: "Missing start or end datetime" }, { status: 400 });
  }

  try {
    const result = await pool.query(
      `
      SELECT 
        TO_CHAR(DATE_TRUNC('day', to_timestamp(datetime, 'DD-MM-YYYY HH24:MI:SS')), 'DD-MM-YYYY') AS date,
        ROUND(AVG(motor_temperature::numeric), 2) AS motor_temperature,
        ROUND(AVG(vibration::numeric), 2) AS vibration,
        ROUND(AVG(speed::numeric), 2) AS speed,
        ROUND(AVG(bearing_temperature::numeric), 2) AS bearing_temperature,
        ROUND(AVG(load_current::numeric), 2) AS load_current,
        ROUND(AVG(oil_pressure::numeric), 2) AS oil_pressure,
        ROUND(AVG(power_consumption::numeric), 2) AS power_consumption
      FROM machine_data
      WHERE machine = $1
        AND to_timestamp(datetime, 'DD-MM-YYYY HH24:MI:SS')
            BETWEEN to_timestamp($2, 'DD-MM-YYYY HH24:MI')
            AND to_timestamp($3, 'DD-MM-YYYY HH24:MI')
      GROUP BY DATE_TRUNC('day', to_timestamp(datetime, 'DD-MM-YYYY HH24:MI:SS'))
      ORDER BY DATE_TRUNC('day', to_timestamp(datetime, 'DD-MM-YYYY HH24:MI:SS')) ASC;
      `,
      [machine, start, end]
    );

    return NextResponse.json({success: true, data: result.rows});
  } catch (error) {
    console.error("Error fetching datewise data:", error);
    return NextResponse.json({ error: "Database query failed" }, { status: 500 });
  }
}
