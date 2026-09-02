import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Search, Building, CreditCard, Activity, ArrowLeft, MoreVertical, Clock, X } from 'lucide-react';

export default function Clinics() {
  const [loading, setLoading] = useState(true);
  const [clinics, setClinics] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClinic, setSelectedClinic] = useState<any | null>(null);

  const handleSuspend = async (clinicId: string) => {
    try {
      // Optimistic UI update
      setClinics(clinics.map(c => c.id === clinicId ? { ...c, status: 'suspended' } : c));
      if (selectedClinic && selectedClinic.id === clinicId) {
        setSelectedClinic({ ...selectedClinic, status: 'suspended' });
      }

      // Real Supabase update
      const { error } = await supabase
        .from('clinics')
        .update({ status: 'suspended' })
        .eq('id', clinicId);

      if (error) throw error;
    } catch (err) {
      console.error('Failed to suspend clinic (bypassed or error):', err);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    setLoading(true);
    try {
      const { data: clinicsData, error } = await supabase
        .from('clinics')
        .select(`
          id,
          name,
          status,
          created_at,
          subscriptions (
            status,
            plans (monthly_price)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = clinicsData.map(c => {
        const activeSub = c.subscriptions?.find((s: any) => s.status === 'active');
        const planData = activeSub?.plans as any;
        const mrrValue = Array.isArray(planData) ? planData[0]?.monthly_price : planData?.monthly_price;
        return {
          ...c,
          mrr: mrrValue || 0,
          subStatus: activeSub ? 'Active' : 'No Sub'
        };
      });

      if (formatted.length === 0) {
        // Fallback placeholder data for UI testing
        setClinics([
          { id: 'cli_1092a', name: 'Downtown Dental Studio', status: 'active', created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), mrr: 299, subStatus: 'Active' },
          { id: 'cli_8473b', name: 'Sunrise Health & Wellness', status: 'active', created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), mrr: 599, subStatus: 'Active' },
          { id: 'cli_2291c', name: 'Oakridge Family Practice', status: 'suspended', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), mrr: 0, subStatus: 'No Sub' }
        ]);
      } else {
        setClinics(formatted);
      }
    } catch (err) {
      console.error('Error fetching clinics:', err);
      // Fallback placeholder data for UI testing if Supabase request fails (e.g. due to auth bypass / RLS)
      setClinics([
        { id: 'cli_1092a', name: 'Downtown Dental Studio', status: 'active', created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), mrr: 299, subStatus: 'Active' },
        { id: 'cli_8473b', name: 'Sunrise Health & Wellness', status: 'active', created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), mrr: 599, subStatus: 'Active' },
        { id: 'cli_2291c', name: 'Oakridge Family Practice', status: 'suspended', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), mrr: 0, subStatus: 'No Sub' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredClinics = clinics.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--border)] border-t-[var(--gold)] rounded-full animate-spin"></div>
      </div>
    );
  }

  // --- Profile View ---
  if (selectedClinic) {
    return (
      <div className="space-y-6 page">
        <button
          onClick={() => setSelectedClinic(null)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[var(--border)] text-[12px] font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--gold-light)] shadow-sm transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Directory
        </button>

        <div className="grid grid-cols-3 gap-6 items-stretch">
          <div className="card p-6 border-t-4 border-t-[var(--gold)] col-span-1 flex flex-col">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--cream)] to-[var(--gold-light)] border border-[var(--gold)] flex items-center justify-center mb-5 shadow-sm">
              <Building className="w-8 h-8 text-[var(--gold-dark)]" />
            </div>
            <h2 className="font-display text-[22px] text-[var(--text)] mb-1 leading-tight">{selectedClinic.name}</h2>
            <p className="font-mono text-[11px] text-[var(--text-faint)] mb-5">ID: {selectedClinic.id}</p>

            <div className="flex items-center gap-2 mb-6">
              <span className={`badge ${selectedClinic.status === 'active' ? 'badge-green' : 'badge-amber'}`}>
                <span className="badge-dot"></span>
                {selectedClinic.status}
              </span>
              <span className="badge badge-slate bg-[var(--paper)] border-[var(--border)]">
                MRR: <strong className="text-[var(--gold-dark)] ml-1">₹{selectedClinic.mrr.toLocaleString('en-IN')}</strong>
              </span>
            </div>

            <div className="space-y-3 border-t border-[var(--border-soft)] pt-5">
              <div className="flex justify-between text-[13px]">
                <span className="text-[var(--text-muted)] flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Joined</span>
                <span className="font-medium text-[var(--text)]">
                  {new Date(selectedClinic.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[var(--text-muted)] flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Subscription</span>
                <span className="font-medium text-[var(--text)]">{selectedClinic.subStatus}</span>
              </div>
            </div>

            <div className="mt-auto pt-6 flex flex-col gap-2.5">
              <button className="btn-primary w-full justify-center">View Logs & Activity</button>
              <button 
                onClick={() => handleSuspend(selectedClinic.id)}
                className="btn-ghost w-full justify-center text-rose-600 hover:bg-rose-50 hover:text-rose-700 border border-transparent hover:border-rose-200 transition-colors"
                disabled={selectedClinic.status === 'suspended'}
              >
                {selectedClinic.status === 'suspended' ? 'Suspended' : 'Suspend Tenant'}
              </button>
            </div>
          </div>

          <div className="card p-6 col-span-2 flex flex-col">
            <h3 className="font-display text-[20px] text-[var(--text)] mb-5 border-b border-[var(--border-soft)] pb-3">Recent Usage (Mock)</h3>

            <div className="mb-8">
              <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-2 text-[var(--text-muted)]">
                  <Activity className="w-4 h-4 text-[var(--gold)]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text)]">AI Minutes Consumed</span>
                </div>
                <span className="text-[13px] font-medium text-[var(--text)]">1,245 / 2,000 limits</span>
              </div>
              <div className="h-2.5 w-full bg-[var(--border-soft)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--gold)] rounded-full" style={{ width: '62%' }}></div>
              </div>
              <p className="text-right text-[11px] text-[var(--text-faint)] mt-1.5">62% of monthly allocation used</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-5 rounded-xl bg-[var(--paper)] border border-[var(--border)] shadow-sm hover:border-[var(--gold-light)] transition-colors">
                <div className="flex items-center gap-2 mb-2 text-[var(--text-muted)]">
                  <Clock className="w-4 h-4 text-[var(--text-faint)]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Total Calls Managed</span>
                </div>
                <p className="text-3xl font-display text-[var(--text)]">412</p>
              </div>
              <div className="p-5 rounded-xl bg-[var(--paper)] border border-[var(--border)] shadow-sm hover:border-[var(--gold-light)] transition-colors">
                <div className="flex items-center gap-2 mb-2 text-[var(--text-muted)]">
                  <Building className="w-4 h-4 text-[var(--text-faint)]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Locations</span>
                </div>
                <p className="text-3xl font-display text-[var(--text)]">1</p>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-[var(--cream)] border border-[var(--gold-light)] text-center mt-auto">
              <p className="text-[12px] text-[var(--text-muted)]">Detailed call transcripts and patient records are restricted by platform privacy policies.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- List View ---
  return (
    <div className="space-y-6 page">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[12px] text-[var(--text-muted)]">Manage your connected tenants and subscriptions.</p>
        </div>
        <div className="relative group">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)] group-focus-within:text-[var(--gold)] transition-colors" />
          <input
            type="text"
            placeholder="Search clinics by name or ID..."
            className="input pl-10 pr-10 w-80 py-2 rounded-full shadow-sm hover:border-[var(--gold-light)] focus:border-[var(--gold)] focus:ring-4 focus:ring-[var(--gold)]/10 transition-all bg-[var(--paper)]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)] hover:text-[var(--text)] transition-colors p-0.5 rounded-full hover:bg-[var(--border-soft)]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="tbl">
          <thead>
            <tr>
              <th>Clinic Details</th>
              <th>Status</th>
              <th>Subscription</th>
              <th>MRR</th>
              <th>Joined Date</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClinics.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[var(--border-soft)] flex items-center justify-center mb-3">
                      <Building className="w-5 h-5 text-[var(--text-faint)]" />
                    </div>
                    <p className="text-[14px] font-medium text-[var(--text-muted)]">No clinics found</p>
                    <p className="text-[12px] text-[var(--text-faint)] mt-1">There are no tenants matching your search.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredClinics.map(clinic => (
                <tr key={clinic.id} onClick={() => setSelectedClinic(clinic)} className="cursor-pointer">
                  <td>
                    <div className="flex flex-col">
                      <span className="font-medium text-[var(--text)]">{clinic.name}</span>
                      <span className="font-mono text-[10px] text-[var(--text-faint)] mt-0.5">{clinic.id}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${clinic.status === 'active' ? 'badge-green' : 'badge-amber'}`}>
                      <span className="badge-dot"></span>
                      {clinic.status}
                    </span>
                  </td>
                  <td>
                    <span className="text-[12.5px] font-medium">
                      {clinic.subStatus}
                    </span>
                  </td>
                  <td>
                    <span className="font-mono font-medium text-[var(--gold-dark)]">
                      ₹{clinic.mrr.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td>
                    <span className="text-[12.5px] text-[var(--text-muted)]">
                      {new Date(clinic.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="text-right">
                    <button className="p-1.5 rounded-md hover:bg-[var(--border-soft)] text-[var(--text-faint)] transition">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
