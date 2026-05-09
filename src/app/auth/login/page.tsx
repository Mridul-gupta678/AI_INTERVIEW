// src/app/auth/login/page.tsx
'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Brain, Mail, Lock, Eye, EyeOff, Github, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const [email, setEmail]   = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);

  const handleOAuth = async (provider: 'google' | 'github') => {
    try {
      setOauthLoading(provider);
      await signIn(provider, { callbackUrl: '/dashboard' });
    } catch {
      setOauthLoading(null);
      toast.error(`Failed to sign in with ${provider}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    
    if (result?.error) {
      if (result.error.includes('Email not verified')) {
        toast.error('Please verify your email before continuing.');
        router.push(`/auth/verify-email?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
      } else {
        toast.error(result.error || 'Invalid email or password');
      }
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-page)' }}>
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] p-12 relative overflow-hidden"
           style={{ background: 'var(--brand)' }}>
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-20"
               style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }} />
          <div className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full opacity-10"
               style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)' }} />
        </div>

        <div className="relative">
          <div className="flex items-center gap-2.5 mb-16">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-lg">InterviewAI</span>
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight mb-5">
            Practice smarter.<br />Interview better.
          </h2>
          <p className="text-white/70 text-sm leading-relaxed max-w-xs">
            AI-powered mock interviews with real-time adaptive feedback. Trusted by 50,000+ engineers.
          </p>
        </div>

        <div className="relative grid grid-cols-3 gap-4">
          {[
            { value: '50K+', label: 'Interviews' },
            { value: '89%',  label: 'Offer Rate' },
            { value: '4.9★', label: 'Rating' },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-2xl p-4 backdrop-blur">
              <p className="text-xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-white/60 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--brand)' }}>
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[var(--text-primary)]">InterviewAI</span>
          </div>

          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Welcome back</h1>
          <p className="text-sm text-[var(--text-muted)] mb-8">Sign in to continue your interview prep</p>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl flex items-start gap-2.5"
                 style={{ background: 'var(--danger-light)', border: '1px solid #fecaca' }}>
              <ShieldAlert className="w-4 h-4 text-[var(--danger)] shrink-0 mt-0.5" />
              <p className="text-sm text-[var(--danger)]">
                {error === 'OAuthAccountNotLinked'
                  ? 'Email is already in use with another provider.'
                  : error === 'AccessDenied'
                  ? 'Access was denied.'
                  : 'An authentication error occurred.'}
              </p>
            </div>
          )}

          {/* OAuth */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => handleOAuth('google')}
              disabled={oauthLoading !== null}
              className="btn-secondary justify-center py-2.5 gap-2.5 disabled:opacity-50"
            >
              {oauthLoading === 'google'
                ? <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                : <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              }
              Google
            </button>
            <button
              onClick={() => handleOAuth('github')}
              disabled={oauthLoading !== null}
              className="btn-secondary justify-center py-2.5 gap-2.5 disabled:opacity-50"
            >
              {oauthLoading === 'github'
                ? <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                : <Github className="w-4 h-4" />
              }
              GitHub
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-[var(--border)]" />
            <span className="text-xs text-[var(--text-muted)] font-medium">or continue with email</span>
            <div className="h-px flex-1 bg-[var(--border)]" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" required className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required className="input pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 rounded-xl mt-2">
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : 'Sign In'
              }
            </button>
          </form>

          <p className="text-center text-sm text-[var(--text-muted)] mt-6">
            Don't have an account?{' '}
            <Link href="/auth/register" className="font-semibold hover:underline" style={{ color: 'var(--brand)' }}>
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
        <span className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--brand)' }} />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
