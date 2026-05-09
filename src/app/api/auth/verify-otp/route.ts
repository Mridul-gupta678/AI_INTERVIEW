import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { email, otp } = await req.json();

  if (!email || !otp) {
    return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
  }

  const verification = await prisma.otpVerification.findFirst({
    where: { email },
    orderBy: { createdAt: 'desc' }
  });

  if (!verification) {
    return NextResponse.json({ error: 'No verification request found' }, { status: 400 });
  }

  if (verification.attempts >= 5) {
    return NextResponse.json({ error: 'Too many attempts. Please request a new code.' }, { status: 429 });
  }

  if (verification.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Verification code expired. Please request a new one.' }, { status: 400 });
  }

  if (verification.otp !== otp) {
    await prisma.otpVerification.update({
      where: { id: verification.id },
      data: { attempts: { increment: 1 } }
    });
    return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
  }

  // Success
  await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() }
  });

  await prisma.otpVerification.deleteMany({ where: { email } });

  return NextResponse.json({ message: 'Email verified successfully' }, { status: 200 });
}
