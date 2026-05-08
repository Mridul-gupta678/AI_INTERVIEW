// src/app/dashboard/layout.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Brain, LayoutDashboard, Plus, History, BarChart3,
  Settings, LogOut, Bell, ChevronDown, Moon, Sun,
  Sparkles
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';

const NAV = [
  { href: '/dashboard',            icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/history',    icon: History,         label: 'History' },
  { href: '/dashboard/analytics',  icon: BarChart3,       label: 'Analytics' },
  { href: '/interview/setup',      icon: Plus,            label: 'New Interview', isCTA: true },
];

const BOTTOM_NAV = [
  { href: '/dashboard/settings',   icon: Settings,        label: 'Settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const firstName = session?.user?.name?.split(' ')[0] || 'User';

  return (
    <div className="flex min-h-screen bg-[#030712] text-slate-200 font-sans selection:bg-indigo-500/30">
      
      {/* ── Premium Sidebar Navigation ── */}
      <aside className="w-20 lg:w-[84px] shrink-0 border-r border-white/5 bg-[#070b14]/80 backdrop-blur-2xl flex flex-col items-center py-6 z-40 relative">
        {/* Animated Background Glow */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent opacity-50 pointer-events-none" />

        {/* Logo */}
        <div className="mb-8 relative group">
          <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Link href="/dashboard" className="relative w-12 h-12 rounded-2xl bg-gradient-to-b from-[#1e293b] to-[#0f172a] border border-white/10 flex items-center justify-center shadow-lg group-hover:border-indigo-500/30 transition-all duration-300">
            <Brain className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform duration-500" />
          </Link>
        </div>

        {/* Divider */}
        <div className="w-8 h-px bg-white/5 mb-6" />

        {/* Primary Nav */}
        <nav className="flex flex-col gap-3 w-full items-center flex-1">
          {NAV.map(({ href, icon: Icon, label, isCTA }) => {
            const active = pathname === href || (href !== '/dashboard' && href !== '/interview/setup' && pathname.startsWith(href));
            
            return (
              <div key={href} className="relative group w-full flex justify-center">
                <Link
                  href={href}
                  className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 z-10
                    ${isCTA 
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.6)] hover:scale-105' 
                      : active 
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                    }`}
                >
                  <Icon className={`w-5 h-5 ${isCTA ? '' : active ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-300`} />
                  
                  {/* Tooltip */}
                  <span className="absolute left-16 px-3 py-1.5 bg-[#1e293b] text-slate-200 text-xs font-medium rounded-lg border border-white/10 shadow-xl opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap z-50">
                    {label}
                  </span>
                </Link>
                {/* Active Indicator Line */}
                {active && !isCTA && (
                  <motion.div 
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                  />
                )}
              </div>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="w-8 h-px bg-white/5 my-4" />

        {/* Bottom Nav */}
        <div className="flex flex-col gap-3 items-center">
          {BOTTOM_NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname.startsWith(href);
            return (
              <div key={href} className="relative group w-full flex justify-center">
                <Link
                  href={href}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
                    ${active 
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                    }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'scale-110' : 'group-hover:scale-110'} transition-transform duration-300`} />
                  <span className="absolute left-16 px-3 py-1.5 bg-[#1e293b] text-slate-200 text-xs font-medium rounded-lg border border-white/10 shadow-xl opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap z-50">
                    {label}
                  </span>
                </Link>
              </div>
            );
          })}

          <div className="relative group w-full flex justify-center">
            <button className="w-12 h-12 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all duration-300">
              <Bell className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#070b14]" />
              <span className="absolute left-16 px-3 py-1.5 bg-[#1e293b] text-slate-200 text-xs font-medium rounded-lg border border-white/10 shadow-xl opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 whitespace-nowrap z-50">
                Notifications
              </span>
            </button>
          </div>

          <div className="relative mt-2">
            <button
              onClick={() => setProfileOpen(v => !v)}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/10 hover:border-indigo-500/50 hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all duration-300 group"
            >
              {session?.user?.image
                ? <img src={session.user.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-inner group-hover:scale-110 transition-transform duration-500">
                    {firstName.charAt(0).toUpperCase()}
                  </div>
                )
              }
            </button>

            <AnimatePresence>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-14 bottom-0 z-50 bg-[#1e293b]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 w-56"
                  >
                    <div className="px-3 py-3 mb-1 bg-white/5 rounded-xl border border-white/5">
                      <p className="text-sm font-semibold text-white truncate">{session?.user?.name}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{session?.user?.email}</p>
                    </div>
                    <div className="mt-2">
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0 relative h-screen overflow-hidden">
        {/* Global ambient background for all pages */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-slate-900/5 to-transparent opacity-50" />
        </div>
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto z-10 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/5 hover:scrollbar-thumb-white/10">
          {children}
        </main>
      </div>
    </div>
  );
}
