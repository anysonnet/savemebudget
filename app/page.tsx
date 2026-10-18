import Link from "next/link";
import { CardStack } from "@/components/card-stack";
import { Logo } from "@/components/logo";

const features = [
  { title: "บันทึกรายจ่ายในไม่กี่วินาที", body: "กรอกรายการ จำนวนเงิน หมวดหมู่ และวันที่ ก็เสร็จ" },
  { title: "เห็นยอดรายเดือนทันที", body: "รู้ว่าเดือนนี้ใช้ไปเท่าไรแล้ว ตามเวลาประเทศไทย" },
  { title: "แยกตามหมวดหมู่", body: "ดูว่าเงินหมดไปกับอะไรมากที่สุด เพื่อวางแผนเก็บเงิน" },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-navy-900 text-white">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo light />
        <nav className="flex items-center gap-2 text-sm font-medium">
          <Link href="/login" className="rounded-full px-4 py-2 hover:bg-white/10">
            เข้าสู่ระบบ
          </Link>
          <Link href="/signup" className="rounded-full bg-mint-400 px-4 py-2 text-navy-900 hover:bg-mint-300">
            สมัครใช้งาน
          </Link>
        </nav>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:py-16">
        <div className="rise">
          <p className="mb-3 inline-block rounded-full bg-white/10 px-3 py-1 text-sm text-mint-300">
            ตัวช่วยจัดการรายจ่ายส่วนตัว
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            จัดการเงินง่ายขึ้น
            <br />
            <span className="text-mint-400">เหลือเงินเก็บมากขึ้น</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg text-white/70">
            SaveMe Budget ช่วยให้คุณจดรายจ่ายประจำวัน ดูสรุปรายเดือน และรู้ทันทีว่าควรลดตรงไหน
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className="rounded-full bg-mint-400 px-6 py-3 font-semibold text-navy-900 hover:bg-mint-300">
              เริ่มต้นใช้งานฟรี
            </Link>
            <Link href="/login" className="rounded-full border border-white/25 px-6 py-3 font-semibold hover:bg-white/10">
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>

        <div className="rise py-6" style={{ "--i": 2 } as React.CSSProperties}>
          <CardStack />
        </div>
      </main>

      <section className="bg-canvas text-ink">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-navy-900">{f.title}</h2>
              <p className="mt-2 text-muted">{f.body}</p>
            </div>
          ))}
        </div>
        <p className="pb-8 text-center text-xs text-muted">
          การ์ดในภาพเป็นเพียงภาพประกอบ ไม่มีการเก็บข้อมูลบัตรหรือบัญชีธนาคาร
        </p>
      </section>
    </div>
  );
}
