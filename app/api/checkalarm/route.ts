import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Query all machines that have unacknowledged alarms
    const result = await pool.query(`
      SELECT DISTINCT machine
      FROM Alarm
      WHERE acknowledge_by = 'Unacknowledged'
    `);

    // Initialize all machines as false
    const machineStatus: Record<'Machine 1' | 'Machine 2' | 'Machine 3', boolean> = {
      'Machine 1': false,
      'Machine 2': false,
      'Machine 3': false,
    };

    // Mark true if unacknowledged alarms exist
    result.rows.forEach((row: { machine: string }) => {
      const name = row.machine as 'Machine 1' | 'Machine 2' | 'Machine 3';
      if (machineStatus.hasOwnProperty(name)) {
        machineStatus[name] = true;
      }
    });

    return NextResponse.json({
      success: true,
      machines: machineStatus,
    });
  } catch (err) {
    console.error('Error fetching machine alarm status:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch machine alarm status' },
      { status: 500 }
    );
  }
}
