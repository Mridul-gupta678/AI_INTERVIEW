// src/app/api/interviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { setInterviewSession } from '@/lib/redis';
import { generateInterviewerResponse } from '@/services/ai.service';
import { z } from 'zod';

const createSessionSchema = z.object({
  type: z.enum(['TECHNICAL', 'BEHAVIORAL', 'MIXED', 'CODING']),
  domain: z.enum(['DSA', 'SYSTEM_DESIGN', 'OS', 'DBMS', 'CN', 'HR_BEHAVIORAL', 'FULL_STACK', 'FRONTEND', 'BACKEND', 'MACHINE_LEARNING']),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  company: z.string().optional(),
  resumeId: z.string().optional(),
  duration: z.number().default(45),
});

export async function POST(req: NextRequest) {
  try {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createSessionSchema.safeParse(body);
  
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { type, domain, difficulty, company, resumeId, duration } = parsed.data;
  const userId = (session.user as any).id;

  // Get resume data if provided
  let resumeData = null;
  if (resumeId) {
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
    });
    resumeData = resume?.parsedData as any;
  }

  // Create DB session
  const interviewSession = await prisma.interviewSession.create({
    data: {
      userId,
      type,
      domain,
      difficulty,
      company,
      resumeId,
      duration,
      status: 'IN_PROGRESS',
      startedAt: new Date(),
    },
  });

  // Generate opening message from AI interviewer
  const openingResponse = await generateInterviewerResponse(
    type,
    domain,
    difficulty,
    [],
    company,
    resumeData
  );

  // Save opening message to DB
  const message = await prisma.message.create({
    data: {
      sessionId: interviewSession.id,
      role: 'INTERVIEWER',
      content: openingResponse.message,
    },
  });

  // Cache session state in Redis for fast access
  await setInterviewSession(interviewSession.id, {
    type,
    domain,
    difficulty,
    company,
    resumeData,
    messageCount: 1,
    questionCount: 0,
    userId,
    status: 'IN_PROGRESS',
    recentHistory: [{
      role: 'INTERVIEWER',
      content: openingResponse.message,
      timestamp: new Date()
    }]
  });

  return NextResponse.json({
    session: interviewSession,
    message,
    interviewComplete: false,
  }, { status: 201 });
  } catch (err: any) {
    console.error('Failed to create interview session:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const domain = searchParams.get('domain');
  const status = searchParams.get('status');

  const where: any = { userId };
  if (domain) where.domain = domain;
  if (status) where.status = status;

  const [sessions, total] = await Promise.all([
    prisma.interviewSession.findMany({
      where,
      include: {
        evaluation: {
          select: { overallScore: true, technicalScore: true, communicationScore: true, detailedReport: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.interviewSession.count({ where }),
  ]);

  return NextResponse.json({ sessions, total, page, limit });
}
