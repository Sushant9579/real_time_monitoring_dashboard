import { NextResponse } from "next/server";
import pool from "@/lib/db"; // adjust if your db file path differs

export async function GET(request: Request, { params }: { params: Promise<{ machine: string }> }) {
  const param = await params;
    const  machine = param.machine;
  const { searchParams } = new URL(request.url);
  const value = searchParams.get("value") || "1day"; // default 1day

  try {
    let interval = "";
    switch (value) {
      case "1day":
        interval = "1 day";
        break;
      case "1week":
        interval = "7 days";
        break;
      case "1month":
        interval = "30 days";
        break;
      case "6month":
        interval = "180 days";
        break;
      default:
        interval = "1 day"; // fallback
        break;
    }

    const query = `
      SELECT 
        TO_CHAR(TO_TIMESTAMP(datetime, 'DD-MM-YYYY HH24:MI:SS'), 'DD-MM-YYYY HH24:MI:SS') AS datetime,
        machine,
        ROUND(motor_temperature::numeric, 2) AS motor_temperature,
        ROUND(vibration::numeric, 2) AS vibration,
        ROUND(speed::numeric, 2) AS speed,
        ROUND(bearing_temperature::numeric, 2) AS bearing_temperature,
        ROUND(load_current::numeric, 2) AS load_current,
        ROUND(oil_pressure::numeric, 2) AS oil_pressure,
        ROUND(power_consumption::numeric, 2) AS power_consumption
      FROM machine_data
      WHERE machine = $1
        AND TO_TIMESTAMP(datetime, 'DD-MM-YYYY HH24:MI:SS') >= NOW() - INTERVAL '${interval}'
      ORDER BY TO_TIMESTAMP(datetime, 'DD-MM-YYYY HH24:MI:SS') DESC;
    `;

    const result = await pool.query(query, [machine]);

    return NextResponse.json({
      success: true,
      value,
      count: result.rowCount,
      data: result.rows,
    });
  } catch (error: unknown) {
    console.error("Error fetching range data:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, message: "Error fetching machine data", error: errorMessage },
      { status: 500 }
    );
  }
}
