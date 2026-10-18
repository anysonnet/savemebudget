import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getPool } from "@/lib/db";
import { addExpense, deleteExpense, monthSummary, recentExpenses } from "@/lib/expenses";
import { bangkokToday } from "@/lib/format";
import {
  authenticate,
  createSessionRecord,
  deleteSessionRecord,
  getUserBySessionToken,
  registerUser,
  type User,
} from "@/lib/users";

// Integration test against the real database. It only creates and deletes its
// own uniquely-named users (expenses and sessions cascade); nothing else is touched.
const run = Date.now().toString(36);
const emailA = `test-a-${run}@example.test`;
const emailB = `test-b-${run}@example.test`;
const today = bangkokToday();
const [y, m] = today.split("-");
const thisMonth = `${y}-${m}-01`;
const prevMonthDate = m === "01" ? `${Number(y) - 1}-12-15` : `${y}-${String(Number(m) - 1).padStart(2, "0")}-15`;

let a: User;
let b: User;

beforeAll(async () => {
  a = (await registerUser(emailA, "password-a-123"))!;
  b = (await registerUser(emailB, "password-b-123"))!;
});

afterAll(async () => {
  await getPool().query("DELETE FROM users WHERE email = ANY($1)", [[emailA, emailB]]);
  await getPool().end();
});

describe("sign up / log in / sessions", () => {
  it("rejects duplicate emails", async () => {
    expect(await registerUser(emailA, "another-pass-1")).toBeNull();
  });
  it("authenticates only with the right password", async () => {
    expect((await authenticate(emailA, "password-a-123"))?.id).toBe(a.id);
    expect(await authenticate(emailA, "password-b-123")).toBeNull();
    expect(await authenticate("nobody@example.test", "whatever-123")).toBeNull();
  });
  it("resolves a session token to its user until logout", async () => {
    const { token } = await createSessionRecord(a.id);
    expect((await getUserBySessionToken(token))?.id).toBe(a.id);
    expect(await getUserBySessionToken("forged-token")).toBeNull();
    await deleteSessionRecord(token);
    expect(await getUserBySessionToken(token)).toBeNull();
  });
  it("stores a password hash, never the password", async () => {
    const { rows } = await getPool().query("SELECT password_hash FROM users WHERE id = $1", [a.id]);
    expect(rows[0].password_hash).toMatch(/^scrypt\$/);
    expect(rows[0].password_hash).not.toContain("password-a-123");
  });
});

describe("expenses", () => {
  it("adds expenses, totals the current month only, and breaks down by category", async () => {
    await addExpense(a.id, { description: "ข้าว", amount: 12050, category: "food", date: today });
    await addExpense(a.id, { description: "แท็กซี่", amount: 30000, category: "transport", date: thisMonth });
    await addExpense(a.id, { description: "เดือนก่อน", amount: 99900, category: "food", date: prevMonthDate });

    const s = await monthSummary(a.id, today);
    expect(s.totalSatang).toBe(42050);
    expect(s.categories).toEqual([
      { category: "transport", totalSatang: 30000 },
      { category: "food", totalSatang: 12050 },
    ]);
  });

  it("lists the 10 most recent, newest first", async () => {
    for (let i = 0; i < 12; i++) {
      await addExpense(a.id, { description: `item ${i}`, amount: 100, category: "other", date: today });
    }
    const recent = await recentExpenses(a.id, 10);
    expect(recent).toHaveLength(10);
    const dates = recent.map((e) => e.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it("deletes the owner's expense and updates the total", async () => {
    const e = await addExpense(a.id, { description: "ลบฉัน", amount: 5000, category: "other", date: today });
    const before = (await monthSummary(a.id, today)).totalSatang;
    expect(await deleteExpense(a.id, e.id)).toBe(true);
    expect((await monthSummary(a.id, today)).totalSatang).toBe(before - 5000);
  });
});

describe("isolation between users", () => {
  it("never shows one user's expenses to another", async () => {
    await addExpense(b.id, { description: "ความลับของ B", amount: 77700, category: "health", date: today });

    const aSeesB = (await recentExpenses(a.id, 100)).some((e) => e.description === "ความลับของ B");
    expect(aSeesB).toBe(false);

    const bList = await recentExpenses(b.id, 100);
    expect(bList.map((e) => e.description)).toEqual(["ความลับของ B"]);
    expect((await monthSummary(b.id, today)).totalSatang).toBe(77700);
  });

  it("cannot delete another user's expense even with its id", async () => {
    const [bExpense] = await recentExpenses(b.id, 1);
    expect(await deleteExpense(a.id, bExpense.id)).toBe(false);
    expect(await recentExpenses(b.id, 1)).toHaveLength(1);
    expect(await deleteExpense(b.id, bExpense.id)).toBe(true);
  });
});
