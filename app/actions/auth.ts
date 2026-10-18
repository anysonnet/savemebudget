"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { clearFailures, isLimited, recordFailure } from "@/lib/rate-limit";
import { endSession, startSession } from "@/lib/session";
import { authenticate, registerUser } from "@/lib/users";
import { fieldErrors, loginSchema, signupSchema } from "@/lib/validation";

export type AuthState = { error?: string; fields?: Record<string, string>; email?: string };

const text = (fd: FormData, key: string) => {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
};

export async function signupAction(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = text(formData, "email");
  const parsed = signupSchema.safeParse({
    email,
    password: text(formData, "password"),
    confirmPassword: text(formData, "confirmPassword"),
  });
  if (!parsed.success) return { fields: fieldErrors(parsed.error), email };

  const user = await registerUser(parsed.data.email, parsed.data.password);
  if (!user) return { fields: { email: "อีเมลนี้ถูกใช้งานแล้ว" }, email };

  await startSession(user.id);
  redirect("/dashboard");
}

export async function loginAction(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = text(formData, "email");
  const parsed = loginSchema.safeParse({ email, password: text(formData, "password") });
  if (!parsed.success) return { fields: fieldErrors(parsed.error), email };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  const keys = [`email:${parsed.data.email}`, `ip:${ip}`];
  if (keys.some(isLimited)) {
    return { error: "พยายามเข้าสู่ระบบหลายครั้งเกินไป กรุณาลองใหม่ในอีก 15 นาที", email };
  }

  const user = await authenticate(parsed.data.email, parsed.data.password);
  if (!user) {
    keys.forEach(recordFailure);
    return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง", email };
  }

  clearFailures(keys[0]);
  await startSession(user.id);
  redirect("/dashboard");
}

export async function logoutAction() {
  await endSession();
  redirect("/login");
}
