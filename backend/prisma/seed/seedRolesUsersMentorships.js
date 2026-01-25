const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // =====================
  // CREATE ROLES
  // =====================
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN' },
  });

  const mentorRole = await prisma.role.upsert({
    where: { name: 'MENTOR' },
    update: {},
    create: { name: 'MENTOR' },
  });

  const studentRole = await prisma.role.upsert({
    where: { name: 'STUDENT' },
    update: {},
    create: { name: 'STUDENT' },
  });

  console.log('✅ Roles created');

  // =====================
  // HASH PASSWORDS
  // =====================
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const mentorPassword = await bcrypt.hash('Mentor@123', 10);
  const studentPassword = await bcrypt.hash('Student@123', 10);

  // =====================
  // CREATE USERS
  // =====================
  const admin = await prisma.user.upsert({
    where: { email: 'admin@aspiraway.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@aspiraway.com',
      password: adminPassword,
      roleId: adminRole.id,
    },
  });

  const mentor = await prisma.user.upsert({
    where: { email: 'mentor@aspiraway.com' },
    update: {},
    create: {
      name: 'Senior Mentor',
      email: 'mentor@aspiraway.com',
      password: mentorPassword,
      roleId: mentorRole.id,
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@aspiraway.com' },
    update: {},
    create: {
      name: 'Test Student',
      email: 'student@aspiraway.com',
      password: studentPassword,
      roleId: studentRole.id,
    },
  });

  console.log('✅ Users created');

  // =====================
  // CREATE SAMPLE MENTORSHIP
  // =====================
  const existing = await prisma.studentMentorship.findFirst({
    where: {
      mentorId: mentor.id,
      studentId: student.id,
    },
  });

  if (!existing) {
    await prisma.studentMentorship.create({
      data: {
        mentorId: mentor.id,
        studentId: student.id,
        status: 'pending',
      },
    });
    console.log('✅ Sample mentorship request created');
  } else {
    console.log('ℹ️ Mentorship already exists');
  }

  console.log('🌱 Seeding completed successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
