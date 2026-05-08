import { prisma } from '@/lib/prisma';
import { AnalyticsCharts } from '@/components/admin/AnalyticsCharts';
import { Users, Database, Activity, TrendingUp, UserCheck, ShieldAlert } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  // Fetch high-level stats
  const totalUsers = await prisma.user.count();
  const totalInterviews = await prisma.interviewSession.count();
  
  // Aggregate evaluation scores
  const evaluations = await prisma.evaluation.findMany({
    select: { overallScore: true, aiLatencyMs: true, aiTokensUsed: true }
  });
  
  const avgScore = evaluations.length > 0 
    ? evaluations.reduce((acc, curr) => acc + curr.overallScore, 0) / evaluations.length 
    : 0;

  const totalTokens = evaluations.reduce((acc, curr) => acc + (curr.aiTokensUsed || 0), 0);
  const avgLatency = evaluations.length > 0 
    ? evaluations.reduce((acc, curr) => acc + (curr.aiLatencyMs || 0), 0) / evaluations.length 
    : 0;

  // Active users (users who created an account or had an interview in the last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const activeUsers = await prisma.user.count({
    where: {
      sessions: {
        some: {
          createdAt: { gte: sevenDaysAgo }
        }
      }
    }
  });

  const cards = [
    { label: 'Total Users', value: totalUsers.toLocaleString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Active Users (7d)', value: activeUsers.toLocaleString(), icon: UserCheck, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Total Interviews', value: totalInterviews.toLocaleString(), icon: Database, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Avg Interview Score', value: `${Math.round(avgScore)}%`, icon: TrendingUp, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { label: 'AI Tokens Used', value: (totalTokens / 1000).toFixed(1) + 'k', icon: Activity, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { label: 'Avg AI Latency', value: `${Math.round(avgLatency)}ms`, icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-500/10' },
  ];

  // Group interviews by day of week for the last 7 days
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  
  const recentInterviews = await prisma.interviewSession.findMany({
    where: { createdAt: { gte: last7Days } },
    select: { createdAt: true }
  });

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const activityMap = new Map<string, number>();
  
  // Initialize map
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    activityMap.set(daysOfWeek[d.getDay()], 0);
  }

  recentInterviews.forEach(session => {
    const dayName = daysOfWeek[session.createdAt.getDay()];
    if (activityMap.has(dayName)) {
      activityMap.set(dayName, activityMap.get(dayName)! + 1);
    }
  });

  const activityData = Array.from(activityMap.entries()).map(([name, interviews]) => ({ name, interviews }));


  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Global Analytics</h1>
        <p className="text-[var(--text-secondary)] mt-2">Monitor platform growth, user engagement, and AI performance.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-[var(--bg-secondary)] border rounded-2xl p-4 flex flex-col items-center text-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${card.bg}`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{card.value}</p>
            <p className="text-xs text-[var(--text-muted)] font-medium mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-secondary)] border rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Interviews per Day</h2>
          <AnalyticsCharts data={activityData} type="area" dataKey="interviews" />
        </div>
        
        <div className="bg-[var(--bg-secondary)] border rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Platform Growth</h2>
          <AnalyticsCharts data={activityData} type="bar" dataKey="interviews" />
        </div>
      </div>
    </div>
  );
}
