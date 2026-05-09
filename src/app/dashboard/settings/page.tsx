'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { 
  User, Briefcase, Code2, Save, Upload, Shield, 
  Settings2, Activity, Monitor, Eye, FileText, Cpu, Mic, 
  CheckCircle2, Cloud, SlidersHorizontal, Radio, Layers, 
  Github, Linkedin, Volume2, Fingerprint, Lock, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import React from 'react';

const TABS = [
  { id: 'profile', label: 'Identity & Profile', icon: User },
  { id: 'interview', label: 'Interview Setup', icon: Briefcase },
  { id: 'ai', label: 'AI Intelligence', icon: Cpu },
  { id: 'security', label: 'Security & Proctoring', icon: Shield },
  { id: 'voice', label: 'Voice & Interaction', icon: Mic },
];

const EXPERIENCE_LEVELS = [
  { value: 'fresher', label: 'Fresher (0 yrs)' },
  { value: '1-2', label: '1–2 yrs' },
  { value: '3-5', label: '3–5 yrs' },
  { value: '5+', label: '5+ yrs' },
];

const COMMON_STACKS = [
  'React', 'Next.js', 'Node.js', 'Python', 'Django', 'FastAPI',
  'Java', 'Spring Boot', 'C++', 'Go', 'TypeScript', 'PostgreSQL',
  'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Rust'
];

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('profile');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'saved'>('idle');
  const [uploading, setUploading] = useState(false);
  const [resumes, setResumes] = useState<any[]>([]);
  const isInitialLoad = useRef(true);

  const [form, setForm] = useState({
    name: '',
    bio: '',
    targetRole: '',
    experience: 'fresher',
    preferredStack: [] as string[],
    linkedinUrl: '',
    githubUrl: '',
    advanced: {
      strictness: 7,
      adaptiveDifficulty: true,
      followUpDepth: true,
      realisticMode: true,
      codingFocus: 'balanced',
      faceTracking: true,
      fullscreenEnforcement: true,
      tabMonitoring: true,
      sessionRecording: false,
      aiVoice: 'onyx',
      speakingSpeed: 1.0,
      communicationStyle: 'concise'
    }
  });

  useEffect(() => {
    loadProfile();
    loadResumes();
  }, []);

  // Realtime Sync Effect
  useEffect(() => {
    if (isInitialLoad.current) return;
    
    setSyncStatus('syncing');
    const timer = setTimeout(() => {
      saveProfile();
    }, 1500);

    return () => clearTimeout(timer);
  }, [form]);

  const loadProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        const serverAdv = data.profile?.advancedSettings || form.advanced;

        if (data.profile) {
          setForm(f => ({
            ...f,
            name: data.user?.name || '',
            bio: data.profile.bio || '',
            targetRole: data.profile.targetRole || '',
            experience: data.profile.experience || 'fresher',
            preferredStack: data.profile.preferredStack || [],
            linkedinUrl: data.profile.linkedinUrl || '',
            githubUrl: data.profile.githubUrl || '',
            advanced: serverAdv
          }));
        }
      }
    } finally {
      setTimeout(() => { isInitialLoad.current = false; }, 500);
    }
  };

  const loadResumes = async () => {
    const res = await fetch('/api/resume');
    if (res.ok) {
      const data = await res.json();
      setResumes(data.resumes || []);
    }
  };

  const saveProfile = async () => {
    try {
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          bio: form.bio,
          targetRole: form.targetRole,
          experience: form.experience,
          preferredStack: form.preferredStack,
          linkedinUrl: form.linkedinUrl,
          githubUrl: form.githubUrl,
          advancedSettings: form.advanced
        }),
      });
      setSyncStatus('saved');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch {
      setSyncStatus('idle');
      toast.error('Sync failed', { id: 'sync-error' });
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    toast.loading('Parsing technical resume...', { id: 'upload' });
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await fetch('/api/resume', { method: 'POST', body: formData });
      if (!res.ok) throw new Error();
      toast.success('Resume vectorized & active', { id: 'upload' });
      loadResumes();
    } catch {
      toast.error('Resume upload failed', { id: 'upload' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const toggleStack = (tech: string) => {
    setForm(f => ({
      ...f,
      preferredStack: f.preferredStack.includes(tech)
        ? f.preferredStack.filter(t => t !== tech)
        : [...f.preferredStack, tech],
    }));
  };

  const updateAdvanced = (key: keyof typeof form.advanced, value: any) => {
    setForm(f => ({
      ...f,
      advanced: { ...f.advanced, [key]: value }
    }));
  };

  const InputField = ({ icon: Icon, label, value, onChange, placeholder, type = 'text', multiline = false }: any) => (
    <div className="relative group">
      <div className="absolute top-3 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-violet-500 transition-colors z-10">
        <Icon className="w-4 h-4" />
      </div>
      {multiline ? (
        <textarea 
          className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-transparent focus:bg-slate-900 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all peer resize-none h-24 shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] hover:border-white/10"
          placeholder={placeholder} value={value} onChange={onChange}
        />
      ) : (
        <input 
          type={type}
          className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-transparent focus:bg-slate-900 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all peer shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] hover:border-white/10"
          placeholder={placeholder} value={value} onChange={onChange}
        />
      )}
      <label className="absolute text-[10px] text-slate-500 uppercase tracking-widest bg-[#030303] px-2 left-9 -top-2 peer-focus:text-violet-500 transition-colors rounded-sm pointer-events-none font-semibold">
        {label}
      </label>
      <div className="absolute inset-0 bg-violet-500/5 rounded-xl opacity-0 peer-focus:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );

  const ToggleSwitch = ({ label, description, checked, onChange }: any) => (
    <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-colors cursor-pointer group" onClick={() => onChange(!checked)}>
      <div className="flex-1 pr-4">
        <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{label}</p>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
      </div>
      <div className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${checked ? 'bg-indigo-500' : 'bg-slate-800'}`}>
        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-md ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-violet-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full opacity-50" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-violet-500/5 blur-[100px] rounded-full opacity-50" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZUZpbHRlciI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuODUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgibm9pc2VGaWx0ZXIpIiBvcGFjaXR5PSIwLjA1Ii8+PC9zdmc+')] mix-blend-overlay" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 relative z-10">
        
        {/* Settings Hero */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-3">
              Interview Preferences
            </h1>
            <p className="text-slate-400 text-lg font-light max-w-xl leading-relaxed">
              Personalize your AI interview environment, technical profile, and advanced simulation strictness.
            </p>
          </div>
          
          {/* Sync Indicator */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/5 backdrop-blur-md">
            {syncStatus === 'syncing' ? (
              <Cloud className="w-4 h-4 text-indigo-400 animate-pulse" />
            ) : syncStatus === 'saved' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Cloud className="w-4 h-4 text-slate-500" />
            )}
            <span className="text-xs font-medium text-slate-300 uppercase tracking-wider">
              {syncStatus === 'syncing' ? 'Syncing...' : syncStatus === 'saved' ? 'Saved just now' : 'Synced'}
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Sidebar Navigation */}
          <div className="w-full lg:w-64 shrink-0 space-y-2">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative overflow-hidden group ${isActive ? 'bg-violet-500/10 text-white' : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'}`}
                >
                  {isActive && <motion.div layoutId="activeTab" className="absolute left-0 w-1 inset-y-0 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-r-full shadow-[0_0_10px_#8b5cf6]" />}
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-violet-500' : 'group-hover:text-slate-300'}`} />
                  <span className="text-sm font-semibold tracking-wide">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                
                {/* ----------------- PROFILE TAB ----------------- */}
                {activeTab === 'profile' && (
                  <div className="space-y-8">
                    {/* Profile Overview Card */}
                    <div className="p-8 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 p-0.5 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                          <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center overflow-hidden">
                            {session?.user?.image ? (
                              <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-10 h-10 text-white/50" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 text-center sm:text-left space-y-2">
                          <h2 className="text-2xl font-bold text-white tracking-tight">{form.name || session?.user?.name || 'Candidate Profile'}</h2>
                          <p className="text-slate-400 font-medium">{form.targetRole || 'Set your target role below'}</p>
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
                            <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-widest flex items-center gap-1.5">
                              <Activity className="w-3.5 h-3.5" /> AI Ready
                            </span>
                            <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold uppercase tracking-widest">
                              {EXPERIENCE_LEVELS.find(e => e.value === form.experience)?.label || 'Fresher'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField icon={User} label="Full Name" value={form.name} onChange={(e: any) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Doe" />
                      <InputField icon={Briefcase} label="Target Role" value={form.targetRole} onChange={(e: any) => setForm(f => ({ ...f, targetRole: e.target.value }))} placeholder="Senior Frontend Engineer" />
                    </div>

                    <InputField icon={FileText} label="Bio & Professional Summary" value={form.bio} onChange={(e: any) => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Detail your career objectives and core strengths..." multiline />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField icon={Linkedin} label="LinkedIn Profile" value={form.linkedinUrl} onChange={(e: any) => setForm(f => ({ ...f, linkedinUrl: e.target.value }))} placeholder="https://linkedin.com/in/..." />
                      <InputField icon={Github} label="GitHub Profile" value={form.githubUrl} onChange={(e: any) => setForm(f => ({ ...f, githubUrl: e.target.value }))} placeholder="https://github.com/..." />
                    </div>
                  </div>
                )}

                {/* ----------------- INTERVIEW SETUP TAB ----------------- */}
                {activeTab === 'interview' && (
                  <div className="space-y-8">
                    <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.01]">
                      <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-6 flex items-center gap-2"><Briefcase className="w-4 h-4"/> Experience Level</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {EXPERIENCE_LEVELS.map(({ value, label }) => (
                          <button key={value} onClick={() => setForm(f => ({ ...f, experience: value }))}
                            className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-all shadow-sm ${
                              form.experience === value
                                ? 'border-violet-500 bg-violet-500/10 text-white shadow-[0_0_20px_rgba(139,92,246,0.15)]'
                                : 'border-white/5 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-slate-200'
                            }`}>
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.01]">
                      <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-6 flex items-center gap-2"><Code2 className="w-4 h-4"/> Preferred Tech Stack</h3>
                      <div className="flex flex-wrap gap-2.5">
                        {COMMON_STACKS.map(tech => {
                          const isActive = form.preferredStack.includes(tech);
                          return (
                            <button key={tech} onClick={() => toggleStack(tech)}
                              className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-300 ${
                                isActive
                                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                                  : 'border-white/5 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:bg-white/[0.04]'
                              }`}>
                              {tech}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.01]">
                      <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-6 flex items-center gap-2"><Upload className="w-4 h-4"/> Knowledge Base (Resume)</h3>
                      <label className="block w-full border-2 border-dashed border-white/10 rounded-2xl p-8 text-center cursor-pointer hover:border-violet-500/50 hover:bg-violet-500/5 transition-all group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/0 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <input type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} />
                        {uploading ? (
                          <div className="flex flex-col items-center justify-center gap-3 relative z-10">
                            <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin shadow-[0_0_15px_#8b5cf6]" />
                            <span className="text-sm font-semibold text-indigo-300 animate-pulse">Vectorizing Document...</span>
                          </div>
                        ) : (
                          <div className="relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-violet-500/20 transition-all duration-500">
                              <Upload className="w-6 h-6 text-slate-400 group-hover:text-indigo-300 transition-colors" />
                            </div>
                            <p className="text-base font-semibold text-white mb-1">Upload PDF Resume</p>
                            <p className="text-sm text-slate-500">AI will personalize system design & coding questions based on your experience.</p>
                          </div>
                        )}
                      </label>

                      {resumes.length > 0 && (
                        <div className="mt-6 space-y-3">
                          {resumes.map(r => (
                            <div key={r.id} className={`flex items-center gap-4 px-5 py-4 rounded-xl border transition-colors ${r.isActive ? 'border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.05)]' : 'border-white/5 bg-white/[0.02]'}`}>
                              <FileText className={`w-5 h-5 ${r.isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                              <span className="flex-1 text-sm font-semibold text-slate-200 truncate">{r.fileName}</span>
                              {r.isActive && <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-[10px] uppercase tracking-widest text-emerald-400 font-bold">Active Vector</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ----------------- AI INTELLIGENCE TAB ----------------- */}
                {activeTab === 'ai' && (
                  <div className="space-y-6">
                    <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.01]">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-sm font-bold text-white flex items-center gap-2"><Zap className="w-4 h-4 text-violet-500"/> Interview Strictness</h3>
                          <p className="text-xs text-slate-500 mt-1">Adjust the FAANG calibration strictness (1-10)</p>
                        </div>
                        <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">
                          {form.advanced.strictness}
                        </span>
                      </div>
                      <input 
                        type="range" min="1" max="10" 
                        value={form.advanced.strictness} 
                        onChange={(e) => updateAdvanced('strictness', parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                      />
                      <div className="flex justify-between text-[10px] uppercase tracking-widest text-slate-600 font-bold mt-3">
                        <span>Startup (Lenient)</span>
                        <span>FAANG (Brutal)</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ToggleSwitch label="Adaptive Difficulty" description="AI will increase difficulty if you answer quickly." checked={form.advanced.adaptiveDifficulty} onChange={(v: boolean) => updateAdvanced('adaptiveDifficulty', v)} />
                      <ToggleSwitch label="Deep Follow-ups" description="AI will probe deeply into your specific answers." checked={form.advanced.followUpDepth} onChange={(v: boolean) => updateAdvanced('followUpDepth', v)} />
                      <ToggleSwitch label="Realistic Pressure Mode" description="AI will simulate slight interruptions and pressure." checked={form.advanced.realisticMode} onChange={(v: boolean) => updateAdvanced('realisticMode', v)} />
                    </div>
                  </div>
                )}

                {/* ----------------- SECURITY & PROCTORING TAB ----------------- */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div className="p-6 rounded-2xl border border-red-500/10 bg-gradient-to-br from-red-500/[0.02] to-transparent mb-6">
                      <h3 className="text-sm font-bold text-red-400 flex items-center gap-2 mb-2"><Lock className="w-4 h-4"/> Enterprise Proctoring Simulator</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        These settings mimic enterprise-grade assessment environments (like HackerRank or HireVue). Enabling these ensures the most realistic, distraction-free environment.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <ToggleSwitch label="Hardware Face Tracking" description="Uses client-side WASM to monitor gaze and presence." checked={form.advanced.faceTracking} onChange={(v: boolean) => updateAdvanced('faceTracking', v)} />
                      <ToggleSwitch label="Strict Fullscreen Enforcement" description="Automatically warns and pauses if you exit fullscreen." checked={form.advanced.fullscreenEnforcement} onChange={(v: boolean) => updateAdvanced('fullscreenEnforcement', v)} />
                      <ToggleSwitch label="Tab Focus Monitoring" description="Logs violations if you switch tabs during the session." checked={form.advanced.tabMonitoring} onChange={(v: boolean) => updateAdvanced('tabMonitoring', v)} />
                      <ToggleSwitch label="Session Recording" description="Records the interview for post-session playback and review." checked={form.advanced.sessionRecording} onChange={(v: boolean) => updateAdvanced('sessionRecording', v)} />
                    </div>
                  </div>
                )}

                {/* ----------------- VOICE & INTERACTION TAB ----------------- */}
                {activeTab === 'voice' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.01]">
                        <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-4 flex items-center gap-2"><Volume2 className="w-4 h-4"/> AI Voice Model</h3>
                        <div className="space-y-2">
                          {['onyx', 'echo', 'fable', 'alloy'].map(voice => (
                            <label key={voice} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${form.advanced.aiVoice === voice ? 'border-violet-500 bg-violet-500/10' : 'border-white/5 hover:bg-white/[0.02]'}`}>
                              <input type="radio" name="aiVoice" value={voice} checked={form.advanced.aiVoice === voice} onChange={(e) => updateAdvanced('aiVoice', e.target.value)} className="hidden" />
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${form.advanced.aiVoice === voice ? 'border-violet-500' : 'border-slate-600'}`}>
                                {form.advanced.aiVoice === voice && <div className="w-2 h-2 rounded-full bg-violet-500" />}
                              </div>
                              <span className="text-sm font-semibold text-slate-200 capitalize">{voice}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.01]">
                         <div className="mb-6">
                          <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2 flex items-center gap-2"><Radio className="w-4 h-4"/> Speaking Speed</h3>
                          <div className="flex items-center gap-4 mt-4">
                            <span className="text-xs font-bold text-slate-600">0.5x</span>
                            <input 
                              type="range" min="0.5" max="1.5" step="0.1" 
                              value={form.advanced.speakingSpeed} 
                              onChange={(e) => updateAdvanced('speakingSpeed', parseFloat(e.target.value))}
                              className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                            <span className="text-xs font-bold text-slate-200">{form.advanced.speakingSpeed.toFixed(1)}x</span>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-4 flex items-center gap-2"><SlidersHorizontal className="w-4 h-4"/> Communication Style</h3>
                          <div className="grid grid-cols-2 gap-2">
                            {['concise', 'conversational'].map(style => (
                              <button key={style} onClick={() => updateAdvanced('communicationStyle', style)}
                                className={`px-3 py-2 rounded-xl border text-xs font-semibold capitalize transition-all ${
                                  form.advanced.communicationStyle === style
                                    ? 'border-indigo-500 bg-indigo-500/10 text-white'
                                    : 'border-white/5 text-slate-400 hover:bg-white/[0.02]'
                                }`}>
                                {style}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
