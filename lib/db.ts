import "server-only";
import pg from "pg";

// Keep DATE columns as 'YYYY-MM-DD' strings (no JS Date / time-zone shifting).
pg.types.setTypeParser(1082, (v) => v);

const globalForPg = globalThis as unknown as { pgPool?: pg.Pool };

function createPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  return new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
  });
}

export function getPool(): pg.Pool {
  return (globalForPg.pgPool ??= createPool());
}
