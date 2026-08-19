const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // 1️⃣ Seed roles
  const roles = ['ADMIN', 'MENTOR', 'STUDENT'];

  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
  }
  console.log('✅ Roles seeded');

  // 2️⃣ Fetch roles for user assignment
  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
  const mentorRole = await prisma.role.findUnique({ where: { name: 'MENTOR' } });
  const studentRole = await prisma.role.findUnique({ where: { name: 'STUDENT' } });

  // 3️⃣ Hash passwords
  const adminPass = await bcrypt.hash('Admin@123', 10);
  const mentorPass = await bcrypt.hash('Mentor@123', 10);
  const studentPass = await bcrypt.hash('Student@123', 10);

  // 4️⃣ Seed users
  await prisma.user.upsert({
    where: { email: 'admin@aspiraway.com' },
    update: { password: adminPass },
    create: {
      name: 'Super Admin',
      email: 'admin@aspiraway.com',
      password: adminPass,
      roleId: adminRole.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'mentor@aspiraway.com' },
    update: { password: mentorPass },
    create: {
      name: 'Mentor User',
      email: 'mentor@aspiraway.com',
      password: mentorPass,
      roleId: mentorRole.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'student@aspiraway.com' },
    update: { password: studentPass },
    create: {
      name: 'Student User',
      email: 'student@aspiraway.com',
      password: studentPass,
      roleId: studentRole.id,
    },
  });

  console.log('✅ Users seeded with hashed passwords');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
