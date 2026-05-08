import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ProctoringEventType } from '@prisma/client';

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { eventType, description, screenshot } = body;

    if (!eventType) {
      return NextResponse.json({ error: 'eventType is required' }, { status: 400 });
    }

    // Ensure the session exists and belongs to the user
    const interviewSession = await prisma.interviewSession.findUnique({
      where: { id: params.sessionId },
    });

    if (!interviewSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // @ts-ignore - Ignoring type error if id is not strongly typed on DefaultSession
    if (interviewSession.userId !== session.user.id && (session as any).user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Save the proctoring log
    const proctoringLog = await prisma.proctoringLog.create({
      data: {
        sessionId: params.sessionId,
        eventType: eventType as ProctoringEventType,
        description,
        screenshot,
      },
    });

    // Update the warning count and integrity score on the interview session
    const currentWarningCount = interviewSession.warningCount + 1;
    
    // Decrease integrity score. E.g., -5 points per warning, max 0.
    let newScore = (interviewSession.integrityScore ?? 100) - 5;
    if (newScore < 0) newScore = 0;

    await prisma.interviewSession.update({
      where: { id: params.sessionId },
      data: {
        warningCount: currentWarningCount,
        integrityScore: newScore,
      },
    });

    return NextResponse.json({ 
      success: true, 
      proctoringLog,
      warningCount: currentWarningCount,
      integrityScore: newScore
    });

  } catch (error) {
    console.error('Failed to log proctoring event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin only
    if ((session as any).user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const logs = await prisma.proctoringLog.findMany({
      where: { sessionId: params.sessionId },
      orderBy: { timestamp: 'asc' },
    });

    const interviewSession = await prisma.interviewSession.findUnique({
      where: { id: params.sessionId },
      select: { integrityScore: true, warningCount: true }
    });

    return NextResponse.json({ logs, sessionMetrics: interviewSession });

  } catch (error) {
    console.error('Failed to fetch proctoring logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
