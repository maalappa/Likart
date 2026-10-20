import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Zap,
  Store,
  ShoppingBag,
  PackageCheck,
  Bike,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Plus,
  Minus,
  LogOut,
  ShieldCheck,
  RefreshCw,
  Phone,
  Check,
  X,
  Volume2,
  User,
  Layers,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  Download,
  FileText,
  Smartphone,
  Globe,
} from 'lucide-react';
import { safeStorage } from '../../utils/storageUtils';
import { Order, OrderStatus } from '../../types';
import { exportMartTallyReportToPDF } from '../../utils/martTallyPdfGenerator';

export const MartManagerDashboard: React.FC = () => {
  const {
    authMartManager,
    logoutMartManager,
    darkStores,
    toggleDarkStoreStatus,
    orders,
    updateOrderStatus,
    deliveryPartners,
    addNotification,
    setActivePortal,
    martProducts,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'fleet' | 'performance' | 'reports'>('orders');
  const [orderSearch, setOrderSearch] = useState('');
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategory, setInventoryCategory] = useState<string>('all');
  const [isGeneratingTallyPdf, setIsGeneratingTallyPdf] = useState(false);

  // Track pod inventory locally with stock overrides
  const [skuOverrides, setSkuOverrides] = useState<Record<string, { inStock: boolean; stockCount: number }>>(() => {
    try {
      const saved = safeStorage.getItem(`likart_pod_inventory_${authMartManager?.storeId}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const updateSkuOverride = (skuId: string, inStock: boolean, deltaStock = 0) => {
    setSkuOverrides((prev) => {
      const current = prev[skuId] || { inStock: true, stockCount: 50 };
      const updated = {
        inStock,
        stockCount: Math.max(0, current.stockCount + deltaStock),
      };
      const next = { ...prev, [skuId]: updated };
      try {
        safeStorage.setItem(`likart_pod_inventory_${authMartManager?.storeId}`, JSON.stringify(next));
      } catch (err) {
        console.warn(err);
      }
      return next;
    });
  };

  // Find this manager's store pod
  const currentStore = useMemo(() => {
    return darkStores.find((s) => s.id === authMartManager?.storeId) || darkStores[0];
  }, [darkStores, authMartManager]);

  // Filter orders for this pod
  const podOrders = useMemo(() => {
    return orders.filter((o) => {
      const isThisStore =
        o.restaurantId === currentStore?.id ||
        o.restaurantId === 'likart-mart-hub-01' ||
        o.items.some((i) => i.menuItemId?.startsWith('qc-') || i.name.toLowerCase().includes('milk'));
      return isThisStore;
    });
  }, [orders, currentStore]);

  // Download Pod Tally Report (PDF)
  const handleDownloadPodTallyReport = () => {
    setIsGeneratingTallyPdf(true);
    try {
      exportMartTallyReportToPDF({
        orders: podOrders,
        darkStores,
        categories: [],
        items: martProducts || [],
        periodScope: 'today',
        podFilter: currentStore?.id || 'likart-mart-hub-01',
        companyName: `LIKART MART • ${currentStore?.name || 'CENTRAL POD HUB'}`.toUpperCase(),
        gstin: '29AABCL8899K1Z4',
        financialYear: 'FY 2025-2026',
        generatedBy: `${authMartManager?.name || 'Pod Lead'} (${currentStore?.code || 'POD-01'})`,
      });
      addNotification(
        'Tally PDF Downloaded',
        `Pod ${currentStore?.code || 'POD-01'} Tally Day Book and stock valuation statement downloaded.`,
        'order'
      );
    } catch (err: any) {
      console.error('Tally PDF error:', err);
      addNotification('Report Error', 'Could not compile Pod Tally report.', 'system');
    } finally {
      setIsGeneratingTallyPdf(false);
    }
  };

  const filteredPodOrders = useMemo(() => {
    return podOrders.filter((o) => {
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase().trim();
        const idMatch = o.id.toLowerCase().includes(q);
        const nameMatch = o.customerName.toLowerCase().includes(q);
        const itemMatch = o.items.some((i) => i.name.toLowerCase().includes(q));
        if (!idMatch && !nameMatch && !itemMatch) return false;
      }
      return true;
    });
  }, [podOrders, orderSearch]);

  const pendingPackOrders = podOrders.filter((o) => o.status === 'placed' || o.status === 'confirmed');
  const packingOrders = podOrders.filter((o) => o.status === 'preparing');
  const outForDeliveryOrders = podOrders.filter((o) => o.status === 'out_for_delivery');
  const deliveredOrders = podOrders.filter((o) => o.status === 'delivered');

  // Filter inventory
  const filteredInventory = useMemo(() => {
    return (martProducts || []).filter((item) => {
      if (inventoryCategory !== 'all' && item.category !== inventoryCategory) return false;
      if (inventorySearch.trim()) {
        const q = inventorySearch.toLowerCase().trim();
        const nameMatch = item.name.toLowerCase().includes(q);
        const brandMatch = item.brand.toLowerCase().includes(q);
        if (!nameMatch && !brandMatch) return false;
      }
      return true;
    });
  }, [inventoryCategory, inventorySearch, martProducts]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* 1. Header Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-950 via-teal-900 to-slate-900 flex items-center justify-center text-white shrink-0 shadow-md border border-emerald-500/30">
            <Store className="w-7 h-7 text-emerald-400" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-2.5 h-2.5 fill-current" />
                <span>{currentStore?.code || 'POD-01'}</span>
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                SLA: {currentStore?.slaMinutes || 10} Mins
              </span>
              <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full capitalize">
                Shift: {authMartManager?.shift || 'Full Day'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black font-heading text-slate-900 tracking-tight mt-0.5">
              {currentStore?.name || 'Likart Mart Pod Hub'}
            </h1>

            <p className="text-xs text-slate-500 truncate max-w-xl">
              Manager: <strong className="text-slate-800">{authMartManager?.name || 'Store Lead'}</strong> •{' '}
              {currentStore?.address || 'Metro Commercial Belt'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Store status toggle */}
          {currentStore?.isActive === false ? (
            <div
              className="px-3.5 py-2 rounded-xl text-xs font-black border bg-rose-100 text-rose-800 border-rose-300 flex items-center gap-1.5 shadow-2xs"
              title="Store pod has been deactivated by Likart Mart Super Admin"
            >
              <span className="w-2 h-2 rounded-full bg-rose-600" />
              <span>POD DEACTIVATED BY SUPER ADMIN</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => currentStore && toggleDarkStoreStatus(currentStore.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition border flex items-center gap-1.5 shadow-2xs ${
                currentStore?.isOpen
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  currentStore?.isOpen ? 'bg-white animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span>{currentStore?.isOpen ? 'STORE POD OPEN' : 'STORE POD PAUSED'}</span>
            </button>
          )}

          <button
            type="button"
            disabled={isGeneratingTallyPdf}
            onClick={handleDownloadPodTallyReport}
            className="px-3.5 py-2 bg-gradient-to-r from-teal-900 to-emerald-900 hover:from-teal-800 hover:to-emerald-800 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 border border-emerald-500/30 active:scale-95 disabled:opacity-50"
            title="Download Pod Tally Day Book & Ledger PDF"
          >
            {isGeneratingTallyPdf ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>Tally Report (PDF)</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePortal('customer')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
          >
            Customer Web
          </button>

          <button
            type="button"
            onClick={logoutMartManager}
            className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Pod Deactivated Warning Banner */}
      {currentStore?.isActive === false && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 border-2 border-rose-500/80 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-rose-500/20 text-rose-300 rounded-2xl border border-rose-500/40 shrink-0">
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-heading font-black text-base text-white">
                  This Dark Store Pod is Currently DEACTIVATED by Likart Mart Super Admin
                </h4>
                <span className="text-[10px] bg-rose-500 text-white font-black px-2.5 py-0.5 rounded-full uppercase">
                  Fulfillment Paused
                </span>
              </div>
              <p className="text-xs text-rose-200/90 mt-1 max-w-2xl leading-relaxed">
                Reason: <strong>{currentStore.deactivationReason || 'Administrative maintenance hold'}</strong>
                {currentStore.deactivatedAt && ` • Date: ${currentStore.deactivatedAt}`}
                {' — Contact Super Admin to reactivate this pod for dispatch.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Pod Live Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Pending Orders to Pack
          </span>
          <p className="text-2xl font-black font-heading text-rose-600">
            {pendingPackOrders.length + packingOrders.length}
          </p>
          <span className="text-[11px] text-rose-500 font-semibold block">
            Target SLA: &lt; 3 mins pack
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Out For 10m Delivery
          </span>
          <p className="text-2xl font-black font-heading text-amber-600">
            {outForDeliveryOrders.length}
          </p>
          <span className="text-[11px] text-slate-500 block">En route to doorsteps</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Delivered Today
          </span>
          <p className="text-2xl font-black font-heading text-emerald-600">
            {deliveredOrders.length}
          </p>
          <span className="text-[11px] text-emerald-600 font-bold block">
            100% on-time fulfillment
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Assigned Pod Riders
          </span>
          <p className="text-2xl font-black font-heading text-purple-600">
            {currentStore?.activeRidersCount || 14} Riders
          </p>
          <span className="text-[11px] text-purple-600 font-semibold block">
            Express fleet active
          </span>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 gap-1 overflow-x-auto shadow-2xs">
        {[
          {
            id: 'orders',
            label: `Live Packing Queue (${pendingPackOrders.length + packingOrders.length})`,
            icon: ShoppingBag,
            badge: pendingPackOrders.length > 0 ? pendingPackOrders.length : undefined,
          },
          { id: 'inventory', label: `Pod SKU Inventory (${(martProducts || []).length})`, icon: PackageCheck },
          { id: 'fleet', label: `Assigned Riders (${currentStore?.activeRidersCount || 14})`, icon: Bike },
          { id: 'performance', label: `Pod SLA Performance`, icon: TrendingUp },
          { id: 'reports', label: 'Pod Tally & Reports', icon: FileSpreadsheet },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black transition whitespace-nowrap active:scale-95 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* TAB 1: LIVE 10-MINUTE ORDERS (PACKING QUEUE)                   */}
      {/* ============================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-heading font-black text-base text-slate-900">
                Pod Order Packing Stream ({filteredPodOrders.length})
              </h3>
              <p className="text-xs text-slate-500">
                Pick items from aisles, pack in sealed bags, hand over to express fleet
              </p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search order ID, customer or item..."
                className="pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>
          </div>

          {filteredPodOrders.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-2">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-600">No active orders in this pod right now</p>
              <p className="text-[11px] text-slate-400">
                When customers place 10-minute grocery orders within your pod radius, they will ring here instantly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPodOrders.map((o) => {
                const isUrgent = o.status === 'placed' || o.status === 'confirmed';
                return (
                  <div
                    key={o.id}
                    className={`bg-white rounded-3xl p-5 border shadow-2xs space-y-3 transition flex flex-col justify-between ${
                      isUrgent
                        ? 'border-amber-300 ring-2 ring-amber-100'
                        : 'border-slate-200/90'
                    }`}
                  >
                    <div>
                      {/* Order top banner */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-slate-900 font-heading text-sm">
                              {o.id}
                            </span>
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.2 rounded">
                              10M SLA
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            Ordered at{' '}
                            {new Date(o.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            o.status === 'placed' || o.status === 'confirmed'
                              ? 'bg-rose-100 text-rose-800 animate-pulse'
                              : o.status === 'preparing'
                              ? 'bg-amber-100 text-amber-800'
                              : o.status === 'out_for_delivery'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {o.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {/* Customer & address */}
                      <div className="pt-2 border-t border-slate-100 text-xs">
                        <strong className="text-slate-800 block">{o.customerName}</strong>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {o.deliveryAddress
                            ? `${o.deliveryAddress.flat || ''} ${o.deliveryAddress.area || ''}`
                            : 'Doorstep delivery'}
                        </span>
                      </div>

                      {/* Grocery Items Checklist */}
                      <div className="pt-2 space-y-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                          Items to Pick &amp; Pack ({o.items.length}):
                        </span>
                        <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 space-y-1 max-h-36 overflow-y-auto">
                          {o.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="text-xs flex items-center justify-between text-slate-800 py-0.5"
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                                <span className="font-bold truncate">{item.name}</span>
                              </div>
                              <span className="font-black text-slate-900 shrink-0 ml-2">
                                x{item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-semibold">Total Amount:</span>
                        <strong className="text-slate-900 font-black">₹{o.totalAmount}</strong>
                      </div>

                      {o.status === 'placed' || o.status === 'confirmed' ? (
                        <button
                          type="button"
                          onClick={() => {
                            updateOrderStatus(o.id, 'preparing');
                            addNotification('Packing Started', `Order ${o.id} marked as Packing in Pod.`, 'order');
                          }}
                          className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs rounded-xl shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          <span>Start Picking &amp; Packing</span>
                        </button>
                      ) : o.status === 'preparing' ? (
                        <button
                          type="button"
                          onClick={() => {
                            updateOrderStatus(o.id, 'out_for_delivery');
                            addNotification('Dispatched to Fleet', `Order ${o.id} handed to express rider.`, 'order');
                          }}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <Bike className="w-3.5 h-3.5" />
                          <span>Handover to Rider &amp; Dispatch</span>
                        </button>
                      ) : o.status === 'out_for_delivery' ? (
                        <button
                          type="button"
                          onClick={() => {
                            updateOrderStatus(o.id, 'delivered');
                            addNotification('Delivered', `Order ${o.id} marked as delivered to doorstep.`, 'order');
                          }}
                          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirm Doorstep Delivery</span>
                        </button>
                      ) : (
                        <span className="block text-center text-[11px] font-bold text-emerald-600 py-1">
                          ✓ Delivery Completed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: POD SKU INVENTORY & STOCK CONTROL                       */}
      {/* ============================================================== */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-heading font-black text-base text-slate-900">
                Pod Shelf SKU Stock Management ({filteredInventory.length})
              </h3>
              <p className="text-xs text-slate-500">
                Live inventory toggle for {currentStore?.name}. Instant in-stock/out-of-stock sync.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  placeholder="Search item or brand..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <select
                value={inventoryCategory}
                onChange={(e) => setInventoryCategory(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-1.5 font-bold"
              >
                <option value="all">All Aisles</option>
                <option value="dairy_breakfast">Dairy &amp; Bread</option>
                <option value="fruits_vegetables">Produce &amp; Fruits</option>
                <option value="snacks_munchies">Snacks &amp; Biscuits</option>
                <option value="cold_drinks">Drinks &amp; Juices</option>
                <option value="household_cleaning">Household Staples</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredInventory.map((item) => {
              const override = skuOverrides[item.id];
              const isInStock = override !== undefined ? override.inStock : item.inStock;
              const stockCount = override !== undefined ? override.stockCount : (item.stockCount || 50);

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-2xl border transition flex flex-col justify-between ${
                    isInStock
                      ? 'bg-white border-slate-200 hover:border-emerald-300'
                      : 'bg-rose-50/40 border-rose-200'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[9px] font-black uppercase text-slate-400 block truncate">
                        {item.brand}
                      </span>
                      <h5 className="font-bold text-xs text-slate-900 truncate leading-tight">
                        {item.name}
                      </h5>
                      <span className="text-[10px] text-slate-500 block">
                        {item.unit} • ₹{item.price}
                      </span>
                      {item.variants && item.variants.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="inline-flex items-center gap-0.5 text-[9px] bg-purple-100 text-purple-800 font-extrabold px-1.5 py-0.2 rounded">
                            <Layers className="w-2.5 h-2.5" />
                            {item.variants.length} Variants
                          </span>
                          <span className="text-[9px] text-slate-400 truncate max-w-[120px]">
                            {item.variants.map((v) => v.unit).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => updateSkuOverride(item.id, isInStock, -5)}
                        className="p-1 text-slate-500 hover:bg-slate-100 rounded"
                        title="Reduce 5"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="text-xs font-black text-slate-800 min-w-[20px] text-center">
                        {stockCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateSkuOverride(item.id, isInStock, 5)}
                        className="p-1 text-slate-500 hover:bg-slate-100 rounded"
                        title="Add 5"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => updateSkuOverride(item.id, !isInStock, 0)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-black transition ${
                        isInStock
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-rose-100 hover:text-rose-800'
                          : 'bg-rose-600 text-white hover:bg-emerald-600'
                      }`}
                    >
                      {isInStock ? 'IN STOCK' : 'OUT OF STOCK'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: ASSIGNED EXPRESS RIDERS                                 */}
      {/* ============================================================== */}
      {activeTab === 'fleet' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="font-heading font-black text-base text-slate-900">
              Assigned Express Fleet for {currentStore?.name}
            </h3>
            <p className="text-xs text-slate-500">
              Riders standing by at pod loading bays for immediate 10-minute dispatch
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {deliveryPartners.slice(0, currentStore?.activeRidersCount || 10).map((r) => (
              <div
                key={r.id}
                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                    <Bike className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-slate-900 block">{r.name}</strong>
                    <span className="text-[10px] text-slate-400 block">{r.phone}</span>
                    <span className="text-[10px] text-emerald-600 font-bold block">
                      ★ {r.rating || 4.9} • {r.kyc?.vehicleType?.toUpperCase() || 'EV SCOOTER'}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                    r.isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {r.isOnline ? 'BAY READY' : 'OFFLINE'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: POD SLA PERFORMANCE                                     */}
      {/* ============================================================== */}
      {activeTab === 'performance' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="font-heading font-black text-base text-slate-900">
              10-Minute SLA Compliance &amp; Speed Metrics
            </h3>
            <p className="text-xs text-slate-500">
              Performance metrics for {currentStore?.name} ({currentStore?.code})
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
              <span className="text-[10px] font-black uppercase text-emerald-800">
                On-Time 10m SLA Rate
              </span>
              <p className="text-3xl font-black text-emerald-900 font-heading">98.9%</p>
              <span className="text-xs text-emerald-700 font-semibold block">
                Target SLA: &gt; 95%
              </span>
            </div>

            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-1">
              <span className="text-[10px] font-black uppercase text-purple-800">
                Average Packing Time
              </span>
              <p className="text-3xl font-black text-purple-900 font-heading">2.1 Mins</p>
              <span className="text-xs text-purple-700 font-semibold block">
                From order ring to dispatch
              </span>
            </div>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 space-y-1">
              <span className="text-[10px] font-black uppercase text-blue-800">
                Average Delivery Ride Time
              </span>
              <p className="text-3xl font-black text-blue-900 font-heading">6.8 Mins</p>
              <span className="text-xs text-blue-700 font-semibold block">
                Within {currentStore?.serviceRadiusKm || 2.5} km radius
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: POD TALLY ACCOUNTING & LEDGER REPORTS                   */}
      {/* ============================================================== */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-lg text-slate-900">
                  Pod Tally Accounting &amp; Day Book Reports
                </h3>
                <span className="text-[10px] bg-teal-100 text-teal-800 font-black px-2.5 py-0.5 rounded-full border border-teal-200 uppercase">
                  Tally.ERP 9 / TallyPrime
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Daily double-entry ledger, COD cash-in-hand reconciliation, and stock valuation for {currentStore?.name} ({currentStore?.code}).
              </p>
            </div>

            <button
              type="button"
              disabled={isGeneratingTallyPdf}
              onClick={handleDownloadPodTallyReport}
              className="px-4 py-2.5 bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-900 hover:from-teal-800 hover:to-emerald-800 text-white font-black text-xs rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-2 border border-amber-400/40 disabled:opacity-50"
            >
              {isGeneratingTallyPdf ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Compiling Pod Tally PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Download Pod Tally Report (PDF)</span>
                </>
              )}
            </button>
          </div>

          {/* Pod Tally Featured Card */}
          <div className="p-5 bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 text-white rounded-2xl border border-amber-500/30 shadow-md space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-400 text-slate-950 rounded-xl shadow-sm font-black">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                      Tally Standard
                    </span>
                    <span className="text-[10px] font-bold text-emerald-300">
                      Double-Entry Balanced ✓
                    </span>
                  </div>
                  <h4 className="font-heading font-black text-base text-white mt-0.5">
                    {currentStore?.name} • Day Book &amp; Stock Tally Statement
                  </h4>
                  <p className="text-xs text-teal-100/80">
                    Lead: {authMartManager?.name || 'Dark Store Manager'} • Shift: {authMartManager?.shift || 'Active'} • GSTIN: 29AABCL8899K1Z4
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isGeneratingTallyPdf}
                onClick={handleDownloadPodTallyReport}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1.5 shrink-0 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Statement</span>
              </button>
            </div>
          </div>

          {/* KPI Ledger Summary */}
          {(() => {
            const gSales = podOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
            const codOrders = podOrders.filter((o) => (o.paymentMethod || '').toLowerCase() === 'cod' || (o.paymentMethod || '').toLowerCase() === 'cash');
            const cashHand = codOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
            const digitalAmt = gSales - cashHand;

            return (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
                  <span className="text-[10px] font-black uppercase text-amber-800">
                    COD Cash-in-Hand Tally (1001)
                  </span>
                  <p className="text-2xl font-black text-amber-950 font-mono">
                    ₹{cashHand.toLocaleString('en-IN')}
                  </p>
                  <span className="text-xs text-amber-700 font-semibold block">
                    Cash collected by riders for handover
                  </span>
                </div>

                <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 space-y-1">
                  <span className="text-[10px] font-black uppercase text-teal-800">
                    Razorpay / Bank Settled (1002)
                  </span>
                  <p className="text-2xl font-black text-teal-950 font-mono">
                    ₹{digitalAmt.toLocaleString('en-IN')}
                  </p>
                  <span className="text-xs text-teal-700 font-semibold block">
                    Prepaid &amp; UPI Escrow settlements
                  </span>
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                  <span className="text-[10px] font-black uppercase text-emerald-800">
                    Gross Pod Turnover (2001)
                  </span>
                  <p className="text-2xl font-black text-emerald-950 font-mono">
                    ₹{gSales.toLocaleString('en-IN')}
                  </p>
                  <span className="text-xs text-emerald-700 font-semibold block">
                    {podOrders.length} orders fulfilled under SLA
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Pod Day Book Table */}
          <div className="space-y-3 pt-2">
            <h4 className="font-heading font-black text-sm text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-700" />
              <span>Pod Shift Day Book Vouchers</span>
            </h4>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3">Vch No.</th>
                    <th className="py-2.5 px-3">Customer / Particulars</th>
                    <th className="py-2.5 px-3">Payment Ledger</th>
                    <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                    <th className="py-2.5 px-3">Fulfillment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {podOrders.slice(0, 10).map((o, idx) => {
                    const isCod = (o.paymentMethod || '').toLowerCase() === 'cod' || (o.paymentMethod || '').toLowerCase() === 'cash';
                    return (
                      <tr key={o.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">VCH-{1000 + idx + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{o.customerName || 'Online Shopper'}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-600">
                          {isCod ? 'Cash-in-Hand (COD)' : 'Razorpay / Bank'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          ₹{(o.totalAmount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {podOrders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        No orders recorded for this pod shift yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
