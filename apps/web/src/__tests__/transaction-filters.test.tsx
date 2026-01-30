import { applyTransactionFilters } from '../lib/guest/transactions';

const transactions = [
  {
    id: '1',
    type: 'EXPENSE' as const,
    amount: 100,
    date: '2024-09-01',
    categoryId: 'food',
  },
  {
    id: '2',
    type: 'INCOME' as const,
    amount: 500,
    date: '2024-09-02',
    categoryId: 'salary',
  },
];

describe('applyTransactionFilters', () => {
  it('filters by type and month', () => {
    const result = applyTransactionFilters(transactions, {
      type: 'EXPENSE',
      categoryId: 'ALL',
      sort: 'date_desc',
      month: '2024-09',
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });
});
