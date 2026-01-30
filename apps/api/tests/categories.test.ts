import request from 'supertest';
import app from '../src/app';
import prisma from '../src/lib/prisma';
import { registerAndLogin } from './helpers';

describe('categories', () => {
  it('creates and updates category', async () => {
    const token = await registerAndLogin('catuser', 'password123');
    const user = await prisma.user.findUnique({ where: { username: 'catuser' } });

    const create = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Nova', group: 'OUTROS', icon: 'tag', isActive: true });
    expect(create.status).toBe(201);

    const update = await request(app)
      .put(`/api/categories/${create.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Atualizada', group: 'OUTROS', icon: 'tag', isActive: true });
    expect(update.status).toBe(200);

    const list = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${token}`);
    expect(list.status).toBe(200);
    const userCategories = list.body.filter((cat: { userId: string }) => cat.userId === user?.id);
    expect(userCategories.length).toBeGreaterThan(0);
  });
});
