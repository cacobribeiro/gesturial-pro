import request from 'supertest';
import app from '../src/app';
import prisma from '../src/lib/prisma';

export async function registerAndLogin(username = 'user1', password = 'password123') {
  await request(app).post('/api/auth/register').send({ username, password });
  const login = await request(app).post('/api/auth/login').send({ username, password });
  return login.body.token as string;
}

export async function createCategory(userId: string) {
  return prisma.category.create({
    data: {
      name: 'Teste',
      group: 'OUTROS',
      icon: 'tag',
      isActive: true,
      userId,
    },
  });
}
