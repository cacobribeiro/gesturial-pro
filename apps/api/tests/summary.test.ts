import request from 'supertest';
import app from '../src/app';
import prisma from '../src/lib/prisma';
import { registerAndLogin } from './helpers';

describe('summary', () => {
  it('returns totals for month', async () => {
    const token = await registerAndLogin('sumuser', 'password123');
    const user = await prisma.user.findUnique({ where: { username: 'sumuser' } });
    const category = await prisma.category.create({
      data: { name: 'Teste', group: 'OUTROS', icon: 'tag', isActive: true, userId: user?.id },
    });

    await prisma.transaction.createMany({
      data: [
        {
          userId: user?.id || '',
          type: 'INCOME',
          amount: 1000,
          date: new Date(),
          categoryId: category.id,
          note: 'Salário',
        },
        {
          userId: user?.id || '',
          type: 'EXPENSE',
          amount: 300,
          date: new Date(),
          categoryId: category.id,
          note: 'Mercado',
        },
      ],
    });

    const month = new Date().toISOString().slice(0, 7);
    const summary = await request(app)
      .get(`/api/summary?month=${month}`)
      .set('Authorization', `Bearer ${token}`);
    expect(summary.status).toBe(200);
    expect(summary.body.totals.income).toBe(1000);
    expect(summary.body.totals.expense).toBe(300);
    expect(summary.body.totals.balance).toBe(700);
  });
});
