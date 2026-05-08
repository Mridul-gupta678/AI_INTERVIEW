// src/lib/email.ts
// Uses Brevo (formerly Sendinblue) Transactional Email API — no extra packages needed

interface SendResultEmailParams {
  to: string;
  userName: string;
  sessionId: string;
  evaluation: {
    overallScore: number;
    technicalScore: number;
    communicationScore: number;
    confidenceScore: number;
    clarityScore: number;
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
    summary: string;
    hireable: boolean;
    seniorityFit: string;
  };
  domain: string;
  difficulty: string;
}

function sc(score: number): string {
  if (score >= 75) return '#10b981';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

function grade(score: number): string {
  if (score >= 85) return 'Excellent 🏆';
  if (score >= 70) return 'Good 👍';
  if (score >= 55) return 'Average 📈';
  return 'Needs Work 💪';
}

function buildEmailHtml(params: SendResultEmailParams): string {
  const { evaluation, userName, sessionId, domain, difficulty } = params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ai-interview-platform-rosy.vercel.app';
  const resultsUrl = `${appUrl}/interview/${sessionId}/results`;
  const firstName = userName?.split(' ')[0] || 'there';
  const domainLabel = domain.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const mainColor = sc(evaluation.overallScore);
  const gradeLabel = grade(evaluation.overallScore);

  const subScores = [
    { label: 'Technical', score: evaluation.technicalScore },
    { label: 'Communication', score: evaluation.communicationScore },
    { label: 'Confidence', score: evaluation.confidenceScore },
    { label: 'Clarity', score: evaluation.clarityScore },
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Interview Results</title>
</head>
<body style="background:#070B14;font-family:Inter,Arial,sans-serif;margin:0;padding:0;color:#f8fafc;">
  <table width="100%" bgcolor="#070B14" cellpadding="0" cellspacing="0" border="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <div style="max-width:600px;margin:0 auto;text-align:left;">
          
          <!-- Header -->
          <div style="text-align:center;margin-bottom:40px;">
            <div style="display:inline-block;background:linear-gradient(135deg,#6366f1,#7c3aed);border-radius:12px;padding:12px 24px;box-shadow:0 4px 20px rgba(99,102,241,0.3);">
              <span style="color:#fff;font-weight:700;font-size:18px;letter-spacing:-0.5px;">Interview Intelligence</span>
            </div>
          </div>

          <!-- Main Hero Card -->
          <div style="background:rgba(17,24,39,0.4);border-radius:24px;padding:40px;margin-bottom:24px;border:1px solid rgba(255,255,255,0.05);">
            <h1 style="color:#f8fafc;font-size:24px;margin:0 0 8px 0;text-align:center;font-weight:600;letter-spacing:-0.5px;">Hi ${firstName}, your AI evaluation is ready.</h1>
            <p style="color:#64748b;text-align:center;margin:0 0 36px 0;font-size:14px;text-transform:uppercase;letter-spacing:1px;font-weight:500;">${domainLabel} &middot; ${difficulty}</p>

            <div style="background:#0B1020;border-radius:20px;padding:36px 20px;text-align:center;margin-bottom:32px;border:1px solid rgba(255,255,255,0.05);">
              <p style="color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px 0;font-weight:600;">Overall Score</p>
              <p style="color:${mainColor};font-size:72px;font-weight:800;margin:0;line-height:1;letter-spacing:-2px;">${evaluation.overallScore}</p>
              <p style="color:#64748b;font-size:14px;margin:4px 0 24px 0;font-weight:500;">/100</p>
              
              <div style="display:inline-block;background:${mainColor}15;border:1px solid ${mainColor}30;border-radius:999px;padding:8px 24px;">
                <span style="color:${mainColor};font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">${gradeLabel}</span>
              </div>
              
              ${evaluation.hireable ? `<div style="margin-top:16px;"><span style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.2);border-radius:999px;padding:6px 20px;color:#10b981;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">&#10003; Recommendation: Proceed</span></div>` : ''}
            </div>

            <table width="100%" cellpadding="6" cellspacing="0" style="border-collapse:collapse;margin-bottom:8px;">
              <tr>
                ${subScores.map(({ label, score }) => `
                <td style="text-align:center;padding:0 6px;width:25%;">
                  <div style="background:#0B1020;border-radius:16px;padding:16px 8px;border:1px solid rgba(255,255,255,0.03);">
                    <p style="color:${sc(score)};font-size:20px;font-weight:700;margin:0 0 6px 0;">${Math.round(score)}</p>
                    <p style="color:#64748b;font-size:10px;margin:0;text-transform:uppercase;letter-spacing:1px;font-weight:600;">${label}</p>
                  </div>
                </td>`).join('')}
              </tr>
            </table>
          </div>

          <!-- Summary -->
          <div style="background:rgba(17,24,39,0.4);border-radius:24px;padding:32px;margin-bottom:24px;border:1px solid rgba(255,255,255,0.05);">
            <p style="color:#6366f1;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 16px 0;">AI Executive Summary</p>
            <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0;font-weight:300;">${evaluation.summary}</p>
          </div>

          <!-- Strengths -->
          ${evaluation.strengths.length > 0 ? `
          <div style="background:rgba(16,185,129,0.05);border-radius:24px;padding:32px;margin-bottom:24px;border:1px solid rgba(16,185,129,0.1);">
            <p style="color:#10b981;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 16px 0;">&#10003; Demonstrated Strengths</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${evaluation.strengths.slice(0, 3).map(s => `
                <tr>
                  <td width="20" valign="top" style="padding:6px 0;"><div style="width:6px;height:6px;border-radius:50%;background:#10b981;margin-top:6px;"></div></td>
                  <td style="color:#cbd5e1;font-size:14px;line-height:1.6;padding:6px 0;font-weight:300;">${s}</td>
                </tr>
              `).join('')}
            </table>
          </div>` : ''}

          <!-- Improvements -->
          ${evaluation.improvements.length > 0 ? `
          <div style="background:rgba(245,158,11,0.05);border-radius:24px;padding:32px;margin-bottom:40px;border:1px solid rgba(245,158,11,0.1);">
            <p style="color:#f59e0b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin:0 0 16px 0;">&#128295; AI Improvement Roadmap</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${evaluation.improvements.slice(0, 3).map((imp, i) => `
                <tr>
                  <td width="24" valign="top" style="padding:6px 0;"><span style="color:#f59e0b;font-size:14px;font-weight:700;">${i+1}.</span></td>
                  <td style="color:#cbd5e1;font-size:14px;line-height:1.6;padding:6px 0;font-weight:300;">${imp}</td>
                </tr>
              `).join('')}
            </table>
          </div>` : ''}

          <!-- CTA -->
          <div style="text-align:center;margin-bottom:48px;">
            <a href="${resultsUrl}" style="background:linear-gradient(135deg,#6366f1,#7c3aed);color:#fff;border-radius:12px;padding:16px 40px;font-weight:600;font-size:15px;text-decoration:none;display:inline-block;box-shadow:0 8px 24px rgba(99,102,241,0.3);border:1px solid rgba(255,255,255,0.1);">
              View Complete Analytical Report
            </a>
          </div>

          <!-- Footer -->
          <div style="border-top:1px solid rgba(255,255,255,0.05);padding-top:32px;text-align:center;">
            <p style="color:#64748b;font-size:12px;margin:0 0 8px 0;font-weight:500;">Interview Intelligence Platform</p>
            <p style="color:#475569;font-size:11px;margin:0;font-weight:300;">You received this automated report because you completed a session on our platform.</p>
          </div>

        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendInterviewResultEmail(params: SendResultEmailParams) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;

  if (!apiKey || !senderEmail) {
    console.warn('[Email] BREVO_API_KEY or BREVO_SENDER_EMAIL not set, skipping email.');
    return { success: false, error: 'Brevo credentials not configured' };
  }

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
        to: [{ email: params.to, name: params.userName || 'Candidate' }],
        subject: `Your Interview Results — Score: ${params.evaluation.overallScore}/100 (${grade(params.evaluation.overallScore)})`,
        htmlContent: buildEmailHtml(params),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Email] Brevo API error:', JSON.stringify(data));
      return { success: false, error: data };
    }

    console.log('[Email] Sent successfully via Brevo, messageId:', data.messageId);
    return { success: true, messageId: data.messageId };
  } catch (err) {
    console.error('[Email] Unexpected error:', err);
    return { success: false, error: err };
  }
}
