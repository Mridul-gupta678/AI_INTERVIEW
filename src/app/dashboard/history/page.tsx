// src/app/dashboard/history/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format, isThisWeek, subDays, isSameWeek } from 'date-fns';
import { 
  Search, Brain, Calendar, Award, Flame, ChevronRight, 
  Clock, Activity, BarChart2, TrendingUp, Zap, Sparkles, Target, CheckCircle2, CircleDashed
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { DOMAIN_CONFIG } from '@/types';

const getSemanticColor = (s: number) => {
  if (s >= 85) return '#10b981';
  if (s >= 70) return '#6366f1';
  if (s >= 50) return '#f59e0b';
  return '#f43f5e';
};

const ScoreRing = ({ score }: { score: number }) => {
  const color = getSemanticColor(score);
  return (
    <div className="relative w-14 h-14 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="16" fill="none" className="stroke-white/5" strokeWidth="2.5" />
        <motion.circle 
          initial={{ strokeDashoffset: 100 }}
          animate={{ strokeDashoffset: 100 - score }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          cx="18" cy="18" r="16" fill="none" strokeWidth="2.5" strokeDasharray="100" strokeLinecap="round" 
          style={{ stroke: color }} 
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[15px] font-bold text-white leading-none">{score}</span>
      </div>
    </div>
  );
};

export default function HistoryPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    Promise.all([
      fetch('/api/interviews?limit=50').then(r => r.json()),
      fetch('/api/analytics').then(r => r.json())
    ]).then(([sessionsData, analyticsData]) => {
      setSessions(sessionsData.sessions || []);
      setAnalytics(analyticsData || null);
      setLoading(false);
    });
  }, []);

  const filteredSessions = sessions.filter(s => {
    const matchesSearch = !search || s.domain.toLowerCase().includes(search.toLowerCase()) || s.type.toLowerCase().includes(search.toLowerCase());
    
    let matchesFilter = true;
    if (activeFilter === 'Completed') matchesFilter = s.status === 'COMPLETED';
    else if (activeFilter === 'In Progress') matchesFilter = s.status === 'IN_PROGRESS';
    else if (activeFilter !== 'All') {
      matchesFilter = s.type === activeFilter.toUpperCase() || s.domain.replace('_', ' ').toUpperCase().includes(activeFilter.toUpperCase());
    }

    return matchesSearch && matchesFilter;
  });

  const groupedSessions = filteredSessions.reduce((acc, session) => {
    const date = new Date(session.createdAt);
    let group = format(date, 'MMMM yyyy').toUpperCase();
    if (isThisWeek(date)) group = 'THIS WEEK';
    else if (isSameWeek(date, subDays(new Date(), 7))) group = 'LAST WEEK';

    if (!acc[group]) acc[group] = [];
    acc[group].push(session);
    return acc;
  }, {} as Record<string, any[]>);

  // Analytics derivations
  const totalInterviews = analytics?.analytics?.scoreHistory?.length || sessions.length;
  const avgScore = Math.round(analytics?.analytics?.avgOverallScore || 0);
  const strongestDomain = analytics?.analytics?.topStrengths?.[0] || 'N/A';
  
  // Heatmap prep
  const today = new Date();
  const activityMap: Record<string, number> = {};
  (analytics?.weeklyActivity || []).forEach((a: any) => { activityMap[a.date] = a.count; });
  let currentStreak = 0;
  for (let i = 0; i < 84; i++) {
    const k = format(subDays(today, i), 'yyyy-MM-dd');
    if (activityMap[k] > 0) currentStreak++;
    else if (i > 1 || currentStreak === 0) break;
  }

  const getHeatColor = (count: number) => {
    if (count === 0) return 'bg-slate-800/30';
    if (count === 1) return 'bg-indigo-900/60';
    if (count === 2) return 'bg-indigo-700/80';
    if (count === 3) return 'bg-indigo-500';
    return 'bg-indigo-400';
  };

  const scoreHistory = (analytics?.analytics?.scoreHistory || []).slice(-20).map((p: any) => ({
    date: format(new Date(p.date), 'MMM d'),
    score: Math.round(p.score)
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <Activity className="w-8 h-8 text-indigo-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 font-sans p-6 lg:p-10 relative">
      
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 blur-[100px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col xl:flex-row gap-8">
        
        {/* Left Column: Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-2 flex items-center gap-3">
                Interview History
              </h1>
              <p className="text-sm text-slate-400 max-w-xl">
                Track your AI interview performance, monitor your progress, and review detailed analytics insights.
              </p>
            </div>
            
            <Link 
              href="/interview/setup"
              className="group relative px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center gap-2 overflow-hidden shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)] transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.6)] hover:-translate-y-0.5 shrink-0"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <Sparkles className="w-4 h-4" />
              New Interview
            </Link>
          </div>

          {/* Compact Analytics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#111827]/60 backdrop-blur-md border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Target className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Sessions</span>
              </div>
              <p className="text-2xl font-bold text-white">{totalInterviews}</p>
            </div>
            <div className="bg-[#111827]/60 backdrop-blur-md border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Award className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wider">Avg Score</span>
              </div>
              <p className="text-2xl font-bold text-indigo-400">{avgScore}%</p>
            </div>
            <div className="bg-[#111827]/60 backdrop-blur-md border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-semibold uppercase tracking-wider">Streak</span>
              </div>
              <p className="text-2xl font-bold text-white">{currentStreak} <span className="text-sm font-medium text-slate-500">days</span></p>
            </div>
            <div className="bg-[#111827]/60 backdrop-blur-md border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold uppercase tracking-wider">Best Domain</span>
              </div>
              <p className="text-base font-bold text-white truncate mt-1">{strongestDomain.replace('_', ' ')}</p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="relative w-full lg:w-72 shrink-0 group">
              <div className="absolute inset-0 bg-indigo-500/10 blur-md rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="text"
                placeholder="Search interviews..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-[#111827]/80 backdrop-blur-sm border border-white/5 focus:border-indigo-500/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all shadow-inner relative z-10"
              />
            </div>
            
            <div className="flex flex-wrap gap-2 items-center flex-1">
              {['All', 'Technical', 'Behavioral', 'System Design', 'Completed', 'In Progress'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                    activeFilter === filter
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30 shadow-[0_0_15px_-3px_rgba(99,102,241,0.3)]'
                      : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-slate-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline & Cards */}
          {filteredSessions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 bg-[#111827]/40 border border-white/5 rounded-2xl border-dashed">
              <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 border border-white/5">
                <Search className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-1">No sessions found</h3>
              <p className="text-sm text-slate-400 text-center">We couldn't find any interviews matching your current filters.</p>
            </div>
          ) : (
            <div className="space-y-10 pb-12">
              {Object.entries(groupedSessions).map(([group, groupSessions], idx) => (
                <div key={group}>
                  <div className="flex items-center gap-4 mb-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{group}</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                  </div>
                  
                  <div className="space-y-3">
                    {(groupSessions as any[]).map((s: any, i: number) => {
                      const domainCfg = DOMAIN_CONFIG[s.domain as keyof typeof DOMAIN_CONFIG];
                      const score = s.evaluation?.overallScore;
                      const insightSnippet = s.evaluation?.detailedReport?.verdict 
                        ? s.evaluation.detailedReport.verdict 
                        : s.evaluation?.detailedReport?.questions?.[0]?.feedback?.substring(0, 70) 
                          ? s.evaluation.detailedReport.questions[0].feedback.substring(0, 70) + '...'
                          : "AI evaluation processed. Detailed performance insights available.";

                      return (
                        <Link
                          key={s.id}
                          href={s.status === 'COMPLETED' ? `/interview/${s.id}/results` : `/interview/${s.id}`}
                        >
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 + i * 0.05 }}
                            className="group relative bg-[#111827]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5 flex items-center gap-5 hover:bg-[#111827] hover:border-indigo-500/30 hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.15)] transition-all duration-300 overflow-hidden"
                          >
                            {/* Subtle hover gradient */}
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            
                            {/* Left Icon */}
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${domainCfg?.color || 'from-indigo-500 to-purple-600'} p-[1px] shrink-0 group-hover:scale-105 transition-transform duration-300`}>
                              <div className="w-full h-full bg-[#0f172a] rounded-[15px] flex items-center justify-center text-xl">
                                {domainCfg?.icon || '🎯'}
                              </div>
                            </div>

                            {/* Center Content */}
                            <div className="flex-1 min-w-0 pr-4">
                              <div className="flex items-center gap-2 mb-1.5">
                                <h4 className="text-[15px] font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                                  {domainCfg?.label || s.domain.replace('_', ' ')}
                                </h4>
                                {s.company && (
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400 font-medium">
                                    {s.company}
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-medium mb-2">
                                <span className={`px-2 py-0.5 rounded border ${
                                  s.difficulty === 'HARD' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                                  s.difficulty === 'MEDIUM' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                  'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                }`}>
                                  {s.difficulty}
                                </span>
                                <span className="text-slate-400 flex items-center gap-1">
                                  <BarChart2 className="w-3 h-3" /> {s.type}
                                </span>
                                <span className="text-slate-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {s.duration} min
                                </span>
                                <span className="text-slate-500 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" /> {format(new Date(s.createdAt), 'MMM d, yyyy')}
                                </span>
                              </div>

                              {s.status === 'COMPLETED' && (
                                <p className="text-[12px] text-slate-400 truncate flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                  <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
                                  {insightSnippet}
                                </p>
                              )}
                            </div>

                            {/* Right Status / Score */}
                            <div className="flex flex-col items-end justify-center gap-2 shrink-0 border-l border-white/5 pl-5">
                              {s.status === 'COMPLETED' ? (
                                <div className="flex items-center gap-3">
                                  <div className="text-right hidden sm:block">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Score</p>
                                    <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium bg-emerald-500/10 px-2 py-0.5 rounded">
                                      <CheckCircle2 className="w-3 h-3" />
                                      Completed
                                    </div>
                                  </div>
                                  <ScoreRing score={score || 0} />
                                </div>
                              ) : (
                                <div className="flex flex-col items-end gap-1.5">
                                  <div className="flex items-center gap-1.5 text-amber-400 text-xs font-medium bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                                    <CircleDashed className="w-3.5 h-3.5 animate-spin-slow" />
                                    In Progress
                                  </div>
                                  <span className="text-[10px] text-slate-500 font-medium">Resume session</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Edge chevron */}
                            <div className="absolute right-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                              <ChevronRight className="w-5 h-5 text-indigo-400" />
                            </div>

                          </motion.div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Smart Analytics Panel */}
        <div className="w-full xl:w-[340px] shrink-0 flex flex-col gap-5">
          
          <div className="bg-[#111827]/80 backdrop-blur-2xl border border-white/5 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px]" />
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2 relative z-10">
              <Brain className="w-4 h-4 text-indigo-400" />
              AI Performance Insights
            </h3>
            <p className="text-[13px] text-slate-300 leading-relaxed mb-4 relative z-10">
              {analytics?.insights?.hero || "You are maintaining a strong technical baseline. Focus on system design scalability to improve further."}
            </p>
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 relative z-10">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Focus Areas</p>
              <div className="flex flex-wrap gap-1.5">
                {(analytics?.analytics?.topWeaknesses || ['System Design', 'Behavioral']).map((w: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-rose-500/10 text-rose-300 text-[10px] font-medium rounded-md border border-rose-500/20">
                    {w.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#111827]/80 backdrop-blur-2xl border border-white/5 rounded-2xl p-5 shadow-xl flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Progress Trend
              </h3>
              <span className="text-[10px] font-medium text-slate-500 bg-white/5 px-2 py-0.5 rounded">Last 20</span>
            </div>
            <div className="h-28 w-full -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scoreHistory}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    cursor={{ stroke: 'rgba(255,255,255,0.05)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[#1e293b]/95 border border-white/10 p-2 rounded-lg shadow-xl">
                            <p className="text-xs text-slate-400 mb-0.5">{payload[0].payload.date}</p>
                            <p className="text-sm font-bold text-emerald-400">{payload[0].value}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} fill="url(#scoreGrad)" activeDot={{ r: 4, fill: '#0f172a', stroke: '#10b981', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#111827]/80 backdrop-blur-2xl border border-white/5 rounded-2xl p-5 shadow-xl flex flex-col relative overflow-hidden">
             <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2 relative z-10">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Activity Heatmap
            </h3>
            
            <div className="flex gap-[3px] relative z-10">
              {[...Array(12)].map((_, w) => (
                <div key={w} className="flex flex-col gap-[3px]">
                  {[...Array(7)].map((_, d) => {
                    const date = format(subDays(today, 83 - (w * 7 + d)), 'yyyy-MM-dd');
                    const count = activityMap[date] || 0;
                    return (
                      <div
                        key={d}
                        title={`${date}: ${count} sessions`}
                        className={`w-3 h-3 rounded-[2px] ${getHeatColor(count)} hover:ring-1 hover:ring-indigo-400 hover:scale-125 hover:z-10 relative transition-all duration-200 cursor-pointer`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-4 relative z-10">
              <span className="text-[10px] font-medium text-slate-500 uppercase">12 Weeks</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-slate-500">Less</span>
                <div className="flex gap-[2px]">
                  <div className="w-2 h-2 rounded-[1px] bg-slate-800/30" />
                  <div className="w-2 h-2 rounded-[1px] bg-indigo-900/60" />
                  <div className="w-2 h-2 rounded-[1px] bg-indigo-700/80" />
                  <div className="w-2 h-2 rounded-[1px] bg-indigo-500" />
                  <div className="w-2 h-2 rounded-[1px] bg-indigo-400" />
                </div>
                <span className="text-[9px] text-slate-500">More</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
