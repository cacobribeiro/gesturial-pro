import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { buildError } from '../lib/errors';

export type AuthRequest = Request & { userId?: string };

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json(buildError('UNAUTHORIZED', 'Token ausente'));
  }
  const token = header.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as {
      sub: string;
    };
    req.userId = payload.sub;
    return next();
  } catch (error) {
    return res.status(401).json(buildError('UNAUTHORIZED', 'Token inválido'));
  }
}
