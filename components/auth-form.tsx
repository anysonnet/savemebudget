"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthState } from "@/app/actions/auth";

type Props = {
  mode: "login" | "signup";
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
};

const inputClass =
  "mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base outline-none transition focus:border-mint-500 focus:ring-4 focus:ring-mint-400/25";

export function AuthForm({ mode, action }: Props) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, {});
  const signup = mode === "signup";

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.error && (
        <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </p>
      )}

      <label className="block text-sm font-medium">
        อีเมล
        <input
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.email}
          required
          className={inputClass}
          aria-invalid={!!state.fields?.email}
        />
        {state.fields?.email && <span className="mt-1 block text-sm text-rose-600">{state.fields.email}</span>}
      </label>

      <label className="block text-sm font-medium">
        รหัสผ่าน
        <input
          name="password"
          type="password"
          autoComplete={signup ? "new-password" : "current-password"}
          required
          className={inputClass}
          aria-invalid={!!state.fields?.password}
        />
        {signup && !state.fields?.password && (
          <span className="mt-1 block text-xs font-normal text-muted">อย่างน้อย 8 ตัวอักษร</span>
        )}
        {state.fields?.password && <span className="mt-1 block text-sm text-rose-600">{state.fields.password}</span>}
      </label>

      {signup && (
        <label className="block text-sm font-medium">
          ยืนยันรหัสผ่าน
          <input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            className={inputClass}
            aria-invalid={!!state.fields?.confirmPassword}
          />
          {state.fields?.confirmPassword && (
            <span className="mt-1 block text-sm text-rose-600">{state.fields.confirmPassword}</span>
          )}
        </label>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-navy-900 px-4 py-3 font-semibold text-white transition hover:bg-navy-800 disabled:opacity-60"
      >
        {pending ? "กำลังดำเนินการ…" : signup ? "สมัครใช้งาน" : "เข้าสู่ระบบ"}
      </button>

      <p className="text-center text-sm text-muted">
        {signup ? "มีบัญชีอยู่แล้ว? " : "ยังไม่มีบัญชี? "}
        <Link href={signup ? "/login" : "/signup"} className="font-semibold text-mint-600 hover:underline">
          {signup ? "เข้าสู่ระบบ" : "สมัครใช้งาน"}
        </Link>
      </p>
    </form>
  );
}
