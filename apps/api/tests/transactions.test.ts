import request from 'supertest';
import app from '../src/app';
import prisma from '../src/lib/prisma';
import { registerAndLogin } from './helpers';

describe('transactions', () => {
  it('creates and deletes transaction', async () => {
    const token = await registerAndLogin('txuser', 'password123');
    const user = await prisma.user.findUnique({ where: { username: 'txuser' } });
    const category = await prisma.category.create({
      data: { name: 'Teste', group: 'OUTROS', icon: 'tag', isActive: true, userId: user?.id },
    });

    const create = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'EXPENSE',
        amount: 120.5,
        date: new Date().toISOString(),
        categoryId: category.id,
        note: 'Compra',
      });
    expect(create.status).toBe(201);

    const list = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body.length).toBeGreaterThan(0);

    const del = await request(app)
      .delete(`/api/transactions/${create.body.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(204);
  });
});
