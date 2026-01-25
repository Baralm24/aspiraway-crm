const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@aspiraway.com';
  const password = 'Admin@123'; // Change to whatever you want
  const hashedPassword = await bcrypt.hash(password, 10);

  // Check if admin already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Admin user already exists:', existing.email);
    return;
  }

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email,
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('Admin user created successfully:', admin.email);
}

main()
  .catch(e => {
    console.error('SEED ERROR:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
