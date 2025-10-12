import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

// Use a global variable to persist the pool across serverless invocations
let pool;

if (!global.pool) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  global.pool = pool;
} else {
  pool = global.pool;
}

// Optional: test connection on cold start
pool.connect()
  .then(() => console.log("✅ Connected to Neon PostgreSQL"))
  .catch(err => console.error("❌ Database connection failed:", err));

export { pool };
