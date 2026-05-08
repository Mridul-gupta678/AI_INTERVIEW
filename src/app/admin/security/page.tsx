import { prisma } from '@/lib/prisma';
import { Shield, ShieldAlert, Fingerprint, MapPin, Search } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminSecurityPage() {
  const adminLogs = await prisma.adminLog.findMany({
    include: {
      admin: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Security & Audit Logs</h1>
        <p className="text-[var(--text-secondary)] mt-2">Track admin actions, suspicious logins, and system security events.</p>
      </div>

      <div className="bg-[var(--bg-secondary)] border rounded-2xl overflow-hidden">
        <div className="p-4 border-b flex items-center gap-3 bg-[var(--bg-primary)]/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input 
              type="text" 
              placeholder="Filter audit logs..." 
              className="w-full bg-[var(--bg-primary)] border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[var(--text-secondary)]">
            <thead className="bg-[var(--bg-primary)]/50 text-[var(--text-muted)] uppercase text-xs border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Timestamp</th>
                <th className="px-6 py-4 font-medium">Admin</th>
                <th className="px-6 py-4 font-medium">Action</th>
                <th className="px-6 py-4 font-medium">Target ID</th>
                <th className="px-6 py-4 font-medium text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {adminLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[var(--bg-primary)]/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-[var(--text-primary)]">{new Date(log.createdAt).toLocaleDateString()}</div>
                    <div className="text-xs text-[var(--text-muted)]">{new Date(log.createdAt).toLocaleTimeString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-[var(--text-primary)]">{log.admin.name || 'System Admin'}</div>
                    <div className="text-xs text-[var(--text-muted)]">{log.admin.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[var(--bg-tertiary)] font-mono text-xs text-[var(--text-primary)]">
                      {log.action === 'SUSPEND_USER' && <ShieldAlert className="w-3 h-3 text-red-500" />}
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-[var(--text-muted)]">
                    {log.targetId || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 text-xs">
                      <MapPin className="w-3 h-3" />
                      {log.ipAddress || 'Unknown'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {adminLogs.length === 0 && (
            <div className="p-10 text-center flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center mb-2">
                <Shield className="w-5 h-5 text-[var(--text-muted)]" />
              </div>
              <p className="font-medium text-[var(--text-primary)]">No audit logs yet.</p>
              <p className="text-sm text-[var(--text-muted)]">Admin actions will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
