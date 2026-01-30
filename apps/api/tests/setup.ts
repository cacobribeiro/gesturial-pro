import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const prismaSchema = path.join(process.cwd(), 'prisma', 'schema.test.prisma');
const dbPath = path.join(process.cwd(), 'prisma', 'test.db');

beforeAll(() => {
  process.env.DATABASE_URL = `file:${dbPath}`;
  process.env.JWT_SECRET = 'test-secret';
  execSync(`pnpm prisma generate --schema ${prismaSchema}`, { stdio: 'ignore' });
  execSync(`pnpm prisma db push --schema ${prismaSchema}`, { stdio: 'ignore' });
});

afterAll(() => {
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
});
