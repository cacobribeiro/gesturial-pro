import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authSchema } from '@gesturial/shared';
import prisma from '../lib/prisma';
import { buildError } from '../lib/errors';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/register', async (req, res) => {
  const parsed = authSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(buildError('VALIDATION_ERROR', 'Dados inválidos', parsed.error.flatten()));
  }
  const { username, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return res.status(409).json(buildError('USER_EXISTS', 'Usuário já existe'));
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { username, passwordHash } });
  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: '7d',
  });
  return res.json({ token });
});

router.post('/login', async (req, res) => {
  const parsed = authSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(buildError('VALIDATION_ERROR', 'Dados inválidos', parsed.error.flatten()));
  }
  const { username, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return res.status(401).json(buildError('INVALID_CREDENTIALS', 'Credenciais inválidas'));
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json(buildError('INVALID_CREDENTIALS', 'Credenciais inválidas'));
  }
  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: '7d',
  });
  return res.json({ token });
});

router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) {
    return res.status(404).json(buildError('NOT_FOUND', 'Usuário não encontrado'));
  }
  return res.json({ id: user.id, username: user.username });
});

export default router;
