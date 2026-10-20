import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  X,
  CreditCard,
  Building,
  User,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { PayoutRequest } from '../../../types';

interface MartPayoutsTabProps {
  onLogAudit: (action: 'CREATE' | 'UPDATE' | 'DELETE' | 'PAYOUT_SETTLE', module: any, targetId: string, details: string) => void;
}

export const MartPayoutsTab: React.FC<MartPayoutsTabProps> = ({ onLogAudit }) => {
  const {
    payoutRequests,
    requestPayout,
    settlePayout,
    rejectPayout,
    deletePayout,
    deliveryPartners,
    darkStores,
    addNotification,
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'settled' | 'rejected'>('all');

  // Add Payout Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [recipientType, setRecipientType] = useState<'delivery' | 'restaurant'>('delivery');
  const [recipientId, setRecipientId] = useState(deliveryPartners[0]?.id || '');
  const [amount, setAmount] = useState(2500);
  const [payoutMethod, setPayoutMethod] = useState<'upi' | 'bank_transfer'>('upi');
  const [upiId, setUpiId] = useState('rider@okhdfcbank');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [holderName, setHolderName] = useState('');
  const [bankName, setBankName] = useState('');

  // Settle Modal
  const [settleModal, setSettleModal] = useState<{
    isOpen: boolean;
    payout?: PayoutRequest | null;
    referenceId: string;
  }>({ isOpen: false, payout: null, referenceId: '' });

  // Reject Modal
  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    payout?: PayoutRequest | null;
    reason: string;
  }>({ isOpen: false, payout: null, reason: '' });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredPayouts = useMemo(() => {
    return payoutRequests.filter((p) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.recipientName?.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        (p.bankOrUpiDetails && p.bankOrUpiDetails.toLowerCase().includes(q));
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [payoutRequests, search, statusFilter]);

  const openAddPayout = () => {
    setRecipientType('delivery');
    setRecipientId(deliveryPartners[0]?.id || '');
    setAmount(1500);
    setPayoutMethod('upi');
    setUpiId('rider.express@okaxis');
    setAccountNumber('919845011223');
    setIfscCode('HDFC0001234');
    setHolderName('Sunil Express Rider');
    setBankName('HDFC Bank');
    setAddModalOpen(true);
  };

  const handleCreatePayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !recipientId) return;

    requestPayout({
      recipientType,
      recipientId,
      amount: Number(amount),
      bankOrUpiDetails: payoutMethod === 'upi' ? upiId : `${bankName} A/C ${accountNumber}`,
      payoutMethod,
      upiId: payoutMethod === 'upi' ? upiId : undefined,
      bankDetails:
        payoutMethod === 'bank_transfer'
          ? {
              accountNumber,
              ifscCode,
              holderName,
              bankName,
            }
          : undefined,
    });

    onLogAudit('CREATE', 'Payouts', `PAY-${Date.now().toString().slice(-4)}`, `Initiated payout request for ₹${amount} to recipient ${recipientId}`);
    setAddModalOpen(false);
  };

  const handleSettleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleModal.payout) return;

    const ref = settleModal.referenceId.trim() || `UTR-MART-${Date.now().toString().slice(-6)}`;
    settlePayout(settleModal.payout.id, ref);
    onLogAudit('PAYOUT_SETTLE', 'Payouts', settleModal.payout.id, `Settled payout of ₹${settleModal.payout.amount} (Ref: ${ref})`);
    setSettleModal({ isOpen: false, payout: null, referenceId: '' });
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModal.payout) return;

    const reason = rejectModal.reason.trim() || 'Unverified bank/UPI details';
    rejectPayout(rejectModal.payout.id, reason);
    onLogAudit('UPDATE', 'Payouts', rejectModal.payout.id, `Rejected payout request of ₹${rejectModal.payout.amount}: ${reason}`);
    setRejectModal({ isOpen: false, payout: null, reason: '' });
  };

  const handleDelete = (id: string) => {
    deletePayout(id);
    onLogAudit('DELETE', 'Payouts', id, `Deleted payout record #${id}`);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Payout Volume</span>
          <p className="text-2xl font-black font-heading text-slate-900">
            ₹{payoutRequests.reduce((acc, p) => acc + p.amount, 0).toLocaleString()}
          </p>
          <span className="text-xs text-emerald-600 font-bold block">Rider &amp; Dark Store disbursals</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pending Approvals</span>
          <p className="text-2xl font-black font-heading text-amber-500">
            {payoutRequests.filter((p) => p.status === 'pending').length} Requests
          </p>
          <span className="text-xs text-slate-500 font-medium block">Awaiting UTR reference</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Successfully Settled</span>
          <p className="text-2xl font-black font-heading text-emerald-600">
            ₹{payoutRequests.filter((p) => p.status === 'settled').reduce((acc, p) => acc + p.amount, 0).toLocaleString()}
          </p>
          <span className="text-xs text-emerald-600 font-bold block">100% On-time bank transfers</span>
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
              placeholder="Search beneficiary or account..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {(['all', 'pending', 'settled', 'rejected'] as const).map((s) => (
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
          onClick={openAddPayout}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-xs transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Initiate Payout Request</span>
        </button>
      </div>

      {/* Payouts Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Payout ID & Date</th>
                <th className="py-3 px-4">Beneficiary</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Disbursal Channel</th>
                <th className="py-3 px-4">Status & Reference</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayouts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-bold text-sm">No payout requests found</p>
                    <p className="text-xs">Pending rider withdrawal claims appear here</p>
                  </td>
                </tr>
              ) : (
                filteredPayouts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900 block">{p.id}</span>
                      <span className="text-[10px] text-slate-400 block">
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Recent'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{p.recipientName}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">
                        {p.recipientType?.toUpperCase() || 'RIDER'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono font-black text-emerald-600 text-sm">
                        ₹{p.amount.toLocaleString()}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-600">
                      {p.bankOrUpiDetails || p.upiId || 'Bank Transfer'}
                    </td>

                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            p.status === 'settled'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {p.status}
                        </span>
                        {p.referenceId && (
                          <span className="text-[9px] text-slate-400 font-mono block">
                            UTR: {p.referenceId}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {p.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setSettleModal({
                                  isOpen: true,
                                  payout: p,
                                  referenceId: `UTR-${Date.now().toString().slice(-6)}`,
                                })
                              }
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg shadow-xs"
                            >
                              Settle
                            </button>

                            <button
                              type="button"
                              onClick={() => setRejectModal({ isOpen: true, payout: p, reason: '' })}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] rounded-lg"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {deleteConfirmId === p.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleDelete(p.id)}
                              className="px-2 py-1 bg-rose-600 text-white font-bold text-[10px] rounded"
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
                            onClick={() => setDeleteConfirmId(p.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INITIATE PAYOUT MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in scale-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-emerald-100 text-emerald-700">
                  <DollarSign className="w-4 h-4" />
                </span>
                <h3 className="font-heading font-black text-base text-slate-900">
                  Initiate Partner Payout
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

            <form onSubmit={handleCreatePayoutSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Beneficiary Type</label>
                <select
                  value={recipientType}
                  onChange={(e) => setRecipientType(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="delivery">Express Delivery Partner (Rider)</option>
                  <option value="restaurant">Dark Store Pod Operator</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Beneficiary</label>
                <select
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  {recipientType === 'delivery'
                    ? deliveryPartners.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.phone})
                        </option>
                      ))
                    : darkStores.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.code})
                        </option>
                      ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Payout Amount (₹) *</label>
                <input
                  type="number"
                  min="100"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-base font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Disbursal Method</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPayoutMethod('upi')}
                    className={`flex-1 py-2 font-bold rounded-xl border ${
                      payoutMethod === 'upi'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-black'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    UPI ID
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayoutMethod('bank_transfer')}
                    className={`flex-1 py-2 font-bold rounded-xl border ${
                      payoutMethod === 'bank_transfer'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-black'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Bank IMPS/NEFT
                  </button>
                </div>
              </div>

              {payoutMethod === 'upi' ? (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Beneficiary UPI VPA</label>
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="beneficiary@okaxis"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Account Number</label>
                      <input
                        type="text"
                        required
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">IFSC Code</label>
                      <input
                        type="text"
                        required
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      required
                      value={holderName}
                      onChange={(e) => setHolderName(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
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
                  Create Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SETTLE MODAL */}
      {settleModal.isOpen && settleModal.payout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in scale-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-black text-sm text-slate-900">
                Settle Payout ₹{settleModal.payout.amount}
              </h3>
              <button
                type="button"
                onClick={() => setSettleModal({ isOpen: false, payout: null, referenceId: '' })}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSettleSubmit} className="space-y-3.5 text-xs">
              <p className="text-slate-600">
                Settling payout for <span className="font-bold text-slate-900">{settleModal.payout.recipientName}</span>.
              </p>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Bank UTR / Transaction Reference ID</label>
                <input
                  type="text"
                  required
                  value={settleModal.referenceId}
                  onChange={(e) => setSettleModal((prev) => ({ ...prev, referenceId: e.target.value }))}
                  placeholder="UTR-2026-9908"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSettleModal({ isOpen: false, payout: null, referenceId: '' })}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs"
                >
                  Confirm Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectModal.isOpen && rejectModal.payout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in scale-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-black text-sm text-slate-900 text-rose-700">
                Reject Payout Request
              </h3>
              <button
                type="button"
                onClick={() => setRejectModal({ isOpen: false, payout: null, reason: '' })}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-3.5 text-xs">
              <p className="text-slate-600">
                Rejecting claim of <span className="font-bold text-slate-900">₹{rejectModal.payout.amount}</span>.
              </p>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Rejection Reason</label>
                <textarea
                  rows={2}
                  required
                  value={rejectModal.reason}
                  onChange={(e) => setRejectModal((prev) => ({ ...prev, reason: e.target.value }))}
                  placeholder="e.g. Bank IFSC mismatch or suspicious claims..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectModal({ isOpen: false, payout: null, reason: '' })}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-xs"
                >
                  Reject Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
