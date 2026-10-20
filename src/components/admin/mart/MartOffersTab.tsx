import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  Edit2,
  Trash2,
  Tag,
  Percent,
  Calendar,
  Clock,
  CheckCircle2,
  X,
  Power,
  Zap,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { MartOffer, QuickCommerceCategory } from '../../../types';
import { INITIAL_MART_OFFERS } from '../../../data/quickCommerceData';
import { safeStorage } from '../../../utils/storageUtils';

interface MartOffersTabProps {
  offers: MartOffer[];
  setOffers: React.Dispatch<React.SetStateAction<MartOffer[]>>;
  categories: QuickCommerceCategory[];
  onLogAudit: (action: 'CREATE' | 'UPDATE' | 'DELETE', module: any, targetId: string, details: string) => void;
}

export const MartOffersTab: React.FC<MartOffersTabProps> = ({
  offers,
  setOffers,
  categories,
  onLogAudit,
}) => {
  const { addNotification } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    offer?: MartOffer | null;
  }>({ isOpen: false, mode: 'add' });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [discountValue, setDiscountValue] = useState(25);
  const [minOrderValue, setMinOrderValue] = useState(149);
  const [badge, setBadge] = useState('FLASH SALE');
  const [category, setCategory] = useState('all');
  const [validTill, setValidTill] = useState('2026-05-30');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [description, setDescription] = useState('');

  const filteredOffers = useMemo(() => {
    return offers.filter((o) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        o.title.toLowerCase().includes(q) ||
        o.code.toLowerCase().includes(q) ||
        o.badge.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [offers, search, statusFilter]);

  const openAddModal = () => {
    setTitle('');
    setCode(`FLASH${Math.floor(10 + Math.random() * 90)}`);
    setDiscountType('percentage');
    setDiscountValue(20);
    setMinOrderValue(149);
    setBadge('FLASH DEAL');
    setCategory('all');
    setValidTill('2026-05-31');
    setStatus('active');
    setDescription('10-minute grocery express discount.');
    setModalState({ isOpen: true, mode: 'add', offer: null });
  };

  const openEditModal = (o: MartOffer) => {
    setTitle(o.title);
    setCode(o.code);
    setDiscountType(o.discountType);
    setDiscountValue(o.discountValue);
    setMinOrderValue(o.minOrderValue);
    setBadge(o.badge);
    setCategory(o.category);
    setValidTill(o.validTill);
    setStatus(o.status);
    setDescription(o.description || '');
    setModalState({ isOpen: true, mode: 'edit', offer: o });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !code.trim()) return;

    if (modalState.mode === 'add') {
      const newId = `off-${Date.now().toString().slice(-4)}`;
      const newOffer: MartOffer = {
        id: newId,
        title: title.trim(),
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minOrderValue: Number(minOrderValue),
        badge: badge.trim().toUpperCase(),
        category,
        validTill,
        status,
        usageCount: 0,
        description: description.trim(),
      };

      setOffers((prev) => {
        const updated = [newOffer, ...prev];
        safeStorage.setItem('likart_mart_offers', JSON.stringify(updated));
        return updated;
      });

      addNotification('Offer Published', `Flash offer "${newOffer.title}" is now active.`, 'system');
      onLogAudit('CREATE', 'Offers', newId, `Created flash deal ${newOffer.code}: ${newOffer.title}`);
    } else if (modalState.offer) {
      setOffers((prev) => {
        const updated = prev.map((o) =>
          o.id === modalState.offer!.id
            ? {
                ...o,
                title: title.trim(),
                code: code.trim().toUpperCase(),
                discountType,
                discountValue: Number(discountValue),
                minOrderValue: Number(minOrderValue),
                badge: badge.trim().toUpperCase(),
                category,
                validTill,
                status,
                description: description.trim(),
              }
            : o
        );
        safeStorage.setItem('likart_mart_offers', JSON.stringify(updated));
        return updated;
      });

      addNotification('Offer Updated', `Offer "${code.trim()}" rules updated.`, 'system');
      onLogAudit('UPDATE', 'Offers', modalState.offer.id, `Updated offer ${code.trim()}`);
    }

    setModalState({ isOpen: false, mode: 'add', offer: null });
  };

  const handleDelete = (id: string, offerCode: string) => {
    setOffers((prev) => {
      const updated = prev.filter((o) => o.id !== id);
      safeStorage.setItem('likart_mart_offers', JSON.stringify(updated));
      return updated;
    });

    addNotification('Offer Deleted', `Offer ${offerCode} removed.`, 'warning');
    onLogAudit('DELETE', 'Offers', id, `Deleted offer promo ${offerCode}`);
    setDeleteConfirmId(null);
  };

  const handleToggleStatus = (id: string, current: 'active' | 'inactive') => {
    const next: 'active' | 'inactive' = current === 'active' ? 'inactive' : 'active';
    setOffers((prev) => {
      const updated: MartOffer[] = prev.map((o) => (o.id === id ? { ...o, status: next } : o));
      safeStorage.setItem('likart_mart_offers', JSON.stringify(updated));
      return updated;
    });
    onLogAudit('UPDATE', 'Offers', id, `Toggled offer status to ${next}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Active Flash Deals</span>
          <p className="text-2xl font-black font-heading text-emerald-600">
            {offers.filter((o) => o.status === 'active').length} Live
          </p>
          <span className="text-xs text-slate-500 font-medium block">Promoted on customer app</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Customer Redemptions</span>
          <p className="text-2xl font-black font-heading text-purple-600">
            {offers.reduce((acc, o) => acc + (o.usageCount || 0), 0).toLocaleString()} Claims
          </p>
          <span className="text-xs text-emerald-600 font-bold block">10m grocery incentives</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Highest Discount Rate</span>
          <p className="text-2xl font-black font-heading text-amber-500">
            {Math.max(...offers.map((o) => (o.discountType === 'percentage' ? o.discountValue : 0)), 50)}% OFF
          </p>
          <span className="text-xs text-slate-500 font-medium block">BOGO & flash sales</span>
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
              placeholder="Search offer code or title..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {(['all', 'active', 'inactive'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg capitalize transition ${
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
          onClick={openAddModal}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-xs transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Flash Deal</span>
        </button>
      </div>

      {/* Grid of Offers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOffers.map((offer) => {
          return (
            <div
              key={offer.id}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-emerald-300 transition"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white font-black text-[10px] uppercase tracking-wider shadow-2xs">
                    {offer.badge}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(offer.id, offer.status)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase transition ${
                      offer.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {offer.status === 'active' ? '● Active' : '○ Paused'}
                  </button>
                </div>

                <div>
                  <h4 className="font-heading font-black text-sm text-slate-900 leading-snug">{offer.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{offer.description}</p>
                </div>

                <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Promo Code</span>
                    <span className="font-mono font-black text-emerald-800 text-sm">{offer.code}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>Discount</span>
                    <span className="font-bold text-emerald-700">
                      {offer.discountType === 'percentage'
                        ? `${offer.discountValue}% OFF`
                        : `Flat ₹${offer.discountValue} OFF`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Min Order Value</span>
                    <span>₹{offer.minOrderValue}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Valid: {offer.validTill}</span>
                  </span>
                  <span className="font-semibold text-emerald-700">{offer.usageCount || 0} claims</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => openEditModal(offer)}
                  className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                  title="Edit offer"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                {deleteConfirmId === offer.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDelete(offer.id, offer.code)}
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
                    onClick={() => setDeleteConfirmId(offer.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete offer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD / EDIT MODAL */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in scale-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-amber-100 text-amber-700">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h3 className="font-heading font-black text-base text-slate-900">
                  {modalState.mode === 'add' ? 'Create Flash Deal Offer' : 'Edit Flash Deal Offer'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalState({ isOpen: false, mode: 'add', offer: null })}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Deal Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Midnight 30% Off On Munchies"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Promo Code *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="MUNCH30"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="FLASH SALE"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Discount Value</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Applicable Aisle</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="all">All Aisles</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={validTill}
                    onChange={(e) => setValidTill(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details shown to customer during checkout..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalState({ isOpen: false, mode: 'add', offer: null })}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs"
                >
                  {modalState.mode === 'add' ? 'Publish Deal' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
