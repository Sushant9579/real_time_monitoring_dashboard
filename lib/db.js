import pkg from 'pg';
const { Pool } = pkg;

// Create pool using environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://root:root@localhost:5433/rtdatabase',
});

// Function to check connection
async function checkConnection() {
  try {
    const client = await pool.connect();      // try to connect
    console.log('Postgres connection successful');
    client.release();                          // release client back to pool
  } catch (err) {
    console.error('Postgres connection failed:', err);
  }
}

// Run the connection check
checkConnection();

// Export pool for reuse in other modules
export default pool;
