import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertTriangle,
  Lock,
  Save,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { MartRoleConfig } from '../../../types';
import { INITIAL_MART_ROLES } from '../../../data/quickCommerceData';
import { safeStorage } from '../../../utils/storageUtils';

interface MartPermissionsTabProps {
  roles: MartRoleConfig[];
  setRoles: React.Dispatch<React.SetStateAction<MartRoleConfig[]>>;
  onLogAudit: (action: 'CREATE' | 'UPDATE' | 'DELETE', module: any, targetId: string, details: string) => void;
}

export const MartPermissionsTab: React.FC<MartPermissionsTabProps> = ({
  roles,
  setRoles,
  onLogAudit,
}) => {
  const { addNotification } = useApp();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const permissionKeys: { key: keyof MartRoleConfig['permissions']; label: string }[] = [
    { key: 'canManageOrders', label: 'Manage Orders' },
    { key: 'canManageStores', label: 'Dark Stores Pods' },
    { key: 'canManageManagers', label: 'Store Managers' },
    { key: 'canManageProducts', label: 'Products & SKUs' },
    { key: 'canManageCategories', label: 'Categories / Aisles' },
    { key: 'canManageInventory', label: 'Stock & Inventory' },
    { key: 'canManageCouponsOffers', label: 'Coupons & Offers' },
    { key: 'canManagePayments', label: 'Payments & Gateways' },
    { key: 'canManagePayouts', label: 'Partner Payouts' },
    { key: 'canManageSupport', label: 'Support Tickets' },
    { key: 'canManageReviews', label: 'Customer Reviews' },
    { key: 'canManageUsersRoles', label: 'Users & Roles' },
    { key: 'canDeleteRecords', label: 'Delete Records' },
    { key: 'canExportReports', label: 'Export Reports' },
  ];

  const handleTogglePermission = (
    roleId: string,
    permKey: keyof MartRoleConfig['permissions']
  ) => {
    if (roleId === 'role-super-admin') {
      addNotification('Super Admin Protected', 'Super Admin role permissions are immutable.', 'warning');
      return;
    }

    setRoles((prev) => {
      const updated = prev.map((r) => {
        if (r.id === roleId) {
          const currentVal = r.permissions[permKey];
          return {
            ...r,
            permissions: {
              ...r.permissions,
              [permKey]: !currentVal,
            },
          };
        }
        return r;
      });
      safeStorage.setItem('likart_mart_roles', JSON.stringify(updated));
      return updated;
    });

    onLogAudit('UPDATE', 'Users & Roles', roleId, `Toggled permission ${permKey} for role ${roleId}`);
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    const newId = `role-${Date.now().toString().slice(-4)}`;
    const newRole: MartRoleConfig = {
      id: newId,
      roleName: newRoleName.trim(),
      description: newRoleDesc.trim() || 'Custom organizational operational role.',
      usersCount: 0,
      permissions: {
        canManageOrders: true,
        canManageStores: false,
        canManageManagers: false,
        canManageProducts: true,
        canManageCategories: false,
        canManageInventory: true,
        canManageCouponsOffers: false,
        canManagePayments: false,
        canManagePayouts: false,
        canManageSupport: true,
        canManageReviews: true,
        canManageUsersRoles: false,
        canDeleteRecords: false,
        canExportReports: true,
      },
    };

    setRoles((prev) => {
      const updated = [...prev, newRole];
      safeStorage.setItem('likart_mart_roles', JSON.stringify(updated));
      return updated;
    });

    addNotification('Role Created', `New system role "${newRole.roleName}" added.`, 'system');
    onLogAudit('CREATE', 'Users & Roles', newId, `Created custom security role: ${newRole.roleName}`);
    setNewRoleName('');
    setNewRoleDesc('');
    setAddModalOpen(false);
  };

  const handleDeleteRole = (id: string, roleName: string) => {
    if (id === 'role-super-admin') {
      addNotification('Super Admin Protected', 'Super Admin role cannot be deleted.', 'warning');
      setDeleteConfirmId(null);
      return;
    }

    setRoles((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      safeStorage.setItem('likart_mart_roles', JSON.stringify(updated));
      return updated;
    });

    addNotification('Role Deleted', `Security role "${roleName}" removed.`, 'warning');
    onLogAudit('DELETE', 'Users & Roles', id, `Deleted security role: ${roleName}`);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-heading font-black text-base text-slate-900">
            Likart Mart Role-Based Access Control (RBAC) Matrix
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Granular access toggles controlling add, edit, delete, and view permissions across modules.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-xs transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Role</span>
        </button>
      </div>

      {/* Permissions Matrix Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-4 px-4 sticky left-0 bg-slate-50 min-w-[200px]">
                  Permission Capability
                </th>
                {roles.map((r) => (
                  <th key={r.id} className="py-4 px-3 text-center min-w-[140px]">
                    <div className="space-y-1">
                      <span className="font-heading font-black text-xs text-slate-900 block leading-tight">
                        {r.roleName}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 block font-normal">
                        {r.id === 'role-super-admin' ? '🔒 Root Access' : `${r.usersCount || 0} users`}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissionKeys.map(({ key, label }) => (
                <tr key={key} className="hover:bg-slate-50/50 transition">
                  <td className="py-3 px-4 font-bold text-slate-800 sticky left-0 bg-white">
                    {label}
                  </td>
                  {roles.map((r) => {
                    const isSuper = r.id === 'role-super-admin';
                    const hasAccess = r.permissions[key];

                    return (
                      <td key={r.id} className="py-3 px-3 text-center">
                        <button
                          type="button"
                          disabled={isSuper}
                          onClick={() => handleTogglePermission(r.id, key)}
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition active:scale-95 ${
                            hasAccess
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          } ${isSuper ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}`}
                          title={`${hasAccess ? 'Allowed' : 'Denied'} - Click to toggle`}
                        >
                          {hasAccess ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Role Action Row */}
              <tr className="bg-slate-50/40">
                <td className="py-4 px-4 font-bold text-slate-400 uppercase text-[10px] sticky left-0 bg-slate-50">
                  Role Management
                </td>
                {roles.map((r) => (
                  <td key={r.id} className="py-4 px-3 text-center">
                    {r.id === 'role-super-admin' ? (
                      <span className="text-[10px] text-slate-400 font-bold flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Protected</span>
                      </span>
                    ) : (
                      <>
                        {deleteConfirmId === r.id ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleDeleteRole(r.id, r.roleName)}
                              className="px-2 py-0.5 bg-rose-600 text-white font-bold text-[9px] rounded"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(null)}
                              className="p-1 text-slate-400"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(r.id)}
                            className="text-[10px] font-bold text-rose-600 hover:underline inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete Role</span>
                          </button>
                        )}
                      </>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD CUSTOM ROLE MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in scale-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-emerald-100 text-emerald-700">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <h3 className="font-heading font-black text-base text-slate-900">
                  Create Custom Security Role
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Role Title *</label>
                <input
                  type="text"
                  required
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g. Night Shift Fulfillment Auditor"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Role Description</label>
                <textarea
                  rows={3}
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  placeholder="Responsibilities and purpose of this security role..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 text-[11px] leading-relaxed">
                Default baseline permissions will be assigned. You can toggle individual checkboxes in the matrix after creating.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
