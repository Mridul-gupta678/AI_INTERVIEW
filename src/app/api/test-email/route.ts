// src/app/api/test-email/route.ts
// Temporary diagnostic route — remove after confirming email works
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;

  // 1. Check env vars
  if (!apiKey || !senderEmail) {
    return NextResponse.json({
      status: 'error',
      message: 'Missing env vars',
      BREVO_API_KEY: apiKey ? '✅ Set' : '❌ MISSING',
      BREVO_SENDER_EMAIL: senderEmail ? '✅ Set' : '❌ MISSING',
    });
  }

  // 2. Try sending a real email
  const recipientEmail = 'interviewai.mg@gmail.com'; // Hardcoded for testing

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'InterviewAI', email: senderEmail },
        to: [{ email: recipientEmail, name: 'Test User' }],
        subject: '✅ InterviewAI Email Test',
        htmlContent: `
          <div style="background:#0f172a;color:#e2e8f0;font-family:Arial,sans-serif;padding:40px;max-width:500px;margin:0 auto;border-radius:16px;">
            <h1 style="color:#6366f1;">🧠 Email Test Successful!</h1>
            <p>Hi there,</p>
            <p>This is a test email from your <strong>InterviewAI</strong> platform.</p>
            <p>If you received this, email notifications are working perfectly! 🎉</p>
            <hr style="border-color:#1e293b;margin:24px 0;" />
            <p style="color:#64748b;font-size:12px;">Sent from: ${senderEmail}<br/>Sent to: ${recipientEmail}</p>
          </div>
        `,
      }),
    });

    const data = await response.json();

    return NextResponse.json({
      status: response.ok ? 'success' : 'error',
      httpStatus: response.status,
      recipientEmail,
      senderEmail,
      brevoResponse: data,
      message: response.ok
        ? `✅ Email sent to ${recipientEmail}! Check your inbox.`
        : `❌ Brevo rejected the request. See brevoResponse for details.`,
    });
  } catch (err: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Fetch to Brevo failed',
      error: err?.message || String(err),
    });
  }
}
