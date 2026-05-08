'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  ShieldAlert, Users, Activity, Settings, LogOut, Moon, Sun, 
  ChevronDown, LayoutDashboard, CreditCard, Shield, Menu, X, Database, Camera
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import toast from 'react-hot-toast';

const ADMIN_NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/interviews', label: 'Interviews', icon: Database },
  { href: '/admin/ai-monitoring', label: 'AI Monitoring', icon: Activity },
  { href: '/admin/billing', label: 'Billing', icon: CreditCard },
  { href: '/admin/security', label: 'Security', icon: Shield },
  { href: '/admin/proctoring', label: 'Proctoring', icon: Camera },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleAdminLogout = async () => {
    try {
      setIsLoggingOut(true);
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Logged out from admin panel');
        router.push('/admin-login');
      } else {
        toast.error('Failed to logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('An error occurred');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-[var(--bg-primary)]">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-5 py-4 border-b bg-[var(--bg-secondary)] shrink-0 z-40 relative">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-[var(--text-primary)]">Admin Panel</span>
        </Link>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-[var(--text-primary)] p-1">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-20"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        absolute md:static z-30 top-[73px] md:top-0 left-0 bottom-0
        w-60 shrink-0 border-r bg-[var(--bg-secondary)] flex flex-col
        transition-transform duration-200 ease-in-out
      `}>
        {/* Logo */}
        <div className="px-5 py-5 border-b hidden md:block">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[var(--text-primary)] tracking-tight">Admin Portal</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 mb-2">
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Management</span>
          </div>
          {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="px-3 py-4 border-t space-y-2 bg-[var(--bg-secondary)]">
          {/* Back to App */}
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--border)] transition-all font-medium"
          >
            Return to App
          </Link>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all"
          >
            {resolvedTheme === 'dark'
              ? <><Sun className="w-4 h-4" /> Light Mode</>
              : <><Moon className="w-4 h-4" /> Dark Mode</>
            }
          </button>

          {/* Admin Logout */}
          <button
            onClick={handleAdminLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="w-4 h-4" /> Exit Admin Panel
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto relative z-10 bg-[var(--bg-primary)]">
        {children}
      </main>
    </div>
  );
}
