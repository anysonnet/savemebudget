import { z } from "zod";
import { CATEGORY_IDS } from "./categories";
import { bangkokToday } from "./format";

export const emailSchema = z
  .string({ error: "กรุณากรอกอีเมล" })
  .trim()
  .toLowerCase()
  .max(254, "อีเมลยาวเกินไป")
  .pipe(z.email("รูปแบบอีเมลไม่ถูกต้อง"));

const passwordSchema = z
  .string({ error: "กรุณากรอกรหัสผ่าน" })
  .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
  .max(128, "รหัสผ่านยาวเกินไป");

export const signupSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string({ error: "กรุณายืนยันรหัสผ่าน" }),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "รหัสผ่านไม่ตรงกัน",
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string({ error: "กรุณากรอกรหัสผ่าน" }).min(1, "กรุณากรอกรหัสผ่าน").max(128),
});

/** "1,234.50" -> 123450 satang. Rejects 0, negatives, >2 decimals and absurd values. */
export function bahtToSatang(input: string): number | null {
  const cleaned = input.trim().replace(/,/g, "");
  if (!/^\d{1,9}(\.\d{1,2})?$/.test(cleaned)) return null;
  const [whole, frac = ""] = cleaned.split(".");
  const satang = Number(whole) * 100 + Number(frac.padEnd(2, "0"));
  return satang > 0 ? satang : null;
}

function isRealDate(iso: string): boolean {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export const expenseSchema = z.object({
  description: z
    .string({ error: "กรุณากรอกรายละเอียด" })
    .trim()
    .min(1, "กรุณากรอกรายละเอียด")
    .max(100, "รายละเอียดต้องไม่เกิน 100 ตัวอักษร"),
  amount: z
    .string({ error: "กรุณากรอกจำนวนเงิน" })
    .transform((v, ctx) => {
      const satang = bahtToSatang(v);
      if (satang === null) {
        ctx.addIssue({
          code: "custom",
          message: "จำนวนเงินต้องมากกว่า 0 และมีทศนิยมไม่เกิน 2 หลัก",
        });
        return z.NEVER;
      }
      return satang;
    }),
  category: z.enum(CATEGORY_IDS, { error: "กรุณาเลือกหมวดหมู่" }),
  date: z
    .string({ error: "กรุณาเลือกวันที่" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "รูปแบบวันที่ไม่ถูกต้อง")
    .refine(isRealDate, "วันที่ไม่ถูกต้อง")
    .refine((d) => d >= "2000-01-01", "วันที่ย้อนหลังเกินไป")
    .refine((d) => d <= bangkokToday(), "ไม่สามารถบันทึกรายจ่ายล่วงหน้าได้"),
});

export const expenseIdSchema = z.uuid();

export type ExpenseInput = z.output<typeof expenseSchema>;

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
