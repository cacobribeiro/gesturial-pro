import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: 'Aluguel', group: 'CASA', icon: 'home' },
  { name: 'Condomínio', group: 'CASA', icon: 'building' },
  { name: 'Luz', group: 'CASA', icon: 'bolt' },
  { name: 'Água', group: 'CASA', icon: 'droplet' },
  { name: 'Internet', group: 'CASA', icon: 'wifi' },
  { name: 'Mercado', group: 'ALIMENTACAO', icon: 'cart' },
  { name: 'Restaurantes', group: 'ALIMENTACAO', icon: 'fork' },
  { name: 'Combustível', group: 'TRANSPORTE_CARRO', icon: 'fuel' },
  { name: 'Manutenção', group: 'TRANSPORTE_CARRO', icon: 'wrench' },
  { name: 'Escola', group: 'CRIANCAS_ESCOLA', icon: 'book' },
  { name: 'Cursos', group: 'PROFISSIONAL', icon: 'briefcase' },
  { name: 'Streaming', group: 'ASSINATURAS', icon: 'play' },
  { name: 'Academia', group: 'SAUDE', icon: 'heart' },
  { name: 'Lazer', group: 'LAZER_ENTRETENIMENTO', icon: 'smile' },
  { name: 'Outros', group: 'OUTROS', icon: 'dots' },
] as const;

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { name_userId: { name: category.name, userId: null } },
      update: {},
      create: {
        name: category.name,
        group: category.group,
        icon: category.icon,
        isActive: true,
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
