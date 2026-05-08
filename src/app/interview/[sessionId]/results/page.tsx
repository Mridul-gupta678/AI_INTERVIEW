// src/app/interview/[sessionId]/results/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, TrendingUp, TrendingDown, Lightbulb, CheckCircle2,
  XCircle, BarChart3, ArrowRight, RotateCcw, Download, Star, ShieldAlert,
  ChevronDown, User, Activity, Zap, Target, Crosshair, MessageSquare, 
  Clock, MicOff, Map, Milestone, BookOpen
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import React from 'react';

interface Evaluation {
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  clarityScore: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  summary: string;
  detailedReport: any;
  hireable: boolean;
  seniorityFit: string;
}

function PremiumScoreRing({ score, size = 200, strokeWidth = 6, label }: { score: number, size?: number, strokeWidth?: number, label?: string }) {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#8b5cf6' : score >= 40 ? '#f59e0b' : '#ef4444';
  
  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 drop-shadow-2xl">
        <defs>
          <linearGradient id={`gradient-${score}-${label?.replace(/\s/g,'')}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </linearGradient>
          <filter id={`glow-${score}-${label?.replace(/\s/g,'')}`}>
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" 
          stroke={`url(#gradient-${score}-${label?.replace(/\s/g,'')})`} 
          strokeWidth={strokeWidth}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          filter={`url(#glow-${score}-${label?.replace(/\s/g,'')})`}
          className="transition-all duration-1500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-white tracking-tighter" style={{ textShadow: `0 0 20px ${color}` }}>
          {Math.round(score)}
        </span>
        {label && <span className="text-[10px] uppercase tracking-widest text-slate-400 mt-1 text-center px-2">{label}</span>}
      </div>
    </div>
  );
}

const InsightCard = ({ title, icon, items, color }: { title: string, icon: any, items: string[], color: string }) => (
  <div className="glass-panel p-8 relative overflow-hidden group h-full">
    <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-700" style={{ color }}>
      {React.cloneElement(icon, { className: "w-32 h-32" })}
    </div>
    <div className="flex items-center gap-3 mb-8 relative z-10">
      <div className="p-2.5 rounded-xl border border-white/5" style={{ background: `${color}15`, color }}>
        {React.cloneElement(icon, { className: "w-5 h-5" })}
      </div>
      <h3 className="text-lg font-semibold text-white tracking-tight">{title}</h3>
    </div>
    <ul className="space-y-4 relative z-10">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-slate-300 text-sm leading-relaxed">
          <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
          <span className="font-light">{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

const QuestionCard = ({ question, index, isOpen, onClick }: { question: any, index: number, isOpen: boolean, onClick: () => void }) => {
  const scoreColor = question.score >= 80 ? '#10b981' : question.score >= 60 ? '#8b5cf6' : question.score >= 40 ? '#f59e0b' : '#ef4444';
  
  return (
    <div className="border border-white/5 bg-[#0a0a0f]/40 backdrop-blur-md rounded-2xl overflow-hidden transition-all duration-300 hover:bg-[#0a0a0f]/60 hover:border-white/10 mb-4">
      <button onClick={onClick} className="w-full flex flex-col md:flex-row md:items-center gap-4 md:gap-6 p-6 md:p-8 text-left">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="px-2 py-1 rounded bg-white/5 text-[10px] uppercase tracking-widest text-slate-400 font-medium border border-white/10">Question {index + 1}</span>
            {question.timeTaken && (
              <span className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 text-[10px] uppercase tracking-widest font-medium border border-indigo-500/20 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {question.timeTaken}
              </span>
            )}
            {question.silenceDuration && (
              <span className="px-2 py-1 rounded bg-orange-500/10 text-orange-400 text-[10px] uppercase tracking-widest font-medium border border-orange-500/20 flex items-center gap-1">
                <MicOff className="w-3 h-3" /> {question.silenceDuration} Silence
              </span>
            )}
            {question.confidenceLevel && (
              <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-[10px] uppercase tracking-widest font-medium border border-blue-500/20 flex items-center gap-1">
                <Activity className="w-3 h-3" /> {question.confidenceLevel} Confidence
              </span>
            )}
          </div>
          <p className="text-base md:text-lg text-slate-200 font-medium leading-relaxed">{question.question}</p>
        </div>
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 md:gap-1 shrink-0 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t border-white/5 md:border-none">
          <div className="flex flex-col md:items-end">
            <p className="text-2xl md:text-3xl font-bold" style={{ color: scoreColor, textShadow: `0 0 20px ${scoreColor}40` }}>{question.score}%</p>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">Score</p>
          </div>
          <div className={`transform transition-transform duration-500 ${isOpen ? 'rotate-180' : ''} bg-white/5 p-2 rounded-full mt-2 hidden md:block`}>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="p-6 md:p-8 pt-0 border-t border-white/5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mt-6 md:mt-8">
                 <div className="bg-black/20 rounded-2xl p-6 md:p-8 border border-white/5">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-5 flex items-center gap-2 font-medium">
                      <User className="w-4 h-4 text-slate-400"/> Candidate Response
                    </p>
                    <p className="text-sm md:text-base text-slate-300 leading-relaxed font-light">{question.answer}</p>
                 </div>
                 <div className="bg-gradient-to-b from-[#6366f1]/[0.05] to-transparent rounded-2xl p-6 md:p-8 border border-[#6366f1]/10">
                    <p className="text-[10px] uppercase tracking-widest text-[#8b5cf6] mb-5 flex items-center gap-2 font-medium">
                      <Brain className="w-4 h-4"/> AI Analysis
                    </p>
                    <p className="text-sm md:text-base text-slate-300 leading-relaxed font-light mb-8">{question.feedback}</p>
                    {question.idealAnswer && (
                      <div className="pt-6 border-t border-[#6366f1]/10">
                         <p className="text-[10px] uppercase tracking-widest text-[#6366f1] mb-4 flex items-center gap-2 font-medium">
                           <Target className="w-4 h-4"/> Ideal Approach
                         </p>
                         <p className="text-sm md:text-base text-slate-400 leading-relaxed font-light">{question.idealAnswer}</p>
                      </div>
                    )}
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
  const [proctoringLogs, setProctoringLogs] = useState<any[]>([]);
  const [sessionMetrics, setSessionMetrics] = useState<any>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!evaluation) return;
    setPdfLoading(true);
    toast.loading('Generating PDF...', { id: 'pdf' });
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ]);

      const el = document.createElement('div');
      el.style.cssText = [
        'position:fixed', 'top:0', 'left:0', 'width:800px',
        'background:#070B14', 'color:#f8fafc', 'font-family:Inter,Arial,sans-serif',
        'padding:48px', 'box-sizing:border-box', 'z-index:-9999', 'opacity:0',
      ].join(';');

      const scoreColor = (s: number) => s >= 75 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444';
      const grade = evaluation.overallScore >= 85 ? 'Strong Hire' : evaluation.overallScore >= 70 ? 'Hire' : 'Needs Work';

      el.innerHTML = `
        <div style="margin-bottom:48px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
          <div>
             <h1 style="margin:0; font-size: 28px; font-weight: 700; color: #f8fafc; letter-spacing: -0.5px;">Interview Intelligence Report</h1>
             <p style="margin:8px 0 0 0; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px;">Session: ${sessionId.slice(-8)}</p>
          </div>
          <div style="background: linear-gradient(135deg, #6366f1, #7c3aed); padding: 8px 16px; border-radius: 8px; color: #fff; font-weight: 600; font-size: 14px;">
            Score: ${evaluation.overallScore}/100
          </div>
        </div>

        <div style="display: flex; gap: 24px; margin-bottom: 32px;">
          <!-- Left Column: Core Score -->
          <div style="flex: 1; background: rgba(17,24,39,0.4); border-radius: 20px; padding: 32px; text-align: center; border: 1px solid rgba(255,255,255,0.05);">
            <p style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 16px 0; font-weight: 600;">Overall Probability</p>
            <p style="color: ${scoreColor(evaluation.overallScore)}; font-size: 80px; font-weight: 800; margin: 0; line-height: 1; letter-spacing: -2px;">${evaluation.overallScore}</p>
            <div style="margin-top: 24px;">
              <span style="background: ${scoreColor(evaluation.overallScore)}15; color: ${scoreColor(evaluation.overallScore)}; border: 1px solid ${scoreColor(evaluation.overallScore)}30; padding: 6px 16px; border-radius: 99px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                ${grade}
              </span>
            </div>
          </div>
          
          <!-- Right Column: Sub Scores -->
          <div style="flex: 2; display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
             ${[
               { label: 'Technical Depth', s: evaluation.technicalScore },
               { label: 'Communication', s: evaluation.communicationScore },
               { label: 'Confidence', s: evaluation.confidenceScore },
               { label: 'Clarity', s: evaluation.clarityScore }
             ].map(item => `
               <div style="background: rgba(17,24,39,0.4); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 24px;">
                 <p style="color: ${scoreColor(item.s)}; font-size: 32px; font-weight: 700; margin: 0 0 4px 0;">${item.s}</p>
                 <p style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; margin: 0;">${item.label}</p>
               </div>
             `).join('')}
          </div>
        </div>

        <div style="background: rgba(17,24,39,0.4); border-radius: 20px; padding: 32px; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.05);">
          <p style="color: #6366f1; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 16px 0;">Executive Summary</p>
          <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6; font-weight: 300; margin: 0;">${evaluation.summary}</p>
        </div>

        ${evaluation.strengths.length > 0 ? `
        <div style="background: rgba(16,185,129,0.05); border-radius: 20px; padding: 32px; margin-bottom: 24px; border: 1px solid rgba(16,185,129,0.1);">
          <p style="color: #10b981; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 16px 0;">Demonstrated Strengths</p>
          ${evaluation.strengths.slice(0, 3).map(s => `
            <div style="display: flex; gap: 12px; margin-bottom: 12px; align-items: flex-start;">
               <div style="width: 6px; height: 6px; border-radius: 50%; background: #10b981; margin-top: 8px; flex-shrink: 0;"></div>
               <p style="color: #cbd5e1; font-size: 14px; margin: 0; line-height: 1.6; font-weight: 300;">${s}</p>
            </div>
          `).join('')}
        </div>` : ''}

        <div style="text-align: center; margin-top: 48px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 24px;">
          <p style="color: #475569; font-size: 12px; margin: 0;">Generated securely by Interview Intelligence AI.</p>
        </div>
      `;

      document.body.appendChild(el);
      el.style.opacity = '1';

      const canvas = await html2canvas(el, { backgroundColor: '#0f172a', scale: 1.5, useCORS: true, logging: false });
      document.body.removeChild(el);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`interview-report-${sessionId.slice(-8)}.pdf`);
      toast.success('PDF downloaded!', { id: 'pdf' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF', { id: 'pdf' });
    } finally {
      setPdfLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluation();
    fetchProctoringLogs();
  }, [sessionId]);

  const fetchProctoringLogs = async () => {
    try {
      const res = await fetch(`/api/interviews/${sessionId}/proctoring`);
      if (res.ok) {
        const data = await res.json();
        if (data.logs) setProctoringLogs(data.logs);
        if (data.sessionMetrics) setSessionMetrics(data.sessionMetrics);
      }
    } catch { }
  };

  const fetchEvaluation = async () => {
    try {
      const getRes = await fetch(`/api/interviews/${sessionId}/evaluation`);
      if (getRes.ok) {
        const data = await getRes.json();
        if (data.evaluation) { setEvaluation(data.evaluation); setLoading(false); return; }
      }
      const res = await fetch(`/api/evaluate/${sessionId}`, { method: 'POST' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setEvaluation(data.evaluation);
    } catch {
      toast.error('Failed to load evaluation');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="premium-dashboard flex items-center justify-center min-h-screen">
        <style dangerouslySetInnerHTML={{__html: `
          .premium-dashboard { background-color: #030303; }
        `}} />
        <div className="text-center z-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6366f1]/20 to-[#8b5cf6]/20 flex items-center justify-center mx-auto mb-6 border border-white/10 animate-pulse" style={{ boxShadow: '0 0 40px rgba(99,102,241,0.2)' }}>
            <Brain className="w-10 h-10 text-[#8b5cf6]" />
          </div>
          <p className="text-white text-lg font-medium tracking-tight">Analyzing Performance</p>
          <p className="text-sm text-slate-400 mt-2 font-light">Synthesizing advanced AI hiring intelligence...</p>
          <div className="flex gap-2 justify-center mt-6">
            {[0,1,2].map(i => (
              <motion.div key={i} 
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} 
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" 
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="premium-dashboard flex items-center justify-center min-h-screen">
        <div className="text-center z-10 glass-panel p-10 max-w-md w-full mx-4">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6 opacity-80" />
          <h2 className="text-xl font-semibold text-white mb-2">Evaluation Not Found</h2>
          <p className="text-slate-400 mb-8 font-light">We couldn't locate the results for this session.</p>
          <Link href="/dashboard" className="premium-btn-primary w-full justify-center py-3">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const extraMetrics = evaluation.detailedReport || {};
  const verdict = extraMetrics.verdict || (evaluation.overallScore >= 85 ? 'Strong Hire' : evaluation.overallScore >= 70 ? 'Hire' : 'Needs Improvement');
  const questionsList = Array.isArray(extraMetrics.detailedReport) 
    ? extraMetrics.detailedReport 
    : (extraMetrics.questions || []);
  const hiringProbability = extraMetrics.hiringProbability || evaluation.overallScore;

  return (
    <div className="premium-dashboard">
      <style dangerouslySetInnerHTML={{__html: `
        .premium-dashboard {
          --bg-dark: #030303;
          --panel-bg: rgba(10, 10, 15, 0.4);
          --panel-border: rgba(255, 255, 255, 0.06);
          background-color: var(--bg-dark);
          color: #ffffff;
          min-height: 100vh;
          position: relative;
          font-family: 'Inter', sans-serif;
          overflow-x: hidden;
          padding-bottom: 120px;
        }

        .premium-bg-grid {
          position: fixed;
          inset: 0;
          background-image: 
            linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 64px 64px;
          pointer-events: none;
          z-index: 0;
        }

        .premium-bg-noise {
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          mix-blend-mode: overlay;
          z-index: 1;
        }

        .ambient-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          z-index: 0;
        }
        .orb-1 { width: 800px; height: 800px; background: rgba(99, 102, 241, 0.08); top: -300px; left: -200px; }
        .orb-2 { width: 600px; height: 600px; background: rgba(139, 92, 246, 0.08); bottom: -200px; right: -100px; }
        .orb-3 { width: 500px; height: 500px; background: rgba(16, 185, 129, 0.03); top: 40%; left: 50%; transform: translate(-50%, -50%); }

        .glass-panel {
          background: var(--panel-bg);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid var(--panel-border);
          border-radius: 24px;
          box-shadow: 0 4px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05);
          position: relative;
          z-index: 10;
        }

        .glass-header {
          background: rgba(3, 3, 3, 0.7);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border-bottom: 1px solid var(--panel-border);
          box-shadow: 0 4px 30px rgba(0,0,0,0.5);
        }

        .premium-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .premium-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }
        .premium-btn-primary {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.3), inset 0 1px 0 rgba(255,255,255,0.2);
          color: #fff;
          padding: 8px 20px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .premium-btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #4338ca, #6d28d9);
          box-shadow: 0 0 30px rgba(99, 102, 241, 0.5), inset 0 1px 0 rgba(255,255,255,0.2);
          transform: translateY(-1px);
        }
      `}} />

      {/* Background Elements */}
      <div className="premium-bg-grid" />
      <div className="premium-bg-noise" />
      <div className="ambient-orb orb-1" />
      <div className="ambient-orb orb-2" />
      <div className="ambient-orb orb-3" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-header px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-white/20">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white tracking-wide">Interview Intelligence</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#10b981]" />
                <p className="text-[11px] uppercase tracking-widest text-slate-400 font-medium">Session {sessionId.slice(-8)}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPDF}
              disabled={pdfLoading || !evaluation}
              className="premium-btn disabled:opacity-50"
            >
              {pdfLoading
                ? <span className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                : <Download className="w-4 h-4" />
              }
              {pdfLoading ? 'Exporting...' : 'Export PDF'}
            </button>
            <Link href="/interview/setup" className="premium-btn hidden md:inline-flex">
              <RotateCcw className="w-4 h-4" /> Practice Again
            </Link>
            <Link href="/dashboard" className="premium-btn-primary">
              Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-32 space-y-8 relative z-10">
        
        {/* AI Verdict Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="glass-panel p-8 md:p-12 overflow-hidden relative"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-[300px] bg-gradient-to-b from-[#6366f1]/10 to-transparent blur-[60px] pointer-events-none rounded-full" />
          
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Probability ring */}
            <div className="shrink-0 relative">
              <div className="absolute inset-0 bg-[#8b5cf6]/5 blur-3xl rounded-full" />
              <PremiumScoreRing score={hiringProbability} size={240} strokeWidth={8} label="Hiring Probability" />
            </div>

            <div className="flex-1 text-center lg:text-left relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 mb-6">
                <Target className="w-4 h-4 text-[#8b5cf6]" />
                <span className="text-xs uppercase tracking-widest font-semibold text-slate-300">AI Hiring Verdict</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start mb-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">{verdict}</h1>
                {evaluation.hireable && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Recommendation: Proceed
                  </span>
                )}
              </div>
              
              <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-2xl font-light">
                {evaluation.summary}
              </p>
              
              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-slate-500">Suggested Level:</span>
                  <span className="text-sm font-semibold text-[#8b5cf6]">{extraMetrics.seniorityFit || evaluation.seniorityFit || 'N/A'}</span>
                </div>
                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-slate-500">Technical Depth:</span>
                  <span className="text-sm font-semibold text-white">{evaluation.technicalScore}/100</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Detailed Performance Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-panel p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-[#6366f1]/10 border border-[#6366f1]/20 text-[#6366f1]">
                <Crosshair className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white tracking-tight">Problem Solving Analysis</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-light">{extraMetrics.problemSolvingAnalysis || extraMetrics.thinkingPatternAnalysis}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="glass-panel p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 text-[#8b5cf6]">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white tracking-tight">Communication & Behavioral</h3>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-slate-300 leading-relaxed font-light"><strong className="text-white font-medium">Communication:</strong> {extraMetrics.communicationAnalysis}</p>
              {extraMetrics.behavioralAnalysis && (
                <p className="text-sm text-slate-300 leading-relaxed font-light"><strong className="text-white font-medium">Behavioral:</strong> {extraMetrics.behavioralAnalysis}</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Advanced Intelligence & Coaching */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-panel p-8 lg:col-span-2 bg-gradient-to-br from-[#6366f1]/5 to-transparent border-[#6366f1]/10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-[#6366f1]/10 border border-[#6366f1]/20 text-[#6366f1]">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white tracking-tight">AI Coaching Suggestions</h3>
            </div>
            {extraMetrics.coachingSuggestions ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-2">What Went Wrong</h4>
                  <p className="text-sm text-slate-300 leading-relaxed font-light">{extraMetrics.coachingSuggestions.whatWentWrong}</p>
                </div>
                <div className="h-px w-full bg-white/5" />
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-[#8b5cf6] font-semibold mb-2">How to Improve</h4>
                  <p className="text-sm text-slate-300 leading-relaxed font-light">{extraMetrics.coachingSuggestions.howToImprove}</p>
                </div>
                <div className="h-px w-full bg-white/5" />
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-[#10b981] font-semibold mb-2">Recommended Next Steps</h4>
                  <p className="text-sm text-slate-300 leading-relaxed font-light">{extraMetrics.coachingSuggestions.nextSteps}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 font-light">Detailed coaching insights are generated for advanced interview sessions.</p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="glass-panel p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white tracking-tight">Transcript Intelligence</h3>
            </div>
            {extraMetrics.transcriptIntelligence ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-xs uppercase tracking-widest text-slate-400 font-medium">Filler Words</span>
                  <span className="text-lg font-bold text-white">{extraMetrics.transcriptIntelligence.fillerWordsDetected}</span>
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-3">Missed Opportunities</h4>
                  <ul className="space-y-3">
                    {extraMetrics.transcriptIntelligence.missedOpportunities?.map((opp: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-300 font-light">
                        <span className="w-1.5 h-1.5 rounded-full mt-1.5 bg-orange-500 shrink-0" />
                        {opp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 font-light">No specific linguistic anomalies detected in the transcript.</p>
            )}
          </motion.div>

        </div>

        {/* Strengths & Weaknesses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <InsightCard title="Demonstrated Strengths" icon={<TrendingUp />} items={evaluation.strengths} color="#10b981" />
          <InsightCard title="Critical Weaknesses" icon={<TrendingDown />} items={evaluation.weaknesses} color="#ef4444" />
        </motion.div>

        {/* Improvement Roadmap */}
        {extraMetrics.improvementRoadmap && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="glass-panel p-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981]">
                  <Map className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold text-white tracking-tight">AI Improvement Roadmap</h3>
              </div>
              <div className="flex gap-3">
                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 font-medium">
                  Timeline: <span className="text-white">{extraMetrics.improvementRoadmap.timeline}</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 font-medium">
                  Target Level: <span className="text-white">{extraMetrics.improvementRoadmap.suggestedDifficulty}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {extraMetrics.improvementRoadmap.studyPlan?.map((step: string, i: number) => (
                <div key={i} className="p-5 rounded-xl bg-white/[0.02] border border-white/5 relative overflow-hidden group hover:bg-white/[0.04] transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-5 text-white transform group-hover:scale-110 transition-transform">
                    <Milestone className="w-16 h-16" />
                  </div>
                  <div className="text-[#10b981] font-bold text-lg mb-2 relative z-10">Phase {i+1}</div>
                  <p className="text-sm text-slate-300 font-light leading-relaxed relative z-10">{step}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Detailed Transcript */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-panel p-6 md:p-10"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-semibold text-white tracking-tight">Question-by-Question Evaluation</h3>
          </div>

          <div className="space-y-2">
            {questionsList.map((item: any, i: number) => (
              <QuestionCard 
                key={i} 
                question={item} 
                index={i} 
                isOpen={activeQuestion === i} 
                onClick={() => setActiveQuestion(activeQuestion === i ? null : i)} 
              />
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="glass-panel p-10 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#6366f1]/10 via-transparent to-[#8b5cf6]/10" />
          <h3 className="text-2xl font-bold text-white mb-3 tracking-tight relative z-10">
            {hiringProbability >= 70 ? "Ready for the next challenge?" : "Let's work on the improvement plan."}
          </h3>
          <p className="text-slate-400 mb-8 font-light max-w-lg mx-auto relative z-10">
            {hiringProbability >= 70
              ? "Your analytical performance is strong. Consider tackling a higher difficulty or a different technical domain."
              : "Review your detailed coaching feedback and focus on your structural approach before the next session."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Link href="/interview/setup" className="premium-btn-primary py-3 px-8 text-sm">
              <RotateCcw className="w-4 h-4" /> Start New Session
            </Link>
            <Link href="/dashboard" className="premium-btn py-3 px-8 text-sm">
              <BarChart3 className="w-4 h-4" /> View Analytics
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
