import type { PlatformRole, PlatformTab } from './types';

export type PlatformPermission =
  | 'platform.dashboard.view'
  | 'clinics.view'
  | 'clinics.manage'
  | 'plans.view'
  | 'plans.manage'
  | 'subscriptions.view'
  | 'subscriptions.manage'
  | 'usage.view'
  | 'users.view'
  | 'users.manage'
  | 'platform_staff.view'
  | 'platform_staff.manage'
  | 'account_health.view'
  | 'audit.view'
  | 'settings.manage';

const MATRIX: Record<PlatformRole, PlatformPermission[]> = {
  super_admin: [
    'platform.dashboard.view',
    'clinics.view',
    'clinics.manage',
    'plans.view',
    'plans.manage',
    'subscriptions.view',
    'subscriptions.manage',
    'usage.view',
    'users.view',
    'users.manage',
    'platform_staff.view',
    'platform_staff.manage',
    'account_health.view',
    'audit.view',
    'settings.manage',
  ],
  tech_ops: [
    'platform.dashboard.view',
    'clinics.view',
    'usage.view',
    'platform_staff.view',
    'account_health.view',
    'audit.view',
  ],
  support: [
    'platform.dashboard.view',
    'clinics.view',
    'users.view',
    'platform_staff.view',
    'audit.view',
  ],
  billing_admin: [
    'platform.dashboard.view',
    'clinics.view',
    'plans.view',
    'plans.manage',
    'subscriptions.view',
    'subscriptions.manage',
    'usage.view',
    'platform_staff.view',
  ],
};

export function can(role: PlatformRole, permission: PlatformPermission): boolean {
  return MATRIX[role]?.includes(permission) ?? false;
}

const TAB_PERMISSIONS: Partial<Record<PlatformTab, PlatformPermission>> = {
  'overview': 'platform.dashboard.view',
  'clinics': 'clinics.view',
  'plans': 'plans.view',
  'subscriptions': 'subscriptions.view',
  'usage': 'usage.view',
  'users': 'users.view',
  'platform-team': 'platform_staff.view',
  'account-health': 'account_health.view',
  'audit-logs': 'audit.view',
  'settings': 'settings.manage',
};

export function canViewTab(role: PlatformRole, tab: PlatformTab): boolean {
  const perm = TAB_PERMISSIONS[tab];
  if (!perm) return true;
  return can(role, perm);
}

export const ROLE_CONFIG: Record<PlatformRole, { label: string; badgeClass: string; description: string }> = {
  super_admin: {
    label: 'Super Admin',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
    description: 'Executive leadership with unrestricted platform authority',
  },
  tech_ops: {
    label: 'Tech Ops',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
    description: 'Engineering and telemetry operations',
  },
  support: {
    label: 'Support Specialist',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    description: 'Customer success and clinic support',
  },
  billing_admin: {
    label: 'Billing Admin',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    description: 'Subscriptions, plans, and revenue governance',
  },
};

