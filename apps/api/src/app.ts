import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import authRoutes from './routes/auth';
import categoriesRoutes from './routes/categories';
import transactionsRoutes from './routes/transactions';
import summaryRoutes from './routes/summary';
import investmentsRoutes from './routes/investments';
import { buildError } from './lib/errors';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  }),
);
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/investments', investmentsRoutes);

app.use((_req, res) => {
  res.status(404).json(buildError('NOT_FOUND', 'Rota não encontrada'));
});

export default app;
