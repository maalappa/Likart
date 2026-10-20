import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Download,
  Filter,
  CheckCircle2,
  X,
  Shield,
  Activity,
  AlertTriangle,
  Clock,
  ShieldAlert,
  RotateCcw,
  CheckSquare,
  Square,
  MinusSquare,
  ChevronDown,
  Calendar,
  Layers,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { MartAuditLog } from '../../../types';
import { INITIAL_MART_AUDIT_LOGS } from '../../../data/quickCommerceData';
import { safeStorage } from '../../../utils/storageUtils';

interface MartAuditLogsTabProps {
  logs: MartAuditLog[];
  setLogs: React.Dispatch<React.SetStateAction<MartAuditLog[]>>;
  onLogAudit?: (action: 'CREATE' | 'UPDATE' | 'DELETE', module: any, targetId: string, details: string) => void;
}

export const MartAuditLogsTab: React.FC<MartAuditLogsTabProps> = ({
  logs,
  setLogs,
  onLogAudit,
}) => {
  const { addNotification, clearAllMartAuditLogs, deleteBulkMartAuditLogs } = useApp();

  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Quick Clear Dropdown Menu
  const [quickClearMenuOpen, setQuickClearMenuOpen] = useState(false);

  // Security Clear Confirmation Modal
  const [clearConfirmModal, setClearConfirmModal] = useState<{
    isOpen: boolean;
    mode: 'all' | 'selected' | 'filtered' | 'older_7' | 'older_30';
    confirmText: string;
    acknowledged: boolean;
  }>({
    isOpen: false,
    mode: 'all',
    confirmText: '',
    acknowledged: false,
  });

  // Manual Add Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [manualModule, setManualModule] = useState<MartAuditLog['module']>('Inventory');
  const [manualAction, setManualAction] = useState<MartAuditLog['action']>('UPDATE');
  const [manualTarget, setManualTarget] = useState('POD-01-AUDIT');
  const [manualDetails, setManualDetails] = useState('');

  // Single Delete Confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        l.details.toLowerCase().includes(q) ||
        l.performedBy.toLowerCase().includes(q) ||
        l.targetId?.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q);
      const matchMod = moduleFilter === 'all' || l.module === moduleFilter;
      const matchAct = actionFilter === 'all' || l.action === actionFilter;
      return matchSearch && matchMod && matchAct;
    });
  }, [logs, search, moduleFilter, actionFilter]);

  // Bulk Selection Helpers
  const isAllFilteredSelected =
    filteredLogs.length > 0 && filteredLogs.every((l) => selectedIds.has(l.id));
  const isSomeFilteredSelected =
    filteredLogs.some((l) => selectedIds.has(l.id)) && !isAllFilteredSelected;

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelectAllFiltered = () => {
    if (isAllFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredLogs.map((l) => l.id)));
    }
  };

  // CSV Export Helper
  const handleExportCSV = (
    itemsToExport: MartAuditLog[] = filteredLogs,
    customFilename?: string
  ) => {
    if (!itemsToExport.length) {
      addNotification('No Records', 'There are no audit log records to export.', 'warning');
      return;
    }
    const headers = [
      'Log ID',
      'Timestamp',
      'Performed By',
      'Role',
      'Action',
      'Module',
      'Target ID',
      'Details',
      'IP Address',
    ];
    const rows = itemsToExport.map((l) => [
      l.id,
      l.timestamp,
      l.performedBy,
      l.role,
      l.action,
      l.module,
      l.targetId || 'N/A',
      l.details.replace(/"/g, '""'),
      l.ipAddress || 'Internal',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((cell) => `"${cell}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const fname =
      customFilename ||
      `Likart_Mart_Audit_Trail_${new Date().toISOString().split('T')[0]}`;
    link.setAttribute('download', `${fname}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addNotification('CSV Exported', `${itemsToExport.length} audit trail record(s) exported.`, 'system');
  };

  // Execute Clearing / Bulk Deletion
  const executeClear = () => {
    const mode = clearConfirmModal.mode;

    if (mode === 'all') {
      const totalCount = logs.length;
      if (clearAllMartAuditLogs) {
        clearAllMartAuditLogs();
      } else {
        setLogs([]);
        safeStorage.setItem('likart_mart_audit_logs', JSON.stringify([]));
      }
      setSelectedIds(new Set());
      addNotification('Audit Logs Cleared', `All ${totalCount} audit trail records permanently cleared by Super Admin.`, 'system');
      if (onLogAudit) {
        onLogAudit('DELETE', 'Users & Roles', 'AUDIT_LEDGER', `Super Admin purged entire audit trail of ${totalCount} records`);
      }
    } else if (mode === 'selected') {
      const count = selectedIds.size;
      const idsArray = Array.from(selectedIds);
      if (deleteBulkMartAuditLogs) {
        deleteBulkMartAuditLogs(idsArray);
      } else {
        const updated = logs.filter((l) => !selectedIds.has(l.id));
        setLogs(updated);
        safeStorage.setItem('likart_mart_audit_logs', JSON.stringify(updated));
      }
      setSelectedIds(new Set());
      addNotification('Selected Logs Deleted', `${count} selected audit log record(s) removed.`, 'warning');
      if (onLogAudit) {
        onLogAudit('DELETE', 'Users & Roles', 'BULK_LOGS', `Super Admin bulk deleted ${count} selected audit log entries`);
      }
    } else if (mode === 'filtered') {
      const filteredIdSet = new Set(filteredLogs.map((l) => l.id));
      const count = filteredIdSet.size;
      const updated = logs.filter((l) => !filteredIdSet.has(l.id));
      setLogs(updated);
      safeStorage.setItem('likart_mart_audit_logs', JSON.stringify(updated));
      setSelectedIds(new Set());
      addNotification('Filtered Logs Cleared', `${count} filtered audit log record(s) removed.`, 'warning');
      if (onLogAudit) {
        onLogAudit('DELETE', 'Users & Roles', 'FILTERED_LOGS', `Super Admin cleared ${count} filtered audit records`);
      }
    } else if (mode === 'older_7' || mode === 'older_30') {
      const days = mode === 'older_7' ? 7 : 30;
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
      const updated = logs.filter((l) => {
        const t = new Date(l.timestamp).getTime();
        return isNaN(t) || t >= cutoff;
      });
      const removedCount = logs.length - updated.length;
      setLogs(updated);
      safeStorage.setItem('likart_mart_audit_logs', JSON.stringify(updated));
      setSelectedIds(new Set());
      addNotification('Historical Logs Cleared', `${removedCount} audit record(s) older than ${days} days purged.`, 'system');
      if (onLogAudit) {
        onLogAudit('DELETE', 'Users & Roles', 'HISTORICAL_LOGS', `Super Admin purged ${removedCount} audit records older than ${days} days`);
      }
    }

    setClearConfirmModal({
      isOpen: false,
      mode: 'all',
      confirmText: '',
      acknowledged: false,
    });
  };

  // Restore Default Sample Logs
  const handleRestoreSampleLogs = () => {
    setLogs(INITIAL_MART_AUDIT_LOGS);
    safeStorage.setItem('likart_mart_audit_logs', JSON.stringify(INITIAL_MART_AUDIT_LOGS));
    setSelectedIds(new Set());
    addNotification('Sample Logs Restored', 'Standard demonstration security audit logs restored.', 'system');
  };

  // Create Manual Log Entry
  const handleCreateManualLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDetails.trim()) return;

    const newLog: MartAuditLog = {
      id: `log-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      performedBy: 'admin@likart.com (Super Admin)',
      role: 'Likart Mart Super Admin',
      action: manualAction,
      module: manualModule,
      targetId: manualTarget.trim() || 'SYSTEM',
      details: manualDetails.trim(),
      ipAddress: '103.21.144.12',
    };

    setLogs((prev) => {
      const updated = [newLog, ...prev];
      safeStorage.setItem('likart_mart_audit_logs', JSON.stringify(updated));
      return updated;
    });

    addNotification('Audit Entry Added', 'Manual security audit entry recorded.', 'system');
    setManualDetails('');
    setAddModalOpen(false);
  };

  // Single Log Delete
  const handleDeleteLog = (id: string) => {
    setLogs((prev) => {
      const updated = prev.filter((l) => l.id !== id);
      safeStorage.setItem('likart_mart_audit_logs', JSON.stringify(updated));
      return updated;
    });
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    addNotification('Audit Log Deleted', `Log record #${id} removed.`, 'warning');
    setDeleteConfirmId(null);
  };

  const actionColorMap: Record<string, string> = {
    CREATE: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    UPDATE: 'bg-blue-100 text-blue-800 border border-blue-200',
    DELETE: 'bg-rose-100 text-rose-800 border border-rose-200',
    STATUS_CHANGE: 'bg-amber-100 text-amber-800 border border-amber-200',
    PAYOUT_SETTLE: 'bg-purple-100 text-purple-800 border border-purple-200',
    NOTIFICATION_DISPATCH: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
    EXPORT: 'bg-slate-100 text-slate-800 border border-slate-200',
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* 1. Metrics & Super Admin Access Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Total Activity Events
            </span>
            <Shield className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black font-heading text-slate-900">{logs.length}</p>
          <span className="text-xs text-emerald-600 font-bold block">
            {logs.length > 0 ? 'Permanent ledger active' : 'All logs cleared'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Critical Actions Tracked
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-black font-heading text-rose-600">
            {logs.filter((l) => l.action === 'DELETE' || l.action === 'STATUS_CHANGE').length} Events
          </p>
          <span className="text-xs text-slate-500 font-medium block">
            Deletions &amp; status modifications
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Super Admin Control
            </span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black font-heading text-amber-700">Clear &amp; Purge</p>
          <span className="text-xs text-slate-500 font-medium block">
            Full all/bulk clear access enabled
          </span>
        </div>
      </div>

      {/* 2. Action Header, Filters & Clear Buttons */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Left: Search & Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search actor, target ID, details..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500 focus:bg-white"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white"
          >
            <option value="all">All Modules</option>
            <option value="Orders">Orders</option>
            <option value="Stores">Stores</option>
            <option value="Inventory">Inventory</option>
            <option value="Products">Products</option>
            <option value="Customers">Customers</option>
            <option value="Delivery Partners">Delivery Partners</option>
            <option value="Payouts">Payouts</option>
            <option value="Coupons">Coupons</option>
            <option value="Users & Roles">Users &amp; Roles</option>
          </select>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white"
          >
            <option value="all">All Action Types</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="STATUS_CHANGE">STATUS_CHANGE</option>
            <option value="PAYOUT_SETTLE">PAYOUT_SETTLE</option>
            <option value="NOTIFICATION_DISPATCH">NOTIFICATION_DISPATCH</option>
            <option value="EXPORT">EXPORT</option>
          </select>

          {(search || moduleFilter !== 'all' || actionFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setModuleFilter('all');
                setActionFilter('all');
              }}
              className="px-2.5 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Right: Actions (Clear All / Bulk Clear Options / Export / Add) */}
        <div className="flex flex-wrap items-center gap-2 justify-end">
          {/* Quick Clear Dropdown for Super Admin */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setQuickClearMenuOpen(!quickClearMenuOpen)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black rounded-xl border border-rose-200 transition active:scale-95 shadow-2xs"
              title="Super Admin Audit Clear Options"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Clear Options</span>
              <ChevronDown className="w-3 h-3 text-rose-500" />
            </button>

            {quickClearMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setQuickClearMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 space-y-1 text-xs animate-in fade-in">
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                      Super Admin Clear Access
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      Audit Trail Maintenance
                    </span>
                  </div>

                  {/* Clear All */}
                  <button
                    type="button"
                    disabled={logs.length === 0}
                    onClick={() => {
                      setQuickClearMenuOpen(false);
                      setClearConfirmModal({
                        isOpen: true,
                        mode: 'all',
                        confirmText: '',
                        acknowledged: false,
                      });
                    }}
                    className="w-full text-left px-3 py-2 text-rose-700 hover:bg-rose-50 rounded-xl font-bold flex items-center justify-between disabled:opacity-40 disabled:hover:bg-transparent"
                  >
                    <span className="flex items-center gap-2">
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Clear All Logs</span>
                    </span>
                    <span className="text-[10px] font-mono bg-rose-100 px-1.5 py-0.5 rounded text-rose-800">
                      {logs.length}
                    </span>
                  </button>

                  {/* Clear Filtered (if filter is active) */}
                  {(search || moduleFilter !== 'all' || actionFilter !== 'all') && (
                    <button
                      type="button"
                      disabled={filteredLogs.length === 0}
                      onClick={() => {
                        setQuickClearMenuOpen(false);
                        setClearConfirmModal({
                          isOpen: true,
                          mode: 'filtered',
                          confirmText: '',
                          acknowledged: false,
                        });
                      }}
                      className="w-full text-left px-3 py-2 text-amber-800 hover:bg-amber-50 rounded-xl font-bold flex items-center justify-between disabled:opacity-40"
                    >
                      <span className="flex items-center gap-2">
                        <Filter className="w-3.5 h-3.5 text-amber-600" />
                        <span>Clear Filtered Records</span>
                      </span>
                      <span className="text-[10px] font-mono bg-amber-100 px-1.5 py-0.5 rounded text-amber-800">
                        {filteredLogs.length}
                      </span>
                    </button>
                  )}

                  {/* Clear Older than 7 Days */}
                  <button
                    type="button"
                    disabled={logs.length === 0}
                    onClick={() => {
                      setQuickClearMenuOpen(false);
                      setClearConfirmModal({
                        isOpen: true,
                        mode: 'older_7',
                        confirmText: '',
                        acknowledged: false,
                      });
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-xl font-medium flex items-center gap-2 disabled:opacity-40"
                  >
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Clear Logs &gt; 7 Days Old</span>
                  </button>

                  {/* Clear Older than 30 Days */}
                  <button
                    type="button"
                    disabled={logs.length === 0}
                    onClick={() => {
                      setQuickClearMenuOpen(false);
                      setClearConfirmModal({
                        isOpen: true,
                        mode: 'older_30',
                        confirmText: '',
                        acknowledged: false,
                      });
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-xl font-medium flex items-center gap-2 disabled:opacity-40"
                  >
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Clear Logs &gt; 30 Days Old</span>
                  </button>

                  {logs.length === 0 && (
                    <div className="pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setQuickClearMenuOpen(false);
                          handleRestoreSampleLogs();
                        }}
                        className="w-full text-left px-3 py-2 text-emerald-700 hover:bg-emerald-50 rounded-xl font-bold flex items-center gap-2"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Restore Sample Demo Logs</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Quick Clear All Button (Direct) */}
          <button
            type="button"
            disabled={logs.length === 0}
            onClick={() =>
              setClearConfirmModal({
                isOpen: true,
                mode: 'all',
                confirmText: '',
                acknowledged: false,
              })
            }
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl transition shadow-xs active:scale-95 disabled:opacity-40 disabled:hover:bg-rose-600"
            title="Permanently clear all audit logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>

          {/* Export CSV */}
          <button
            type="button"
            onClick={() => handleExportCSV(filteredLogs)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {/* Add Manual Audit Entry */}
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-xs transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Manual Entry</span>
          </button>
        </div>
      </div>

      {/* 3. Floating / Sticky Bulk Action Bar (When items are checked) */}
      {selectedIds.size > 0 && (
        <div className="bg-slate-900 text-white p-3.5 sm:p-4 rounded-2xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold">
              <strong className="text-emerald-300 font-black">{selectedIds.size}</strong> of {filteredLogs.length} audit record(s) selected
            </span>
            {selectedIds.size < filteredLogs.length && (
              <button
                type="button"
                onClick={() => setSelectedIds(new Set(filteredLogs.map((l) => l.id)))}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold underline transition"
              >
                Select all {filteredLogs.length} visible
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() =>
                handleExportCSV(
                  logs.filter((l) => selectedIds.has(l.id)),
                  `Likart_Mart_Audit_Selected_${selectedIds.size}`
                )
              }
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Selected ({selectedIds.size})</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setClearConfirmModal({
                  isOpen: true,
                  mode: 'selected',
                  confirmText: '',
                  acknowledged: false,
                })
              }
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.size})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white font-medium transition"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* 4. Logs Table with Bulk Select Checkbox */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 w-10">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      aria-label="Select all filtered records"
                      checked={isAllFilteredSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeFilteredSelected;
                      }}
                      onChange={handleToggleSelectAllFiltered}
                      className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 border-slate-300 cursor-pointer"
                    />
                  </div>
                </th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Module</th>
                <th className="py-3 px-3">Performed By</th>
                <th className="py-3 px-3">Target ID</th>
                <th className="py-3 px-4">Activity Details</th>
                <th className="py-3 px-4 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-slate-400">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p className="font-bold text-sm text-slate-700">
                      {logs.length === 0
                        ? 'Audit Trail is Empty (Cleared by Super Admin)'
                        : 'No audit records match the selected filters'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      {logs.length === 0
                        ? 'All historical audit entries have been cleared. New operations will be automatically logged in real time.'
                        : 'Try adjusting your search keywords or resetting module and action filters.'}
                    </p>
                    {logs.length === 0 && (
                      <div className="mt-4 flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={handleRestoreSampleLogs}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore Sample Demo Logs</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAddModalOpen(true)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                        >
                          Add Manual Entry
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isChecked = selectedIds.has(log.id);

                  return (
                    <tr
                      key={log.id}
                      className={`transition ${
                        isChecked ? 'bg-emerald-50/60' : 'hover:bg-slate-50/50'
                      }`}
                    >
                      <td className="py-3 px-4 w-10">
                        <input
                          type="checkbox"
                          aria-label={`Select log ${log.id}`}
                          checked={isChecked}
                          onChange={() => handleToggleSelectOne(log.id)}
                          className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 border-slate-300 cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {log.timestamp}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            actionColorMap[log.action] || 'bg-slate-100 text-slate-800 border border-slate-200'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900">{log.module}</span>
                      </td>

                      <td className="py-3 px-3">
                        <span className="text-slate-800 block font-semibold">{log.performedBy}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">{log.role}</span>
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-700 font-bold">
                        {log.targetId || 'N/A'}
                      </td>

                      <td className="py-3 px-4 text-slate-700 max-w-md">
                        <p className="line-clamp-2 leading-relaxed">{log.details}</p>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {deleteConfirmId === log.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleDeleteLog(log.id)}
                              className="px-2 py-0.5 bg-rose-600 text-white font-bold text-[9px] rounded shadow-xs"
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
                            onClick={() => setDeleteConfirmId(log.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete log entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. SUPER ADMIN CLEAR / BULK CONFIRMATION MODAL */}
      {clearConfirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base">
                    {clearConfirmModal.mode === 'all' && 'Clear All Audit Logs'}
                    {clearConfirmModal.mode === 'selected' && `Delete Selected Logs (${selectedIds.size})`}
                    {clearConfirmModal.mode === 'filtered' && `Clear Filtered Records (${filteredLogs.length})`}
                    {clearConfirmModal.mode === 'older_7' && 'Clear Logs Older Than 7 Days'}
                    {clearConfirmModal.mode === 'older_30' && 'Clear Logs Older Than 30 Days'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Likart Mart Super Admin Authorization
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setClearConfirmModal({
                    isOpen: false,
                    mode: 'all',
                    confirmText: '',
                    acknowledged: false,
                  })
                }
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 text-rose-900 space-y-1">
                <span className="font-black text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Permanent Deletion Warning</span>
                </span>
                <p className="text-[11px] text-rose-800 leading-relaxed">
                  {clearConfirmModal.mode === 'all' &&
                    `This will permanently delete all ${logs.length} audit trail record(s) from system storage. This action is irreversible.`}
                  {clearConfirmModal.mode === 'selected' &&
                    `This will permanently remove the ${selectedIds.size} selected audit entry record(s).`}
                  {clearConfirmModal.mode === 'filtered' &&
                    `This will permanently delete all ${filteredLogs.length} record(s) matching your current filters.`}
                  {clearConfirmModal.mode === 'older_7' &&
                    'This will purge all audit events recorded more than 7 days ago.'}
                  {clearConfirmModal.mode === 'older_30' &&
                    'This will purge all audit events recorded more than 30 days ago.'}
                </p>
              </div>

              {/* Safety Backup Option */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-800 block">Backup First (Recommended)</span>
                  <span className="text-[11px] text-slate-500">Download CSV snapshot before purging</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const toBackup =
                      clearConfirmModal.mode === 'selected'
                        ? logs.filter((l) => selectedIds.has(l.id))
                        : clearConfirmModal.mode === 'filtered'
                        ? filteredLogs
                        : logs;
                    handleExportCSV(toBackup, `Likart_Mart_Audit_PrePurge_Backup_${Date.now()}`);
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 transition text-[11px] flex items-center gap-1 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Backup</span>
                </button>
              </div>

              {/* Acknowledgement Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-2xl border border-slate-200 bg-slate-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={clearConfirmModal.acknowledged}
                  onChange={(e) =>
                    setClearConfirmModal({
                      ...clearConfirmModal,
                      acknowledged: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded text-rose-600 accent-rose-600 mt-0.5"
                />
                <span className="text-slate-700 leading-snug">
                  I confirm that I am authorized as <strong>Likart Mart Super Admin</strong> to clear and purge these audit trail records.
                </span>
              </label>

              {/* For 'all' mode: Require typing 'CLEAR' */}
              {clearConfirmModal.mode === 'all' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Type <strong className="text-rose-600 font-mono">CLEAR</strong> to confirm:
                  </label>
                  <input
                    type="text"
                    value={clearConfirmModal.confirmText}
                    onChange={(e) =>
                      setClearConfirmModal({
                        ...clearConfirmModal,
                        confirmText: e.target.value,
                      })
                    }
                    placeholder="Type CLEAR"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-center tracking-widest text-slate-800 uppercase focus:outline-rose-500 focus:bg-white"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setClearConfirmModal({
                      isOpen: false,
                      mode: 'all',
                      confirmText: '',
                      acknowledged: false,
                    })
                  }
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={
                    !clearConfirmModal.acknowledged ||
                    (clearConfirmModal.mode === 'all' &&
                      clearConfirmModal.confirmText.trim().toUpperCase() !== 'CLEAR')
                  }
                  onClick={executeClear}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:hover:bg-rose-600 text-white font-bold rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>
                    {clearConfirmModal.mode === 'all'
                      ? 'Purge All Logs'
                      : clearConfirmModal.mode === 'selected'
                      ? `Delete ${selectedIds.size} Record(s)`
                      : 'Confirm Clear'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. ADD MANUAL AUDIT LOG MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-slate-100 text-slate-700">
                  <FileText className="w-4 h-4" />
                </span>
                <h3 className="font-heading font-black text-base text-slate-900">
                  Record Manual Security Inspection
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

            <form onSubmit={handleCreateManualLog} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Module</label>
                  <select
                    value={manualModule}
                    onChange={(e) => setManualModule(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="Orders">Orders</option>
                    <option value="Stores">Stores</option>
                    <option value="Inventory">Inventory</option>
                    <option value="Products">Products</option>
                    <option value="Customers">Customers</option>
                    <option value="Delivery Partners">Delivery Partners</option>
                    <option value="Payouts">Payouts</option>
                    <option value="Coupons">Coupons</option>
                    <option value="Users & Roles">Users &amp; Roles</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Action Type</label>
                  <select
                    value={manualAction}
                    onChange={(e) => setManualAction(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold uppercase"
                  >
                    <option value="UPDATE">UPDATE</option>
                    <option value="CREATE">CREATE</option>
                    <option value="DELETE">DELETE</option>
                    <option value="STATUS_CHANGE">STATUS_CHANGE</option>
                    <option value="PAYOUT_SETTLE">PAYOUT_SETTLE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target ID / Code</label>
                <input
                  type="text"
                  value={manualTarget}
                  onChange={(e) => setManualTarget(e.target.value)}
                  placeholder="e.g. POD-01, SKU-101"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Audit Details / Verification Log *</label>
                <textarea
                  rows={3}
                  required
                  value={manualDetails}
                  onChange={(e) => setManualDetails(e.target.value)}
                  placeholder="Describe the security audit, physical inventory count check, or compliance note..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
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
                  Save Audit Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
