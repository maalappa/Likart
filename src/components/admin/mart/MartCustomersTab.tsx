import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Wallet,
  Award,
  CheckCircle2,
  AlertTriangle,
  X,
  CreditCard,
  ShoppingBag,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { CustomerUser } from '../../../types';

interface MartCustomersTabProps {
  onLogAudit: (action: 'CREATE' | 'UPDATE' | 'DELETE', module: any, targetId: string, details: string) => void;
}

export const MartCustomersTab: React.FC<MartCustomersTabProps> = ({ onLogAudit }) => {
  const { allCustomers, addCustomer, updateCustomer, deleteCustomer, addNotification, orders } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');

  // Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    customer?: CustomerUser | null;
  }>({ isOpen: false, mode: 'add' });

  // Wallet adjustment modal
  const [walletModal, setWalletModal] = useState<{
    isOpen: boolean;
    customer?: CustomerUser | null;
    amount: number;
    action: 'add' | 'deduct';
  }>({ isOpen: false, amount: 100, action: 'add' });

  // Delete confirm
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [loyaltyPoints, setLoyaltyPoints] = useState(50);
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('Bengaluru');

  const filteredCustomers = useMemo(() => {
    return allCustomers.filter((c) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q);
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && (c as any).status !== 'blocked') ||
        (statusFilter === 'blocked' && (c as any).status === 'blocked');
      return matchSearch && matchStatus;
    });
  }, [allCustomers, search, statusFilter]);

  const openAddModal = () => {
    setName('');
    setEmail('');
    setPhone('+91 ');
    setWalletBalance(100);
    setLoyaltyPoints(50);
    setAddressLine('');
    setCity('Bengaluru');
    setModalState({ isOpen: true, mode: 'add', customer: null });
  };

  const openEditModal = (c: CustomerUser) => {
    setName(c.name);
    setEmail(c.email);
    setPhone(c.phone);
    setWalletBalance(c.walletBalance || 0);
    setLoyaltyPoints(c.loyaltyPoints || 0);
    setAddressLine(c.addresses?.[0]?.addressLine || '');
    setCity(c.addresses?.[0]?.city || 'Bengaluru');
    setModalState({ isOpen: true, mode: 'edit', customer: c });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    if (modalState.mode === 'add') {
      const newId = `cust-${Date.now().toString().slice(-5)}`;
      addCustomer({
        id: newId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        walletBalance: Number(walletBalance),
        loyaltyPoints: Number(loyaltyPoints),
        addresses: addressLine.trim()
          ? [
              {
                id: `addr-${Date.now()}`,
                type: 'Home',
                title: 'Home',
                flat: addressLine.trim(),
                area: city.trim(),
                city: city.trim(),
                coordinates: { lat: 12.9716, lng: 77.5946 },
                isDefault: true,
                addressLine: addressLine.trim(),
                label: 'Home',
              },
            ]
          : [],
      });
      onLogAudit('CREATE', 'Customers', newId, `Registered new Likart Mart customer: ${name.trim()} (${phone.trim()})`);
    } else if (modalState.customer) {
      updateCustomer(modalState.customer.id, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        walletBalance: Number(walletBalance),
        loyaltyPoints: Number(loyaltyPoints),
      });
      onLogAudit('UPDATE', 'Customers', modalState.customer.id, `Updated details for customer ${name.trim()}`);
    }

    setModalState({ isOpen: false, mode: 'add', customer: null });
  };

  const handleDelete = (id: string, customerName: string) => {
    deleteCustomer(id);
    onLogAudit('DELETE', 'Customers', id, `Deleted customer account: ${customerName}`);
    setDeleteConfirmId(null);
  };

  const handleAdjustWallet = () => {
    if (!walletModal.customer) return;
    const current = walletModal.customer.walletBalance || 0;
    const diff = walletModal.action === 'add' ? walletModal.amount : -walletModal.amount;
    const updated = Math.max(0, current + diff);
    updateCustomer(walletModal.customer.id, { walletBalance: updated });
    addNotification(
      'Wallet Updated',
      `₹${walletModal.amount} ${walletModal.action === 'add' ? 'credited to' : 'deducted from'} ${walletModal.customer.name}'s wallet.`,
      'system'
    );
    onLogAudit(
      'UPDATE',
      'Customers',
      walletModal.customer.id,
      `Wallet balance adjusted by ${diff >= 0 ? '+' : ''}${diff}. New balance: ₹${updated}`
    );
    setWalletModal({ isOpen: false, customer: null, amount: 100, action: 'add' });
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Mart Customers</span>
          <p className="text-2xl font-black font-heading text-slate-900">{allCustomers.length}</p>
          <span className="text-xs text-emerald-600 font-bold block">Verified accounts</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Wallet Balances</span>
          <p className="text-2xl font-black font-heading text-emerald-600">
            ₹{allCustomers.reduce((acc, c) => acc + (c.walletBalance || 0), 0).toLocaleString()}
          </p>
          <span className="text-xs text-slate-500 font-medium block">Pre-loaded customer cash</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Loyalty Points Issued</span>
          <p className="text-2xl font-black font-heading text-purple-600">
            {allCustomers.reduce((acc, c) => acc + (c.loyaltyPoints || 0), 0).toLocaleString()} pts
          </p>
          <span className="text-xs text-slate-500 font-medium block">Redeemable on 10m orders</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Orders Placed</span>
          <p className="text-2xl font-black font-heading text-blue-600">{orders.length}</p>
          <span className="text-xs text-emerald-600 font-bold block">Across all pods</span>
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
              placeholder="Search customer name, email, phone..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {(['all', 'active', 'blocked'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg capitalize transition ${
                  statusFilter === status ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-xs transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Customers List Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Customer Info</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Primary Address</th>
                <th className="py-3 px-4">Wallet Balance</th>
                <th className="py-3 px-4">Loyalty Points</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-bold text-sm">No customers found</p>
                    <p className="text-xs">Try adjusting search or add a new customer</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => {
                  const customerOrdersCount = orders.filter(
                    (o) => o.customerId === customer.id || o.customerPhone === customer.phone
                  ).length;
                  const isBlocked = (customer as any).status === 'blocked';

                  return (
                    <tr key={customer.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-xs border border-emerald-200 uppercase">
                            {customer.name.slice(0, 2)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{customer.name}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">ID: {customer.id}</span>
                            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                              <ShoppingBag className="w-3 h-3" />
                              {customerOrdersCount} mart orders
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{customer.phone}</span>
                        </div>
                        {customer.email && (
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{customer.email}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-600 max-w-[200px]">
                        {customer.addresses?.[0] ? (
                          <div className="flex items-start gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span className="truncate block" title={customer.addresses[0].addressLine}>
                              {customer.addresses[0].addressLine}, {customer.addresses[0].city}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No saved address</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-emerald-600 font-mono text-sm">
                            ₹{(customer.walletBalance || 0).toLocaleString()}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setWalletModal({
                                isOpen: true,
                                customer,
                                amount: 100,
                                action: 'add',
                              })
                            }
                            className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                            title="Adjust wallet balance"
                          >
                            <Wallet className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold text-[11px] border border-purple-200">
                          <Award className="w-3 h-3" />
                          {customer.loyaltyPoints || 0} pts
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            isBlocked
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(customer)}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                            title="Edit customer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {deleteConfirmId === customer.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleDelete(customer.id, customer.name)}
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
                              onClick={() => setDeleteConfirmId(customer.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Delete customer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
                <span className="p-1.5 rounded-xl bg-emerald-100 text-emerald-700">
                  <Users className="w-4 h-4" />
                </span>
                <h3 className="font-heading font-black text-base text-slate-900">
                  {modalState.mode === 'add' ? 'Add Likart Mart Customer' : 'Edit Customer Account'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalState({ isOpen: false, mode: 'add', customer: null })}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kulkarni"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98450..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@gmail.com"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Wallet Balance (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={walletBalance}
                    onChange={(e) => setWalletBalance(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Loyalty Points</label>
                  <input
                    type="number"
                    min="0"
                    value={loyaltyPoints}
                    onChange={(e) => setLoyaltyPoints(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              {modalState.mode === 'add' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Delivery Address</label>
                  <input
                    type="text"
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    placeholder="e.g. 104, Sunrise Enclave, Indiranagar"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalState({ isOpen: false, mode: 'add', customer: null })}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs"
                >
                  {modalState.mode === 'add' ? 'Create Customer' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WALLET ADJUSTMENT MODAL */}
      {walletModal.isOpen && walletModal.customer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in scale-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-emerald-100 text-emerald-700">
                  <Wallet className="w-4 h-4" />
                </span>
                <h3 className="font-heading font-black text-sm text-slate-900">
                  Adjust Customer Wallet
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setWalletModal({ isOpen: false, customer: null, amount: 100, action: 'add' })}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Adjusting balance for <span className="font-bold text-slate-900">{walletModal.customer.name}</span>.
                Current balance: <span className="font-mono font-bold text-emerald-600">₹{walletModal.customer.walletBalance || 0}</span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setWalletModal((prev) => ({ ...prev, action: 'add' }))}
                  className={`flex-1 py-2 font-bold rounded-xl border ${
                    walletModal.action === 'add'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-black'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  + Credit Cash
                </button>
                <button
                  type="button"
                  onClick={() => setWalletModal((prev) => ({ ...prev, action: 'deduct' }))}
                  className={`flex-1 py-2 font-bold rounded-xl border ${
                    walletModal.action === 'deduct'
                      ? 'bg-rose-50 border-rose-500 text-rose-700 font-black'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  - Deduct Cash
                </button>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  value={walletModal.amount}
                  onChange={(e) => setWalletModal((prev) => ({ ...prev, amount: Number(e.target.value) }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWalletModal({ isOpen: false, customer: null, amount: 100, action: 'add' })}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAdjustWallet}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs"
                >
                  Update Balance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
