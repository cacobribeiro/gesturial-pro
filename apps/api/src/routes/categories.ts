import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { buildError } from '../lib/errors';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const categoryInput = z.object({
  name: z.string().min(1),
  group: z.enum([
    'CASA',
    'ALIMENTACAO',
    'TRANSPORTE_CARRO',
    'CRIANCAS_ESCOLA',
    'LAZER_ENTRETENIMENTO',
    'ASSINATURAS',
    'PROFISSIONAL',
    'SAUDE',
    'OUTROS',
  ]),
  icon: z.string().min(1).optional().default('tag'),
  isActive: z.boolean().optional().default(true),
});

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res) => {
  const categories = await prisma.category.findMany({
    where: {
      OR: [{ userId: null }, { userId: req.userId }],
    },
    orderBy: { name: 'asc' },
  });
  return res.json(categories);
});

router.post('/', async (req: AuthRequest, res) => {
  const parsed = categoryInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(buildError('VALIDATION_ERROR', 'Dados inválidos', parsed.error.flatten()));
  }
  const category = await prisma.category.create({
    data: {
      ...parsed.data,
      userId: req.userId,
    },
  });
  return res.status(201).json(category);
});

router.put('/:id', async (req: AuthRequest, res) => {
  const parsed = categoryInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(buildError('VALIDATION_ERROR', 'Dados inválidos', parsed.error.flatten()));
  }
  const existing = await prisma.category.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.userId !== req.userId) {
    return res.status(404).json(buildError('NOT_FOUND', 'Categoria não encontrada'));
  }
  const category = await prisma.category.update({
    where: { id: req.params.id },
    data: parsed.data,
  });
  return res.json(category);
});

router.delete('/:id', async (req: AuthRequest, res) => {
  const existing = await prisma.category.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.userId !== req.userId) {
    return res.status(404).json(buildError('NOT_FOUND', 'Categoria não encontrada'));
  }
  const category = await prisma.category.update({
    where: { id: req.params.id },
    data: { isActive: false },
  });
  return res.json(category);
});

export default router;
