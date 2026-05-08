"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Brain, Code2, Play, Zap, Shield, CheckCircle2,
  Sparkles, Mic, BarChart3, ChevronRight, Star, Quote, Users,
  Activity, Video, LayoutDashboard, Terminal, MessageSquare,
  ChevronDown, Menu, X, TrendingUp
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
    <div className="min-h-screen bg-[#03050c] text-white selection:bg-indigo-500/30 overflow-x-hidden font-sans">
      
      {/* --- BACKGROUND SYSTEM --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Deep base with noise */}
        <div className="absolute inset-0 bg-[#03050c]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
        
        {/* Soft Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        {/* Hero Glows */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] opacity-60 mix-blend-screen" />
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] opacity-50 mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] opacity-40 mix-blend-screen" />
      </div>

      {/* --- NAVBAR --- */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b ${
        isScrolled 
          ? 'bg-[#03050c]/80 backdrop-blur-xl border-white/5 shadow-2xl shadow-black/50 py-3' 
          : 'bg-transparent border-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow duration-300">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[15px] tracking-tight text-white">InterviewAI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {['Features', 'How it Works', 'Testimonials', 'Pricing'].map(item => (
              <Link key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="text-[13px] font-medium text-white/60 hover:text-white transition-colors">
                {item}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/auth/login" className="text-[13px] font-medium text-white/70 hover:text-white transition-colors">
              Log In
            </Link>
            <Link href="/auth/register" className="relative group px-5 py-2 rounded-lg text-[13px] font-semibold text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10">Start Interview</span>
            </Link>
          </div>

          <button className="md:hidden text-white/70 hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      <main className="relative z-10 pt-32 pb-20">
        
        {/* --- HERO SECTION --- */}
        <section className="px-6 relative">
          <motion.div 
            className="max-w-5xl mx-auto text-center"
            initial="hidden" animate="visible" variants={staggerContainer}
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-10 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Powered by GPT-4o + Real-Time AI Analysis</span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl lg:text-[84px] font-extrabold tracking-[-0.03em] leading-[1.08] mb-10 text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/70">
              Confidence Starts<br />
              <span className="relative inline-block mt-2">
                <span className="absolute -inset-4 bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-cyan-500/30 blur-2xl rounded-full"></span>
                <span className="relative bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                  Before the Interview.
                </span>
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg md:text-xl font-light max-w-2xl mx-auto mb-12 text-white/50 leading-relaxed">
              Experience enterprise-grade AI mock interviews. Adaptive questioning, live code execution, voice analysis, and actionable feedback to land your dream offer.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
              <Link href="/auth/register" className="group relative flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-[15px] text-white bg-indigo-600 overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 transition-all opacity-100 group-hover:opacity-0" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 transition-all opacity-0 group-hover:opacity-100" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-[radial-gradient(circle_at_center,white_0%,transparent_100%)] blur-md transition-opacity" />
                <span className="relative z-10 flex items-center gap-2">Start Free Interview <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
              </Link>
              
              <button className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-xl font-medium text-[15px] text-white/80 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all backdrop-blur-sm">
                <Play className="w-4 h-4" /> Watch Demo
              </button>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-xs font-medium text-white/40">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> No credit card required</span>
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-indigo-400" /> 10,000+ candidates</span>
              <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-indigo-400" /> 92% confidence boost</span>
            </motion.div>
          </motion.div>
        </section>

        {/* --- PRODUCT MOCKUP --- */}
        <section className="mt-24 px-4 relative z-20">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-6xl mx-auto"
          >
            <div className="relative rounded-2xl p-2 bg-white/5 border border-white/10 shadow-[0_0_100px_-20px_rgba(79,70,229,0.3)] backdrop-blur-xl">
              {/* Fake Browser Chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-black/40 rounded-t-xl">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="mx-auto bg-white/5 border border-white/10 rounded-md px-4 py-1 text-[10px] text-white/40 flex items-center gap-2">
                  <Shield className="w-3 h-3" />
                  interviewai.com/session/tech-round-1
                </div>
              </div>

              {/* Dashboard Layout */}
              <div className="bg-[#0a0a0a] rounded-b-xl overflow-hidden flex flex-col md:flex-row h-[600px]">
                
                {/* Left Panel - Code/Editor */}
                <div className="flex-1 border-r border-white/5 flex flex-col relative overflow-hidden">
                  <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <div className="flex gap-4">
                      <span className="text-xs font-semibold text-white">main.py</span>
                      <span className="text-xs text-white/40">GraphTraversal</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-[10px] font-bold uppercase">Proctor Active</span>
                    </div>
                  </div>
                  <div className="p-4 font-mono text-[13px] leading-relaxed text-white/70 relative">
                    <span className="text-purple-400">def</span> <span className="text-blue-400">bfs</span>(graph, start):<br/>
                    &nbsp;&nbsp;visited = set()<br/>
                    &nbsp;&nbsp;queue = [start]<br/>
                    <br/>
                    &nbsp;&nbsp;<span className="text-purple-400">while</span> queue:<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;node = queue.pop(0)<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">if</span> node <span className="text-purple-400">not in</span> visited:<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;visited.add(node)<br/>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;queue.extend(graph[node] - visited)<br/>
                    &nbsp;&nbsp;<span className="text-purple-400">return</span> visited
                    
                    {/* Animated Cursor */}
                    <motion.div 
                      animate={{ opacity: [1, 0] }} 
                      transition={{ repeat: Infinity, duration: 0.8 }} 
                      className="absolute bottom-[-2px] ml-1 w-2 h-4 bg-white/80 inline-block"
                      style={{ left: '160px', top: '180px' }}
                    />
                  </div>

                  {/* Floating AI Panel */}
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex gap-4"
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                      <Brain className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-indigo-400 mb-1">AI Interviewer</p>
                      <p className="text-sm text-white/90">That's a solid BFS implementation. Can you analyze its time and space complexity assuming an adjacency list representation?</p>
                    </div>
                  </motion.div>
                </div>

                {/* Right Panel - Video/Analytics */}
                <div className="w-full md:w-80 bg-[#0a0a0a] flex flex-col">
                  {/* Fake Webcam */}
                  <div className="p-4 border-b border-white/5 relative aspect-video bg-[#111] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_100%)]" />
                    <Video className="w-8 h-8 text-white/20" />
                    {/* UI Overlays on webcam */}
                    <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/60 backdrop-blur-sm border border-white/10 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[9px] font-bold text-white tracking-widest">REC</span>
                    </div>
                    <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-black/60 backdrop-blur-sm border border-white/10">
                      <span className="text-[10px] text-white">Confidence: <span className="text-green-400">94%</span></span>
                    </div>
                  </div>

                  {/* Live Metrics */}
                  <div className="p-5 flex-1 overflow-y-auto">
                    <h3 className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-4">Real-Time Analysis</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1.5">
                          <span className="text-white/60">Technical Accuracy</span>
                          <span className="text-white font-medium">92%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <motion.div initial={{ width: 0 }} whileInView={{ width: '92%' }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-indigo-500" />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-[11px] mb-1.5">
                          <span className="text-white/60">Speaking Pace</span>
                          <span className="text-white font-medium">Optimal</span>
                        </div>
                        <div className="flex gap-1 h-3">
                          {[...Array(20)].map((_, i) => (
                            <motion.div 
                              key={i} 
                              animate={{ height: ['40%', '100%', '40%'] }} 
                              transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.1 }}
                              className={`flex-1 rounded-sm ${i > 5 && i < 15 ? 'bg-green-400' : 'bg-white/10'}`} 
                            />
                          ))}
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-white/5">
                        <h3 className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-3">Live Transcript</h3>
                        <p className="text-xs text-white/60 leading-relaxed">
                          "I used a queue because it guarantees that we visit all nodes at depth <span className="bg-white/10 text-white px-1 rounded">d</span> before moving to..."
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* --- SOCIAL PROOF --- */}
        <section className="pt-32 pb-20 px-6 border-b border-white/5">
          <div className="max-w-6xl mx-auto">
            <p className="text-center text-[13px] font-medium text-white/40 uppercase tracking-widest mb-10">
              Trusted by candidates landing offers at
            </p>
            <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {['Google', 'Meta', 'Amazon', 'Microsoft', 'Netflix', 'Stripe'].map(company => (
                <span key={company} className="text-xl md:text-2xl font-bold tracking-tight text-white">{company}</span>
              ))}
            </div>
            
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/5 pt-12">
              {[
                { label: 'Interviews Completed', value: '500k+' },
                { label: 'Offer Rate', value: '89%' },
                { label: 'Confidence Boost', value: '3x' },
                { label: 'Average Rating', value: '4.9/5' }
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-[12px] text-white/40 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
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
        <section id="how-it-works" className="py-32 px-6 bg-[#050814] border-y border-white/5">
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
                    <div className="w-16 h-16 rounded-full bg-[#050814] border-2 border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold mb-6 shadow-[0_0_30px_rgba(79,70,229,0.2)]">
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
        <section id="pricing" className="py-32 px-6 bg-[#050814] border-t border-white/5 relative overflow-hidden">
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
          <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-b from-indigo-900/40 to-[#03050c] border border-indigo-500/20 p-12 text-center relative overflow-hidden">
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
      <footer className="border-t border-white/10 bg-[#020308] pt-16 pb-8 px-6">
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
