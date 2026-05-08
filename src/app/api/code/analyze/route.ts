// src/app/api/code/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { evaluateCode } from '@/services/ai.service';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { code, language, sessionId } = await req.json();

  // Get problem context from session messages
  let problem = 'Solve the given problem optimally.';
  if (sessionId) {
    const lastInterviewerMsg = await prisma.message.findFirst({
      where: { sessionId, role: 'INTERVIEWER' },
      orderBy: { timestamp: 'desc' },
    });
    if (lastInterviewerMsg) problem = lastInterviewerMsg.content;
  }

  const analysis = await evaluateCode(problem, code, language, []);

  // Save to DB if session exists
  if (sessionId) {
    await prisma.codeSubmission.create({
      data: {
        sessionId,
        language,
        code,
        problem,
        analysis: analysis as any,
        score: analysis.score,
      },
    });
  }

  return NextResponse.json({ analysis });
}
