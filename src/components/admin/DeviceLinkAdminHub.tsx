import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Smartphone,
  Globe,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Download,
  Share2,
  MessageSquare,
  Send,
  Phone,
  Mail,
  Maximize2,
  X,
  Store,
  Bike,
  ShieldCheck,
  Layers,
  ShoppingBag,
  Zap,
  KeyRound,
  Radio,
  Info,
  Laptop,
  Tablet,
  Monitor,
  Database,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AndroidApkModal } from '../common/AndroidApkModal';

export const DeviceLinkAdminHub: React.FC = () => {
  const [isAndroidApkModalOpen, setIsAndroidApkModalOpen] = useState(false);
  const {
    restaurants,
    deliveryPartners,
    franchises,
    orders,
    allCustomers,
    loginAdmin,
    loginRestaurant,
    loginRider,
    setActivePortal,
    setCustomerView,
    addNotification,
  } = useApp();

  const PUBLIC_SHARED_URL = 'https://ais-pre-f4ga3iv2rxjsjiitnezzzt-352077981280.asia-southeast1.run.app';
  const PUBLIC_DEV_URL = 'https://ais-dev-f4ga3iv2rxjsjiitnezzzt-352077981280.asia-southeast1.run.app';

  const [activeDeviceTab, setActiveDeviceTab] = useState<'all' | 'android' | 'ios' | 'windows' | 'mac'>('all');
  const [selectedTarget, setSelectedTarget] = useState<'customer' | 'quick_commerce' | 'restaurant' | 'delivery' | 'mart_manager' | 'admin'>('customer');
  const [selectedSpecificRestaurant, setSelectedSpecificRestaurant] = useState<string>('');

  // Network Routing Mode
  const [urlMode, setUrlMode] = useState<'public' | 'dev' | 'current' | 'custom'>(() => {
    if (typeof window !== 'undefined' && window.location.origin) {
      if (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) {
        return 'public';
      }
      if (window.location.origin.includes('ais-dev')) {
        return 'dev';
      }
      if (window.location.origin.includes('ais-pre')) {
        return 'public';
      }
      return 'current';
    }
    return 'public';
  });
  const [customHostUrl, setCustomHostUrl] = useState<string>('');
  const [isFullscreenQrOpen, setIsFullscreenQrOpen] = useState<boolean>(false);

  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Compute active base URL
  const resolvedBaseUrl = () => {
    if (urlMode === 'public') return PUBLIC_SHARED_URL;
    if (urlMode === 'dev') return PUBLIC_DEV_URL;
    if (urlMode === 'custom' && customHostUrl.trim()) {
      return customHostUrl.trim().replace(/\/$/, '');
    }
    if (typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')) {
      return window.location.origin;
    }
    return PUBLIC_SHARED_URL;
  };

  const appBaseUrl = resolvedBaseUrl();

  // Compute active deep link URL
  const getComputedUrl = (target: typeof selectedTarget) => {
    switch (target) {
      case 'quick_commerce':
        return `${appBaseUrl}?portal=customer&view=quick_commerce`;
      case 'restaurant':
        if (selectedSpecificRestaurant) {
          return `${appBaseUrl}?portal=customer&restaurant=${selectedSpecificRestaurant}`;
        }
        return `${appBaseUrl}?portal=restaurant`;
      case 'delivery':
        return `${appBaseUrl}?portal=delivery`;
      case 'mart_manager':
        return `${appBaseUrl}?portal=mart_manager`;
      case 'admin':
        return `${appBaseUrl}?portal=admin`;
      case 'customer':
      default:
        if (selectedSpecificRestaurant) {
          return `${appBaseUrl}?portal=customer&restaurant=${selectedSpecificRestaurant}`;
        }
        return `${appBaseUrl}?portal=customer&view=home`;
    }
  };

  const activeLink = getComputedUrl(selectedTarget);

  useEffect(() => {
    QRCode.toDataURL(activeLink, {
      width: 480,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.warn('QR generation notice:', err));
  }, [activeLink]);

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(activeLink);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
    addNotification('Link Copied', 'Device link copied to clipboard. Share with any device.', 'system');
  };

  const handleDownloadQrCode = () => {
    if (!qrCodeUrl) return;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = qrCodeUrl;
    downloadAnchor.download = `likart-device-qr-${selectedTarget}.png`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addNotification('QR Code Downloaded', 'QR code saved as image for device scanning or printouts.', 'system');
  };

  const handleShareWhatsApp = () => {
    const text = `🍽️ LIKART FOOD & MART - Live Website Link for Mobile & PC:\n${activeLink}\n\nOpen this link directly in your phone browser (Chrome / Safari) or Windows PC!`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareTelegram = () => {
    const text = `🍽️ LIKART FOOD & MART - Live Website Link for Mobile & PC:\n${activeLink}\n\nOpen this link directly in your phone browser!`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(activeLink)}&text=${encodeURIComponent(text)}`;
    window.open(telegramUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareSMS = () => {
    const text = `Open LIKART on your phone: ${activeLink}`;
    window.open(`sms:?&body=${encodeURIComponent(text)}`, '_self');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent('LIKART Web App - Link for Mobile and Desktop');
    const body = encodeURIComponent(`Hi,\n\nHere is the official link to browse LIKART on any device (Android, iPhone, Windows, or Mac):\n\n${activeLink}\n\nFeatures:\n• Fast touch-optimized mobile experience\n• Real-time GPS and order tracking\n• Installable as a home screen web app\n\nEnjoy browsing!`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'LIKART Multi-Device App',
          text: 'Browse LIKART Food & Mart on any mobile, tablet, or PC:',
          url: activeLink,
        });
        setShareFeedback('Shared successfully!');
        setTimeout(() => setShareFeedback(null), 2500);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  // Quick 1-click role logins
  const handleQuickLoginAsAdmin = () => {
    loginAdmin('likart9900@gmail.com', 'Maalu@1122', 'likart_food');
    setActivePortal('admin');
  };

  const handleQuickLoginAsMartAdmin = () => {
    loginAdmin('martadmin@likart.com', 'admin123', 'likart_mart');
    setActivePortal('admin');
  };

  const handleQuickLoginAsRestaurant = () => {
    const firstRest = restaurants[0] || { email: 'dhaba@punjabi.com', password: 'chef123' };
    loginRestaurant(firstRest.email, firstRest.password || 'chef123');
    setActivePortal('restaurant');
  };

  const handleQuickLoginAsRider = () => {
    const firstRider = deliveryPartners[0] || { phone: '9876543210', password: 'rider123' };
    loginRider(firstRider.phone, firstRider.password || 'rider123');
    setActivePortal('delivery');
  };

  const handleExportAllDataJson = () => {
    try {
      const dump = {
        exportedAt: new Date().toISOString(),
        websiteUrl: appBaseUrl,
        system: {
          brand: 'LIKART FOOD & MART',
          version: '3.0.0-production',
          environment: 'Web + Android + Windows + iOS',
        },
        stats: {
          totalOrders: orders.length,
          totalRestaurants: restaurants.length,
          totalDeliveryPartners: deliveryPartners.length,
          totalFranchises: franchises.length,
          totalCustomers: allCustomers.length,
        },
        orders,
        restaurants,
        deliveryPartners,
        franchises,
        customers: allCustomers,
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dump, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `likart-food-all-data-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      addNotification('Data Exported', 'Full platform database JSON downloaded successfully.', 'system');
    } catch (err) {
      console.error('Data export error:', err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Header Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0">
              <Smartphone className="w-8 h-8 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-300" />
                  <span>Admin Control Center</span>
                </span>
                <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                  Device Link • QR Codes • Share Hub
                </span>
              </div>
              <h3 className="font-heading font-black text-2xl text-white mt-1">
                Device Link &amp; QR Sharing Command Hub
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed mt-1">
                Generate device links, printable QR codes, and 1-tap share invitations for Android smartphones, iPhones, iPads, and Windows PCs across all 6 ecosystem portals.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="/likart-all-portals.apk"
              download="likart-all-portals.apk"
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5 active:scale-95"
              title="Download real All-in-One Android APK containing all 6 portals"
            >
              <Download className="w-4 h-4 fill-slate-950 text-slate-950" />
              <span>Download Real APK (All Portals)</span>
            </a>
            <button
              type="button"
              onClick={() => setIsAndroidApkModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 active:scale-95"
              title="Open Android APK & Google Play .aab Studio Hub"
            >
              <Smartphone className="w-4 h-4" />
              <span>APK &amp; AAB Hub</span>
            </button>
            <button
              type="button"
              onClick={() => setIsFullscreenQrOpen(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 active:scale-95"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Fullscreen QR Display</span>
            </button>
            <button
              type="button"
              onClick={handleExportAllDataJson}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 active:scale-95"
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Device Platforms Tab Selector */}
        <div className="flex gap-1.5 pt-2 bg-slate-800/80 p-1.5 rounded-2xl max-w-xl overflow-x-auto scrollbar-none">
          {[
            { id: 'all', label: 'All Devices', icon: Globe },
            { id: 'android', label: 'Android Phone', icon: Smartphone },
            { id: 'ios', label: 'iPhone / iPad', icon: Tablet },
            { id: 'windows', label: 'Windows PC', icon: Laptop },
            { id: 'mac', label: 'Mac & Linux', icon: Monitor },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveDeviceTab(tab.id as any)}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  activeDeviceTab === tab.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Experience Selector */}
      <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-3.5 shadow-2xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
              Step 1: Choose Portal Experience
            </span>
            <h4 className="text-sm font-black text-slate-900">
              Select what the device should open when scanned or clicked:
            </h4>
          </div>
          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
            Auto-generates dedicated QR &amp; deep link
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { id: 'customer', label: 'Food Store', icon: ShoppingBag, color: 'text-rose-600' },
            { id: 'quick_commerce', label: 'Quick Mart (10m)', icon: Zap, color: 'text-amber-700' },
            { id: 'restaurant', label: 'Kitchen Console', icon: Store, color: 'text-orange-600' },
            { id: 'delivery', label: 'Rider Fleet', icon: Bike, color: 'text-teal-700' },
            { id: 'mart_manager', label: 'Dark Store Pod', icon: Layers, color: 'text-emerald-700' },
            { id: 'admin', label: 'Super Admin', icon: KeyRound, color: 'text-indigo-700' },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = selectedTarget === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedTarget(item.id as any)}
                className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 active:scale-95 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/20 ring-2 ring-indigo-400'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : item.color}`} />
                <span className="text-xs font-bold leading-tight">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Direct Restaurant Selector (Optional Deep Link) */}
        {(selectedTarget === 'customer' || selectedTarget === 'restaurant') && (
          <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-bold">
              <Store className="w-4 h-4 text-orange-600" />
              <span>Direct Restaurant Menu Link (Optional):</span>
            </div>
            <select
              value={selectedSpecificRestaurant}
              onChange={(e) => setSelectedSpecificRestaurant(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-400 shadow-2xs"
            >
              <option value="">All Outlets (Default Storefront)</option>
              {restaurants.map((rest) => (
                <option key={rest.id} value={rest.id}>
                  {rest.name} ({rest.cuisine.slice(0, 2).join(', ')})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Link & QR Generator Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        {/* Left 7 Cols: URL display & Instant Actions */}
        <div className="md:col-span-7 p-5 bg-gradient-to-br from-indigo-50/80 via-blue-50/50 to-slate-50 border-2 border-indigo-200 rounded-3xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-100/80 px-2.5 py-0.5 rounded-md">
                Step 2: Live Device Link
              </span>
              <span className="text-[10px] font-bold text-slate-500">
                Worldwide HTTPS Access
              </span>
            </div>
            <h4 className="text-base font-black text-slate-900 font-heading mt-2">
              Shareable Link for Other Devices
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Open this link on any smartphone, tablet, or PC to immediately browse with live database synchronization.
            </p>

            {/* Network / Host Mode Selector */}
            <div className="mt-3 bg-white/90 p-2.5 rounded-2xl border border-indigo-200/90 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <span className="text-[10px] font-black uppercase text-indigo-900 flex items-center gap-1">
                  <Radio className="w-3 h-3 text-indigo-600" />
                  <span>Network Routing Target</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  SSL Secured
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setUrlMode('public')}
                  className={`py-1.5 px-2 rounded-xl font-bold transition text-center truncate ${
                    urlMode === 'public'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  title="Public Worldwide Cloud Run URL - works on all phones and PCs on Wi-Fi or cellular"
                >
                  Public Live URL
                </button>
                <button
                  type="button"
                  onClick={() => setUrlMode('dev')}
                  className={`py-1.5 px-2 rounded-xl font-bold transition text-center truncate ${
                    urlMode === 'dev'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  title="Development Cloud Preview"
                >
                  Dev Preview
                </button>
                <button
                  type="button"
                  onClick={() => setUrlMode('current')}
                  className={`py-1.5 px-2 rounded-xl font-bold transition text-center truncate ${
                    urlMode === 'current'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  title="Current Browser Host"
                >
                  Current Origin
                </button>
                <button
                  type="button"
                  onClick={() => setUrlMode('custom')}
                  className={`py-1.5 px-2 rounded-xl font-bold transition text-center truncate ${
                    urlMode === 'custom'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  title="Custom LAN IP or domain for local testing"
                >
                  Custom LAN
                </button>
              </div>

              {urlMode === 'custom' && (
                <div className="pt-1">
                  <input
                    type="text"
                    placeholder="e.g. http://192.168.1.15:3000"
                    value={customHostUrl}
                    onChange={(e) => setCustomHostUrl(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-indigo-300 rounded-xl font-mono text-slate-800 focus:outline-hidden"
                  />
                </div>
              )}

              {typeof window !== 'undefined' && window.location.origin.includes('localhost') && urlMode === 'public' && (
                <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Smart Auto-Route:</strong> Using the public Cloud Run URL so external smartphones &amp; laptops can connect without localhost networking restrictions.
                  </span>
                </div>
              )}
            </div>

            {/* URL Display Bar */}
            <div className="mt-3 flex items-center gap-2 p-2 bg-white rounded-2xl border border-indigo-200 shadow-2xs">
              <Globe className="w-4 h-4 text-indigo-600 shrink-0 ml-2" />
              <input
                type="text"
                readOnly
                value={activeLink}
                className="w-full text-xs font-mono font-bold text-slate-800 bg-transparent focus:outline-hidden truncate"
                title={activeLink}
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl transition flex items-center gap-1.5 shrink-0 active:scale-95 shadow-xs"
                title="Copy to clipboard"
              >
                {copiedUrl ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-indigo-300" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Share Options Row */}
          <div className="pt-2 border-t border-indigo-100">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
              Step 3: Instant 1-Tap Share to Other Devices
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs active:scale-95"
                title="Send link to phone via WhatsApp"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={handleShareTelegram}
                className="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs active:scale-95"
                title="Share link via Telegram"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Telegram</span>
              </button>
              <button
                type="button"
                onClick={handleShareSMS}
                className="px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs active:scale-95"
                title="Send SMS text message to phone"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>SMS</span>
              </button>
              <button
                type="button"
                onClick={handleNativeShare}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs active:scale-95"
                title="Share via nearby Bluetooth, Quick Share, or AirDrop"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{shareFeedback || 'Nearby Share'}</span>
              </button>
              <button
                type="button"
                onClick={handleShareEmail}
                className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
                title="Email link to device"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email</span>
              </button>
              <a
                href={activeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95 ml-auto"
                title="Test link in a new tab on this device"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                <span>Test Tab</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: QR Code Scanner for Mobile Cameras */}
        <div className="md:col-span-5 p-5 bg-slate-900 text-white rounded-3xl flex flex-col items-center text-center justify-between space-y-3 shadow-xl">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full inline-block">
              Instant Mobile Camera Scan
            </span>
            <h4 className="text-sm font-black font-heading text-white">
              Scan QR to Open on Phone
            </h4>
            <p className="text-[11px] text-slate-400 max-w-xs">
              Point your Android camera, Google Lens, or iPhone camera to open immediately without typing.
            </p>
          </div>

          {/* QR Code Container */}
          <div className="p-3 bg-white rounded-2xl shadow-xl shrink-0 my-1 relative group">
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt={`Scan QR Code to open ${selectedTarget}`}
                className="w-44 h-44 object-contain"
              />
            ) : (
              <div className="w-44 h-44 bg-slate-800 rounded-xl flex items-center justify-center animate-pulse">
                <QrCode className="w-10 h-10 text-slate-500" />
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsFullscreenQrOpen(true)}
              className="absolute inset-0 bg-slate-950/60 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1 backdrop-blur-2xs font-bold text-xs"
              title="Enlarge QR code to full screen"
            >
              <Maximize2 className="w-5 h-5" />
              <span>Enlarge QR</span>
            </button>
          </div>

          <div className="w-full flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setIsFullscreenQrOpen(true)}
              className="flex-1 py-2 px-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95 shadow-2xs"
              title="Show large QR code for scanning from a distance"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Enlarge QR</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadQrCode}
              className="flex-1 py-2 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95"
              title="Download high-res QR code image"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>

      {/* Step-by-Step Device Setup & Browsing Guides */}
      <div className="p-5 bg-white rounded-3xl border border-slate-200 space-y-3.5 shadow-2xs">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-indigo-600" />
          <span>Device Browsing &amp; Installation Instructions</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
          {/* Android Guide */}
          {(activeDeviceTab === 'all' || activeDeviceTab === 'android') && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 font-black">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>Android Phones &amp; Tablets</span>
                </div>
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                  Real APK Ready
                </span>
              </div>
              <ul className="space-y-1 text-slate-600 text-[11px] list-disc list-inside leading-relaxed">
                <li>Scan QR code with camera or open link in <strong>Google Chrome</strong> / <strong>Samsung Internet</strong>.</li>
                <li>Tap menu (⋮) → tap <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong>.</li>
                <li>Or download the real standalone <strong>.apk package</strong> directly to your phone for sideloading.</li>
                <li>Full real-time GPS tracking, camera access, and instant order alerts across all 6 portals.</li>
              </ul>
              <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-2">
                <a
                  href="/likart-all-portals.apk"
                  download="likart-all-portals.apk"
                  className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[11px] rounded-lg transition flex items-center gap-1.5 active:scale-95 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download All-in-One APK (All 6 Portals)</span>
                </a>
                <button
                  type="button"
                  onClick={() => setIsAndroidApkModalOpen(true)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] rounded-lg transition flex items-center gap-1.5 active:scale-95 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  <span>APK &amp; Play Store Hub</span>
                </button>
              </div>
            </div>
          )}

          {/* iOS Guide */}
          {(activeDeviceTab === 'all' || activeDeviceTab === 'ios') && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-blue-800 font-black">
                <Tablet className="w-4 h-4 text-blue-600" />
                <span>iPhone &amp; iPad (iOS)</span>
              </div>
              <ul className="space-y-1 text-slate-600 text-[11px] list-disc list-inside leading-relaxed">
                <li>Scan QR code with the iOS <strong>Camera app</strong> or open link in <strong>Safari</strong>.</li>
                <li>Tap the <strong>Share</strong> button (box with upward arrow) at bottom of screen.</li>
                <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
                <li>An icon is created on your home screen for quick 1-tap browsing.</li>
              </ul>
            </div>
          )}

          {/* Windows Guide */}
          {(activeDeviceTab === 'all' || activeDeviceTab === 'windows') && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-indigo-800 font-black">
                <Laptop className="w-4 h-4 text-indigo-600" />
                <span>Windows 10 / 11 Laptops &amp; Desktops</span>
              </div>
              <ul className="space-y-1 text-slate-600 text-[11px] list-disc list-inside leading-relaxed">
                <li>Open in <strong>Microsoft Edge</strong> or <strong>Google Chrome</strong>.</li>
                <li>Click the <strong>Install App icon (⊕)</strong> on the right side of the address bar.</li>
                <li>Pin to Windows <strong>Taskbar</strong> or <strong>Start Menu</strong> for 1-click launch.</li>
                <li>Supports dual monitors, kitchen KDS audio buzzers, and keyboard navigation.</li>
              </ul>
            </div>
          )}

          {/* Mac Guide */}
          {(activeDeviceTab === 'all' || activeDeviceTab === 'mac') && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-800 font-black">
                <Monitor className="w-4 h-4 text-slate-600" />
                <span>MacBooks &amp; macOS Desktops</span>
              </div>
              <ul className="space-y-1 text-slate-600 text-[11px] list-disc list-inside leading-relaxed">
                <li>Open link in <strong>Safari</strong> or <strong>Chrome for Mac</strong>.</li>
                <li>In Safari: File → <strong>"Add to Dock"</strong> to create a native macOS standalone app.</li>
                <li>In Chrome: Click ⋮ → Save and Share → <strong>"Install LIKART..."</strong>.</li>
                <li>Full support for Trackpad pinch-to-zoom and keyboard shortcuts.</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Master Logins Directory for Multi-Device Testing */}
      <div className="p-5 bg-white rounded-3xl border border-slate-200 space-y-3.5 shadow-2xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-indigo-600" />
              <span>Universal Master Logins Hub</span>
            </h4>
            <p className="text-xs text-slate-500">
              Verified permanent credentials to test any portal on your phone or laptop
            </p>
          </div>
          <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">
            All Roles Permanent
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Role 1: Super Admin */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                  SA
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 block">Food Super Admin</span>
                  <span className="text-[10px] text-slate-500">Control Center</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleQuickLoginAsAdmin}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black rounded-lg transition active:scale-95 shadow-2xs"
              >
                1-Click Login
              </button>
            </div>
            <div className="space-y-1 text-xs font-mono bg-white p-2 rounded-xl border border-slate-200 text-slate-700">
              <div className="flex justify-between items-center">
                <span>likart9900@gmail.com</span>
                <button
                  type="button"
                  onClick={() => handleCopy('likart9900@gmail.com', 'admin_email')}
                  className="text-slate-400 hover:text-slate-800 p-0.5"
                >
                  {copiedKey === 'admin_email' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span>Pass: <strong>Maalu@1122</strong></span>
                <button
                  type="button"
                  onClick={() => handleCopy('Maalu@1122', 'admin_pass')}
                  className="text-slate-400 hover:text-slate-800 p-0.5"
                >
                  {copiedKey === 'admin_pass' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>

          {/* Role 2: Likart Mart Super Admin */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-black text-xs">
                  LM
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 block">Mart Super Admin</span>
                  <span className="text-[10px] text-slate-500">10m Quick Commerce</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleQuickLoginAsMartAdmin}
                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] font-black rounded-lg transition active:scale-95 shadow-2xs"
              >
                1-Click Login
              </button>
            </div>
            <div className="space-y-1 text-xs font-mono bg-white p-2 rounded-xl border border-slate-200 text-slate-700">
              <div className="flex justify-between items-center">
                <span>martadmin@likart.com</span>
                <button
                  type="button"
                  onClick={() => handleCopy('martadmin@likart.com', 'mart_email')}
                  className="text-slate-400 hover:text-slate-800 p-0.5"
                >
                  {copiedKey === 'mart_email' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span>Pass: <strong>admin123</strong></span>
                <button
                  type="button"
                  onClick={() => handleCopy('admin123', 'mart_pass')}
                  className="text-slate-400 hover:text-slate-800 p-0.5"
                >
                  {copiedKey === 'mart_pass' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>

          {/* Role 3: Kitchen Partner */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 block">Kitchen Partner</span>
                  <span className="text-[10px] text-slate-500">KDS Orders</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleQuickLoginAsRestaurant}
                className="px-2.5 py-1 bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-black rounded-lg transition active:scale-95 shadow-2xs"
              >
                1-Click Login
              </button>
            </div>
            <div className="space-y-1 text-xs font-mono bg-white p-2 rounded-xl border border-slate-200 text-slate-700">
              <div className="flex justify-between items-center">
                <span>dhaba@punjabi.com</span>
                <button
                  type="button"
                  onClick={() => handleCopy('dhaba@punjabi.com', 'rest_email')}
                  className="text-slate-400 hover:text-slate-800 p-0.5"
                >
                  {copiedKey === 'rest_email' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span>Pass: <strong>chef123</strong></span>
                <button
                  type="button"
                  onClick={() => handleCopy('chef123', 'rest_pass')}
                  className="text-slate-400 hover:text-slate-800 p-0.5"
                >
                  {copiedKey === 'rest_pass' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>

          {/* Role 4: Delivery Rider */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                  <Bike className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 block">Delivery Rider</span>
                  <span className="text-[10px] text-slate-500">GPS Fleet</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleQuickLoginAsRider}
                className="px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-white text-[10px] font-black rounded-lg transition active:scale-95 shadow-2xs"
              >
                1-Click Login
              </button>
            </div>
            <div className="space-y-1 text-xs font-mono bg-white p-2 rounded-xl border border-slate-200 text-slate-700">
              <div className="flex justify-between items-center">
                <span>Phone: <strong>9876543210</strong></span>
                <button
                  type="button"
                  onClick={() => handleCopy('9876543210', 'rider_phone')}
                  className="text-slate-400 hover:text-slate-800 p-0.5"
                >
                  {copiedKey === 'rider_phone' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span>Pass: <strong>rider123</strong></span>
                <button
                  type="button"
                  onClick={() => handleCopy('rider123', 'rider_pass')}
                  className="text-slate-400 hover:text-slate-800 p-0.5"
                >
                  {copiedKey === 'rider_pass' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>

          {/* Role 5: Franchise Admin */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-xs">
                  FA
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 block">Franchise Admin</span>
                  <span className="text-[10px] text-slate-500">Zone Operations</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                Franchise Role
              </span>
            </div>
            <div className="space-y-1 text-xs font-mono bg-white p-2 rounded-xl border border-slate-200 text-slate-700">
              <div className="flex justify-between items-center">
                <span>BLR-CENTRAL</span>
                <button
                  type="button"
                  onClick={() => handleCopy('BLR-CENTRAL', 'fr_user')}
                  className="text-slate-400 hover:text-slate-800 p-0.5"
                >
                  {copiedKey === 'fr_user' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span>Pass: <strong>Franchise@2026</strong></span>
                <button
                  type="button"
                  onClick={() => handleCopy('Franchise@2026', 'fr_pass')}
                  className="text-slate-400 hover:text-slate-800 p-0.5"
                >
                  {copiedKey === 'fr_pass' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>

          {/* Role 6: Customer Food Store */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 block">Customer Web</span>
                  <span className="text-[10px] text-slate-500">Food &amp; Mart Store</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActivePortal('customer');
                  setCustomerView('home');
                }}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black rounded-lg transition active:scale-95 shadow-2xs"
              >
                Go to Web
              </button>
            </div>
            <div className="p-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <span>Universal instant browsing ready</span>
              <span className="text-emerald-700 font-bold text-[10px]">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen QR Code Overlay for Scanning Across Room / Projector */}
      {isFullscreenQrOpen && (
        <div className="fixed inset-0 z-60 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white animate-fade-in">
          <button
            type="button"
            onClick={() => setIsFullscreenQrOpen(false)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition active:scale-95"
            title="Exit Fullscreen QR"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="text-center space-y-2 mb-6 max-w-md">
            <span className="text-xs font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-300 border border-indigo-400/40 px-3 py-1 rounded-full inline-block">
              Scan with Mobile Camera / Google Lens
            </span>
            <h3 className="text-2xl sm:text-3xl font-black font-heading text-white">
              Scan to Browse on Phone
            </h3>
            <p className="text-xs text-slate-300">
              Point your smartphone camera at this code to open the live website on your device instantly.
            </p>
          </div>

          <div className="p-6 bg-white rounded-3xl shadow-2xl ring-4 ring-indigo-500/50">
            {qrCodeUrl && (
              <img
                src={qrCodeUrl}
                alt="Fullscreen QR Code"
                className="w-72 h-72 sm:w-88 sm:h-88 object-contain"
              />
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 active:scale-95"
            >
              {copiedUrl ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedUrl ? 'Link Copied!' : 'Copy Direct Link'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadQrCode}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-2 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download High-Res QR</span>
            </button>
            <button
              type="button"
              onClick={() => setIsFullscreenQrOpen(false)}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition"
            >
              Close Fullscreen
            </button>
          </div>
        </div>
      )}

      {/* Android APK & Multi-Portal Build Kit Hub Modal */}
      <AndroidApkModal
        isOpen={isAndroidApkModalOpen}
        onClose={() => setIsAndroidApkModalOpen(false)}
      />
    </div>
  );
};

export default DeviceLinkAdminHub;
