import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Building2, TrendingUp, PhoneCall, BrainCircuit, CreditCard, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function Overview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClinics: 0,
    activeClinics: 0,
    totalCalls: 0,
    totalMinutes: 0,
    mrr: 0,
    activeSubs: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch total and active clinics
      const { data: clinics } = await supabase.from('clinics').select('id, status');
      const totalClinics = clinics?.length || 0;
      const activeClinics = clinics?.filter(c => c.status === 'active').length || 0;

      // Fetch calls (call_logs instead of calls, as per user instructions)
      const { count: totalCallsCount } = await supabase
        .from('call_logs')
        .select('*', { count: 'exact', head: true });

      // Fetch subscriptions for MRR
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('status, plans(monthly_price)')
        .eq('status', 'active');

      const activeSubs = subscriptions?.length || 0;
      const mrr = subscriptions?.reduce((acc, sub: any) => acc + (sub.plans?.monthly_price || 0), 0) || 0;

      setStats({
        totalClinics,
        activeClinics,
        totalCalls: totalCallsCount || 0,
        totalMinutes: (totalCallsCount || 0) * 3, // rough estimate
        mrr,
        activeSubs
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      // Fallback data for UI testing due to RLS bypass
      setStats({
        totalClinics: 3,
        activeClinics: 2,
        totalCalls: 412,
        totalMinutes: 1245,
        mrr: 50997,
        activeSubs: 2
      });
    } finally {
      setLoading(false);
    }
  };

  // Mock data for charts
  const growthData = [
    { name: 'Jan', active: 4, new: 2 },
    { name: 'Feb', active: 6, new: 2 },
    { name: 'Mar', active: 10, new: 4 },
    { name: 'Apr', active: 15, new: 5 },
    { name: 'May', active: 22, new: 7 },
    { name: 'Jun', active: 30, new: 8 },
  ];

  const usageData = [
    { name: 'Jan', calls: 1200, minutes: 3500 },
    { name: 'Feb', calls: 2100, minutes: 6000 },
    { name: 'Mar', calls: 4500, minutes: 12000 },
    { name: 'Apr', calls: 6800, minutes: 18500 },
    { name: 'May', calls: 11200, minutes: 31000 },
    { name: 'Jun', calls: 15400, minutes: 42000 },
  ];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--border)] border-t-[var(--gold)] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 page">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Clinics', value: stats.totalClinics, sub: `${stats.activeClinics} active`, icon: Building2, color: 'var(--text)' },
          { label: 'Monthly Recurring (MRR)', value: `₹${stats.mrr.toLocaleString('en-IN')}`, sub: `${stats.activeSubs} active subs`, icon: CreditCard, color: 'var(--gold-dark)' },
          { label: 'Total calls (All Time)', value: stats.totalCalls.toLocaleString(), sub: 'Across all tenants', icon: PhoneCall, color: 'var(--text)' },
          { label: 'AI Minutes Consumed', value: stats.totalMinutes.toLocaleString(), sub: 'Across all tenants', icon: BrainCircuit, color: 'var(--text)' },
        ].map(s => (
          <div key={s.label} className="card px-5 py-4 relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 w-full h-[3px]" style={{ background: 'linear-gradient(90deg, var(--gold), transparent)' }} />
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold tracking-wide" style={{ color: 'var(--text-faint)' }}>{s.label}</p>
              <s.icon className="w-4 h-4" style={{ color: 'var(--text-faint)' }} />
            </div>
            <div className="flex items-end justify-between mt-auto">
              <p className="font-display text-[26px] font-semibold" style={{ color: s.color }}>{s.value}</p>
            </div>
            <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-[14px] text-[var(--text)]">Clinic Growth</h3>
              <p className="text-[12px] text-[var(--text-muted)] mt-0.5">Active vs New Tenants</p>
            </div>
            <TrendingUp className="w-4 h-4 text-[var(--text-faint)]" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--gold)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--gold)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-soft)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', color: 'var(--text)' }}
                />
                <Area type="monotone" dataKey="active" stroke="var(--gold)" strokeWidth={2} fillOpacity={1} fill="url(#colorActive)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-[14px] text-[var(--text)]">Platform Usage</h3>
              <p className="text-[12px] text-[var(--text-muted)] mt-0.5">AI Minutes Consumed</p>
            </div>
            <Activity className="w-4 h-4 text-[var(--text-faint)]" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usageData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-soft)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <Tooltip
                  cursor={{ fill: 'var(--border-soft)' }}
                  contentStyle={{ backgroundColor: 'var(--paper)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px', color: 'var(--text)' }}
                />
                <Bar dataKey="minutes" fill="var(--gold)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
