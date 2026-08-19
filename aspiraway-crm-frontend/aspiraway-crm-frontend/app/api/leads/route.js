import { NextResponse } from 'next/server';

// Ensure Vercel never caches this route statically
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, university, course, destination, source } = body;

    const leadData = {
      name: name || 'Anonymous Student',
      email: email || 'N/A',
      phone: phone || 'N/A',
      university: university || 'N/A',
      course: course || 'N/A',
      destination: destination || 'United Kingdom',
      source: source || 'Pre-CAS Mock Tool',
      createdAt: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kathmandu' }),
    };

    const webhookUrl = process.env.N8N_LEAD_WEBHOOK_URL;

    if (webhookUrl) {
      // Send to Google Apps Script / n8n Webhook
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(leadData),
        redirect: 'follow', // Required for Google Apps Script 302 redirects
      });

      const resText = await response.text();
      console.log('Webhook Response:', resText);
    } else {
      console.log('⚠️ N8N_LEAD_WEBHOOK_URL is missing in environment variables');
    }

    return NextResponse.json({
      success: true,
      message: 'Lead captured successfully',
      data: leadData,
    });
  } catch (error) {
    console.error('Error saving lead:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save lead' },
      { status: 500 }
    );
  }
}