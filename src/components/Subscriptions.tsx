import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../supabaseClient';
import { Search, CreditCard, Calendar, AlertCircle, X, Download, FileText } from 'lucide-react';

export default function Subscriptions() {
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingInvoice, setViewingInvoice] = useState<any>(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fallbackSubscriptions = [
    { id: 'sub_1092a', clinic_name: 'Downtown Dental Studio', plan_name: 'Growth', status: 'active', monthly_price: 12999, current_period_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'sub_8473b', clinic_name: 'Sunrise Health & Wellness', plan_name: 'Scale', status: 'active', monthly_price: 24999, current_period_end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'sub_2291c', clinic_name: 'Oakridge Family Practice', plan_name: 'Starter', status: 'past_due', monthly_price: 4999, current_period_end: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() }
  ];

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('subscriptions').select(`
        id,
        status,
        current_period_end,
        clinics (name),
        plans (name, monthly_price)
      `);

      if (error) throw error;

      if (data.length === 0) {
        setSubscriptions(fallbackSubscriptions);
      } else {
        const formatted = data.map((d: any) => ({
          id: d.id,
          clinic_name: d.clinics?.name || 'Unknown',
          plan_name: d.plans?.name || 'Unknown',
          status: d.status,
          monthly_price: d.plans?.monthly_price || 0,
          current_period_end: d.current_period_end
        }));
        setSubscriptions(formatted);
      }
    } catch (err) {
      console.error(err);
      setSubscriptions(fallbackSubscriptions);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubs = subscriptions.filter(s =>
    s.clinic_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--border)] border-t-[var(--gold)] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 page">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[12px] text-[var(--text-muted)]">Monitor billing states and upcoming renewals.</p>
        </div>
        <div className="relative group">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)] group-focus-within:text-[var(--gold)] transition-colors" />
          <input
            type="text"
            placeholder="Search by clinic or ID..."
            className="input pl-10 pr-10 w-80 py-2 rounded-full shadow-sm hover:border-[var(--gold-light)] focus:border-[var(--gold)] focus:ring-4 focus:ring-[var(--gold)]/10 transition-all bg-[var(--paper)]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="tbl">
          <thead>
            <tr>
              <th>Tenant</th>
              <th>Plan Tier</th>
              <th>Billing Status</th>
              <th>MRR</th>
              <th>Next Billing Date</th>
              <th className="text-right">Manage</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[var(--border-soft)] flex items-center justify-center mb-3">
                      <CreditCard className="w-5 h-5 text-[var(--text-faint)]" />
                    </div>
                    <p className="text-[14px] font-medium text-[var(--text-muted)]">No subscriptions found</p>
                    <p className="text-[12px] text-[var(--text-faint)] mt-1">There are no billing records matching your search.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredSubs.map(sub => (
                <tr key={sub.id}>
                  <td>
                    <div className="flex flex-col">
                      <span className="font-medium text-[var(--text)]">{sub.clinic_name}</span>
                      <span className="font-mono text-[10px] text-[var(--text-faint)] mt-0.5">{sub.id}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-[12.5px] font-medium">{sub.plan_name}</span>
                  </td>
                  <td>
                    {sub.status === 'active' ? (
                      <span className="badge badge-green"><span className="badge-dot"></span>Active</span>
                    ) : sub.status === 'past_due' ? (
                      <span className="badge badge-amber"><AlertCircle className="w-3 h-3 mr-1" />Past Due</span>
                    ) : (
                      <span className="badge badge-slate">{sub.status}</span>
                    )}
                  </td>
                  <td>
                    <span className="font-mono font-medium text-[var(--gold-dark)]">
                      ₹{sub.monthly_price.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <span className="text-[12.5px] text-[var(--text-muted)]">
                        {new Date(sub.current_period_end).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] text-[var(--text-faint)] mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Renews automatically
                      </span>
                    </div>
                  </td>
                  <td className="text-right">
                    <button 
                      onClick={() => setViewingInvoice(sub)}
                      className="text-[11px] font-semibold uppercase tracking-wider text-[var(--gold)] hover:text-[var(--gold-dark)] transition-colors"
                    >
                      View Invoice
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {viewingInvoice && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--ink)]/60 backdrop-blur-md">
          <div className="bg-gradient-to-br from-[var(--paper)] to-[var(--cream)] rounded-2xl border-2 border-[var(--gold)] shadow-[0_0_40px_rgba(212,175,55,0.15)] w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-[var(--gold-light)] bg-white/50">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-[var(--cream)] border border-[var(--gold)] flex items-center justify-center">
                   <FileText className="w-5 h-5 text-[var(--gold-dark)]" />
                 </div>
                 <div>
                   <h3 className="font-display text-2xl text-[var(--text)] leading-none">Invoice</h3>
                   <span className="font-mono text-[10px] text-[var(--text-faint)] mt-1 block">INV-{viewingInvoice.id.toUpperCase()}-{new Date().getFullYear()}</span>
                 </div>
              </div>
              <button onClick={() => setViewingInvoice(null)} className="text-[var(--text-faint)] hover:text-[var(--text)] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="flex justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-faint)] mb-1">Billed To</p>
                  <p className="font-medium text-[var(--text)]">{viewingInvoice.clinic_name}</p>
                  <p className="text-[13px] text-[var(--text-muted)] mt-1">Status: <span className="capitalize">{viewingInvoice.status.replace('_', ' ')}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-faint)] mb-1">Billing Period</p>
                  <p className="text-[13px] text-[var(--text)]">{new Date(new Date(viewingInvoice.current_period_end).getTime() - 30*24*60*60*1000).toLocaleDateString()} - {new Date(viewingInvoice.current_period_end).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="border border-[var(--border-soft)] rounded-lg overflow-hidden bg-white">
                <table className="w-full text-[13px]">
                  <thead className="bg-[var(--paper)] text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                    <tr>
                      <th className="text-left font-medium p-3">Description</th>
                      <th className="text-right font-medium p-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-soft)]">
                    <tr>
                      <td className="p-3">
                        <p className="font-medium">{viewingInvoice.plan_name} Plan - Subscription</p>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Base platform access</p>
                      </td>
                      <td className="p-3 text-right font-mono">₹{viewingInvoice.monthly_price.toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-[var(--paper)]/50">
                    <tr>
                      <td className="p-3 text-right font-medium text-[var(--text-muted)]">Total</td>
                      <td className="p-3 text-right font-mono font-bold text-lg text-[var(--gold-dark)]">₹{viewingInvoice.monthly_price.toLocaleString('en-IN')}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="p-6 border-t border-[var(--border-soft)] bg-white/50 flex gap-3">
              <button className="btn-ghost flex-1 bg-white border border-[var(--border)] flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
