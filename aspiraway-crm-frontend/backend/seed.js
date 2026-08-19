const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminRole = await prisma.role.findUnique({ where: { name: "ADMIN" } });
  const mentorRole = await prisma.role.findUnique({ where: { name: "MENTOR" } });
  const studentRole = await prisma.role.findUnique({ where: { name: "STUDENT" } });

  const password = await bcrypt.hash("password123", 10);

  await prisma.user.createMany({
    data: [
      {
        name: "Mentor One",
        email: "mentor1@aspiraway.com",
        password,
        roleId: mentorRole.id,
      },
      {
        name: "Student One",
        email: "student1@aspiraway.com",
        password,
        roleId: studentRole.id,
      },
      {
        name: "Student Two",
        email: "student2@aspiraway.com",
        password,
        roleId: studentRole.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Demo users created");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
