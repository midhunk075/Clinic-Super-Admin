export type PlatformRole = 'super_admin' | 'admin' | 'staff' | 'viewer' | 'doctor';

export interface UserRecord {
  id: string;            // clinic_users row id
  userId: string;        // auth.users id
  email: string;
  role: PlatformRole;
  clinicId: string | null; 
  createdAt: string;
  lastSignIn?: string | null;
  status: 'active' | 'invited';
}

export interface Clinic {
  id: string;
  name: string;
  status: 'active' | 'suspended' | 'trial';
  created_at: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  monthly_price: number;
  annual_price: number;
  call_limit: number;
  ai_minutes_limit: number;
  user_limit: number;
  doctor_limit: number;
  status: 'active' | 'legacy' | 'draft';
}

export interface Subscription {
  id: string;
  clinic_id: string;
  plan_id: string;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  start_date: string;
  renewal_date: string;
  trial_end?: string;
}

export type PlatformTab =
  | 'overview'
  | 'clinics'
  | 'plans'
  | 'subscriptions'
  | 'usage'
  | 'users'
  | 'account-health'
  | 'audit-logs'
  | 'settings';
