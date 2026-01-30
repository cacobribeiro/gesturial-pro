import { transactionFormSchema } from '../lib/validation';

describe('transaction form schema', () => {
  it('rejects negative amounts', () => {
    const result = transactionFormSchema.safeParse({
      type: 'EXPENSE',
      amount: -10,
      date: '2024-09-20',
      categoryId: 'cat',
    });
    expect(result.success).toBe(false);
  });
});
