import { GuestTransaction } from './types';

export type TransactionFilters = {
  type: 'ALL' | 'INCOME' | 'EXPENSE';
  categoryId: string;
  sort: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
  month: string;
};

export function applyTransactionFilters(transactions: GuestTransaction[], filters: TransactionFilters) {
  const filtered = transactions.filter((txn) => {
    if (filters.type !== 'ALL' && txn.type !== filters.type) return false;
    if (filters.categoryId !== 'ALL' && txn.categoryId !== filters.categoryId) return false;
    return txn.date.startsWith(filters.month);
  });

  return [...filtered].sort((a, b) => {
    if (filters.sort === 'amount_desc') return b.amount - a.amount;
    if (filters.sort === 'amount_asc') return a.amount - b.amount;
    if (filters.sort === 'date_asc') return a.date.localeCompare(b.date);
    return b.date.localeCompare(a.date);
  });
}
