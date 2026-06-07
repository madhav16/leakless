import mysql from 'mysql2/promise';
import { env } from './env.js';

/**
 * MySQL connection pool.
 * Reuse this pool across all repository files — never create ad-hoc connections.
 */
const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  connectionLimit: env.DB_CONNECTION_LIMIT,
  queueLimit: env.DB_QUEUE_LIMIT,
  waitForConnections: env.DB_WAIT_FOR_CONNECTIONS,

  // Return dates as JS Date objects, not strings
  dateStrings: false,

  // Enable timezone support
  timezone: '+00:00',

  // Reduce overhead for queries that don't need named columns
  namedPlaceholders: false,
});

/**
 * Test the pool on startup — surfaces misconfiguration immediately.
 */
export async function testDbConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✅  MySQL connected successfully');
    conn.release();
  } catch (err) {
    console.error('❌  MySQL connection failed:', err.message);
    process.exit(1);
  }
}

export default pool;
