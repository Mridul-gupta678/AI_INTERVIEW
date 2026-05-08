import { prisma } from '@/lib/prisma';
import { Activity, AlertTriangle, Zap, BrainCircuit, Flag, PlayCircle } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminAiMonitoringPage() {
  const evaluations = await prisma.evaluation.findMany({
    include: {
      session: {
        include: {
          user: { select: { name: true, email: true, image: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const flaggedEvals = evaluations.filter(e => e.aiFlagged || e.overallScore < 20 || e.overallScore > 98);
  
  const totalTokens = evaluations.reduce((acc, curr) => acc + (curr.aiTokensUsed || 0), 0);
  const avgLatency = evaluations.length > 0 
    ? evaluations.reduce((acc, curr) => acc + (curr.aiLatencyMs || 0), 0) / evaluations.length 
    : 0;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">AI Quality Monitoring</h1>
        <p className="text-[var(--text-secondary)] mt-2">Monitor model latency, token usage, and detect hallucinations or poor scoring.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-[var(--bg-secondary)] border border-pink-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center">
              <BrainCircuit className="w-6 h-6 text-pink-500" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)] font-medium">Total Tokens Used</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{(totalTokens / 1000).toFixed(1)}k</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] border border-blue-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)] font-medium">Average Latency</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{Math.round(avgLatency)}ms</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] border border-yellow-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)] font-medium">Flagged Evaluations</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{flaggedEvals.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] border rounded-2xl overflow-hidden">
        <div className="p-4 border-b bg-[var(--bg-primary)]/50">
          <h2 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Flag className="w-4 h-4 text-yellow-500" /> Flagged & Suspicious Evaluations
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[var(--text-secondary)]">
            <thead className="bg-[var(--bg-primary)]/50 text-[var(--text-muted)] uppercase text-xs border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Interview</th>
                <th className="px-6 py-4 font-medium">Tokens / Latency</th>
                <th className="px-6 py-4 font-medium">Score</th>
                <th className="px-6 py-4 font-medium">Reason</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {flaggedEvals.map((evalRecord) => (
                <tr key={evalRecord.id} className="hover:bg-[var(--bg-primary)]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-[var(--text-primary)]">{evalRecord.session.user.name || 'Unnamed'}</div>
                    <div className="text-xs text-[var(--text-muted)]">{new Date(evalRecord.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[var(--text-primary)]">{evalRecord.aiTokensUsed || 0} tokens</div>
                    <div className="text-xs text-[var(--text-muted)]">{evalRecord.aiLatencyMs || 0}ms</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-[var(--text-primary)]">
                    {Math.round(evalRecord.overallScore)}%
                  </td>
                  <td className="px-6 py-4">
                    {evalRecord.aiFlagged ? (
                      <span className="text-red-500 text-xs font-medium bg-red-500/10 px-2 py-1 rounded">Manual Flag</span>
                    ) : evalRecord.overallScore < 20 ? (
                      <span className="text-yellow-500 text-xs font-medium bg-yellow-500/10 px-2 py-1 rounded">Suspiciously Low</span>
                    ) : (
                      <span className="text-orange-500 text-xs font-medium bg-orange-500/10 px-2 py-1 rounded">Suspiciously High</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/interview/${evalRecord.sessionId}`}
                      target="_blank"
                      className="inline-flex items-center justify-center p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors text-[var(--text-muted)]"
                    >
                      <PlayCircle className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {flaggedEvals.length === 0 && (
            <div className="p-10 text-center text-emerald-500 flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
                <Activity className="w-5 h-5" />
              </div>
              <p className="font-medium">All systems normal.</p>
              <p className="text-sm opacity-80">No suspicious evaluations detected.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
