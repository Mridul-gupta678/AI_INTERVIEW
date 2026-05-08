import { prisma } from '@/lib/prisma';
import { Camera, ShieldAlert, ShieldCheck, Activity, Users, EyeOff, LayoutTemplate } from 'lucide-react';
import { SnapshotViewer } from './SnapshotViewer';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminProctoringPage() {
  // Fetch recent proctoring logs
  const proctoringLogs = await prisma.proctoringLog.findMany({
    include: {
      session: {
        include: {
          user: { select: { name: true, email: true } }
        }
      }
    },
    orderBy: { timestamp: 'desc' },
    take: 50,
  });

  // Fetch recent completed/abandoned sessions to calculate aggregate integrity stats
  const recentSessions = await prisma.interviewSession.findMany({
    where: {
      status: { in: ['COMPLETED', 'ABANDONED'] },
      integrityScore: { not: null }
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const avgIntegrityScore = recentSessions.length > 0
    ? recentSessions.reduce((acc, curr) => acc + (curr.integrityScore || 100), 0) / recentSessions.length
    : 100;

  const severelyFlaggedCount = recentSessions.filter(s => (s.integrityScore || 100) < 70).length;
  const totalViolations = proctoringLogs.length;

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'TAB_SWITCH': return <LayoutTemplate className="w-4 h-4 text-orange-500" />;
      case 'LOOK_AWAY': return <EyeOff className="w-4 h-4 text-yellow-500" />;
      case 'MULTIPLE_FACES': return <Users className="w-4 h-4 text-red-500" />;
      case 'NO_FACE': return <Camera className="w-4 h-4 text-slate-500" />;
      default: return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'MULTIPLE_FACES': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'TAB_SWITCH': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'LOOK_AWAY': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'NO_FACE': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Proctoring & Anti-Cheat</h1>
        <p className="text-[var(--text-secondary)] mt-2">Visualize candidate integrity scores, webcam snapshots, and system violations.</p>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-[var(--bg-secondary)] border border-emerald-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)] font-medium">Avg Integrity Score</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{Math.round(avgIntegrityScore)} / 100</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] border border-red-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)] font-medium">Severely Flagged Sessions</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{severelyFlaggedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] border border-blue-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)] font-medium">Recent Violations</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{totalViolations}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Proctoring Log Feed */}
      <div className="bg-[var(--bg-secondary)] border rounded-2xl overflow-hidden">
        <div className="p-4 border-b bg-[var(--bg-primary)]/50">
          <h2 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Camera className="w-4 h-4 text-blue-500" /> Recent Proctoring Snapshots
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[var(--text-secondary)]">
            <thead className="bg-[var(--bg-primary)]/50 text-[var(--text-muted)] uppercase text-xs border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Timestamp</th>
                <th className="px-6 py-4 font-medium">Candidate</th>
                <th className="px-6 py-4 font-medium">Violation Event</th>
                <th className="px-6 py-4 font-medium">Visual Evidence</th>
                <th className="px-6 py-4 font-medium text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {proctoringLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[var(--bg-primary)]/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-[var(--text-primary)]">{new Date(log.timestamp).toLocaleDateString()}</div>
                    <div className="text-xs text-[var(--text-muted)]">{new Date(log.timestamp).toLocaleTimeString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-[var(--text-primary)]">{log.session.user.name || 'Unnamed'}</div>
                    <Link href={`/admin/users?email=${log.session.user.email}`} className="text-xs text-blue-400 hover:underline">
                      {log.session.user.email}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-mono text-xs font-semibold ${getEventColor(log.eventType)}`}>
                      {getEventIcon(log.eventType)}
                      {log.eventType.replace('_', ' ')}
                    </span>
                    <div className="text-xs mt-1 text-[var(--text-muted)] max-w-xs truncate">
                      {log.description}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {/* Render Snapshot Viewer if screenshot is present, else text fallback */}
                    <SnapshotViewer 
                      screenshotUrl={log.screenshot} 
                      eventName={log.eventType} 
                      timestamp={log.timestamp} 
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/interview/${log.sessionId}/results`}
                      target="_blank"
                      className="text-xs text-[var(--text-muted)] hover:text-white transition-colors underline decoration-dotted"
                    >
                      View Session
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {proctoringLogs.length === 0 && (
            <div className="p-10 text-center flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center mb-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="font-medium text-[var(--text-primary)]">Clean record!</p>
              <p className="text-sm text-[var(--text-muted)]">No proctoring violations have been logged yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
