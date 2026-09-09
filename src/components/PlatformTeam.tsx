import { useEffect, useState } from 'react';
import { Search, Shield, UserPlus, Mail, Building, Plus, X } from 'lucide-react';
import { supabase } from '../supabaseClient';
import type { PlatformRole, PlatformStaffMember } from '../types';
import { ROLE_CONFIG, can } from '../rbac';

interface PlatformTeamProps {
  currentUserRole: PlatformRole;
}

export default function PlatformTeam({ currentUserRole }: PlatformTeamProps) {
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<PlatformStaffMember[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showInviteModal, setShowInviteModal] = useState(false);

  // New staff form state
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<PlatformRole>('support');
  const [newDepartment, setNewDepartment] = useState('Customer Operations');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fallbackStaff: PlatformStaffMember[] = [
    {
      id: 'staff_1',
      userId: 'usr_founder',
      email: 'founder@clinic.com',
      fullName: 'Alex Vance (Founder)',
      role: 'super_admin',
      department: 'Executive',
      status: 'active',
      lastActiveAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'staff_2',
      userId: 'usr_devops',
      email: 'devops@clinic.com',
      fullName: 'Samir Khan (DevOps)',
      role: 'tech_ops',
      department: 'Infrastructure',
      status: 'active',
      lastActiveAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      createdAt: '2026-02-15T00:00:00Z',
    },
    {
      id: 'staff_3',
      userId: 'usr_support',
      email: 'support@clinic.com',
      fullName: 'Elena Rostova (Support Lead)',
      role: 'support',
      department: 'Customer Operations',
      status: 'active',
      lastActiveAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      createdAt: '2026-03-01T00:00:00Z',
    },
    {
      id: 'staff_4',
      userId: 'usr_billing',
      email: 'billing@clinic.com',
      fullName: 'Marcus Sterling',
      role: 'billing_admin',
      department: 'Finance',
      status: 'active',
      lastActiveAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      createdAt: '2026-04-10T00:00:00Z',
    },
  ];

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('platform_staff')
        .select('*')
        .order('created_at', { ascending: true });

      if (error || !data || data.length === 0) {
        setStaff(fallbackStaff);
      } else {
        setStaff(
          data.map((row: any) => ({
            id: row.id,
            userId: row.user_id,
            email: row.email,
            fullName: row.full_name,
            role: row.role as PlatformRole,
            department: row.department,
            status: row.status,
            lastActiveAt: row.last_active_at,
            createdAt: row.created_at,
          }))
        );
      }
    } catch {
      setStaff(fallbackStaff);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (staffId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    setStaff((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, status: nextStatus as any } : s))
    );

    try {
      await supabase.from('platform_staff').update({ status: nextStatus }).eq('id', staffId);
    } catch {
      // Handled gracefully in mock
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    const newMember: PlatformStaffMember = {
      id: `staff_${Date.now()}`,
      userId: `usr_${Date.now()}`,
      email: newEmail.trim().toLowerCase(),
      fullName: newFullName.trim(),
      role: newRole,
      department: newDepartment.trim(),
      status: 'active',
      lastActiveAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    try {
      const { error } = await supabase.from('platform_staff').insert({
        email: newMember.email,
        full_name: newMember.fullName,
        role: newMember.role,
        department: newMember.department,
        status: 'active',
      });

      if (error) {
        console.warn('DB insert bypassed or failed, adding to local view:', error.message);
      }
    } catch {
      // Local fallback
    }

    setStaff((prev) => [newMember, ...prev]);
    setSubmitting(false);
    setShowInviteModal(false);
    setNewFullName('');
    setNewEmail('');
  };

  const filteredStaff = staff.filter((m) => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.department && m.department.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'all' || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const canManage = can(currentUserRole, 'platform_staff.manage');

  return (
    <div className="space-y-6 page">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[#1D2620]">Platform Staff & Operators</h2>
          <p className="text-[13px] text-[#7C7566] mt-0.5">
            Manage global administrators, technical operators, and support personnel.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="btn-primary py-2 px-3.5 flex items-center gap-2 text-[13px]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A190]" />
          <input
            type="text"
            placeholder="Search by name, email, department..."
            className="input pl-10 w-full text-[13px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            className="input text-[13px] py-1.5 px-3 bg-white"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admins</option>
            <option value="tech_ops">Tech Ops</option>
            <option value="support">Support</option>
            <option value="billing_admin">Billing</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#7C7566] text-[13px]">Loading platform staff...</div>
        ) : filteredStaff.length === 0 ? (
          <div className="p-12 text-center text-[#7C7566] text-[13px]">No staff members match the filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="tbl w-full">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Department</th>
                  <th>Platform Role</th>
                  <th>Status</th>
                  <th>Last Active</th>
                  {canManage && <th className="text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((member) => {
                  const roleMeta = ROLE_CONFIG[member.role] || {
                    label: member.role,
                    badgeClass: 'bg-gray-100 text-gray-800 border-gray-200',
                  };
                  return (
                    <tr key={member.id} className="hover:bg-black/[0.01] transition-colors">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#E7E1D3] flex items-center justify-center font-semibold text-[13px] text-[#0D2233]">
                            {member.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-[13px] text-[#1D2620]">{member.fullName}</span>
                            <span className="text-[11px] text-[#7C7566] flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-[#A8A190]" /> {member.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="flex items-center gap-1.5 text-[12.5px] text-[#463F33]">
                          <Building className="w-3.5 h-3.5 text-[#A8A190]" />
                          <span>{member.department || 'General'}</span>
                        </div>
                      </td>

                      <td>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${roleMeta.badgeClass}`}>
                          <Shield className="w-3 h-3" />
                          {roleMeta.label}
                        </span>
                      </td>

                      <td>
                        <span className={`badge ${member.status === 'active' ? 'badge-green' : 'badge-amber'}`}>
                          <span className="badge-dot"></span>
                          {member.status}
                        </span>
                      </td>

                      <td>
                        <span className="text-[12px] text-[#7C7566]">
                          {member.lastActiveAt ? new Date(member.lastActiveAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Never'}
                        </span>
                      </td>

                      {canManage && (
                        <td className="text-right">
                          {member.role !== 'super_admin' ? (
                            <button
                              onClick={() => handleStatusToggle(member.id, member.status)}
                              className={`text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                                member.status === 'active' ? 'text-rose-600 hover:text-rose-800' : 'text-emerald-700 hover:text-emerald-900'
                              }`}
                            >
                              {member.status === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                          ) : (
                            <span className="text-[11px] text-[#A8A190] italic">Protected</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowInviteModal(false)}
              className="absolute right-4 top-4 text-[#7C7566] hover:text-[#1D2620]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-800">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-[17px] text-[#1D2620]">Add Platform Staff</h3>
                <p className="text-[12px] text-[#7C7566]">Grant platform access to internal team members.</p>
              </div>
            </div>

            {formError && <p className="text-[12px] text-rose-600 mb-4">{formError}</p>}

            <form onSubmit={handleInvite} className="space-y-4 text-[13px]">
              <div>
                <label className="block text-[12px] font-medium text-[#7C7566] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  className="input w-full"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#7C7566] mb-1">Internal Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@clinic.com"
                  className="input w-full"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-[#7C7566] mb-1">Platform Role</label>
                  <select
                    className="input w-full bg-white"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as PlatformRole)}
                  >
                    <option value="support">Support</option>
                    <option value="tech_ops">Tech Ops</option>
                    <option value="billing_admin">Billing Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#7C7566] mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Engineering"
                    className="input w-full"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="btn-ghost py-2 px-3 text-[13px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary py-2 px-4 text-[13px]"
                >
                  {submitting ? 'Adding...' : 'Confirm & Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
