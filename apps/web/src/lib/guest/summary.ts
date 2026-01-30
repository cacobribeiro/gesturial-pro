import { GuestCategory, GuestTransaction } from './types';

export function filterByMonth(transactions: GuestTransaction[], month: string) {
  return transactions.filter((txn) => txn.date.startsWith(month));
}

export function buildSummary(transactions: GuestTransaction[], categories: GuestCategory[]) {
  let income = 0;
  let expense = 0;
  const byCategory: Record<
    string,
    { categoryId: string; categoryName: string; total: number; group: string }
  > = {};
  const series: Record<string, { date: string; incomeTotal: number; expenseTotal: number }> = {};

  for (const txn of transactions) {
    const value = txn.amount;
    if (txn.type === 'INCOME') income += value;
    else expense += value;

    const category = categories.find((cat) => cat.id === txn.categoryId);
    if (category) {
      if (!byCategory[category.id]) {
        byCategory[category.id] = {
          categoryId: category.id,
          categoryName: category.name,
          total: 0,
          group: category.group,
        };
      }
      byCategory[category.id].total += value;
    }

    if (!series[txn.date]) {
      series[txn.date] = { date: txn.date, incomeTotal: 0, expenseTotal: 0 };
    }
    if (txn.type === 'INCOME') series[txn.date].incomeTotal += value;
    else series[txn.date].expenseTotal += value;
  }

  return {
    totals: { income, expense, balance: income - expense },
    byCategory: Object.values(byCategory).sort((a, b) => b.total - a.total),
    series: Object.values(series).sort((a, b) => a.date.localeCompare(b.date)),
  };
}
