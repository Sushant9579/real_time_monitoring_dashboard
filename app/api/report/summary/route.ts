import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json(
      { success: false, error: "start and end dates are required" },
      { status: 400 }
    );
  }

  try {
    const query = `
      SELECT 
        machine,
        vibration::numeric AS vibration,
        speed::numeric AS speed,
        bearing_temperature::numeric AS bearing_temperature,
        load_current::numeric AS load_current,
        power_consumption::numeric AS power_consumption,
        oil_pressure::numeric AS oil_pressure,
        motor_temperature::numeric AS motor_temperature
      FROM machine_data
      WHERE to_timestamp(datetime, 'DD-MM-YYYY HH24:MI:SS')
        BETWEEN to_timestamp($1, 'DD-MM-YYYY HH24:MI:SS')
        AND to_timestamp($2, 'DD-MM-YYYY HH24:MI:SS')
      ORDER BY machine;
    `;

    const { rows } = await pool.query(query, [start, end]);

    if (rows.length === 0)
      return NextResponse.json({ success: true, data: [] });

    const machines: Record<string, any[]> = {};
    rows.forEach((r) => {
      if (!machines[r.machine]) machines[r.machine] = [];
      machines[r.machine].push(r);
    });

    const data = Object.entries(machines).map(([machine, list]) => {
      const n = list.length;
      const sum = (key: keyof typeof list[0]) =>
        list.reduce((a, r) => a + Number(r[key] || 0), 0);

      return {
        machine,
        avg_vibration: (sum("vibration") / n).toFixed(2),
        avg_speed: (sum("speed") / n).toFixed(2),
        avg_bearing_temperature: (sum("bearing_temperature") / n).toFixed(2),
        avg_load_current: (sum("load_current") / n).toFixed(2),
        avg_power_consumption: (sum("power_consumption") / n).toFixed(2),
        avg_oil_pressure: (sum("oil_pressure") / n).toFixed(2),
        avg_motor_temperature: (sum("motor_temperature") / n).toFixed(2),
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Database query failed" },
      { status: 500 }
    );
  }
}
