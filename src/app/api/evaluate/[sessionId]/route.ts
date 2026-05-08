// src/app/api/evaluate/[sessionId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { evaluateInterview } from '@/services/ai.service';
import { cacheSet } from '@/lib/redis';
import { sendInterviewResultEmail } from '@/lib/email';

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { sessionId } = params;

  // Fetch session with all messages
  const interviewSession = await prisma.interviewSession.findFirst({
    where: { id: sessionId, userId },
    include: { messages: { orderBy: { timestamp: 'asc' } } },
  });

  if (!interviewSession) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  // Check if already evaluated
  const existing = await prisma.evaluation.findUnique({ where: { sessionId } });
  if (existing) {
    return NextResponse.json({ evaluation: existing });
  }

  // Run AI evaluation
  const evalResult = await evaluateInterview(
    interviewSession.messages as any,
    interviewSession.domain,
    interviewSession.difficulty
  );

  // Save evaluation to DB
  const evaluation = await prisma.evaluation.create({
    data: {
      sessionId,
      overallScore: evalResult.overallScore,
      technicalScore: evalResult.technicalScore,
      communicationScore: evalResult.communicationScore,
      confidenceScore: evalResult.confidenceScore,
      clarityScore: evalResult.clarityScore,
      strengths: evalResult.strengths,
      weaknesses: evalResult.weaknesses,
      improvements: evalResult.improvements,
      summary: evalResult.summary,
      detailedReport: evalResult as any,
    },
  });

  // Update session status
  await prisma.interviewSession.update({
    where: { id: sessionId },
    data: { status: 'COMPLETED', completedAt: new Date() },
  });

  // Update user analytics
  await updateUserAnalytics(userId, evalResult, interviewSession.domain);

  // Cache evaluation
  await cacheSet(`eval:${sessionId}`, evaluation, 86400);

  // Send result email (await it so Vercel serverless function doesn't kill it prematurely)
  if (session.user?.email) {
    try {
      await sendInterviewResultEmail({
        to: session.user.email,
        userName: session.user.name || 'Candidate',
        sessionId,
        evaluation: {
          ...evalResult,
          hireable: evalResult.hireable ?? false,
          seniorityFit: evalResult.seniorityFit ?? 'junior',
        },
        domain: interviewSession.domain,
        difficulty: interviewSession.difficulty,
      });
    } catch (err) {
      console.error('[Email] Send failed:', err);
    }
  }

  return NextResponse.json({ evaluation, hireable: evalResult.hireable });
}

async function updateUserAnalytics(
  userId: string,
  evalResult: any,
  domain: string
) {
  const analytics = await prisma.analytics.findUnique({ where: { userId } });
  
  const newTotal = (analytics?.totalSessions || 0) + 1;
  const newCompleted = (analytics?.completedSessions || 0) + 1;
  const newAvgOverall = analytics
    ? (analytics.avgOverallScore * analytics.completedSessions + evalResult.overallScore) / newCompleted
    : evalResult.overallScore;

  const scoreHistory = (analytics?.scoreHistory as any[] || []);
  scoreHistory.push({
    date: new Date().toISOString(),
    score: evalResult.overallScore,
    domain,
  });

  const domainScores = (analytics?.domainScores as Record<string, number> || {});
  domainScores[domain] = evalResult.technicalScore || evalResult.overallScore;

  await prisma.analytics.upsert({
    where: { userId },
    create: {
      userId,
      totalSessions: 1,
      completedSessions: 1,
      avgOverallScore: evalResult.overallScore,
      avgTechnicalScore: evalResult.technicalScore || 0,
      avgCommunicationScore: evalResult.communicationScore || 0,
      scoreHistory: [{ date: new Date().toISOString(), score: evalResult.overallScore, domain }],
      domainScores: { [domain]: evalResult.technicalScore || evalResult.overallScore },
      topStrengths: evalResult.strengths.slice(0, 3),
      topWeaknesses: evalResult.weaknesses.slice(0, 3),
      updatedAt: new Date(),
    },
    update: {
      totalSessions: newTotal,
      completedSessions: newCompleted,
      avgOverallScore: Math.round(newAvgOverall * 10) / 10,
      avgTechnicalScore: evalResult.technicalScore || 0,
      avgCommunicationScore: evalResult.communicationScore || 0,
      scoreHistory: scoreHistory.slice(-50), // keep last 50
      domainScores,
      topStrengths: evalResult.strengths.slice(0, 3),
      topWeaknesses: evalResult.weaknesses.slice(0, 3),
      updatedAt: new Date(),
    },
  });

  // Update profile too
  await prisma.profile.updateMany({
    where: { userId },
    data: {
      totalSessions: newTotal,
      avgScore: Math.round(newAvgOverall * 10) / 10,
      lastActiveAt: new Date(),
    },
  });
}
