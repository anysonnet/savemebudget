"use client";

import { useActionState } from "react";
import { addExpenseAction, type ExpenseState } from "@/app/actions/expenses";
import { CATEGORIES } from "@/lib/categories";

const inputClass =
  "mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base outline-none transition focus:border-mint-500 focus:ring-4 focus:ring-mint-400/25";

export function ExpenseForm({ today }: { today: string }) {
  const [state, formAction, pending] = useActionState<ExpenseState, FormData>(addExpenseAction, {
    savedCount: 0,
  });
  const v = state.values;
  const err = state.fields ?? {};

  return (
    // Changing the key after a successful save remounts the form and clears it.
    <form key={state.savedCount} action={formAction} className="grid gap-4 sm:grid-cols-2" noValidate>
      <label className="block text-sm font-medium sm:col-span-2">
        รายละเอียด
        <input
          name="description"
          maxLength={100}
          defaultValue={v?.description}
          placeholder="เช่น ข้าวกลางวัน"
          className={inputClass}
          aria-invalid={!!err.description}
        />
        {err.description && <span className="mt-1 block text-sm text-rose-600">{err.description}</span>}
      </label>

      <label className="block text-sm font-medium">
        จำนวนเงิน (บาท)
        <input
          name="amount"
          inputMode="decimal"
          defaultValue={v?.amount}
          placeholder="0.00"
          className={inputClass}
          aria-invalid={!!err.amount}
        />
        {err.amount && <span className="mt-1 block text-sm text-rose-600">{err.amount}</span>}
      </label>

      <label className="block text-sm font-medium">
        หมวดหมู่
        <select name="category" defaultValue={v?.category ?? "food"} className={inputClass}>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        {err.category && <span className="mt-1 block text-sm text-rose-600">{err.category}</span>}
      </label>

      <label className="block text-sm font-medium">
        วันที่
        <input
          name="date"
          type="date"
          defaultValue={v?.date ?? today}
          max={today}
          className={inputClass}
          aria-invalid={!!err.date}
        />
        {err.date && <span className="mt-1 block text-sm text-rose-600">{err.date}</span>}
      </label>

      <div className="flex items-end">
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-mint-400 px-4 py-3 font-semibold text-navy-900 transition hover:bg-mint-300 disabled:opacity-60"
        >
          {pending ? "กำลังบันทึก…" : "เพิ่มรายจ่าย"}
        </button>
      </div>
    </form>
  );
}
