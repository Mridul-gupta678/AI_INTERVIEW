import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOtpEmail } from '@/lib/sendOtpEmail';

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (user.emailVerified) {
    return NextResponse.json({ error: 'Email is already verified' }, { status: 400 });
  }

  // Check cooldown
  const latestOtp = await prisma.otpVerification.findFirst({
    where: { email },
    orderBy: { createdAt: 'desc' }
  });

  if (latestOtp && (Date.now() - latestOtp.createdAt.getTime() < 60000)) {
    return NextResponse.json({ error: 'Please wait 60 seconds before requesting another code.' }, { status: 429 });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.otpVerification.deleteMany({ where: { email } });

  await prisma.otpVerification.create({
    data: { email, otp, expiresAt }
  });

  await sendOtpEmail(email, otp);

  return NextResponse.json({ message: 'OTP sent' }, { status: 200 });
}
