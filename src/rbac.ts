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
    'account_health.view',
    'audit.view',
    'settings.manage',
  ],
  admin: [],
  staff: [],
  viewer: [],
  doctor: [],
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
  'account-health': 'account_health.view',
  'audit-logs': 'audit.view',
  'settings': 'settings.manage',
};

export function canViewTab(role: PlatformRole, tab: PlatformTab): boolean {
  const perm = TAB_PERMISSIONS[tab];
  if (!perm) return true;
  return can(role, perm);
}
