import { prisma } from '@/lib/prisma';
import { Search, Eye, PlayCircle, Code2, MessageSquare, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminInterviewsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || '';

  const interviews = await prisma.interviewSession.findMany({
    where: {
      OR: [
        { user: { name: { contains: query, mode: 'insensitive' } } },
        { user: { email: { contains: query, mode: 'insensitive' } } },
      ],
    },
    include: {
      user: {
        select: { name: true, email: true, image: true }
      },
      evaluation: {
        select: { overallScore: true, aiFlagged: true }
      },
      _count: {
        select: { messages: true, proctoringLogs: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Interview Sessions</h1>
          <p className="text-[var(--text-secondary)] mt-2">Monitor and replay all interviews conducted on the platform.</p>
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] border rounded-2xl overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b flex items-center gap-3 bg-[var(--bg-primary)]/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input 
              type="text" 
              placeholder="Search by candidate name or email..." 
              className="w-full bg-[var(--bg-primary)] border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
              defaultValue={query}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[var(--text-secondary)]">
            <thead className="bg-[var(--bg-primary)]/80 text-[var(--text-muted)] uppercase text-xs border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Candidate</th>
                <th className="px-6 py-4 font-medium">Domain & Level</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Integrity</th>
                <th className="px-6 py-4 font-medium">Score</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {interviews.map((session) => (
                <tr key={session.id} className="hover:bg-[var(--bg-primary)]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                        {session.user.image ? (
                          <img src={session.user.image} alt="" className="w-8 h-8 rounded-full" />
                        ) : (
                          <span className="font-bold text-red-500 text-xs">{session.user.name?.[0] || session.user.email[0].toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-[var(--text-primary)]">
                          {session.user.name || 'Unnamed'}
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">{session.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-[var(--text-primary)] flex items-center gap-1.5">
                        {session.type === 'CODING' ? <Code2 className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                        {session.domain.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-semibold text-[var(--text-muted)] uppercase">{session.difficulty}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      session.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 
                      session.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-gray-500/10 text-gray-500'
                    }`}>
                      {session.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {session.integrityScore !== null ? (
                      <div className="flex flex-col gap-1">
                        <span className={`font-bold ${
                          session.integrityScore >= 90 ? 'text-green-500' : 
                          session.integrityScore >= 70 ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          {session.integrityScore}%
                        </span>
                        {session._count.proctoringLogs > 0 && (
                          <span className="text-[10px] text-red-400 font-medium">
                            {session._count.proctoringLogs} Flags
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[var(--text-muted)] italic">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {session.evaluation ? (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--text-primary)]">{Math.round(session.evaluation.overallScore)}%</span>
                        {session.evaluation.aiFlagged && (
                          <span title="Flagged by AI Quality Control">
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[var(--text-muted)] italic">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/interview/${session.id}`}
                      target="_blank"
                      className="inline-flex items-center justify-center p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors text-[var(--text-muted)]"
                      title="Replay Interview"
                    >
                      <PlayCircle className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {interviews.length === 0 && (
            <div className="p-10 text-center text-[var(--text-muted)]">
              No interviews found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
