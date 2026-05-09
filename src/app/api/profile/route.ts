// src/app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  return NextResponse.json({ user, profile: user?.profile });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const body = await req.json();
  const { name, bio, targetRole, experience, preferredStack, linkedinUrl, githubUrl, advancedSettings } = body;

  await prisma.user.update({
    where: { id: userId },
    data: { name },
  });

  const profile = await prisma.profile.upsert({
    where: { userId },
    create: { userId, bio, targetRole, experience, preferredStack, linkedinUrl, githubUrl, advancedSettings },
    update: { bio, targetRole, experience, preferredStack, linkedinUrl, githubUrl, advancedSettings },
  });

  return NextResponse.json({ profile });
}
