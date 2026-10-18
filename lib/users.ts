import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { getPool } from "./db";
import { hashPassword, verifyPassword } from "./password";

export const SESSION_DAYS = 30;

export type User = { id: string; email: string };

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

// Verified against when the email is unknown, so timing doesn't reveal which emails exist.
const dummyHash = hashPassword("not-a-real-password");

/** Returns null if the email is already registered. */
export async function registerUser(email: string, password: string): Promise<User | null> {
  const passwordHash = await hashPassword(password);
  const { rows } = await getPool().query<User>(
    `INSERT INTO users (email, password_hash) VALUES ($1, $2)
     ON CONFLICT (email) DO NOTHING
     RETURNING id, email`,
    [email, passwordHash],
  );
  return rows[0] ?? null;
}

export async function authenticate(email: string, password: string): Promise<User | null> {
  const { rows } = await getPool().query<User & { password_hash: string }>(
    "SELECT id, email, password_hash FROM users WHERE email = $1",
    [email],
  );
  const row = rows[0];
  const ok = await verifyPassword(password, row ? row.password_hash : await dummyHash);
  return row && ok ? { id: row.id, email: row.email } : null;
}

export async function createSessionRecord(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await getPool().query(
    "INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)",
    [sha256(token), userId, expiresAt],
  );
  // Opportunistic cleanup keeps the table small without a cron job.
  await getPool().query("DELETE FROM sessions WHERE expires_at < now()");
  return { token, expiresAt };
}

export async function getUserBySessionToken(token: string): Promise<User | null> {
  const { rows } = await getPool().query<User>(
    `SELECT u.id, u.email FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > now()`,
    [sha256(token)],
  );
  return rows[0] ?? null;
}

export async function deleteSessionRecord(token: string) {
  await getPool().query("DELETE FROM sessions WHERE token_hash = $1", [sha256(token)]);
}
