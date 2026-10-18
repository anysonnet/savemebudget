import type { Metadata } from "next";
import { signupAction } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "สมัครใช้งาน — SaveMe Budget" };

export default function SignupPage() {
  return (
    <>
      <h1 className="text-2xl font-bold text-navy-900">เริ่มต้นใช้งานฟรี</h1>
      <p className="mb-6 mt-1 text-muted">สร้างบัญชีด้วยอีเมลและรหัสผ่าน</p>
      <AuthForm mode="signup" action={signupAction} />
    </>
  );
}
