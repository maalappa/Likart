import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  ShieldCheck,
  Store,
  CheckCircle2,
  X,
  Power,
  Key,
  Eye,
  EyeOff,
  Copy,
  Sparkles,
  Lock,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { MartStaffUser, MartRoleConfig } from '../../../types';
import { INITIAL_MART_USERS } from '../../../data/quickCommerceData';
import { safeStorage } from '../../../utils/storageUtils';

interface MartUsersRolesTabProps {
  staffUsers: MartStaffUser[];
  setStaffUsers: React.Dispatch<React.SetStateAction<MartStaffUser[]>>;
  roles: MartRoleConfig[];
  onLogAudit: (action: 'CREATE' | 'UPDATE' | 'DELETE', module: any, targetId: string, details: string) => void;
}

export const MartUsersRolesTab: React.FC<MartUsersRolesTabProps> = ({
  staffUsers,
  setStaffUsers,
  roles,
  onLogAudit,
}) => {
  const { addNotification, darkStores } = useApp();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    user?: MartStaffUser | null;
  }>({ isOpen: false, mode: 'add' });

  const [credentialsModal, setCredentialsModal] = useState<{
    isOpen: boolean;
    user: MartStaffUser | null;
  }>({ isOpen: false, user: null });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<MartStaffUser['role']>('store_supervisor');
  const [assignedStoreId, setAssignedStoreId] = useState('all');
  const [status, setStatus] = useState<MartStaffUser['status']>('active');

  const filteredUsers = useMemo(() => {
    return staffUsers.filter((u) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.userId && u.userId.toLowerCase().includes(q)) ||
        u.phone.includes(q);
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [staffUsers, search, roleFilter]);

  const openAddModal = () => {
    setName('');
    setEmail('');
    setPhone('+91 ');
    setUserId(`staff.${Date.now().toString().slice(-4)}`);
    setPassword(`Staff#${Math.floor(1000 + Math.random() * 9000)}`);
    setShowPassword(false);
    setRole('store_supervisor');
    setAssignedStoreId(darkStores[0]?.id || 'all');
    setStatus('active');
    setModalState({ isOpen: true, mode: 'add', user: null });
  };

  const openEditModal = (u: MartStaffUser) => {
    setName(u.name);
    setEmail(u.email);
    setPhone(u.phone);
    setUserId(u.userId || (u.email ? u.email.split('@')[0] : `staff.${u.id.slice(-4)}`));
    setPassword(u.password || 'staff123password');
    setShowPassword(false);
    setRole(u.role);
    setAssignedStoreId(u.assignedStoreId || 'all');
    setStatus(u.status);
    setModalState({ isOpen: true, mode: 'edit', user: u });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !userId.trim() || !password.trim()) return;

    const selectedStore = darkStores.find((s) => s.id === assignedStoreId);
    const storeName = assignedStoreId === 'all' ? 'All Dark Store Pods' : selectedStore?.name || 'Selected Pod';

    if (modalState.mode === 'add') {
      const newId = `user-mart-${Date.now().toString().slice(-4)}`;
      const newUser: MartStaffUser = {
        id: newId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        userId: userId.trim().toLowerCase(),
        password: password.trim(),
        role,
        assignedStoreId,
        assignedStoreName: storeName,
        status,
        lastLogin: 'Never',
        createdAt: new Date().toISOString().split('T')[0],
      };

      setStaffUsers((prev) => {
        const updated = [newUser, ...prev];
        safeStorage.setItem('likart_mart_users', JSON.stringify(updated));
        return updated;
      });

      addNotification('User Added', `Staff member ${newUser.name} created with login ID: ${newUser.userId}.`, 'system');
      onLogAudit('CREATE', 'Users & Roles', newId, `Created mart operator ${newUser.name} (User ID: ${newUser.userId}, Role: ${role})`);
    } else if (modalState.user) {
      setStaffUsers((prev) => {
        const updated = prev.map((u) =>
          u.id === modalState.user!.id
            ? {
                ...u,
                name: name.trim(),
                email: email.trim().toLowerCase(),
                phone: phone.trim(),
                userId: userId.trim().toLowerCase(),
                password: password.trim(),
                role,
                assignedStoreId,
                assignedStoreName: storeName,
                status,
              }
            : u
        );
        safeStorage.setItem('likart_mart_users', JSON.stringify(updated));
        return updated;
      });

      addNotification('User Updated', `Updated staff account ${name.trim()} (User ID: ${userId.trim()}).`, 'system');
      onLogAudit('UPDATE', 'Users & Roles', modalState.user.id, `Super Admin updated staff profile & credentials for ${name.trim()} (User ID: ${userId.trim()})`);
    }

    setModalState({ isOpen: false, mode: 'add', user: null });
  };

  const handleDelete = (id: string, userName: string) => {
    if (id === 'user-mart-01') {
      addNotification('Protected Account', 'Primary Super Admin Apex cannot be deleted.', 'warning');
      setDeleteConfirmId(null);
      return;
    }

    setStaffUsers((prev) => {
      const updated = prev.filter((u) => u.id !== id);
      safeStorage.setItem('likart_mart_users', JSON.stringify(updated));
      return updated;
    });

    addNotification('User Deleted', `Account ${userName} deleted.`, 'warning');
    onLogAudit('DELETE', 'Users & Roles', id, `Deleted operator account ${userName}`);
    setDeleteConfirmId(null);
  };

  const roleNameMap: Record<string, string> = {
    mart_super_admin: 'Likart Mart Super Admin',
    store_supervisor: 'Dark Store Pod Supervisor',
    inventory_controller: 'Inventory Controller',
    dispatch_lead: 'Dispatch & Fleet Lead',
    support_agent: 'Support & Escalations Agent',
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Mart Staff</span>
          <p className="text-2xl font-black font-heading text-slate-900">{staffUsers.length}</p>
          <span className="text-xs text-emerald-600 font-bold block">Assigned operational personnel</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Active Roles</span>
          <p className="text-2xl font-black font-heading text-purple-600">{roles.length} Configured</p>
          <span className="text-xs text-slate-500 font-medium block">Granular permission sets</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Security Clearance</span>
          <p className="text-2xl font-black font-heading text-emerald-600">100% RBAC Enforced</p>
          <span className="text-xs text-slate-500 font-medium block">Role based access active</span>
        </div>
      </div>

      {/* Action Header & Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search staff user name, email, phone..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="all">All Roles</option>
            <option value="mart_super_admin">Super Admin</option>
            <option value="store_supervisor">Store Supervisor</option>
            <option value="inventory_controller">Inventory Controller</option>
            <option value="dispatch_lead">Dispatch Lead</option>
          </select>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-xs transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Mart Staff User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">System Role</th>
                <th className="py-3 px-4">Login User ID &amp; Password</th>
                <th className="py-3 px-4">Assigned Dark Store Hub</th>
                <th className="py-3 px-4">Last Active</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-bold text-sm">No staff users found</p>
                    <p className="text-xs">Add an operator account or adjust search query</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-800 font-black flex items-center justify-center text-xs border border-slate-200 uppercase">
                            {user.name.slice(0, 2)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{user.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono block">ID: {user.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 space-y-0.5">
                        <div className="flex items-center gap-1 text-slate-700 font-medium">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{user.phone}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{user.email}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 font-bold text-[11px] border border-purple-200">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{roleNameMap[user.role] || user.role}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">ID:</span>
                            <code className="bg-purple-50 text-purple-800 px-1.5 py-0.5 rounded text-[11px] font-mono font-bold border border-purple-200">
                              {user.userId || (user.email ? user.email.split('@')[0] : user.id)}
                            </code>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Pass:</span>
                            <span className="text-slate-600 font-mono text-[11px]">
                              {user.password ? '••••••••' : <span className="text-rose-500 font-normal italic">None</span>}
                            </span>
                            <button
                              type="button"
                              onClick={() => setCredentialsModal({ isOpen: true, user })}
                              className="px-1.5 py-0.5 text-[10px] bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded flex items-center gap-1 border border-purple-200 transition"
                              title="Set / Change User ID and Password"
                            >
                              <Key className="w-2.5 h-2.5" />
                              <span>Change</span>
                            </button>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-700 block">
                          {user.assignedStoreName || 'All Dark Store Pods'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {user.lastLogin || 'Just now'}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            user.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setCredentialsModal({ isOpen: true, user })}
                            className="p-1.5 text-purple-600 hover:text-purple-900 border border-purple-200 bg-purple-50 hover:bg-purple-100 rounded-lg transition"
                            title="Set / Change User ID & Password"
                          >
                            <Key className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditModal(user)}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                            title="Edit user profile"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {user.id !== 'user-mart-01' && (
                            <>
                              {deleteConfirmId === user.id ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(user.id, user.name)}
                                    className="px-2 py-1 bg-rose-600 text-white font-bold text-[10px] rounded hover:bg-rose-500"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="p-1 text-slate-400 hover:text-slate-600"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmId(user.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                  title="Delete user"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in scale-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-purple-100 text-purple-700">
                  <Users className="w-4 h-4" />
                </span>
                <h3 className="font-heading font-black text-base text-slate-900">
                  {modalState.mode === 'add' ? 'Add Mart Staff Member' : 'Edit Staff Account'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalState({ isOpen: false, mode: 'add', user: null })}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vikram Sethi"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (modalState.mode === 'add' && !userId) {
                        setUserId(e.target.value.split('@')[0] || '');
                      }
                    }}
                    placeholder="vikram@likartmart.com"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98450..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Super Admin Credential Control: User ID & Password */}
              <div className="p-3 bg-purple-50/70 border border-purple-200/90 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-900 flex items-center gap-1.5 text-[11px]">
                    <Key className="w-3.5 h-3.5 text-purple-700" />
                    <span>Super Admin Staff Credentials</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const num = Math.floor(1000 + Math.random() * 9000);
                      setPassword(`Staff#${num}!likart`);
                    }}
                    className="text-[10px] text-purple-700 hover:text-purple-950 font-bold underline"
                  >
                    Auto-Generate
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-[11px]">Staff User ID *</label>
                    <input
                      type="text"
                      required
                      value={userId}
                      onChange={(e) => setUserId(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      placeholder="e.g. staff.vikram"
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono text-[11px] font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-[11px]">Login Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full p-2 pr-7 bg-white border border-slate-200 rounded-xl font-mono text-[11px] font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-purple-700/80">
                  Only Likart Mart Super Admin has access to view, set, or change this staff password.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Assigned System Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="mart_super_admin">Likart Mart Super Admin</option>
                  <option value="store_supervisor">Dark Store Pod Supervisor</option>
                  <option value="inventory_controller">Inventory &amp; Supply Controller</option>
                  <option value="dispatch_lead">Express Fleet Dispatch Lead</option>
                  <option value="support_agent">Support &amp; Escalations Agent</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Assigned Pod / Jurisdiction</label>
                <select
                  value={assignedStoreId}
                  onChange={(e) => setAssignedStoreId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="all">All Dark Store Pods (Global)</option>
                  {darkStores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Account Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalState({ isOpen: false, mode: 'add', user: null })}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs"
                >
                  {modalState.mode === 'add' ? 'Create User' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUPER ADMIN DEDICATED CREDENTIAL MODAL */}
      {credentialsModal.isOpen && credentialsModal.user && (
        <StaffCredentialsModalForm
          user={credentialsModal.user}
          onClose={() => setCredentialsModal({ isOpen: false, user: null })}
          onSave={(newUserId, newPassword) => {
            const targetUser = credentialsModal.user!;
            setStaffUsers((prev) => {
              const updated = prev.map((u) =>
                u.id === targetUser.id
                  ? { ...u, userId: newUserId, password: newPassword }
                  : u
              );
              safeStorage.setItem('likart_mart_users', JSON.stringify(updated));
              return updated;
            });
            addNotification(
              'Staff Credentials Updated',
              `User ID and password for ${targetUser.name} updated and saved permanently.`,
              'system'
            );
            onLogAudit(
              'UPDATE',
              'Users & Roles',
              targetUser.id,
              `Super Admin changed login User ID (${newUserId}) and password for staff ${targetUser.name}`
            );
            setCredentialsModal({ isOpen: false, user: null });
          }}
        />
      )}
    </div>
  );
};

// Dedicated Modal for Super Admin to Set/Change Staff User ID and Password
interface StaffCredentialsModalFormProps {
  user: MartStaffUser;
  onClose: () => void;
  onSave: (userId: string, password: string) => void;
}

const StaffCredentialsModalForm: React.FC<StaffCredentialsModalFormProps> = ({
  user,
  onClose,
  onSave,
}) => {
  const [userId, setUserId] = useState(
    user.userId || (user.email ? user.email.split('@')[0] : `staff.${user.id.slice(-4)}`)
  );
  const [password, setPassword] = useState(user.password || 'staff123password');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let res = 'Staff@';
    for (let i = 0; i < 6; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(
      `Likart Mart Staff Portal Login Credentials:\nUser ID: ${userId}\nPassword: ${password}\nStaff Name: ${user.name}\nAssigned Pod: ${user.assignedStoreName || 'All Pods'}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim() || !password.trim()) return;
    onSave(userId.trim().toLowerCase(), password.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in scale-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <Key className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-heading font-black text-base text-slate-900">
                Set / Change Staff Credentials
              </h3>
              <p className="text-[11px] text-slate-500">
                Likart Mart Super Admin Access Control
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Staff Member:</span>
            <strong className="text-slate-900">{user.name}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Assigned Role:</span>
            <span className="text-purple-700 font-bold capitalize">{user.role.replace(/_/g, ' ')}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Email / Contact:</span>
            <span className="text-slate-700 font-mono text-[11px]">{user.email}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">Staff User ID / Login ID *</label>
              <button
                type="button"
                onClick={() => setUserId(user.email ? user.email.split('@')[0] : `staff.${user.id.slice(-4)}`)}
                className="text-[10px] text-emerald-600 hover:text-emerald-800 font-bold underline"
              >
                Reset Default
              </button>
            </div>
            <input
              type="text"
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value.toLowerCase().replace(/\s+/g, ''))}
              placeholder="e.g. staff.vikram"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold focus:bg-white"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">Staff Login Password *</label>
              <button
                type="button"
                onClick={handleGenerate}
                className="text-[10px] text-purple-600 hover:text-purple-800 font-bold flex items-center gap-1 underline"
              >
                <Sparkles className="w-3 h-3" />
                <span>Generate Strong Password</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full p-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold focus:bg-white text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleCopy}
              className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
            </button>

            <span className="text-[10px] text-slate-400 font-medium">
              ID: <code className="font-mono font-bold text-slate-700">{user.id}</code>
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Save Credentials</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
