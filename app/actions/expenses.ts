"use server";

import { revalidatePath } from "next/cache";
import { addExpense, deleteExpense } from "@/lib/expenses";
import { requireUser } from "@/lib/session";
import { expenseIdSchema, expenseSchema, fieldErrors } from "@/lib/validation";

export type ExpenseState = {
  fields?: Record<string, string>;
  values?: Record<string, string>;
  savedCount: number;
};

const text = (fd: FormData, key: string) => {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
};

export async function addExpenseAction(
  prev: ExpenseState,
  formData: FormData,
): Promise<ExpenseState> {
  const user = await requireUser(); // re-checked on every action, never trusted from the client
  const values = {
    description: text(formData, "description"),
    amount: text(formData, "amount"),
    category: text(formData, "category"),
    date: text(formData, "date"),
  };
  const parsed = expenseSchema.safeParse(values);
  if (!parsed.success) return { ...prev, fields: fieldErrors(parsed.error), values };

  await addExpense(user.id, parsed.data);
  revalidatePath("/dashboard");
  return { savedCount: prev.savedCount + 1 };
}

export async function deleteExpenseAction(formData: FormData) {
  const user = await requireUser();
  const id = expenseIdSchema.safeParse(text(formData, "id"));
  if (!id.success) return;
  await deleteExpense(user.id, id.data); // scoped by user id in SQL
  revalidatePath("/dashboard");
}
