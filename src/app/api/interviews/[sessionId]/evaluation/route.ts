// src/app/api/interviews/[sessionId]/evaluation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const { sessionId } = params;

  const interviewSession = await prisma.interviewSession.findFirst({
    where: { id: sessionId, userId },
    include: { evaluation: true },
  });

  if (!interviewSession) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ evaluation: interviewSession.evaluation });
}
