import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.user.updateMany({ data: { role: 'ADMIN' } });
  console.log('All users upgraded to ADMIN successfully!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
