import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  Lock,
  Wallet,
  Coins,
} from 'lucide-react';
import { DeliveryPartner } from '../../types';

interface RiderPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  rider: DeliveryPartner;
  onRequestPayout: (params: {
    recipientType: 'delivery';
    recipientId: string;
    amount: number;
    bankOrUpiDetails: string;
    payoutMethod: 'upi' | 'bank_transfer';
    upiId?: string;
    bankDetails?: {
      accountNumber: string;
      ifscCode: string;
      holderName: string;
      bankName: string;
    };
  }) => void;
}

export const RiderPayoutModal: React.FC<RiderPayoutModalProps> = ({
  isOpen,
  onClose,
  rider,
  onRequestPayout,
}) => {
  const [payoutMethod, setPayoutMethod] = useState<'upi' | 'bank_transfer'>('upi');
  const [upiId, setUpiId] = useState(rider.kyc.payoutUpiOrBank || 'rahul@oksbi');
  const [bankName, setBankName] = useState('State Bank of India');
  const [accountNumber, setAccountNumber] = useState('389100291823');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('389100291823');
  const [ifscCode, setIfscCode] = useState('SBIN0001928');
  const [holderName, setHolderName] = useState(rider.name);

  const cashInHand = rider.totalCashCollected || 0;
  const totalEarnings =
    typeof rider.totalEarnings === 'number'
      ? rider.totalEarnings
      : Math.max(0, (rider.walletBalance || 0) + cashInHand);

  // Strict Policy: Only genuine delivery earnings minus cash-in-hand is accessible for withdrawal
  const availableEarningsBalance = Math.max(0, rider.walletBalance ?? (totalEarnings - cashInHand));
  const hasWithdrawalAccess = availableEarningsBalance > 0;

  const [withdrawAmount, setWithdrawAmount] = useState<number>(availableEarningsBalance);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handlePercentageClick = (percent: number) => {
    const calculated = Math.floor((availableEarningsBalance * percent) / 100);
    setWithdrawAmount(calculated);
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!hasWithdrawalAccess) {
      setErrorMsg('Withdrawal access is restricted: You do not have positive delivery earnings to withdraw.');
      return;
    }

    if (withdrawAmount <= 0) {
      setErrorMsg('Please enter an amount greater than ₹0.');
      return;
    }

    if (withdrawAmount > availableEarningsBalance) {
      setErrorMsg(
        `Withdrawal access restricted to earnings only. You can withdraw up to your available earnings balance of ₹${availableEarningsBalance}. Cash in hand cannot be withdrawn.`
      );
      return;
    }

    if (payoutMethod === 'upi') {
      if (!upiId.trim() || !upiId.includes('@')) {
        setErrorMsg('Please enter a valid UPI VPA ID (e.g. yourname@oksbi or 9876543210@paytm).');
        return;
      }
      onRequestPayout({
        recipientType: 'delivery',
        recipientId: rider.id,
        amount: withdrawAmount,
        bankOrUpiDetails: upiId.trim(),
        payoutMethod: 'upi',
        upiId: upiId.trim(),
      });
    } else {
      if (!accountNumber.trim() || accountNumber.length < 8) {
        setErrorMsg('Please enter a valid bank account number.');
        return;
      }
      if (accountNumber !== confirmAccountNumber) {
        setErrorMsg('Bank account numbers do not match.');
        return;
      }
      if (!ifscCode.trim() || ifscCode.length < 5) {
        setErrorMsg('Please enter a valid 11-character IFSC code.');
        return;
      }
      onRequestPayout({
        recipientType: 'delivery',
        recipientId: rider.id,
        amount: withdrawAmount,
        bankOrUpiDetails: `${bankName} (A/c: ${accountNumber}, IFSC: ${ifscCode})`,
        payoutMethod: 'bank_transfer',
        bankDetails: {
          accountNumber: accountNumber.trim(),
          ifscCode: ifscCode.trim().toUpperCase(),
          holderName: holderName.trim(),
          bankName: bankName.trim(),
        },
      });
    }

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative overflow-hidden">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-heading font-black text-slate-900">
              Payout Request Submitted!
            </h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              ₹{withdrawAmount} withdrawal requested to{' '}
              {payoutMethod === 'upi' ? `UPI: ${upiId}` : `Bank A/c ...${accountNumber.slice(-4)}`}.
              Your withdrawable earnings balance has been debited.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Earnings Only Withdrawal Access
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  Zero Cash-in-Hand Withdrawal
                </span>
              </div>
              <h3 className="text-xl font-heading font-black text-slate-900">
                Withdraw Delivery Earnings
              </h3>
              <p className="text-xs text-slate-500">
                Withdrawal access is strictly limited to your verified delivery trip earnings & customer tips.
              </p>
            </div>

            {/* Withdrawable Earnings Reconciliation Card */}
            <div className="p-4 bg-gradient-to-br from-blue-950 via-indigo-900 to-slate-900 rounded-2xl text-white shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-200">
                    Withdrawable Earnings Balance
                  </span>
                  <div className="text-3xl font-black font-heading mt-0.5 text-emerald-300">
                    ₹{availableEarningsBalance}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-1 rounded-lg font-black inline-block">
                    Earnings Only Access
                  </span>
                  <p className="text-[10px] text-blue-200 mt-1">Instant Bank / UPI Transfer</p>
                </div>
              </div>

              {/* Formula Ledger Breakdown */}
              <div className="pt-2 border-t border-white/10 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-white/5 rounded-xl p-2 border border-white/10">
                  <span className="text-[9px] uppercase font-bold text-blue-200 block">Total Earnings</span>
                  <span className="font-black text-white text-sm">₹{totalEarnings}</span>
                  <span className="text-[8px] text-blue-300 block">Trip fees + tips</span>
                </div>
                <div className="bg-white/5 rounded-xl p-2 border border-white/10">
                  <span className="text-[9px] uppercase font-bold text-amber-200 block">(-) Cash in Hand</span>
                  <span className="font-black text-amber-300 text-sm">-₹{cashInHand}</span>
                  <span className="text-[8px] text-amber-300/80 block">Non-withdrawable</span>
                </div>
                <div className="bg-emerald-500/10 rounded-xl p-2 border border-emerald-400/20">
                  <span className="text-[9px] uppercase font-bold text-emerald-200 block">(=) Withdrawable</span>
                  <span className="font-black text-emerald-300 text-sm">₹{availableEarningsBalance}</span>
                  <span className="text-[8px] text-emerald-300 block">Eligible earnings</span>
                </div>
              </div>

              <div className="p-2 bg-white/5 rounded-xl border border-white/10 text-[10px] text-blue-200 leading-relaxed flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-300 shrink-0 mt-0.5" />
                <span>
                  <strong>Earnings Access Rule:</strong> Cash collected from customers belongs to the platform and cannot be withdrawn. Only your earned delivery compensation is eligible for withdrawal.
                </span>
              </div>
            </div>

            {/* LOCKED STATE IF NO EARNINGS AVAILABLE */}
            {!hasWithdrawalAccess ? (
              <div className="p-4 bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                  <Lock className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-black uppercase text-amber-900 tracking-wider">
                  Withdrawal Access Locked (₹0 Available)
                </h4>
                <p className="text-xs text-amber-800 max-w-sm mx-auto">
                  You currently have no positive delivery earnings available for withdrawal. Cash in hand ({`₹${cashInHand}`}) is COD collection and cannot be withdrawn. Complete more deliveries or deposit collected cash via Razorpay.
                </p>
              </div>
            ) : (
              /* UNLOCKED WITHDRAWAL FORM */
              <>
                {/* Amount Selection */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wide text-slate-700">
                      Withdrawal Amount (₹)
                    </label>
                    <span className="text-[11px] font-bold text-emerald-700">
                      Max: ₹{availableEarningsBalance}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={availableEarningsBalance}
                      value={withdrawAmount || ''}
                      onChange={(e) => {
                        setWithdrawAmount(Number(e.target.value));
                        setErrorMsg('');
                      }}
                      required
                      placeholder="Enter amount"
                      className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-black text-slate-900 focus:bg-white focus:outline-blue-600 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  {/* Quick Percentage Chips */}
                  <div className="flex gap-2 pt-0.5">
                    {[
                      { label: '25%', val: 25 },
                      { label: '50%', val: 50 },
                      { label: '75%', val: 75 },
                      { label: '100% (All)', val: 100 },
                    ].map((chip) => (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => handlePercentageClick(chip.val)}
                        className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 active:bg-blue-100 text-slate-700 font-bold text-xs rounded-lg transition text-center"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payout Method Toggle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wide text-slate-700 block">
                    Choose Payout Destination
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPayoutMethod('upi')}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition ${
                        payoutMethod === 'upi'
                          ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-xl ${
                          payoutMethod === 'upi' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-black text-xs text-slate-900">Direct UPI Transfer</h4>
                        <p className="text-[10px] text-slate-500">GPay, PhonePe, Paytm</p>
                        <span className="text-[9px] font-bold text-emerald-600 mt-0.5 block">
                          ⚡ Instant Credit
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPayoutMethod('bank_transfer')}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition ${
                        payoutMethod === 'bank_transfer'
                          ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-xl ${
                          payoutMethod === 'bank_transfer'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-black text-xs text-slate-900">Bank Account Transfer</h4>
                        <p className="text-[10px] text-slate-500">IMPS / NEFT Transfer</p>
                        <span className="text-[9px] font-bold text-blue-600 mt-0.5 block">
                          🕒 15-30 Mins
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Method Details Input */}
                {payoutMethod === 'upi' ? (
                  <div className="space-y-1 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Recipient UPI ID / VPA
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      required
                      placeholder="e.g. mobile@paytm or name@oksbi"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-blue-600"
                    />
                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Info className="w-3 h-3 text-slate-400" />
                      Earnings will be transferred directly to this verified UPI ID.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-700 block">Bank Name</label>
                        <input
                          type="text"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          required
                          placeholder="Bank name"
                          className="w-full px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700 block">Account Holder</label>
                        <input
                          type="text"
                          value={holderName}
                          onChange={(e) => setHolderName(e.target.value)}
                          required
                          placeholder="Name as in bank"
                          className="w-full px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-700 block">Account Number</label>
                        <input
                          type="text"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          required
                          placeholder="Account number"
                          className="w-full px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-700 block">Confirm A/C Number</label>
                        <input
                          type="text"
                          value={confirmAccountNumber}
                          onChange={(e) => setConfirmAccountNumber(e.target.value)}
                          required
                          placeholder="Confirm number"
                          className="w-full px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-700 block">IFSC Code</label>
                      <input
                        type="text"
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                        required
                        placeholder="e.g. SBIN0001928"
                        className="w-full px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-bold animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit CTA */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={!hasWithdrawalAccess || withdrawAmount <= 0}
                className="flex-2 py-3 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>
                  {hasWithdrawalAccess
                    ? `Withdraw ₹${withdrawAmount || 0} from Earnings`
                    : 'Withdrawal Locked (₹0 Available)'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RiderPayoutModal;
