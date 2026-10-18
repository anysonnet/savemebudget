// Connects to the app database; if (and only if) the database is missing, creates it.
import pg from "pg";

const url = new URL(process.env.DATABASE_URL);
const dbName = decodeURIComponent(url.pathname.slice(1));

async function tryConnect(database) {
  const c = new pg.Client({
    host: url.hostname,
    port: Number(url.port || 5432),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database,
  });
  await c.connect();
  return c;
}

try {
  const c = await tryConnect(dbName);
  const { rows } = await c.query("select current_database() db, version() v");
  console.log(`Connected to "${rows[0].db}" — ${rows[0].v.split(",")[0]}`);
  await c.end();
} catch (err) {
  if (err.code !== "3D000") throw err; // 3D000 = database does not exist
  console.log(`Database "${dbName}" does not exist; creating it.`);
  const admin = await tryConnect("postgres");
  await admin.query(`CREATE DATABASE "${dbName.replace(/"/g, '""')}"`);
  await admin.end();
  console.log("Created.");
}
