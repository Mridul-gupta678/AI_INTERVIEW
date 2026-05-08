import { prisma } from '@/lib/prisma';
import { Search, MoreVertical, Ban, ShieldCheck, Mail, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || '';

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: {
      profile: true,
      _count: {
        select: { sessions: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">User Management</h1>
          <p className="text-[var(--text-secondary)] mt-2">Manage all registered users on the platform.</p>
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] border rounded-2xl overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            {/* We'll just use a basic input for now. In a real app this would be a Client Component that updates the URL. */}
            <input 
              type="text" 
              placeholder="Search users by name or email..." 
              className="w-full bg-[var(--bg-primary)] border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
              defaultValue={query}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[var(--text-secondary)]">
            <thead className="bg-[var(--bg-primary)]/50 text-[var(--text-muted)] uppercase text-xs border-b">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role & Plan</th>
                <th className="px-6 py-4 font-medium">Interviews</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-[var(--bg-primary)]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                        {user.image ? (
                          <img src={user.image} alt="" className="w-10 h-10 rounded-full" />
                        ) : (
                          <span className="font-bold text-red-500">{user.name?.[0] || user.email[0].toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-[var(--text-primary)] flex items-center gap-2">
                          {user.name || 'Unnamed User'}
                          {user.role === 'ADMIN' && <ShieldAlert className="w-3.5 h-3.5 text-red-500" />}
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium w-fit ${
                        user.role === 'ADMIN' ? 'bg-red-500/10 text-red-500' : 'bg-gray-500/10 text-gray-500'
                      }`}>
                        {user.role}
                      </span>
                      <span className="text-xs font-semibold text-green-500 uppercase tracking-wider">{user.plan}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-[var(--text-primary)]">{user._count.sessions}</div>
                    <div className="text-xs text-[var(--text-muted)]">Total Sessions</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors text-[var(--text-muted)]">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {users.length === 0 && (
            <div className="p-10 text-center text-[var(--text-muted)]">
              No users found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
