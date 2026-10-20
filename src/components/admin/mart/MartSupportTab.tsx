import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  Plus,
  Search,
  MessageSquare,
  Trash2,
  CheckCircle2,
  X,
  AlertTriangle,
  Clock,
  User,
  ShoppingBag,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { SupportTicket } from '../../../types';

interface MartSupportTabProps {
  onLogAudit: (action: 'CREATE' | 'UPDATE' | 'DELETE', module: any, targetId: string, details: string) => void;
}

export const MartSupportTab: React.FC<MartSupportTabProps> = ({ onLogAudit }) => {
  const { supportTickets, createSupportTicket, replySupportTicket, deleteSupportTicket, addNotification } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'resolved'>('all');

  // Add Ticket Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState(`ORD-MART-${Math.floor(1000 + Math.random() * 9000)}`);
  const [customerName, setCustomerName] = useState('Priya Mehta');

  // Reply Modal
  const [replyModal, setReplyModal] = useState<{
    isOpen: boolean;
    ticket?: SupportTicket | null;
    replyText: string;
  }>({ isOpen: false, ticket: null, replyText: '' });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredTickets = useMemo(() => {
    return supportTickets.filter((t) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        t.subject.toLowerCase().includes(q) ||
        t.message.toLowerCase().includes(q) ||
        t.userName.toLowerCase().includes(q) ||
        (t.orderId && t.orderId.toLowerCase().includes(q));
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [supportTickets, search, statusFilter]);

  const openAddTicket = () => {
    setSubject('Delayed Milk Delivery in 10m SLA');
    setMessage('Customer reported packet was delivered in 14 minutes instead of 10 minutes. Delivery compensation requested.');
    setOrderId(`ORD-MART-${Math.floor(1000 + Math.random() * 9000)}`);
    setCustomerName('Priya Mehta');
    setAddModalOpen(true);
  };

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    createSupportTicket({
      subject: subject.trim(),
      message: message.trim(),
      orderId: orderId.trim(),
    });

    onLogAudit('CREATE', 'Support', orderId, `Created support ticket for ${customerName}: ${subject.trim()}`);
    setAddModalOpen(false);
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyModal.ticket || !replyModal.replyText.trim()) return;

    replySupportTicket(replyModal.ticket.id, replyModal.replyText.trim());
    onLogAudit('UPDATE', 'Support', replyModal.ticket.id, `Replied to ticket #${replyModal.ticket.id}`);
    setReplyModal({ isOpen: false, ticket: null, replyText: '' });
  };

  const handleDelete = (id: string) => {
    deleteSupportTicket(id);
    onLogAudit('DELETE', 'Support', id, `Deleted ticket #${id}`);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Customer Tickets</span>
          <p className="text-2xl font-black font-heading text-slate-900">{supportTickets.length}</p>
          <span className="text-xs text-emerald-600 font-bold block">Care & SLA escalations</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Open & In Progress</span>
          <p className="text-2xl font-black font-heading text-amber-500">
            {supportTickets.filter((t) => t.status === 'open').length} Open
          </p>
          <span className="text-xs text-slate-500 font-medium block">Under 5m target SLA</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Resolved Successfully</span>
          <p className="text-2xl font-black font-heading text-emerald-600">
            {supportTickets.filter((t) => t.status === 'resolved').length} Closed
          </p>
          <span className="text-xs text-emerald-600 font-bold block">100% Customer satisfaction</span>
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
              placeholder="Search ticket subject, order, user..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {(['all', 'open', 'resolved'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-lg capitalize transition ${
                  statusFilter === s ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={openAddTicket}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-xs transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create Support Ticket</span>
        </button>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
            <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald-600" />
            <p className="font-bold text-sm">No support tickets found</p>
            <p className="text-xs">Customer issues and 10m delivery queries appear here</p>
          </div>
        ) : (
          filteredTickets.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-3 hover:border-emerald-300 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-heading font-black text-sm text-slate-900">{t.subject}</span>
                  <span className="text-[10px] text-slate-400 font-mono">#{t.id}</span>
                  {t.orderId && (
                    <span className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Order: {t.orderId}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      t.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {t.status}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setReplyModal({
                        isOpen: true,
                        ticket: t,
                        replyText: t.reply || 'Our dispatch lead has reviewed this. We apologize for the delay.',
                      })
                    }
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg transition"
                  >
                    Reply
                  </button>

                  {deleteConfirmId === t.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDelete(t.id)}
                        className="px-2 py-0.5 bg-rose-600 text-white font-bold text-[9px] rounded"
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
                      onClick={() => setDeleteConfirmId(t.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete ticket"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                {t.message}
              </p>

              {t.reply && (
                <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100 text-xs text-emerald-900 space-y-1">
                  <span className="font-bold text-[11px] block">Support Agent Resolution:</span>
                  <p>{t.reply}</p>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                <span>User: {t.userName}</span>
                <span>{new Date(t.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE TICKET MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in scale-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-emerald-100 text-emerald-700">
                  <HelpCircle className="w-4 h-4" />
                </span>
                <h3 className="font-heading font-black text-base text-slate-900">
                  Create Support Ticket
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

            <form onSubmit={handleCreateTicketSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Customer / Reporter Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Issue Subject *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Related Mart Order ID</label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Message / Incident Details *</label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
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
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPLY MODAL */}
      {replyModal.isOpen && replyModal.ticket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in scale-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-black text-sm text-slate-900">
                Resolve &amp; Reply Ticket #{replyModal.ticket.id}
              </h3>
              <button
                type="button"
                onClick={() => setReplyModal({ isOpen: false, ticket: null, replyText: '' })}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReplySubmit} className="space-y-3.5 text-xs">
              <p className="text-slate-600">
                <strong>Subject:</strong> {replyModal.ticket.subject}
              </p>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Resolution Response *</label>
                <textarea
                  rows={3}
                  required
                  value={replyModal.replyText}
                  onChange={(e) => setReplyModal((prev) => ({ ...prev, replyText: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReplyModal({ isOpen: false, ticket: null, replyText: '' })}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs"
                >
                  Mark Resolved &amp; Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
