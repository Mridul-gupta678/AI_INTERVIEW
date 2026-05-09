"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Brain, Code2, Play, Zap, Shield, CheckCircle2,
  Sparkles, Mic, BarChart3, ChevronRight, Star, Quote, Users,
  Activity, Video, LayoutDashboard, Terminal, MessageSquare,
  ChevronDown, Menu, X, TrendingUp, Lock
} from 'lucide-react';

// --- ANIMATION VARIANTS ---
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30 overflow-x-hidden font-sans">
      
      {/* --- BACKGROUND SYSTEM --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#020617]" />
        {/* Soft Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_20%,transparent_100%)]" />
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] mix-blend-screen" />
      </div>

      {/* --- NAVBAR --- */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b ${
        isScrolled 
          ? 'bg-[#020617]/80 backdrop-blur-xl border-white/10 py-3' 
          : 'bg-transparent border-transparent py-5'
      }`}>
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-[10px] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                <Brain className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="font-semibold text-[15px] tracking-tight text-white">InterviewAI</span>
            </Link>
            <Link href="/admin-login" className="hidden sm:flex items-center px-2 py-0.5 rounded-[10px] bg-white/5 border border-white/10 text-[10px] font-medium text-white/50 tracking-widest shadow-sm hover:bg-white/10 hover:text-white transition-colors cursor-pointer">
              ADMIN CONSOLE
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {['Features', 'How It Works', 'Testimonials', 'Pricing'].map(item => (
              <Link key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="text-[13px] font-medium text-white/60 hover:text-white transition-colors">
                {item}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-medium text-white/50">All systems operational</span>
            </div>
            <Link href="/auth/login" className="text-[13px] font-medium text-white/70 hover:text-white transition-colors">
              Log In
            </Link>
            <Link href="/auth/register" className="px-5 py-2 rounded-[14px] text-[13px] font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-[0_0_15px_rgba(79,70,229,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]">
              Start Interview
            </Link>
          </div>

          <button className="md:hidden text-white/70 hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      <main className="relative z-10 pt-28 lg:pt-36 pb-16">
        <section className="px-6 lg:px-12 max-w-[1440px] mx-auto">
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-center">
            
            {/* Left Content */}
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-2xl">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[10px] text-xs font-medium mb-6 bg-white/[0.03] border border-white/[0.08] backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-white/70">GPT-4o Powered Interview Engine</span>
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-[64px] font-bold tracking-[-0.02em] leading-[1.05] mb-6 text-white">
                AI Interviews Designed<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/60">
                  for Real Hiring
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-[16px] text-white/50 leading-[1.6] mb-8 max-w-[500px]">
                Conduct realistic AI-powered technical interviews with adaptive questioning, voice intelligence, live coding analysis, and enterprise-grade evaluation systems.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-3 mb-10">
                <Link href="/auth/register" className="group relative w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-[14px] font-medium text-[14px] text-white bg-gradient-to-b from-indigo-500 to-indigo-600 border border-indigo-500/50 hover:from-indigo-400 hover:to-indigo-500 shadow-[0_4px_14px_rgba(79,70,229,0.2),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-300">
                  Launch Interview Session
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-[14px] font-medium text-[14px] text-white/80 bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:text-white transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <Play className="w-4 h-4" /> View Platform Demo
                </button>
              </motion.div>

              <motion.div variants={fadeUp} className="grid grid-cols-2 gap-y-4 gap-x-8 text-[13px] font-medium text-white/40 max-w-[500px]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400/70" /> 95% Interview Accuracy
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400/70" /> Real-time AI Evaluation
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-emerald-400/70" /> Adaptive Questioning
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400/70" /> Enterprise Proctoring
                </div>
              </motion.div>
            </motion.div>

            {/* Right Product Preview Centerpiece */}
            <motion.div 
              initial={{ opacity: 0, x: 40, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative w-full h-[580px] mt-10 lg:mt-0"
            >
              <div className="absolute inset-0 rounded-[24px] bg-gradient-to-b from-white/[0.08] to-transparent p-px shadow-[0_20px_80px_-20px_rgba(79,70,229,0.3)]">
                <div className="absolute inset-0 rounded-[24px] bg-[#0F172A] overflow-hidden flex flex-col shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                  
                  {/* Dashboard Header */}
                  <div className="h-11 border-b border-white/5 flex items-center justify-between px-4 bg-[#111827]">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-white/20 hover:bg-red-400 transition-colors" />
                      <div className="w-2.5 h-2.5 rounded-full bg-white/20 hover:bg-yellow-400 transition-colors" />
                      <div className="w-2.5 h-2.5 rounded-full bg-white/20 hover:bg-green-400 transition-colors" />
                    </div>
                    {/* Browser Tabs Simulation */}
                    <div className="flex gap-2 mx-auto absolute left-1/2 -translate-x-1/2">
                      <div className="px-4 py-1.5 rounded-t-[10px] bg-[#0F172A] border-x border-t border-white/5 text-[10px] text-white/70 flex items-center gap-2 mt-2 shadow-[0_-2px_10px_rgba(0,0,0,0.2)]">
                        <Shield className="w-3 h-3 text-indigo-400" /> secure.interviewai.com
                      </div>
                    </div>
                  </div>

                  {/* Dashboard Body */}
                  <div className="flex-1 flex gap-2 p-2 overflow-hidden bg-[#020617]">
                    
                    {/* Sidebar */}
                    <div className="w-12 flex flex-col items-center py-2 gap-4 border border-white/5 bg-white/[0.02] rounded-[18px]">
                      <div className="w-8 h-8 rounded-[10px] border border-white/10 bg-white/5 flex items-center justify-center shadow-sm">
                        <LayoutDashboard className="w-4 h-4 text-white/50" />
                      </div>
                      <div className="w-8 h-8 rounded-[10px] bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                        <Video className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div className="w-8 h-8 rounded-[10px] hover:bg-white/5 flex items-center justify-center transition-colors">
                        <Terminal className="w-4 h-4 text-white/30" />
                      </div>
                      <div className="w-8 h-8 rounded-[10px] hover:bg-white/5 flex items-center justify-center transition-colors">
                        <BarChart3 className="w-4 h-4 text-white/30" />
                      </div>
                      <div className="flex-1" />
                      <div className="w-8 h-8 rounded-[10px] bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white shadow-md">
                        JS
                      </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col gap-2 relative overflow-hidden">
                      {/* Top Grid: Webcam + Code */}
                      <div className="h-[55%] flex gap-2">
                        
                        {/* Live Code Panel */}
                        <div className="flex-1 border border-white/5 bg-[#0B1120] rounded-[18px] flex flex-col overflow-hidden shadow-sm">
                          <div className="h-9 border-b border-white/5 flex items-center px-3 bg-white/[0.02]">
                            <span className="text-[10px] font-mono text-white/40">solution.ts</span>
                            <div className="ml-auto flex items-center gap-3">
                              <span className="text-[9px] text-white/30 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500/50" /> Saved</span>
                              <span className="px-2 py-0.5 rounded-[10px] bg-indigo-500/10 text-[9px] text-indigo-400 uppercase font-semibold">Typescript</span>
                            </div>
                          </div>
                          <div className="flex-1 pt-4 px-4 font-mono text-[11px] text-white/60 leading-[1.8] relative">
                            {/* Line numbers */}
                            <div className="absolute left-0 top-4 bottom-0 w-8 flex flex-col items-end pr-2 text-white/20 select-none text-[10px]">
                               {Array.from({length: 12}).map((_, i) => <span key={i}>{i+1}</span>)}
                            </div>
                            <div className="pl-6">
                              <span className="text-purple-400">export function</span> <span className="text-blue-400">findMedian</span>(arr1: <span className="text-yellow-300">number</span>[], arr2: <span className="text-yellow-300">number</span>[]): <span className="text-yellow-300">number</span> {'{'}<br/>
                              &nbsp;&nbsp;<span className="text-emerald-400/50">// Optimized O(log(min(m,n))) approach</span><br/>
                              &nbsp;&nbsp;<span className="text-purple-400">if</span> (arr1.length &gt; arr2.length) {'{'}<br/>
                              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">return</span> findMedian(arr2, arr1);<br/>
                              &nbsp;&nbsp;{'}'}<br/>
                              <br/>
                              &nbsp;&nbsp;<span className="text-purple-400">let</span> x = arr1.length;<br/>
                              &nbsp;&nbsp;<span className="text-purple-400">let</span> y = arr2.length;<br/>
                              &nbsp;&nbsp;<span className="text-purple-400">let</span> low = <span className="text-orange-400">0</span>, high = x;<br/>
                              <br/>
                              &nbsp;&nbsp;<span className="text-purple-400">while</span> (low &lt;= high) {'{'}<br/>
                              &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">let</span> partitionX = <span className="text-blue-300">Math</span>.floor((low + high) / <span className="text-orange-400">2</span>);<br/>
                              <div className="absolute w-[2px] h-3.5 bg-indigo-400 animate-pulse ml-[260px] mt-1 shadow-[0_0_8px_rgba(79,70,229,0.8)]" />
                            </div>
                          </div>
                        </div>

                        {/* Webcam Panel */}
                        <div className="w-[30%] border border-white/5 bg-[#0F172A] rounded-[18px] relative flex flex-col overflow-hidden shadow-sm">
                          <div className="absolute top-2 right-2 z-10 flex gap-2">
                            <div className="px-2 py-0.5 rounded-[10px] bg-black/60 border border-white/10 flex items-center gap-1.5 backdrop-blur-md shadow-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
                              <span className="text-[9px] font-semibold text-white/90 tracking-widest">REC 14:02</span>
                            </div>
                          </div>
                          {/* Fake Camera Feed */}
                          <div className="flex-1 relative bg-[#020617] flex justify-center pt-8 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent opacity-80 z-0" />
                            {/* Abstract user silhouette */}
                            <div className="w-28 h-28 rounded-full bg-white/[0.03] border border-white/[0.08] blur-[1px]" />
                            <div className="absolute bottom-[-10px] w-40 h-24 rounded-t-[3rem] bg-white/[0.03] border-t border-x border-white/[0.08] blur-[1px]" />
                          </div>
                          
                          {/* Audio/Mic indicators */}
                          <div className="h-9 border-t border-white/5 bg-white/[0.02] flex items-center justify-between px-3">
                            <div className="flex gap-[2px] items-end h-3 opacity-80">
                              {[30, 60, 40, 80, 50, 90, 40, 60, 30].map((h, i) => (
                                <motion.div 
                                  key={i} 
                                  animate={{ height: [`${h}%`, '10%', `${h}%`] }} 
                                  transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.1 }}
                                  className="w-[2px] bg-emerald-400 rounded-full" 
                                />
                              ))}
                            </div>
                            <div className="flex gap-2 text-white/40">
                              <Mic className="w-3 h-3" />
                              <Video className="w-3 h-3" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Grid: AI Conversation + Evaluation */}
                      <div className="flex-1 flex gap-2 overflow-hidden">
                        
                        {/* Conversation */}
                        <div className="flex-1 border border-white/5 bg-[#0F172A] rounded-[18px] flex flex-col overflow-hidden shadow-sm">
                          <div className="h-8 border-b border-white/5 bg-white/[0.02] flex items-center px-3">
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                              <span className="text-[10px] font-medium text-white/60">Live Transcription</span>
                            </div>
                          </div>
                          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 relative">
                            {/* Gradient mask at top/bottom for scrolling effect */}
                            <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-[#0F172A] to-transparent pointer-events-none" />
                            
                            <div className="flex gap-3 max-w-[90%]">
                              <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                                <Brain className="w-3 h-3 text-indigo-400" />
                              </div>
                              <div className="bg-white/5 border border-white/10 rounded-[14px] rounded-tl-sm p-3 shadow-sm">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className="text-[10px] font-semibold text-indigo-400">AI Interviewer</span>
                                  <span className="text-[9px] text-white/30">14:01</span>
                                </div>
                                <p className="text-[11px] text-white/80 leading-[1.6]">Can you explain the difference between synchronous and asynchronous programming, and when you would prefer one over the other?</p>
                              </div>
                            </div>

                            <div className="flex gap-3 max-w-[90%] self-end flex-row-reverse">
                              <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-[9px] font-bold text-white">C</span>
                              </div>
                              <div className="bg-indigo-600/20 border border-indigo-500/20 rounded-[14px] rounded-tr-sm p-3 shadow-sm">
                                <div className="flex items-center justify-end gap-2 mb-1.5">
                                  <span className="text-[9px] text-white/30">14:02</span>
                                  <span className="text-[10px] font-semibold text-white/70">Candidate</span>
                                </div>
                                <p className="text-[11px] text-white/80 leading-[1.6] text-right">Synchronous execution blocks the thread until the task completes. Asynchronous allows the thread to continue, which is ideal for I/O bound operations like network requests.</p>
                              </div>
                            </div>
                            
                            {/* Typing indicator */}
                            <div className="flex gap-3 max-w-[90%]">
                              <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                                <Brain className="w-3 h-3 text-indigo-400" />
                              </div>
                              <div className="bg-white/5 border border-white/10 rounded-[14px] rounded-tl-sm px-3 py-2 flex items-center gap-1 shadow-sm">
                                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-1 h-1 rounded-full bg-indigo-400" />
                                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 rounded-full bg-indigo-400" />
                                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 rounded-full bg-indigo-400" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Evaluation Insights */}
                        <div className="w-[30%] border border-white/5 bg-[#0F172A] rounded-[18px] p-4 flex flex-col gap-4 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-2xl rounded-full" />
                          <span className="text-[9px] font-bold tracking-widest text-white/40 uppercase">Live Evaluation</span>
                          
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between text-[10px] mb-1.5">
                                <span className="text-white/70">Problem Solving</span>
                                <span className="text-white font-medium">94/100</span>
                              </div>
                              <div className="h-1 bg-white/10 rounded-full overflow-hidden shadow-[inset_0_1px_1px_rgba(0,0,0,0.2)]">
                                <motion.div initial={{ width: 0 }} animate={{ width: '94%' }} transition={{ duration: 1 }} className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.8)]" />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-[10px] mb-1.5">
                                <span className="text-white/70">Code Quality</span>
                                <span className="text-white font-medium">88/100</span>
                              </div>
                              <div className="h-1 bg-white/10 rounded-full overflow-hidden shadow-[inset_0_1px_1px_rgba(0,0,0,0.2)]">
                                <motion.div initial={{ width: 0 }} animate={{ width: '88%' }} transition={{ duration: 1, delay: 0.1 }} className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-[10px] mb-1.5">
                                <span className="text-white/70">Communication</span>
                                <span className="text-white font-medium">91/100</span>
                              </div>
                              <div className="h-1 bg-white/10 rounded-full overflow-hidden shadow-[inset_0_1px_1px_rgba(0,0,0,0.2)]">
                                <motion.div initial={{ width: 0 }} animate={{ width: '91%' }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)]" />
                              </div>
                            </div>
                          </div>

                          <div className="mt-auto rounded-[14px] bg-indigo-500/10 border border-indigo-500/20 p-3 flex items-start gap-2 shadow-sm">
                            <Activity className="w-3 h-3 text-indigo-400 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-white/70 leading-[1.5]">
                              Strong algorithmic foundation detected. Recommend testing edge cases in next follow-up.
                            </p>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* --- METRICS SECTION --- */}
        <section className="mt-16 border-y border-white/5 bg-[#020617]/50 backdrop-blur-md">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-10 grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-white/5">
            {[
              { stat: '50K+', label: 'Interviews Conducted' },
              { stat: '92%', label: 'Confidence Improvement' },
              { stat: 'GPT-4o', label: 'Core AI Infrastructure' },
              { stat: '99.9%', label: 'Enterprise Uptime' }
            ].map((metric, i) => (
              <div key={i} className="flex flex-col items-center justify-center px-4 py-2 hover:bg-white/[0.02] transition-colors rounded-lg cursor-default">
                <span className="text-[28px] font-bold text-white mb-1.5 tracking-tight">{metric.stat}</span>
                <span className="text-[11px] text-white/50 font-medium tracking-wide uppercase">{metric.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* --- BOTTOM SECURITY BAR & FADE --- */}
        <section className="relative">
          <div className="py-8 max-w-[1440px] mx-auto px-6 lg:px-12 flex flex-wrap justify-center md:justify-start gap-8 opacity-60">
            <div className="flex items-center gap-2 text-[11px] font-medium text-white/50">
              <Shield className="w-3.5 h-3.5" /> 256-bit Encrypted Sessions
            </div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-white/50">
              <CheckCircle2 className="w-3.5 h-3.5" /> SOC 2 Compliant
            </div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-white/50">
              <Lock className="w-3.5 h-3.5" /> Enterprise Grade Security
            </div>
          </div>
          
          {/* Subtle bottom fade transition */}
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
        </section>

        {/* --- FEATURES SECTION --- */}
        <section id="features" className="py-32 px-6 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-white">Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">succeed.</span></h2>
              <p className="text-white/50 text-lg">Our platform replicates the exact environment, pressure, and evaluation criteria of top-tier tech companies.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Brain, title: 'Adaptive Intelligence', desc: 'GPT-4o dynamically adjusts question difficulty based on your previous answers.' },
                { icon: Mic, title: 'Real-Time Voice Analysis', desc: 'Speak naturally. We analyze your tone, pacing, filler words, and clarity.' },
                { icon: Code2, title: 'Live Coding Environment', desc: 'Integrated Monaco editor with execution for Python, JS, C++, and Java.' },
                { icon: Shield, title: 'Enterprise Proctoring', desc: 'Tab-switching detection, eye tracking, and fullscreen enforcement simulation.' },
                { icon: Activity, title: 'Behavioral Scoring', desc: 'STAR method evaluation for behavioral and leadership principles.' },
                { icon: BarChart3, title: 'Actionable Analytics', desc: 'Detailed post-interview reports highlighting weaknesses and ideal answers.' }
              ].map((feat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-indigo-500/30 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400 group-hover:scale-110 transition-transform">
                    <feat.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">{feat.title}</h3>
                  <p className="text-[14px] text-white/50 leading-relaxed">{feat.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* --- HOW IT WORKS --- */}
        <section id="how-it-works" className="py-32 px-6 bg-slate-950 border-y border-white/5">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">From preparation to offer</h2>
            </div>

            <div className="relative">
              {/* Line connector */}
              <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent -translate-y-1/2" />
              
              <div className="grid md:grid-cols-4 gap-8">
                {[
                  { step: '01', title: 'Choose Role', desc: 'Select domain & company target' },
                  { step: '02', title: 'Interview', desc: 'Live AI voice & code session' },
                  { step: '03', title: 'Analyze', desc: 'Get deep performance metrics' },
                  { step: '04', title: 'Improve', desc: 'Iterate based on targeted feedback' }
                ].map((s, i) => (
                  <div key={i} className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-950 border-2 border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold mb-6 shadow-[0_0_30px_rgba(79,70,229,0.2)]">
                      {s.step}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
                    <p className="text-[13px] text-white/50">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* --- TESTIMONIALS --- */}
        <section id="testimonials" className="py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">Candidates love us</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: 'Sarah Chen', role: 'SWE @ Google', quote: "The closest thing to a real FAANG interview. The system design feedback specifically caught edge cases I missed." },
                { name: 'Marcus Johnson', role: 'Frontend @ Vercel', quote: "Voice mode is incredible. It broke me out of my habit of rambling and helped me structure answers using STAR." },
                { name: 'Priya Patel', role: 'Backend @ Stripe', quote: "The proctoring simulation added exactly the right amount of pressure I needed to practice for the real deal." }
              ].map((t, i) => (
                <div key={i} className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex gap-1 mb-6">
                    {[1,2,3,4,5].map(star => <Star key={star} className="w-4 h-4 fill-indigo-400 text-indigo-400" />)}
                  </div>
                  <p className="text-[15px] text-white/70 leading-relaxed mb-8">"{t.quote}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white">
                      {t.name[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-[14px] text-white">{t.name}</div>
                      <div className="text-[12px] text-white/40">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- PRICING --- */}
        <section id="pricing" className="py-32 px-6 bg-slate-950 border-t border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">Simple, transparent pricing</h2>
              <p className="text-white/50 text-lg">Start for free. Upgrade when you're ready to master your interviews.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Plan */}
              <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] flex flex-col">
                <h3 className="text-xl font-semibold text-white mb-2">Basic</h3>
                <p className="text-[13px] text-white/50 mb-6">Perfect for testing the waters.</p>
                <div className="mb-8"><span className="text-5xl font-bold text-white">$0</span><span className="text-white/40 text-sm">/mo</span></div>
                
                <div className="flex-1 space-y-4 mb-8">
                  {['5 AI Interviews per month', 'Standard Voice Analysis', 'Basic Code Execution', 'Core Domains (DSA, Frontend)'].map((f, i) => (
                    <div key={i} className="flex items-center gap-3 text-[14px] text-white/70">
                      <CheckCircle2 className="w-4 h-4 text-white/20" /> {f}
                    </div>
                  ))}
                </div>
                
                <Link href="/auth/register" className="w-full py-4 rounded-xl font-semibold text-center text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  Get Started Free
                </Link>
              </div>

              {/* Pro Plan */}
              <div className="p-8 rounded-3xl bg-indigo-600/10 border border-indigo-500/30 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">Most Popular</div>
                <h3 className="text-xl font-semibold text-white mb-2">Pro</h3>
                <p className="text-[13px] text-white/50 mb-6">For serious candidates aiming for top-tier offers.</p>
                <div className="mb-8"><span className="text-5xl font-bold text-white">$15</span><span className="text-white/40 text-sm">/mo</span></div>
                
                <div className="flex-1 space-y-4 mb-8">
                  {['Unlimited AI Interviews', 'Advanced Behavioral Analysis', 'Company-Specific Modes (FAANG)', 'Full System Design Interviews', 'Priority AI Models (GPT-4o)'].map((f, i) => (
                    <div key={i} className="flex items-center gap-3 text-[14px] text-white/90">
                      <CheckCircle2 className="w-4 h-4 text-indigo-400" /> {f}
                    </div>
                  ))}
                </div>
                
                <Link href="/auth/register" className="w-full py-4 rounded-xl font-semibold text-center text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                  Upgrade to Pro
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* --- FAQ --- */}
        <section className="py-32 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-white mb-16">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: "How accurate is the AI feedback?", a: "Our AI is fine-tuned on thousands of real interview transcripts from top-tier companies. It accurately assesses technical correctness, time/space complexity, and behavioral communication patterns." },
                { q: "Can I practice for specific companies?", a: "Yes, Pro users can select company-specific modes (e.g., Google, Stripe) which adjusts the question style, difficulty, and evaluation strictness to match that company's standard." },
                { q: "Does the voice analysis really work?", a: "We use advanced Whisper AI for transcription combined with our custom NLP engine to analyze speaking pace, filler words, and sentiment in real-time." }
              ].map((faq, i) => (
                <div key={i} className="border border-white/5 rounded-xl bg-white/[0.02] overflow-hidden">
                  <button 
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full px-6 py-5 text-left flex justify-between items-center text-[15px] font-medium text-white hover:bg-white/[0.02]"
                  >
                    {faq.q}
                    <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {activeFaq === i && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 pb-5 text-[14px] text-white/50 leading-relaxed"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- CTA --- */}
        <section className="py-24 px-6 relative z-10">
          <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-b from-indigo-900/40 to-slate-950 border border-indigo-500/20 p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(79,70,229,0.3)_0%,transparent_70%)] pointer-events-none" />
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Stop guessing. Start practicing.</h2>
            <p className="text-lg text-white/60 mb-10 max-w-xl mx-auto">Get the exact feedback you need to turn your next interview into an offer.</p>
            <Link href="/auth/register" className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-xl font-bold text-[16px] text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-[0_0_30px_rgba(79,70,229,0.5)]">
              Start Your Free Interview <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

      </main>

      {/* --- FOOTER --- */}
      <footer className="border-t border-white/10 bg-slate-950 pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Brain className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-[15px] text-white">InterviewAI</span>
            </div>
            <p className="text-[13px] text-white/40 max-w-xs leading-relaxed">
              The world's most advanced AI interview platform. Built by engineers, for engineers.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-[13px]">Product</h4>
            <ul className="space-y-3 text-[13px] text-white/40">
              <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Domains</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-[13px]">Resources</h4>
            <ul className="space-y-3 text-[13px] text-white/40">
              <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Interview Guides</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-[13px]">Company</h4>
            <ul className="space-y-3 text-[13px] text-white/40">
              <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[12px] text-white/30">© 2026 InterviewAI Inc. All rights reserved.</p>
          <div className="flex gap-4">
            {/* Social icons placeholders */}
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"><span className="text-[10px]">X</span></div>
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"><span className="text-[10px]">in</span></div>
          </div>
        </div>
      </footer>

    </div>
  );
}
