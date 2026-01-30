import { z } from 'zod';

export const transactionFormSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.coerce.number().positive(),
  date: z.string(),
  categoryId: z.string(),
  note: z.string().optional(),
});
