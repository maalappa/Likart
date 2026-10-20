import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  AlertCircle,
  Eye,
  EyeOff,
  Zap,
  Store,
  UtensilsCrossed,
  Globe,
  Smartphone,
} from 'lucide-react';
import { WebsiteUniversalAccessModal } from '../common/WebsiteUniversalAccessModal';

interface AdminLoginProps {
  onBackToCustomer: () => void;
  initialMode?: 'likart_food' | 'likart_mart';
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToCustomer, initialMode }) => {
  const { loginAdmin, setAdminInitialTab, setActivePortal, adminInitialTab } = useApp();

  const [loginMode, setLoginMode] = useState<'likart_food' | 'likart_mart'>(() => {
    if (initialMode) return initialMode;
    return adminInitialTab === 'likart_mart' ? 'likart_mart' : 'likart_food';
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUniversalAccessModalOpen, setIsUniversalAccessModalOpen] = useState(false);

  // Sync when initialMode or adminInitialTab changes
  React.useEffect(() => {
    const targetMode = initialMode || (adminInitialTab === 'likart_mart' ? 'likart_mart' : 'likart_food');
    setLoginMode(targetMode);
    setError('');
  }, [initialMode, adminInitialTab]);

  const handleModeSwitch = (mode: 'likart_food' | 'likart_mart') => {
    setLoginMode(mode);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your administrator email address.');
      return;
    }
    if (!password) {
      setError('Please enter your administrator password.');
      return;
    }

    if (loginMode === 'likart_mart') {
      setAdminInitialTab('likart_mart');
    } else {
      setAdminInitialTab('overview');
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = loginAdmin(email, password, loginMode);
      setIsLoading(false);
      if (!res.success) {
        setError(res.message);
      }
    }, 350);
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center max-w-lg mx-auto px-4 py-10">
      {/* Top Nav Switchers */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBackToCustomer}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customer Website</span>
        </button>

        <button
          type="button"
          onClick={() => setActivePortal('mart_manager')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200/90 transition shadow-2xs"
        >
          <Store className="w-3.5 h-3.5" />
          <span>Store Manager Portal →</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6">
        {/* Dedicated Separate Login Options Switcher */}
        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block text-center">
            Select Super Admin Service Portal
          </label>
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200">
            {/* 1. Likart Food Super Admin Option */}
            <button
              type="button"
              onClick={() => handleModeSwitch('likart_food')}
              className={`p-3 rounded-xl transition text-left flex flex-col gap-1 relative ${
                loginMode === 'likart_food'
                  ? 'bg-white text-slate-900 shadow-md border border-orange-200 ring-2 ring-orange-500/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    loginMode === 'likart_food'
                      ? 'bg-gradient-to-br from-orange-500 to-rose-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <UtensilsCrossed className="w-4 h-4" />
                </span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-orange-100 text-orange-800">
                  Food Hub
                </span>
              </div>
              <strong className="text-xs font-black block mt-0.5">
                Likart Food Super Admin
              </strong>
              <span className="text-[10px] text-slate-500 leading-tight">
                Restaurants, Menus &amp; Kitchens
              </span>
            </button>

            {/* 2. Likart Mart Super Admin Option */}
            <button
              type="button"
              onClick={() => handleModeSwitch('likart_mart')}
              className={`p-3 rounded-xl transition text-left flex flex-col gap-1 relative ${
                loginMode === 'likart_mart'
                  ? 'bg-white text-slate-900 shadow-md border border-emerald-200 ring-2 ring-emerald-500/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    loginMode === 'likart_mart'
                      ? 'bg-gradient-to-br from-emerald-600 to-teal-800 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                </span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  10m Mart
                </span>
              </div>
              <strong className="text-xs font-black block mt-0.5">
                Likart Mart Super Admin
              </strong>
              <span className="text-[10px] text-slate-500 leading-tight">
                Dark Stores, SKUs &amp; 10m SLAs
              </span>
            </button>
          </div>
        </div>

        {/* Portal Header Display */}
        <div className="text-center space-y-2 pt-1">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg transition-all duration-300 ${
              loginMode === 'likart_mart'
                ? 'bg-gradient-to-tr from-emerald-950 via-teal-900 to-slate-900 shadow-emerald-900/25'
                : 'bg-gradient-to-tr from-orange-600 via-rose-600 to-slate-900 shadow-orange-900/25'
            }`}
          >
            {loginMode === 'likart_mart' ? (
              <Zap className="w-7 h-7 fill-emerald-300 text-emerald-300" />
            ) : (
              <UtensilsCrossed className="w-7 h-7 text-white" />
            )}
          </div>

          <h2 className="text-2xl font-black font-heading text-slate-900 tracking-tight">
            {loginMode === 'likart_mart'
              ? 'Likart Mart Super Admin Login'
              : 'Likart Food Super Admin Login'}
          </h2>

          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {loginMode === 'likart_mart'
              ? 'Direct access to 10-minute grocery dark store pods, catalog SKUs, inventory, pod supervisors, rider dispatch & SLAs.'
              : 'Direct access to restaurants, menu catalogs, cuisines, kitchen fulfillment, food orders & franchise network.'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              {loginMode === 'likart_mart'
                ? 'Mart Super Admin Email'
                : 'Food Super Admin Email'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  loginMode === 'likart_mart'
                    ? 'Enter mart admin email'
                    : 'Enter food admin email'
                }
                className={`w-full text-xs pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-medium focus:outline-none ${
                  loginMode === 'likart_mart'
                    ? 'focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'
                    : 'focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Master Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className={`w-full text-xs pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-medium focus:outline-none ${
                  loginMode === 'likart_mart'
                    ? 'focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'
                    : 'focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 ${
              loginMode === 'likart_mart'
                ? 'bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 hover:from-emerald-500 hover:to-teal-600 shadow-emerald-600/20'
                : 'bg-gradient-to-r from-orange-600 via-rose-600 to-slate-900 hover:from-orange-500 hover:to-rose-500 shadow-orange-600/20'
            }`}
          >
            {isLoading ? (
              <span>Authenticating Session...</span>
            ) : (
              <>
                {loginMode === 'likart_mart' ? (
                  <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                ) : (
                  <UtensilsCrossed className="w-4 h-4" />
                )}
                <span>
                  {loginMode === 'likart_mart'
                    ? 'Enter Likart Mart Command Center'
                    : 'Enter Likart Food Control Center'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Universal Access Directory & Website Link Helper */}
        <div className="pt-3 border-t border-slate-100 flex flex-col items-center gap-2 text-center">
          <button
            type="button"
            onClick={() => setIsUniversalAccessModalOpen(true)}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 text-indigo-900 border border-indigo-200/80 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 active:scale-98 shadow-2xs"
          >
            <Smartphone className="w-4 h-4 text-indigo-600" />
            <span>Device Link, QR Codes &amp; Share Hub</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePortal('mart_manager')}
            className="text-xs font-black text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1.5"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Are you a Dark Store Pod Manager? Login with PIN here →</span>
          </button>
          <p className="text-[11px] text-slate-400 font-medium">
            Protected by 256-bit SSL encryption. All session operations are recorded in platform audit logs.
          </p>
        </div>
      </div>

      <WebsiteUniversalAccessModal
        isOpen={isUniversalAccessModalOpen}
        onClose={() => setIsUniversalAccessModalOpen(false)}
      />
    </div>
  );
};
