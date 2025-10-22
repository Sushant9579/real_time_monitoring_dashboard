import { NextResponse } from "next/server";
import pool from "@/lib/db"; // adjust your db import

export async function GET( req: Request, { params }: { params: Promise<{ machine: string }> }) {
    const param = await params;
    const  machine  = param.machine;
  const { searchParams } = new URL(req.url);

  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!machine || !start || !end) {
    return NextResponse.json(
      { success: false, message: "Missing machine, start, or end parameter" },
      { status: 400 }
    );
  }

  try {
    const result = await pool.query(
      `
      SELECT 
        TO_CHAR(to_timestamp(datetime, 'DD-MM-YYYY HH24:MI:SS'), 'DD-MM-YYYY HH24:MI:SS') AS datetime,
        ROUND(motor_temperature::numeric, 2) AS motor_temperature,
        ROUND(vibration::numeric, 2) AS vibration,
        ROUND(speed::numeric, 2) AS speed,
        ROUND(bearing_temperature::numeric, 2) AS bearing_temperature,
        ROUND(load_current::numeric, 2) AS load_current,
        ROUND(oil_pressure::numeric, 2) AS oil_pressure,
        ROUND(power_consumption::numeric, 2) AS power_consumption
      FROM machine_data
      WHERE machine = $1
        AND to_timestamp(datetime, 'DD-MM-YYYY HH24:MI:SS')
            BETWEEN to_timestamp($2, 'DD-MM-YYYY HH24:MI:SS')
            AND to_timestamp($3, 'DD-MM-YYYY HH24:MI:SS')
      ORDER BY to_timestamp(datetime, 'DD-MM-YYYY HH24:MI:SS') DESC;
      `,
      [machine, start, end]
    );

    return NextResponse.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error: unknown) {
    console.error("Error fetching datewise data:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, message: "Database error", error: errorMessage },
      { status: 500 }
    );
  }
}
