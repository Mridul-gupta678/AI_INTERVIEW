// src/app/interview/setup/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, ChevronRight, Upload, Clock, Target, Zap, Server, Code2, Users, LayoutDashboard,
  Code, Terminal, Network, Database, Settings, Layers, Workflow, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { InterviewType, InterviewDomain, Difficulty } from '@/types';
import { DOMAIN_CONFIG, COMPANY_LIST } from '@/types';

const INTERVIEW_TYPES: { value: InterviewType; label: string; desc: string; icon: any }[] = [
  { value: 'TECHNICAL', label: 'Technical', desc: 'Core CS concepts & verbal architecture', icon: Terminal },
  { value: 'CODING', label: 'Live Coding', desc: 'Real-time algorithm execution in IDE', icon: Code2 },
  { value: 'BEHAVIORAL', label: 'Behavioral', desc: 'Leadership & culture fit', icon: Users },
  { value: 'MIXED', label: 'Hybrid', desc: 'Combined technical & soft skills', icon: Layers },
];

const DIFFICULTIES: { value: Difficulty; label: string; desc: string }[] = [
  { value: 'EASY', label: 'Foundation', desc: 'Entry-level concepts' },
  { value: 'MEDIUM', label: 'Intermediate', desc: 'Mid-level architecture' },
  { value: 'HARD', label: 'Advanced', desc: 'Staff/Principal level' },
];

const DOMAIN_GROUPS = [
  {
    title: 'Core Fundamentals',
    keys: ['DSA', 'OS', 'DBMS', 'CN'] as InterviewDomain[],
    icons: { DSA: Code, OS: Settings, DBMS: Database, CN: Network }
  },
  {
    title: 'Software Engineering',
    keys: ['FULL_STACK', 'FRONTEND', 'BACKEND', 'SYSTEM_DESIGN', 'MACHINE_LEARNING'] as InterviewDomain[],
    icons: { FULL_STACK: Layers, FRONTEND: LayoutDashboard, BACKEND: Server, SYSTEM_DESIGN: Workflow, MACHINE_LEARNING: Brain }
  },
  {
    title: 'Specialized',
    keys: ['HR_BEHAVIORAL'] as InterviewDomain[],
    icons: { HR_BEHAVIORAL: Users }
  }
];

export default function InterviewSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    type: '' as InterviewType,
    domain: '' as InterviewDomain,
    difficulty: 'MEDIUM' as Difficulty,
    company: '',
    duration: 45,
    useResume: false,
    resumeFile: null as File | null,
  });

  const handleStart = async () => {
    if (!config.type || !config.domain) {
      toast.error('Please configure all essential parameters');
      return;
    }

    setLoading(true);
    try {
      let resumeId: string | undefined;

      if (config.resumeFile) {
        const formData = new FormData();
        formData.append('resume', config.resumeFile);
        const uploadRes = await fetch('/api/resume', { method: 'POST', body: formData });
        if (uploadRes.ok) {
          const { resume } = await uploadRes.json();
          resumeId = resume.id;
        }
      }

      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: config.type,
          domain: config.domain,
          difficulty: config.difficulty,
          company: config.company || undefined,
          resumeId,
          duration: config.duration,
        }),
      });

      if (!res.ok) throw new Error('Initialization sequence failed');

      const { session } = await res.json();
      router.push(`/interview/${session.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to initialize AI instance.');
    } finally {
      setLoading(false);
    }
  };

  const aiRecommendation = () => {
    if (!config.domain) return "Select a specialization to receive AI configuration insights.";
    if (config.domain === 'SYSTEM_DESIGN' && config.difficulty === 'EASY') return "System Design is rarely tested at entry-level. Consider adjusting to Intermediate or Advanced.";
    if (config.type === 'CODING' && config.domain === 'HR_BEHAVIORAL') return "Warning: Live coding requires a technical domain like DSA or Full Stack.";
    return "Configuration looks optimal. The AI will adapt dynamically based on your real-time performance.";
  };

  return (
    <div className="min-h-screen bg-[#070B14] py-12 px-6 relative overflow-hidden text-slate-200 font-sans z-10">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.15)]">
              <Brain className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="text-sm font-semibold tracking-widest uppercase text-indigo-400">Environment Setup</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Configure Interview Engine</h1>
          <p className="text-slate-400 mt-2 font-light text-lg">Initialize your intelligent evaluator and parameters.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Main Flow */}
          <div className="flex-1 max-w-3xl">
            {/* Minimal Stepper */}
            <div className="flex items-center gap-3 mb-10">
              {[1, 2, 3].map((s) => {
                const isActive = step === s;
                const isCompleted = step > s;
                return (
                  <div key={s} className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-500 ${
                      isActive ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.3)]' :
                      isCompleted ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white/5 border-white/10 text-slate-500'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-bold">{s}</span>}
                    </div>
                    {s < 3 && (
                      <div className={`h-[2px] w-12 sm:w-20 mx-3 transition-all duration-500 ${isCompleted ? 'bg-indigo-500' : 'bg-white/5'}`} />
                    )}
                  </div>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {/* Step 1 */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                  
                  <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Evaluation Modality</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                    {INTERVIEW_TYPES.map((type) => {
                      const Icon = type.icon;
                      const selected = config.type === type.value;
                      return (
                        <button
                          key={type.value}
                          onClick={() => setConfig(c => ({ ...c, type: type.value }))}
                          className={`p-5 rounded-2xl text-left transition-all duration-300 relative overflow-hidden group ${
                            selected 
                              ? 'bg-[#111827] border-indigo-500/50 shadow-[0_0_25px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/50' 
                              : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] border hover:border-white/10'
                          }`}
                        >
                          {selected && <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none" />}
                          <Icon className={`w-6 h-6 mb-4 transition-colors ${selected ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                          <p className={`font-semibold mb-1 tracking-tight ${selected ? 'text-white' : 'text-slate-200'}`}>{type.label}</p>
                          <p className="text-xs text-slate-500 font-light">{type.desc}</p>
                        </button>
                      );
                    })}
                  </div>

                  <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Domain Specialization</h2>
                  <div className="space-y-8 mb-10">
                    {DOMAIN_GROUPS.map((group) => (
                      <div key={group.title}>
                        <h3 className="text-xs text-slate-500 mb-3 border-b border-white/5 pb-2 uppercase tracking-widest font-medium">{group.title}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {group.keys.map((key) => {
                            const domain = DOMAIN_CONFIG[key];
                            const selected = config.domain === key;
                            const IconComponent = (group.icons as any)[key] || Target;
                            return (
                              <button
                                key={key}
                                onClick={() => setConfig(c => ({ ...c, domain: key }))}
                                className={`p-4 rounded-xl text-left transition-all duration-300 flex items-center gap-3 ${
                                  selected
                                    ? 'bg-indigo-500/10 border border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                                    : 'bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10'
                                }`}
                              >
                                <IconComponent className={`w-4 h-4 ${selected ? 'text-indigo-400' : 'text-slate-500'}`} />
                                <span className={`text-sm font-medium tracking-tight ${selected ? 'text-indigo-100' : 'text-slate-300'}`}>
                                  {domain.label.replace(' Dev', '')}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    disabled={!config.type || !config.domain}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] disabled:opacity-50 disabled:grayscale transition-all duration-300"
                  >
                    Proceed to Parameters <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                  
                  <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Difficulty Calibration</h2>
                  <div className="grid grid-cols-3 gap-3 mb-10 bg-white/[0.02] p-1.5 rounded-2xl border border-white/5">
                    {DIFFICULTIES.map((d) => {
                      const selected = config.difficulty === d.value;
                      return (
                        <button
                          key={d.value}
                          onClick={() => setConfig(c => ({ ...c, difficulty: d.value }))}
                          className={`py-3 px-2 rounded-xl text-center transition-all duration-300 ${
                            selected 
                              ? 'bg-[#111827] border border-white/10 shadow-xl' 
                              : 'hover:bg-white/[0.02] text-slate-400'
                          }`}
                        >
                          <p className={`text-sm font-semibold ${selected ? 'text-white' : ''}`}>{d.label}</p>
                          <p className={`text-[10px] mt-1 ${selected ? 'text-indigo-300' : 'text-slate-500'}`}>{d.desc}</p>
                        </button>
                      );
                    })}
                  </div>

                  <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                    Company Persona
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-400">Optional</span>
                  </h2>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-10">
                    {COMPANY_LIST.slice(0, 10).map((company) => {
                      const selected = config.company === company;
                      return (
                        <button
                          key={company}
                          onClick={() => setConfig(c => ({ ...c, company: selected ? '' : company }))}
                          className={`px-3 py-2.5 rounded-lg border text-xs font-semibold tracking-wide transition-all duration-300 ${
                            selected
                              ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.1)]'
                              : 'bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/[0.05] hover:border-white/10'
                          }`}
                        >
                          {company}
                        </button>
                      );
                    })}
                  </div>

                  <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Session Duration</h2>
                  <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl mb-10">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-3xl font-bold text-white">{config.duration}<span className="text-sm text-slate-500 font-normal ml-1">minutes</span></span>
                      <Clock className="w-5 h-5 text-indigo-400/50" />
                    </div>
                    <input
                      type="range"
                      min={15} max={90} step={15}
                      value={config.duration}
                      onChange={e => setConfig(c => ({ ...c, duration: +e.target.value }))}
                      className="w-full accent-indigo-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-3 font-semibold tracking-widest">
                      <span>15M</span><span>45M</span><span>90M</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setStep(1)} className="px-6 py-4 rounded-xl bg-white/[0.03] border border-white/5 text-slate-300 font-semibold hover:bg-white/[0.06] transition-all">
                      Back
                    </button>
                    <button onClick={() => setStep(3)} className="flex-1 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all">
                      Finalize Profile <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                  
                  <div className="bg-gradient-to-br from-[#111827] to-[#0B1020] border border-white/10 p-8 rounded-3xl mb-8 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-violet-600" />
                    <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-3">
                      <Upload className="w-5 h-5 text-indigo-400" />
                      Context Injection
                    </h2>
                    <p className="text-sm text-slate-400 mb-6 font-light">Upload your resume to allow the AI to extract context and personalize architectural or behavioral questions.</p>

                    <label className={`block w-full border border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
                      config.resumeFile
                        ? 'border-emerald-500/50 bg-emerald-500/5'
                        : 'border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 bg-white/[0.02]'
                    }`}>
                      <input type="file" accept=".pdf" className="hidden" onChange={e => setConfig(c => ({ ...c, resumeFile: e.target.files?.[0] || null }))} />
                      {config.resumeFile ? (
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                          <p className="text-emerald-300 font-semibold">{config.resumeFile.name}</p>
                          <p className="text-xs text-emerald-500/70 mt-1 uppercase tracking-widest">Context Loaded</p>
                        </motion.div>
                      ) : (
                        <div>
                          <Upload className="w-8 h-8 text-slate-500 mx-auto mb-3 group-hover:text-indigo-400 transition-colors" />
                          <p className="text-sm font-semibold text-slate-300 mb-1">Click or drag PDF</p>
                          <p className="text-xs text-slate-500">Max 5MB processing limit</p>
                        </div>
                      )}
                    </label>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setStep(2)} className="px-6 py-4 rounded-xl bg-white/[0.03] border border-white/5 text-slate-300 font-semibold hover:bg-white/[0.06] transition-all">
                      Back
                    </button>
                    <button
                      onClick={handleStart}
                      disabled={loading}
                      className="flex-1 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold text-lg flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] disabled:opacity-50 transition-all"
                    >
                      {loading ? (
                        <span className="flex items-center gap-3">
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Initializing Core...
                        </span>
                      ) : (
                        <>
                          <Zap className="w-5 h-5" />
                          Boot Interview Engine
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Preview Panel (Hidden on Mobile, sticky on Desktop) */}
          <div className="hidden lg:block w-80">
            <div className="sticky top-12 bg-white/[0.01] backdrop-blur-3xl border border-white/5 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" /> Live Preview
              </h3>
              
              <div className="space-y-5">
                <div className="bg-[#0B1020] rounded-xl p-4 border border-white/5">
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1">Architecture</p>
                  <p className="text-sm font-medium text-white">{config.type ? INTERVIEW_TYPES.find(t => t.value === config.type)?.label : 'Pending Selection'}</p>
                </div>
                
                <div className="bg-[#0B1020] rounded-xl p-4 border border-white/5">
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1">Domain Vector</p>
                  <p className="text-sm font-medium text-indigo-300">{config.domain ? DOMAIN_CONFIG[config.domain]?.label : 'Pending Selection'}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0B1020] rounded-xl p-4 border border-white/5">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1">Calibration</p>
                    <p className="text-sm font-medium text-white">{config.difficulty}</p>
                  </div>
                  <div className="bg-[#0B1020] rounded-xl p-4 border border-white/5">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-1">Timebox</p>
                    <p className="text-sm font-medium text-white">{config.duration}m</p>
                  </div>
                </div>

                {config.company && (
                  <div className="bg-[#0B1020] rounded-xl p-4 border border-indigo-500/20">
                    <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-semibold mb-1">Target Persona</p>
                    <p className="text-sm font-medium text-white">{config.company} Framework</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-white/5">
                <p className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold mb-2">AI Diagnostic</p>
                <p className="text-xs text-slate-400 leading-relaxed font-light">{aiRecommendation()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
