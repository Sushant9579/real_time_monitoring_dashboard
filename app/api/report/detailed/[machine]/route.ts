import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: Request,{ params }: { params: Promise<{ machine: string }> }) {
  try {
    const param = await params;
    const machine = param.machine;

    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!start || !end || !machine) {
      return NextResponse.json(
        { success: false, error: "Data are required" },
        { status: 400 }
      );
    }

    const query = `
      SELECT 
          TO_CHAR(to_timestamp(datetime, 'DD-MM-YYYY HH24:MI:SS'), 'DD-MM-YYYY') AS date,
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
          BETWEEN to_timestamp($2, 'DD-MM-YYYY HH24:MI:SS')
          AND to_timestamp($3, 'DD-MM-YYYY HH24:MI:SS')
      GROUP BY TO_CHAR(to_timestamp(datetime, 'DD-MM-YYYY HH24:MI:SS'), 'DD-MM-YYYY')
      ORDER BY TO_CHAR(to_timestamp(datetime, 'DD-MM-YYYY HH24:MI:SS'), 'DD-MM-YYYY') DESC;
    `;

    const { rows } = await pool.query(query, [machine, start, end]);

    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    console.error("Error fetching datewise data:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch datewise data" },
      { status: 500 }
    );
  }
}
