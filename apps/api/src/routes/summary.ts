import { Router } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res) => {
  const { month } = req.query as { month?: string };
  const now = new Date();
  const [year, monthPart] = month ? month.split('-').map(Number) : [now.getFullYear(), now.getMonth() + 1];
  const start = new Date(year, monthPart - 1, 1);
  const end = new Date(year, monthPart, 0, 23, 59, 59, 999);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: req.userId,
      date: { gte: start, lte: end },
    },
    include: { category: true },
  });

  let income = 0;
  let expense = 0;
  const byCategoryMap = new Map<string, { categoryId: string; categoryName: string; total: number; group: string }>();
  const seriesMap = new Map<string, { date: string; incomeTotal: number; expenseTotal: number }>();

  for (const txn of transactions) {
    const value = Number(txn.amount);
    if (txn.type === 'INCOME') {
      income += value;
    } else {
      expense += value;
    }

    const key = txn.categoryId;
    const existing = byCategoryMap.get(key) || {
      categoryId: txn.categoryId,
      categoryName: txn.category.name,
      total: 0,
      group: txn.category.group,
    };
    existing.total += value;
    byCategoryMap.set(key, existing);

    const dayKey = txn.date.toISOString().slice(0, 10);
    const day = seriesMap.get(dayKey) || { date: dayKey, incomeTotal: 0, expenseTotal: 0 };
    if (txn.type === 'INCOME') {
      day.incomeTotal += value;
    } else {
      day.expenseTotal += value;
    }
    seriesMap.set(dayKey, day);
  }

  const byCategory = Array.from(byCategoryMap.values()).sort((a, b) => b.total - a.total);
  const series = Array.from(seriesMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  return res.json({
    month: `${year}-${String(monthPart).padStart(2, '0')}`,
    totals: {
      income,
      expense,
      balance: income - expense,
    },
    byCategory,
    series,
  });
});

export default router;
