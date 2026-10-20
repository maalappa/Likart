import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Edit2,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  X,
  DollarSign,
  ShieldCheck,
  Power,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { PaymentGatewayItem, PaymentTransaction } from '../../../types';

interface MartPaymentsTabProps {
  onLogAudit: (action: 'CREATE' | 'UPDATE' | 'DELETE', module: any, targetId: string, details: string) => void;
}

export const MartPaymentsTab: React.FC<MartPaymentsTabProps> = ({ onLogAudit }) => {
  const {
    paymentGateways,
    addPaymentGateway,
    updatePaymentGateway,
    deletePaymentGateway,
    paymentTransactions,
    addPaymentTransaction,
    deletePaymentTransaction,
    addNotification,
  } = useApp();

  const [activeSubView, setActiveSubView] = useState<'gateways' | 'transactions'>('gateways');
  const [search, setSearch] = useState('');

  // Gateway Modal
  const [gwModal, setGwModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    gw?: PaymentGatewayItem | null;
  }>({ isOpen: false, mode: 'add' });

  // Add Manual Transaction Modal
  const [txnModalOpen, setTxnModalOpen] = useState(false);
  const [txnOrderId, setTxnOrderId] = useState(`ORD-MART-${Math.floor(1000 + Math.random() * 9000)}`);
  const [txnCustomerName, setTxnCustomerName] = useState('Rahul Sharma');
  const [txnAmount, setTxnAmount] = useState(250);
  const [txnProvider, setTxnProvider] = useState<PaymentTransaction['gatewayProvider']>('razorpay');
  const [txnStatus, setTxnStatus] = useState<PaymentTransaction['status']>('success');

  // Form State for Gateway
  const [gwName, setGwName] = useState('');
  const [gwProvider, setGwProvider] = useState('razorpay');
  const [gwMerchantId, setGwMerchantId] = useState('');
  const [gwApiKey, setGwApiKey] = useState('');
  const [gwTestMode, setGwTestMode] = useState(true);
  const [gwEnabled, setGwEnabled] = useState(true);
  const [gwMethods, setGwMethods] = useState('UPI QR, Debit Card, Credit Card, NetBanking');

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const openAddGw = () => {
    setGwName('');
    setGwProvider('razorpay');
    setGwMerchantId(`rzp_live_${Date.now().toString().slice(-6)}`);
    setGwApiKey('••••••••••••••••');
    setGwTestMode(false);
    setGwEnabled(true);
    setGwMethods('UPI Instant, PhonePe, Google Pay, Credit/Debit Cards');
    setGwModal({ isOpen: true, mode: 'add', gw: null });
  };

  const openEditGw = (gw: PaymentGatewayItem) => {
    setGwName(gw.name);
    setGwProvider(gw.provider);
    setGwMerchantId(gw.appOrMerchantId || '');
    setGwApiKey(gw.apiKeyOrSecretMasked || '••••••••');
    setGwTestMode(gw.testMode);
    setGwEnabled(gw.enabled);
    setGwMethods(gw.supportedMethods?.join(', ') || '');
    setGwModal({ isOpen: true, mode: 'edit', gw });
  };

  const handleGwSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gwName.trim()) return;

    if (gwModal.mode === 'add') {
      const newId = `gw-${Date.now().toString().slice(-4)}`;
      addPaymentGateway({
        name: gwName.trim(),
        provider: gwProvider.trim(),
        appOrMerchantId: gwMerchantId.trim(),
        apiKeyOrSecretMasked: gwApiKey.trim(),
        testMode: gwTestMode,
        enabled: gwEnabled,
        supportedMethods: gwMethods.split(',').map((m) => m.trim()).filter(Boolean),
      });

      addNotification('Gateway Added', `Payment provider ${gwName} configured.`, 'system');
      onLogAudit('CREATE', 'Payments', newId, `Added payment gateway ${gwName} (${gwProvider})`);
    } else if (gwModal.gw) {
      updatePaymentGateway(gwModal.gw.id, {
        name: gwName.trim(),
        provider: gwProvider.trim(),
        appOrMerchantId: gwMerchantId.trim(),
        apiKeyOrSecretMasked: gwApiKey.trim(),
        testMode: gwTestMode,
        enabled: gwEnabled,
        supportedMethods: gwMethods.split(',').map((m) => m.trim()).filter(Boolean),
      });

      addNotification('Gateway Updated', `Configuration updated for ${gwName}.`, 'system');
      onLogAudit('UPDATE', 'Payments', gwModal.gw.id, `Modified gateway settings for ${gwName}`);
    }

    setGwModal({ isOpen: false, mode: 'add', gw: null });
  };

  const handleDeleteGw = (id: string, name: string) => {
    deletePaymentGateway(id);
    addNotification('Gateway Deleted', `Payment gateway ${name} removed.`, 'warning');
    onLogAudit('DELETE', 'Payments', id, `Deleted payment gateway ${name}`);
    setDeleteConfirmId(null);
  };

  const handleCreateTxnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTx: PaymentTransaction = {
      id: `tx-mart-${Date.now().toString().slice(-5)}`,
      orderId: txnOrderId.trim(),
      customerName: txnCustomerName.trim(),
      gatewayProvider: txnProvider,
      gatewayTransactionId: `pay_${Date.now()}`,
      amount: Number(txnAmount),
      currency: 'INR',
      status: txnStatus,
      paymentMethodDetails: `${txnProvider.toUpperCase()} Express Settlement`,
      createdAt: new Date().toISOString(),
    };

    addPaymentTransaction(newTx);
    addNotification('Transaction Recorded', `₹${txnAmount} payment logged for ${txnOrderId}.`, 'system');
    onLogAudit('CREATE', 'Payments', newTx.id, `Manual payment record: ₹${txnAmount} for order ${txnOrderId}`);
    setTxnModalOpen(false);
  };

  const handleDeleteTxn = (id: string) => {
    deletePaymentTransaction(id);
    addNotification('Transaction Deleted', `Payment transaction record #${id} removed.`, 'warning');
    onLogAudit('DELETE', 'Payments', id, `Deleted payment transaction #${id}`);
    setDeleteConfirmId(null);
  };

  const handleRefundTxn = (t: PaymentTransaction) => {
    addNotification(
      'Refund Initiated',
      `Full refund of ₹${t.amount} initiated to ${t.customerName} via ${t.gatewayProvider.toUpperCase()}.`,
      'system'
    );
    onLogAudit('UPDATE', 'Payments', t.id, `Refund processed for ₹${t.amount} (Order: ${t.orderId})`);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Configured Gateways</span>
          <p className="text-2xl font-black font-heading text-slate-900">{paymentGateways.length} Providers</p>
          <span className="text-xs text-emerald-600 font-bold block">
            {paymentGateways.filter((g) => g.enabled).length} Enabled live
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Transaction Ledger</span>
          <p className="text-2xl font-black font-heading text-emerald-600">
            ₹{paymentTransactions.reduce((acc, t) => acc + (t.status === 'success' ? t.amount : 0), 0).toLocaleString()}
          </p>
          <span className="text-xs text-slate-500 font-medium block">Verified processed volume</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Doorstep COD &amp; UPI QR</span>
          <p className="text-2xl font-black font-heading text-blue-600">Active 24x7</p>
          <span className="text-xs text-emerald-600 font-bold block">Zero advance friction</span>
        </div>
      </div>

      {/* View Switcher Strip */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubView('gateways')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition ${
              activeSubView === 'gateways'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Payment Gateways ({paymentGateways.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubView('transactions')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition ${
              activeSubView === 'transactions'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Payment Transactions ({paymentTransactions.length})
          </button>
        </div>

        {activeSubView === 'gateways' ? (
          <button
            type="button"
            onClick={openAddGw}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-xs transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Payment Gateway</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setTxnModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-xs transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment Receipt</span>
          </button>
        )}
      </div>

      {/* VIEW 1: GATEWAYS LIST */}
      {activeSubView === 'gateways' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentGateways.map((gw) => (
            <div
              key={gw.id}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4 hover:border-emerald-300 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-heading font-black text-sm text-slate-900">{gw.name}</h4>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">{gw.provider}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => updatePaymentGateway(gw.id, { enabled: !gw.enabled })}
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition border ${
                    gw.enabled
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                >
                  {gw.enabled ? '● Enabled' : '○ Disabled'}
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5 text-slate-600">
                <p>
                  <strong className="text-slate-800">Supported Rails:</strong>{' '}
                  {gw.supportedMethods?.join(', ') || 'All online payment methods'}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Merchant ID: {gw.appOrMerchantId || 'Default'}</span>
                  <span>{gw.testMode ? 'Sandbox Mode' : 'Live Mode'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => openEditGw(gw)}
                  className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                  title="Configure Gateway"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                {deleteConfirmId === gw.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDeleteGw(gw.id, gw.name)}
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
                    onClick={() => setDeleteConfirmId(gw.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete Gateway"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 2: TRANSACTIONS LIST */}
      {activeSubView === 'transactions' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Txn ID & Date</th>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Gateway Provider</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paymentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="font-bold text-sm">No transactions logged</p>
                      <p className="text-xs">Incoming customer payments appear here</p>
                    </td>
                  </tr>
                ) : (
                  paymentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-900 block">{tx.id}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'Today'}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-700">{tx.orderId}</td>

                      <td className="py-3 px-4 font-bold text-slate-900">{tx.customerName}</td>

                      <td className="py-3 px-4 font-mono font-black text-emerald-600 text-sm">
                        ₹{tx.amount}
                      </td>

                      <td className="py-3 px-4 uppercase font-bold text-slate-700">{tx.gatewayProvider}</td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            tx.status === 'success'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tx.status === 'refunded'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {tx.status === 'success' && (
                            <button
                              type="button"
                              onClick={() => handleRefundTxn(tx)}
                              className="px-2 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 text-[10px] font-bold rounded flex items-center gap-1"
                              title="Issue refund"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Refund</span>
                            </button>
                          )}

                          {deleteConfirmId === tx.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleDeleteTxn(tx.id)}
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
                              onClick={() => setDeleteConfirmId(tx.id)}
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
      )}

      {/* ADD / EDIT GATEWAY MODAL */}
      {gwModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in scale-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-emerald-100 text-emerald-700">
                  <CreditCard className="w-4 h-4" />
                </span>
                <h3 className="font-heading font-black text-base text-slate-900">
                  {gwModal.mode === 'add' ? 'Configure Payment Gateway' : 'Edit Gateway Settings'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setGwModal({ isOpen: false, mode: 'add', gw: null })}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGwSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Gateway Name *</label>
                  <input
                    type="text"
                    required
                    value={gwName}
                    onChange={(e) => setGwName(e.target.value)}
                    placeholder="e.g. Razorpay Express UPI"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Provider Type</label>
                  <select
                    value={gwProvider}
                    onChange={(e) => setGwProvider(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="razorpay">Razorpay</option>
                    <option value="cashfree">Cashfree</option>
                    <option value="phonepe">PhonePe</option>
                    <option value="paytm">PayTM</option>
                    <option value="stripe">Stripe</option>
                    <option value="cod">Cash on Delivery (Pod Safe)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Merchant / App ID</label>
                <input
                  type="text"
                  value={gwMerchantId}
                  onChange={(e) => setGwMerchantId(e.target.value)}
                  placeholder="rzp_live_..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Secret Key / Salt (Masked)</label>
                <input
                  type="password"
                  value={gwApiKey}
                  onChange={(e) => setGwApiKey(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Supported Payment Methods (comma separated)</label>
                <input
                  type="text"
                  value={gwMethods}
                  onChange={(e) => setGwMethods(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={gwEnabled}
                    onChange={(e) => setGwEnabled(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600 rounded"
                  />
                  <span>Active Gateway</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={gwTestMode}
                    onChange={(e) => setGwTestMode(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                  <span>Sandbox Testing Mode</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setGwModal({ isOpen: false, mode: 'add', gw: null })}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Gateway
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD MANUAL PAYMENT MODAL */}
      {txnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in scale-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-emerald-100 text-emerald-700">
                  <DollarSign className="w-4 h-4" />
                </span>
                <h3 className="font-heading font-black text-base text-slate-900">
                  Record Payment Receipt
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTxnModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTxnSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Related Order ID *</label>
                <input
                  type="text"
                  required
                  value={txnOrderId}
                  onChange={(e) => setTxnOrderId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={txnCustomerName}
                  onChange={(e) => setTxnCustomerName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={txnAmount}
                    onChange={(e) => setTxnAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Provider</label>
                  <select
                    value={txnProvider}
                    onChange={(e) => setTxnProvider(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold uppercase"
                  >
                    <option value="razorpay">Razorpay</option>
                    <option value="phonepe">PhonePe</option>
                    <option value="cashfree">Cashfree</option>
                    <option value="cod">COD</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTxnModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs"
                >
                  Log Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
