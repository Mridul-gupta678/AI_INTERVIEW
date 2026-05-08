import { CreditCard, TrendingUp, Download } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminBillingPage() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Billing & Revenue</h1>
          <p className="text-[var(--text-secondary)] mt-2">Manage SaaS subscriptions and view financial analytics.</p>
        </div>
        <button className="btn-secondary gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-[var(--bg-secondary)] border rounded-2xl p-6">
          <p className="text-sm text-[var(--text-muted)] font-medium mb-2">Monthly Recurring Revenue</p>
          <p className="text-3xl font-bold text-[var(--text-primary)]">$0.00</p>
          <p className="text-sm text-emerald-500 mt-2 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" /> +0% this month
          </p>
        </div>

        <div className="bg-[var(--bg-secondary)] border rounded-2xl p-6">
          <p className="text-sm text-[var(--text-muted)] font-medium mb-2">Active Pro Subscriptions</p>
          <p className="text-3xl font-bold text-[var(--text-primary)]">0</p>
        </div>

        <div className="bg-[var(--bg-secondary)] border rounded-2xl p-6">
          <p className="text-sm text-[var(--text-muted)] font-medium mb-2">Total Lifetime Value</p>
          <p className="text-3xl font-bold text-[var(--text-primary)]">$0.00</p>
        </div>
      </div>

      <div className="bg-[var(--bg-secondary)] border rounded-2xl overflow-hidden p-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-indigo-500" />
        </div>
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Stripe Integration Pending</h2>
        <p className="text-[var(--text-secondary)] mt-2 max-w-md mx-auto">
          Connect your Stripe account in the environment variables to activate live subscription billing and transaction monitoring.
        </p>
      </div>
    </div>
  );
}
