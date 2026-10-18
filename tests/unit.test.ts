import { describe, expect, it } from "vitest";
import { bangkokToday, formatBaht, formatDate, monthRange } from "@/lib/format";
import { hashPassword, verifyPassword } from "@/lib/password";
import { bahtToSatang, expenseSchema, signupSchema } from "@/lib/validation";

describe("money", () => {
  it("parses baht strings into satang", () => {
    expect(bahtToSatang("1,234.5")).toBe(123450);
    expect(bahtToSatang("0.01")).toBe(1);
    expect(bahtToSatang("100")).toBe(10000);
  });
  it("rejects invalid amounts", () => {
    for (const bad of ["0", "-5", "1.234", "abc", "", "1e3", "9999999999"]) {
      expect(bahtToSatang(bad), bad).toBeNull();
    }
  });
  it("formats Thai baht", () => {
    expect(formatBaht(123450)).toContain("1,234.50");
    expect(formatBaht(123450)).toContain("฿");
  });
});

describe("Bangkok dates", () => {
  it("uses the Asia/Bangkok calendar day", () => {
    // 18:00 UTC on 31 Dec is already 1 Jan in Bangkok (UTC+7).
    expect(bangkokToday(new Date("2026-12-31T18:00:00Z"))).toBe("2027-01-01");
    expect(bangkokToday(new Date("2026-12-31T16:59:00Z"))).toBe("2026-12-31");
  });
  it("computes month ranges across year end", () => {
    expect(monthRange("2026-12-15")).toEqual({ start: "2026-12-01", next: "2027-01-01" });
    expect(monthRange("2026-02-10")).toEqual({ start: "2026-02-01", next: "2026-03-01" });
  });
  it("formats Thai dates without shifting the day", () => {
    expect(formatDate("2026-01-01")).toContain("1");
    expect(formatDate("2026-01-01")).toContain("2569");
  });
});

describe("validation", () => {
  const ok = { description: " ข้าว ", amount: "50", category: "food", date: "2026-01-01" };
  it("accepts and normalizes a valid expense", () => {
    const r = expenseSchema.parse(ok);
    expect(r).toMatchObject({ description: "ข้าว", amount: 5000, category: "food" });
  });
  it("rejects bad category, impossible and future dates", () => {
    expect(expenseSchema.safeParse({ ...ok, category: "crypto" }).success).toBe(false);
    expect(expenseSchema.safeParse({ ...ok, date: "2026-02-30" }).success).toBe(false);
    expect(expenseSchema.safeParse({ ...ok, date: "2999-01-01" }).success).toBe(false);
    expect(expenseSchema.safeParse({ ...ok, description: "   " }).success).toBe(false);
  });
  it("requires matching strong-enough passwords", () => {
    const base = { email: "A@Example.com", password: "longenough1", confirmPassword: "longenough1" };
    expect(signupSchema.parse(base).email).toBe("a@example.com");
    expect(signupSchema.safeParse({ ...base, password: "short", confirmPassword: "short" }).success).toBe(false);
    expect(signupSchema.safeParse({ ...base, confirmPassword: "different1" }).success).toBe(false);
  });
});

describe("passwords", () => {
  it("verifies only the right password", async () => {
    const h = await hashPassword("correct horse");
    expect(h).not.toContain("correct horse");
    expect(await verifyPassword("correct horse", h)).toBe(true);
    expect(await verifyPassword("wrong", h)).toBe(false);
  });
});
