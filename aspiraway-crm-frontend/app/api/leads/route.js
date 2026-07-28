import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, university, course, destination, createdAt } = body;

    // 1. Save to database (e.g., Prisma, Supabase, or PostgreSQL)
    // await db.lead.create({ data: { name, email, phone, university, course, destination } });

    // 2. Trigger webhook for automation (e.g., n8n / Zapier)
    /*
    await fetch('YOUR_N8N_WEBHOOK_URL', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    */

    console.log('New Pre-CAS Lead Captured:', { name, email, phone, university, course });

    return NextResponse.json({ success: true, message: 'Lead captured successfully' });
  } catch (error) {
    console.error('Error saving lead:', error);
    return NextResponse.json({ success: false, error: 'Failed to save lead' }, { status: 500 });
  }
}