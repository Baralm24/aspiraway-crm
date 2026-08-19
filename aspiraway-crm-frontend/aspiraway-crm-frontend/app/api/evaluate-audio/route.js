import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt tailored for UK Pre-CAS / Visa compliance
const PRE_CAS_SYSTEM_PROMPT = `
You are an expert UK Higher Education Compliance and Pre-CAS Interview Evaluator.
Analyze the student's spoken response transcript against official UKVI and university compliance standards.

Evaluate based on:
1. Genuine Intention to Study
2. Course & University Knowledge (Why this university/course?)
3. Financial Awareness & Career Progression
4. Clarity, Credibility, and Spoken Fluency

Return ONLY a valid JSON object in this format:
{
  "score": number (0 to 100),
  "verdict": "Pass" | "Borderline" | "High Risk",
  "transcript": "Full transcribed student text",
  "strengths": ["strength 1", "strength 2"],
  "redFlags": ["flag 1 if any"],
  "feedback": "Concise 2-3 sentence summary for the student",
  "advisorNotes": "Brief internal note for the educational counselor"
}
`;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio'); // Audio or extracted media file from web browser
    const questionText = formData.get('question') || 'Pre-CAS Interview Question';
    const studentInfoRaw = formData.get('studentInfo');
    const studentInfo = studentInfoRaw ? JSON.parse(studentInfoRaw) : {};

    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: 'No audio recording provided' },
        { status: 400 }
      );
    }

    // 1. Transcribe the spoken audio using Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en',
    });

    const studentTranscript = transcription.text;

    // 2. Evaluate the transcribed response with gpt-4o-mini
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: PRE_CAS_SYSTEM_PROMPT },
        {
          role: 'user',
          content: JSON.stringify({
            questionAsked: questionText,
            studentAnswerTranscript: studentTranscript,
            studentDetails: studentInfo,
          }),
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const evaluation = JSON.parse(completion.choices[0].message.content);
    evaluation.transcript = studentTranscript; // Attach transcript to result

    // 3. Send evaluation details to your Google Sheet / Webhook
    const webhookUrl = process.env.N8N_LEAD_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          ...studentInfo,
          transcript: studentTranscript,
          score: evaluation.score,
          verdict: evaluation.verdict,
          redFlags: Array.isArray(evaluation.redFlags) ? evaluation.redFlags.join(', ') : '',
          feedback: evaluation.feedback,
        }),
        redirect: 'follow',
      }).catch((err) => console.error('Webhook payload error:', err));
    }

    return NextResponse.json({
      success: true,
      evaluation,
    });
  } catch (error) {
    console.error('Phase 1 Audio Evaluation Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}