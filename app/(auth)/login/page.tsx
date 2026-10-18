import type { Metadata } from "next";
import { loginAction } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "เข้าสู่ระบบ — SaveMe Budget" };

export default function LoginPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-navy-900">ยินดีต้อนรับกลับมา</h1>
      <p className="mb-6 mt-1 text-muted">เข้าสู่ระบบเพื่อดูสรุปรายจ่ายของคุณ</p>
      <AuthForm mode="login" action={loginAction} />
    </>
  );
}
