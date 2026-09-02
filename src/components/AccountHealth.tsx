import React from 'react';
import { Activity, Server, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function AccountHealth() {
  return (
    <div className="space-y-6 page">
      <div>
        <p className="text-[12px] text-[var(--text-muted)]">Monitor system uptime, API quotas, and potential SLA breaches.</p>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="card p-6 flex flex-col items-center text-center justify-center border-t-4 border-t-emerald-500">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="font-display text-3xl text-[var(--text)] mb-1">99.99%</h3>
          <p className="text-[12px] text-[var(--text-muted)] font-medium uppercase tracking-wider">Uptime (30 Days)</p>
        </div>
        <div className="card p-6 flex flex-col items-center text-center justify-center border-t-4 border-t-[var(--gold)]">
          <div className="w-16 h-16 rounded-full bg-[var(--cream)] border border-[var(--gold-light)] flex items-center justify-center mb-4">
            <Server className="w-8 h-8 text-[var(--gold-dark)]" />
          </div>
          <h3 className="font-display text-3xl text-[var(--text)] mb-1">1.2s</h3>
          <p className="text-[12px] text-[var(--text-muted)] font-medium uppercase tracking-wider">Avg AI Latency</p>
        </div>
        <div className="card p-6 flex flex-col items-center text-center justify-center border-t-4 border-t-amber-500">
          <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mb-4">
            <Activity className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="font-display text-3xl text-[var(--text)] mb-1">42/min</h3>
          <p className="text-[12px] text-[var(--text-muted)] font-medium uppercase tracking-wider">API Request Rate</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-display text-xl text-[var(--text)] mb-4 border-b border-[var(--border-soft)] pb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> Warnings & Alerts
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-[var(--paper)] border border-amber-200 flex items-start gap-3">
              <div className="mt-0.5"><Clock className="w-4 h-4 text-amber-600" /></div>
              <div>
                <h4 className="text-[13px] font-semibold text-[var(--text)]">High Latency Detected</h4>
                <p className="text-[12px] text-[var(--text-muted)] mt-1">Tenant "Sunrise Health" experienced AI response times 3s at 14:02 UTC.</p>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-[var(--paper)] border border-[var(--border)] flex items-start gap-3">
              <div className="mt-0.5"><Activity className="w-4 h-4 text-[var(--text-muted)]" /></div>
              <div>
                <h4 className="text-[13px] font-semibold text-[var(--text)]">Rate Limit Approaching</h4>
                <p className="text-[12px] text-[var(--text-muted)] mt-1">Downtown Dental is currently at 85% of their per-minute API quota.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-display text-xl text-[var(--text)] mb-4 border-b border-[var(--border-soft)] pb-2">System Integrations</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-md hover:bg-[var(--paper)] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[var(--border-soft)] flex items-center justify-center">
                  <span className="font-display text-[14px]">S</span>
                </div>
                <span className="text-[13px] font-medium">Supabase Database</span>
              </div>
              <span className="badge badge-green">Operational</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-md hover:bg-[var(--paper)] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[var(--border-soft)] flex items-center justify-center">
                  <span className="font-display text-[14px]">O</span>
                </div>
                <span className="text-[13px] font-medium">OpenAI API (Voice)</span>
              </div>
              <span className="badge badge-green">Operational</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-md hover:bg-[var(--paper)] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[var(--border-soft)] flex items-center justify-center">
                  <span className="font-display text-[14px]">T</span>
                </div>
                <span className="text-[13px] font-medium">Twilio Telephony</span>
              </div>
              <span className="badge badge-amber">Degraded</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
