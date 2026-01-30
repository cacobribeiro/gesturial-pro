import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { buildError } from '../lib/errors';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const transactionInput = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.number().positive(),
  date: z.string().datetime(),
  categoryId: z.string().uuid(),
  note: z.string().optional().nullable(),
});

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res) => {
  const { month, type, categoryId, sort } = req.query as {
    month?: string;
    type?: string;
    categoryId?: string;
    sort?: string;
  };

  let dateFilter = {};
  if (month) {
    const [year, monthPart] = month.split('-').map(Number);
    const start = new Date(year, monthPart - 1, 1);
    const end = new Date(year, monthPart, 0, 23, 59, 59, 999);
    dateFilter = { gte: start, lte: end };
  }

  const orderBy =
    sort === 'amount_asc'
      ? { amount: 'asc' }
      : sort === 'amount_desc'
        ? { amount: 'desc' }
        : sort === 'date_asc'
          ? { date: 'asc' }
          : { date: 'desc' };

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: req.userId,
      type: type ? (type as 'INCOME' | 'EXPENSE') : undefined,
      categoryId,
      date: month ? dateFilter : undefined,
    },
    include: { category: true },
    orderBy,
  });

  return res.json(transactions);
});

router.post('/', async (req: AuthRequest, res) => {
  const parsed = transactionInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(buildError('VALIDATION_ERROR', 'Dados inválidos', parsed.error.flatten()));
  }
  const transaction = await prisma.transaction.create({
    data: {
      ...parsed.data,
      amount: parsed.data.amount,
      date: new Date(parsed.data.date),
      userId: req.userId,
    },
  });
  return res.status(201).json(transaction);
});

router.put('/:id', async (req: AuthRequest, res) => {
  const parsed = transactionInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(buildError('VALIDATION_ERROR', 'Dados inválidos', parsed.error.flatten()));
  }
  const existing = await prisma.transaction.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.userId !== req.userId) {
    return res.status(404).json(buildError('NOT_FOUND', 'Transação não encontrada'));
  }
  const transaction = await prisma.transaction.update({
    where: { id: req.params.id },
    data: {
      ...parsed.data,
      date: new Date(parsed.data.date),
    },
  });
  return res.json(transaction);
});

router.delete('/:id', async (req: AuthRequest, res) => {
  const existing = await prisma.transaction.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.userId !== req.userId) {
    return res.status(404).json(buildError('NOT_FOUND', 'Transação não encontrada'));
  }
  await prisma.transaction.delete({ where: { id: req.params.id } });
  return res.status(204).send();
});

export default router;
