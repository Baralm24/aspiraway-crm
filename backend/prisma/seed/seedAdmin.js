const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminRole = await prisma.role.findUnique({
    where: { name: 'ADMIN' },
  });

  if (!adminRole) {
    console.log('❌ ADMIN role not found. Seed roles first.');
    return;
  }

  // HASH PASSWORD
  const plainPassword = 'Admin@123';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // CREATE OR UPDATE ADMIN USER
  await prisma.user.upsert({
    where: { email: 'admin@aspiraway.com' },
    update: { password: hashedPassword }, // update to hashed password
    create: {
      name: 'Super Admin',
      email: 'admin@aspiraway.com',
      password: hashedPassword,
      roleId: adminRole.id,
    },
  });

  console.log('✅ Admin user created with hashed password');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
