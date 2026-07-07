import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  if (process.env.SEED_DEMO !== 'true') {
    console.log(
      'Seed omitido. Defina SEED_DEMO=true para crear datos de desarrollo.',
    );
    return;
  }

  await prisma.user.upsert({
    where: { email: 'demo@presupuestador.local' },
    update: {},
    create: {
      name: 'Usuario Demo',
      email: 'demo@presupuestador.local',
      passwordHash: 'DISABLED_UNTIL_AUTH_PHASE',
      businessName: 'Negocio Demo',
    },
  });
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
