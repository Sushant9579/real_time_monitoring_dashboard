import pool from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Query distinct machines that have logged data in the last minute
    const result = await pool.query(
      `SELECT DISTINCT machine
       FROM machine_data
       WHERE created_at >= NOW() - INTERVAL '5 MINUTE'`
    );

   const machineStatus: Record<'Machine 1' | 'Machine 2' | 'Machine 3', boolean> = {
  'Machine 1': false,
  'Machine 2': false,
  'Machine 3': false
};

result.rows.forEach((row: { machine: string }) => {
  if (row.machine === 'Machine 1' || row.machine === 'Machine 2' || row.machine === 'Machine 3') {
    machineStatus[row.machine as 'Machine 1' | 'Machine 2' | 'Machine 3'] = true;
  }
});


    return NextResponse.json({ success: true, machines: machineStatus });
  } catch (err) {
    console.error('Error fetching machine status:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch machine status' }, { status: 500 });
  }
}
