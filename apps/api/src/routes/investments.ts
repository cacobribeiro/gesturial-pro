import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { buildError } from '../lib/errors';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

const assetInput = z.object({
  symbolOrName: z.string().min(1),
  assetType: z.enum(['STOCK', 'FII', 'CRYPTO', 'FIXED_INCOME', 'OTHER']),
  quantity: z.number().positive(),
  avgPrice: z.number().positive(),
});

router.use(authMiddleware);

router.get('/assets', async (req: AuthRequest, res) => {
  const assets = await prisma.investmentAsset.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(assets);
});

router.post('/assets', async (req: AuthRequest, res) => {
  const parsed = assetInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(buildError('VALIDATION_ERROR', 'Dados inválidos', parsed.error.flatten()));
  }
  const asset = await prisma.investmentAsset.create({
    data: { ...parsed.data, userId: req.userId },
  });
  return res.status(201).json(asset);
});

router.put('/assets/:id', async (req: AuthRequest, res) => {
  const parsed = assetInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(buildError('VALIDATION_ERROR', 'Dados inválidos', parsed.error.flatten()));
  }
  const existing = await prisma.investmentAsset.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.userId !== req.userId) {
    return res.status(404).json(buildError('NOT_FOUND', 'Ativo não encontrado'));
  }
  const asset = await prisma.investmentAsset.update({
    where: { id: req.params.id },
    data: parsed.data,
  });
  return res.json(asset);
});

router.delete('/assets/:id', async (req: AuthRequest, res) => {
  const existing = await prisma.investmentAsset.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.userId !== req.userId) {
    return res.status(404).json(buildError('NOT_FOUND', 'Ativo não encontrado'));
  }
  await prisma.investmentAsset.delete({ where: { id: req.params.id } });
  return res.status(204).send();
});

export default router;
