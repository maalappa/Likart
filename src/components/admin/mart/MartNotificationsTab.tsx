import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Search,
  Trash2,
  Send,
  X,
  Users,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';

interface MartNotificationsTabProps {
  onLogAudit: (action: 'CREATE' | 'UPDATE' | 'DELETE' | 'NOTIFICATION_DISPATCH', module: any, targetId: string, details: string) => void;
}

export const MartNotificationsTab: React.FC<MartNotificationsTabProps> = ({ onLogAudit }) => {
  const { notifications, addNotification, deleteNotification, clearNotifications } = useApp();

  const [search, setSearch] = useState('');
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('10-Minute Grocery Flash Sale!');
  const [message, setMessage] = useState('Fresh dairy, crunchy munchies, and chilled sodas at 30% off. Order now for 10-minute delivery!');
  const [targetAudience, setTargetAudience] = useState<'all_customers' | 'active_riders' | 'store_managers'>('all_customers');
  const [notificationType, setNotificationType] = useState<'system' | 'order' | 'payout' | 'kyc'>('system');

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredNotifications = notifications.filter((n) => {
    const q = search.toLowerCase().trim();
    return !q || n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
  });

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    addNotification(title.trim(), message.trim(), notificationType);
    onLogAudit(
      'NOTIFICATION_DISPATCH',
      'Settings',
      `BLAST-${Date.now().toString().slice(-4)}`,
      `Broadcast push alert to audience [${targetAudience}]: "${title.trim()}"`
    );

    setBroadcastModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteNotification(id);
    onLogAudit('DELETE', 'Settings', id, `Deleted notification #${id}`);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Alert Broadcasts</span>
          <p className="text-2xl font-black font-heading text-slate-900">{notifications.length}</p>
          <span className="text-xs text-emerald-600 font-bold block">Push & in-app alerts sent</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Target Reach</span>
          <p className="text-2xl font-black font-heading text-purple-600">4,200+ Users</p>
          <span className="text-xs text-slate-500 font-medium block">Across active 10m delivery zones</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Delivery SLA Alerts</span>
          <p className="text-2xl font-black font-heading text-emerald-600">Active Instant Ping</p>
          <span className="text-xs text-slate-500 font-medium block">Audio sound tone triggers enabled</span>
        </div>
      </div>

      {/* Action Header & Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search alerts and broadcasts..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={clearNotifications}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
            >
              Clear All Alerts
            </button>
          )}

          <button
            type="button"
            onClick={() => setBroadcastModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-xs transition active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Dispatch Broadcast Alert</span>
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald-600" />
            <p className="font-bold text-sm">No notification alerts in log</p>
            <p className="text-xs">Dispatch a broadcast push notification to mart customers or fleet</p>
          </div>
        ) : (
          filteredNotifications.map((n, idx) => (
            <div
              key={`${n.id || 'notif'}-${idx}`}
              className="bg-white rounded-3xl border border-slate-200 p-4 shadow-2xs flex items-center justify-between gap-4 hover:border-emerald-300 transition"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{n.title}</h4>
                    <span className="px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase">
                      {n.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">{n.timestamp}</span>
                </div>
              </div>

              <div className="shrink-0">
                {deleteConfirmId === n.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDelete(n.id)}
                      className="px-2 py-1 bg-rose-600 text-white font-bold text-[10px] rounded hover:bg-rose-500"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(null)}
                      className="p-1 text-slate-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(n.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="Delete alert"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* DISPATCH BROADCAST MODAL */}
      {broadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in scale-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-emerald-100 text-emerald-700">
                  <Send className="w-4 h-4" />
                </span>
                <h3 className="font-heading font-black text-base text-slate-900">
                  Dispatch Push Alert Broadcast
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setBroadcastModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Audience</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="all_customers">All Mart Customers (10m Express App)</option>
                  <option value="active_riders">Express Delivery Partners (Riders on Duty)</option>
                  <option value="store_managers">Dark Store Pod Managers &amp; Supervisors</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notification Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Message Body *</label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-900 text-[11px] leading-relaxed">
                Will trigger immediate customer in-app notifications and sound chimes across connected devices in service radius.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBroadcastModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs"
                >
                  Send Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
