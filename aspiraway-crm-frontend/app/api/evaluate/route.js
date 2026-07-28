import OpenAI from 'openai';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Server misconfiguration: OPENAI_API_KEY is missing.' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });

    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required in request body.' },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { 
          role: 'system', 
          // CRITICAL: The word "json" MUST be in this system prompt!
          content: 'You are a helpful assistant. Provide all output as a valid json object.' 
        },
        { role: 'user', content: prompt },
      ],
    });

    return NextResponse.json({ result: response.choices[0].message.content });

  } catch (error) {
    console.error('OpenAI API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong.' },
      { status: 500 }
    );
  }
}