// src/app/api/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cacheGet, cacheSet } from '@/lib/redis';
import { generateAnalyticsInsights } from '@/services/ai.service';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const cacheKey = `analytics:${userId}`;

  // Try cache first
  const cached = await cacheGet(cacheKey);
  if (cached) return NextResponse.json(cached);

  const [analytics, recentSessions] = await Promise.all([
    prisma.analytics.findUnique({ where: { userId } }),
    prisma.interviewSession.findMany({
      where: { userId, status: 'COMPLETED' },
      include: { evaluation: true },
      orderBy: { completedAt: 'desc' },
      take: 5,
    }),
  ]);

  // Build weekly activity heatmap (last 12 weeks)
  const twelveWeeksAgo = new Date();
  twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);
  
  const activitySessions = await prisma.interviewSession.findMany({
    where: {
      userId,
      createdAt: { gte: twelveWeeksAgo },
    },
    select: { createdAt: true },
  });

  const activityMap: Record<string, number> = {};
  activitySessions.forEach(s => {
    const day = s.createdAt.toISOString().split('T')[0];
    activityMap[day] = (activityMap[day] || 0) + 1;
  });

  const response = {
    analytics: analytics || {
      totalSessions: 0,
      completedSessions: 0,
      avgOverallScore: 0,
      avgTechnicalScore: 0,
      avgCommunicationScore: 0,
      scoreHistory: [],
      domainScores: {},
      topStrengths: [],
      topWeaknesses: [],
    },
    recentSessions,
    weeklyActivity: Object.entries(activityMap).map(([date, count]) => ({ date, count })),
  };

  const insights = await generateAnalyticsInsights(response.analytics, (response.analytics.scoreHistory as any[]) || []);
  (response as any).insights = insights;

  await cacheSet(cacheKey, response, 300); // 5 min cache

  return NextResponse.json(response);
}
