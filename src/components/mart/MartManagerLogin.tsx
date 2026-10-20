import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Store,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  AlertCircle,
  Eye,
  EyeOff,
  Zap,
  Phone,
  ShieldCheck,
} from 'lucide-react';

interface MartManagerLoginProps {
  onBackToCustomer: () => void;
}

export const MartManagerLogin: React.FC<MartManagerLoginProps> = ({ onBackToCustomer }) => {
  const { loginMartManager, setActivePortal } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [accessPin, setAccessPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError('Please enter your store manager email or registered phone number.');
      return;
    }
    if (!accessPin.trim()) {
      setError('Please enter your Pod Access PIN.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = loginMartManager(identifier, accessPin);
      setIsLoading(false);
      if (!res.success) {
        setError(res.message);
      }
    }, 400);
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center max-w-md mx-auto px-4 py-12">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onBackToCustomer}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customer Website</span>
        </button>

        <button
          onClick={() => setActivePortal('admin')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 hover:underline transition"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Super Admin Login →</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl p-7 sm:p-8 border border-slate-200/90 shadow-2xl space-y-5">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-emerald-950 via-teal-900 to-slate-900 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md shadow-emerald-900/20 border border-emerald-500/30">
            <Store className="w-7 h-7 text-emerald-400" />
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 fill-current" />
              <span>Likart Mart Dark Store</span>
            </span>
          </div>
          <h2 className="text-2xl font-black font-heading text-slate-900 tracking-tight">
            Store Manager Portal
          </h2>
          <p className="text-xs text-slate-500">
            Micro-Fulfillment Pod Operations, Live 10m Order Packing &amp; Inventory Hub
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Store Manager User ID, Email or Phone
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. mgr.rajesh, email, or mobile"
                className="w-full text-xs pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Password or 4-Digit Pod Access PIN
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPin ? 'text' : 'password'}
                required
                value={accessPin}
                onChange={(e) => setAccessPin(e.target.value)}
                placeholder="Enter manager password or 4-digit PIN"
                className="w-full text-xs pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono font-bold"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
          >
            {isLoading ? (
              <span>Verifying Pod Authorization...</span>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                <span>Enter Store Pod Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100 flex flex-col items-center gap-2 text-center">
          <button
            type="button"
            onClick={() => setActivePortal('admin')}
            className="text-xs font-black text-purple-700 hover:text-purple-900 hover:underline flex items-center gap-1"
          >
            <span>Super Administrator? Access Super Admin Hub →</span>
          </button>
          <p className="text-[11px] text-slate-400 font-medium">
            Authorized dark store personnel only. IP and terminal credentials logged for food safety compliance.
          </p>
        </div>
      </div>
    </div>
  );
};
