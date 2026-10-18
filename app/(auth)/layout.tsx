import { redirect } from "next/navigation";
import { CardStack } from "@/components/card-stack";
import { Logo } from "@/components/logo";
import { getUser } from "@/lib/session";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (await getUser()) redirect("/dashboard");

  return (
    <main className="grid flex-1 lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-navy-900 p-10 text-white lg:flex">
        <Logo light />
        <div className="space-y-10">
          <CardStack />
          <p className="mx-auto max-w-sm text-center text-lg text-white/80">
            จัดการเงินง่ายขึ้น เหลือเงินเก็บมากขึ้น
          </p>
        </div>
        <p className="text-sm text-white/40">การ์ดในภาพเป็นเพียงภาพประกอบ ไม่มีการเก็บข้อมูลบัตรหรือบัญชีธนาคาร</p>
      </section>
      <section className="flex items-center justify-center px-4 py-10">
        <div className="rise w-full max-w-md rounded-3xl bg-white p-6 shadow-xl shadow-navy-900/5 sm:p-8">
          <div className="mb-6 lg:hidden">
            <Logo />
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
