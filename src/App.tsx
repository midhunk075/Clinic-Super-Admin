import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import type { PlatformRole, PlatformTab, UserRecord } from './types';
import { ShieldAlert, Loader2 } from 'lucide-react';
import Overview from './components/Overview';
import Clinics from './components/Clinics';
import Plans from './components/Plans';
import Subscriptions from './components/Subscriptions';
import Users from './components/Users';
import AccountHealth from './components/AccountHealth';
import AuditLogs from './components/AuditLogs';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [userRecord, setUserRecord] = useState<UserRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<PlatformTab>('overview');

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchUserRole(session.user.id);
      else setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) fetchUserRole(session.user.id);
      else {
        setUserRecord(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('clinic_users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data) {
        setUserRecord({
          id: data.id,
          userId: data.user_id,
          email: data.email,
          role: data.role as PlatformRole,
          clinicId: data.clinic_id,
          createdAt: data.created_at,
          status: data.status,
        });
      }
    } catch (err) {
      console.error('Error fetching role:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAF8F3]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0E6B58]" />
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError(error.message);
    setIsLoggingIn(false);
  };

  // Not logged in
  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--cream)]">
        <form onSubmit={handleLogin} className="card p-8 max-w-sm w-full">
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-semibold mb-2" style={{ color: 'var(--text)' }}>Platform Admin</h1>
            <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Sign in to manage the platform.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input w-full" placeholder="founder@clinic.com" />
            </div>
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="input w-full" placeholder="••••••••" />
            </div>

            {loginError && <p className="text-rose-600 text-[12px]">{loginError}</p>}

            <button type="submit" disabled={isLoggingIn} className="btn-primary w-full py-2.5 mt-2 flex justify-center items-center">
              {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Logged in, but not super_admin
  if (userRecord?.role !== 'super_admin') {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAF8F3]">
        <div className="card p-8 text-center max-w-sm w-full flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-4">
            <ShieldAlert className="w-6 h-6 text-rose-600" />
          </div>
          <h1 className="text-[16px] font-semibold mb-2 text-[#1D2620]">Access Denied</h1>
          <p className="text-[#7C7566] text-[13px] mb-6 leading-relaxed">
            Your account does not have platform administration privileges. Please log in to the Clinic Dashboard instead.
          </p>
          <button className="btn-ghost w-full py-2 border border-[#E7E1D3]" onClick={() => supabase.auth.signOut()}>
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Authorized Platform Shell
  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF8F3]">
      {/* Sidebar Placeholder */}
      <aside className="w-64 bg-[#0D2233] flex flex-col border-r border-[#16344B]">
        <div className="p-5 border-b border-[#16344B]">
          <h2 className="text-[#D9C298] font-display font-semibold text-[15px]">Founder Console</h2>
          <p className="text-[#5E7A8C] text-[11px] mt-0.5 tracking-wide uppercase">Platform Admin</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            Overview
          </div>
          <div className={`nav-item ${activeTab === 'clinics' ? 'active' : ''}`} onClick={() => setActiveTab('clinics')}>
            Clinics
          </div>
          <div className={`nav-item ${activeTab === 'plans' ? 'active' : ''}`} onClick={() => setActiveTab('plans')}>
            Plans
          </div>
          <div className={`nav-item ${activeTab === 'subscriptions' ? 'active' : ''}`} onClick={() => setActiveTab('subscriptions')}>
            Subscriptions
          </div>
          <div className="pt-4 pb-2 px-3">
             <p className="text-[#5E7A8C] text-[10px] font-bold tracking-wider uppercase">Governance</p>
          </div>
          <div className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            Global Users
          </div>
          <div className={`nav-item ${activeTab === 'account-health' ? 'active' : ''}`} onClick={() => setActiveTab('account-health')}>
            Platform Health
          </div>
          <div className={`nav-item ${activeTab === 'audit-logs' ? 'active' : ''}`} onClick={() => setActiveTab('audit-logs')}>
            Audit Logs
          </div>
        </nav>
        <div className="p-4 border-t border-[#16344B]">
          <button className="nav-item w-full" onClick={() => supabase.auth.signOut()}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-14 bg-white border-b border-[#E7E1D3] flex items-center px-6 justify-between shrink-0">
          <h1 className="font-semibold text-[#1D2620] capitalize">{activeTab}</h1>
          <div className="flex items-center gap-3">
            <span className="badge-amber bg-amber-50 text-amber-800 border-amber-200">Super Admin</span>
            <span className="text-[12px] font-medium text-[#7C7566]">{userRecord.email}</span>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'overview' && <Overview />}
          {activeTab === 'clinics' && <Clinics />}
          {activeTab === 'plans' && <Plans />}
          {activeTab === 'subscriptions' && <Subscriptions />}
          {activeTab === 'users' && <Users />}
          {activeTab === 'account-health' && <AccountHealth />}
          {activeTab === 'audit-logs' && <AuditLogs />}
        </div>
      </main>
    </div>
  );
}
