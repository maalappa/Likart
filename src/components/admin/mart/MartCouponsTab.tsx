import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Percent,
  Calendar,
  Image,
  Layers,
  ArrowRight,
  Play,
  Pause,
  Clock,
  Sparkles,
  Zap,
  Sliders,
  Eye,
  ChevronLeft,
  ChevronRight,
  Repeat,
  ArrowLeftRight,
  MonitorPlay,
  Film,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Coupon, BannerPromo } from '../../../types';
import { PhotoUploadInput } from '../../common/PhotoUploadInput';

interface MartCouponsTabProps {
  onLogAudit: (action: 'CREATE' | 'UPDATE' | 'DELETE', module: any, targetId: string, details: string) => void;
}

export const MartCouponsTab: React.FC<MartCouponsTabProps> = ({ onLogAudit }) => {
  const {
    coupons,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCoupon,
    martBanners,
    addMartBanner,
    updateMartBanner,
    deleteMartBanner,
    martBannerConfig,
    updateMartBannerConfig,
    martCategories,
    addNotification,
  } = useApp();

  const [activeSubView, setActiveSubView] = useState<'coupons' | 'banners'>('coupons');
  const [search, setSearch] = useState('');
  const [simulatedSlideIdx, setSimulatedSlideIdx] = useState(0);

  // Coupon Modal
  const [couponModal, setCouponModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    coupon?: Coupon | null;
  }>({ isOpen: false, mode: 'add' });

  // Coupon Form
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(15);
  const [minOrderValue, setMinOrderValue] = useState(199);
  const [maxDiscount, setMaxDiscount] = useState(75);
  const [description, setDescription] = useState('');
  const [expiryDate, setExpiryDate] = useState('2026-12-31');

  // Banner Modal
  const [bannerModal, setBannerModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    banner?: BannerPromo | null;
  }>({ isOpen: false, mode: 'add' });

  // Banner Form
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerCode, setBannerCode] = useState('MART50');
  const [bannerBg, setBannerBg] = useState('from-emerald-700 via-teal-800 to-slate-900');
  const [bannerImage, setBannerImage] = useState('');
  const [bannerLinkText, setBannerLinkText] = useState('Shop 10m Groceries');
  const [bannerTargetCategory, setBannerTargetCategory] = useState('fruits_vegetables');
  const [bannerDiscountText, setBannerDiscountText] = useState('30% OFF');
  const [bannerBadge, setBannerBadge] = useState('MANDI HARVEST');
  const [bannerIsActive, setBannerIsActive] = useState(true);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const openAddCoupon = () => {
    setCode(`EXPRESS${Math.floor(10 + Math.random() * 90)}`);
    setDiscountPercent(20);
    setMinOrderValue(199);
    setMaxDiscount(60);
    setDescription('Flat 20% discount on quick-commerce 10m groceries.');
    setExpiryDate('2026-12-31');
    setCouponModal({ isOpen: true, mode: 'add', coupon: null });
  };

  const openEditCoupon = (c: Coupon) => {
    setCode(c.code);
    setDiscountPercent(c.discountPercent);
    setMinOrderValue(c.minOrderValue);
    setMaxDiscount(c.maxDiscount);
    setDescription(c.description);
    setExpiryDate(c.expiryDate || c.validUntil || '2026-12-31');
    setCouponModal({ isOpen: true, mode: 'edit', coupon: c });
  };

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    if (couponModal.mode === 'add') {
      const newC: Omit<Coupon, 'id'> = {
        code: code.trim().toUpperCase(),
        discountPercent: Number(discountPercent),
        minOrderValue: Number(minOrderValue),
        maxDiscount: Number(maxDiscount),
        description: description.trim(),
        validUntil: expiryDate,
        expiryDate,
        isActive: true,
      };
      addCoupon(newC);
      addNotification('Coupon Created', `Promo coupon ${newC.code} is active.`, 'system');
      onLogAudit('CREATE', 'Coupons', newC.code, `Created grocery coupon ${newC.code} (${discountPercent}%)`);
    } else if (couponModal.coupon) {
      updateCoupon(couponModal.coupon.id, {
        code: code.trim().toUpperCase(),
        discountPercent: Number(discountPercent),
        minOrderValue: Number(minOrderValue),
        maxDiscount: Number(maxDiscount),
        description: description.trim(),
        validUntil: expiryDate,
        expiryDate,
      });
      addNotification('Coupon Updated', `Coupon ${code} updated.`, 'system');
      onLogAudit('UPDATE', 'Coupons', couponModal.coupon.id, `Updated coupon rules for ${code}`);
    }

    setCouponModal({ isOpen: false, mode: 'add', coupon: null });
  };

  const handleDeleteCoupon = (id: string, couponCode: string) => {
    deleteCoupon(id);
    addNotification('Coupon Deleted', `Coupon ${couponCode} removed.`, 'warning');
    onLogAudit('DELETE', 'Coupons', id, `Deleted coupon code ${couponCode}`);
    setDeleteConfirmId(null);
  };

  // Banner handlers
  const openAddBanner = () => {
    setBannerTitle('Farm Fresh Mandi: 6 AM Daily Harvest');
    setBannerSubtitle('Crisp green veggies, fresh fruits and organic produce delivered in 10 minutes');
    setBannerCode('FARM30');
    setBannerDiscountText('30% OFF');
    setBannerBadge('MANDI HARVEST');
    setBannerTargetCategory('fruits_vegetables');
    setBannerBg('from-emerald-700 via-teal-800 to-slate-900');
    setBannerImage('https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=900&auto=format&fit=crop&q=80');
    setBannerLinkText('Shop Fresh Produce');
    setBannerIsActive(true);
    setBannerModal({ isOpen: true, mode: 'add', banner: null });
  };

  const openEditBanner = (b: BannerPromo) => {
    setBannerTitle(b.title);
    setBannerSubtitle(b.subtitle);
    setBannerCode(b.code);
    setBannerDiscountText(b.discountText || '');
    setBannerBadge(b.badge || '');
    setBannerTargetCategory(b.targetCategory || 'all');
    setBannerBg(b.bgColor || 'from-emerald-700 via-teal-800 to-slate-900');
    setBannerImage(b.imageUrl);
    setBannerLinkText(b.linkText);
    setBannerIsActive(b.isActive !== false);
    setBannerModal({ isOpen: true, mode: 'edit', banner: b });
  };

  const handleBannerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle.trim()) return;

    if (bannerModal.mode === 'add') {
      const newB: Omit<BannerPromo, 'id'> = {
        title: bannerTitle.trim(),
        subtitle: bannerSubtitle.trim(),
        code: bannerCode.trim().toUpperCase(),
        bgColor: bannerBg.trim(),
        imageUrl:
          bannerImage.trim() ||
          'https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&auto=format&fit=crop&q=80',
        linkText: bannerLinkText.trim() || 'Shop Now',
        targetCategory: bannerTargetCategory,
        discountText: bannerDiscountText.trim(),
        badge: bannerBadge.trim(),
        isActive: bannerIsActive,
      };
      addMartBanner(newB);
      onLogAudit('CREATE', 'Offers', bannerCode, `Published Mart hero carousel banner: ${newB.title}`);
    } else if (bannerModal.banner) {
      updateMartBanner(bannerModal.banner.id, {
        title: bannerTitle.trim(),
        subtitle: bannerSubtitle.trim(),
        code: bannerCode.trim().toUpperCase(),
        bgColor: bannerBg.trim(),
        imageUrl: bannerImage.trim(),
        linkText: bannerLinkText.trim(),
        targetCategory: bannerTargetCategory,
        discountText: bannerDiscountText.trim(),
        badge: bannerBadge.trim(),
        isActive: bannerIsActive,
      });
      onLogAudit('UPDATE', 'Offers', bannerModal.banner.id, `Updated Mart hero banner ${bannerTitle}`);
    }

    setBannerModal({ isOpen: false, mode: 'add', banner: null });
  };

  const handleDeleteBanner = (id: string, bTitle: string) => {
    deleteMartBanner(id);
    onLogAudit('DELETE', 'Offers', id, `Deleted Mart hero banner ${bTitle}`);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Switcher & Add Header */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubView('coupons')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition ${
              activeSubView === 'coupons'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Mart Coupons ({coupons.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubView('banners')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition ${
              activeSubView === 'banners'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Promotional Hero Banners ({martBanners.length})
          </button>
        </div>

        {activeSubView === 'coupons' ? (
          <button
            type="button"
            onClick={openAddCoupon}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-xs transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Mart Coupon</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={openAddBanner}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-xs transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Spotlight Banner</span>
          </button>
        )}
      </div>

      {/* VIEW 1: COUPONS */}
      {activeSubView === 'coupons' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4 hover:border-emerald-300 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-emerald-800 text-base bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                    {c.code}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleCoupon(c.id)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase transition ${
                      c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {c.isActive ? '● Live' : '○ Paused'}
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">{c.description}</p>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>Discount Rate:</span>
                    <span className="text-emerald-700">{c.discountPercent}% OFF (Max ₹{c.maxDiscount})</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Min Order Value:</span>
                    <span>₹{c.minOrderValue}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[10px]">
                    <span>Expires On:</span>
                    <span>{c.expiryDate || c.validUntil}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => openEditCoupon(c)}
                  className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                  title="Edit coupon"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                {deleteConfirmId === c.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDeleteCoupon(c.id, c.code)}
                      className="px-2 py-1 bg-rose-600 text-white font-bold text-[10px] rounded hover:bg-rose-500"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(null)}
                      className="p-1 text-slate-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(c.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete coupon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 2: BANNERS WITH AUTO SLIDE CONTROLS */}
      {activeSubView === 'banners' && (
        <div className="space-y-5">
          {/* 1. UPGRADED AUTO SLIDE STUDIO & TRANSITION CONFIGURATION CARD */}
          <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-emerald-800/50 shadow-xl space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3.5">
                <div
                  className={`p-3.5 rounded-2xl border shadow-md ${
                    martBannerConfig?.autoSlide !== false
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-950/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-950/40'
                  }`}
                >
                  {martBannerConfig?.autoSlide !== false ? (
                    <Play className="w-6 h-6 fill-emerald-300" />
                  ) : (
                    <Pause className="w-6 h-6 fill-amber-300" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Zap className="w-3 h-3 text-emerald-300" />
                      <span>Slide Engine v2.0</span>
                    </span>
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        martBannerConfig?.autoSlide !== false
                          ? 'bg-emerald-400 text-slate-950 font-bold'
                          : 'bg-amber-400 text-slate-950 font-bold'
                      }`}
                    >
                      {martBannerConfig?.autoSlide !== false ? 'Auto-Slide Active' : 'Auto-Slide Paused'}
                    </span>
                  </div>
                  <h4 className="font-heading font-black text-base sm:text-lg text-white mt-1">
                    Likart Mart Hero Banners Slide Studio
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Customize auto-rotation interval, transition animation physics, interactive indicator styles, and customer touch gestures.
                  </p>
                </div>
              </div>

              {/* Master Play / Pause Action Button */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    const newStatus = martBannerConfig?.autoSlide === false;
                    updateMartBannerConfig({ autoSlide: newStatus });
                    addNotification(
                      'Banner Slide Updated',
                      `Mart hero banners auto-slide ${newStatus ? 'enabled' : 'paused'}.`,
                      'system'
                    );
                  }}
                  className={`px-5 py-2.5 rounded-2xl text-xs font-black transition active:scale-95 flex items-center gap-2 shadow-md ${
                    martBannerConfig?.autoSlide !== false
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950'
                      : 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950'
                  }`}
                >
                  {martBannerConfig?.autoSlide !== false ? (
                    <>
                      <Pause className="w-4 h-4 fill-slate-950" />
                      <span>Pause Auto-Rotation</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>Resume Auto-Rotation</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Controls Grid: Speed & Transitions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
              {/* 1. Interval Speed */}
              <div className="p-3.5 bg-black/30 rounded-2xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Rotation Speed</span>
                  </span>
                  <span className="font-mono text-emerald-300 font-bold">
                    {(martBannerConfig?.intervalMs || 4000) / 1000}s per slide
                  </span>
                </div>
                <select
                  value={martBannerConfig?.intervalMs || 4000}
                  onChange={(e) =>
                    updateMartBannerConfig({ intervalMs: Number(e.target.value) })
                  }
                  className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-xs font-black text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value={2000}>2.0s • Ultra Fast (Flash Deals)</option>
                  <option value={3000}>3.0s • Fast (High Engagement)</option>
                  <option value={4000}>4.0s • Standard (Recommended)</option>
                  <option value={5000}>5.0s • Balanced (Detailed Read)</option>
                  <option value={6000}>6.0s • Cinematic Relaxed</option>
                  <option value={8000}>8.0s • Slow (Extended Display)</option>
                  <option value={10000}>10.0s • Static Kiosk Mode</option>
                </select>
              </div>

              {/* 2. Transition Effect Style */}
              <div className="p-3.5 bg-black/30 rounded-2xl border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Transition Animation</span>
                  </span>
                  <span className="font-mono text-purple-300 font-bold uppercase text-[10px]">
                    {martBannerConfig?.transitionEffect || 'slide'}
                  </span>
                </div>
                <select
                  value={martBannerConfig?.transitionEffect || 'slide'}
                  onChange={(e) =>
                    updateMartBannerConfig({
                      transitionEffect: e.target.value as any,
                    })
                  }
                  className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-xs font-black text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="slide">🔄 Smooth Horizontal Slide</option>
                  <option value="fade">✨ Cinematic Crossfade</option>
                  <option value="zoom">🔍 Dynamic Zoom & Scale</option>
                  <option value="flip">🎴 3D Perspective Card Flip</option>
                </select>
              </div>

              {/* 3. Toggles 1: Progress & Indicators */}
              <div className="p-3.5 bg-black/30 rounded-2xl border border-white/10 space-y-2.5">
                <span className="font-bold text-slate-300 text-xs block">Visual Indicators</span>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={martBannerConfig?.showProgressBar !== false}
                      onChange={(e) =>
                        updateMartBannerConfig({ showProgressBar: e.target.checked })
                      }
                      className="rounded accent-emerald-500 w-3.5 h-3.5"
                    />
                    <span className="text-[11px]">Countdown Progress Bar</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={martBannerConfig?.showDots !== false}
                      onChange={(e) =>
                        updateMartBannerConfig({ showDots: e.target.checked })
                      }
                      className="rounded accent-emerald-500 w-3.5 h-3.5"
                    />
                    <span className="text-[11px]">Pill Dot Indicators</span>
                  </label>
                </div>
              </div>

              {/* 4. Toggles 2: Arrows & Interactions */}
              <div className="p-3.5 bg-black/30 rounded-2xl border border-white/10 space-y-2.5">
                <span className="font-bold text-slate-300 text-xs block">Interaction Options</span>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={martBannerConfig?.showArrows !== false}
                      onChange={(e) =>
                        updateMartBannerConfig({ showArrows: e.target.checked })
                      }
                      className="rounded accent-emerald-500 w-3.5 h-3.5"
                    />
                    <span className="text-[11px]">Left / Right Arrows</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={martBannerConfig?.pauseOnHover !== false}
                      onChange={(e) =>
                        updateMartBannerConfig({ pauseOnHover: e.target.checked })
                      }
                      className="rounded accent-emerald-500 w-3.5 h-3.5"
                    />
                    <span className="text-[11px]">Pause on Hover</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Live Interactive Slide Simulator */}
            {martBanners.length > 0 && (
              <div className="p-4 bg-black/40 rounded-2xl border border-white/15 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                    <MonitorPlay className="w-4 h-4 text-emerald-400" />
                    <span>Live Slide Simulator ({martBanners.length} Banners)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                    <span>Active Slide: {simulatedSlideIdx + 1} / {martBanners.length}</span>
                  </div>
                </div>

                {/* Simulated Mini Banner Card */}
                {(() => {
                  const b = martBanners[simulatedSlideIdx % martBanners.length] || martBanners[0];
                  return (
                    <div className="relative rounded-2xl overflow-hidden p-4 sm:p-5 text-white flex flex-col justify-between min-h-[140px] bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 border border-white/20 shadow-inner">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-200 rounded-full text-[10px] font-black uppercase">
                            Preview
                          </span>
                          {b.badge && (
                            <span className="px-2 py-0.5 bg-amber-400 text-slate-950 rounded-full text-[10px] font-black uppercase">
                              {b.badge}
                            </span>
                          )}
                          {b.discountText && (
                            <span className="px-2 py-0.5 bg-rose-600 text-white rounded-full text-[10px] font-black uppercase">
                              {b.discountText}
                            </span>
                          )}
                        </div>

                        {/* Prev / Next Simulator Controls */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setSimulatedSlideIdx(
                                (prev) => (prev - 1 + martBanners.length) % martBanners.length
                              )
                            }
                            className="p-1.5 bg-black/50 hover:bg-black/70 rounded-lg text-white transition"
                            title="Previous slide"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setSimulatedSlideIdx((prev) => (prev + 1) % martBanners.length)
                            }
                            className="p-1.5 bg-black/50 hover:bg-black/70 rounded-lg text-white transition"
                            title="Next slide"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-2">
                        <h5 className="font-heading font-black text-base text-white">{b.title}</h5>
                        <p className="text-xs text-slate-200 line-clamp-1">{b.subtitle}</p>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-300 pt-2 border-t border-white/10">
                        <span>Target Category: <strong className="text-white">{b.targetCategory || 'Mandi Harvest'}</strong></span>
                        <span>Promo Code: <strong className="text-emerald-300 font-mono">{b.code || 'None'}</strong></span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* 2. MART BANNERS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {martBanners.map((b) => {
              const targetCatObj = martCategories.find((c) => c.id === b.targetCategory);
              return (
                <div
                  key={b.id}
                  className={`bg-white rounded-3xl border overflow-hidden shadow-2xs space-y-3 transition flex flex-col justify-between ${
                    b.isActive !== false
                      ? 'border-slate-200 hover:border-emerald-300'
                      : 'border-slate-200 opacity-60 bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="relative h-44 bg-slate-900 overflow-hidden group">
                      <img
                        src={b.imageUrl}
                        alt={b.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent p-4 flex flex-col justify-between text-white">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {b.badge && (
                              <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full shadow-2xs">
                                {b.badge}
                              </span>
                            )}
                            {b.discountText && (
                              <span className="text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                                {b.discountText}
                              </span>
                            )}
                          </div>

                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              b.isActive !== false
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-600 text-white'
                            }`}
                          >
                            {b.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        <div>
                          <span className="font-mono text-[10px] font-black uppercase text-amber-300 block mb-1">
                            PROMO CODE: {b.code}
                          </span>
                          <h4 className="font-heading font-black text-base leading-tight text-white line-clamp-1">
                            {b.title}
                          </h4>
                          <p className="text-xs text-white/80 line-clamp-1 mt-0.5">
                            {b.subtitle}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Metadata bar */}
                    <div className="p-4 pb-0 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400 font-medium">Target Aisle:</span>
                        <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                          {targetCatObj ? `${targetCatObj.icon} ${targetCatObj.name}` : 'All Aisles'}
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-700 font-black">
                        Button: {b.linkText || 'Shop Now'}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-4 pt-1 border-t border-slate-100 flex items-center justify-between text-xs">
                    {/* Toggle Active status */}
                    <button
                      type="button"
                      onClick={() =>
                        updateMartBanner(b.id, { isActive: b.isActive === false ? true : false })
                      }
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition ${
                        b.isActive !== false
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      {b.isActive !== false ? '✓ Showing on Storefront' : 'Hidden from Storefront'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditBanner(b)}
                        className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                        title="Edit banner"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {deleteConfirmId === b.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleDeleteBanner(b.id, b.title)}
                            className="px-2 py-1 bg-rose-600 text-white font-bold text-[10px] rounded hover:bg-rose-500"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="p-1 text-slate-400"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(b.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete banner"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ADD / EDIT COUPON MODAL */}
      {couponModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in scale-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-emerald-100 text-emerald-700">
                  <Tag className="w-4 h-4" />
                </span>
                <h3 className="font-heading font-black text-base text-slate-900">
                  {couponModal.mode === 'add' ? 'Create Mart Coupon' : 'Edit Coupon'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCouponModal({ isOpen: false, mode: 'add', coupon: null })}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCouponSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. MART20"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase font-bold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Discount %</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    required
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description / Offer Text</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Flat 20% discount on carts above ₹199..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCouponModal({ isOpen: false, mode: 'add', coupon: null })}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT BANNER MODAL */}
      {bannerModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in scale-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-black text-base text-slate-900">
                {bannerModal.mode === 'add' ? 'Add Carousel Spotlight Banner' : 'Edit Spotlight Banner'}
              </h3>
              <button
                type="button"
                onClick={() => setBannerModal({ isOpen: false, mode: 'add', banner: null })}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBannerSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Banner Title *</label>
                <input
                  type="text"
                  required
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  placeholder="e.g. 10-Minute Farm Fresh Vegetables"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subtitle</label>
                <input
                  type="text"
                  value={bannerSubtitle}
                  onChange={(e) => setBannerSubtitle(e.target.value)}
                  placeholder="Crisp greens, tomatoes, potatoes delivered instantly"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Category / Aisle</label>
                  <select
                    value={bannerTargetCategory}
                    onChange={(e) => setBannerTargetCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold cursor-pointer"
                  >
                    <option value="all">⚡ All Aisles</option>
                    {martCategories
                      .filter((c) => c.id !== 'all')
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.icon} {c.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Corner Badge Tag</label>
                  <input
                    type="text"
                    value={bannerBadge}
                    onChange={(e) => setBannerBadge(e.target.value)}
                    placeholder="e.g. MANDI HARVEST"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl uppercase font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Discount Tag</label>
                  <input
                    type="text"
                    value={bannerDiscountText}
                    onChange={(e) => setBannerDiscountText(e.target.value)}
                    placeholder="e.g. 30% OFF"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Linked Coupon</label>
                  <input
                    type="text"
                    value={bannerCode}
                    onChange={(e) => setBannerCode(e.target.value)}
                    placeholder="MART10"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Button Text</label>
                  <input
                    type="text"
                    value={bannerLinkText}
                    onChange={(e) => setBannerLinkText(e.target.value)}
                    placeholder="Shop Now"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              {/* Background Gradient Palette */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Gradient Theme</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { label: 'Emerald', bg: 'from-emerald-700 via-teal-800 to-slate-900' },
                    { label: 'Amber', bg: 'from-amber-600 via-orange-600 to-rose-700' },
                    { label: 'Purple', bg: 'from-indigo-700 via-purple-700 to-pink-700' },
                    { label: 'Blue', bg: 'from-blue-700 via-cyan-700 to-teal-800' },
                    { label: 'Sky', bg: 'from-sky-700 via-teal-700 to-emerald-800' },
                    { label: 'Rose', bg: 'from-rose-700 via-pink-700 to-purple-800' },
                  ].map((grad) => (
                    <button
                      key={grad.label}
                      type="button"
                      onClick={() => setBannerBg(grad.bg)}
                      className={`h-8 rounded-xl bg-gradient-to-r ${grad.bg} border-2 flex items-center justify-center text-[10px] font-black text-white shadow-2xs ${
                        bannerBg === grad.bg ? 'border-white ring-2 ring-emerald-500 scale-105' : 'border-transparent'
                      }`}
                    >
                      {grad.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Toggle Switch */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="font-black text-slate-800 block text-xs">
                    Show Banner on Storefront Carousel
                  </span>
                  <span className="text-[11px] text-slate-500">
                    If active, banner will be included in the auto-slide rotation
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setBannerIsActive(!bannerIsActive)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                    bannerIsActive ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
                  }`}
                >
                  <span className="bg-white w-4 h-4 rounded-full shadow-md transform transition" />
                </button>
              </div>

              <PhotoUploadInput
                label="Hero Banner Photo"
                value={bannerImage}
                onChange={(photoUrl) => setBannerImage(photoUrl)}
                martMode={true}
                helperText="Upload hero promotional banner (PNG, JPG, WEBP, GIF, SVG, AVIF, HEIC) or select from library."
                required
              />

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBannerModal({ isOpen: false, mode: 'add', banner: null })}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
