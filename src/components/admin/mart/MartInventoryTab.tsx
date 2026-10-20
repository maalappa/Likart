import React, { useState, useMemo } from 'react';
import {
  PackageCheck,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  X,
  Layers,
  ArrowUpRight,
  TrendingDown,
  Warehouse,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { QuickCommerceItem } from '../../../types';
import { safeStorage } from '../../../utils/storageUtils';

interface MartInventoryTabProps {
  products: QuickCommerceItem[];
  setProducts: React.Dispatch<React.SetStateAction<QuickCommerceItem[]>>;
  onLogAudit: (action: 'CREATE' | 'UPDATE' | 'DELETE', module: any, targetId: string, details: string) => void;
}

export const MartInventoryTab: React.FC<MartInventoryTabProps> = ({
  products,
  setProducts,
  onLogAudit,
}) => {
  const { addNotification, darkStores } = useApp();

  const [search, setSearch] = useState('');
  const [stockLevelFilter, setStockLevelFilter] = useState<'all' | 'critical' | 'low' | 'healthy'>('all');

  // Restock Modal
  const [restockModal, setRestockModal] = useState<{
    isOpen: boolean;
    product?: QuickCommerceItem | null;
    quantityToAdd: number;
    batchNumber: string;
    podHubId: string;
    notes: string;
  }>({
    isOpen: false,
    product: null,
    quantityToAdd: 50,
    batchNumber: `BATCH-${Date.now().toString().slice(-4)}`,
    podHubId: darkStores[0]?.id || '',
    notes: 'Regular replenishment batch received',
  });

  // Edit Threshold Modal
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    product?: QuickCommerceItem | null;
    currentStock: number;
    lowStockThreshold: number;
  }>({ isOpen: false, product: null, currentStock: 0, lowStockThreshold: 10 });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const inventoryList = useMemo(() => {
    return products.map((p) => {
      const stock = p.stockCount ?? 45;
      const isCritical = stock === 0;
      const isLow = stock > 0 && stock <= 15;
      const status: 'critical' | 'low' | 'healthy' = isCritical
        ? 'critical'
        : isLow
        ? 'low'
        : 'healthy';
      return {
        ...p,
        stock,
        status,
        shelfLocation: `Bay-${(p.category.charCodeAt(0) % 5) + 1}-Tier${(p.price % 3) + 1}`,
      };
    });
  }, [products]);

  const filteredInventory = useMemo(() => {
    return inventoryList.filter((item) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.brand?.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q);
      const matchStatus = stockLevelFilter === 'all' || item.status === stockLevelFilter;
      return matchSearch && matchStatus;
    });
  }, [inventoryList, search, stockLevelFilter]);

  const totalUnits = inventoryList.reduce((acc, i) => acc + i.stock, 0);
  const criticalCount = inventoryList.filter((i) => i.status === 'critical').length;
  const lowCount = inventoryList.filter((i) => i.status === 'low').length;
  const valuation = inventoryList.reduce((acc, i) => acc + i.stock * i.price, 0);

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockModal.product || restockModal.quantityToAdd <= 0) return;

    const prodId = restockModal.product.id;
    const addQty = Number(restockModal.quantityToAdd);

    setProducts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === prodId) {
          const newCount = (p.stockCount ?? 0) + addQty;
          return {
            ...p,
            stockCount: newCount,
            inStock: newCount > 0,
          };
        }
        return p;
      });
      safeStorage.setItem('likart_mart_products', JSON.stringify(updated));
      return updated;
    });

    addNotification(
      'Stock Replenished',
      `+${addQty} units added for ${restockModal.product.name} (Batch: ${restockModal.batchNumber}).`,
      'system'
    );

    onLogAudit(
      'UPDATE',
      'Inventory',
      prodId,
      `Replenished +${addQty} units for SKU ${restockModal.product.name}. Batch: ${restockModal.batchNumber}`
    );

    setRestockModal({
      isOpen: false,
      product: null,
      quantityToAdd: 50,
      batchNumber: '',
      podHubId: '',
      notes: '',
    });
  };

  const handleEditStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal.product) return;

    const prodId = editModal.product.id;
    const newStock = Math.max(0, Number(editModal.currentStock));

    setProducts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === prodId) {
          return {
            ...p,
            stockCount: newStock,
            inStock: newStock > 0,
          };
        }
        return p;
      });
      safeStorage.setItem('likart_mart_products', JSON.stringify(updated));
      return updated;
    });

    addNotification(
      'Stock Level Adjusted',
      `${editModal.product.name} stock level updated to ${newStock} units.`,
      'system'
    );

    onLogAudit(
      'UPDATE',
      'Inventory',
      prodId,
      `Manual stock count update for ${editModal.product.name}: ${newStock} units.`
    );

    setEditModal({ isOpen: false, product: null, currentStock: 0, lowStockThreshold: 10 });
  };

  const handleDeleteInventory = (id: string, prodName: string) => {
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, stockCount: 0, inStock: false } : p));
      safeStorage.setItem('likart_mart_products', JSON.stringify(updated));
      return updated;
    });

    addNotification('SKU Zeroed Out', `${prodName} stock level set to 0.`, 'warning');
    onLogAudit('DELETE', 'Inventory', id, `Zeroed out stock units for SKU ${prodName}`);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Stocked Units</span>
          <p className="text-2xl font-black font-heading text-slate-900">{totalUnits.toLocaleString()}</p>
          <span className="text-xs text-emerald-600 font-bold block">Across all aisles</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Inventory Valuation (MRP)</span>
          <p className="text-2xl font-black font-heading text-emerald-600">₹{valuation.toLocaleString()}</p>
          <span className="text-xs text-slate-500 font-medium block">Active warehouse value</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Low Stock Warning</span>
          <p className="text-2xl font-black font-heading text-amber-500">{lowCount} SKUs</p>
          <span className="text-xs text-amber-600 font-bold block">Below 15 units threshold</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Out of Stock (Zero)</span>
          <p className="text-2xl font-black font-heading text-rose-600">{criticalCount} SKUs</p>
          <span className="text-xs text-rose-500 font-bold block">Immediate replenishment needed</span>
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
              placeholder="Search inventory SKU or shelf bay..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {(['all', 'healthy', 'low', 'critical'] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setStockLevelFilter(level)}
                className={`px-3 py-1.5 rounded-lg capitalize transition ${
                  stockLevelFilter === level ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {level === 'critical' ? 'Out of Stock' : level === 'low' ? 'Low Stock' : level}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs font-bold text-slate-500">
          Showing {filteredInventory.length} of {inventoryList.length} SKUs
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">SKU / Item</th>
                <th className="py-3 px-4">Warehouse Shelf Bay</th>
                <th className="py-3 px-4">Available Stock</th>
                <th className="py-3 px-4">Unit Price</th>
                <th className="py-3 px-4">Total Value</th>
                <th className="py-3 px-4">Stock Health</th>
                <th className="py-3 px-4 text-right">Inventory Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <PackageCheck className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-bold text-sm">No inventory records matching</p>
                    <p className="text-xs">Adjust search query or stock status filter</p>
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{item.name}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {item.brand} • {item.unit}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono font-bold text-[11px]">
                        <Warehouse className="w-3 h-3 text-slate-400" />
                        {item.shelfLocation}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`font-black font-mono text-sm ${
                          item.status === 'critical'
                            ? 'text-rose-600'
                            : item.status === 'low'
                            ? 'text-amber-600'
                            : 'text-slate-900'
                        }`}
                      >
                        {item.stock} units
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-700">₹{item.price}</td>

                    <td className="py-3 px-4 font-mono font-black text-emerald-600">
                      ₹{(item.stock * item.price).toLocaleString()}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          item.status === 'critical'
                            ? 'bg-rose-100 text-rose-800'
                            : item.status === 'low'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.status === 'critical'
                          ? 'Out of Stock'
                          : item.status === 'low'
                          ? 'Low Stock Alert'
                          : 'Optimal Level'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setRestockModal({
                              isOpen: true,
                              product: item,
                              quantityToAdd: 50,
                              batchNumber: `BATCH-${Date.now().toString().slice(-4)}`,
                              podHubId: darkStores[0]?.id || '',
                              notes: 'Received fresh pod dispatch shipment',
                            })
                          }
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] rounded-xl flex items-center gap-1 transition"
                          title="Replenish stock"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Restock</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setEditModal({
                              isOpen: true,
                              product: item,
                              currentStock: item.stock,
                              lowStockThreshold: 10,
                            })
                          }
                          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition"
                          title="Edit stock count"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {deleteConfirmId === item.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleDeleteInventory(item.id, item.name)}
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
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Zero out stock"
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

      {/* RESTOCK MODAL */}
      {restockModal.isOpen && restockModal.product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in scale-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-emerald-100 text-emerald-700">
                  <Plus className="w-4 h-4" />
                </span>
                <h3 className="font-heading font-black text-base text-slate-900">
                  Replenish Stock Units
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRestockModal({ isOpen: false, product: null, quantityToAdd: 50, batchNumber: '', podHubId: '', notes: '' })}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                <img src={restockModal.product.image} alt={restockModal.product.name} className="w-10 h-10 rounded-xl object-cover" />
                <div>
                  <h4 className="font-bold text-slate-900">{restockModal.product.name}</h4>
                  <p className="text-[11px] text-slate-500">
                    Current stock: <span className="font-mono font-bold text-emerald-600">{restockModal.product.stockCount ?? 0}</span> units
                  </p>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Quantity to Replenish (+ Units) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={restockModal.quantityToAdd}
                  onChange={(e) => setRestockModal((prev) => ({ ...prev, quantityToAdd: Number(e.target.value) }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-base font-bold text-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Batch / Inward Lot</label>
                  <input
                    type="text"
                    value={restockModal.batchNumber}
                    onChange={(e) => setRestockModal((prev) => ({ ...prev, batchNumber: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Receiving Pod Hub</label>
                  <select
                    value={restockModal.podHubId}
                    onChange={(e) => setRestockModal((prev) => ({ ...prev, podHubId: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    {darkStores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} ({s.city})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Inward Notes</label>
                <input
                  type="text"
                  value={restockModal.notes}
                  onChange={(e) => setRestockModal((prev) => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRestockModal({ isOpen: false, product: null, quantityToAdd: 50, batchNumber: '', podHubId: '', notes: '' })}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs"
                >
                  Complete Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STOCK LEVEL MODAL */}
      {editModal.isOpen && editModal.product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in scale-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-purple-100 text-purple-700">
                  <Edit2 className="w-4 h-4" />
                </span>
                <h3 className="font-heading font-black text-sm text-slate-900">
                  Adjust Physical Stock Count
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditModal({ isOpen: false, product: null, currentStock: 0, lowStockThreshold: 10 })}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditStockSubmit} className="space-y-3.5 text-xs">
              <p className="font-bold text-slate-800">{editModal.product.name}</p>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Set Exact Units Count</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editModal.currentStock}
                  onChange={(e) => setEditModal((prev) => ({ ...prev, currentStock: Number(e.target.value) }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-base font-bold text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModal({ isOpen: false, product: null, currentStock: 0, lowStockThreshold: 10 })}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Stock Level
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
