import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed file disabled - schema migration in progress');
  console.log('⚠️  This seed file needs to be updated to match the new database schema');
  console.log('   Old schema: User, Store, Product');
  console.log('   New schema: app_user, store, store_product, etc.');
  console.log('   Please update this file after schema migration is complete.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
