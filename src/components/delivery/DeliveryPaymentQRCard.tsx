import React, { useState, useEffect } from 'react';
import {
  Banknote,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Coins,
  Calculator,
  Lock,
} from 'lucide-react';
import { Order } from '../../types';
import { playPaymentSuccessSound } from '../../utils/soundUtils';

export interface DeliveryPaymentQRCardProps {
  order: Order;
  onPaymentSuccess: (method: 'cash' | 'upi_qr', txnId: string) => void;
  onAutoRedirectToDeliver?: () => void;
}

export const DeliveryPaymentQRCard: React.FC<DeliveryPaymentQRCardProps> = ({
  order,
  onPaymentSuccess,
  onAutoRedirectToDeliver,
}) => {
  const [cashTendered, setCashTendered] = useState<number>(order.totalAmount);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationStep, setVerificationStep] = useState<string>('');
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  const isAlreadyPaid = order.paymentStatus === 'completed';

  // Handle countdown auto-redirect after successful payment
  useEffect(() => {
    if (redirectCountdown !== null && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (redirectCountdown === 0) {
      setRedirectCountdown(null);
      if (onAutoRedirectToDeliver) {
        onAutoRedirectToDeliver();
      }
    }
  }, [redirectCountdown, onAutoRedirectToDeliver]);

  // Handle cash collection confirmation
  const handleConfirmCashPayment = () => {
    if (isVerifying || isAlreadyPaid) return;
    setIsVerifying(true);
    setVerificationStep('Registering cash handover to platform financial ledger...');

    setTimeout(() => {
      const txnId = `CASH-POD-${Date.now().toString().slice(-8)}`;
      playPaymentSuccessSound(order.totalAmount);
      setIsVerifying(false);
      onPaymentSuccess('cash', txnId);
      setRedirectCountdown(2); // Auto-redirect in 2 seconds
    }, 700);
  };

  const changeToReturn = Math.max(0, cashTendered - order.totalAmount);

  return (
    <div className="bg-gradient-to-b from-amber-500/10 via-white to-slate-50 border-2 border-amber-400 rounded-3xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-amber-200">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
            <Banknote className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                Step 1: Cash on Delivery Collection
              </span>
              {isAlreadyPaid ? (
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Cash Handover Confirmed ✓</span>
                </span>
              ) : (
                <span className="text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-3 h-3 text-rose-600" />
                  <span>Payment Pending</span>
                </span>
              )}
            </div>
            <h4 className="text-base font-black text-slate-900 mt-0.5 font-heading">
              Collect ₹{order.totalAmount} Cash from Customer
            </h4>
          </div>
        </div>

        {/* Order amount pill */}
        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Bill Total
          </span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            ₹{order.totalAmount}
          </span>
        </div>
      </div>

      {/* STATE 1: ALREADY PAID / CONFIRMED */}
      {isAlreadyPaid ? (
        <div className="py-6 text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
          </div>
          <div>
            <h5 className="text-lg font-black text-emerald-900 font-heading">
              Cash Payment of ₹{order.totalAmount} Received!
            </h5>
            <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
              Physical cash handover successfully verified and logged to your Cash-in-Hand ledger.
            </p>
          </div>

          <div className="inline-flex flex-wrap items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono px-3 py-1.5 rounded-xl font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Txn Ref: {order.transactionId || 'CASH-POD-VERIFIED'}</span>
            <span>•</span>
            <span>Method: Physical Cash Handover</span>
          </div>

          {redirectCountdown !== null ? (
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md animate-bounce">
                <span>Auto-redirecting to OTP Delivery verification in {redirectCountdown}s...</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ) : (
            <div className="pt-2">
              <button
                type="button"
                onClick={onAutoRedirectToDeliver}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-md transition active:scale-95"
              >
                <span>Delivery Completion Access Unlocked • Enter OTP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* STATE 2: CASH COLLECTION FORM */
        <div className="mt-4 space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-600" />
                  <span>Physical Cash on Handover</span>
                </p>
                <p className="text-[11px] text-slate-500">
                  Collect cash before handing over food packages. Use the calculator below for quick change calculation.
                </p>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200">
                Direct Handover
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                  Required Bill Amount
                </label>
                <div className="text-2xl font-black text-slate-900 font-mono">
                  ₹{order.totalAmount}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                  Cash Given by Customer (₹)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={order.totalAmount}
                    step={10}
                    value={cashTendered}
                    onChange={(e) => setCashTendered(Number(e.target.value) || 0)}
                    className="w-full pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-xl font-mono text-lg font-bold text-slate-900 focus:outline-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <Calculator className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Quick Cash Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-400 font-bold mr-1">Quick Tender:</span>
              <button
                type="button"
                onClick={() => setCashTendered(order.totalAmount)}
                className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition"
              >
                Exact (₹{order.totalAmount})
              </button>
              <button
                type="button"
                onClick={() => setCashTendered(Math.ceil(order.totalAmount / 100) * 100)}
                className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition"
              >
                Round 100s (₹{Math.ceil(order.totalAmount / 100) * 100})
              </button>
              <button
                type="button"
                onClick={() => setCashTendered(Math.max(500, order.totalAmount))}
                className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition"
              >
                ₹500 Note
              </button>
              {order.totalAmount > 500 && (
                <button
                  type="button"
                  onClick={() => setCashTendered(Math.max(1000, order.totalAmount))}
                  className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition"
                >
                  ₹1000 Notes
                </button>
              )}
            </div>

            {/* Change to return */}
            <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-900 block">
                  Change to Return to Customer:
                </span>
                <span className="text-[10px] text-amber-700">
                  {changeToReturn > 0
                    ? `Hand back ₹${changeToReturn} to customer.`
                    : 'Exact amount tendered, no change required.'}
                </span>
              </div>
              <span className="text-xl font-black font-mono text-amber-900">
                ₹{changeToReturn}
              </span>
            </div>

            {/* Verification Progress Message */}
            {isVerifying && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-center text-xs font-black text-emerald-900 animate-pulse flex items-center justify-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                <span>{verificationStep}</span>
              </div>
            )}

            {/* Confirm Cash Received CTA */}
            <button
              type="button"
              disabled={isVerifying || cashTendered < order.totalAmount}
              onClick={handleConfirmCashPayment}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Confirm Cash Received (₹{order.totalAmount}) • Unlock OTP Verification</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const DeliveryCashCollectionCard = DeliveryPaymentQRCard;
export default DeliveryPaymentQRCard;
