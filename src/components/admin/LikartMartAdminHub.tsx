import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Zap,
  ShoppingBag,
  Store,
  Users,
  MapPin,
  CreditCard,
  Tag,
  Compass,
  DollarSign,
  HelpCircle,
  Volume2,
  Download,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Search,
  RotateCcw,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  X,
  Check,
  Play,
  VolumeX,
  FileSpreadsheet,
  Printer,
  Sparkles,
  Layers,
  ArrowRight,
  Bike,
  ShieldAlert,
  Percent,
  Bell,
  Star,
  Package,
  PackageCheck,
  FileText,
  Lock,
  Key,
  Eye,
  EyeOff,
  Copy,
  Power,
  Upload,
  Radio,
  Pause,
  FileCheck,
  RefreshCw,
  Settings,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { readAudioFileAsDataUrl } from '../../utils/soundUtils';
import { exportMartReportToPDF } from '../../utils/martReportPdfGenerator';
import { exportMartTallyReportToPDF } from '../../utils/martTallyPdfGenerator';
import {
  DarkStoreHub,
  DarkStoreManager,
  Order,
  OrderStatus,
  Coupon,
  BannerPromo,
  SupportTicket,
  PaymentGatewayItem,
  DeliveryZone,
  QuickCommerceItem,
  QuickCommerceCategory,
  MartOffer,
  MartReview,
  MartStaffUser,
  MartRoleConfig,
  MartAuditLog,
} from '../../types';
import {
  QUICK_COMMERCE_ITEMS,
  QUICK_COMMERCE_CATEGORIES,
  INITIAL_MART_OFFERS,
  INITIAL_MART_REVIEWS,
  INITIAL_MART_USERS,
  INITIAL_MART_ROLES,
  INITIAL_MART_AUDIT_LOGS,
} from '../../data/quickCommerceData';

import { MartOrdersTab } from './mart/MartOrdersTab';
import { MartCustomersTab } from './mart/MartCustomersTab';
import { MartRidersTab } from './mart/MartRidersTab';
import { MartProductsTab } from './mart/MartProductsTab';
import { MartCategoriesTab } from './mart/MartCategoriesTab';
import { MartInventoryTab } from './mart/MartInventoryTab';
import { MartOffersTab } from './mart/MartOffersTab';
import { MartPaymentsTab } from './mart/MartPaymentsTab';
import { MartPayoutsTab } from './mart/MartPayoutsTab';
import { MartCouponsTab } from './mart/MartCouponsTab';
import { MartNotificationsTab } from './mart/MartNotificationsTab';
import { MartReviewsTab } from './mart/MartReviewsTab';
import { MartSupportTab } from './mart/MartSupportTab';
import { MartUsersRolesTab } from './mart/MartUsersRolesTab';
import { MartPermissionsTab } from './mart/MartPermissionsTab';
import { MartAuditLogsTab } from './mart/MartAuditLogsTab';
import { LiveMap } from '../common/LiveMap';
import { ZoneModal } from './modals/ZoneModal';
import { reverseGeocodeLocation } from '../../utils/geoUtils';
import { Navigation, Locate } from 'lucide-react';

export const LikartMartAdminHub: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    cancelOrder,
    deliveryPartners,
    allCustomers,
    zones,
    addZone,
    updateZone,
    deleteZone,
    paymentGateways,
    updatePaymentGateway,
    coupons,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    banners,
    addBanner,
    updateBanner,
    deleteBanner,
    googleMapsKeys,
    testGoogleMapsKey,
    payoutRequests,
    settlePayout,
    rejectPayout,
    supportTickets,
    replySupportTicket,
    notifications,
    addNotification,
    darkStores,
    addDarkStore,
    updateDarkStore,
    deleteDarkStore,
    toggleDarkStoreStatus,
    toggleDarkStoreActiveStatus,
    martServiceConfig,
    toggleMartServiceStatus,
    updateMartServiceConfig,
    darkStoreManagers,
    addDarkStoreManager,
    updateDarkStoreManager,
    deleteDarkStoreManager,
    martSoundSettings,
    updateMartSoundSettings,
    martProducts,
    setMartProducts,
    martCategories,
    setMartCategories,
    martOffers,
    setMartOffers,
    martReviews,
    setMartReviews,
    martStaffUsers,
    setMartStaffUsers,
    martRoleConfigs,
    setMartRoleConfigs,
    martAuditLogs,
    setMartAuditLogs,
    addMartAuditLog,
  } = useApp();

  // Active sub-tab
  const [subTab, setSubTab] = useState<
    | 'overview'
    | 'orders'
    | 'customers'
    | 'riders'
    | 'stores'
    | 'managers'
    | 'products'
    | 'categories'
    | 'inventory'
    | 'offers'
    | 'payments'
    | 'payouts'
    | 'coupons'
    | 'notifications'
    | 'reviews'
    | 'support'
    | 'users_roles'
    | 'permissions'
    | 'audit_logs'
    | 'zones'
    | 'sounds'
    | 'maps'
    | 'reports'
  >('overview');

  const handleLogAudit = (
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'PAYOUT_SETTLE' | 'NOTIFICATION_DISPATCH',
    module: any,
    targetId: string,
    details: string
  ) => {
    addMartAuditLog(action as any, module, targetId, details);
  };

  // Search & Filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | OrderStatus>('all');
  const [storeSearch, setStoreSearch] = useState('');
  const [storeFilterStatus, setStoreFilterStatus] = useState<'all' | 'active' | 'deactivated'>('all');
  const [managerSearch, setManagerSearch] = useState('');

  // Modals state
  const [storeModal, setStoreModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    data?: DarkStoreHub | null;
  }>({ isOpen: false, mode: 'add' });

  const [storeDeactivateModal, setStoreDeactivateModal] = useState<{
    isOpen: boolean;
    store: DarkStoreHub | null;
    reason: string;
  }>({
    isOpen: false,
    store: null,
    reason: '',
  });

  const [martServiceModal, setMartServiceModal] = useState<{
    isOpen: boolean;
    notice: string;
  }>({
    isOpen: false,
    notice: '',
  });

  const [managerModal, setManagerModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    data?: DarkStoreManager | null;
  }>({ isOpen: false, mode: 'add' });

  const [managerCredentialModal, setManagerCredentialModal] = useState<{
    isOpen: boolean;
    manager: DarkStoreManager | null;
  }>({ isOpen: false, manager: null });

  const [zoneModal, setZoneModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    data?: DeliveryZone | null;
  }>({ isOpen: false, mode: 'add' });

  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [bannerModalOpen, setBannerModalOpen] = useState(false);

  // Sound preview & upload states
  const [isPlayingTestTone, setIsPlayingTestTone] = useState(false);
  const [isUploadingMartAudio, setIsUploadingMartAudio] = useState(false);
  const [martAudioUploadError, setMartAudioUploadError] = useState<string | null>(null);
  const [customAudioPlayer, setCustomAudioPlayer] = useState<HTMLAudioElement | null>(null);
  const [isPlayingCustomAudio, setIsPlayingCustomAudio] = useState(false);
  const [isSimulatingMartRinging, setIsSimulatingMartRinging] = useState(false);
  const martRingingIntervalRef = useRef<any>(null);

  // PDF report states
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingTallyPdf, setIsGeneratingTallyPdf] = useState(false);
  const [reportPeriodScope, setReportPeriodScope] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [tallyPodFilter, setTallyPodFilter] = useState<string>('all');
  const [tallyReportType, setTallyReportType] = useState<'all' | 'day_book' | 'ledger' | 'stock' | 'gst'>('all');
  const [isTallyConfigModalOpen, setIsTallyConfigModalOpen] = useState(false);
  const [tallyCompanyName, setTallyCompanyName] = useState('LIKART MART QUICK-COMMERCE (INDIA) PVT. LTD.');
  const [tallyGstin, setTallyGstin] = useState('29AABCL8899K1Z4');
  const [tallyFinancialYear, setTallyFinancialYear] = useState('FY 2025-2026');

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

  const filteredMartOrders = useMemo(() => {
    return martOrders.filter((o) => {
      if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) return false;
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase().trim();
        const idMatch = o.id.toLowerCase().includes(q);
        const custMatch = o.customerName.toLowerCase().includes(q);
        const phoneMatch = o.customerPhone.includes(q);
        const itemMatch = o.items.some((i) => i.name.toLowerCase().includes(q));
        if (!idMatch && !custMatch && !phoneMatch && !itemMatch) return false;
      }
      return true;
    });
  }, [martOrders, orderStatusFilter, orderSearch]);

  // Dark stores stats
  const totalStores = darkStores.length;
  const openStores = darkStores.filter((s) => s.isOpen).length;
  const martRevenue = martOrders
    .filter((o) => o.status !== 'cancelled')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  // Audio preview generator using Web Audio API
  const playMartSoundPreview = (tone: string) => {
    // If custom audio uploaded, play the custom file
    if (tone === 'custom' && martSoundSettings.customAudioUrl) {
      try {
        if (customAudioPlayer) {
          customAudioPlayer.pause();
        }
        const audio = new Audio(martSoundSettings.customAudioUrl);
        audio.volume = (martSoundSettings.volume || 80) / 100;
        setIsPlayingTestTone(true);
        audio.onended = () => setIsPlayingTestTone(false);
        audio.onerror = () => setIsPlayingTestTone(false);
        audio.play().then(() => {
          setCustomAudioPlayer(audio);
        }).catch(() => setIsPlayingTestTone(false));
        setTimeout(() => setIsPlayingTestTone(false), 3000);
      } catch {
        setIsPlayingTestTone(false);
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const volumeRatio = (martSoundSettings.volume || 80) / 100;
      gain.gain.value = volumeRatio * 0.3;

      if (tone === 'siren') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(450, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.3);
        osc.frequency.linearRampToValueAtTime(450, ctx.currentTime + 0.6);
        osc.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.9);
      } else if (tone === 'express_bell') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.8);
      } else if (tone === 'radar_pulse') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.5);
      } else {
        // dispatch_beep
        osc.type = 'square';
        osc.frequency.setValueAtTime(1046.5, ctx.currentTime);
        osc.frequency.setValueAtTime(1318.5, ctx.currentTime + 0.15);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      setIsPlayingTestTone(true);
      setTimeout(() => {
        osc.stop();
        ctx.close();
        setIsPlayingTestTone(false);
      }, 1000);
    } catch (err) {
      console.warn('Audio preview failed:', err);
      setIsPlayingTestTone(false);
    }
  };

  // Audio Upload Handler for Mart Alert Sounds
  const handleUploadMartAudioFile = async (file: File) => {
    try {
      setMartAudioUploadError(null);
      setIsUploadingMartAudio(true);
      const audioData = await readAudioFileAsDataUrl(file);
      updateMartSoundSettings({
        soundType: 'custom',
        customAudioUrl: audioData.dataUrl,
        customAudioFileName: audioData.fileName,
        customAudioSizeKb: audioData.fileSizeKb,
        customAudioDurationSecs: audioData.durationSecs,
      });
      addNotification(
        'Mart Audio Alert Uploaded',
        `Custom tune "${audioData.fileName}" (${audioData.fileSizeKb} KB) activated for 10-minute grocery order alerts.`,
        'system'
      );
    } catch (err: any) {
      setMartAudioUploadError(err?.message || 'Failed to process audio file.');
    } finally {
      setIsUploadingMartAudio(false);
    }
  };

  // Continuous Simulation of Mart Ringing
  const handleToggleMartRingingSimulation = () => {
    if (isSimulatingMartRinging) {
      if (martRingingIntervalRef.current) {
        clearInterval(martRingingIntervalRef.current);
        martRingingIntervalRef.current = null;
      }
      if (customAudioPlayer) {
        customAudioPlayer.pause();
        customAudioPlayer.currentTime = 0;
      }
      setIsSimulatingMartRinging(false);
      return;
    }

    setIsSimulatingMartRinging(true);
    if (martSoundSettings.soundType === 'custom' && martSoundSettings.customAudioUrl) {
      const audio = new Audio(martSoundSettings.customAudioUrl);
      audio.volume = (martSoundSettings.volume || 80) / 100;
      audio.loop = true;
      audio.play().catch(() => {});
      setCustomAudioPlayer(audio);
    } else {
      playMartSoundPreview(martSoundSettings.soundType);
      martRingingIntervalRef.current = setInterval(() => {
        playMartSoundPreview(martSoundSettings.soundType);
      }, 1400);
    }
  };

  // Upgraded PDF Report Generator for Likart Mart
  const handleDownloadMartPdfReport = () => {
    setIsGeneratingPdf(true);
    try {
      exportMartReportToPDF({
        orders: martOrders,
        darkStores,
        categories: martCategories,
        items: martProducts,
        auditLogs: martAuditLogs,
        reportTitle: 'Likart Mart Quick-Commerce Executive Performance & Fulfillment Audit',
        generatedBy: 'Super Administrator',
        periodLabel:
          reportPeriodScope === 'today'
            ? "Today's Active Fulfillment Shift"
            : reportPeriodScope === 'week'
            ? 'Past 7 Days Quick-Commerce Analytics'
            : reportPeriodScope === 'month'
            ? 'Current Month Operations & SLA Audit'
            : 'All-Time Historical & Live Dispatch Ledger',
      });
      addNotification(
        'Executive PDF Generated',
        'Official Likart Mart PDF audit report downloaded successfully.',
        'order'
      );
    } catch (err: any) {
      console.error('PDF generation error:', err);
      addNotification('Report Error', 'Could not compile PDF report.', 'system');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Upgraded Tally ERP Financial & Accounting PDF Report Generator
  const handleDownloadMartTallyReport = (overridePod: string = tallyPodFilter) => {
    setIsGeneratingTallyPdf(true);
    try {
      exportMartTallyReportToPDF({
        orders: martOrders,
        darkStores,
        categories: martCategories,
        items: martProducts,
        periodScope: reportPeriodScope,
        podFilter: overridePod,
        reportType: tallyReportType,
        companyName: tallyCompanyName,
        gstin: tallyGstin,
        financialYear: tallyFinancialYear,
        generatedBy: 'Super Administrator & Finance Desk',
      });
      addNotification(
        'Tally PDF Generated',
        'Official Likart Mart Tally.ERP 9 / TallyPrime double-entry statement downloaded.',
        'order'
      );
    } catch (err: any) {
      console.error('Tally PDF generation error:', err);
      addNotification('Tally Report Error', 'Could not compile Tally PDF report.', 'system');
    } finally {
      setIsGeneratingTallyPdf(false);
    }
  };

  // Export CSV Report
  const handleExportMartCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer', 'Items Count', 'Total (INR)', 'Payment', 'Status', 'SLA (Mins)'];
    const rows = martOrders.map((o) => [
      o.id,
      new Date(o.createdAt).toLocaleString(),
      o.customerName,
      o.items.length,
      o.totalAmount,
      o.paymentMethod.toUpperCase(),
      o.status.toUpperCase(),
      '10-12 Mins',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((cell) => `"${cell}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Likart_Mart_Audit_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addNotification('Report Downloaded', 'Likart Mart quick-commerce audit CSV exported.', 'system');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner: Super Admin Quick-Commerce Hub */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-5 sm:p-7 shadow-xl border border-emerald-800/60">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 fill-emerald-300 text-emerald-300" />
                <span>Likart Mart Command Center</span>
              </span>
              <span className="text-[11px] font-bold bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-300/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Super Admin Full Access Active</span>
              </span>
              <span className="text-[11px] font-bold bg-white/10 text-emerald-200 px-2.5 py-0.5 rounded-full border border-white/10">
                10-Minute Dispatch SLA
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white leading-tight">
              Likart Mart (10m Groceries) Operations Hub
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Super Admin management suite for dark stores, store managers, express delivery zones,
              gateways, express coupons &amp; banners, Google Maps routing, payouts, support tickets, order alert sounds, and audit reports.
            </p>
          </div>

          {/* Quick Metrics & Master Service Controls */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Master Likart Mart Service Active/Deactivate Switch */}
            <div className={`backdrop-blur-md px-4 py-3 rounded-2xl border text-left min-w-[170px] flex flex-col justify-between transition ${
              martServiceConfig?.isActive !== false
                ? 'bg-emerald-950/60 border-emerald-500/40'
                : 'bg-rose-950/70 border-rose-500/60'
            }`}>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-200">
                  Likart Mart Service
                </span>
                <span className={`w-2.5 h-2.5 rounded-full ${martServiceConfig?.isActive !== false ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className={`text-xs font-black uppercase ${martServiceConfig?.isActive !== false ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {martServiceConfig?.isActive !== false ? 'ONLINE (ACTIVE)' : 'DEACTIVATED'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (martServiceConfig?.isActive !== false) {
                      setMartServiceModal({
                        isOpen: true,
                        notice: martServiceConfig?.deactivationNotice || 'Likart Mart is currently paused for scheduled inventory replenishment.',
                      });
                    } else {
                      toggleMartServiceStatus(true);
                    }
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-xs active:scale-95 ${
                    martServiceConfig?.isActive !== false
                      ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/50'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black'
                  }`}
                  title={martServiceConfig?.isActive !== false ? 'Deactivate entire Likart Mart service' : 'Activate Likart Mart service'}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{martServiceConfig?.isActive !== false ? 'Deactivate' : 'Activate'}</span>
                </button>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-center min-w-[110px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block">
                Active Pods
              </span>
              <span className="text-xl font-black text-white">
                {openStores} / {totalStores}
              </span>
              <span className="text-[10px] text-emerald-300 block font-semibold">
                ● Live 24x7
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-center min-w-[110px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block">
                10m Orders
              </span>
              <span className="text-xl font-black text-white">
                {martOrders.length}
              </span>
              <span className="text-[10px] text-amber-300 block font-semibold">
                ₹{martRevenue.toLocaleString()} GMV
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-center min-w-[110px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block">
                SLA Compliance
              </span>
              <span className="text-xl font-black text-white">
                98.4%
              </span>
              <span className="text-[10px] text-emerald-300 block font-semibold">
                &lt; 10 Mins Avg
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Global Mart Deactivated Alert Banner */}
      {martServiceConfig?.isActive === false && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 border-2 border-rose-500/80 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl animate-in fade-in">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-3 bg-rose-500/20 text-rose-300 rounded-2xl border border-rose-500/40 shrink-0">
              <ShieldAlert className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-heading font-black text-base text-white">
                  Likart Mart Service is Currently DEACTIVATED by Super Admin
                </h4>
                <span className="text-[10px] bg-rose-500 text-white font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Customer Storefront Paused
                </span>
              </div>
              <p className="text-xs text-rose-200/90 mt-1 max-w-2xl leading-relaxed">
                Notice: <strong className="text-white">{martServiceConfig?.deactivationNotice || 'Likart Mart quick-commerce ordering is temporarily suspended.'}</strong>
                {martServiceConfig?.deactivatedAt && ` (Deactivated: ${martServiceConfig.deactivatedAt})`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggleMartServiceStatus(true)}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition shadow-lg flex items-center gap-2 shrink-0 active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Turn ON Likart Mart</span>
          </button>
        </div>
      )}

      {/* 2. Sub-Tabs Navigation Strip */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'orders', label: `Orders (${martOrders.length})`, icon: ShoppingBag },
          { id: 'customers', label: `Customers (${allCustomers?.length || 0})`, icon: Users },
          { id: 'riders', label: `Delivery Partners (${deliveryPartners.length})`, icon: Bike },
          { id: 'stores', label: `Dark Stores (${darkStores.length})`, icon: Store },
          { id: 'managers', label: `Store Managers (${darkStoreManagers.length})`, icon: Users },
          { id: 'products', label: `Products (${martProducts.length})`, icon: Package },
          { id: 'categories', label: `Categories (${martCategories.length})`, icon: Layers },
          { id: 'inventory', label: `Inventory`, icon: PackageCheck },
          { id: 'offers', label: `Offers (${martOffers.length})`, icon: Sparkles },
          { id: 'payments', label: `Payments (${paymentGateways.length})`, icon: CreditCard },
          { id: 'payouts', label: `Partner Payouts (${payoutRequests.length})`, icon: DollarSign },
          { id: 'coupons', label: `Coupons & Banners`, icon: Tag },
          { id: 'notifications', label: `Notifications (${notifications.length})`, icon: Bell },
          { id: 'reviews', label: `Reviews (${martReviews.length})`, icon: Star },
          { id: 'support', label: `Support Tickets (${supportTickets.length})`, icon: HelpCircle },
          { id: 'users_roles', label: `Users & Roles (${martStaffUsers.length})`, icon: ShieldCheck },
          { id: 'permissions', label: `Permissions`, icon: Lock },
          { id: 'audit_logs', label: `Audit Logs (${martAuditLogs.length})`, icon: FileText },
          { id: 'zones', label: `Delivery Zones (${zones.length})`, icon: MapPin },
          { id: 'sounds', label: `Order Alert Sounds`, icon: Volume2 },
          { id: 'maps', label: `Google Maps & API Keys`, icon: Compass },
          { id: 'reports', label: `Reports & Audits`, icon: Download },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black whitespace-nowrap transition active:scale-95 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* SUB-TAB 1: OVERVIEW & SLA METRICS                              */}
      {/* ============================================================== */}
      {subTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                10-Minute Mart GMV
              </span>
              <p className="text-2xl font-black font-heading text-slate-900">
                ₹{martRevenue.toLocaleString()}
              </p>
              <span className="text-xs text-emerald-600 font-bold block">
                ↑ +28.5% express grocery demand
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Live Dark Store Pods
              </span>
              <p className="text-2xl font-black font-heading text-emerald-600">
                {openStores} / {totalStores}
              </p>
              <span className="text-xs text-slate-500 font-medium block">
                Serving 2.5–3.0 km radius per hub
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Catalog SKUs Stocked
              </span>
              <p className="text-2xl font-black font-heading text-purple-600">
                {martProducts.length} SKUs
              </p>
              <span className="text-xs text-slate-500 font-medium block">
                Dairy, produce, munchies &amp; cleaning
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Assigned Express Riders
              </span>
              <p className="text-2xl font-black font-heading text-blue-600">
                {darkStores.reduce((acc, s) => acc + s.activeRidersCount, 0)} Riders
              </p>
              <span className="text-xs text-emerald-600 font-bold block">
                Active in 10-min zones
              </span>
            </div>
          </div>

          {/* Dark Store Hubs Live Status Shelf */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-black text-base text-slate-900">
                  Dark Stores &amp; Micro-Fulfillment Pod Status
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time status of robotic pods and dispatch capacity
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSubTab('stores')}
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <span>Manage all stores</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {darkStores.map((store) => (
                <div
                  key={store.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {store.code}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">{store.name}</h4>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        store.isOpen
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {store.isOpen ? 'LIVE OPEN' : 'PAUSED'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 truncate">{store.address}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        SLA Target
                      </span>
                      <strong className="text-slate-800">{store.slaMinutes} Mins</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        Active Fleet
                      </span>
                      <strong className="text-slate-800">{store.activeRidersCount} Riders</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleDarkStoreStatus(store.id)}
                    className={`w-full py-1.5 px-3 rounded-xl text-xs font-black transition border ${
                      store.isOpen
                        ? 'bg-white hover:bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600'
                    }`}
                  >
                    {store.isOpen ? 'Pause Store Pod' : 'Activate Store Pod'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 2: MART ORDERS (ADD, EDIT, DELETE, STATUS, SLA)        */}
      {/* ============================================================== */}
      {subTab === 'orders' && (
        <MartOrdersTab products={martProducts} onLogAudit={handleLogAudit} />
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 3: CUSTOMERS (ADD, EDIT, DELETE, WALLET, DETAILS)      */}
      {/* ============================================================== */}
      {subTab === 'customers' && (
        <MartCustomersTab onLogAudit={handleLogAudit} />
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 4: DELIVERY PARTNERS (ADD, EDIT, DELETE, VEHICLES)     */}
      {/* ============================================================== */}
      {subTab === 'riders' && (
        <MartRidersTab onLogAudit={handleLogAudit} />
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 3: DARK STORES & HUBS                                  */}
      {/* ============================================================== */}
      {subTab === 'stores' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-heading font-black text-base text-slate-900">
                Likart Mart Dark Stores &amp; Pod Hubs ({darkStores.length})
              </h3>
              <p className="text-xs text-slate-500">
                Super Admin control to activate/deactivate fulfillment pods, manage dispatch radius, active fleet, and operating hours
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStoreModal({ isOpen: true, mode: 'add' })}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Dark Store Pod</span>
              </button>
            </div>
          </div>

          {/* Filter Bar & Super Admin Access Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setStoreFilterStatus('all')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  storeFilterStatus === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Pods ({darkStores.length})
              </button>
              <button
                type="button"
                onClick={() => setStoreFilterStatus('active')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  storeFilterStatus === 'active'
                    ? 'bg-emerald-600 text-white shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-300" />
                <span>Active ({darkStores.filter((s) => s.isActive !== false).length})</span>
              </button>
              <button
                type="button"
                onClick={() => setStoreFilterStatus('deactivated')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  storeFilterStatus === 'deactivated'
                    ? 'bg-rose-600 text-white shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-300" />
                <span>Deactivated ({darkStores.filter((s) => s.isActive === false).length})</span>
              </button>
            </div>

            <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/80 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Likart Mart Super Admin: Full Store Active / Deactivate Control</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {darkStores
              .filter((s) => {
                if (storeFilterStatus === 'active') return s.isActive !== false;
                if (storeFilterStatus === 'deactivated') return s.isActive === false;
                return true;
              })
              .map((store) => {
                const isStoreActive = store.isActive !== false;

                return (
                  <div
                    key={store.id}
                    className={`p-5 rounded-2xl border transition flex flex-col justify-between space-y-3 ${
                      !isStoreActive
                        ? 'bg-rose-50/30 border-rose-200/90 shadow-2xs'
                        : 'bg-white border-slate-200/90 hover:border-emerald-400 shadow-2xs'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            {store.code}
                          </span>
                          <h4 className="font-heading font-black text-sm text-slate-900">
                            {store.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                          {isStoreActive ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                              <span>ACTIVE</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                              <span>DEACTIVATED</span>
                            </span>
                          )}

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              store.isOpen && isStoreActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {store.isOpen && isStoreActive ? 'OPEN' : 'CLOSED'}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500">{store.address}</p>

                      {/* Deactivation Banner if Store is Deactivated */}
                      {!isStoreActive && (
                        <div className="p-2.5 rounded-xl bg-rose-100/70 border border-rose-200 text-rose-900 text-[11px] space-y-1">
                          <div className="flex items-center gap-1 font-black">
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>Deactivated by Likart Mart Super Admin</span>
                          </div>
                          <p className="text-rose-800 leading-snug">
                            Reason: <span className="font-semibold">{store.deactivationReason || 'Administrative suspension'}</span>
                            {store.deactivatedAt && ` (Date: ${store.deactivatedAt})`}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">
                            SLA Minutes
                          </span>
                          <strong className="text-slate-800">{store.slaMinutes} Mins</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">
                            Service Radius
                          </span>
                          <strong className="text-slate-800">{store.serviceRadiusKm} km</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">
                            Assigned Manager
                          </span>
                          <span className="text-slate-800 truncate block font-bold">
                            {store.managerName}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">
                            Active Riders
                          </span>
                          <strong className="text-slate-800">{store.activeRidersCount} Riders</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                      {/* Super Admin Activate / Deactivate Button */}
                      {isStoreActive ? (
                        <button
                          type="button"
                          onClick={() =>
                            setStoreDeactivateModal({
                              isOpen: true,
                              store,
                              reason: '',
                            })
                          }
                          className="flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition border bg-white hover:bg-rose-50 text-rose-700 border-rose-300 hover:border-rose-400 flex items-center justify-center gap-1.5 shadow-2xs active:scale-95"
                          title="Deactivate Dark Store Pod (Super Admin Control)"
                        >
                          <Power className="w-3.5 h-3.5 text-rose-600" />
                          <span>Deactivate</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleDarkStoreActiveStatus(store.id)}
                          className="flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 shadow-xs active:scale-95"
                          title="Activate Dark Store Pod (Super Admin Control)"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Activate Pod</span>
                        </button>
                      )}

                      {/* Operational Shift Pause / Open Button */}
                      {isStoreActive ? (
                        <button
                          type="button"
                          onClick={() => toggleDarkStoreStatus(store.id)}
                          className={`py-1.5 px-2.5 rounded-xl text-xs font-bold transition border ${
                            store.isOpen
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}
                          title="Pause or resume current dispatch shift"
                        >
                          {store.isOpen ? 'Pause Shift' : 'Open Shift'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="py-1.5 px-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                          title="Pod is deactivated by Super Admin. Reactivate to open dispatch."
                        >
                          Shift Locked
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setStoreModal({ isOpen: true, mode: 'edit', data: store })}
                        className="p-2 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-xl transition"
                        title="Edit Store"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteDarkStore(store.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition"
                        title="Delete Store"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 4: STORE MANAGERS                                      */}
      {/* ============================================================== */}
      {subTab === 'managers' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-heading font-black text-base text-slate-900">
                Likart Mart Pod Managers &amp; Supervisors ({darkStoreManagers.length})
              </h3>
              <p className="text-xs text-slate-500">
                Manage credentials, shift schedules, and pod lead authorizations
              </p>
            </div>

            <button
              type="button"
              onClick={() => setManagerModal({ isOpen: true, mode: 'add' })}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Store Manager</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-black">
                  <th className="pb-3 pl-2">Manager Name &amp; Contact</th>
                  <th className="pb-3">Assigned Pod Store</th>
                  <th className="pb-3">Role &amp; Shift</th>
                  <th className="pb-3">Login User ID &amp; Password</th>
                  <th className="pb-3">Access PIN</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {darkStoreManagers.map((mgr) => (
                  <tr key={mgr.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 pl-2">
                      <strong className="text-slate-900 block font-heading">{mgr.name}</strong>
                      <span className="text-[11px] text-slate-500 block">{mgr.email}</span>
                      <span className="text-[10px] text-slate-400">{mgr.phone}</span>
                    </td>

                    <td className="py-3">
                      <span className="font-bold text-slate-800">{mgr.storeName}</span>
                    </td>

                    <td className="py-3">
                      <span className="font-bold text-slate-700 capitalize block">
                        {mgr.role.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-slate-500 capitalize">
                        {mgr.shift.replace(/_/g, ' ')} Shift
                      </span>
                    </td>

                    <td className="py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">ID:</span>
                          <code className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded text-[11px] font-mono font-bold border border-emerald-200">
                            {mgr.userId || 'mgr.' + mgr.id}
                          </code>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Pass:</span>
                          <span className="text-slate-600 font-mono text-[11px]">
                            {mgr.password ? '••••••••' : <span className="text-rose-500 font-normal italic">None</span>}
                          </span>
                          <button
                            type="button"
                            onClick={() => setManagerCredentialModal({ isOpen: true, manager: mgr })}
                            className="px-1.5 py-0.5 text-[10px] bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded flex items-center gap-1 border border-purple-200 transition"
                            title="Set / Change User ID and Password"
                          >
                            <Key className="w-2.5 h-2.5" />
                            <span>Change</span>
                          </button>
                        </div>
                      </div>
                    </td>

                    <td className="py-3">
                      <code className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-mono text-slate-800 font-bold">
                        {mgr.accessPin}
                      </code>
                    </td>

                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          mgr.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {mgr.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3 pr-2 text-right space-x-1.5">
                      <button
                        type="button"
                        onClick={() => setManagerCredentialModal({ isOpen: true, manager: mgr })}
                        className="p-1.5 text-purple-600 hover:text-purple-900 border border-purple-200 bg-purple-50 hover:bg-purple-100 rounded-lg transition"
                        title="Set / Change User ID & Password"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setManagerModal({ isOpen: true, mode: 'edit', data: mgr })}
                        className="p-1.5 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-100"
                        title="Edit Full Profile"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteDarkStoreManager(mgr.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB: PRODUCTS & SKUS (ADD, EDIT, DELETE, STOCK, IMAGES)    */}
      {/* ============================================================== */}
      {subTab === 'products' && (
        <MartProductsTab
          products={martProducts}
          setProducts={setMartProducts}
          categories={martCategories}
          onLogAudit={handleLogAudit}
        />
      )}

      {/* ============================================================== */}
      {/* SUB-TAB: CATEGORIES (ADD, EDIT, DELETE, ICONS, BADGES)         */}
      {/* ============================================================== */}
      {subTab === 'categories' && (
        <MartCategoriesTab
          categories={martCategories}
          setCategories={setMartCategories}
          products={martProducts}
          onLogAudit={handleLogAudit}
        />
      )}

      {/* ============================================================== */}
      {/* SUB-TAB: INVENTORY (RESTOCK, EDIT THRESHOLD, ZERO-OUT, AUDIT)  */}
      {/* ============================================================== */}
      {subTab === 'inventory' && (
        <MartInventoryTab
          products={martProducts}
          setProducts={setMartProducts}
          onLogAudit={handleLogAudit}
        />
      )}

      {/* ============================================================== */}
      {/* SUB-TAB: OFFERS & DEALS (ADD, EDIT, DELETE, CODES, DATES)     */}
      {/* ============================================================== */}
      {subTab === 'offers' && (
        <MartOffersTab
          offers={martOffers}
          setOffers={setMartOffers}
          categories={martCategories}
          onLogAudit={handleLogAudit}
        />
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 5: DELIVERY PARTNERS ZONES                             */}
      {/* ============================================================== */}
      {subTab === 'zones' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-heading font-black text-base text-slate-900">
                10-Minute Quick-Commerce Delivery Zones ({zones.length})
              </h3>
              <p className="text-xs text-slate-500">
                Geofence radius, delivery SLA thresholds, Google Map epicenter &amp; GPS auto-dispatch
              </p>
            </div>

            <button
              type="button"
              onClick={() => setZoneModal({ isOpen: true, mode: 'add', data: null })}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add 10-Minute Delivery Zone</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {zones.map((zone) => (
              <div
                key={zone.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3 flex flex-col justify-between hover:border-emerald-300 transition shadow-2xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900">{zone.name}</h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Zap className="w-2.5 h-2.5 fill-current" />
                      <span>10M ZONE</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 flex items-center justify-between">
                    <span>{zone.city}</span>
                    <span className="font-mono text-[10px] text-slate-400">
                      GPS: {zone.center.lat.toFixed(4)}, {zone.center.lng.toFixed(4)}
                    </span>
                  </p>

                  {/* Google Map Mini Coverage Preview */}
                  <div className="rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
                    <LiveMap
                      centerLat={zone.center.lat}
                      centerLng={zone.center.lng}
                      radiusKm={zone.radiusKm}
                      height="130px"
                      interactive={false}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        Coverage Radius
                      </span>
                      <strong className="text-slate-800">{zone.radiusKm} km</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        Express Fee
                      </span>
                      <strong className="text-slate-800">₹{zone.baseDeliveryFee}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        Per Km Rate
                      </span>
                      <strong className="text-slate-800">₹{zone.perKmFee}/km</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Status</span>
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Active &amp; Ready</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setZoneModal({ isOpen: true, mode: 'edit', data: zone })}
                    className="flex-1 py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-xl text-xs border border-slate-200 flex items-center justify-center gap-1.5 transition active:scale-95 shadow-2xs"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                    <span>Edit Zone</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      deleteZone(zone.id);
                      addNotification('Zone Deleted', `Delivery zone ${zone.name} removed permanently.`, 'warning');
                      handleLogAudit('DELETE', 'Delivery Zones', zone.id, `Deleted delivery zone ${zone.name}`);
                    }}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition"
                    title="Delete Zone"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB: PAYMENT GATEWAYS & TXNS (ADD, EDIT, DELETE, REFUND)   */}
      {/* ============================================================== */}
      {subTab === 'payments' && (
        <MartPaymentsTab onLogAudit={handleLogAudit} />
      )}

      {/* ============================================================== */}
      {/* SUB-TAB: PARTNER PAYOUTS (ADD, SETTLE, REJECT, DELETE)         */}
      {/* ============================================================== */}
      {subTab === 'payouts' && (
        <MartPayoutsTab onLogAudit={handleLogAudit} />
      )}

      {/* ============================================================== */}
      {/* SUB-TAB: COUPONS & HERO BANNERS (ADD, EDIT, DELETE, TOGGLE)    */}
      {/* ============================================================== */}
      {subTab === 'coupons' && (
        <MartCouponsTab onLogAudit={handleLogAudit} />
      )}

      {/* ============================================================== */}
      {/* SUB-TAB: NOTIFICATIONS & BROADCASTS (SEND, DELETE, TARGET)     */}
      {/* ============================================================== */}
      {subTab === 'notifications' && (
        <MartNotificationsTab onLogAudit={handleLogAudit} />
      )}

      {/* ============================================================== */}
      {/* SUB-TAB: CUSTOMER REVIEWS (ADD, EDIT, REPLY, DELETE, HIDE)     */}
      {/* ============================================================== */}
      {subTab === 'reviews' && (
        <MartReviewsTab
          reviews={martReviews}
          setReviews={setMartReviews}
          onLogAudit={handleLogAudit}
        />
      )}

      {/* ============================================================== */}
      {/* SUB-TAB: SUPPORT TICKETS (CREATE, REPLY, RESOLVE, DELETE)      */}
      {/* ============================================================== */}
      {subTab === 'support' && (
        <MartSupportTab onLogAudit={handleLogAudit} />
      )}

      {/* ============================================================== */}
      {/* SUB-TAB: USERS & ROLES (ADD STAFF, EDIT, DELETE, SUSPEND)      */}
      {/* ============================================================== */}
      {subTab === 'users_roles' && (
        <MartUsersRolesTab
          staffUsers={martStaffUsers}
          setStaffUsers={setMartStaffUsers}
          roles={martRoleConfigs}
          onLogAudit={handleLogAudit}
        />
      )}

      {/* ============================================================== */}
      {/* SUB-TAB: PERMISSIONS MATRIX (TOGGLE, SAVE, ADD ROLE)           */}
      {/* ============================================================== */}
      {subTab === 'permissions' && (
        <MartPermissionsTab
          roles={martRoleConfigs}
          setRoles={setMartRoleConfigs}
          onLogAudit={handleLogAudit}
        />
      )}

      {/* ============================================================== */}
      {/* SUB-TAB: AUDIT LOGS & AUDIT TRAIL (ADD ENTRY, DELETE, EXPORT)   */}
      {/* ============================================================== */}
      {subTab === 'audit_logs' && (
        <MartAuditLogsTab
          logs={martAuditLogs}
          setLogs={setMartAuditLogs}
          onLogAudit={handleLogAudit}
        />
      )}

      {/* ============================================================== */}
      {/* SUB-TAB: GOOGLE MAPS & API KEYS                                 */}
      {/* ============================================================== */}
      {subTab === 'maps' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4 animate-in fade-in">
          <div>
            <h3 className="font-heading font-black text-base text-slate-900">
              Google Maps API &amp; Geocoding for Dark Stores
            </h3>
            <p className="text-xs text-slate-500">
              High-precision distance matrix and GPS geocoding for 10-minute delivery SLAs
            </p>
          </div>

          <div className="space-y-3">
            {googleMapsKeys.map((key) => (
              <div
                key={key.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-bold text-slate-900">{key.label}</strong>
                    {key.isPrimary && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full">
                        ACTIVE PRIMARY
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 font-mono block mt-0.5">
                    {key.apiKey.slice(0, 8)}••••••••••••••••••••••••
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => testGoogleMapsKey(key.id)}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-xs font-bold rounded-xl hover:bg-slate-100 transition"
                >
                  Test Key Ping
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 11: ORDER ALERT SOUNDS & AUDIO TUNE UPLOAD (SUPER ADMIN) */}
      {/* ============================================================== */}
      {subTab === 'sounds' && (
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-lg text-slate-900">
                  Likart Mart Order Alert Sound & Audio Tune Upload
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure urgent audio ringtones or upload custom sound tunes (.mp3, .wav, .ogg, .m4a, .aac) for 10-minute grocery order arrivals
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                martSoundSettings.enabled
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
                {martSoundSettings.enabled ? 'Sound Alerts: Active (ON)' : 'Sound Alerts: Muted (OFF)'}
              </span>
            </div>
          </div>

          {/* Hidden File Input for Audio Upload */}
          <input
            id="mart-audio-file-input"
            type="file"
            accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUploadMartAudioFile(file);
              e.target.value = '';
            }}
          />

          {/* Error Banner */}
          {martAudioUploadError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{martAudioUploadError}</span>
              </div>
              <button
                type="button"
                onClick={() => setMartAudioUploadError(null)}
                className="text-rose-700 font-bold hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Custom Audio Tune Upload Card */}
            <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl border border-slate-700/60 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">
                    <Upload className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-heading font-black text-sm text-white">
                      Custom Audio Alert Tune Upload
                    </h4>
                    <p className="text-[11px] text-slate-300">
                      Upload dedicated MP3/WAV audio for new dark store orders
                    </p>
                  </div>
                </div>

                {martSoundSettings.customAudioUrl && (
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded-full">
                    Custom Active ✓
                  </span>
                )}
              </div>

              {martSoundSettings.customAudioUrl ? (
                /* Uploaded File Display Card */
                <div className="p-4 bg-white/10 rounded-2xl border border-white/15 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                        <Volume2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-white truncate max-w-[200px]">
                          {martSoundSettings.customAudioFileName || 'Uploaded Custom Ringtone'}
                        </p>
                        <p className="text-[10px] text-slate-300 flex items-center gap-2 mt-0.5">
                          <span>{martSoundSettings.customAudioSizeKb ? `${martSoundSettings.customAudioSizeKb} KB` : 'Audio File'}</span>
                          {martSoundSettings.customAudioDurationSecs ? (
                            <>
                              <span>•</span>
                              <span>{martSoundSettings.customAudioDurationSecs}s duration</span>
                            </>
                          ) : null}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        updateMartSoundSettings({
                          soundType: 'siren',
                          customAudioUrl: undefined,
                          customAudioFileName: undefined,
                          customAudioSizeKb: undefined,
                          customAudioDurationSecs: undefined,
                        })
                      }
                      className="p-1.5 hover:bg-white/20 rounded-lg text-slate-400 hover:text-white transition"
                      title="Remove custom audio and reset to siren"
                    >
                      <Trash2 className="w-4 h-4 text-rose-400" />
                    </button>
                  </div>

                  {/* Audio Controls */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10 text-xs">
                    <button
                      type="button"
                      onClick={() => playMartSoundPreview('custom')}
                      disabled={isPlayingTestTone}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl transition flex items-center gap-1.5 active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                      <span>{isPlayingTestTone ? 'Playing...' : 'Test Play'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleMartRingingSimulation}
                      className={`px-3 py-1.5 font-bold rounded-xl transition flex items-center gap-1.5 ${
                        isSimulatingMartRinging
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-white/15 hover:bg-white/25 text-white'
                      }`}
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>{isSimulatingMartRinging ? 'Stop Ringing' : 'Simulate Ring Loop'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isUploadingMartAudio}
                      onClick={() => document.getElementById('mart-audio-file-input')?.click()}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 font-bold rounded-xl transition flex items-center gap-1"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingMartAudio ? 'Uploading...' : 'Replace File'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Empty Upload Dropzone */
                <div
                  onClick={() => document.getElementById('mart-audio-file-input')?.click()}
                  className="p-6 border-2 border-dashed border-white/20 hover:border-emerald-400/80 rounded-2xl text-center space-y-2 cursor-pointer transition bg-white/5 hover:bg-white/10 group"
                >
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto text-slate-300 group-hover:text-emerald-300 transition">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <strong className="text-xs font-black text-white block">
                      Click to Browse & Upload Audio Tune
                    </strong>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Supports MP3, WAV, OGG, M4A, or AAC (Max 8MB)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Built-in Alert Tones, Volume & Master Switch */}
            <div className="p-5 bg-slate-50 rounded-3xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <strong className="text-xs text-slate-900 block font-bold">
                    Audible Ringing for New Grocery Orders
                  </strong>
                  <span className="text-[11px] text-slate-500">
                    Plays tone whenever a 10-minute grocery order arrives
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={martSoundSettings.enabled}
                  onChange={(e) => updateMartSoundSettings({ enabled: e.target.checked })}
                  className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              {/* Preset Tone Buttons */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Select Alert Tone Style
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'siren', label: '🚨 Urgent Pod Siren' },
                    { id: 'express_bell', label: '🔔 Express Bell' },
                    { id: 'radar_pulse', label: '📡 Radar Pulse' },
                    { id: 'dispatch_beep', label: '⚡ Dispatch Beep' },
                    ...(martSoundSettings.customAudioUrl
                      ? [{ id: 'custom', label: '🎵 Custom Uploaded Tune' }]
                      : []),
                  ].map((tone) => (
                    <button
                      key={tone.id}
                      type="button"
                      onClick={() => {
                        updateMartSoundSettings({ soundType: tone.id as any });
                        playMartSoundPreview(tone.id);
                      }}
                      className={`p-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between border ${
                        martSoundSettings.soundType === tone.id
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{tone.label}</span>
                      <Play className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Volume Slider */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Tone Volume</span>
                  <span className="font-black text-slate-900 font-mono">{martSoundSettings.volume}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={martSoundSettings.volume}
                  onChange={(e) => updateMartSoundSettings({ volume: Number(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => playMartSoundPreview(martSoundSettings.soundType)}
                  disabled={isPlayingTestTone}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 active:scale-95"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{isPlayingTestTone ? 'Playing Preview...' : 'Test Play Alert Sound'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleMartRingingSimulation}
                  className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 active:scale-95 ${
                    isSimulatingMartRinging
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                  title="Simulate continuous ringing until accepted"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>{isSimulatingMartRinging ? 'Stop Ringing' : 'Simulate Loop'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 12: UPGRADED REPORTS & AUDITS (PDF & CSV EXPORT)       */}
      {/* ============================================================== */}
      {subTab === 'reports' && (
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-6 animate-in fade-in">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-lg text-slate-900">
                  Likart Mart Quick-Commerce Analytics &amp; Reports
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Upgraded PDF & CSV
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Download official PDF audit reports, dark store fulfillment logs, SLA delivery times, and inventory velocity spreadsheets.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                disabled={isGeneratingTallyPdf}
                onClick={() => handleDownloadMartTallyReport()}
                className="px-4 py-2.5 bg-gradient-to-r from-teal-900 via-emerald-900 to-teal-950 hover:from-teal-800 hover:to-emerald-800 text-white text-xs font-black rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-2 border border-emerald-500/40 disabled:opacity-50"
              >
                {isGeneratingTallyPdf ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>Compiling Tally PDF...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
                    <span>Download Tally Reports (PDF)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isGeneratingPdf}
                onClick={handleDownloadMartPdfReport}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGeneratingPdf ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Compiling PDF...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5" />
                    <span>Download Official PDF Report</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleExportMartCSV}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Audit CSV</span>
              </button>
            </div>
          </div>

          {/* Period Scope Filter Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 px-2">Report Analytics Scope:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'all', label: 'All-Time Analytics' },
                  { id: 'today', label: "Today's Shift" },
                  { id: 'week', label: 'Past 7 Days' },
                  { id: 'month', label: 'Current Month' },
                ].map((scope) => (
                  <button
                    key={scope.id}
                    type="button"
                    onClick={() => setReportPeriodScope(scope.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                      reportPeriodScope === scope.id
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {scope.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dark Store Pod Selector for Tally */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Dark Store Pod:</span>
              <select
                value={tallyPodFilter}
                onChange={(e) => setTallyPodFilter(e.target.value)}
                className="bg-white border border-slate-300 text-slate-800 text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              >
                <option value="all">All Micro-Fulfillment Pods (Consolidated)</option>
                {darkStores.map((pod) => (
                  <option key={pod.id} value={pod.id}>
                    {pod.name} ({pod.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* FEATURED REPORT 1: LIKART MART TALLY ERP & FINANCIAL AUDIT STATEMENT (NEW) */}
          <div className="p-5 sm:p-6 bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 text-white rounded-3xl border-2 border-amber-500/40 shadow-xl space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0 font-black text-xl border border-amber-300">
                  <FileSpreadsheet className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-amber-400" />
                      <span>TallyPrime &amp; Tally.ERP 9 Standard</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                      Double-Entry Balanced (Dr = Cr) ✓
                    </span>
                    <span className="text-[10px] font-mono text-teal-300">
                      GSTIN: {tallyGstin}
                    </span>
                  </div>
                  <h4 className="font-heading font-black text-base sm:text-xl text-white mt-1">
                    Likart Mart Tally Accounting &amp; Financial Ledger Statement (PDF)
                  </h4>
                  <p className="text-xs text-teal-100/90 max-w-2xl leading-relaxed mt-0.5">
                    Official financial statements for Tally ERP software. Generates double-entry General Ledger trial balances, Chronological Day Book with standard narrations, Dark Store cash-in-hand vs bank settlements, inventory valuation register at FIFO cost, and GSTR-1/3B tax liability computation.
                  </p>
                </div>
              </div>

              {/* Tally Download & Setup Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                <button
                  type="button"
                  disabled={isGeneratingTallyPdf}
                  onClick={() => handleDownloadMartTallyReport()}
                  className="px-5 py-3.5 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGeneratingTallyPdf ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Compiling Tally Statement...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-slate-950" />
                      <span>Download Tally Reports (PDF)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsTallyConfigModalOpen(true)}
                  className="px-3.5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition flex items-center gap-1.5"
                  title="Configure Company Name, GSTIN, and Financial Year for Tally Export"
                >
                  <Settings className="w-4 h-4 text-amber-300" />
                  <span className="hidden sm:inline">Tally Settings</span>
                </button>
              </div>
            </div>

            {/* Tally Modules & Accounting Heads Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10 text-xs">
              <div className="p-3 bg-black/30 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] text-amber-400 block font-bold uppercase tracking-wider">Module 1</span>
                <span className="font-bold text-slate-100 text-[11px] block">Double-Entry Trial Balance</span>
                <span className="text-[10px] text-teal-300 block">Cash A/C vs Escrow Bank Ledger</span>
              </div>
              <div className="p-3 bg-black/30 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] text-amber-400 block font-bold uppercase tracking-wider">Module 2</span>
                <span className="font-bold text-slate-100 text-[11px] block">Chronological Day Book</span>
                <span className="text-[10px] text-teal-300 block">Vouchers &amp; Ind AS Narrations</span>
              </div>
              <div className="p-3 bg-black/30 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] text-amber-400 block font-bold uppercase tracking-wider">Module 3</span>
                <span className="font-bold text-slate-100 text-[11px] block">Stock Valuation Register</span>
                <span className="text-[10px] text-teal-300 block">Departmental FIFO Closing Stock</span>
              </div>
              <div className="p-3 bg-black/30 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] text-amber-400 block font-bold uppercase tracking-wider">Module 4</span>
                <span className="font-bold text-slate-100 text-[11px] block">GST Statutory Computation</span>
                <span className="text-[10px] text-teal-300 block">0%, 5%, 18% CGST &amp; SGST Tally</span>
              </div>
            </div>
          </div>

          {/* FEATURED REPORT 2: UPGRADED EXECUTIVE PDF AUDIT REPORT */}
          <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white rounded-3xl border border-emerald-800/50 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
                  <FileText className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Zap className="w-3 h-3 text-emerald-300" />
                      <span>Executive Format</span>
                    </span>
                    <span className="text-[10px] font-bold text-teal-300">
                      Print-Ready PDF
                    </span>
                  </div>
                  <h4 className="font-heading font-black text-base sm:text-lg text-white mt-1">
                    Official Likart Mart Executive Performance &amp; Fulfillment Audit (PDF)
                  </h4>
                  <p className="text-xs text-emerald-100/80 max-w-xl">
                    Comprehensive multi-page PDF document featuring executive GMV KPIs, 10-minute SLA fulfillment compliance metrics, dark store pod capacity, and itemized order-level dispatch audit records.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isGeneratingPdf}
                onClick={handleDownloadMartPdfReport}
                className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
              >
                {isGeneratingPdf ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Compiling PDF Document...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Official PDF Report</span>
                  </>
                )}
              </button>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/10 text-xs">
              <div className="p-2.5 bg-black/20 rounded-xl">
                <span className="text-[10px] text-emerald-300 block font-bold uppercase">Section 1</span>
                <span className="font-bold text-slate-200 text-[11px]">Executive GMV &amp; KPI Matrix</span>
              </div>
              <div className="p-2.5 bg-black/20 rounded-xl">
                <span className="text-[10px] text-emerald-300 block font-bold uppercase">Section 2</span>
                <span className="font-bold text-slate-200 text-[11px]">Dark Store Pod Operations</span>
              </div>
              <div className="p-2.5 bg-black/20 rounded-xl">
                <span className="text-[10px] text-emerald-300 block font-bold uppercase">Section 3</span>
                <span className="font-bold text-slate-200 text-[11px]">Catalog Inventory Velocity</span>
              </div>
              <div className="p-2.5 bg-black/20 rounded-xl">
                <span className="text-[10px] text-emerald-300 block font-bold uppercase">Section 4</span>
                <span className="font-bold text-slate-200 text-[11px]">10-Min SLA Dispatch Audit</span>
              </div>
            </div>
          </div>

          {/* LIVE TALLY DOUBLE-ENTRY TRIAL BALANCE PREVIEW */}
          <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-heading font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-teal-700" />
                    <span>Live Tally Double-Entry Trial Balance Ledger</span>
                  </h4>
                  <span className="text-[10px] bg-teal-100 text-teal-900 font-black px-2 py-0.5 rounded-full">
                    Live Database Feed
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Synchronized debit and credit ledger balances formatted for seamless ingestion into TallyPrime / Tally.ERP 9.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isGeneratingTallyPdf}
                  onClick={() => handleDownloadMartTallyReport()}
                  className="px-3.5 py-2 bg-teal-800 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-amber-300" />
                  <span>Download Tally PDF</span>
                </button>
              </div>
            </div>

            {/* Trial Balance Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                    <th className="py-2.5 px-3 rounded-l-xl">A/C Code</th>
                    <th className="py-2.5 px-3">Tally Ledger Account Particulars</th>
                    <th className="py-2.5 px-3">Account Group</th>
                    <th className="py-2.5 px-3 text-right">Debit Balance (Dr. ₹)</th>
                    <th className="py-2.5 px-3 text-right rounded-r-xl">Credit Balance (Cr. ₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(() => {
                    const podOrders = martOrders.filter((o) => {
                      if (tallyPodFilter !== 'all') {
                        return o.restaurantId === tallyPodFilter || (tallyPodFilter === 'likart-mart-hub-01' && !o.restaurantId);
                      }
                      return true;
                    });
                    const gSales = podOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
                    const codOrders = podOrders.filter((o) => (o.paymentMethod || '').toLowerCase() === 'cod' || (o.paymentMethod || '').toLowerCase() === 'cash');
                    const cashHand = codOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
                    const digitalEscrow = gSales - cashHand;
                    const promoSub = Math.round(gSales * 0.05);
                    const dFee = Math.round(podOrders.length * 25);
                    const goodsTaxable = Math.max(0, Math.round((gSales - dFee) / 1.05));
                    const totalTax = Math.max(0, gSales - dFee - goodsTaxable);
                    const cgst = Math.round(totalTax / 2);
                    const sgst = totalTax - cgst;
                    const totDr = cashHand + digitalEscrow + promoSub;
                    const totCr = goodsTaxable + cgst + sgst + dFee + promoSub;

                    return (
                      <>
                        <tr className="hover:bg-slate-50 transition">
                          <td className="py-2 px-3 font-mono font-bold text-slate-800">1001</td>
                          <td className="py-2 px-3 font-bold text-slate-900">Cash-in-Hand A/C (Riders COD Handover)</td>
                          <td className="py-2 px-3 text-slate-500">Current Assets (Cash)</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">₹{cashHand.toLocaleString('en-IN')}</td>
                          <td className="py-2 px-3 text-right font-mono text-slate-400">-</td>
                        </tr>
                        <tr className="hover:bg-slate-50 transition">
                          <td className="py-2 px-3 font-mono font-bold text-slate-800">1002</td>
                          <td className="py-2 px-3 font-bold text-slate-900">Razorpay / Escrow Bank Settlement A/C</td>
                          <td className="py-2 px-3 text-slate-500">Bank Accounts</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">₹{digitalEscrow.toLocaleString('en-IN')}</td>
                          <td className="py-2 px-3 text-right font-mono text-slate-400">-</td>
                        </tr>
                        <tr className="hover:bg-slate-50 transition">
                          <td className="py-2 px-3 font-mono font-bold text-slate-800">1003</td>
                          <td className="py-2 px-3 font-bold text-slate-900">Promotional Discounts &amp; Subsidies A/C</td>
                          <td className="py-2 px-3 text-slate-500">Indirect Expenses</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">₹{promoSub.toLocaleString('en-IN')}</td>
                          <td className="py-2 px-3 text-right font-mono text-slate-400">-</td>
                        </tr>
                        <tr className="hover:bg-slate-50 transition">
                          <td className="py-2 px-3 font-mono font-bold text-slate-800">2001</td>
                          <td className="py-2 px-3 font-bold text-slate-900">Gross Mart Quick-Commerce Sales A/C</td>
                          <td className="py-2 px-3 text-slate-500">Direct Sales Income</td>
                          <td className="py-2 px-3 text-right font-mono text-slate-400">-</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">₹{goodsTaxable.toLocaleString('en-IN')}</td>
                        </tr>
                        <tr className="hover:bg-slate-50 transition">
                          <td className="py-2 px-3 font-mono font-bold text-slate-800">2002</td>
                          <td className="py-2 px-3 font-bold text-slate-900">Output CGST (Central Goods Tax) A/C</td>
                          <td className="py-2 px-3 text-slate-500">Duties &amp; Taxes</td>
                          <td className="py-2 px-3 text-right font-mono text-slate-400">-</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">₹{cgst.toLocaleString('en-IN')}</td>
                        </tr>
                        <tr className="hover:bg-slate-50 transition">
                          <td className="py-2 px-3 font-mono font-bold text-slate-800">2003</td>
                          <td className="py-2 px-3 font-bold text-slate-900">Output SGST (State Goods Tax) A/C</td>
                          <td className="py-2 px-3 text-slate-500">Duties &amp; Taxes</td>
                          <td className="py-2 px-3 text-right font-mono text-slate-400">-</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">₹{sgst.toLocaleString('en-IN')}</td>
                        </tr>
                        <tr className="hover:bg-slate-50 transition">
                          <td className="py-2 px-3 font-mono font-bold text-slate-800">2004</td>
                          <td className="py-2 px-3 font-bold text-slate-900">10-Min SLA Fulfillment Income A/C</td>
                          <td className="py-2 px-3 text-slate-500">Direct Service Income</td>
                          <td className="py-2 px-3 text-right font-mono text-slate-400">-</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">₹{dFee.toLocaleString('en-IN')}</td>
                        </tr>
                        <tr className="hover:bg-slate-50 transition">
                          <td className="py-2 px-3 font-mono font-bold text-slate-800">2005</td>
                          <td className="py-2 px-3 font-bold text-slate-900">Discount Subvention Reserve A/C</td>
                          <td className="py-2 px-3 text-slate-500">Current Liabilities</td>
                          <td className="py-2 px-3 text-right font-mono text-slate-400">-</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">₹{promoSub.toLocaleString('en-IN')}</td>
                        </tr>
                        <tr className="bg-emerald-50/80 font-black text-emerald-950 border-t-2 border-emerald-300">
                          <td className="py-3 px-3 font-mono">TOTAL</td>
                          <td className="py-3 px-3">TALLY BALANCED DOUBLE-ENTRY LEDGER SUM</td>
                          <td className="py-3 px-3 text-emerald-800">ZERO-VARIANCE (Dr = Cr) ✓</td>
                          <td className="py-3 px-3 text-right font-mono text-sm text-emerald-900">₹{totDr.toLocaleString('en-IN')}</td>
                          <td className="py-3 px-3 text-right font-mono text-sm text-emerald-900">₹{totCr.toLocaleString('en-IN')}</td>
                        </tr>
                      </>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Total Orders Processed
              </span>
              <p className="text-2xl font-black text-slate-900">{martOrders.length}</p>
              <span className="text-xs text-slate-500">100% auditable via digital receipts</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Gross Quick-Commerce Sales
              </span>
              <p className="text-2xl font-black text-emerald-600 font-mono">
                ₹{martRevenue.toLocaleString()}
              </p>
              <span className="text-xs text-slate-500">Directly settled to fulfillment hub</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                10-Min SLA On-Time Rate
              </span>
              <p className="text-2xl font-black text-purple-600 font-mono">98.4%</p>
              <span className="text-xs text-slate-500">Target SLA: &lt; 10 minutes</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: TALLY ERP ACCOUNTING CONFIGURATION & PDF EXPORT         */}
      {/* ============================================================== */}
      {isTallyConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 text-white">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-400 text-slate-950 rounded-2xl shadow-md font-black">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base">
                    Tally.ERP 9 / TallyPrime Export Settings
                  </h3>
                  <p className="text-[11px] text-teal-200">
                    Configure statutory company master and ledger parameters for PDF download
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTallyConfigModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              {/* Info banner */}
              <div className="p-3 bg-teal-50 rounded-2xl border border-teal-200 text-teal-950 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-teal-900">
                  <CheckCircle2 className="w-4 h-4 text-teal-700" />
                  <span>Statutory Double-Entry Standard Verified</span>
                </div>
                <p className="text-[11px] text-teal-800 leading-relaxed">
                  The generated PDF includes Day Book sales vouchers, rider cash-in-hand vs digital gateway reconciliations, closing stock inventory valuation, and GST liability matrices.
                </p>
              </div>

              {/* Form fields */}
              <div className="space-y-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Company Registered Legal Name (for Tally Header):
                  </label>
                  <input
                    type="text"
                    value={tallyCompanyName}
                    onChange={(e) => setTallyCompanyName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      GSTIN (Goods &amp; Services Tax ID):
                    </label>
                    <input
                      type="text"
                      value={tallyGstin}
                      onChange={(e) => setTallyGstin(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 uppercase"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Financial Year / Accounting Book:
                    </label>
                    <input
                      type="text"
                      value={tallyFinancialYear}
                      onChange={(e) => setTallyFinancialYear(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Dark Store Hub Scope:
                    </label>
                    <select
                      value={tallyPodFilter}
                      onChange={(e) => setTallyPodFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="all">All Dark Store Hubs (Consolidated)</option>
                      {darkStores.map((pod) => (
                        <option key={pod.id} value={pod.id}>
                          {pod.name} ({pod.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Accounting Period Scope:
                    </label>
                    <select
                      value={reportPeriodScope}
                      onChange={(e) => setReportPeriodScope(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="all">All-Time Live Ledger</option>
                      <option value="today">Today's Shift Day Book</option>
                      <option value="week">Past 7 Days</option>
                      <option value="month">Current Month</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Select Tally PDF Modules to Include:
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 font-bold text-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>General Ledger Trial Balance</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 font-bold text-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Chronological Day Book</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 font-bold text-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Stock Valuation Register</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 font-bold text-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>GST Statutory Tax (GSTR-1)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsTallyConfigModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isGeneratingTallyPdf}
                  onClick={() => {
                    handleDownloadMartTallyReport();
                    setIsTallyConfigModalOpen(false);
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isGeneratingTallyPdf ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Compiling Tally PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download Tally PDF Report</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD / EDIT DARK STORE POD                               */}
      {/* ============================================================== */}
      {storeModal.isOpen && (
        <DarkStoreModalForm
          store={storeModal.data}
          onClose={() => setStoreModal({ isOpen: false, mode: 'add', data: null })}
          onSave={(data) => {
            if (storeModal.mode === 'edit' && storeModal.data) {
              updateDarkStore(storeModal.data.id, data);
            } else {
              addDarkStore(data as any);
            }
            setStoreModal({ isOpen: false, mode: 'add', data: null });
          }}
        />
      )}
      {/* ============================================================== */}
      {/* MODAL: SUPER ADMIN DEACTIVATE DARK STORE POD                   */}
      {/* ============================================================== */}
      {storeDeactivateModal.isOpen && storeDeactivateModal.store && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl">
                  <Power className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base">
                    Deactivate Dark Store Pod
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {storeDeactivateModal.store.name} ({storeDeactivateModal.store.code})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStoreDeactivateModal({ isOpen: false, store: null, reason: '' })}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                toggleDarkStoreActiveStatus(
                  storeDeactivateModal.store!.id,
                  storeDeactivateModal.reason || 'Deactivated by Likart Mart Super Admin'
                );
                setStoreDeactivateModal({ isOpen: false, store: null, reason: '' });
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900">
                <span className="font-bold block">Super Admin Access Control:</span>
                <span className="text-[11px] text-rose-800">
                  Deactivating this pod stops customers from placing orders dispatched from this hub. Store managers will be notified that the pod is administratively suspended.
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Select Quick Reason:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Routine Maintenance & Facility Upgrade',
                    'Inventory Cycle Count & Stock Audit',
                    'Fleet / Rider Shortage',
                    'Relocating Pod Facility',
                    'Administrative Hold',
                  ].map((pre) => (
                    <button
                      key={pre}
                      type="button"
                      onClick={() => setStoreDeactivateModal({ ...storeDeactivateModal, reason: pre })}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                        storeDeactivateModal.reason === pre
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {pre}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Reason for Deactivation *
                </label>
                <textarea
                  required
                  rows={3}
                  value={storeDeactivateModal.reason}
                  onChange={(e) =>
                    setStoreDeactivateModal({
                      ...storeDeactivateModal,
                      reason: e.target.value,
                    })
                  }
                  placeholder="e.g. Scheduled facility maintenance and shelf reconfiguration..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-rose-500 focus:bg-white resize-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStoreDeactivateModal({ isOpen: false, store: null, reason: '' })}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5"
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>Confirm Deactivate Pod</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: SUPER ADMIN DEACTIVATE LIKART MART SERVICE             */}
      {/* ============================================================== */}
      {martServiceModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base">
                    Deactivate Likart Mart Service
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Global 10-Minute Grocery Quick Commerce
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMartServiceModal({ isOpen: false, notice: '' })}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                toggleMartServiceStatus(false, martServiceModal.notice || 'Likart Mart quick-commerce service is temporarily paused.');
                setMartServiceModal({ isOpen: false, notice: '' });
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                <span className="font-bold block">Super Admin Action:</span>
                <span className="text-[11px] text-amber-800">
                  Deactivating Likart Mart will pause quick commerce grocery orders across all customer portals. You can reactivate anytime.
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Select Quick Announcement:
                </label>
                <div className="flex flex-col gap-1.5">
                  {[
                    'Likart Mart is paused for scheduled inventory replenishment. We will be back shortly!',
                    'Express 10-minute grocery service is currently paused for system maintenance.',
                    'Dark store inventory upgrade in progress. Deliveries will resume soon.',
                  ].map((pre) => (
                    <button
                      key={pre}
                      type="button"
                      onClick={() => setMartServiceModal({ ...martServiceModal, notice: pre })}
                      className={`text-left px-3 py-1.5 rounded-lg text-[11px] font-medium border transition ${
                        martServiceModal.notice === pre
                          ? 'bg-rose-50 text-rose-800 border-rose-300 font-bold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {pre}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Customer Announcement Notice *
                </label>
                <textarea
                  required
                  rows={3}
                  value={martServiceModal.notice}
                  onChange={(e) =>
                    setMartServiceModal({
                      ...martServiceModal,
                      notice: e.target.value,
                    })
                  }
                  placeholder="Enter notice shown to customers..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-rose-500 focus:bg-white resize-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMartServiceModal({ isOpen: false, notice: '' })}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5"
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>Deactivate Service</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD / EDIT STORE MANAGER                                */}
      {/* ============================================================== */}
      {managerModal.isOpen && (
        <DarkStoreManagerModalForm
          manager={managerModal.data}
          darkStores={darkStores}
          onClose={() => setManagerModal({ isOpen: false, mode: 'add', data: null })}
          onSave={(data) => {
            if (managerModal.mode === 'edit' && managerModal.data) {
              updateDarkStoreManager(managerModal.data.id, data);
            } else {
              addDarkStoreManager(data as any);
            }
            setManagerModal({ isOpen: false, mode: 'add', data: null });
          }}
        />
      )}
      {/* ============================================================== */}
      {/* MODAL: SUPER ADMIN SET / CHANGE STORE MANAGER CREDENTIALS      */}
      {/* ============================================================== */}
      {managerCredentialModal.isOpen && managerCredentialModal.manager && (
        <ManagerCredentialsModalForm
          manager={managerCredentialModal.manager}
          onClose={() => setManagerCredentialModal({ isOpen: false, manager: null })}
          onSave={(userId, password) => {
            const targetMgr = managerCredentialModal.manager!;
            updateDarkStoreManager(targetMgr.id, { userId, password });
            addNotification(
              'Manager Credentials Updated',
              `User ID and password for ${targetMgr.name} updated and permanently saved.`,
              'system'
            );
            handleLogAudit(
              'UPDATE',
              'Store Managers',
              targetMgr.id,
              `Super Admin set/changed User ID (${userId}) and login password for Store Manager ${targetMgr.name}`
            );
            setManagerCredentialModal({ isOpen: false, manager: null });
          }}
        />
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD / EDIT 10-MINUTE DELIVERY ZONE WITH GOOGLE MAP      */}
      {/* ============================================================== */}
      {zoneModal.isOpen && (
        <ZoneModal
          isOpen={zoneModal.isOpen}
          mode={zoneModal.mode}
          zone={zoneModal.data}
          onClose={() => setZoneModal({ isOpen: false, mode: 'add', data: null })}
          onSave={(data) => {
            if (zoneModal.mode === 'edit' && zoneModal.data) {
              updateZone(zoneModal.data.id, data);
              addNotification('Zone Updated', `10-minute delivery zone "${data.name}" saved permanently.`, 'system');
              handleLogAudit('UPDATE', 'Delivery Zones', zoneModal.data.id, `Updated zone ${data.name}`);
            } else {
              addZone(data);
              addNotification('Zone Created', `New 10-minute delivery zone "${data.name}" created and permanently saved.`, 'system');
              handleLogAudit('CREATE', 'Delivery Zones', 'NEW', `Created zone ${data.name}`);
            }
            setZoneModal({ isOpen: false, mode: 'add', data: null });
          }}
        />
      )}
    </div>
  );
};

// Modal Component for Dark Store Pod CRUD with Google Maps and Auto-Fetch Location
interface DarkStoreModalFormProps {
  store?: DarkStoreHub | null;
  onClose: () => void;
  onSave: (data: Partial<DarkStoreHub>) => void;
}

const DarkStoreModalForm: React.FC<DarkStoreModalFormProps> = ({ store, onClose, onSave }) => {
  const [name, setName] = useState(store?.name || '');
  const [code, setCode] = useState(store?.code || `POD-${Date.now().toString().slice(-4)}`);
  const [address, setAddress] = useState(store?.address || '');
  const [city, setCity] = useState(store?.city || 'Bangalore');
  const [lat, setLat] = useState<number>(store?.lat || 12.9352);
  const [lng, setLng] = useState<number>(store?.lng || 77.6245);
  const [slaMinutes, setSlaMinutes] = useState(store?.slaMinutes || 10);
  const [serviceRadiusKm, setServiceRadiusKm] = useState(store?.serviceRadiusKm || 2.5);
  const [managerName, setManagerName] = useState(store?.managerName || '');
  const [managerPhone, setManagerPhone] = useState(store?.managerPhone || '');
  const [managerEmail, setManagerEmail] = useState(store?.managerEmail || '');
  const [activeRidersCount, setActiveRidersCount] = useState(store?.activeRidersCount || 10);
  const [isOpen, setIsOpen] = useState(store ? store.isOpen : true);
  const [isActive, setIsActive] = useState(store ? store.isActive !== false : true);
  const [deactivationReason, setDeactivationReason] = useState(store?.deactivationReason || '');
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<string | null>(null);

  // Auto-fetch accurate current location via GPS sensor
  const handleAutoFetchLocation = () => {
    if (!navigator.geolocation) {
      setGpsAccuracy('Geolocation not supported by browser');
      return;
    }

    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const fetchedLat = Number(pos.coords.latitude.toFixed(6));
        const fetchedLng = Number(pos.coords.longitude.toFixed(6));
        const accuracy = pos.coords.accuracy ? Math.round(pos.coords.accuracy) : 8;
        setLat(fetchedLat);
        setLng(fetchedLng);
        setGpsAccuracy(`±${accuracy}m GPS Accuracy`);
        setIsFetchingLocation(false);

        try {
          const geo = await reverseGeocodeLocation(fetchedLat, fetchedLng);
          if (geo?.fullAddress) {
            setAddress(geo.fullAddress);
          }
          if (geo?.city && (!city || city === 'Bangalore')) {
            setCity(geo.city);
          }
          if (!name) {
            setName(`Likart Mart Pod (${geo?.area || 'Metro'})`);
          }
        } catch (_) {}
      },
      () => {
        setIsFetchingLocation(false);
        setLat(12.9352);
        setLng(77.6245);
        setGpsAccuracy('GPS Ready (Default Metro Anchor)');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;
    onSave({
      name: name.trim(),
      code: code.trim(),
      address: address.trim(),
      city: city.trim(),
      lat: Number(lat),
      lng: Number(lng),
      slaMinutes: Number(slaMinutes),
      serviceRadiusKm: Number(serviceRadiusKm),
      managerName: managerName.trim(),
      managerPhone: managerPhone.trim(),
      managerEmail: managerEmail.trim(),
      activeRidersCount: Number(activeRidersCount),
      isOpen: isActive ? isOpen : false,
      isActive,
      deactivationReason: isActive ? undefined : (deactivationReason.trim() || 'Deactivated by Likart Mart Super Admin'),
      deactivatedAt: isActive ? undefined : (store?.deactivatedAt || new Date().toISOString().split('T')[0]),
      totalSkus: store?.totalSkus || 450,
      lowStockItemsCount: store?.lowStockItemsCount || 0,
      contactNumber: managerPhone.trim() || '+91 8000 123 456',
      openingTime: '06:00 AM',
      closingTime: '12:00 AM',
      is24x7: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in scale-95">
        <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Store className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-heading font-black text-base text-white">
                {store ? `Edit Dark Store Pod: ${store.name}` : 'Add New Dark Store Pod'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Pin micro-fulfillment pod on Google Map &amp; set 10-minute dispatch SLA
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* 1. Pod Identifiers */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Pod Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Likart Mart Central Pod #01"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Pod Code *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. POD-01"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase focus:bg-white"
              />
            </div>
          </div>

          {/* 2. Google Map & Auto-Fetch GPS Current Location */}
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/90 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-800">Dark Store Google Map &amp; GPS Location</span>
                {gpsAccuracy && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    {gpsAccuracy}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleAutoFetchLocation}
                disabled={isFetchingLocation}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
              >
                <Navigation className={`w-3.5 h-3.5 ${isFetchingLocation ? 'animate-spin' : ''}`} />
                <span>{isFetchingLocation ? 'Fetching GPS...' : 'Auto-Fetch Current Location'}</span>
              </button>
            </div>

            {/* Interactive LiveMap with radius overlay */}
            <div className="rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
              <LiveMap
                centerLat={lat}
                centerLng={lng}
                radiusKm={serviceRadiusKm}
                interactive={true}
                enableSearch={true}
                height="210px"
                onLocationSelect={async (selected) => {
                  setLat(selected.lat);
                  setLng(selected.lng);
                  if (selected.address) {
                    setAddress(selected.address);
                  }
                  try {
                    const geo = await reverseGeocodeLocation(selected.lat, selected.lng);
                    if (geo?.fullAddress) setAddress(geo.fullAddress);
                    if (geo?.city) setCity(geo.city);
                  } catch (_) {}
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Pod Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={lat}
                  onChange={(e) => setLat(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Pod Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={lng}
                  onChange={(e) => setLng(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono text-[11px]"
                />
              </div>
            </div>

            <p className="text-[10px] text-slate-500">
              💡 Tip: Click anywhere on the map or type an address in the search box to relocate the pod. Click "Auto-Fetch Current Location" to lock onto your device's live GPS coordinates.
            </p>
          </div>

          {/* 3. Physical Address & City */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Physical Address *</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Plot 42, Metro Commercial Belt, 80 Feet Road"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">SLA (Mins)</label>
              <input
                type="number"
                min="5"
                max="30"
                value={slaMinutes}
                onChange={(e) => setSlaMinutes(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Radius (Km)</label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="15"
                value={serviceRadiusKm}
                onChange={(e) => setServiceRadiusKm(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white"
              />
            </div>
          </div>

          {/* 4. Store Operations & Manager */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Assigned Manager</label>
              <input
                type="text"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                placeholder="e.g. Rajesh Sharma"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Manager Phone</label>
              <input
                type="text"
                value={managerPhone}
                onChange={(e) => setManagerPhone(e.target.value)}
                placeholder="+91 98450..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Manager Email</label>
              <input
                type="email"
                value={managerEmail}
                onChange={(e) => setManagerEmail(e.target.value)}
                placeholder="manager@likart.com"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Active Fleet Riders</label>
              <input
                type="number"
                min="1"
                value={activeRidersCount}
                onChange={(e) => setActiveRidersCount(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white"
              />
            </div>
          </div>

          {/* Pod Administrative Status (Super Admin Control) */}
          <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-bold text-xs text-slate-900 block">
                  Pod Administrative Status (Super Admin Control)
                </label>
                <span className="text-[11px] text-slate-500">
                  {isActive ? 'Pod is ACTIVE and authorized for customer dispatch.' : 'Pod is DEACTIVATED. Storefront orders and dispatch are blocked.'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-2xs active:scale-95 ${
                  isActive
                    ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{isActive ? 'Active Pod' : 'Deactivated Pod'}</span>
              </button>
            </div>

            {!isActive && (
              <div className="pt-2 border-t border-slate-200">
                <label className="text-[11px] font-bold text-rose-800 block mb-1">
                  Reason for Deactivation *
                </label>
                <input
                  type="text"
                  value={deactivationReason}
                  onChange={(e) => setDeactivationReason(e.target.value)}
                  placeholder="e.g. Scheduled pod upgrade, inventory audit, temporary hold..."
                  className="w-full p-2 bg-white border border-rose-200 rounded-xl text-xs font-medium focus:outline-rose-500"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isOpenCheck"
              disabled={!isActive}
              checked={isOpen && isActive}
              onChange={(e) => setIsOpen(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded disabled:opacity-40"
            />
            <label htmlFor="isOpenCheck" className={`font-bold text-slate-800 ${!isActive ? 'opacity-50' : ''}`}>
              Pod is Open for Active 10-Minute Dispatch (Shift Status)
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs transition active:scale-95"
            >
              Save Dark Store Pod
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal Component for Dark Store Manager CRUD
interface DarkStoreManagerModalFormProps {
  manager?: DarkStoreManager | null;
  darkStores: DarkStoreHub[];
  onClose: () => void;
  onSave: (data: Partial<DarkStoreManager>) => void;
}

const DarkStoreManagerModalForm: React.FC<DarkStoreManagerModalFormProps> = ({
  manager,
  darkStores,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(manager?.name || '');
  const [email, setEmail] = useState(manager?.email || '');
  const [phone, setPhone] = useState(manager?.phone || '');
  const [userId, setUserId] = useState(
    manager?.userId ||
      (manager?.name ? `mgr.${manager.name.toLowerCase().replace(/[^a-z0-9]/g, '')}` : `mgr.${Date.now().toString().slice(-4)}`)
  );
  const [password, setPassword] = useState(manager?.password || 'mgr123password');
  const [showPassword, setShowPassword] = useState(false);
  const [storeId, setStoreId] = useState(manager?.storeId || darkStores[0]?.id || '');
  const [role, setRole] = useState<DarkStoreManager['role']>(manager?.role || 'hub_lead');
  const [shift, setShift] = useState<DarkStoreManager['shift']>(manager?.shift || 'full_day');
  const [accessPin, setAccessPin] = useState(manager?.accessPin || Math.floor(1000 + Math.random() * 9000).toString());
  const [status, setStatus] = useState<DarkStoreManager['status']>(manager?.status || 'active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !userId.trim() || !password.trim()) return;
    const selectedStore = darkStores.find((s) => s.id === storeId);
    onSave({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      userId: userId.trim().toLowerCase(),
      password: password.trim(),
      storeId,
      storeName: selectedStore?.name || 'Central Pod Hub',
      role,
      shift,
      accessPin: accessPin.trim(),
      status,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in scale-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-purple-100 text-purple-700">
              <Users className="w-4 h-4" />
            </span>
            <h3 className="font-heading font-black text-base text-slate-900">
              {manager ? 'Edit Store Manager' : 'Add Store Manager'}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!manager && !userId) {
                  setUserId(`mgr.${e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')}`);
                }
              }}
              placeholder="e.g. Rajesh Sharma"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98450..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manager@likartmart.com"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          {/* Super Admin Control: User ID & Password Set/Change */}
          <div className="p-3 bg-purple-50/70 border border-purple-200/90 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-900 flex items-center gap-1.5 text-[11px]">
                <Key className="w-3.5 h-3.5 text-purple-700" />
                <span>Super Admin Manager Credentials</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  const num = Math.floor(1000 + Math.random() * 9000);
                  setPassword(`Mgr#${num}!likart`);
                }}
                className="text-[10px] text-purple-700 hover:text-purple-950 font-bold underline"
              >
                Auto-Generate
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="font-bold text-slate-700 block mb-1 text-[11px]">Login User ID *</label>
                <input
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  placeholder="e.g. mgr.rajesh"
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono text-[11px] font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1 text-[11px]">Login Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full p-2 pr-7 bg-white border border-slate-200 rounded-xl font-mono text-[11px] font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-purple-700/80">
              Only Super Admin can view, assign, and change Store Manager credentials.
            </p>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Assign to Dark Store Pod</label>
            <select
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            >
              {darkStores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl capitalize font-bold"
              >
                <option value="hub_lead">Hub Lead</option>
                <option value="shift_supervisor">Shift Supervisor</option>
                <option value="inventory_operator">Inventory Operator</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Shift</label>
              <select
                value={shift}
                onChange={(e) => setShift(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl capitalize font-bold"
              >
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
                <option value="full_day">Full Day</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Pod Access PIN *</label>
              <input
                type="text"
                required
                value={accessPin}
                onChange={(e) => setAccessPin(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl capitalize font-bold"
              >
                <option value="active">Active</option>
                <option value="on_leave">On Leave</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs"
            >
              Save Manager
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Dedicated Modal for Super Admin to Set/Change Store Manager User ID and Password
interface ManagerCredentialsModalFormProps {
  manager: DarkStoreManager;
  onClose: () => void;
  onSave: (userId: string, password: string) => void;
}

const ManagerCredentialsModalForm: React.FC<ManagerCredentialsModalFormProps> = ({
  manager,
  onClose,
  onSave,
}) => {
  const [userId, setUserId] = useState(
    manager.userId || `mgr.${manager.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`
  );
  const [password, setPassword] = useState(manager.password || 'mgr123password');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let res = 'Mgr@';
    for (let i = 0; i < 6; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(
      `Likart Mart Store Manager Login Credentials:\nUser ID: ${userId}\nPassword: ${password}\nStore Pod: ${manager.storeName}\nAccess PIN: ${manager.accessPin}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim() || !password.trim()) return;
    onSave(userId.trim().toLowerCase(), password.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in scale-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <Key className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-heading font-black text-base text-slate-900">
                Set / Change Manager Credentials
              </h3>
              <p className="text-[11px] text-slate-500">
                Likart Mart Super Admin Access Control
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Store Manager:</span>
            <strong className="text-slate-900">{manager.name}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Assigned Pod:</span>
            <strong className="text-slate-800">{manager.storeName}</strong>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Phone / Contact:</span>
            <span className="text-slate-700 font-mono text-[11px]">{manager.phone}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">Manager User ID / Login ID *</label>
              <button
                type="button"
                onClick={() => setUserId(`mgr.${manager.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`)}
                className="text-[10px] text-emerald-600 hover:text-emerald-800 font-bold underline"
              >
                Reset Default
              </button>
            </div>
            <input
              type="text"
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value.toLowerCase().replace(/\s+/g, ''))}
              placeholder="e.g. mgr.rajesh"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold focus:bg-white"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">Store Manager Password *</label>
              <button
                type="button"
                onClick={handleGenerate}
                className="text-[10px] text-purple-600 hover:text-purple-800 font-bold flex items-center gap-1 underline"
              >
                <Sparkles className="w-3 h-3" />
                <span>Generate Strong Password</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full p-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold focus:bg-white text-xs"
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

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleCopy}
              className="text-[11px] font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
            </button>

            <span className="text-[10px] text-slate-400 font-medium">
              Access PIN: <code className="font-mono font-bold text-slate-700">{manager.accessPin}</code>
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Save Credentials</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
