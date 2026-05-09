'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Eye, EyeOff, Server, Key, AlertTriangle, ShieldCheck, Cpu, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { signIn } from 'next-auth/react';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [errorShake, setErrorShake] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setCapsLockActive(e.getModifierState('CapsLock'));
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyDown);
    };
  }, []);

  const triggerError = () => {
    setErrorShake(true);
    setTimeout(() => setErrorShake(false), 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    
    setIsLoading(true);

    try {
      if (password === 'admin123') {
        const response = await fetch('/api/admin/verify-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });

        if (!response.ok) {
          toast.error('Server failed to verify password.');
          triggerError();
          setPassword('');
          setIsLoading(false);
          return;
        }

        toast.success('Authentication successful. Initializing session...', { icon: '🔐' });
        setTimeout(() => {
           window.location.href = '/admin';
        }, 800);
      } else {
        toast.error('Invalid administrative credentials');
        triggerError();
        setPassword('');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Connection securely terminated. Try again.');
      triggerError();
      setPassword('');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden flex flex-col relative selection:bg-blue-500/30">
      
      {/* ─── BACKGROUND EFFECTS ─── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-blue-600/10 rounded-full blur-[130px] mix-blend-screen opacity-60 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-indigo-950/30 rounded-full blur-[150px] mix-blend-screen opacity-70 animate-pulse" style={{ animationDuration: '12s' }} />
        
        {/* Subtle Enterprise Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)] opacity-50" />
      </div>

      {/* ─── TOP NAVIGATION ─── */}
      <header className="relative z-10 flex justify-between items-center px-8 py-6 border-b border-white/[0.04] bg-slate-950/50 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.2)] border border-white/10">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold tracking-wide text-white">InterviewAI Enterprise</h1>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-400 font-semibold mt-0.5">
              <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/70">ADMIN CONSOLE</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 tracking-widest uppercase">System Secure</span>
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 p-4">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[420px]"
        >
          {/* Card */}
          <motion.div 
            animate={errorShake ? { x: [-10, 10, -10, 10, -5, 5, 0] } : {}}
            transition={{ duration: 0.5 }}
            className="bg-slate-900/80 backdrop-blur-2xl border border-white/[0.08] rounded-[24px] shadow-[0_0_40px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] overflow-hidden relative group"
          >
            {/* Soft Top Glow inside Card */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50" />

            <div className="p-10 space-y-8">
              
              {/* Header */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-blue-500">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Administrative Access
                </div>
                <h2 className="text-2xl font-semibold text-white tracking-tight">
                  Secure Admin Portal
                </h2>
                <p className="text-[13px] text-slate-400 font-medium">
                  Authenticate to access the operational dashboard and manage platform configurations.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2 relative">
                  <div className="flex justify-between items-center">
                    <label htmlFor="password" className="text-[12px] font-semibold text-slate-300 uppercase tracking-wider">
                      Master Password
                    </label>
                    <AnimatePresence>
                      {capsLockActive && (
                        <motion.span 
                          initial={{ opacity: 0, scale: 0.8 }} 
                          animate={{ opacity: 1, scale: 1 }} 
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="text-[10px] text-amber-400 font-bold tracking-widest uppercase flex items-center gap-1 bg-amber-400/10 px-2 py-0.5 rounded-sm"
                        >
                          <AlertTriangle className="w-3 h-3" /> Caps Lock
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
                      <Key className={`w-4 h-4 transition-colors duration-300 ${isFocused ? 'text-blue-500' : 'text-slate-500'}`} />
                    </div>
                    
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      placeholder="••••••••••••"
                      disabled={isLoading}
                      className="w-full h-14 pl-11 pr-12 bg-slate-900/50 border border-white/10 rounded-xl text-white text-[15px] placeholder-slate-600 focus:outline-none focus:bg-slate-900 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] disabled:opacity-50"
                      autoComplete="current-password"
                      autoFocus
                    />
                    
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>

                    {/* Active Glow Ring */}
                    <div className={`absolute -inset-[1px] bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl opacity-0 blur-[2px] transition-opacity duration-300 pointer-events-none -z-10 ${isFocused ? 'opacity-30' : ''}`} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !password}
                  className="w-full h-14 relative overflow-hidden rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 disabled:from-slate-800 disabled:to-slate-900 flex items-center justify-center group transition-all duration-300 disabled:cursor-not-allowed border border-white/10 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] disabled:shadow-none hover:-translate-y-0.5 disabled:translate-y-0"
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-10 transition-opacity" />
                  
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="text-[14px] font-semibold text-white tracking-wide">Authenticating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-white/90 group-hover:scale-110 transition-transform" />
                      <span className="text-[14px] font-semibold text-white tracking-wide">Unlock Admin Portal</span>
                    </div>
                  )}
                </button>
              </form>

            </div>

            {/* Security Metadata Bar */}
            <div className="bg-slate-950/50 border-t border-white/[0.04] p-4 flex flex-col gap-2">
              <div className="flex items-center justify-center gap-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                Protected by AI Security Layer
              </div>
              <div className="flex items-center justify-center gap-4 text-[9px] text-slate-600 font-medium">
                <span className="flex items-center gap-1.5"><Server className="w-3 h-3" /> 256-bit Encrypted</span>
                <span className="flex items-center gap-1.5"><Activity className="w-3 h-3" /> AI Monitoring Active</span>
              </div>
            </div>

          </motion.div>

          {/* Footer Metadata */}
          <div className="mt-8 flex items-center justify-between px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
            <span>v2.4.1 Enterprise Build</span>
            <span>Status: Operational</span>
          </div>

        </motion.div>
      </main>

    </div>
  );
}
