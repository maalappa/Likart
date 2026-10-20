import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
  Info,
  Clock,
  ArrowRight,
  Landmark,
  Sparkles,
} from 'lucide-react';
import { Restaurant } from '../../../types';

interface RestaurantPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
  availablePayout: number;
  grossSales?: number;
  autoCommission?: number;
  netEarningsLifetime?: number;
  settledPayouts?: number;
  onRequestPayout: (params: {
    recipientType: 'restaurant';
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

export const RestaurantPayoutModal: React.FC<RestaurantPayoutModalProps> = ({
  isOpen,
  onClose,
  restaurant,
  availablePayout,
  grossSales,
  autoCommission,
  netEarningsLifetime,
  settledPayouts,
  onRequestPayout,
}) => {
  const [payoutMethod, setPayoutMethod] = useState<'bank_transfer' | 'upi'>('bank_transfer');

  // Bank details prefilled from restaurant KYC
  const kycBank = restaurant.kyc?.bankAccount;
  const [bankName, setBankName] = useState(kycBank?.bankName || 'HDFC Bank');
  const [accountNumber, setAccountNumber] = useState(kycBank?.accountNumber || '');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState(kycBank?.accountNumber || '');
  const [ifscCode, setIfscCode] = useState(kycBank?.ifscCode || '');
  const [holderName, setHolderName] = useState(
    kycBank?.accountHolderName || restaurant.ownerName || restaurant.name
  );
  const [isCustomBank, setIsCustomBank] = useState(false);

  // UPI details
  const [upiId, setUpiId] = useState(
    `${restaurant.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@okaxis`
  );

  // Amount
  const [withdrawAmount, setWithdrawAmount] = useState<number | string>(
    availablePayout > 0 ? availablePayout : ''
  );
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lastSubmittedDetails, setLastSubmittedDetails] = useState<{
    amount: number;
    destination: string;
    method: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setWithdrawAmount(availablePayout > 0 ? availablePayout : '');
      setErrorMsg('');
      setIsSubmitted(false);
      setBankName(restaurant.kyc?.bankAccount?.bankName || 'HDFC Bank');
      setAccountNumber(restaurant.kyc?.bankAccount?.accountNumber || '');
      setConfirmAccountNumber(restaurant.kyc?.bankAccount?.accountNumber || '');
      setIfscCode(restaurant.kyc?.bankAccount?.ifscCode || '');
      setHolderName(
        restaurant.kyc?.bankAccount?.accountHolderName ||
          restaurant.ownerName ||
          restaurant.name
      );
    }
  }, [isOpen, availablePayout, restaurant]);

  if (!isOpen) return null;

  const numAmount = typeof withdrawAmount === 'number' ? withdrawAmount : Number(withdrawAmount) || 0;
  const remainingBalance = Math.max(0, availablePayout - numAmount);

  const handlePercentageClick = (percent: number) => {
    const calculated = Math.floor((availablePayout * percent) / 100);
    setWithdrawAmount(calculated);
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (numAmount <= 0) {
      setErrorMsg('Please enter a valid payout withdrawal amount.');
      return;
    }

    if (numAmount < 100) {
      setErrorMsg('Minimum payout withdrawal amount is ₹100.');
      return;
    }

    if (numAmount > availablePayout) {
      setErrorMsg(`Withdrawal amount cannot exceed your available balance of ₹${availablePayout.toLocaleString('en-IN')}.`);
      return;
    }

    if (payoutMethod === 'bank_transfer') {
      if (!accountNumber.trim() || accountNumber.length < 8) {
        setErrorMsg('Please enter a valid bank account number (at least 8 digits).');
        return;
      }
      if (accountNumber !== confirmAccountNumber) {
        setErrorMsg('Bank account numbers do not match. Please verify.');
        return;
      }
      if (!ifscCode.trim() || ifscCode.length < 5) {
        setErrorMsg('Please enter a valid 11-character IFSC code (e.g. HDFC0001234).');
        return;
      }
      if (!holderName.trim()) {
        setErrorMsg('Please enter the account beneficiary holder name.');
        return;
      }

      const dest = `${bankName} (A/C: ••••${accountNumber.slice(-4)}, IFSC: ${ifscCode.toUpperCase()})`;
      onRequestPayout({
        recipientType: 'restaurant',
        recipientId: restaurant.id,
        amount: numAmount,
        bankOrUpiDetails: dest,
        payoutMethod: 'bank_transfer',
        bankDetails: {
          accountNumber: accountNumber.trim(),
          ifscCode: ifscCode.trim().toUpperCase(),
          holderName: holderName.trim(),
          bankName: bankName.trim(),
        },
      });

      setLastSubmittedDetails({
        amount: numAmount,
        destination: dest,
        method: 'Bank Transfer (NEFT/IMPS)',
      });
    } else {
      if (!upiId.trim() || !upiId.includes('@')) {
        setErrorMsg('Please enter a valid UPI Virtual Payment Address (e.g. outlet@oksbi or 9876543210@paytm).');
        return;
      }

      const dest = `UPI: ${upiId.trim()}`;
      onRequestPayout({
        recipientType: 'restaurant',
        recipientId: restaurant.id,
        amount: numAmount,
        bankOrUpiDetails: dest,
        payoutMethod: 'upi',
        upiId: upiId.trim(),
      });

      setLastSubmittedDetails({
        amount: numAmount,
        destination: dest,
        method: 'Instant UPI',
      });
    }

    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative overflow-hidden max-h-[92vh] flex flex-col">
        {/* Decorative Top Gradient Accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="py-8 px-2 text-center space-y-5 animate-in zoom-in-95">
            <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md border border-emerald-200">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-heading font-black text-slate-900">
                Payout Request Submitted!
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Your settlement withdrawal of <strong className="text-emerald-700 font-bold">₹{lastSubmittedDetails?.amount.toLocaleString('en-IN')}</strong> has been queued for Super Admin review and treasury transfer.
              </p>
            </div>

            {/* Receipt Summary Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 max-w-md mx-auto text-left space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-slate-500 border-b border-slate-200 pb-2">
                <span>Restaurant Outlet</span>
                <span className="font-bold text-slate-900">{restaurant.name}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 border-b border-slate-200 pb-2">
                <span>Withdrawal Amount</span>
                <span className="font-mono font-black text-emerald-700 text-sm">
                  ₹{lastSubmittedDetails?.amount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-500 border-b border-slate-200 pb-2">
                <span>Settlement Method</span>
                <span className="font-bold text-slate-800">{lastSubmittedDetails?.method}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 border-b border-slate-200 pb-2">
                <span>Destination Account</span>
                <span className="font-mono text-slate-800 font-semibold">{lastSubmittedDetails?.destination}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Expected Credit Time</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Within 24 Hours
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Done & View Payouts History
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 overflow-y-auto pr-1 no-scrollbar pt-1">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-600" /> Restaurant Payout Request
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  ID: {restaurant.id}
                </span>
              </div>
              <h2 className="text-xl font-heading font-black text-slate-900">
                Request Earnings Withdrawal
              </h2>
              <p className="text-xs text-slate-500">
                Disburse your net kitchen revenue directly to your verified commercial bank account or business UPI.
              </p>
            </div>

            {/* Available Withdrawable Balance Card */}
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-50 p-4 rounded-2xl border border-emerald-200 space-y-3 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Net Available For Payout
                    </span>
                    <span className="text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-full">
                      {restaurant.commissionRate ?? 15}% Commission Auto-Deducted
                    </span>
                  </div>
                  <div className="text-2xl font-black font-heading text-emerald-700">
                    ₹{availablePayout.toLocaleString('en-IN')}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    100% of platform commission has been automatically debited upon delivery. Entire amount is ready for immediate bank withdrawal.
                  </p>
                </div>

                {availablePayout > 0 && (
                  <button
                    type="button"
                    onClick={() => handlePercentageClick(100)}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow-2xs flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Withdraw Full (100%)</span>
                  </button>
                )}
              </div>

              {/* Mini Reconciliation Strip if props available */}
              {typeof grossSales === 'number' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-200/60 text-xs">
                  <div className="bg-white/80 p-2 rounded-xl border border-emerald-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Gross Food GMV</span>
                    <span className="font-mono font-bold text-slate-900">₹{grossSales.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-amber-50/80 p-2 rounded-xl border border-amber-200">
                    <span className="text-[10px] uppercase font-bold text-amber-700 block">Auto-Deducted Comm</span>
                    <span className="font-mono font-bold text-amber-800">-₹{(autoCommission ?? 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-emerald-50/80 p-2 rounded-xl border border-emerald-200">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">Net Lifetime</span>
                    <span className="font-mono font-bold text-emerald-700">₹{(netEarningsLifetime ?? 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="bg-blue-50/80 p-2 rounded-xl border border-blue-200">
                    <span className="text-[10px] uppercase font-bold text-blue-700 block">Settled to Bank</span>
                    <span className="font-mono font-bold text-blue-700">-₹{(settledPayouts ?? 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Withdrawal Amount Input & Quick Chips */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Withdrawal Amount (₹) <span className="text-rose-500">*</span>
                </label>
                {numAmount > 0 && (
                  <span className="text-[11px] text-slate-500">
                    Remaining Balance: <strong className="text-slate-800">₹{remainingBalance.toLocaleString('en-IN')}</strong>
                  </span>
                )}
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg">
                  ₹
                </span>
                <input
                  type="number"
                  min="100"
                  max={availablePayout}
                  value={withdrawAmount}
                  onChange={(e) => {
                    setWithdrawAmount(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="Enter amount (Min ₹100)"
                  className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-black text-lg focus:outline-emerald-500 transition"
                  disabled={availablePayout <= 0}
                />
              </div>

              {/* Quick Percentage & Amount Preset Chips */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Presets:</span>
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handlePercentageClick(pct)}
                    disabled={availablePayout <= 0}
                    className={`px-3 py-1 text-xs font-bold rounded-xl border transition ${
                      numAmount === Math.floor((availablePayout * pct) / 100) && numAmount > 0
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 disabled:opacity-50'
                    }`}
                  >
                    {pct === 100 ? 'Max (100%)' : `${pct}%`}
                  </button>
                ))}

                {[500, 1000, 2500, 5000].map((amt) => {
                  if (amt > availablePayout) return null;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setWithdrawAmount(amt);
                        setErrorMsg('');
                      }}
                      className={`px-3 py-1 text-xs font-bold rounded-xl border transition ${
                        numAmount === amt
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payout Method Selection Tabs */}
            <div className="space-y-3 pt-1">
              <label className="block text-xs font-bold text-slate-700">
                Choose Settlement Payout Channel <span className="text-rose-500">*</span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPayoutMethod('bank_transfer');
                    setErrorMsg('');
                  }}
                  className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition ${
                    payoutMethod === 'bank_transfer'
                      ? 'bg-emerald-50/70 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      payoutMethod === 'bank_transfer'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      <span>Bank Account (NEFT/RTGS)</span>
                      {kycBank?.accountNumber && (
                        <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-md">
                          Verified ✓
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Direct credit to registered commercial bank
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPayoutMethod('upi');
                    setErrorMsg('');
                  }}
                  className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition ${
                    payoutMethod === 'upi'
                      ? 'bg-emerald-50/70 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      payoutMethod === 'upi'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      <span>Instant UPI Transfer</span>
                      <span className="text-[9px] font-black uppercase text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded-md">
                        Fast
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Transfer to VPA (Google Pay / PhonePe / Paytm)
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Payout Channel Specific Details */}
            {payoutMethod === 'bank_transfer' ? (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5 text-emerald-600" />
                    Beneficiary Bank Account Information
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCustomBank(!isCustomBank)}
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold"
                  >
                    {isCustomBank ? 'Use KYC Bank Defaults' : 'Edit / Change Bank'}
                  </button>
                </div>

                {!isCustomBank && kycBank?.accountNumber ? (
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-[11px]">Bank Name:</span>
                      <span className="font-bold text-slate-900">{bankName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-[11px]">Account Number:</span>
                      <span className="font-mono font-bold text-slate-900">
                        ••••••••{accountNumber.slice(-4) || '1234'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-[11px]">IFSC Code:</span>
                      <span className="font-mono font-bold text-emerald-700">{ifscCode}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-[11px]">Beneficiary Name:</span>
                      <span className="font-bold text-slate-900">{holderName}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Bank Name
                        </label>
                        <input
                          type="text"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          placeholder="e.g. HDFC Bank"
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          IFSC Code
                        </label>
                        <input
                          type="text"
                          value={ifscCode}
                          onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                          placeholder="e.g. HDFC0001234"
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase focus:outline-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Account Number
                        </label>
                        <input
                          type="text"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          placeholder="Account number"
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Confirm Account Number
                        </label>
                        <input
                          type="text"
                          value={confirmAccountNumber}
                          onChange={(e) => setConfirmAccountNumber(e.target.value)}
                          placeholder="Re-enter account number"
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Account Holder / Beneficiary Name
                      </label>
                      <input
                        type="text"
                        value={holderName}
                        onChange={(e) => setHolderName(e.target.value)}
                        placeholder="Name as printed in bank passbook"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-emerald-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <label className="block text-[11px] font-bold text-slate-700">
                  Business UPI VPA Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. foodparadise@okhdfcbank or 9876543210@paytm"
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Funds will be credited directly to the bank account linked with this UPI handle.
                </p>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 animate-in shake">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Terms and SLA note */}
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-start gap-2 text-[11px] text-blue-900">
              <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Withdrawal requests are processed by Super Admin Treasury. Settlements are transferred with zero processing fees.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={availablePayout <= 0}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Submit Payout Request</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
