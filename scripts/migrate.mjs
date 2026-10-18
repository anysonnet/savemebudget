// Applies db/schema.sql (idempotent). Used locally (`npm run db:migrate`) and
// at container start. It only creates missing objects; it never drops anything.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const here = path.dirname(fileURLToPath(import.meta.url));
const sql = await readFile(path.join(here, "..", "db", "schema.sql"), "utf8");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

// The db container may still be starting; retry briefly.
for (let attempt = 1; ; attempt++) {
  try {
    await client.connect();
    break;
  } catch (err) {
    if (attempt >= 20) throw err;
    console.log(`Waiting for database (${err.code ?? err.message})…`);
    await new Promise((r) => setTimeout(r, 2000));
  }
}

try {
  await client.query("SELECT pg_advisory_lock(727301)");
  await client.query(sql);
  console.log("Database schema is up to date.");
} finally {
  await client.end();
}
