import mysql from "mysql2/promise";

let pool;

export function isMySqlEnabled() {
  return process.env.DB_MODE === "mysql";
}

export function getDbPool() {
  if (!isMySqlEnabled()) {
    return null;
  }

  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "127.0.0.1",
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "bestiu_rentals",
      waitForConnections: true,
      connectionLimit: Number(process.env.DB_POOL_LIMIT || 10)
    });
  }

  return pool;
}

export async function pingDatabase() {
  const db = getDbPool();
  if (!db) {
    return { mode: "memory", connected: true };
  }

  await db.query("SELECT 1");
  return { mode: "mysql", connected: true };
}
