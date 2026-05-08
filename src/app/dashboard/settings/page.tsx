// src/app/dashboard/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { User, Briefcase, Code2, Save, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const EXPERIENCE_LEVELS = [
  { value: 'fresher', label: 'Fresher (0 years)' },
  { value: '1-2', label: '1–2 years' },
  { value: '3-5', label: '3–5 years' },
  { value: '5+', label: '5+ years' },
];

const COMMON_STACKS = [
  'React', 'Next.js', 'Node.js', 'Python', 'Django', 'FastAPI',
  'Java', 'Spring Boot', 'C++', 'Go', 'TypeScript', 'PostgreSQL',
  'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'GCP',
];

export default function SettingsPage() {
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [resumes, setResumes] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '',
    bio: '',
    targetRole: '',
    experience: 'fresher',
    preferredStack: [] as string[],
    linkedinUrl: '',
    githubUrl: '',
  });

  useEffect(() => {
    loadProfile();
    loadResumes();
  }, []);

  const loadProfile = async () => {
    const res = await fetch('/api/profile');
    if (res.ok) {
      const data = await res.json();
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
        }));
      }
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
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success('Profile saved!');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await fetch('/api/resume', { method: 'POST', body: formData });
      if (!res.ok) throw new Error();
      toast.success('Resume uploaded and parsed!');
      loadResumes();
    } catch {
      toast.error('Resume upload failed');
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

  return (
    <div className="px-8 py-8 max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>

      {/* Profile */}
      <div className="card space-y-5">
        <h2 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <User className="w-4 h-4 text-brand-400" /> Profile
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-[var(--text-secondary)] block mb-1.5">Full Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="input" placeholder="Your name" />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--text-secondary)] block mb-1.5">Target Role</label>
            <input value={form.targetRole} onChange={e => setForm(f => ({ ...f, targetRole: e.target.value }))}
              className="input" placeholder="e.g. Senior Frontend Engineer" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-[var(--text-secondary)] block mb-1.5">Bio</label>
          <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            className="input resize-none h-20" placeholder="Brief intro about yourself..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-[var(--text-secondary)] block mb-1.5">LinkedIn URL</label>
            <input value={form.linkedinUrl} onChange={e => setForm(f => ({ ...f, linkedinUrl: e.target.value }))}
              className="input" placeholder="https://linkedin.com/in/..." />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--text-secondary)] block mb-1.5">GitHub URL</label>
            <input value={form.githubUrl} onChange={e => setForm(f => ({ ...f, githubUrl: e.target.value }))}
              className="input" placeholder="https://github.com/..." />
          </div>
        </div>
      </div>

      {/* Interview Preferences */}
      <div className="card space-y-5">
        <h2 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-brand-400" /> Interview Preferences
        </h2>

        <div>
          <label className="text-sm font-medium text-[var(--text-secondary)] block mb-2">Experience Level</label>
          <div className="grid grid-cols-2 gap-2">
            {EXPERIENCE_LEVELS.map(({ value, label }) => (
              <button key={value} onClick={() => setForm(f => ({ ...f, experience: value }))}
                className={`px-4 py-2.5 rounded-xl border text-sm text-left transition-all ${
                  form.experience === value
                    ? 'border-brand-500 bg-brand-600/10 text-brand-400'
                    : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-[var(--text-secondary)] block mb-2 flex items-center gap-2">
            <Code2 className="w-4 h-4" /> Preferred Tech Stack
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_STACKS.map(tech => (
              <button key={tech} onClick={() => toggleStack(tech)}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                  form.preferredStack.includes(tech)
                    ? 'border-brand-500 bg-brand-600/10 text-brand-400'
                    : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-hover)]'
                }`}>
                {tech}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resume */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <Upload className="w-4 h-4 text-brand-400" /> Resume
        </h2>

        <label className="block w-full border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-brand-500 hover:bg-brand-600/5 transition-all">
          <input type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} />
          {uploading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-brand-400/30 border-t-brand-400 rounded-full animate-spin" />
              <span className="text-sm text-[var(--text-secondary)]">Uploading & parsing...</span>
            </div>
          ) : (
            <>
              <Upload className="w-6 h-6 text-[var(--text-muted)] mx-auto mb-2" />
              <p className="text-sm text-[var(--text-secondary)]">Upload PDF resume for personalized questions</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Max 5MB</p>
            </>
          )}
        </label>

        {resumes.length > 0 && (
          <div className="space-y-2">
            {resumes.map(r => (
              <div key={r.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${r.isActive ? 'border-green-500/30 bg-green-500/5' : 'border-[var(--border)]'}`}>
                <span className="text-green-400">📄</span>
                <span className="flex-1 text-[var(--text-secondary)] truncate">{r.fileName}</span>
                {r.isActive && <span className="text-xs text-green-400 font-medium">Active</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save */}
      <button onClick={saveProfile} disabled={saving} className="btn-primary w-full justify-center py-3">
        {saving
          ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <><Save className="w-4 h-4" /> Save Changes</>
        }
      </button>
    </div>
  );
}
