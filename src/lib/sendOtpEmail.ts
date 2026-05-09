export async function sendOtpEmail(email: string, otp: string) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;

  if (!apiKey || !senderEmail) {
    console.warn('[Email OTP] BREVO_API_KEY or BREVO_SENDER_EMAIL not set. Simulating email sending.');
    console.log(`[Email OTP] To: ${email} | Code: ${otp}`);
    return { success: true };
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify Your Email</title>
</head>
<body style="background:#f8fafc;font-family:Inter,Arial,sans-serif;margin:0;padding:0;color:#0f172a;">
  <table width="100%" bgcolor="#f8fafc" cellpadding="0" cellspacing="0" border="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <div style="max-width:500px;margin:0 auto;text-align:center;background:#ffffff;border-radius:16px;padding:40px;box-shadow:0 4px 20px rgba(0,0,0,0.05);border:1px solid #e2e8f0;">
          
          <h1 style="color:#0f172a;font-size:24px;margin:0 0 16px 0;font-weight:700;">Verify Your Email — InterviewAI</h1>
          <p style="color:#64748b;font-size:15px;line-height:1.6;margin:0 0 32px 0;">
            Use the verification code below to complete your sign-up process.
          </p>

          <div style="background:#f1f5f9;border-radius:12px;padding:24px;margin-bottom:32px;">
            <p style="color:#0f172a;font-size:36px;font-weight:800;letter-spacing:8px;margin:0;">${otp}</p>
          </div>

          <p style="color:#ef4444;font-size:13px;font-weight:500;margin:0 0 24px 0;">
            This code expires in 5 minutes.
          </p>

          <div style="border-top:1px solid #e2e8f0;padding-top:24px;">
            <p style="color:#94a3b8;font-size:12px;line-height:1.5;margin:0;">
              If you did not request this, please ignore this email. Your account will not be created until you verify.
            </p>
          </div>

        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

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
        to: [{ email: email }],
        subject: 'Verify Your Email — InterviewAI',
        htmlContent,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Email OTP] Failed to send email via Brevo:', data);
      return { success: false, error: data };
    }

    console.log('[Email OTP] Sent successfully via Brevo, messageId:', data.messageId);
    return { success: true, data };
  } catch (error) {
    console.error('[Email OTP] Exception sending email:', error);
    return { success: false, error };
  }
}
