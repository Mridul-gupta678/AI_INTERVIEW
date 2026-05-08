import { Settings, Save, Server, Sliders } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Platform Settings</h1>
        <p className="text-[var(--text-secondary)] mt-2">Configure AI parameters, system behaviors, and global limits.</p>
      </div>

      <div className="space-y-6">
        {/* AI Configuration */}
        <div className="bg-[var(--bg-secondary)] border rounded-2xl overflow-hidden">
          <div className="p-4 border-b flex items-center gap-3 bg-[var(--bg-primary)]/50">
            <Sliders className="w-5 h-5 text-brand-500" />
            <h2 className="font-semibold text-[var(--text-primary)]">AI Interview Configuration</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Default AI Model</label>
              <select className="w-full bg-[var(--bg-primary)] border rounded-xl py-2.5 px-4 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-500/50">
                <option value="llama3-70b">Llama 3 70B (Groq) - Current</option>
                <option value="gpt-4o">GPT-4o (OpenAI)</option>
                <option value="claude-3-sonnet">Claude 3.5 Sonnet (Anthropic)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">AI Strictness Level</label>
              <div className="flex items-center gap-4">
                <input type="range" min="1" max="10" defaultValue="8" className="w-full accent-brand-500" />
                <span className="text-sm font-bold text-[var(--text-primary)]">8/10</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-2">Higher values make the AI interviewer ask harder follow-up questions and grade more strictly.</p>
            </div>
          </div>
        </div>

        {/* System Limits */}
        <div className="bg-[var(--bg-secondary)] border rounded-2xl overflow-hidden">
          <div className="p-4 border-b flex items-center gap-3 bg-[var(--bg-primary)]/50">
            <Server className="w-5 h-5 text-brand-500" />
            <h2 className="font-semibold text-[var(--text-primary)]">System Limits & Quotas</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Free Plan Monthly Limits</label>
                <input type="number" defaultValue="3" className="w-full bg-[var(--bg-primary)] border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Max Interview Duration (mins)</label>
                <input type="number" defaultValue="45" className="w-full bg-[var(--bg-primary)] border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button className="btn-primary gap-2">
            <Save className="w-4 h-4" /> Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
