import { z } from 'zod';

export const transactionTypeSchema = z.enum(['INCOME', 'EXPENSE']);
export const categoryGroupSchema = z.enum([
  'CASA',
  'ALIMENTACAO',
  'TRANSPORTE_CARRO',
  'CRIANCAS_ESCOLA',
  'LAZER_ENTRETENIMENTO',
  'ASSINATURAS',
  'PROFISSIONAL',
  'SAUDE',
  'OUTROS',
]);
export const assetTypeSchema = z.enum([
  'STOCK',
  'FII',
  'CRYPTO',
  'FIXED_INCOME',
  'OTHER',
]);

export const authSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

export const categorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  group: categoryGroupSchema,
  icon: z.string().min(1).default('tag'),
  isActive: z.boolean().default(true),
});

export const transactionSchema = z.object({
  id: z.string().uuid().optional(),
  type: transactionTypeSchema,
  amount: z.number().positive(),
  date: z.string().datetime(),
  categoryId: z.string().uuid(),
  note: z.string().optional().nullable(),
});

export const investmentAssetSchema = z.object({
  id: z.string().uuid().optional(),
  symbolOrName: z.string().min(1),
  assetType: assetTypeSchema,
  quantity: z.number().positive(),
  avgPrice: z.number().positive(),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type InvestmentAssetInput = z.infer<typeof investmentAssetSchema>;
