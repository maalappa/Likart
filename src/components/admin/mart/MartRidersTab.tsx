import React, { useState, useMemo } from 'react';
import {
  Bike,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Store,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  DollarSign,
  Power,
  Navigation,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { DeliveryPartner } from '../../../types';

interface MartRidersTabProps {
  onLogAudit: (action: 'CREATE' | 'UPDATE' | 'DELETE', module: any, targetId: string, details: string) => void;
}

export const MartRidersTab: React.FC<MartRidersTabProps> = ({ onLogAudit }) => {
  const {
    deliveryPartners,
    addDeliveryPartner,
    updateDeliveryPartner,
    deleteDeliveryPartner,
    toggleRiderOnline,
    darkStores,
    addNotification,
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'suspended'>('all');

  // Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    rider?: DeliveryPartner | null;
  }>({ isOpen: false, mode: 'add' });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [vehicleType, setVehicleType] = useState<'bike' | 'scooter' | 'ev' | 'bicycle'>('ev');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [assignedStoreId, setAssignedStoreId] = useState('');
  const [status, setStatus] = useState<DeliveryPartner['status']>('approved');
  const [isOnline, setIsOnline] = useState(true);

  const filteredRiders = useMemo(() => {
    return deliveryPartners.filter((r) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        (r.vehicleNumber && r.vehicleNumber.toLowerCase().includes(q));
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [deliveryPartners, search, statusFilter]);

  const openAddModal = () => {
    setName('');
    setPhone('+91 ');
    setEmail('');
    setVehicleType('ev');
    setVehicleNumber(`KA-01-EV-${Math.floor(1000 + Math.random() * 9000)}`);
    setAssignedStoreId(darkStores[0]?.id || '');
    setStatus('approved');
    setIsOnline(true);
    setModalState({ isOpen: true, mode: 'add', rider: null });
  };

  const openEditModal = (r: DeliveryPartner) => {
    setName(r.name);
    setPhone(r.phone);
    setEmail(r.email || '');
    setVehicleType((r.vehicleType as any) || 'bike');
    setVehicleNumber(r.vehicleNumber || '');
    setAssignedStoreId((r as any).assignedDarkStoreId || darkStores[0]?.id || '');
    setStatus(r.status);
    setIsOnline(r.isOnline);
    setModalState({ isOpen: true, mode: 'edit', rider: r });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const assignedStore = darkStores.find((s) => s.id === assignedStoreId);

    if (modalState.mode === 'add') {
      const newId = `rider-${Date.now().toString().slice(-4)}`;
      addDeliveryPartner({
        id: newId,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        vehicleType,
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        status,
        isOnline,
        rating: 4.9,
        totalTrips: 0,
        walletBalance: 0,
        currentLocation: assignedStore
          ? { lat: assignedStore.lat, lng: assignedStore.lng, address: assignedStore.name }
          : { lat: 12.9716, lng: 77.5946, address: 'Central Pod Bay' },
        createdAt: new Date().toISOString(),
      } as any);

      onLogAudit('CREATE', 'Delivery Partners', newId, `Added express rider ${name.trim()} (${phone.trim()}) to ${assignedStore?.name || 'Central Pod'}`);
    } else if (modalState.rider) {
      updateDeliveryPartner(modalState.rider.id, {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        vehicleType,
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        status,
        isOnline,
      });

      onLogAudit('UPDATE', 'Delivery Partners', modalState.rider.id, `Updated rider details for ${name.trim()}`);
    }

    setModalState({ isOpen: false, mode: 'add', rider: null });
  };

  const handleDelete = (id: string, riderName: string) => {
    deleteDeliveryPartner(id);
    onLogAudit('DELETE', 'Delivery Partners', id, `Removed rider ${riderName} from 10m express fleet`);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Fleet Riders</span>
          <p className="text-2xl font-black font-heading text-slate-900">{deliveryPartners.length}</p>
          <span className="text-xs text-emerald-600 font-bold block">10-minute SLA qualified</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Online at Pod Bays</span>
          <p className="text-2xl font-black font-heading text-emerald-600">
            {deliveryPartners.filter((r) => r.isOnline).length} Active
          </p>
          <span className="text-xs text-slate-500 font-medium block">Ready for instant dispatch</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Cash in Hand Collected</span>
          <p className="text-2xl font-black font-heading text-amber-600">
            ₹{deliveryPartners.reduce((acc, r) => acc + (r.totalCashCollected || 0), 0).toLocaleString()}
          </p>
          <span className="text-xs text-slate-500 font-medium block">COD floating cash</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Average Rider Rating</span>
          <p className="text-2xl font-black font-heading text-purple-600">
            {(
              deliveryPartners.reduce((acc, r) => acc + (r.rating || 5), 0) /
              Math.max(1, deliveryPartners.length)
            ).toFixed(1)}{' '}
            ★
          </p>
          <span className="text-xs text-emerald-600 font-bold block">High customer satisfaction</span>
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
              placeholder="Search rider name, phone, vehicle..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {(['all', 'approved', 'pending', 'suspended'] as const).map((statusVal) => (
              <button
                key={statusVal}
                type="button"
                onClick={() => setStatusFilter(statusVal)}
                className={`px-3 py-1.5 rounded-lg capitalize transition ${
                  statusFilter === statusVal
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {statusVal}
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
          <span>Add Express Delivery Partner</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Delivery Partner</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Vehicle Details</th>
                <th className="py-3 px-4">Assigned Dark Store Hub</th>
                <th className="py-3 px-4">COD Cash in Hand</th>
                <th className="py-3 px-4">Online / Duty</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRiders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Bike className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-bold text-sm">No delivery partners found</p>
                    <p className="text-xs">Add new riders or adjust filters</p>
                  </td>
                </tr>
              ) : (
                filteredRiders.map((rider) => {
                  return (
                    <tr key={rider.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 font-black flex items-center justify-center text-xs border border-blue-200 uppercase">
                            {rider.name.slice(0, 2)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{rider.name}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">ID: {rider.id}</span>
                            <span className="text-[10px] text-amber-600 font-semibold">
                              ★ {rider.rating || 5.0} ({rider.totalTrips || 0} deliveries)
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{rider.phone}</span>
                        </div>
                        {rider.email && (
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{rider.email}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-800 block">
                          {rider.vehicleNumber || 'KA-01-EX-1010'}
                        </span>
                        <span className="text-[10px] text-slate-400 capitalize block">
                          {rider.vehicleType || 'Electric Scooter'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                          <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{darkStores[0]?.name || 'Central Pod Hub #01'}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono font-black text-amber-600 text-sm">
                          ₹{(rider.totalCashCollected || 0).toLocaleString()}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => toggleRiderOnline(rider.id)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black transition ${
                            rider.isOnline
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <Power className="w-3 h-3" />
                          <span>{rider.isOnline ? 'Online / Bay' : 'Offline'}</span>
                        </button>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            rider.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rider.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {rider.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(rider)}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                            title="Edit partner"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {deleteConfirmId === rider.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleDelete(rider.id, rider.name)}
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
                              onClick={() => setDeleteConfirmId(rider.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Delete partner"
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
                <span className="p-1.5 rounded-xl bg-blue-100 text-blue-700">
                  <Bike className="w-4 h-4" />
                </span>
                <h3 className="font-heading font-black text-base text-slate-900">
                  {modalState.mode === 'add' ? 'Add Express Delivery Partner' : 'Edit Delivery Partner'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalState({ isOpen: false, mode: 'add', rider: null })}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Rider Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sunil Gowda"
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
                  <label className="font-bold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rider@likart.com"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vehicle Type</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold capitalize"
                  >
                    <option value="ev">Electric Scooter (EV)</option>
                    <option value="bike">Motorcycle (Bike)</option>
                    <option value="scooter">Scooter</option>
                    <option value="bicycle">Bicycle</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vehicle Plate Number</label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="KA-01-EV-2020"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Assigned Dark Store Pod Bay</label>
                <select
                  value={assignedStoreId}
                  onChange={(e) => setAssignedStoreId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  {darkStores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code}) - {s.city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">KYC Approval Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold capitalize"
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending Verification</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Duty Status</label>
                  <select
                    value={isOnline ? 'online' : 'offline'}
                    onChange={(e) => setIsOnline(e.target.value === 'online')}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="online">Online / Ready</option>
                    <option value="offline">Offline / Off Duty</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalState({ isOpen: false, mode: 'add', rider: null })}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs"
                >
                  {modalState.mode === 'add' ? 'Register Partner' : 'Save Partner Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
