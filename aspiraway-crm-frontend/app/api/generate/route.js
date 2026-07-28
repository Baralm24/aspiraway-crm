export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Fallback pool in case DB query returns empty/incomplete
const FALLBACK_QUESTIONS = [
  { category: 'MANDATORY_INTRO', text: 'Please state your full name, date of birth, and passport number for verification.' },
  { category: 'STUDY PLAN', text: 'Why did you choose to study {course} at {university} rather than another institution?' },
  { category: 'STUDY PLAN', text: 'How does this course directly align with your long-term career aspirations?' },
  { category: 'FINANCIAL', text: 'Who is funding your tuition fees and living expenses, and what is their source of income?' },
  { category: 'FINANCIAL', text: 'Can you explain the origin of the funds deposited in your bank statements?' },
  { category: 'ACADEMIC HISTORY', text: 'Why did you decide to pursue further studies in the UK at this specific point in time?' },
  { category: 'ACADEMIC HISTORY', text: 'Can you explain any academic or professional gaps in your record?' },
  { category: 'UK CREDIBILITY', text: 'Where will you be accommodation-wise, and how far is it from the main university campus?' },
  { category: 'UK CREDIBILITY', text: 'What specific modules in {course} are you most looking forward to and why?' },
  { category: 'UK CREDIBILITY', text: 'What is the total annual tuition fee for {course}, and how much deposit have you paid?' },
  { category: 'CAREER GOALS', text: 'What specific job role or job title do you plan to target upon completing this course?' },
  { category: 'CAREER GOALS', text: 'Name a few companies in your home country where you intend to apply for work after graduation.' },
  { category: 'IMMIGRATION', text: 'What are your student visa conditions regarding working hours during term time?' },
  { category: 'IMMIGRATION', text: 'Do you have any family members or relatives currently residing in the UK?' },
  { category: 'POST-STUDY', text: 'Do you plan to apply for the Graduate Route visa, or return home immediately?' },
  { category: 'DEPENDENTS', text: 'Are you planning to bring any dependents with you during your studies?' },
  { category: 'ACADEMIC HISTORY', text: 'What relevant skills or experience do you bring from your previous education or workplace?' },
  { category: 'STUDY PLAN', text: 'What alternative universities did you research before making your final selection?' },
  { category: 'SUMMARY', text: 'Is there any additional information you would like to clarify regarding your application?' }
];

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawUniversity = body.universitySlug || body.university || 'Greenwich';
    const courseTitle = body.courseTitle || body.course || 'MSc Data Science';

    const universitySlug = rawUniversity
      .toLowerCase()
      .replace(/university of /g, '')
      .replace(/ university/g, '')
      .trim()
      .replace(/\s+/g, '-');

    let allQuestions = [];

    // Try fetching from Prisma
    try {
      const university = await prisma.university.findUnique({
        where: { slug: universitySlug },
        include: { questions: true },
      });

      const globalQuestions = await prisma.question.findMany({
        where: { universityId: null },
      });

      allQuestions = [...(university?.questions || []), ...globalQuestions];
    } catch (dbError) {
      console.warn('Prisma DB fetch failed, utilizing fallback pool:', dbError.message);
    }

    // If DB has no questions or failed, use internal fallback pool
    if (!allQuestions || allQuestions.length === 0) {
      console.warn('No questions found in Supabase database. Loading fallback questions.');
      allQuestions = FALLBACK_QUESTIONS;
    }

    // 3. Separate Intro question & shuffle pool
    const introQuestion = allQuestions.find((q) => q.category === 'MANDATORY_INTRO') || FALLBACK_QUESTIONS[0];
    const pool = allQuestions.filter((q) => q.category !== 'MANDATORY_INTRO');

    const shuffledPool = [...pool].sort(() => 0.5 - Math.random()).slice(0, 18);

    // 4. Fill in placeholders and standardize key names
    const sessionQuestions = [introQuestion, ...shuffledPool]
      .filter(Boolean)
      .map((q, index) => {
        let text = q.questionTemplate || q.text || q.prompt || q.question || '';
        text = text
          .replace(/{university}/g, rawUniversity)
          .replace(/{course}/g, courseTitle);

        return {
          id: q.id || `q-${index + 1}`,
          category: q.category || 'STUDY PLAN',
          timeLimit: q.timeLimitSec || q.timeLimit || 60,
          text: text,
          question: text, // Dual key mapping for frontend compatibility
        };
      });

    return NextResponse.json({ questions: sessionQuestions });
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate interview questions' },
      { status: 500 }
    );
  }
}