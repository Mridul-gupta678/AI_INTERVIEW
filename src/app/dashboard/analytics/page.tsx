// src/app/dashboard/analytics/page.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, LabelList
} from 'recharts';
import { format, parseISO, subDays } from 'date-fns';
import {
  TrendingUp, Award, Target, Zap, Activity, Lightbulb, 
  User, ArrowUpRight, ArrowDownRight, Flame
} from 'lucide-react';
import { motion } from 'framer-motion';

const getSemanticColor = (s: number) => {
  if (s >= 85) return '#10b981'; // Emerald
  if (s >= 70) return '#6366f1'; // Indigo
  if (s >= 50) return '#f59e0b'; // Amber
  return '#f43f5e'; // Rose
};

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }
});

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    const color = payload[0].payload.fill || getSemanticColor(val);
    return (
      <div className="bg-[#1e293b]/95 border border-white/10 p-3 rounded-xl shadow-xl">
        <p className="text-[11px] text-slate-400 mb-1 uppercase tracking-wide font-medium">{label}</p>
        <p className="text-xl font-bold text-white">{val}<span className="text-sm text-slate-500 font-medium ml-0.5">%</span></p>
        {payload[0].payload.domain && (
          <div className="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-white/5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
            <p className="text-xs text-slate-300 font-medium">{payload[0].payload.domain.replace('_', ' ')}</p>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics').then(r => r.json()).then(d => { setData(d); setLoading(false); });
  }, []);

  const { analytics, weeklyActivity = [], insights: apiInsights } = data || {};

  const scoreHistory = (analytics?.scoreHistory || []).slice(-30).map((p: any) => ({
    date: format(parseISO(p.date), 'MMM d'),
    score: Math.round(p.score),
    domain: p.domain,
  }));

  const domainBarData = Object.entries(analytics?.domainScores || {}).map(([domain, score]) => ({
    domain: domain.replace('_', ' ').substring(0, 12),
    score: Math.round(score as number),
    fill: getSemanticColor(score as number),
  }));

  // Build heatmap logic (GitHub style)
  const today = new Date();
  const activityMap: Record<string, number> = {};
  weeklyActivity.forEach((a: any) => { activityMap[a.date] = a.count; });

  const weeks = [];
  let currentMonth = '';
  const monthLabels = [];
  
  for (let w = 0; w < 12; w++) {
    const daysInWeek = [];
    for (let d = 0; d < 7; d++) {
      const date = subDays(today, 83 - (w * 7 + d));
      const key = format(date, 'yyyy-MM-dd');
      daysInWeek.push({
        date: key,
        count: activityMap[key] || 0,
        dayOfMonth: date.getDate(),
        month: format(date, 'MMM')
      });
      
      // Track months for top row
      if (d === 0) {
        const m = format(date, 'MMM');
        if (m !== currentMonth) {
          monthLabels.push({ index: w, label: m });
          currentMonth = m;
        }
      }
    }
    weeks.push(daysInWeek);
  }

  // Calculate heatmap stats
  const totalHeatmapSessions = weeklyActivity.reduce((acc: number, val: any) => acc + val.count, 0);
  const activeDays = weeklyActivity.filter((a: any) => a.count > 0).length;
  
  // streak calculation
  let currentStreak = 0;
  for (let i = 0; i < 84; i++) {
    const d = subDays(today, i);
    const k = format(d, 'yyyy-MM-dd');
    if (activityMap[k] > 0) {
      currentStreak++;
    } else if (i > 0) {
      // Allow today to be 0 without breaking an active streak from yesterday
      if (i > 1 || currentStreak === 0) break;
    }
  }
  const consistency = Math.round((activeDays / 84) * 100);

  const getHeatColor = (count: number) => {
    if (count === 0) return 'bg-slate-800/30';
    if (count === 1) return 'bg-indigo-900/60';
    if (count === 2) return 'bg-indigo-700/80';
    if (count === 3) return 'bg-indigo-500';
    return 'bg-indigo-400';
  };

  // Domain bottom insights
  const strongestDomain = analytics?.topStrengths?.[0] || 'N/A';
  const weakestDomain = analytics?.topWeaknesses?.[0] || 'N/A';
  const avgDomainScore = Math.round(analytics?.avgTechnicalScore || 0);

  // Professional AI Insights (from actual AI API)
  const insights = apiInsights || {
    hero: "Loading intelligence...",
    chart: "Loading trends...",
    coaching: ["Analyzing patterns..."],
    readiness: 0
  };

  const kpis = [
    { label: 'Readiness Score', value: insights.readiness, icon: Target, suffix: '%', trendUp: true, trend: '+4% vs avg' },
    { label: 'Overall Average', value: Math.round(analytics?.avgOverallScore ?? 0), icon: Award, suffix: '%', trendUp: true, trend: 'Stable growth' },
    { label: 'Technical Score', value: Math.round(analytics?.avgTechnicalScore ?? 0), icon: Zap, suffix: '%', trendUp: true, trend: 'Top 15% tier' },
    { label: 'Communication', value: Math.round(analytics?.avgCommunicationScore ?? 0), icon: TrendingUp, suffix: '%', trendUp: false, trend: 'Needs focus' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-slate-200 p-8 flex flex-col items-center justify-center">
        <Activity className="w-8 h-8 text-indigo-500 animate-pulse mb-4" />
        <p className="text-sm text-slate-400 font-medium tracking-wide animate-pulse">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 font-sans relative selection:bg-indigo-500/30 pb-20">
      
      {/* Refined Minimal Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[50vh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/10 via-slate-900/5 to-transparent opacity-50" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto p-6 md:p-10 space-y-8">
        
        {/* Executive Header */}
        <motion.div {...fade(0)} className="flex flex-col gap-3 mb-4">
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            Performance Overview
          </h1>
          <p className="text-[15px] text-slate-400 max-w-3xl leading-relaxed">
            {insights.hero}
          </p>
        </motion.div>

        {/* Minimal KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((stat, i) => (
            <motion.div key={stat.label} {...fade(i * 0.1)} className="bg-[#111827]/80 backdrop-blur-md border border-white/5 p-5 rounded-2xl flex flex-col hover:bg-[#111827] transition-colors">
              <div className="flex justify-between items-start mb-4">
                <stat.icon className="w-5 h-5 text-slate-400" />
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${stat.trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.trend}
                </div>
              </div>
              <div className="flex items-baseline gap-0.5 mt-auto">
                <span className="text-3xl font-semibold text-white tracking-tight">
                  {stat.value}
                </span>
                <span className="text-lg text-slate-500 font-medium">{stat.suffix}</span>
              </div>
              <p className="text-sm font-medium text-slate-400 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Chart */}
          <motion.div {...fade(0.2)} className="lg:col-span-2 bg-[#111827]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-col">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-white">Progress Trends</h2>
            </div>

            <div className="h-[260px] w-full mb-4">
              {scoreHistory.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center border border-dashed border-slate-800 rounded-xl">
                  <p className="text-sm text-slate-500">Insufficient data points available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={scoreHistory} margin={{ top: 10, right: 10, bottom: 0, left: -25 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} dx={-10} />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.05)' }} />
                    <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" activeDot={{ r: 5, fill: '#1e293b', stroke: '#6366f1', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-slate-800/40 rounded-lg p-3 flex gap-3 items-start mt-auto">
              <Lightbulb className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
              <p className="text-sm text-slate-300 leading-relaxed">{insights.chart}</p>
            </div>
          </motion.div>

          {/* AI Recommendations */}
          <motion.div {...fade(0.3)} className="bg-[#111827]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-col">
            <h2 className="text-lg font-medium text-white mb-6">AI Recommendations</h2>
            <div className="flex-1 flex flex-col gap-3">
              {insights.coaching.map((tip: string, idx: number) => (
                <div key={idx} className="bg-slate-800/30 border border-white/5 rounded-xl p-4 flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                  <p className="text-sm text-slate-300 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </motion.div>

        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Domain Breakdown */}
          <motion.div {...fade(0.4)} className="bg-[#111827]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-col hover:border-indigo-500/30 hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.15)] transition-all duration-300 shadow-lg">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-medium text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-400" />
                  Domain Performance
                </h2>
                <p className="text-sm text-slate-400 mt-1">Technical competency breakdown</p>
              </div>
              <div className="px-3 py-1.5 bg-slate-800/50 border border-white/5 rounded-lg text-xs font-medium text-slate-300 shadow-inner">
                Last 30 Days
              </div>
            </div>
            
            <div className="h-[240px] w-full flex-1">
              {domainBarData.length === 0 ? (
                <p className="text-sm text-slate-500 text-center mt-12">Complete sessions to view breakdown</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={domainBarData} margin={{ top: 20, right: 10, bottom: 20, left: -25 }}>
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.6}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                    <XAxis dataKey="domain" tick={{ fontSize: 11, fill: '#94a3b8' }} angle={-20} textAnchor="end" axisLine={false} tickLine={false} dy={10} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} dx={-10} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} content={<CustomTooltip />} />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={40} fill="url(#barGrad)" isAnimationActive={true} animationDuration={1500} animationEasing="ease-out">
                      <LabelList dataKey="score" position="top" fill="#cbd5e1" fontSize={10} fontWeight={600} formatter={(v: number) => `${v}%`} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/5">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Strongest</p>
                <p className="text-sm text-white font-medium truncate">{strongestDomain.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Weakest</p>
                <p className="text-sm text-white font-medium truncate">{weakestDomain.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Avg Score</p>
                <p className="text-sm text-indigo-400 font-bold">{avgDomainScore}%</p>
              </div>
            </div>
          </motion.div>

          {/* Activity Heatmap */}
          <motion.div {...fade(0.5)} className="bg-[#111827]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-col hover:border-indigo-500/30 hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.15)] transition-all duration-300 shadow-lg">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-lg font-medium text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  Activity Graph
                </h2>
                <p className="text-sm text-slate-400 mt-1">12-week contribution history</p>
              </div>
              <div className="flex gap-4">
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Sessions</p>
                  <p className="text-lg font-semibold text-white">{totalHeatmapSessions}</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Consistency</p>
                  <p className="text-lg font-semibold text-emerald-400">{consistency}%</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex">
                {/* Y-axis days (Mon, Wed, Fri) */}
                <div className="flex flex-col gap-[4px] pr-2 pt-[18px] text-[10px] font-medium text-slate-500">
                  <span className="h-3.5 invisible">Sun</span>
                  <span className="h-3.5 leading-none">Mon</span>
                  <span className="h-3.5 invisible">Tue</span>
                  <span className="h-3.5 leading-none">Wed</span>
                  <span className="h-3.5 invisible">Thu</span>
                  <span className="h-3.5 leading-none">Fri</span>
                  <span className="h-3.5 invisible">Sat</span>
                </div>
                
                <div className="flex-1 overflow-x-auto scrollbar-none pb-2">
                  {/* Month Labels */}
                  <div className="flex relative h-4 mb-1 w-full">
                    {monthLabels.map(m => (
                      <span key={m.index} className="absolute text-[10px] font-medium text-slate-500" style={{ left: `${(m.index / 12) * 100}%` }}>
                        {m.label}
                      </span>
                    ))}
                  </div>

                  {/* Grid */}
                  <div className="flex gap-[4px]">
                    {weeks.map((week, wIdx) => (
                      <div key={wIdx} className="flex flex-col gap-[4px]">
                        {week.map((day, dIdx) => (
                          <div
                            key={dIdx}
                            title={`${day.date}: ${day.count} sessions`}
                            className={`w-3.5 h-3.5 rounded-sm ${getHeatColor(day.count)} hover:ring-1 hover:ring-indigo-400 hover:scale-125 hover:z-10 relative transition-all duration-200 cursor-pointer`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                  <span>Less</span>
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-slate-800/30" />
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-indigo-900/60" />
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-indigo-700/80" />
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-indigo-500" />
                    <div className="w-2.5 h-2.5 rounded-[2px] bg-indigo-400" />
                  </div>
                  <span>More</span>
                </div>
                <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 bg-slate-800/40 px-2.5 py-1 rounded-md border border-white/5">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  Current Streak: <span className="text-white font-bold">{currentStreak} days</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
