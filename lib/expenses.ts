import "server-only";
import { getPool } from "./db";
import { monthRange } from "./format";
import type { ExpenseInput } from "./validation";

// Every query takes the signed-in user's id and filters on it, so one user can
// never read or delete another user's rows (an expense id alone is not enough).

export type Expense = {
  id: string;
  description: string;
  amountSatang: number;
  category: string;
  date: string;
};

type Row = {
  id: string;
  description: string;
  amount_satang: string;
  category: string;
  expense_date: string;
};

const toExpense = (r: Row): Expense => ({
  id: r.id,
  description: r.description,
  amountSatang: Number(r.amount_satang),
  category: r.category,
  date: r.expense_date,
});

export async function addExpense(userId: string, input: ExpenseInput): Promise<Expense> {
  const { rows } = await getPool().query<Row>(
    `INSERT INTO expenses (user_id, description, amount_satang, category, expense_date)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, description, amount_satang, category, expense_date`,
    [userId, input.description, input.amount, input.category, input.date],
  );
  return toExpense(rows[0]);
}

export async function recentExpenses(userId: string, limit = 10): Promise<Expense[]> {
  const { rows } = await getPool().query<Row>(
    `SELECT id, description, amount_satang, category, expense_date
     FROM expenses WHERE user_id = $1
     ORDER BY expense_date DESC, created_at DESC
     LIMIT $2`,
    [userId, limit],
  );
  return rows.map(toExpense);
}

/** Returns false when nothing was deleted (unknown id, or it belongs to someone else). */
export async function deleteExpense(userId: string, id: string): Promise<boolean> {
  const res = await getPool().query("DELETE FROM expenses WHERE id = $1 AND user_id = $2", [
    id,
    userId,
  ]);
  return (res.rowCount ?? 0) > 0;
}

export type MonthSummary = {
  totalSatang: number;
  categories: { category: string; totalSatang: number }[];
};

/** Totals for the calendar month containing `today` ('YYYY-MM-DD', Asia/Bangkok). */
export async function monthSummary(userId: string, today: string): Promise<MonthSummary> {
  const { start, next } = monthRange(today);
  const { rows } = await getPool().query<{ category: string; total: string }>(
    `SELECT category, SUM(amount_satang) AS total
     FROM expenses
     WHERE user_id = $1 AND expense_date >= $2 AND expense_date < $3
     GROUP BY category
     ORDER BY total DESC`,
    [userId, start, next],
  );
  const categories = rows.map((r) => ({ category: r.category, totalSatang: Number(r.total) }));
  return {
    totalSatang: categories.reduce((sum, c) => sum + c.totalSatang, 0),
    categories,
  };
}
