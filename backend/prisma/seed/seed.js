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
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding University of Greenwich data...');

  // 1. Upsert University of Greenwich
  const greenwich = await prisma.university.upsert({
    where: { slug: 'greenwich' },
    update: {},
    create: {
      name: 'University of Greenwich',
      slug: 'greenwich',
      city: 'London',
      londonLivingCost: 1529,
    },
  });

  // 2. Add sample courses
  await prisma.course.createMany({
    skipDuplicates: true,
    data: [
      {
        universityId: greenwich.id,
        title: 'MSc Data Science',
        level: 'Postgraduate',
        tuitionFee: 19450,
      },
      {
        universityId: greenwich.id,
        title: 'MBA International Business',
        level: 'Postgraduate',
        tuitionFee: 18500,
      },
    ],
  });

  // 3. Populate Questions List
  const questions = [
    // Mandatory Intro
    {
      category: 'MANDATORY_INTRO',
      timeLimitSec: 60,
      questionTemplate: 'Can you please introduce yourself and share a brief overview of your educational background and the subjects you studied previously?',
      universityId: null,
    },
    // UK & General
    {
      category: 'UK_CHOICE',
      timeLimitSec: 60,
      questionTemplate: 'Why did you choose the UK over other countries like the US, Canada, or Australia?',
      universityId: null,
    },
    {
      category: 'UK_CHOICE',
      timeLimitSec: 30,
      questionTemplate: 'What do you know about life in London and the cost of living there?',
      universityId: null,
    },
    // Greenwich Specifics
    {
      category: 'UNIVERSITY_SPECIFIC',
      timeLimitSec: 60,
      questionTemplate: 'The Greenwich campus is known for its heritage and riverside location. What excites you about studying there?',
      universityId: greenwich.id,
    },
    {
      category: 'UNIVERSITY_SPECIFIC',
      timeLimitSec: 60,
      questionTemplate: 'Can you name any notable rankings, achievements, or features of the University of Greenwich?',
      universityId: greenwich.id,
    },
    {
      category: 'UNIVERSITY_SPECIFIC',
      timeLimitSec: 30,
      questionTemplate: 'How did you first hear about Greenwich?',
      universityId: greenwich.id,
    },
    {
      category: 'UNIVERSITY_SPECIFIC',
      timeLimitSec: 60,
      questionTemplate: 'What facilities are available on campus at Greenwich?',
      universityId: greenwich.id,
    },
    // Course Specifics
    {
      category: 'COURSE_SPECIFIC',
      timeLimitSec: 90,
      questionTemplate: 'What course have you applied for and why did you choose it?',
      universityId: null,
    },
    {
      category: 'COURSE_SPECIFIC',
      timeLimitSec: 30,
      questionTemplate: 'What is the duration of your course, and what are the start and end dates?',
      universityId: null,
    },
    {
      category: 'COURSE_SPECIFIC',
      timeLimitSec: 30,
      questionTemplate: 'How will you be assessed during the course?',
      universityId: null,
    },
    {
      category: 'COURSE_SPECIFIC',
      timeLimitSec: 90,
      questionTemplate: 'Is your chosen course aligned with your previous studies or work experience?',
      universityId: null,
    },
    // Finance & Sponsorship
    {
      category: 'FINANCE_SPONSORSHIP',
      timeLimitSec: 60,
      questionTemplate: 'How do you plan to manage your expenses while studying in London?',
      universityId: null,
    },
    {
      category: 'FINANCE_SPONSORSHIP',
      timeLimitSec: 30,
      questionTemplate: 'What is your tuition fee for the course, and how much deposit have you paid to the university?',
      universityId: null,
    },
    {
      category: 'FINANCE_SPONSORSHIP',
      timeLimitSec: 30,
      questionTemplate: 'How will you fund your education and living expenses, and what is your total estimated cost per year?',
      universityId: null,
    },
    {
      category: 'FINANCE_SPONSORSHIP',
      timeLimitSec: 60,
      questionTemplate: 'Who is sponsoring you? Can you provide details about your family’s financial situation?',
      universityId: null,
    },
    // Career & Intentions
    {
      category: 'CAREER_PROGRESSION',
      timeLimitSec: 60,
      questionTemplate: 'How will this degree from {university} help you in your future career?',
      universityId: null,
    },
    {
      category: 'CAREER_PROGRESSION',
      timeLimitSec: 60,
      questionTemplate: 'Do you plan to stay in the UK after graduation or return to your home country?',
      universityId: null,
    },
    {
      category: 'CAREER_PROGRESSION',
      timeLimitSec: 90,
      questionTemplate: 'Describe your short-term and long-term career goals.',
      universityId: null,
    },
    {
      category: 'CAREER_PROGRESSION',
      timeLimitSec: 60,
      questionTemplate: 'What are the job prospects in your home country after completing this course?',
      universityId: null,
    },
    // Compliance & Visa
    {
      category: 'VISA_COMPLIANCE',
      timeLimitSec: 60,
      questionTemplate: 'If your visa is delayed or refused, what will you do?',
      universityId: null,
    },
    {
      category: 'VISA_COMPLIANCE',
      timeLimitSec: 30,
      questionTemplate: 'Are you aware of the UK rules regarding working during your studies?',
      universityId: null,
    },
    {
      category: 'VISA_COMPLIANCE',
      timeLimitSec: 60,
      questionTemplate: 'Have you ever had a visa application refusal from the UK or any other country?',
      universityId: null,
    },
  ];

  for (const q of questions) {
    await prisma.question.create({
      data: q,
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });