'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Brain, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const password = searchParams.get('password') || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      router.push('/auth/register');
    }
  }, [email, router]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Auto-focus prev on backspace
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      // Focus last filled
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setSuccess(true);
      toast.success('Email verified successfully!');

      // Sign in automatically if we have the password
      if (password) {
        const signinRes = await signIn('credentials', { email, password, redirect: false });
        if (signinRes?.error) {
          toast.error('Could not auto-login. Please login manually.');
          setTimeout(() => router.push('/auth/login'), 1500);
          return;
        }
        
        // Ensure router cache is invalidated so session is picked up
        router.refresh();
        setTimeout(() => router.push('/dashboard'), 1000);
      } else {
        setTimeout(() => router.push('/auth/login'), 1000);
      }

    } catch (err: any) {
      setError(err.message);
      // Add slight shake effect by resetting state to trigger animation
      setOtp([...otp]);
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timeLeft > 0 || resending) return;
    
    setResending(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend');
      
      toast.success('New verification code sent!');
      setTimeLeft(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-page)' }}>
      <div className="w-full max-w-md relative">
        
        {/* Background Gradients */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="bg-white/[0.02] border border-white/10 p-8 rounded-2xl shadow-2xl backdrop-blur-xl relative z-10">
          
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
              <Brain className="w-6 h-6 text-indigo-400" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-white mb-2">Verify Your Email</h1>
          <p className="text-sm text-center text-white/50 mb-8">
            We sent a 6-digit verification code to<br />
            <span className="text-white/80 font-medium">{email}</span>
          </p>

          <form onSubmit={handleVerify}>
            
            <div className="flex justify-center gap-2 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={loading || success}
                  className={`w-12 h-14 text-center text-xl font-bold rounded-xl outline-none transition-all duration-200
                    ${error ? 'bg-red-500/10 border-red-500/50 text-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-400/50' 
                    : success ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
                    : 'bg-[#0f172a] border-white/10 text-white focus:border-indigo-500 focus:bg-[#1e293b] focus:ring-1 focus:ring-indigo-500/50 shadow-inner'}
                    border
                  `}
                />
              ))}
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-2 text-red-400 text-xs font-medium mb-6 bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-medium mb-6 bg-emerald-500/10 py-2 rounded-lg border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4" />
                Verification successful. Redirecting...
              </motion.div>
            )}

            <button 
              type="submit" 
              disabled={loading || success || otp.join('').length < 6}
              className="w-full py-3.5 px-4 bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white rounded-xl font-medium shadow-[0_4px_14px_rgba(79,70,229,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : success ? (
                <>Verified <CheckCircle2 className="w-4 h-4" /></>
              ) : (
                <>Verify Email <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-sm text-white/50 mb-3">Didn't receive the code?</p>
            <button 
              onClick={handleResend}
              disabled={timeLeft > 0 || resending || success}
              className="text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-indigo-400 hover:text-indigo-300"
            >
              {resending ? 'Sending...' : timeLeft > 0 ? `Resend code in ${timeLeft}s` : 'Resend verification code'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020617] flex items-center justify-center"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
