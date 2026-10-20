import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  CreditCard,
  Printer,
  ChevronRight,
  Bike,
  Store,
  DollarSign,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Order, OrderStatus, QuickCommerceItem } from '../../../types';

interface MartOrdersTabProps {
  products: QuickCommerceItem[];
  onLogAudit: (action: 'CREATE' | 'UPDATE' | 'DELETE', module: any, targetId: string, details: string) => void;
}

export const MartOrdersTab: React.FC<MartOrdersTabProps> = ({ products, onLogAudit }) => {
  const {
    orders,
    addOrder,
    updateOrder,
    updateOrderStatus,
    cancelOrder,
    deleteOrder,
    deliveryPartners,
    darkStores,
    allCustomers,
    addNotification,
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');

  // Add Order Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+91 ');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState(darkStores[0]?.id || '');
  const [selectedRiderId, setSelectedRiderId] = useState(deliveryPartners[0]?.id || '');
  const [selectedItems, setSelectedItems] = useState<{ itemId: string; quantity: number }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay' | 'phonepe'>('cod');
  const [deliveryInstructions, setDeliveryInstructions] = useState('Ring doorbell upon arrival');

  // Edit Order Modal
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    order?: Order | null;
    status: OrderStatus;
    deliveryAddress: string;
    deliveryPartnerId: string;
    notes: string;
  }>({
    isOpen: false,
    order: null,
    status: 'placed',
    deliveryAddress: '',
    deliveryPartnerId: '',
    notes: '',
  });

  // Receipt Modal
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter mart orders
  const martOrders = useMemo(() => {
    return orders.filter((o) => {
      const isMart =
        o.restaurantId === 'likart-mart-hub-01' ||
        o.restaurantName?.toLowerCase().includes('mart') ||
        o.restaurantName?.toLowerCase().includes('dark store') ||
        o.items.some(
          (i) =>
            i.menuItemId.startsWith('qc-') ||
            i.name.toLowerCase().includes('amul') ||
            i.name.toLowerCase().includes('milk')
        );
      return isMart;
    });
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return martOrders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const idMatch = o.id.toLowerCase().includes(q);
        const custMatch = o.customerName.toLowerCase().includes(q);
        const phoneMatch = o.customerPhone.includes(q);
        const itemMatch = o.items.some((i) => i.name.toLowerCase().includes(q));
        if (!idMatch && !custMatch && !phoneMatch && !itemMatch) return false;
      }
      return true;
    });
  }, [martOrders, statusFilter, search]);

  const openAddOrder = () => {
    setCustomerName('Rahul Sharma');
    setCustomerPhone('+91 98451 22334');
    setDeliveryAddress('Flat 402, Green Glen Layout, Bellandur, Bengaluru');
    setSelectedStoreId(darkStores[0]?.id || '');
    setSelectedRiderId(deliveryPartners[0]?.id || '');
    setSelectedItems([
      { itemId: products[0]?.id || 'qc-milk-amul', quantity: 2 },
      { itemId: products[1]?.id || 'qc-butter-amul', quantity: 1 },
    ]);
    setPaymentMethod('cod');
    setDeliveryInstructions('Leave at door if not answering');
    setAddModalOpen(true);
  };

  const handleCreateOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || selectedItems.length === 0) return;

    const assignedStore = darkStores.find((s) => s.id === selectedStoreId) || darkStores[0];
    const assignedRider = deliveryPartners.find((r) => r.id === selectedRiderId);

    const orderItems = selectedItems.map((si) => {
      const prod = products.find((p) => p.id === si.itemId) || products[0];
      return {
        menuItemId: prod.id,
        name: prod.name,
        price: prod.price,
        quantity: si.quantity,
        isVeg: prod.isVeg,
      };
    });

    const itemTotal = orderItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const deliveryFee = 25;
    const platformFee = 5;
    const taxes = Math.round(itemTotal * 0.05);
    const totalAmount = itemTotal + deliveryFee + platformFee + taxes;

    const newOrder: Order = {
      id: `LKT-${Math.floor(10000 + Math.random() * 90000)}`,
      customerId: `cust-${Date.now().toString().slice(-4)}`,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      restaurantId: assignedStore?.id || 'likart-mart-hub-01',
      restaurantName: assignedStore?.name || 'Likart Mart Central Pod Hub #01',
      restaurantAddress: assignedStore?.address || 'Metro Commercial Belt',
      restaurantPhone: assignedStore?.contactNumber || '+91 8000 123 456',
      deliveryPartnerId: assignedRider?.id,
      deliveryPartnerName: assignedRider?.name,
      deliveryPartnerPhone: assignedRider?.phone,
      items: orderItems,
      itemTotal,
      deliveryFee,
      platformFee,
      taxes,
      tipAmount: 0,
      discount: 0,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed',
      status: 'placed',
      deliveryOtp: Math.floor(1000 + Math.random() * 9000).toString(),
      deliveryAddress: {
        id: `addr-${Date.now()}`,
        type: 'Home',
        title: 'Home',
        flat: deliveryAddress.trim(),
        area: assignedStore?.name || 'Central Pod',
        city: assignedStore?.city || 'Bengaluru',
        coordinates: {
          lat: assignedStore?.lat || 12.9716,
          lng: assignedStore?.lng || 77.5946,
        },
        isDefault: true,
        addressLine: deliveryAddress.trim(),
        label: 'Home',
      },
      deliveryInstructions,
      timeline: [
        {
          status: 'placed',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          note: `Manual order created by Super Admin for 10-minute dispatch from ${assignedStore?.name || 'Central Pod'}.`,
        },
      ],
      createdAt: new Date().toISOString(),
    };

    addOrder(newOrder);
    onLogAudit('CREATE', 'Orders', newOrder.id, `Created manual Mart Order #${newOrder.id} (₹${totalAmount})`);
    setAddModalOpen(false);
  };

  const handleEditOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal.order) return;

    const ord = editModal.order;
    const rider = deliveryPartners.find((r) => r.id === editModal.deliveryPartnerId);

    updateOrder(ord.id, {
      status: editModal.status,
      deliveryPartnerId: rider?.id || ord.deliveryPartnerId,
      deliveryPartnerName: rider?.name || ord.deliveryPartnerName,
      deliveryPartnerPhone: rider?.phone || ord.deliveryPartnerPhone,
      deliveryAddress: {
        ...ord.deliveryAddress,
        flat: editModal.deliveryAddress.trim(),
        addressLine: editModal.deliveryAddress.trim(),
      },
    });

    if (editModal.status !== ord.status) {
      updateOrderStatus(ord.id, editModal.status, editModal.notes || 'Status updated by Super Admin');
    }

    addNotification('Order Updated', `Order #${ord.id} details saved.`, 'system');
    onLogAudit('UPDATE', 'Orders', ord.id, `Updated status to ${editModal.status} and modified address`);
    setEditModal({ isOpen: false, order: null, status: 'placed', deliveryAddress: '', deliveryPartnerId: '', notes: '' });
  };

  const handleDeleteOrder = (id: string) => {
    deleteOrder(id);
    onLogAudit('DELETE', 'Orders', id, `Deleted Mart Order #${id}`);
    setDeleteConfirmId(null);
  };

  const getStatusBadge = (status: OrderStatus) => {
    const map: Partial<Record<OrderStatus, { bg: string; text: string; label: string }>> = {
      placed: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Placed' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Confirmed' },
      preparing: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Picking SKUs' },
      ready_for_pickup: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Bags Packed' },
      rider_assigned: { bg: 'bg-cyan-100', text: 'text-cyan-800', label: 'Rider Assigned' },
      out_for_delivery: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Out for 10m Delivery' },
      delivered: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Delivered (SLA Met)' },
      cancelled: { bg: 'bg-rose-100', text: 'text-rose-800', label: 'Cancelled' },
    };
    const s = map[status] || { bg: 'bg-slate-100', text: 'text-slate-800', label: status };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${s.bg} ${s.text}`}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total 10m Mart Orders</span>
          <p className="text-2xl font-black font-heading text-slate-900">{martOrders.length}</p>
          <span className="text-xs text-emerald-600 font-bold block">Quick commerce volume</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Live Active Dispatches</span>
          <p className="text-2xl font-black font-heading text-orange-600">
            {martOrders.filter((o) => ['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(o.status)).length} Orders
          </p>
          <span className="text-xs text-slate-500 font-medium block">Under 10m delivery countdown</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Successfully Delivered</span>
          <p className="text-2xl font-black font-heading text-emerald-600">
            {martOrders.filter((o) => o.status === 'delivered').length} Orders
          </p>
          <span className="text-xs text-emerald-600 font-bold block">98.4% On-time SLA</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Gross Mart GMV</span>
          <p className="text-2xl font-black font-heading text-slate-900">
            ₹{martOrders.filter((o) => o.status !== 'cancelled').reduce((acc, o) => acc + o.totalAmount, 0).toLocaleString()}
          </p>
          <span className="text-xs text-emerald-600 font-bold block">Express grocery revenue</span>
        </div>
      </div>

      {/* Action Header & Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order ID, customer, phone..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-emerald-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="all">All Order Statuses</option>
            <option value="placed">Placed (New)</option>
            <option value="preparing">Picking SKUs</option>
            <option value="ready">Packed / Ready</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <button
          type="button"
          onClick={openAddOrder}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-xs transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create Manual Mart Order</span>
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Pod Store & Dispatcher</th>
                <th className="py-3 px-4">Items Ordered</th>
                <th className="py-3 px-4">Total & Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-bold text-sm">No mart orders found</p>
                    <p className="text-xs">Adjust search query or create a test order</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-900 block">{order.id}</span>
                        <span className="text-[10px] text-slate-400 block">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-3 px-4 space-y-0.5">
                        <span className="font-bold text-slate-900 block">{order.customerName}</span>
                        <span className="text-[11px] text-slate-500 block">{order.customerPhone}</span>
                        <span className="text-[10px] text-slate-400 block truncate max-w-[160px]">
                          {order.deliveryAddress?.flat || order.deliveryAddress?.area || order.deliveryAddress?.addressLine || 'Doorstep delivery'}
                        </span>
                      </td>

                      <td className="py-3 px-4 space-y-0.5">
                        <span className="font-semibold text-slate-800 block">
                          {order.restaurantName || 'Central Pod Hub #01'}
                        </span>
                        {order.deliveryPartnerName ? (
                          <span className="text-[11px] text-blue-700 font-bold flex items-center gap-1">
                            <Bike className="w-3 h-3" />
                            {order.deliveryPartnerName}
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-600 font-semibold italic">Unassigned Bay</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-0.5 max-w-[180px]">
                          {order.items.slice(0, 2).map((item, idx) => (
                            <span key={idx} className="text-[11px] text-slate-700 block truncate">
                              {item.quantity}x {item.name}
                            </span>
                          ))}
                          {order.items.length > 2 && (
                            <span className="text-[10px] text-emerald-600 font-bold block">
                              +{order.items.length - 2} more items
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono font-black text-slate-900 text-sm block">
                          ₹{order.totalAmount}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase font-mono block">
                          {order.paymentMethod} • {order.paymentStatus}
                        </span>
                      </td>

                      <td className="py-3 px-4">{getStatusBadge(order.status)}</td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setReceiptOrder(order)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                            title="Print invoice receipt"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setEditModal({
                                isOpen: true,
                                order,
                                status: order.status,
                                deliveryAddress: order.deliveryAddress?.flat || order.deliveryAddress?.addressLine || '',
                                deliveryPartnerId: order.deliveryPartnerId || deliveryPartners[0]?.id || '',
                                notes: '',
                              })
                            }
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                            title="Edit order details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {deleteConfirmId === order.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleDeleteOrder(order.id)}
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
                              onClick={() => setDeleteConfirmId(order.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Delete order"
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

      {/* CREATE MANUAL ORDER MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in scale-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-emerald-100 text-emerald-700">
                  <ShoppingBag className="w-4 h-4" />
                </span>
                <h3 className="font-heading font-black text-base text-slate-900">
                  Create Manual Mart 10m Express Order
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

            <form onSubmit={handleCreateOrderSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Customer Phone *</label>
                  <input
                    type="text"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Delivery Address *</label>
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Dispatching Pod Store</label>
                  <select
                    value={selectedStoreId}
                    onChange={(e) => setSelectedStoreId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    {darkStores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Assign Express Rider</label>
                  <select
                    value={selectedRiderId}
                    onChange={(e) => setSelectedRiderId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    {deliveryPartners.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.isOnline ? 'Online' : 'Offline'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Select SKUs to Dispatch</label>
                <div className="max-h-40 overflow-y-auto space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  {products.slice(0, 10).map((p) => {
                    const isSelected = selectedItems.some((si) => si.itemId === p.id);
                    const qty = selectedItems.find((si) => si.itemId === p.id)?.quantity || 1;

                    return (
                      <div key={p.id} className="flex items-center justify-between text-xs">
                        <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800 truncate max-w-[240px]">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems((prev) => [...prev, { itemId: p.id, quantity: 1 }]);
                              } else {
                                setSelectedItems((prev) => prev.filter((si) => si.itemId !== p.id));
                              }
                            }}
                            className="w-4 h-4 accent-emerald-600 rounded"
                          />
                          <span>{p.name}</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-700">₹{p.price}</span>
                          {isSelected && (
                            <input
                              type="number"
                              min="1"
                              max="20"
                              value={qty}
                              onChange={(e) => {
                                const newQ = Number(e.target.value);
                                setSelectedItems((prev) =>
                                  prev.map((si) => (si.itemId === p.id ? { ...si, quantity: newQ } : si))
                                );
                              }}
                              className="w-12 p-1 bg-white border border-slate-200 rounded font-mono text-center text-xs"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold uppercase"
                  >
                    <option value="cod">Cash on Delivery (COD)</option>
                    <option value="razorpay">Razorpay UPI</option>
                    <option value="phonepe">PhonePe UPI</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Delivery Instructions</label>
                  <input
                    type="text"
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

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
                  Place Mart Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ORDER MODAL */}
      {editModal.isOpen && editModal.order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in scale-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-purple-100 text-purple-700">
                  <Edit2 className="w-4 h-4" />
                </span>
                <h3 className="font-heading font-black text-base text-slate-900">
                  Edit Order #{editModal.order.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditModal({ isOpen: false, order: null, status: 'placed', deliveryAddress: '', deliveryPartnerId: '', notes: '' })}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditOrderSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Order Status</label>
                <select
                  value={editModal.status}
                  onChange={(e) => setEditModal((prev) => ({ ...prev, status: e.target.value as any }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="placed">Placed (Order Received)</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Picking SKUs in Pod</option>
                  <option value="ready">Packed &amp; Staged at Bay</option>
                  <option value="out_for_delivery">Out for 10m Express Delivery</option>
                  <option value="delivered">Delivered Successfully</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reassign Express Delivery Partner</label>
                <select
                  value={editModal.deliveryPartnerId}
                  onChange={(e) => setEditModal((prev) => ({ ...prev, deliveryPartnerId: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  {deliveryPartners.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Delivery Address</label>
                <input
                  type="text"
                  value={editModal.deliveryAddress}
                  onChange={(e) => setEditModal((prev) => ({ ...prev, deliveryAddress: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Timeline Audit Note</label>
                <input
                  type="text"
                  value={editModal.notes}
                  onChange={(e) => setEditModal((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="e.g. Expedited bay packing per customer request"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModal({ isOpen: false, order: null, status: 'placed', deliveryAddress: '', deliveryPartnerId: '', notes: '' })}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs"
                >
                  Update Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECEIPT PREVIEW MODAL */}
      {receiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in scale-95 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-3">
              <div>
                <h3 className="font-black text-sm text-slate-900 uppercase">LIKART MART</h3>
                <span className="text-[10px] text-slate-400">10-Minute Dark Store Express</span>
              </div>
              <button
                type="button"
                onClick={() => setReceiptOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1 text-[11px] text-slate-600">
              <div className="flex justify-between">
                <span>Order ID:</span>
                <span className="font-bold text-slate-900">{receiptOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date(receiptOrder.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{receiptOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Store Hub:</span>
                <span>{receiptOrder.restaurantName}</span>
              </div>
            </div>

            <div className="border-t border-b border-dashed border-slate-200 py-2 space-y-1 text-[11px]">
              {receiptOrder.items.map((i, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>
                    {i.quantity}x {i.name}
                  </span>
                  <span className="font-bold">₹{i.price * i.quantity}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Item Total:</span>
                <span>₹{receiptOrder.itemTotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery SLA Fee:</span>
                <span>₹{receiptOrder.deliveryFee}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-100">
                <span>Grand Total:</span>
                <span>₹{receiptOrder.totalAmount}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Payment:</span>
                <span className="uppercase">{receiptOrder.paymentMethod} ({receiptOrder.paymentStatus})</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Bill Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
