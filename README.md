# Gesturial Pro

Web app mobile-first estilo iOS para gestão de gastos/receitas mensais e carteira de investimentos manual.

## 📦 Estrutura do monorepo

```
/apps
  /api
    /prisma
    /src
    /tests
  /web
    /src
/packages
  /shared
```

## ✅ Requisitos atendidos

- Next.js + Tailwind + React Query + React Hook Form + Zod
- Express + Prisma + PostgreSQL (SQLite nos testes)
- Auth JWT (username + senha)
- Modo convidado com LocalStorage
- Dashboard mensal com gráficos (Recharts)
- CRUD de categorias, transações e investimentos
- Testes backend (Jest + Supertest) + frontend (RTL)
- CI com GitHub Actions

## 🚀 Rodando localmente

### Pré-requisitos

- Node.js 20+
- pnpm 9+
- PostgreSQL local

### Instalação

```bash
pnpm install
```

### Variáveis de ambiente

Crie os arquivos abaixo a partir dos exemplos:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

### Prisma (API)

```bash
cd apps/api
pnpm prisma generate
pnpm prisma migrate dev
pnpm prisma seed
```

### Iniciar tudo

```bash
pnpm dev
```

A API sobe em `http://localhost:4000` e o web em `http://localhost:3000`.

## 🧪 Testes

```bash
pnpm test
```

## 🧪 Cobertura backend

```bash
cd apps/api
pnpm test:coverage
```

## 🌐 Deploy

### Web (Vercel)

- Configure `NEXT_PUBLIC_API_URL` no painel da Vercel.
- Build command: `pnpm install && pnpm --filter @gesturial/web build`
- Output: `.next`

### API (Render)

- Use o blueprint `render.yaml`.
- Configure `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`.

## 🔄 Sincronização convidado -> conta

No modo convidado, os dados ficam no LocalStorage. Ao entrar, use **Configurações > Sincronizar**:
- categorias custom são enviadas primeiro
- transações são enviadas usando o match por nome da categoria
- ativos são enviados em seguida

## 🧰 Scripts úteis

```bash
pnpm -r lint
pnpm -r build
pnpm -r test
```
