// src/app/api/interviews/[sessionId]/message/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getInterviewSession, setInterviewSession } from '@/lib/redis';
import {
  generateInterviewerResponse,
  analyzeFillerWords,
} from '@/services/ai.service';

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  // Parallelize auth + body parsing
  const [session, body] = await Promise.all([
    getServerSession(authOptions),
    req.json()
  ]);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { sessionId } = params;
  const { content, code, language } = body;

  // ── Get session config + conversation history ──────────────────────────────
  let cachedCtx = await getInterviewSession<any>(sessionId);
  let interviewSession: any = null;
  let rawHistory: any[] = [];

  if (cachedCtx && cachedCtx.userId === userId && cachedCtx.status === 'IN_PROGRESS') {
    // FAST PATH: everything from Redis (~20ms, no Postgres cold start)
    interviewSession = {
      type: cachedCtx.type,
      domain: cachedCtx.domain,
      difficulty: cachedCtx.difficulty,
      company: cachedCtx.company,
    };
    rawHistory = cachedCtx.recentHistory || [];
  } else {
    // SLOW PATH: Postgres fallback (cache miss or first message)
    const [dbSession, dbHistory] = await Promise.all([
      prisma.interviewSession.findFirst({
        where: { id: sessionId, userId, status: 'IN_PROGRESS' },
      }),
      prisma.message.findMany({
        where: { sessionId },
        orderBy: { timestamp: 'desc' },
        take: 8,
      })
    ]);

    if (!dbSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    interviewSession = dbSession;
    rawHistory = dbHistory.reverse();

    cachedCtx = {
      type: dbSession.type,
      domain: dbSession.domain,
      difficulty: dbSession.difficulty,
      company: dbSession.company,
      resumeData: null,
      messageCount: rawHistory.length,
      questionCount: 0,
      lastQuestion: undefined,
      userId: dbSession.userId,
      status: 'IN_PROGRESS',
      recentHistory: rawHistory,
    };
  }

  const fillerAnalysis = analyzeFillerWords(content);

  // Build history for the AI (last 8 messages = 4 full turns of context)
  const history = [
    ...rawHistory,
    { role: 'CANDIDATE', content, timestamp: new Date() }
  ].slice(-8);

  const codeContext = code && language ? { code, language } : undefined;

  // ── Generate AI response (only truly blocking step) ────────────────────────
  const aiResponse = await generateInterviewerResponse(
    interviewSession.type,
    interviewSession.domain,
    interviewSession.difficulty,
    history as any,
    interviewSession.company,
    cachedCtx?.resumeData,
    codeContext
  );

  // ── CRITICAL: Await Redis update before returning ──────────────────────────
  // Vercel serverless terminates un-awaited promises the moment the HTTP response
  // is sent. If we don't await this, the AI permanently loses conversation context.
  const updatedHistory = [
    ...history,
    { role: 'INTERVIEWER', content: aiResponse.message, timestamp: new Date() }
  ].slice(-8);

  await setInterviewSession(sessionId, {
    ...cachedCtx,
    messageCount: (cachedCtx?.messageCount || 0) + 2,
    lastQuestion: aiResponse.question || cachedCtx?.lastQuestion,
    recentHistory: updatedHistory,
    status: aiResponse.interviewComplete ? 'COMPLETED' : 'IN_PROGRESS',
  });

  // ── Fire-and-forget: audit-only DB writes (safely dropped on cold kill) ─────
  Promise.all([
    prisma.message.create({
      data: {
        sessionId,
        role: 'CANDIDATE',
        content,
        metadata: {
          fillerWordCount: fillerAnalysis.count,
          fillerWords: fillerAnalysis.words,
          wordCount: content.split(' ').length,
        },
      },
    }),
    prisma.message.create({
      data: { sessionId, role: 'INTERVIEWER', content: aiResponse.message },
    }),
    aiResponse.interviewComplete
      ? prisma.interviewSession.update({
          where: { id: sessionId },
          data: { status: 'COMPLETED', completedAt: new Date() },
        })
      : Promise.resolve(),
  ]).catch(err => console.error('[DB] Background write error:', err));

  return NextResponse.json({
    interviewerMessage: { content: aiResponse.message },
    fillerAnalysis: { count: fillerAnalysis.count, words: fillerAnalysis.words },
    responseClassification: aiResponse.responseClassification || null,
    interviewComplete: aiResponse.interviewComplete,
  });
}
