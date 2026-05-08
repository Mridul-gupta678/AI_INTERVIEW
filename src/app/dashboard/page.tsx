// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  AreaChart, Area, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Plus, Brain, TrendingUp, Target, Clock, ChevronRight,
  BarChart3, Star, Zap, ArrowUpRight, CheckCircle2, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { DOMAIN_CONFIG } from '@/types';

interface Analytics {
  totalSessions: number;
  completedSessions: number;
  avgOverallScore: number;
  avgTechnicalScore: number;
  avgCommunicationScore: number;
  scoreHistory: Array<{ date: string; score: number; domain: string }>;
  domainScores: Record<string, number>;
  topStrengths: string[];
  topWeaknesses: string[];
}

interface RecentSession {
  id: string;
  domain: string;
  difficulty: string;
  completedAt: string;
  evaluation?: { overallScore: number; technicalScore: number };
}

const SCORE_COLOR = (s: number) =>
  s >= 75 ? 'var(--success)' : s >= 50 ? 'var(--warning)' : 'var(--danger)';

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }
});

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111827]/90 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-2xl">
        <p className="text-xs text-slate-400 mb-1">{label}</p>
        <p className="text-sm font-bold text-white">Score: <span className="text-indigo-400">{payload[0].value}%</span></p>
        {payload[0].payload.domain && <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">{payload[0].payload.domain.replace('_', ' ')}</p>}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(data => {
        setAnalytics(data.analytics);
        setRecentSessions(data.recentSessions || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const radarData = analytics?.domainScores
    ? Object.entries(analytics.domainScores).map(([domain, score]) => ({
        domain: domain.replace('_', ' '),
        score,
        fullMark: 100,
      }))
    : [];

  const scoreChartData = analytics?.scoreHistory
    ?.slice(-20)
    .map(p => ({ date: format(parseISO(p.date), 'MMM d'), score: Math.round(p.score), domain: p.domain }))
    || [];

  const firstName = session?.user?.name?.split(' ')[0] || 'there';

  const statCards = [
    {
      label: 'Total Sessions',
      value: analytics?.totalSessions ?? 0,
      suffix: '',
      icon: Brain,
      color: 'var(--brand)',
      bg: 'var(--brand-light)',
      trend: 'Lifetime activity',
      up: null,
    },
    {
      label: 'Avg Score',
      value: Math.round(analytics?.avgOverallScore ?? 0),
      suffix: '%',
      icon: Star,
      color: 'var(--warning)',
      bg: 'var(--warning-light)',
      trend: 'Overall performance',
      up: true,
    },
    {
      label: 'Completed',
      value: analytics?.completedSessions ?? 0,
      suffix: '',
      icon: CheckCircle2,
      color: 'var(--success)',
      bg: 'var(--success-light)',
      trend: 'Finished interviews',
      up: null,
    },
    {
      label: 'Technical',
      value: Math.round(analytics?.avgTechnicalScore ?? 0),
      suffix: '%',
      icon: Zap,
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.1)',
      trend: 'Core competency',
      up: null,
    },
  ];

  return (
    <div className="page-container relative z-10">
      {/* Header */}
      <motion.div {...fade(0)} className="page-header">
        <div>
          <h1 className="page-title">
            Good morning, {firstName} 👋
          </h1>
          <p className="page-subtitle">Welcome to your hiring intelligence dashboard.</p>
        </div>
        <Link href="/interview/setup" className="btn-primary">
          <Plus className="w-4 h-4" />
          New Interview
        </Link>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {statCards.map(({ label, value, suffix, icon: Icon, color, bg, trend, up }, i) => (
          <motion.div key={label} {...fade(i * 0.1)} className="card-hover p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ background: bg, borderColor: color.replace('var(', 'rgba(').replace(')', ',0.2)') }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              {up !== null && (
                <span className="bg-white/5 border border-white/10 p-1.5 rounded-lg flex items-center justify-center">
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-white tracking-tight mb-1">
              {loading ? '—' : `${value}${suffix}`}
            </p>
            <p className="text-sm text-slate-400 font-medium">{label}</p>
            <p className="text-xs mt-2 font-light text-slate-500">{trend}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Score History */}
        <motion.div {...fade(0.3)} className="card lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                Score Progression
              </h2>
              <p className="text-sm text-slate-400 mt-1 font-light">Your technical and overall interview performance over time.</p>
            </div>
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
              {['Week', 'Month', 'Year'].map((t, i) => (
                <button key={t}
                  className={`px-4 py-1.5 text-xs rounded-lg font-medium transition-all ${i === 1 ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'text-slate-400 hover:text-white'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {scoreChartData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-slate-500" />
              </div>
              <p className="text-sm text-slate-400 font-light text-center max-w-xs">No analytics available yet. Complete your first interview to generate insights.</p>
            </div>
          ) : (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scoreChartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"  stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="score" stroke="#8b5cf6" fill="url(#scoreGrad)" strokeWidth={3} activeDot={{ r: 6, fill: '#fff', stroke: '#8b5cf6', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Domain Radar */}
        <motion.div {...fade(0.4)} className="card">
          <h2 className="text-lg font-semibold text-white tracking-tight mb-2 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-400" />
            Domain Matrix
          </h2>
          <p className="text-sm text-slate-400 font-light mb-6">Technical coverage footprint.</p>
          {radarData.length === 0 ? (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm text-slate-500 font-light text-center px-4">Complete interviews across domains to build your matrix.</p>
            </div>
          ) : (
            <div className="h-[260px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="domain" tick={{ fontSize: 10, fill: '#cbd5e1' }} />
                  <Radar dataKey="score" stroke="#8b5cf6" fill="#6366f1" fillOpacity={0.3} strokeWidth={2} />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Strengths & Weaknesses */}
        <motion.div {...fade(0.5)} className="card">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white tracking-tight">Performance Profile</h2>
            <p className="text-sm text-slate-400 font-light mt-1">Aggregated AI analysis across all sessions.</p>
          </div>

          {(!analytics?.topStrengths?.length && !analytics?.topWeaknesses?.length) ? (
            <div className="py-12 text-center flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                <Target className="w-6 h-6 text-slate-500" />
              </div>
              <p className="text-sm text-slate-400 font-light">Insufficient data to generate profile.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {analytics?.topStrengths?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Demonstrated Strengths</p>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {analytics.topStrengths.map(s => (
                      <span key={s} className="badge badge-green font-normal text-xs">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {analytics?.topWeaknesses?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Friction Areas</p>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {analytics.topWeaknesses.map(w => (
                      <span key={w} className="badge badge-red font-normal text-xs">{w}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-white/5">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4">Domain Metrics</p>
                <div className="space-y-4">
                  {Object.entries(analytics?.domainScores || {}).slice(0, 4).map(([domain, score]) => (
                    <div key={domain} className="flex items-center gap-4">
                      <span className="text-xs text-slate-400 w-28 truncate font-medium uppercase tracking-wider">
                        {domain.replace('_', ' ')}
                      </span>
                      <div className="flex-1 h-2 bg-[#0B1020] rounded-full overflow-hidden border border-white/5 relative">
                        <div
                          className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ 
                            width: `${score}%`, 
                            background: `linear-gradient(90deg, ${SCORE_COLOR(score)}40, ${SCORE_COLOR(score)})`,
                            boxShadow: `0 0 10px ${SCORE_COLOR(score)}40`
                          }}
                        />
                      </div>
                      <span className="text-xs font-bold w-10 text-right" style={{ color: SCORE_COLOR(score) }}>
                        {Math.round(score)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Recent Sessions */}
        <motion.div {...fade(0.6)} className="card">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                Recent History
              </h2>
              <p className="text-sm text-slate-400 mt-1 font-light">Latest evaluations.</p>
            </div>
            <Link href="/dashboard/history" className="btn-ghost px-3 py-1.5 text-xs">
              View all
            </Link>
          </div>

          {recentSessions.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                <Brain className="w-6 h-6 text-slate-500" />
              </div>
              <p className="text-sm text-slate-400 font-light">No recorded sessions.</p>
              <Link href="/interview/setup" className="btn-secondary text-xs py-2 px-5 mt-2">Start a session</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSessions.slice(0, 5).map((s) => {
                const score = s.evaluation?.overallScore ?? 0;
                const domainCfg = DOMAIN_CONFIG[s.domain as keyof typeof DOMAIN_CONFIG];
                return (
                  <Link
                    key={s.id}
                    href={`/interview/${s.id}/results`}
                    className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 bg-[#0B1020] border border-white/5 shadow-inner">
                      {domainCfg?.icon || '🧠'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-200 truncate tracking-tight mb-0.5">
                        {domainCfg?.label || s.domain}
                      </p>
                      <p className="text-[11px] uppercase tracking-widest text-slate-500 font-medium">
                        {s.difficulty} · {s.completedAt ? format(new Date(s.completedAt), 'MMM d, yyyy') : 'In progress'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="badge font-bold px-3 py-1 text-xs border border-white/5"
                            style={{ color: SCORE_COLOR(score), background: `${SCORE_COLOR(score)}15` }}>
                        {score}%
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
