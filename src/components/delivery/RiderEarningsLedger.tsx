import React, { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  Heart,
  Banknote,
  ArrowDownRight,
  ArrowUpRight,
  History,
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
  ShieldCheck,
  Zap,
  Filter,
  DollarSign,
  Building2,
  Smartphone,
  ChevronRight,
  AlertCircle,
  RotateCcw,
  FileText,
  Download,
} from 'lucide-react';
import {
  DeliveryPartner,
  DeliveryWalletTransaction,
  PayoutRequest,
  Order,
} from '../../types';
import { StatementReportModal } from '../common/StatementReportModal';

interface RiderEarningsLedgerProps {
  rider: DeliveryPartner;
  transactions: DeliveryWalletTransaction[];
  payoutRequests: PayoutRequest[];
  completedOrders: Order[];
  onOpenPayoutModal: () => void;
  onCancelPayoutRequest: (payoutId: string) => void;
  onOpenRazorpayDepositModal: () => void;
}

export const RiderEarningsLedger: React.FC<RiderEarningsLedgerProps> = ({
  rider,
  transactions,
  payoutRequests,
  completedOrders,
  onOpenPayoutModal,
  onCancelPayoutRequest,
  onOpenRazorpayDepositModal,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'credits' | 'cod' | 'payouts'>('all');
  const [showCodInfo, setShowCodInfo] = useState(false);
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);

  // Filter transactions for this specific rider
  const riderTransactions = transactions.filter((t) => t.riderId === rider.id);
  const riderPayouts = payoutRequests.filter((p) => p.recipientId === rider.id);

  // Filter based on selected tab
  const filteredTransactions = riderTransactions.filter((t) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'credits') {
      return (
        t.type === 'trip_earning' ||
        t.type === 'customer_tip' ||
        t.type === 'bonus' ||
        t.type === 'floating_cash_deposit'
      );
    }
    if (activeFilter === 'cod') {
      return t.type === 'cod_cash_deduction' || t.type === 'floating_cash_deposit';
    }
    if (activeFilter === 'payouts') {
      return t.type === 'payout_withdrawal' || t.type === 'payout_refund';
    }
    return true;
  });

  // Calculate high-level financial totals
  const totalTripEarnings = riderTransactions
    .filter((t) => t.type === 'trip_earning' || t.type === 'bonus')
    .reduce((sum, t) => sum + Math.max(0, t.amount), 0);

  const totalTips = riderTransactions
    .filter((t) => t.type === 'customer_tip')
    .reduce((sum, t) => sum + Math.max(0, t.amount), 0);

  const totalCodDeducted = Math.abs(
    riderTransactions
      .filter((t) => t.type === 'cod_cash_deduction')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const currentCashHeld = rider.totalCashCollected || 0;
  const floatingCashLimit = rider.floatingCashLimit || 1000;
  const isOverCashLimit = currentCashHeld >= floatingCashLimit;
  const excessCashToClear = Math.max(0, currentCashHeld - floatingCashLimit);
  const cashLimitUsagePercent = Math.min(
    100,
    Math.round((currentCashHeld / floatingCashLimit) * 100)
  );

  // Total Earnings in Delivery Partner's Wallet (Sum of all trip delivery fees + customer tips)
  const totalEarnings =
    typeof rider.totalEarnings === 'number' && rider.totalEarnings > 0
      ? rider.totalEarnings
      : Math.max(0, totalTripEarnings + totalTips);

  // Formula: available withdrawal balance is total earnings - cash in hand = withdraw available balance
  const withdrawAvailableBalance = Math.max(
    0,
    rider.walletBalance ?? (totalEarnings - currentCashHeld)
  );

  const totalPayoutsDisbursed = riderPayouts
    .filter((p) => p.status === 'settled' || p.status === 'approved')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Wallet className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-heading font-black text-slate-900">
                Partner Earnings & Financial Ledger
              </h2>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                Formula Reconciled
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live breakdown of delivery fees, customer tips, Cash on Delivery in hand, and withdrawable balance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsStatementModalOpen(true)}
            className="px-4 py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl font-black text-xs transition active:scale-95 shadow-xs flex items-center gap-2"
            title="Download Statement of Account & Payout Report (Daily, Weekly, Monthly Excel / PDF)"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Download Statement</span>
          </button>

          <button
            type="button"
            onClick={onOpenRazorpayDepositModal}
            className={`px-4 py-3 rounded-xl font-black text-xs transition active:scale-95 shadow-md flex items-center gap-2 ${
              isOverCashLimit
                ? 'bg-rose-600 hover:bg-rose-500 text-white ring-2 ring-rose-400/50 animate-pulse'
                : 'bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white'
            }`}
          >
            <Banknote className="w-4 h-4 text-amber-300" />
            <span>
              {isOverCashLimit
                ? `Clear Excess Cash (₹${excessCashToClear}) via Payment Gateway`
                : 'Deposit Floating Cash (Payment Gateway)'}
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenPayoutModal}
            disabled={withdrawAvailableBalance <= 0}
            className="px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-md transition active:scale-95 disabled:opacity-40 flex items-center gap-2"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>Request Payout</span>
          </button>
        </div>
      </div>

      {/* Prominent Formula Reconciliation Banner: Total Earnings - Cash in Hand = Withdraw Available Balance */}
      <div className="bg-gradient-to-br from-blue-950 via-indigo-900 to-slate-900 p-5 sm:p-6 rounded-3xl text-white shadow-xl border border-blue-800/60 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                Wallet Balance Formula
              </span>
              <span className="text-xs text-blue-200">Real-Time Ledger Math</span>
            </div>
            <h3 className="text-lg font-heading font-black text-white mt-1">
              Total Earnings — Cash in Hand = Withdraw Available Balance
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCodInfo(!showCodInfo)}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-300" />
              <span>{showCodInfo ? 'Hide Formula Guide' : 'Formula Explainer'}</span>
            </button>
          </div>
        </div>

        {/* 3-Part Interactive Formula Row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
          {/* Box 1: Total Earnings in Wallet */}
          <div className="md:col-span-2 bg-white/10 rounded-2xl p-4 border border-white/10 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-200">
                1. Total Earnings in Wallet
              </span>
              <span className="text-[9px] bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-md font-bold">
                Wallet Credited
              </span>
            </div>
            <div className="text-3xl font-black font-heading mt-1 text-white">
              ₹{totalEarnings}
            </div>
            <p className="text-[11px] text-blue-200 mt-1">
              Trip Fees (₹{totalTripEarnings}) + Tips (₹{totalTips}) added upon delivery
            </p>
          </div>

          {/* Minus Operator */}
          <div className="text-center font-black text-2xl text-amber-300 md:col-span-1 flex md:flex-col items-center justify-center gap-1 py-1">
            <span className="text-[10px] font-bold uppercase text-amber-200 tracking-wider">MINUS</span>
            <span className="text-3xl font-black leading-none bg-amber-400/20 text-amber-300 w-10 h-10 rounded-xl flex items-center justify-center">−</span>
          </div>

          {/* Box 2: Cash in Hand Option */}
          <div className="md:col-span-2 bg-amber-500/15 rounded-2xl p-4 border border-amber-400/30 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                2. Cash in Hand Option
              </span>
              <span className="text-[9px] bg-amber-400/20 text-amber-200 px-2 py-0.5 rounded-md font-bold">
                COD Collected
              </span>
            </div>
            <div className="text-3xl font-black font-heading mt-1 text-amber-300">
              ₹{currentCashHeld}
            </div>
            <p className="text-[11px] text-amber-200 mt-1">
              Physical COD cash held at doorstep (Limit: ₹{floatingCashLimit})
            </p>
          </div>
        </div>

        {/* Equals Result Box */}
        <div className="mt-4 pt-4 border-t border-white/10 bg-emerald-500/10 rounded-2xl p-4 border border-emerald-400/25 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="w-10 h-10 rounded-xl bg-emerald-500/30 text-emerald-300 flex items-center justify-center font-black text-xl">
              =
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 block">
                  Earnings Withdrawable Balance
                </span>
                <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.2 rounded">
                  Earnings Only Access
                </span>
              </div>
              <div className="text-3xl font-black font-heading text-emerald-300 mt-0.5">
                ₹{withdrawAvailableBalance}
              </div>
              <p className="text-[11px] text-emerald-200 mt-0.5">
                Verified delivery fees & tips ready for payout (Cash-in-hand is non-withdrawable)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenPayoutModal}
              disabled={withdrawAvailableBalance <= 0}
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              title={
                withdrawAvailableBalance > 0
                  ? `Withdraw ₹${withdrawAvailableBalance} delivery earnings`
                  : 'Withdrawal access locked: Only positive delivery earnings can be withdrawn'
              }
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>
                {withdrawAvailableBalance > 0
                  ? `Withdraw ₹${withdrawAvailableBalance} from Earnings`
                  : 'Withdrawal Locked (₹0 Earnings)'}
              </span>
            </button>
          </div>
        </div>

        {/* Informative Formula Guide */}
        {showCodInfo && (
          <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2 text-xs text-blue-100 animate-in fade-in">
            <p className="font-black text-white text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Transparent Delivery Partner Wallet & Cash in Hand Accounting:</span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-slate-200">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-1">
                <span className="text-white font-bold block">1. Total Earnings</span>
                <p className="text-[11px] text-slate-300">
                  Whenever you complete a delivery, both the delivery fee (₹50-₹85) and customer tips are added directly to your Total Earnings in wallet.
                </p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-1">
                <span className="text-amber-300 font-bold block">2. Cash in Hand Option</span>
                <p className="text-[11px] text-slate-300">
                  On Cash on Delivery (COD) orders, you collect physical paper cash from the customer. This cash is recorded in your Cash in Hand Option.
                </p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-1">
                <span className="text-emerald-300 font-bold block">3. Withdraw Available</span>
                <p className="text-[11px] text-slate-300">
                  <strong>Total Earnings - Cash in Hand = Withdraw Available Balance</strong>. Because you already hold COD money in your hand, you withdraw the remaining net earnings digitally.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4 Hero Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Withdraw Available Balance */}
        <div className="bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 rounded-3xl p-5 text-white shadow-lg space-y-3 relative overflow-hidden border border-emerald-800/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-200">
              Earnings Withdrawable
            </span>
            <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
              Earnings Only
            </span>
          </div>
          <div>
            <div className="text-3xl font-black font-heading tracking-tight text-emerald-300">
              ₹{withdrawAvailableBalance}
            </div>
            <p className="text-[11px] text-emerald-200 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Earnings (₹{totalEarnings}) - Cash ({currentCashHeld})</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenPayoutModal}
            disabled={withdrawAvailableBalance <= 0}
            className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {withdrawAvailableBalance > 0 ? 'Withdraw to UPI / Bank →' : 'Withdrawal Locked (₹0)'}
          </button>
        </div>

        {/* 2. Total Earnings in Wallet */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Total Earnings (in Wallet)
            </span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-black font-heading text-slate-900">
              ₹{totalEarnings}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              ₹{totalTripEarnings} Trip Fees + ₹{totalTips} Tips
            </p>
          </div>
          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg inline-block">
            From {rider.totalTrips || completedOrders.length} completed trips
          </span>
        </div>

        {/* 3. Cash in Hand (Cash Collected Option) */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">
              Cash in Hand Option
            </span>
            <span className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
              <Banknote className="w-4 h-4" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-black font-heading text-amber-950 flex items-center gap-1.5">
              <span>₹{currentCashHeld}</span>
              <span className="text-xs font-bold text-amber-700 font-sans">in hand</span>
            </div>
            <p className="text-[11px] text-amber-800 mt-1">
              Physical COD cash collected from customers
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenRazorpayDepositModal}
            className="text-[10px] font-black text-amber-900 hover:text-amber-950 underline flex items-center gap-1"
          >
            <Banknote className="w-3 h-3" />
            <span>Deposit cash dues via Payment Gateway →</span>
          </button>
        </div>

        {/* 4. Customer Tips & Payouts */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Settled Payouts & Tips
            </span>
            <span className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Heart className="w-4 h-4 fill-rose-600/20" />
            </span>
          </div>
          <div>
            <div className="text-2xl font-black font-heading text-slate-900">
              ₹{totalPayoutsDisbursed}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Disbursed to Bank/UPI • Tips Earned: ₹{totalTips}
            </p>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg inline-block">
            {riderPayouts.filter((p) => p.status === 'settled' || p.status === 'approved').length} Successful Payouts
          </span>
        </div>
      </div>

      {/* Floating Cash Limit & Payment Gateway Clearance Section */}
      <div
        className={`border-2 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs transition ${
          isOverCashLimit
            ? 'bg-rose-50/90 border-rose-400 ring-2 ring-rose-400/20'
            : 'bg-amber-50/90 border-amber-300'
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span
              className={`p-3 rounded-2xl shrink-0 shadow-xs text-white ${
                isOverCashLimit ? 'bg-rose-600' : 'bg-amber-500'
              }`}
            >
              <Banknote className="w-6 h-6 stroke-[2.5]" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-heading font-black text-base text-slate-900">
                  Floating Cash Holding Limit (Maximum ₹{floatingCashLimit})
                </h4>
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    isOverCashLimit
                      ? 'bg-rose-200 text-rose-950 border-rose-300 animate-pulse'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  }`}
                >
                  {isOverCashLimit
                    ? '🚨 Cash Orders Assignment Stopped'
                    : '✓ Cash Orders Active'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Delivery partners have a strict cash holding limit of <strong>₹{floatingCashLimit}</strong>. 
                Exceeding this limit stops new cash orders from being assigned to you. 
                You can clear or deposit excess cash back to Likart anytime by paying your dues through <strong>Razorpay Payment Gateway</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenRazorpayDepositModal}
              className={`px-4 py-2.5 rounded-xl font-black text-xs shadow-md transition active:scale-95 flex items-center gap-2 ${
                isOverCashLimit
                  ? 'bg-rose-600 hover:bg-rose-500 text-white ring-2 ring-rose-400/40'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>
                {isOverCashLimit
                  ? `Clear Excess (₹${excessCashToClear}) via Razorpay`
                  : 'Deposit Cash via Razorpay'}
              </span>
            </button>
          </div>
        </div>

        {/* Floating Cash Threshold Progress Meter */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-slate-900 font-black text-sm">
                Cash in Hand: ₹{currentCashHeld}
              </span>
              {isOverCashLimit && (
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  Exceeded by +₹{excessCashToClear}
                </span>
              )}
            </div>
            <span className="text-slate-500 font-mono text-[11px]">
              Max Cash Limit: ₹{floatingCashLimit}
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/60">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverCashLimit
                  ? 'bg-rose-600'
                  : cashLimitUsagePercent > 75
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, cashLimitUsagePercent)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-2 pt-0.5">
            <p>
              {isOverCashLimit ? (
                <span className="font-bold text-rose-700">
                  ⛔ New COD orders are blocked. Deposit ₹{excessCashToClear} via Payment Gateway to instantly reactivate cash orders. Prepaid orders remain active.
                </span>
              ) : (
                <span className="font-medium text-emerald-800">
                  ✓ Buffer remaining: <strong>₹{floatingCashLimit - currentCashHeld}</strong>. You can safely accept both Cash on Delivery and Prepaid orders.
                </span>
              )}
            </p>
            <button
              type="button"
              onClick={onOpenRazorpayDepositModal}
              className="text-[11px] font-black text-blue-700 hover:text-blue-900 underline flex items-center gap-1"
            >
              <span>Pay Dues via Payment Gateway →</span>
            </button>
          </div>
        </div>
      </div>

      {/* Payout Requests History Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Building2 className="w-4 h-4" />
            </span>
            <h3 className="text-base font-black font-heading text-slate-900">
              Payout Requests & Bank/UPI Transfers ({riderPayouts.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={onOpenPayoutModal}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 underline"
          >
            + New Payout Request
          </button>
        </div>

        {riderPayouts.length === 0 ? (
          <div className="py-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6 space-y-2">
            <DollarSign className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-bold text-slate-600">No Payout Requests Yet</p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Whenever you wish to transfer your delivery earnings into your bank account or UPI ID, use the Request Payout button.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {riderPayouts.map((p) => (
              <div
                key={p.id}
                className="p-4 bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 transition"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                      p.status === 'settled'
                        ? 'bg-emerald-100 text-emerald-700'
                        : p.status === 'pending'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {p.status === 'settled' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : p.status === 'pending' ? (
                      <Clock className="w-5 h-5 text-amber-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs text-slate-900 font-mono">
                        #{p.id}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          p.status === 'settled'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : p.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {p.status === 'settled'
                          ? 'Settled / Transferred ✓'
                          : p.status === 'pending'
                          ? 'Pending Processing'
                          : 'Rejected / Refunded'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {p.bankOrUpiDetails} • Requested {p.requestedAt}
                    </p>
                    {p.referenceId && (
                      <p className="text-[10px] font-mono text-emerald-700 mt-0.5">
                        Bank UTR / Ref: {p.referenceId}
                      </p>
                    )}
                    {p.rejectionReason && (
                      <p className="text-[10px] text-rose-600 mt-0.5">
                        Reason: {p.rejectionReason} (Amount refunded to wallet)
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-base font-black text-slate-900 font-heading">
                      ₹{p.amount}
                    </span>
                    <p className="text-[10px] text-slate-400">
                      {p.payoutMethod === 'bank_transfer' ? 'Bank Transfer' : 'Instant UPI'}
                    </p>
                  </div>

                  {p.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => onCancelPayoutRequest(p.id)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition flex items-center gap-1 active:scale-95"
                      title="Cancel this pending payout and instantly refund money back to wallet balance"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Cancel & Refund</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Financial Wallet Ledger */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <History className="w-4 h-4" />
            </span>
            <h3 className="text-base font-black font-heading text-slate-900">
              Detailed Transaction Ledger ({filteredTransactions.length})
            </h3>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'all', label: 'All Transactions' },
              { id: 'credits', label: 'Credits (Trip Fees & Tips)' },
              { id: 'cod', label: 'COD Cash Deductions' },
              { id: 'payouts', label: 'Payouts & Refunds' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                  activeFilter === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
            <History className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-bold text-slate-600">No Transactions Found</p>
            <p className="text-[11px] text-slate-400">
              Complete deliveries to see live trip fees and COD deductions recorded here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTransactions.map((tx) => {
              const isCredit = tx.amount > 0;
              const isCodDeduction = tx.type === 'cod_cash_deduction';
              const isPayoutWithdrawal = tx.type === 'payout_withdrawal';
              const isPayoutRefund = tx.type === 'payout_refund';
              const isFloatingCashDeposit = tx.type === 'floating_cash_deposit';

              return (
                <div
                  key={tx.id}
                  className="py-3.5 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isFloatingCashDeposit
                          ? 'bg-sky-100 text-sky-700'
                          : isCodDeduction
                          ? 'bg-amber-100 text-amber-700'
                          : isPayoutWithdrawal
                          ? 'bg-blue-100 text-blue-700'
                          : isPayoutRefund
                          ? 'bg-purple-100 text-purple-700'
                          : isCredit
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isFloatingCashDeposit ? (
                        <ShieldCheck className="w-5 h-5 text-sky-600" />
                      ) : isCodDeduction ? (
                        <Banknote className="w-5 h-5 text-amber-600" />
                      ) : isPayoutWithdrawal ? (
                        <ArrowUpRight className="w-5 h-5 text-blue-600" />
                      ) : isPayoutRefund ? (
                        <RotateCcw className="w-5 h-5 text-purple-600" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 text-emerald-600" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isFloatingCashDeposit
                              ? 'bg-sky-100 text-sky-900 border border-sky-300'
                              : isCodDeduction
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : isPayoutWithdrawal
                              ? 'bg-blue-100 text-blue-900 border border-blue-200'
                              : isPayoutRefund
                              ? 'bg-purple-100 text-purple-900 border border-purple-200'
                              : tx.type === 'customer_tip'
                              ? 'bg-rose-100 text-rose-900 border border-rose-200'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          }`}
                        >
                          {isFloatingCashDeposit
                            ? 'Payment Gateway Cash Clearance'
                            : isCodDeduction
                            ? 'COD Cash Auto-Deduction'
                            : isPayoutWithdrawal
                            ? 'Payout Withdrawal'
                            : isPayoutRefund
                            ? 'Payout Refund'
                            : tx.type === 'customer_tip'
                            ? 'Customer Tip'
                            : 'Trip Delivery Fee'}
                        </span>
                        {tx.orderId && (
                          <span className="text-[10px] font-mono font-bold text-slate-500">
                            Order #{tx.orderId}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">
                          {tx.timestamp}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">
                        {tx.description}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-sm sm:text-base font-black font-heading ${
                        isFloatingCashDeposit
                          ? 'text-sky-600'
                          : isCredit
                          ? 'text-emerald-600'
                          : isCodDeduction
                          ? 'text-amber-700'
                          : 'text-rose-600'
                      }`}
                    >
                      {isFloatingCashDeposit
                        ? 'Cleared via Gateway ✓'
                        : isCredit
                        ? `+₹${tx.amount}`
                        : `-₹${Math.abs(tx.amount)}`}
                    </span>
                    <p className="text-[10px] font-mono font-semibold text-slate-500">
                      Balance: ₹{tx.balanceAfter}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Statement of Account & Payout Reports Modal */}
      <StatementReportModal
        isOpen={isStatementModalOpen}
        onClose={() => setIsStatementModalOpen(false)}
        orders={completedOrders}
        payoutRequests={payoutRequests}
        restaurants={[]}
        deliveryPartners={[rider]}
        initialEntityType="delivery"
        initialEntityId={rider.id}
        lockEntityType={true}
        lockEntityId={true}
      />
    </div>
  );
};
