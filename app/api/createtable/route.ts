import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  const result = {
    Machine_Data: "",
    User_Data: "",
    Alarm: "",
  };

  try {
    // Create Machine_Data table
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS Machine_Data (
          id SERIAL PRIMARY KEY,
          machine VARCHAR(30) NOT NULL,
          motor_temperature NUMERIC DEFAULT 0,
          vibration NUMERIC DEFAULT 0,
          speed NUMERIC DEFAULT 0,
          bearing_temperature NUMERIC DEFAULT 0,
          load_current NUMERIC DEFAULT 0,
          power_consumption NUMERIC DEFAULT 0,
          oil_pressure NUMERIC DEFAULT 0,
          datetime VARCHAR(30) NOT NULL,
          unit VARCHAR(20) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      result.Machine_Data = "Created successfully";
    } catch (err) {
      console.error("Machine_Data error:", err);
      result.Machine_Data = "Error creating table";
    }

    // Create User_Data table
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS User_Data (
          id SERIAL PRIMARY KEY,
          name VARCHAR(60) NOT NULL,
          email VARCHAR(200) NOT NULL,
          role VARCHAR(20) NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      result.User_Data = "Created successfully";
    } catch (err) {
      console.error("User_Data error:", err);
      result.User_Data = "Error creating table";
    }

    // Create Alarm table
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS Alarm (
          id SERIAL PRIMARY KEY,
          alarm_name VARCHAR(100) NOT NULL,
          machine VARCHAR(30) NOT NULL,
          creation_date VARCHAR(40) NOT NULL,
          acknowledge_date VARCHAR(40) DEFAULT '',
          acknowledge_by VARCHAR(100) DEFAULT 'Unacknowledged',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      result.Alarm = "Created successfully";
    } catch (err) {
      console.error("Alarm error:", err);
      result.Alarm = "Error creating table";
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Unexpected error occurred" }, { status: 500 });
  }
}
