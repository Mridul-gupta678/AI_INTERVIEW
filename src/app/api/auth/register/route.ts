// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

import { sendOtpEmail } from '@/lib/sendOtpEmail';

const schema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.emailVerified) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }
    // If not verified, we can just update their password and name and send a new OTP
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { email },
      data: { name, passwordHash },
    });
  } else {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        profile: { create: {} },
        analytics: { create: { updatedAt: new Date() } },
      },
    });
  }

  // Generate OTP
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Delete any existing OTPs for this email
  await prisma.otpVerification.deleteMany({
    where: { email }
  });

  // Save new OTP
  await prisma.otpVerification.create({
    data: {
      email,
      otp,
      expiresAt,
    }
  });

  // Send email
  await sendOtpEmail(email, otp);

  return NextResponse.json({ message: 'OTP sent successfully', email }, { status: 201 });
}
