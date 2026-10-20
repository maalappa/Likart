import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LikartMartAdminHub } from './LikartMartAdminHub';
import { AndroidApkModal } from '../common/AndroidApkModal';
import { WebsiteUniversalAccessModal } from '../common/WebsiteUniversalAccessModal';
import {
  Zap,
  ShieldCheck,
  Store,
  Smartphone,
  Globe,
} from 'lucide-react';

export const MartSuperAdminDashboard: React.FC = () => {
  const {
    authAdmin,
    logoutAdmin,
    setActivePortal,
    brandSettings,
    persistAllDataToPermanentStorage,
  } = useApp();

  const [isSyncingPermanentStorage, setIsSyncingPermanentStorage] = useState(false);
  const [isAndroidApkModalOpen, setIsAndroidApkModalOpen] = useState(false);
  const [isUniversalAccessModalOpen, setIsUniversalAccessModalOpen] = useState(false);

  const handleForcePermanentSave = () => {
    setIsSyncingPermanentStorage(true);
    persistAllDataToPermanentStorage();
    setTimeout(() => {
      setIsSyncingPermanentStorage(false);
    }, 700);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header Bar for Likart Mart Super Admin */}
      <div className="bg-slate-900 text-white p-4 sm:p-6 rounded-3xl border border-emerald-800/50 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-700 to-slate-900 flex items-center justify-center shadow-lg shadow-emerald-950/40 shrink-0 border border-emerald-500/30">
            <Zap className="w-6 h-6 text-emerald-300 fill-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black font-heading tracking-tight">
                {brandSettings.brandName} Mart Super Admin
              </h2>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/40 uppercase">
                10M Quick Commerce • Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Dedicated Command Center for Dark Stores, SKUs, Inventory, Pod Supervisors &amp; Express SLAs
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 text-xs flex-wrap">
          {/* Permanent Save Access indicator */}
          <button
            type="button"
            onClick={handleForcePermanentSave}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 font-bold rounded-xl transition active:scale-95 shadow-xs"
            title="Permanent storage access active. Click to force-persist all data."
          >
            <span className={`w-2 h-2 rounded-full bg-emerald-400 ${isSyncingPermanentStorage ? 'animate-ping' : ''}`} />
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="hidden md:inline">Permanent Storage:</span>
            <span>{isSyncingPermanentStorage ? 'Saving...' : 'Active'}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold hidden sm:inline">Active Admin:</span>
            <span className="px-3 py-1.5 bg-slate-800 border border-emerald-700/50 rounded-xl text-emerald-200 font-bold flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-emerald-400 fill-current" />
              <span>{authAdmin?.name || 'Likart Mart Super Admin'}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsUniversalAccessModalOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black rounded-xl shadow-xs transition flex items-center gap-1.5 active:scale-95"
            title="Device Link, QR Codes, and Multi-Device Share Hub"
          >
            <Smartphone className="w-4 h-4 text-indigo-200" />
            <span className="hidden sm:inline">Device Link (QR &amp; Share)</span>
            <span className="sm:hidden">Device Link</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded font-black">QR</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAndroidApkModalOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl shadow-xs transition flex items-center gap-1.5 active:scale-95"
            title="Download Google Play Store .aab bundle, standalone APK, or export complete Android Build Kit"
          >
            <Smartphone className="w-4 h-4 text-emerald-200" />
            <span>Android App (.aab / APK)</span>
          </button>

          <button
            type="button"
            onClick={() => logoutAdmin()}
            className="px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold rounded-xl border border-rose-500/40 transition"
          >
            Log Out
          </button>

          <button
            type="button"
            onClick={() => setActivePortal('customer')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition"
          >
            Customer Web
          </button>
        </div>
      </div>

      {/* Main Likart Mart Super Admin Command Center */}
      <LikartMartAdminHub />

      {/* Android APK & PWA Hub Modal */}
      <AndroidApkModal
        isOpen={isAndroidApkModalOpen}
        onClose={() => setIsAndroidApkModalOpen(false)}
        portal="admin"
      />

      {/* Website Link & Universal Logins Access Modal */}
      <WebsiteUniversalAccessModal
        isOpen={isUniversalAccessModalOpen}
        onClose={() => setIsUniversalAccessModalOpen(false)}
      />
    </div>
  );
};
