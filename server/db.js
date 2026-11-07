import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from the server folder
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config(); // fallback to cwd

// Create connection pool to your MariaDB VM
export const pool = mysql.createPool({
  host: process.env.DB_HOST || '192.168.1.32',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'aljon',
  password: process.env.DB_PASSWORD || 'pogisialjon26',
  database: process.env.DB_NAME || 'app_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test database connection helper
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Successfully connected to MariaDB on Ubuntu VM!');
    connection.release();
    return true;
  } catch (err) {
    console.error('❌ Failed to connect to MariaDB:', err.message);
    return false;
  }
}
