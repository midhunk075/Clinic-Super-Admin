import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from './supabaseClient';
import type { PlatformRole, PlatformTab, UserRecord } from './types';
import { ShieldAlert, Loader2, Users as UsersIcon } from 'lucide-react';
import Overview from './components/Overview';
import Clinics from './components/Clinics';
import Plans from './components/Plans';
import Subscriptions from './components/Subscriptions';
import Users from './components/Users';
import PlatformTeam from './components/PlatformTeam';
import AccountHealth from './components/AccountHealth';
import AuditLogs from './components/AuditLogs';
import { canViewTab, ROLE_CONFIG } from './rbac';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [userRecord, setUserRecord] = useState<UserRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<PlatformTab>('overview');

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
      // 1. Check dedicated platform_staff table
      const { data: staffData } = await supabase
        .from('platform_staff')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (staffData) {
        setUserRecord({
          id: staffData.id,
          userId: staffData.user_id,
          email: staffData.email,
          fullName: staffData.full_name,
          role: staffData.role as PlatformRole,
          department: staffData.department,
          createdAt: staffData.created_at,
          status: staffData.status,
        });
        return;
      }

      // 2. Legacy fallback to clinic_users
      const { data: clinicUserData } = await supabase
        .from('clinic_users')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (clinicUserData && clinicUserData.role === 'super_admin') {
        setUserRecord({
          id: clinicUserData.id,
          userId: clinicUserData.user_id,
          email: clinicUserData.email,
          fullName: 'Super Admin',
          role: 'super_admin',
          createdAt: clinicUserData.created_at,
          status: clinicUserData.status,
        });
      }
    } catch (err) {
      console.error('Error fetching platform staff role:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError(error.message);
    setIsLoggingIn(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAF8F3]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0E6B58]" />
      </div>
    );
  }

  // Not logged in screen
  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--cream)]">
        <form onSubmit={handleLogin} className="card p-8 max-w-sm w-full">
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-semibold mb-2" style={{ color: 'var(--text)' }}>Platform Admin</h1>
            <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Sign in to manage the multi-clinic platform.</p>
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

  // Access check: must be a valid platform staff role
  const isAuthorized = userRecord && ['super_admin', 'tech_ops', 'support', 'billing_admin'].includes(userRecord.role);

  if (!isAuthorized) {
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
          <button className="btn-ghost w-full py-2 border border-[#E7E1D3]" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const roleMeta = ROLE_CONFIG[userRecord.role] || {
    label: userRecord.role,
    badgeClass: 'bg-gray-50 text-gray-800 border-gray-200',
  };

  // Authorized Platform Shell
  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF8F3]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0D2233] flex flex-col border-r border-[#16344B]">
        <div className="p-5 border-b border-[#16344B]">
          <h2 className="text-[#D9C298] font-display font-semibold text-[15px]">Founder Console</h2>
          <p className="text-[#5E7A8C] text-[11px] mt-0.5 tracking-wide uppercase">Platform Operations</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {canViewTab(userRecord.role, 'overview') && (
            <div className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              Overview
            </div>
          )}
          {canViewTab(userRecord.role, 'clinics') && (
            <div className={`nav-item ${activeTab === 'clinics' ? 'active' : ''}`} onClick={() => setActiveTab('clinics')}>
              Clinics
            </div>
          )}
          {canViewTab(userRecord.role, 'plans') && (
            <div className={`nav-item ${activeTab === 'plans' ? 'active' : ''}`} onClick={() => setActiveTab('plans')}>
              Plans
            </div>
          )}
          {canViewTab(userRecord.role, 'subscriptions') && (
            <div className={`nav-item ${activeTab === 'subscriptions' ? 'active' : ''}`} onClick={() => setActiveTab('subscriptions')}>
              Subscriptions
            </div>
          )}

          <div className="pt-4 pb-2 px-3">
             <p className="text-[#5E7A8C] text-[10px] font-bold tracking-wider uppercase">Governance & People</p>
          </div>

          {canViewTab(userRecord.role, 'users') && (
            <div className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
              Global Users
            </div>
          )}
          {canViewTab(userRecord.role, 'platform-team') && (
            <div className={`nav-item ${activeTab === 'platform-team' ? 'active' : ''}`} onClick={() => setActiveTab('platform-team')}>
              Platform Staff
            </div>
          )}
          {canViewTab(userRecord.role, 'account-health') && (
            <div className={`nav-item ${activeTab === 'account-health' ? 'active' : ''}`} onClick={() => setActiveTab('account-health')}>
              Platform Health
            </div>
          )}
          {canViewTab(userRecord.role, 'audit-logs') && (
            <div className={`nav-item ${activeTab === 'audit-logs' ? 'active' : ''}`} onClick={() => setActiveTab('audit-logs')}>
              Audit Logs
            </div>
          )}
        </nav>
        <div className="p-4 border-t border-[#16344B]">
          <button className="nav-item w-full" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-14 bg-white border-b border-[#E7E1D3] flex items-center px-6 justify-between shrink-0">
          <h1 className="font-semibold text-[#1D2620] capitalize">{activeTab.replace('-', ' ')}</h1>
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${roleMeta.badgeClass}`}>
              {roleMeta.label}
            </span>
            <span className="text-[12px] font-medium text-[#7C7566]">
              {userRecord.fullName ? `${userRecord.fullName} (${userRecord.email})` : userRecord.email}
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'overview' && <Overview />}
          {activeTab === 'clinics' && <Clinics />}
          {activeTab === 'plans' && <Plans />}
          {activeTab === 'subscriptions' && <Subscriptions />}
          {activeTab === 'users' && <Users />}
          {activeTab === 'platform-team' && <PlatformTeam currentUserRole={userRecord.role} />}
          {activeTab === 'account-health' && <AccountHealth />}
          {activeTab === 'audit-logs' && <AuditLogs />}
        </div>
      </main>
    </div>
  );
}
