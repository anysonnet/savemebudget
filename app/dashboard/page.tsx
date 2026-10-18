import type { Metadata } from "next";
import { deleteExpenseAction } from "@/app/actions/expenses";
import { logoutAction } from "@/app/actions/auth";
import { DeleteButton } from "@/components/delete-button";
import { ExpenseForm } from "@/components/expense-form";
import { Logo } from "@/components/logo";
import { categoryInfo } from "@/lib/categories";
import { monthSummary, recentExpenses } from "@/lib/expenses";
import { bangkokToday, formatBaht, formatDate, formatMonth } from "@/lib/format";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "แดชบอร์ด — SaveMe Budget" };

const delay = (i: number) => ({ "--i": i }) as React.CSSProperties;

export default async function DashboardPage() {
  const user = await requireUser();
  const today = bangkokToday();
  const [summary, recent] = await Promise.all([
    monthSummary(user.id, today),
    recentExpenses(user.id, 10),
  ]);
  const max = Math.max(1, ...summary.categories.map((c) => c.totalSatang));

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Logo />
          <div className="flex min-w-0 items-center gap-3">
            <span className="hidden truncate text-sm text-muted sm:block">{user.email}</span>
            <form action={logoutAction}>
              <button className="rounded-full border border-slate-300 px-4 py-1.5 text-sm font-medium hover:bg-slate-50">
                ออกจากระบบ
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-5">
        <section
          className="rise relative overflow-hidden rounded-3xl bg-navy-900 p-6 text-white lg:col-span-2"
          style={delay(0)}
        >
          <div className="absolute -right-10 -top-10 size-40 rounded-full bg-mint-400/20 blur-2xl" aria-hidden="true" />
          <p className="text-sm text-white/70">ยอดใช้จ่ายเดือน{formatMonth(today)}</p>
          <p className="mt-2 text-4xl font-bold tracking-tight text-mint-400" data-testid="month-total">
            {formatBaht(summary.totalSatang)}
          </p>
          <p className="mt-1 text-sm text-white/50">ตามเวลาประเทศไทย (Asia/Bangkok)</p>
        </section>

        <section className="rise rounded-3xl bg-white p-6 shadow-sm lg:col-span-3" style={delay(1)}>
          <h2 className="font-semibold text-navy-900">สรุปตามหมวดหมู่</h2>
          {summary.categories.length === 0 ? (
            <p className="mt-4 text-muted">ยังไม่มีรายจ่ายในเดือนนี้</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {summary.categories.map((c) => {
                const info = categoryInfo(c.category);
                return (
                  <li key={c.category}>
                    <div className="flex justify-between gap-3 text-sm">
                      <span>{info.label}</span>
                      <span className="font-medium">
                        {formatBaht(c.totalSatang)}{" "}
                        <span className="text-muted">
                          ({Math.round((c.totalSatang / summary.totalSatang) * 100)}%)
                        </span>
                      </span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-slate-100">
                      <div
                        className="bar h-2 rounded-full"
                        style={{ width: `${(c.totalSatang / max) * 100}%`, background: info.color }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rise rounded-3xl bg-white p-6 shadow-sm lg:col-span-5" style={delay(2)}>
          <h2 className="mb-4 font-semibold text-navy-900">เพิ่มรายจ่าย</h2>
          <ExpenseForm today={today} />
        </section>

        <section className="rise rounded-3xl bg-white p-6 shadow-sm lg:col-span-5" style={delay(3)}>
          <h2 className="font-semibold text-navy-900">รายจ่ายล่าสุด 10 รายการ</h2>
          {recent.length === 0 ? (
            <p className="mt-4 text-muted">ยังไม่มีรายการ เริ่มบันทึกรายจ่ายแรกของคุณได้เลย</p>
          ) : (
            <ul className="mt-2 divide-y divide-slate-100">
              {recent.map((e) => {
                const info = categoryInfo(e.category);
                return (
                  <li key={e.id} className="row-in flex items-center gap-3 py-3">
                    <span
                      className="size-3 shrink-0 rounded-full"
                      style={{ background: info.color }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{e.description}</p>
                      <p className="text-sm text-muted">
                        {info.label} · {formatDate(e.date)}
                      </p>
                    </div>
                    <p className="font-semibold">{formatBaht(e.amountSatang)}</p>
                    <form action={deleteExpenseAction}>
                      <input type="hidden" name="id" value={e.id} />
                      <DeleteButton label={e.description} />
                    </form>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
