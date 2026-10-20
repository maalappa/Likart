import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowDownRight,
  ShieldCheck,
  Smartphone,
  Eye,
  EyeOff,
  Receipt,
  FileText,
  Filter,
  Search,
  Sparkles,
  Landmark,
  ChevronRight,
  Printer,
  Download,
  X,
  CreditCard,
  RefreshCw,
  Percent,
  Tag,
  ArrowRight,
  Calculator,
  HelpCircle,
  Calendar,
  ArrowUpRight,
  Layers,
  Check,
} from 'lucide-react';
import { Restaurant, Order, PayoutRequest } from '../../types';
import { StatementReportModal } from '../common/StatementReportModal';
import { useApp } from '../../context/AppContext';

interface RestaurantEarningsHubProps {
  restaurant: Restaurant;
  orders: Order[];
  payoutRequests: PayoutRequest[];
  onRequestPayoutOpen: () => void;
  onCancelPayout: (payoutId: string) => void;
  onNavigateToKyc?: () => void;
  onSimulateOrder?: () => void;
}

export const RestaurantEarningsHub: React.FC<RestaurantEarningsHubProps> = ({
  restaurant,
  orders,
  payoutRequests,
  onRequestPayoutOpen,
  onCancelPayout,
  onNavigateToKyc,
  onSimulateOrder,
}) => {
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'delivered' | 'in_kitchen' | 'cancelled'>('all');
  const [payoutStatusFilter, setPayoutStatusFilter] = useState<
    'all' | 'pending' | 'settled' | 'rejected'
  >('all');
  const [searchOrderQuery, setSearchOrderQuery] = useState('');
  const [showFullAccount, setShowFullAccount] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PayoutRequest | null>(null);
  const [selectedOrderSlip, setSelectedOrderSlip] = useState<Order | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcAmount, setCalcAmount] = useState<number>(1000);
  const [cancellingPayoutId, setCancellingPayoutId] = useState<string | null>(null);
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);

  // Orders for this restaurant
  const restaurantOrders = useMemo(() => {
    return orders.filter((o) => o.restaurantId === restaurant.id);
  }, [orders, restaurant.id]);

  const { brandSettings } = useApp();
  const commissionRate =
    typeof restaurant.commissionRate === 'number'
      ? restaurant.commissionRate
      : (brandSettings?.defaultCommissionRate ?? 15);

  // Filter orders by time period for metrics & ledger
  const filteredPeriodOrders = useMemo(() => {
    const now = new Date();
    return restaurantOrders.filter((o) => {
      if (timeFilter === 'all') return true;

      const orderDate = new Date(o.createdAt || o.paymentCollectedAt || Date.now());
      if (timeFilter === 'today') {
        return (
          orderDate.getDate() === now.getDate() &&
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }
      if (timeFilter === 'week') {
        const diffDays = (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24);
        return diffDays <= 7;
      }
      if (timeFilter === 'month') {
        return (
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }
      return true;
    });
  }, [restaurantOrders, timeFilter]);

  // Today-specific orders for badges
  const todayOrders = useMemo(() => {
    const now = new Date();
    return restaurantOrders.filter((o) => {
      const orderDate = new Date(o.createdAt || o.paymentCollectedAt || Date.now());
      return (
        orderDate.getDate() === now.getDate() &&
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      );
    });
  }, [restaurantOrders]);

  // Period-specific financial calculations
  const periodGrossSales = useMemo(() => {
    return filteredPeriodOrders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.itemTotal || 0), 0);
  }, [filteredPeriodOrders]);

  const periodCommissionDeducted = useMemo(() => {
    return Math.round((periodGrossSales * commissionRate) / 100);
  }, [periodGrossSales, commissionRate]);

  const periodNetEarnings = useMemo(() => {
    return Math.max(0, periodGrossSales - periodCommissionDeducted);
  }, [periodGrossSales, periodCommissionDeducted]);

  const periodNonCancelledCount = useMemo(() => {
    return filteredPeriodOrders.filter((o) => o.status !== 'cancelled').length;
  }, [filteredPeriodOrders]);

  // Overall financial calculations (Lifetime across all non-cancelled orders)
  const totalGrossSalesAllTime = useMemo(() => {
    return restaurantOrders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.itemTotal || 0), 0);
  }, [restaurantOrders]);

  // Total Platform Commission automatically deducted from gross sales
  const totalCommissionAllTime = useMemo(() => {
    return Math.round((totalGrossSalesAllTime * commissionRate) / 100);
  }, [totalGrossSalesAllTime, commissionRate]);

  // Total Net Lifetime Earnings after commission auto-deduction
  const netEarningsLifetime = useMemo(() => {
    return Math.max(0, totalGrossSalesAllTime - totalCommissionAllTime);
  }, [totalGrossSalesAllTime, totalCommissionAllTime]);

  // Payout requests for this restaurant
  const myPayoutRequests = useMemo(() => {
    return payoutRequests.filter(
      (p) => p.recipientType === 'restaurant' && p.recipientId === restaurant.id
    );
  }, [payoutRequests, restaurant.id]);

  const settledPayouts = useMemo(() => {
    return myPayoutRequests
      .filter((p) => p.status === 'settled')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [myPayoutRequests]);

  const pendingPayouts = useMemo(() => {
    return myPayoutRequests
      .filter((p) => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [myPayoutRequests]);

  const rejectedPayouts = useMemo(() => {
    return myPayoutRequests
      .filter((p) => p.status === 'rejected')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [myPayoutRequests]);

  // Net Lifetime Earnings remaining after settled payouts (resets after payouts)
  const netEarningsAllTime = Math.max(0, netEarningsLifetime - settledPayouts);

  // Net Available with-drawable balance: Lifetime net earnings - pending requests
  const availablePayout = Math.max(0, netEarningsAllTime - pendingPayouts);

  // Filtered payout requests by status
  const displayedPayouts = useMemo(() => {
    return myPayoutRequests.filter((p) => {
      if (payoutStatusFilter === 'all') return true;
      return p.status === payoutStatusFilter;
    });
  }, [myPayoutRequests, payoutStatusFilter]);

  // Delivered and non-cancelled orders for itemized ledger with period & status filters
  const ledgerOrders = useMemo(() => {
    return filteredPeriodOrders
      .filter((o) => {
        // Status filter
        if (orderStatusFilter === 'delivered' && o.status !== 'delivered') return false;
        if (orderStatusFilter === 'cancelled' && o.status !== 'cancelled') return false;
        if (
          orderStatusFilter === 'in_kitchen' &&
          (o.status === 'delivered' || o.status === 'cancelled')
        ) {
          return false;
        }

        // Search query
        if (!searchOrderQuery) return true;
        const q = searchOrderQuery.toLowerCase();
        return (
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.items.some((i) => i.name.toLowerCase().includes(q))
        );
      });
  }, [filteredPeriodOrders, orderStatusFilter, searchOrderQuery]);

  // Summary of displayed ledger orders
  const ledgerGrossTotal = useMemo(() => {
    return ledgerOrders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.itemTotal || 0), 0);
  }, [ledgerOrders]);

  const ledgerCommissionTotal = useMemo(() => {
    return Math.round((ledgerGrossTotal * commissionRate) / 100);
  }, [ledgerGrossTotal, commissionRate]);

  const ledgerNetTotal = useMemo(() => {
    return Math.max(0, ledgerGrossTotal - ledgerCommissionTotal);
  }, [ledgerGrossTotal, ledgerCommissionTotal]);

  const kycBank = restaurant.kyc?.bankAccount;
  const pendingCount = myPayoutRequests.filter((p) => p.status === 'pending').length;
  const settledCount = myPayoutRequests.filter((p) => p.status === 'settled').length;
  const rejectedCount = myPayoutRequests.filter((p) => p.status === 'rejected').length;

  // Simulator values
  const simGross = Math.max(0, Number(calcAmount) || 0);
  const simCommission = Math.round((simGross * commissionRate) / 100);
  const simNet = Math.max(0, simGross - simCommission);

  return (
    <div className="space-y-6">
      {/* Top Banner & Fast Actions Bar */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        {/* Subtle decorative circles in background */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-40 top-0 w-32 h-32 bg-teal-400/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-xs">
                <Landmark className="w-3.5 h-3.5 text-emerald-300" /> Vendor Treasury & Settlement
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-200 border border-amber-400/30 px-3 py-1 rounded-full flex items-center gap-1 backdrop-blur-xs">
                <Percent className="w-3 h-3 text-amber-300" /> {commissionRate}% Auto-Deduction Engine
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-white">
              Earnings & Payouts Console
            </h2>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              Track live food order revenues, transparent platform commission auto-deductions, and request instant withdrawals from your available net balance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Toggle Simulator */}
            <button
              type="button"
              onClick={() => setShowCalculator(!showCalculator)}
              className={`px-4 py-3 rounded-2xl font-black text-xs transition flex items-center gap-2 shadow-sm border active:scale-95 ${
                showCalculator
                  ? 'bg-amber-400 text-slate-950 border-amber-300'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md'
              }`}
              title="Test commission auto-deduction calculator"
            >
              <Calculator className="w-4 h-4 text-amber-300" />
              <span>{showCalculator ? 'Hide Calculator' : 'Test Calculator'}</span>
            </button>

            {/* Download Statement of Account CTA */}
            <button
              type="button"
              onClick={() => setIsStatementModalOpen(true)}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-black text-xs sm:text-sm rounded-2xl border border-white/20 shadow-lg backdrop-blur-md transition flex items-center gap-2 group active:scale-95"
              title="Download Daily, Weekly, or Monthly Statement of Account (Excel / PDF)"
            >
              <FileText className="w-4 h-4 text-emerald-300 group-hover:scale-110 transition" />
              <span>Download Statement</span>
            </button>

            {/* Request Payout CTA */}
            <button
              onClick={onRequestPayoutOpen}
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg transition flex items-center gap-2 group active:scale-95"
            >
              <ArrowDownRight className="w-4 h-4 text-slate-950 group-hover:translate-y-0.5 transition" />
              <span>Request Payout</span>
              <span className="bg-slate-950/10 px-2 py-0.5 rounded-lg text-slate-900 text-xs font-mono font-bold ml-1">
                ₹{availablePayout.toLocaleString('en-IN')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Commission Auto-Deductions & Net Balance Settlement Breakdown Flow */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 text-white border border-indigo-800/40 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30">
              <Percent className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-heading font-black text-sm sm:text-base text-white">
                  Platform Commission Auto-Deduction Engine
                </h4>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-400/30 uppercase tracking-wider">
                  {commissionRate}% Commercial Auto-Deduction Active
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                  {100 - commissionRate}% Net Retained by Restaurant
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Commercial commission is automatically deducted from gross merchandise food sales upon order delivery. Available payout shows 100% net earnings ready for withdrawal.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="text-slate-400 font-medium">Auto-Deduction Policy:</span>
            <span className="font-mono font-black text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-xl border border-amber-400/25">
              -{commissionRate}% of Food GMV
            </span>
            <span className="text-slate-400 text-[11px]">• No hidden deductions</span>
          </div>
        </div>

        {/* Visual Step-by-Step Flow Equation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Step 1: Gross Sales */}
          <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 flex flex-col justify-between hover:bg-white/10 transition">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                1. Gross Food Sales (GMV)
              </span>
              <div className="text-lg font-black text-white font-mono">
                ₹{totalGrossSalesAllTime.toLocaleString('en-IN')}
              </div>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
              <span>Customer food bill</span>
              <span className="font-mono text-slate-300">{restaurantOrders.filter(o => o.status !== 'cancelled').length} orders</span>
            </span>
          </div>

          {/* Step 2: Auto-Deduction Commission */}
          <div className="p-3.5 bg-amber-500/10 rounded-2xl border border-amber-400/30 flex flex-col justify-between hover:bg-amber-500/15 transition">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block mb-0.5 flex items-center justify-between">
                <span>2. Auto Commission</span>
                <span className="text-[9px] font-black bg-amber-400/20 px-1.5 py-0.2 rounded">-{commissionRate}%</span>
              </span>
              <div className="text-lg font-black text-amber-300 font-mono">
                -₹{totalCommissionAllTime.toLocaleString('en-IN')}
              </div>
            </div>
            <span className="text-[10px] text-amber-200/80 mt-1 flex items-center justify-between">
              <span>Auto-debited fee</span>
              <span className="font-bold text-amber-300">Automated</span>
            </span>
          </div>

          {/* Step 3: Net Lifetime Earnings */}
          <div className="p-3.5 bg-emerald-500/10 rounded-2xl border border-emerald-400/30 flex flex-col justify-between hover:bg-emerald-500/15 transition">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block mb-0.5 flex items-center justify-between">
                <span>3. Net Vendor Earnings</span>
                <span className="text-[9px] font-black bg-emerald-400/20 px-1.5 py-0.2 rounded">{100 - commissionRate}% Net</span>
              </span>
              <div className="text-lg font-black text-emerald-400 font-mono">
                ₹{netEarningsLifetime.toLocaleString('en-IN')}
              </div>
            </div>
            <span className="text-[10px] text-emerald-300/80 mt-1 flex items-center justify-between">
              <span>Gross minus commission</span>
              <span className="font-bold text-emerald-400">Retained</span>
            </span>
          </div>

          {/* Step 4: Bank Disbursed */}
          <div className="p-3.5 bg-blue-500/10 rounded-2xl border border-blue-400/30 flex flex-col justify-between hover:bg-blue-500/15 transition">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block mb-0.5 flex items-center justify-between">
                <span>4. Bank Disbursed</span>
                <span className="text-[9px] font-black bg-blue-400/20 px-1.5 py-0.2 rounded">{settledCount} Settled</span>
              </span>
              <div className="text-lg font-black text-blue-300 font-mono">
                -₹{settledPayouts.toLocaleString('en-IN')}
              </div>
            </div>
            <span className="text-[10px] text-blue-200/80 mt-1 flex items-center justify-between">
              <span>Transferred to bank</span>
              <span className="font-bold text-blue-300">NEFT / IMPS</span>
            </span>
          </div>

          {/* Step 5: Net Available for Payout */}
          <div className="p-3.5 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl border border-emerald-400/50 shadow-md flex flex-col justify-between hover:from-emerald-500 hover:to-teal-500 transition">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-100 block mb-0.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-200" />
                  <span>5. Net Available</span>
                </span>
                <span className="text-[9px] font-black bg-white/20 text-white px-1.5 py-0.2 rounded">100% Net</span>
              </span>
              <div className="text-lg font-black text-white font-mono">
                ₹{availablePayout.toLocaleString('en-IN')}
              </div>
            </div>
            <span className="text-[10px] text-emerald-100 font-bold mt-1 flex items-center justify-between">
              <span>Ready for withdrawal</span>
              <button
                type="button"
                onClick={onRequestPayoutOpen}
                className="underline hover:text-white transition font-black"
              >
                Disburse →
              </button>
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Commission Auto-Deduction Simulator / Calculator (Collapsible) */}
      {showCalculator && (
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-50/50 to-emerald-500/10 rounded-3xl p-5 border-2 border-amber-400/40 shadow-md space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
                <Calculator className="w-4 h-4" />
              </span>
              <div>
                <h4 className="font-heading font-black text-sm text-slate-900">
                  Live Commission Auto-Deduction Calculator & Simulator
                </h4>
                <p className="text-xs text-slate-600">
                  Enter any customer order bill to preview how platform commission is automatically deducted and how net earnings are calculated.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowCalculator(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              aria-label="Close calculator"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Input & Quick Chips */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Sample Customer Food Bill (₹):
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  min="50"
                  max="50000"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Number(e.target.value) || 0)}
                  placeholder="Enter sample amount"
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-emerald-500"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 font-bold">Quick Sample:</span>
                {[300, 500, 1000, 2500, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCalcAmount(amt)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono transition ${
                      calcAmount === amt
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Math Preview */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="bg-white p-3 rounded-2xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">1. Gross Food GMV</span>
                <span className="text-base font-black font-mono text-slate-900 block mt-0.5">
                  ₹{simGross.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-500">Customer Bill</span>
              </div>

              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200">
                <span className="text-[10px] uppercase font-bold text-amber-700 block flex items-center justify-between">
                  <span>2. Auto Comm ({commissionRate}%)</span>
                  <span className="text-[9px] bg-amber-200 text-amber-900 px-1 py-0.2 rounded font-black">Deducted</span>
                </span>
                <span className="text-base font-black font-mono text-amber-800 block mt-0.5">
                  -₹{simCommission.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-amber-700">Platform Service Fee</span>
              </div>

              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-300">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block flex items-center justify-between">
                  <span>3. Net Vendor Credit</span>
                  <span className="text-[9px] bg-emerald-200 text-emerald-900 px-1 py-0.2 rounded font-black">Take-Home</span>
                </span>
                <span className="text-base font-black font-mono text-emerald-700 block mt-0.5">
                  ₹{simNet.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-emerald-700 font-bold">100% Withdrawable</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-white/80 rounded-2xl border border-amber-200/80 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Zero Manual Reconciliation:</strong> On order completion, ₹{simNet.toLocaleString('en-IN')} is immediately added to your Available Net Payout balance.
              </span>
            </span>

            {onSimulateOrder && (
              <button
                type="button"
                onClick={onSimulateOrder}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1 shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulate Live Incoming Order</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Time Period Filter Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold text-slate-700">Filter Earnings Period:</span>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold gap-1 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setTimeFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              timeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>All Time (Lifetime)</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-mono">
              {restaurantOrders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTimeFilter('today')}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              timeFilter === 'today'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {todayOrders.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
            <span>Today</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
              timeFilter === 'today' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {todayOrders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTimeFilter('week')}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              timeFilter === 'week'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Last 7 Days</span>
          </button>

          <button
            type="button"
            onClick={() => setTimeFilter('month')}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              timeFilter === 'month'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>This Month</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Gross Food Earnings */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider">
                {timeFilter === 'all' ? 'Gross Food Sales' : `${timeFilter.toUpperCase()} Gross Sales`}
              </span>
              <Receipt className="w-4 h-4 text-slate-500" />
            </div>
            <p className="text-2xl font-black font-heading text-slate-900 font-mono">
              ₹{(timeFilter === 'all' ? totalGrossSalesAllTime : periodGrossSales).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Customer order bill</span>
            <span className="font-mono text-slate-600 font-bold">
              {timeFilter === 'all' ? restaurantOrders.filter(o => o.status !== 'cancelled').length : periodNonCancelledCount} orders
            </span>
          </div>
        </div>

        {/* 2. Auto-Deducted Commission */}
        <div className="bg-amber-50/60 p-5 rounded-3xl border border-amber-200/80 shadow-2xs hover:border-amber-300 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-amber-700 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider">
                {timeFilter === 'all' ? 'Auto Commission' : `${timeFilter.toUpperCase()} Commission`}
              </span>
              <span className="text-[10px] font-black bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded-md">
                -{commissionRate}%
              </span>
            </div>
            <p className="text-2xl font-black font-heading text-amber-700 font-mono">
              -₹{(timeFilter === 'all' ? totalCommissionAllTime : periodCommissionDeducted).toLocaleString('en-IN')}
            </p>
          </div>
          <p className="text-[11px] text-amber-800/80 mt-2 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            Auto-deducted from gross
          </p>
        </div>

        {/* 3. Net Period / Lifetime Earnings */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider">
                {timeFilter === 'all' ? 'Net Lifetime Earnings' : `${timeFilter.toUpperCase()} Net Earnings`}
              </span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black font-heading text-emerald-700 font-mono">
              ₹{(timeFilter === 'all' ? netEarningsLifetime : periodNetEarnings).toLocaleString('en-IN')}
            </p>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span className="text-emerald-700 font-bold">After {commissionRate}% commission</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-black">
              {100 - commissionRate}% Net
            </span>
          </p>
        </div>

        {/* 4. Settled to Bank */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider">Settled to Bank</span>
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black font-heading text-blue-700 font-mono">
              ₹{settledPayouts.toLocaleString('en-IN')}
            </p>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {settledCount} transfer{settledCount === 1 ? '' : 's'} completed
          </p>
        </div>

        {/* 5. Available Net for Payout */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-5 rounded-3xl text-white shadow-md relative overflow-hidden group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-emerald-100 mb-1">
              <span className="text-[10px] uppercase font-black tracking-wider">Available Net Payout</span>
              <span className="w-2 h-2 rounded-full bg-emerald-200 animate-pulse" />
            </div>
            <p className="text-2xl font-black font-heading text-white font-mono">
              ₹{availablePayout.toLocaleString('en-IN')}
            </p>
          </div>
          <button
            onClick={onRequestPayoutOpen}
            className="mt-2 w-full py-2 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 backdrop-blur-xs active:scale-95 shadow-2xs"
          >
            <span>Request Payout</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: Settlement History (Left/Center) & KYC Bank Info (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Payout Requests & Disbursements Ledger (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-5">
            {/* Header & Status Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-heading font-black text-lg text-slate-900">
                    Payout Requests & History
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time status of your bank settlements and treasury dispatches
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold gap-1">
                <button
                  onClick={() => setPayoutStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    payoutStatusFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All ({myPayoutRequests.length})
                </button>
                <button
                  onClick={() => setPayoutStatusFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                    payoutStatusFilter === 'pending'
                      ? 'bg-white text-amber-700 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>Pending</span>
                  {pendingCount > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  )}
                  <span>({pendingCount})</span>
                </button>
                <button
                  onClick={() => setPayoutStatusFilter('settled')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    payoutStatusFilter === 'settled'
                      ? 'bg-white text-emerald-700 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Settled ({settledCount})
                </button>
                <button
                  onClick={() => setPayoutStatusFilter('rejected')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    payoutStatusFilter === 'rejected'
                      ? 'bg-white text-rose-700 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Rejected ({rejectedCount})
                </button>
              </div>
            </div>

            {/* Payout List */}
            {displayedPayouts.length === 0 ? (
              <div className="py-12 text-center space-y-3 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 p-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Landmark className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-700">No Payout Requests Found</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {payoutStatusFilter === 'all'
                      ? 'You have not submitted any payout requests yet. Click "Request Payout" above to disburse your available balance.'
                      : `No payout requests currently match the "${payoutStatusFilter}" status filter.`}
                  </p>
                </div>
                {availablePayout > 0 && (
                  <button
                    onClick={onRequestPayoutOpen}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition"
                  >
                    Request Payout Now
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {displayedPayouts.map((payout) => {
                  const isPending = payout.status === 'pending';
                  const isSettled = payout.status === 'settled';
                  const isRejected = payout.status === 'rejected';

                  return (
                    <div
                      key={payout.id}
                      className="p-4 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 transition space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              isSettled
                                ? 'bg-emerald-100 text-emerald-700'
                                : isPending
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {payout.payoutMethod === 'upi' ? (
                              <Smartphone className="w-5 h-5" />
                            ) : (
                              <Building2 className="w-5 h-5" />
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-slate-900 text-sm">
                                #{payout.id}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400">
                                {payout.requestedAt}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5 font-medium">
                              {payout.bankOrUpiDetails}
                            </p>
                          </div>
                        </div>

                        {/* Amount & Status Badge */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-lg font-black font-heading text-slate-900">
                              ₹{payout.amount.toLocaleString('en-IN')}
                            </span>
                            <div className="text-[10px] text-slate-400">
                              {payout.payoutMethod === 'upi' ? 'UPI Transfer' : 'Bank NEFT/IMPS'}
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-xl flex items-center gap-1 ${
                              isSettled
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : isPending
                                ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {isSettled ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Settled ✓</span>
                              </>
                            ) : isPending ? (
                              <>
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                <span>In Review</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                <span>Rejected</span>
                              </>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Footer Info / References / Cancel Action */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/70 text-xs text-slate-500">
                        <div className="flex items-center gap-3">
                          {payout.referenceId && (
                            <span className="font-mono text-[11px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                              Bank Ref: <strong>{payout.referenceId}</strong>
                            </span>
                          )}
                          {payout.processedAt && (
                            <span className="text-[11px] text-slate-400">
                              Processed: {payout.processedAt}
                            </span>
                          )}
                          {payout.rejectionReason && (
                            <span className="text-[11px] text-rose-600 font-medium">
                              Reason: {payout.rejectionReason}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Receipt view button */}
                          <button
                            onClick={() => setSelectedReceipt(payout)}
                            className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 font-bold text-[11px] rounded-lg border border-slate-200 transition flex items-center gap-1"
                          >
                            <Receipt className="w-3 h-3 text-emerald-600" />
                            <span>View Slip</span>
                          </button>

                          {/* Cancel pending payout request button */}
                          {isPending && (
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    `Cancel pending payout request #${payout.id} for ₹${payout.amount}? Funds will immediately return to your available balance.`
                                  )
                                ) {
                                  onCancelPayout(payout.id);
                                }
                              }}
                              className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] rounded-lg border border-rose-200 transition flex items-center gap-1"
                            >
                              <X className="w-3 h-3" />
                              <span>Cancel Request</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Verified Settlement Bank Account (1 col) */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-heading font-black text-sm text-slate-900">
                  Settlement Bank Account
                </h3>
              </div>
              <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified KYC
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white space-y-3 shadow-md relative overflow-hidden">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] uppercase font-bold tracking-wider">
                    Commercial Direct Debit
                  </span>
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Account Number</div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold tracking-wider">
                      {showFullAccount
                        ? kycBank?.accountNumber || '389100291823'
                        : `•••• •••• •••• ${(kycBank?.accountNumber || '1823').slice(-4)}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowFullAccount(!showFullAccount)}
                      className="p-1 text-slate-400 hover:text-white transition"
                      title={showFullAccount ? 'Hide account digits' : 'Show full account digits'}
                    >
                      {showFullAccount ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-700/60 text-[11px]">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Bank Name</span>
                    <span className="font-bold text-slate-100 truncate block">
                      {kycBank?.bankName || 'HDFC Bank'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">IFSC Code</span>
                    <span className="font-mono font-bold text-emerald-400 block">
                      {kycBank?.ifscCode || 'HDFC0001234'}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] pt-1 border-t border-slate-700/60">
                  <span className="text-slate-400 text-[10px] block">Beneficiary / Entity</span>
                  <span className="font-bold text-slate-100">
                    {kycBank?.accountHolderName || restaurant.ownerName || restaurant.name}
                  </span>
                </div>
              </div>

              {/* Informative Security Callout */}
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-[11px] text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1 text-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Statutory KYC Protection</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Payout requests are validated against this verified commercial account registered during FSSAI onboarding.
                </p>
              </div>

              {onNavigateToKyc && (
                <button
                  onClick={onNavigateToKyc}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Inspect KYC & Compliance Documents</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Itemized Order Earnings Ledger */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-600" />
              <h3 className="font-heading font-black text-lg text-slate-900">
                Itemized Order Earnings & Commission Ledger
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live breakdown of customer food bills, platform commission auto-deductions, and credited net earnings
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Box */}
            <div className="relative min-w-[200px] sm:min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchOrderQuery}
                onChange={(e) => setSearchOrderQuery(e.target.value)}
                placeholder="Search Order ID or item..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-emerald-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold gap-1">
              <button
                type="button"
                onClick={() => setOrderStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  orderStatusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All Status
              </button>
              <button
                type="button"
                onClick={() => setOrderStatusFilter('delivered')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  orderStatusFilter === 'delivered'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Delivered
              </button>
              <button
                type="button"
                onClick={() => setOrderStatusFilter('in_kitchen')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  orderStatusFilter === 'in_kitchen'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                In Kitchen
              </button>
              <button
                type="button"
                onClick={() => setOrderStatusFilter('cancelled')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  orderStatusFilter === 'cancelled'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Cancelled
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsStatementModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-2xs transition flex items-center gap-1.5 active:scale-95"
              title="Download Statement of Account (Excel / PDF)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Statement Reports</span>
            </button>
          </div>
        </div>

        {/* Ledger Summary Stats Bar */}
        {ledgerOrders.length > 0 && (
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-600 font-medium">
              Showing <strong>{ledgerOrders.length}</strong> order{ledgerOrders.length === 1 ? '' : 's'} ({timeFilter.toUpperCase()} period)
            </span>
            <div className="flex items-center gap-4 text-xs font-mono font-bold flex-wrap">
              <span>
                Gross: <strong className="text-slate-900">₹{ledgerGrossTotal.toLocaleString('en-IN')}</strong>
              </span>
              <span className="text-amber-700">
                Auto Comm: <strong>-₹{ledgerCommissionTotal.toLocaleString('en-IN')}</strong>
              </span>
              <span className="text-emerald-700">
                Net Credits: <strong>+₹{ledgerNetTotal.toLocaleString('en-IN')}</strong>
              </span>
            </div>
          </div>
        )}

        {ledgerOrders.length === 0 ? (
          <div className="py-12 text-center space-y-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-6">
            <Receipt className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-700">No Orders in Ledger</p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Completed food orders will appear here with transparent item-level earnings and auto-deducted commissions.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-black tracking-wider">
                  <th className="py-3 px-3">Order ID & Date</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Dishes Summary</th>
                  <th className="py-3 px-3 text-right">Gross Total (₹)</th>
                  <th className="py-3 px-3 text-right">Auto Commission ({commissionRate}%)</th>
                  <th className="py-3 px-3 text-right">Net Vendor Credit (₹)</th>
                  <th className="py-3 px-3 text-center">Settlement Status</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {ledgerOrders.map((order) => {
                  const grossOrderVal = order.itemTotal || 0;
                  const isCancelled = order.status === 'cancelled';
                  const isDelivered = order.status === 'delivered';
                  const orderCommVal = isCancelled ? 0 : Math.round((grossOrderVal * commissionRate) / 100);
                  const netCreditVal = isCancelled ? 0 : Math.max(0, grossOrderVal - orderCommVal);

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-slate-900">#{order.id}</div>
                        <div className="text-[10px] text-slate-400">
                          {order.paymentCollectedAt || (order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent')}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{order.customerName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {order.paymentMethod?.toUpperCase()}
                        </div>
                      </td>

                      <td className="py-3 px-3 max-w-xs">
                        <div className="truncate text-slate-600 font-normal">
                          {order.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-slate-900 font-mono">
                        ₹{grossOrderVal.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-amber-700">
                        {isCancelled ? (
                          <span className="text-slate-400">₹0</span>
                        ) : (
                          <>
                            <div className="font-bold">-₹{orderCommVal.toLocaleString('en-IN')}</div>
                            <div className="text-[9px] text-amber-800/80 font-sans">
                              {commissionRate}% auto-deducted
                            </div>
                          </>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right font-black text-emerald-700 font-mono text-sm">
                        ₹{netCreditVal.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            isDelivered
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : isCancelled
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {isDelivered
                            ? 'Credited to Net Available'
                            : isCancelled
                            ? 'Cancelled (₹0 Net)'
                            : 'Pending Delivery'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedOrderSlip(order)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold text-[11px] rounded-lg transition border border-slate-200 flex items-center gap-1 mx-auto"
                          title="View order commission & net breakdown"
                        >
                          <Receipt className="w-3 h-3 text-emerald-600" />
                          <span>Slip</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Commission Breakdown Slip Modal */}
      {selectedOrderSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative overflow-hidden space-y-4">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500" />

            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-heading font-black text-base text-slate-900">
                    Order Commission & Net Settlement Slip
                  </h3>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    Order #{selectedOrderSlip.id}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderSlip(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Customer Name:</span>
                <span className="font-bold text-slate-900">{selectedOrderSlip.customerName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Payment Channel:</span>
                <span className="font-mono font-bold text-slate-800 uppercase">
                  {selectedOrderSlip.paymentMethod} ({selectedOrderSlip.paymentStatus})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Delivery Status:</span>
                <span className="font-black uppercase text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  {selectedOrderSlip.status}
                </span>
              </div>

              {/* Dishes list */}
              <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Ordered Dishes Breakdown
                </span>
                {selectedOrderSlip.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center text-slate-700">
                    <span>
                      {it.quantity}x {it.name}
                    </span>
                    <span className="font-mono font-bold">₹{it.price * it.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Financial math */}
              {(() => {
                const grossVal = selectedOrderSlip.itemTotal || 0;
                const isCancelled = selectedOrderSlip.status === 'cancelled';
                const commVal = isCancelled ? 0 : Math.round((grossVal * commissionRate) / 100);
                const netVal = isCancelled ? 0 : Math.max(0, grossVal - commVal);

                return (
                  <div className="pt-2 border-t border-slate-200/80 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Gross Food GMV:</span>
                      <span className="font-mono font-bold text-slate-900">₹{grossVal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center text-amber-700">
                      <span>Platform Commission Auto-Deducted ({commissionRate}%):</span>
                      <span className="font-mono font-bold">-₹{commVal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1.5 border-t border-slate-200 font-black text-sm text-emerald-700">
                      <span>Net Vendor Credit Credited:</span>
                      <span className="font-mono text-base">₹{netVal.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-[11px] text-emerald-900 space-y-1">
              <div className="font-bold flex items-center gap-1 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Auto-Credited to Available Net Balance</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Commercial commission has been automatically debited upon delivery. Net vendor credit is immediately reflected in your available withdrawal balance with zero delay.
              </p>
            </div>

            <div className="pt-1 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedOrderSlip(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Close Slip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payout Transaction Slip Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative overflow-hidden space-y-4">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-600 to-teal-500" />

            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <h3 className="font-heading font-black text-base text-slate-900">
                  Payout Disbursement Slip
                </h3>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction Ref:</span>
                <span className="font-mono font-black text-slate-900">#{selectedReceipt.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Outlet Name:</span>
                <span className="font-bold text-slate-900">{selectedReceipt.recipientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Requested:</span>
                <span className="font-mono font-black text-emerald-700 text-sm">
                  ₹{selectedReceipt.amount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Disbursement Status:</span>
                <span
                  className={`font-black uppercase text-[10px] px-2 py-0.5 rounded-md ${
                    selectedReceipt.status === 'settled'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedReceipt.status === 'pending'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {selectedReceipt.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Channel / Account:</span>
                <span className="font-mono font-medium text-slate-800">
                  {selectedReceipt.bankOrUpiDetails}
                </span>
              </div>
              {selectedReceipt.referenceId && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Bank UTR / NEFT:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {selectedReceipt.referenceId}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Timestamp:</span>
                <span className="text-slate-700">{selectedReceipt.requestedAt}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statement of Account & Payout Reports Modal */}
      <StatementReportModal
        isOpen={isStatementModalOpen}
        onClose={() => setIsStatementModalOpen(false)}
        orders={orders}
        payoutRequests={payoutRequests}
        restaurants={[restaurant]}
        deliveryPartners={[]}
        initialEntityType="restaurant"
        initialEntityId={restaurant.id}
        lockEntityType={true}
        lockEntityId={true}
      />
    </div>
  );
};
