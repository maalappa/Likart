import React, { useState, useEffect } from 'react';
import { X, Users, CheckCircle, ShieldCheck } from 'lucide-react';
import { AdminUser } from '../../../types';

interface AdminUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  mode: 'add' | 'edit';
  adminUser?: AdminUser | null;
}

const AVAILABLE_PERMISSIONS = [
  { id: 'orders_manage', label: 'Live Orders & Dispatch Override' },
  { id: 'restaurants_manage', label: 'Restaurant Management & KYC Approval' },
  { id: 'riders_manage', label: 'Delivery Fleet & Onboarding Compliance' },
  { id: 'zones_manage', label: 'Delivery Zones & Pricing Control' },
  { id: 'gateways_manage', label: 'Payment Gateways & Credentials' },
  { id: 'coupons_manage', label: 'Marketing Coupons & Hero Banners' },
  { id: 'franchises_manage', label: 'Franchise Network & Royalties' },
  { id: 'maps_manage', label: 'Google Maps API Keys & Geofencing' },
  { id: 'payouts_manage', label: 'Settlement Payouts & Approvals' },
  { id: 'support_manage', label: 'Customer & Partner Support Desk' },
  { id: 'rbac_manage', label: 'Admin Roles & Security Permissions' },
  { id: 'reports_export', label: 'Export Financial & Tax Reports' },
];

export const AdminUserModal: React.FC<AdminUserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  mode,
  adminUser,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AdminUser['role']>('operations');
  const [status, setStatus] = useState<AdminUser['status']>('active');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (adminUser && mode === 'edit') {
      setName(adminUser.name);
      setEmail(adminUser.email);
      setPassword(adminUser.password || '');
      setRole(adminUser.role);
      setStatus(adminUser.status);
      setSelectedPermissions(adminUser.permissions || []);
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setRole('operations');
      setStatus('active');
      setSelectedPermissions(['orders_manage', 'restaurants_manage', 'riders_manage']);
    }
  }, [adminUser, mode, isOpen]);

  if (!isOpen) return null;

  const togglePermission = (permId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const handleSelectAll = () => {
    setSelectedPermissions(AVAILABLE_PERMISSIONS.map((p) => p.id));
  };

  const handleClearAll = () => {
    setSelectedPermissions([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      email,
      password,
      role,
      status,
      permissions: role === 'super_admin' ? ['all', ...selectedPermissions] : selectedPermissions,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-base">
                {mode === 'add' ? 'Super Admin: Create Admin User' : `Edit Admin: ${adminUser?.name}`}
              </h3>
              <p className="text-[11px] text-slate-400">
                Assign administrative roles, login credentials & granular feature access
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Meera Kapoor"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-purple-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="meera@likartfood.com"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-purple-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Login Password *</label>
              <input
                type="text"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="SecurePassword2026"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-purple-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Admin Role *</label>
              <select
                value={role}
                onChange={(e) => {
                  const r = e.target.value as AdminUser['role'];
                  setRole(r);
                  if (r === 'super_admin') {
                    handleSelectAll();
                  }
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-purple-500"
              >
                <option value="super_admin">Super Admin (Full System Access)</option>
                <option value="franchise_admin">Franchise Territory Administrator (Franchise Portal)</option>
                <option value="operations">Operations Admin (Orders & Dispatch)</option>
                <option value="restaurant_manager">Restaurant Admin (KYC & Menus)</option>
                <option value="delivery_manager">Delivery Fleet Manager (Riders)</option>
                <option value="finance">Finance Controller (Settlements & Taxes)</option>
                <option value="support">Customer Support Lead (Tickets)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-purple-500"
              >
                <option value="active">Active & Authorized</option>
                <option value="inactive">Suspended / Deactivated</option>
              </select>
            </div>
          </div>

          {/* Granular Permissions */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                Granular Access Permissions:
              </span>
              <div className="flex gap-2 text-[10px]">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-purple-600 font-bold hover:underline"
                >
                  Select All
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-slate-500 font-bold hover:underline"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              {AVAILABLE_PERMISSIONS.map((perm) => (
                <label
                  key={perm.id}
                  className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-white cursor-pointer transition text-[11px]"
                >
                  <input
                    type="checkbox"
                    checked={role === 'super_admin' || selectedPermissions.includes(perm.id)}
                    disabled={role === 'super_admin'}
                    onChange={() => togglePermission(perm.id)}
                    className="mt-0.5 w-3.5 h-3.5 text-purple-600 rounded"
                  />
                  <span className={role === 'super_admin' || selectedPermissions.includes(perm.id) ? 'font-bold text-slate-900' : 'text-slate-600'}>
                    {perm.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-600/20 transition flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{mode === 'add' ? 'Create Admin User' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
