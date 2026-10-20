import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  TrendingUp,
  ShoppingBag,
  Store,
  Bike,
  Users,
  MapPin,
  CreditCard,
  Tag,
  DollarSign,
  HelpCircle,
  Settings,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Copy,
  KeyRound,
  FileText,
  Building2,
  Compass,
  Check,
  Sparkles,
  ExternalLink,
  Layers,
  FileCheck,
  X,
  Upload,
  Image as ImageIcon,
  Lock,
  RefreshCw,
  Volume2,
  VolumeX,
  Bell,
  Play,
  Radio,
  Save,
  CheckCircle2,
  UtensilsCrossed,
  Search,
  Star,
  Database,
  CheckCheck,
  Phone,
  Mail,
  FileSignature,
  RotateCcw,
  Globe,
  Percent,
  FileSpreadsheet,
  Banknote,
  Zap,
  Power,
  AlertCircle,
  Smartphone,
  QrCode,
} from 'lucide-react';
import {
  Restaurant,
  DeliveryPartner,
  DeliveryZone,
  PaymentGatewayItem,
  Coupon,
  BannerPromo,
  Franchise,
  GoogleMapsKeyItem,
  AdminUser,
  RestaurantAlertTone,
  RiderAlertTone,
  SoundAlertSettings,
  Cuisine,
  CompanyPagesContent,
  CustomCompanyPage,
} from '../../types';
import { initialBrandSettings } from '../../data/initialData';
import {
  readAudioFileAsDataUrl,
  startRestaurantOrderRinging,
  stopRestaurantOrderRinging,
  startRiderTripRinging,
  stopRiderTripRinging,
  playAudioTunePreview,
  playRestaurantTone,
  playRiderTone,
} from '../../utils/soundUtils';
import { processAndPersistPhoto } from '../../utils/storageUtils';

import { DeleteConfirmModal } from './modals/DeleteConfirmModal';
import { RestaurantModal } from './modals/RestaurantModal';
import { RiderModal } from './modals/RiderModal';
import { ZoneModal } from './modals/ZoneModal';
import { GatewayModal } from './modals/GatewayModal';
import { CouponModal } from './modals/CouponModal';
import { BannerModal } from './modals/BannerModal';
import { FranchiseModal } from './modals/FranchiseModal';
import { GoogleMapsKeyModal } from './modals/GoogleMapsKeyModal';
import { AdminUserModal } from './modals/AdminUserModal';
import { CuisineModal } from './modals/CuisineModal';
import { CompanyPageModal } from './modals/CompanyPageModal';
import { LiveMap } from '../common/LiveMap';
import { StatementReportModal } from '../common/StatementReportModal';
import { AndroidApkModal } from '../common/AndroidApkModal';
import { WebsiteUniversalAccessModal } from '../common/WebsiteUniversalAccessModal';
import { DeviceLinkAdminHub } from './DeviceLinkAdminHub';
import { exportMartTallyReportToPDF } from '../../utils/martTallyPdfGenerator';

export const AdminDashboard: React.FC = () => {
  const {
    orders,
    deleteOrder,
    restaurants,
    menuItems,
    addRestaurant,
    updateRestaurant,
    deleteRestaurant,
    updateRestaurantStatus,
    cuisines,
    addCuisine,
    updateCuisine,
    deleteCuisine,
    toggleCuisineStatus,
    deliveryPartners,
    addDeliveryPartner,
    updateDeliveryPartner,
    deleteDeliveryPartner,
    updateRiderStatus,
    zones,
    addZone,
    updateZone,
    deleteZone,
    paymentGateways,
    addPaymentGateway,
    updatePaymentGateway,
    deletePaymentGateway,
    paymentTransactions,
    deletePaymentTransaction,
    coupons,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCoupon,
    banners,
    addBanner,
    updateBanner,
    deleteBanner,
    franchises,
    addFranchise,
    updateFranchise,
    deleteFranchise,
    updateFranchiseCredentials,
    toggleFranchiseStatus,
    googleMapsKeys,
    addGoogleMapsKey,
    updateGoogleMapsKey,
    deleteGoogleMapsKey,
    testGoogleMapsKey,
    brandSettings,
    updateBrandSettings,
    updateCompanyPages,
    payoutRequests,
    settlePayout,
    rejectPayout,
    deletePayout,
    adminUsers,
    addAdminUser,
    updateAdminUser,
    deleteAdminUser,
    authAdmin,
    logoutAdmin,
    setActivePortal,
    currentAdminRole,
    setCurrentAdminRole,
    supportTickets,
    replySupportTicket,
    deleteSupportTicket,
    addNotification,
    setSelectedPolicy,
    setCustomerView,
    isPermanentStorageActive,
    persistAllDataToPermanentStorage,
    exportPermanentCatalogBackup,
    importPermanentCatalogBackup,
    adminInitialTab,
    setAdminInitialTab,
    darkStores,
    martProducts,
  } = useApp();

  const [isSyncingPermanentStorage, setIsSyncingPermanentStorage] = useState(false);

  const handleForcePermanentSave = () => {
    setIsSyncingPermanentStorage(true);
    const result = persistAllDataToPermanentStorage();
    setTimeout(() => {
      setIsSyncingPermanentStorage(false);
    }, 700);
  };

  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'orders'
    | 'restaurants'
    | 'cuisines'
    | 'riders'
    | 'zones'
    | 'payments'
    | 'coupons'
    | 'franchises'
    | 'maps'
    | 'payouts'
    | 'support'
    | 'rbac'
    | 'sounds'
    | 'settings'
    | 'reports'
    | 'android_app'
    | 'universal_link'
  >((adminInitialTab as any) || 'overview');

  useEffect(() => {
    if (adminInitialTab) {
      setActiveTab(adminInitialTab as any);
    }
  }, [adminInitialTab]);

  // Cuisine search and filter state
  const [cuisineSearch, setCuisineSearch] = useState('');
  const [cuisineStatusFilter, setCuisineStatusFilter] = useState<'all' | 'active' | 'inactive' | 'popular'>('all');

  const [cuisineModal, setCuisineModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    data?: Cuisine | null;
  }>({ isOpen: false, mode: 'add' });

  // Sub-tab for Coupons vs Banners
  const [promoSubTab, setPromoSubTab] = useState<'coupons' | 'banners'>('coupons');
  // Sub-tab for Payment Gateways vs Live Transactions
  const [paymentSubTab, setPaymentSubTab] = useState<'gateways' | 'transactions'>('gateways');

  // Modal States
  const [restaurantModal, setRestaurantModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    data?: Restaurant | null;
  }>({ isOpen: false, mode: 'add' });

  const [riderModal, setRiderModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    data?: DeliveryPartner | null;
  }>({ isOpen: false, mode: 'add' });

  const [zoneModal, setZoneModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    data?: DeliveryZone | null;
  }>({ isOpen: false, mode: 'add' });

  const [gatewayModal, setGatewayModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    data?: PaymentGatewayItem | null;
  }>({ isOpen: false, mode: 'add' });

  const [couponModal, setCouponModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    data?: Coupon | null;
  }>({ isOpen: false, mode: 'add' });

  const [bannerModal, setBannerModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    data?: BannerPromo | null;
  }>({ isOpen: false, mode: 'add' });

  const [franchiseModal, setFranchiseModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    data?: Franchise | null;
  }>({ isOpen: false, mode: 'add' });

  const [franchiseCredentialsModal, setFranchiseCredentialsModal] = useState<{
    isOpen: boolean;
    franchise: Franchise | null;
    userId: string;
    password: string;
    showPass: boolean;
  }>({
    isOpen: false,
    franchise: null,
    userId: '',
    password: '',
    showPass: false,
  });

  const [franchiseFilterStatus, setFranchiseFilterStatus] = useState<'all' | 'active' | 'suspended'>('all');
  const [franchiseDeactivateModal, setFranchiseDeactivateModal] = useState<{
    isOpen: boolean;
    franchise: Franchise | null;
    reason: string;
  }>({
    isOpen: false,
    franchise: null,
    reason: '',
  });

  const [mapsKeyModal, setMapsKeyModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    data?: GoogleMapsKeyItem | null;
  }>({ isOpen: false, mode: 'add' });

  const [rejectPayoutModal, setRejectPayoutModal] = useState<{
    isOpen: boolean;
    payoutId: string;
    amount: number;
    recipientName: string;
  }>({
    isOpen: false,
    payoutId: '',
    amount: 0,
    recipientName: '',
  });

  const [isStatementReportModalOpen, setIsStatementReportModalOpen] = useState(false);
  const [isAndroidApkModalOpen, setIsAndroidApkModalOpen] = useState(false);
  const [isUniversalAccessModalOpen, setIsUniversalAccessModalOpen] = useState(false);
  const [reportModalEntityType, setReportModalEntityType] = useState<'restaurant' | 'delivery'>('restaurant');
  const [reportModalEntityId, setReportModalEntityId] = useState<string>('all');
  const [adminRejectionReason, setAdminRejectionReason] = useState(
    'Bank account details mismatch or IFSC verification required'
  );

  const [adminUserModal, setAdminUserModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    data?: AdminUser | null;
  }>({ isOpen: false, mode: 'add' });

  // Delete Confirm Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    itemName?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Support Reply State
  const [replyTicketId, setReplyTicketId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  // Selected KYC inspection modals
  const [inspectRestaurantDocs, setInspectRestaurantDocs] = useState<Restaurant | null>(null);
  const [inspectRiderDocs, setInspectRiderDocs] = useState<DeliveryPartner | null>(null);

  // Super Admin Logo Upload states
  const [customLogoUrl, setCustomLogoUrl] = useState('');
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);

  const isSuperAdmin = (authAdmin?.role === 'super_admin' || currentAdminRole === 'super_admin');
  const isFranchiseAdmin = (authAdmin?.role === 'franchise_admin' || currentAdminRole === 'franchise_admin');

  // Super Admin Orders Alert Sound States
  const defaultSoundSettings: SoundAlertSettings = {
    enabled: true,
    ringUntilAccepted: true,
    restaurantSoundEnabled: true,
    restaurantVolume: 0.85,
    riderSoundEnabled: true,
    riderVolume: 0.85,
  };

  const [soundConfig, setSoundConfig] = useState<SoundAlertSettings>(() => ({
    ...defaultSoundSettings,
    ...(brandSettings.soundAlerts || {}),
  }));

  const [isPlayingRestaurantPreview, setIsPlayingRestaurantPreview] = useState(false);
  const [isPlayingRiderPreview, setIsPlayingRiderPreview] = useState(false);
  const [isSimulatingRestaurantRing, setIsSimulatingRestaurantRing] = useState(false);
  const [isSimulatingRiderRing, setIsSimulatingRiderRing] = useState(false);
  const [audioUploadError, setAudioUploadError] = useState<string | null>(null);
  const [isUploadingRestaurantAudio, setIsUploadingRestaurantAudio] = useState(false);
  const [isUploadingRiderAudio, setIsUploadingRiderAudio] = useState(false);

  React.useEffect(() => {
    if (brandSettings.soundAlerts) {
      setSoundConfig((prev) => ({
        ...prev,
        ...brandSettings.soundAlerts,
      }));
    }
  }, [brandSettings.soundAlerts]);

  // Clean up any test ringing when switching tabs or unmounting
  React.useEffect(() => {
    return () => {
      stopRestaurantOrderRinging();
      stopRiderTripRinging();
    };
  }, []);

  const handleRestaurantAudioUpload = async (file: File) => {
    try {
      setAudioUploadError(null);
      setIsUploadingRestaurantAudio(true);
      const { dataUrl, fileName, fileSizeKb, durationSecs } = await readAudioFileAsDataUrl(file);

      setSoundConfig((prev) => ({
        ...prev,
        restaurantAudioUrl: dataUrl,
        restaurantAudioFileName: fileName,
        restaurantAudioName: file.name.replace(/\.[^/.]+$/, ''),
        restaurantAudioSizeKb: fileSizeKb,
        restaurantAudioDurationSecs: durationSecs,
      }));

      addNotification(
        'Restaurant Audio Tune Uploaded',
        `Custom alert tune "${fileName}" (${fileSizeKb} KB) loaded. Click "Save Audio Alert Changes" to apply.`,
        'system'
      );
    } catch (err: any) {
      setAudioUploadError(err.message || 'Failed to upload restaurant audio tune');
    } finally {
      setIsUploadingRestaurantAudio(false);
    }
  };

  const handleRemoveRestaurantAudio = () => {
    stopRestaurantOrderRinging();
    setIsPlayingRestaurantPreview(false);
    setIsSimulatingRestaurantRing(false);
    setSoundConfig((prev) => {
      const next = { ...prev };
      delete next.restaurantAudioUrl;
      delete next.restaurantAudioFileName;
      delete next.restaurantAudioName;
      delete next.restaurantAudioSizeKb;
      delete next.restaurantAudioDurationSecs;
      return next;
    });
  };

  const handleRiderAudioUpload = async (file: File) => {
    try {
      setAudioUploadError(null);
      setIsUploadingRiderAudio(true);
      const { dataUrl, fileName, fileSizeKb, durationSecs } = await readAudioFileAsDataUrl(file);

      setSoundConfig((prev) => ({
        ...prev,
        riderAudioUrl: dataUrl,
        riderAudioFileName: fileName,
        riderAudioName: file.name.replace(/\.[^/.]+$/, ''),
        riderAudioSizeKb: fileSizeKb,
        riderAudioDurationSecs: durationSecs,
      }));

      addNotification(
        'Rider Audio Tune Uploaded',
        `Custom trip alert tune "${fileName}" (${fileSizeKb} KB) loaded. Click "Save Audio Alert Changes" to apply.`,
        'system'
      );
    } catch (err: any) {
      setAudioUploadError(err.message || 'Failed to upload rider audio tune');
    } finally {
      setIsUploadingRiderAudio(false);
    }
  };

  const handleRemoveRiderAudio = () => {
    stopRiderTripRinging();
    setIsPlayingRiderPreview(false);
    setIsSimulatingRiderRing(false);
    setSoundConfig((prev) => {
      const next = { ...prev };
      delete next.riderAudioUrl;
      delete next.riderAudioFileName;
      delete next.riderAudioName;
      delete next.riderAudioSizeKb;
      delete next.riderAudioDurationSecs;
      return next;
    });
  };

  const handleToggleRestaurantPreview = () => {
    if (isPlayingRestaurantPreview || isSimulatingRestaurantRing) {
      stopRestaurantOrderRinging();
      setIsPlayingRestaurantPreview(false);
      setIsSimulatingRestaurantRing(false);
    } else {
      setIsPlayingRestaurantPreview(true);
      playAudioTunePreview(soundConfig.restaurantAudioUrl, 'restaurant', soundConfig.restaurantVolume);
      const dur = soundConfig.restaurantAudioDurationSecs
        ? soundConfig.restaurantAudioDurationSecs * 1000
        : 2500;
      setTimeout(() => {
        setIsPlayingRestaurantPreview(false);
      }, dur);
    }
  };

  const handleToggleRestaurantRingingSimulation = () => {
    if (isSimulatingRestaurantRing) {
      stopRestaurantOrderRinging();
      setIsSimulatingRestaurantRing(false);
    } else {
      setIsPlayingRestaurantPreview(false);
      setIsSimulatingRestaurantRing(true);
      startRestaurantOrderRinging(soundConfig.restaurantAudioUrl, soundConfig.restaurantVolume);
    }
  };

  const handleToggleRiderPreview = () => {
    if (isPlayingRiderPreview || isSimulatingRiderRing) {
      stopRiderTripRinging();
      setIsPlayingRiderPreview(false);
      setIsSimulatingRiderRing(false);
    } else {
      setIsPlayingRiderPreview(true);
      playAudioTunePreview(soundConfig.riderAudioUrl, 'rider', soundConfig.riderVolume);
      const dur = soundConfig.riderAudioDurationSecs
        ? soundConfig.riderAudioDurationSecs * 1000
        : 2200;
      setTimeout(() => {
        setIsPlayingRiderPreview(false);
      }, dur);
    }
  };

  const handleToggleRiderRingingSimulation = () => {
    if (isSimulatingRiderRing) {
      stopRiderTripRinging();
      setIsSimulatingRiderRing(false);
    } else {
      setIsPlayingRiderPreview(false);
      setIsSimulatingRiderRing(true);
      startRiderTripRinging(soundConfig.riderAudioUrl, soundConfig.riderVolume);
    }
  };

  const handleSaveSoundSettings = () => {
    updateBrandSettings({
      soundAlerts: {
        ...soundConfig,
        ringUntilAccepted: true,
      },
    });
    addNotification(
      'Audio Alert Settings Saved',
      'Platform order alert sounds and custom audio tunes updated! Rings continuously until accepted.',
      'system'
    );
  };

  // Settings Sub-Tabs
  const [settingsSubTab, setSettingsSubTab] = useState<'logo' | 'commercial' | 'company' | 'data'>('logo');
  const [companyPageSubTab, setCompanyPageSubTab] = useState<string>('about');
  const [customPageModal, setCustomPageModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    data: CustomCompanyPage | null;
  }>({ isOpen: false, mode: 'add', data: null });

  const [addClauseModal, setAddClauseModal] = useState<{
    isOpen: boolean;
    targetPage: 'about' | 'privacy' | 'terms' | 'refund';
    title: string;
    content: string;
  }>({ isOpen: false, targetPage: 'privacy', title: '', content: '' });

  const [addStatModal, setAddStatModal] = useState<{
    isOpen: boolean;
    number: string;
    label: string;
  }>({ isOpen: false, number: '', label: '' });

  const [addChannelModal, setAddChannelModal] = useState<{
    isOpen: boolean;
    title: string;
    detail: string;
    subtext: string;
  }>({ isOpen: false, title: '', detail: '', subtext: '' });

  const handleDownloadDatabaseBackup = () => {
    try {
      const jsonBackup = exportPermanentCatalogBackup();
      const blob = new Blob([jsonBackup], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `likart_master_database_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      addNotification('Backup Downloaded', 'Master catalog database backup file downloaded successfully.', 'system');
    } catch (e: any) {
      addNotification('Backup Failed', e?.message || 'Unable to export backup.', 'system');
    }
  };

  const handleImportDatabaseBackupFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        const res = importPermanentCatalogBackup(content);
        if (res.success) {
          addNotification('Database Restored', 'Master database restored and permanently saved.', 'system');
        } else {
          addNotification('Restore Error', res.message, 'system');
        }
      }
    };
    reader.readAsText(file);
  };

  // 1. Brand Logo & Visual Identity State
  const [tempLogoUrl, setTempLogoUrl] = useState<string>(brandSettings.logoUrl);
  const [tempFaviconUrl, setTempFaviconUrl] = useState<string>(brandSettings.faviconUrl || '/favicon.ico');
  const [isSavingLogo, setIsSavingLogo] = useState<boolean>(false);
  const [logoSaveSuccess, setLogoSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    setTempLogoUrl(brandSettings.logoUrl);
    setTempFaviconUrl(brandSettings.faviconUrl || '/favicon.ico');
  }, [brandSettings.logoUrl, brandSettings.faviconUrl]);

  const handleSaveBrandLogo = () => {
    if (isFranchiseAdmin || !isSuperAdmin) {
      addNotification('Access Denied', 'Super Admin role required to modify platform brand logo.', 'system');
      return;
    }
    setIsSavingLogo(true);
    updateBrandSettings({
      logoUrl: tempLogoUrl,
      faviconUrl: tempFaviconUrl,
    });
    persistAllDataToPermanentStorage();
    setTimeout(() => {
      setIsSavingLogo(false);
      setLogoSaveSuccess(true);
      addNotification(
        'Brand Identity Saved',
        'Platform brand logo and visual identity permanently saved and active across all portals.',
        'system'
      );
      setTimeout(() => setLogoSaveSuccess(false), 3500);
    }, 350);
  };

  const handleResetBrandLogo = () => {
    setTempLogoUrl('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=120&auto=format&fit=crop&q=80');
    setTempFaviconUrl('/favicon.ico');
    setLogoSaveSuccess(false);
  };

  // 2. Commercial Commission & Operations State
  const [commBrandName, setCommBrandName] = useState<string>(brandSettings.brandName);
  const [commTagline, setCommTagline] = useState<string>(brandSettings.tagline);
  const [commSupportPhone, setCommSupportPhone] = useState<string>(brandSettings.supportPhone);
  const [commSupportEmail, setCommSupportEmail] = useState<string>(brandSettings.supportEmail);
  const [commPlatformFee, setCommPlatformFee] = useState<number>(brandSettings.platformFee);
  const [commDefaultCommissionRate, setCommDefaultCommissionRate] = useState<number>(brandSettings.defaultCommissionRate);
  const [commGstRate, setCommGstRate] = useState<number>(brandSettings.gstRate || 5);
  const [commHeadquartersAddress, setCommHeadquartersAddress] = useState<string>(
    brandSettings.headquartersAddress || 'Bengaluru Central Commercial Hub, Karnataka, India - 560034'
  );
  const [isSavingCommercial, setIsSavingCommercial] = useState<boolean>(false);
  const [commercialSaveSuccess, setCommercialSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    setCommBrandName(brandSettings.brandName);
    setCommTagline(brandSettings.tagline);
    setCommSupportPhone(brandSettings.supportPhone);
    setCommSupportEmail(brandSettings.supportEmail);
    setCommPlatformFee(brandSettings.platformFee);
    setCommDefaultCommissionRate(brandSettings.defaultCommissionRate);
    setCommGstRate(brandSettings.gstRate || 5);
    setCommHeadquartersAddress(
      brandSettings.headquartersAddress || 'Bengaluru Central Commercial Hub, Karnataka, India - 560034'
    );
  }, [
    brandSettings.brandName,
    brandSettings.tagline,
    brandSettings.supportPhone,
    brandSettings.supportEmail,
    brandSettings.platformFee,
    brandSettings.defaultCommissionRate,
    brandSettings.gstRate,
    brandSettings.headquartersAddress,
  ]);

  const handleSaveCommercial = () => {
    if (isFranchiseAdmin || !isSuperAdmin) {
      addNotification('Access Denied', 'Super Admin role required to modify commercial commission & operations settings.', 'system');
      return;
    }
    if (!commBrandName.trim()) {
      addNotification('Validation Error', 'Brand Name cannot be empty.', 'system');
      return;
    }
    setIsSavingCommercial(true);
    updateBrandSettings({
      brandName: commBrandName.trim(),
      tagline: commTagline.trim(),
      supportPhone: commSupportPhone.trim(),
      supportEmail: commSupportEmail.trim(),
      platformFee: Number(commPlatformFee) || 0,
      defaultCommissionRate: Number(commDefaultCommissionRate) || 0,
      gstRate: Number(commGstRate) || 0,
      headquartersAddress: commHeadquartersAddress.trim(),
    });
    persistAllDataToPermanentStorage();
    setTimeout(() => {
      setIsSavingCommercial(false);
      setCommercialSaveSuccess(true);
      addNotification(
        'Commercial Settings Saved',
        'Commercial commission and operations settings permanently saved.',
        'system'
      );
      setTimeout(() => setCommercialSaveSuccess(false), 3500);
    }, 350);
  };

  const handleResetCommercial = () => {
    setCommBrandName(brandSettings.brandName);
    setCommTagline(brandSettings.tagline);
    setCommSupportPhone(brandSettings.supportPhone);
    setCommSupportEmail(brandSettings.supportEmail);
    setCommPlatformFee(brandSettings.platformFee);
    setCommDefaultCommissionRate(brandSettings.defaultCommissionRate);
    setCommGstRate(brandSettings.gstRate || 5);
    setCommHeadquartersAddress(
      brandSettings.headquartersAddress || 'Bengaluru Central Commercial Hub, Karnataka, India - 560034'
    );
    setCommercialSaveSuccess(false);
  };

  // 3. Company Pages & Policies State
  const defaultCompanyPages = brandSettings.companyPages || initialBrandSettings.companyPages!;
  const [companyPagesData, setCompanyPagesData] = useState<CompanyPagesContent>(() => defaultCompanyPages);
  const [isSavingCompany, setIsSavingCompany] = useState<boolean>(false);
  const [companySaveSuccess, setCompanySaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (brandSettings.companyPages) {
      setCompanyPagesData(brandSettings.companyPages);
    }
  }, [brandSettings.companyPages]);

  const handleSaveCompanyPages = (pageName?: string) => {
    if (isFranchiseAdmin || !isSuperAdmin) {
      addNotification('Access Denied', 'Super Admin role required to modify company legal & policy pages.', 'system');
      return;
    }
    setIsSavingCompany(true);
    updateCompanyPages(companyPagesData);
    persistAllDataToPermanentStorage();
    setTimeout(() => {
      setIsSavingCompany(false);
      setCompanySaveSuccess(true);
      addNotification(
        'Company Page Saved',
        pageName
          ? `${pageName} content saved and published to customer portal and footer links.`
          : 'Company policy page content permanently saved and published.',
        'system'
      );
      setTimeout(() => setCompanySaveSuccess(false), 3500);
    }, 350);
  };

  const handleResetCompanyPageToDefault = (key: 'about' | 'contact' | 'privacy' | 'terms' | 'refund') => {
    const defaults = initialBrandSettings.companyPages!;
    if (key === 'about') {
      setCompanyPagesData((prev) => ({ ...prev, aboutUs: { ...defaults.aboutUs } }));
    } else if (key === 'contact') {
      setCompanyPagesData((prev) => ({ ...prev, contactSupport: { ...defaults.contactSupport } }));
    } else if (key === 'privacy') {
      setCompanyPagesData((prev) => ({ ...prev, privacyPolicy: { ...defaults.privacyPolicy } }));
    } else if (key === 'terms') {
      setCompanyPagesData((prev) => ({ ...prev, termsConditions: { ...defaults.termsConditions } }));
    } else if (key === 'refund') {
      setCompanyPagesData((prev) => ({ ...prev, refundCancellation: { ...defaults.refundCancellation } }));
    }
    addNotification('Template Restored', 'Standard default text loaded. Click "Save Changes" to publish.', 'system');
  };

  const handlePreviewCompanyPage = (key: string) => {
    setSelectedPolicy(key);
    setActivePortal('customer');
    setCustomerView('policy');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Company Page Add/Edit/Delete Handlers
  const handleDeleteStandardCompanyPage = (
    key: 'about' | 'contact' | 'privacy' | 'terms' | 'refund',
    title: string
  ) => {
    if (isFranchiseAdmin || !isSuperAdmin) {
      addNotification('Access Denied', 'Super Admin required to delete company policy pages.', 'system');
      return;
    }
    setDeleteModal({
      isOpen: true,
      title: `Delete & Deactivate ${title}`,
      message: `Are you sure you want to delete and deactivate the "${title}" page? It will be immediately removed from the customer website footer and public view. You can restore or re-add it anytime.`,
      itemName: title,
      onConfirm: () => {
        setCompanyPagesData((prev) => {
          const keyMap: Record<string, keyof CompanyPagesContent> = {
            about: 'aboutUs',
            contact: 'contactSupport',
            privacy: 'privacyPolicy',
            terms: 'termsConditions',
            refund: 'refundCancellation',
          };
          const pageKey = keyMap[key];
          const updatedPage = { ...(prev[pageKey] as any), enabled: false };
          const updatedAll = { ...prev, [pageKey]: updatedPage };
          updateCompanyPages(updatedAll);
          return updatedAll;
        });
        addNotification(
          'Page Deactivated & Deleted',
          `"${title}" has been removed from customer footer links. Click "Restore / Re-Add Page" anytime to republish.`,
          'system'
        );
      },
    });
  };

  const handleRestoreStandardCompanyPage = (
    key: 'about' | 'contact' | 'privacy' | 'terms' | 'refund',
    title: string
  ) => {
    if (isFranchiseAdmin || !isSuperAdmin) {
      addNotification('Access Denied', 'Super Admin required to restore company policy pages.', 'system');
      return;
    }
    setCompanyPagesData((prev) => {
      const keyMap: Record<string, keyof CompanyPagesContent> = {
        about: 'aboutUs',
        contact: 'contactSupport',
        privacy: 'privacyPolicy',
        terms: 'termsConditions',
        refund: 'refundCancellation',
      };
      const pageKey = keyMap[key];
      const updatedPage = { ...(prev[pageKey] as any), enabled: true };
      const updatedAll = { ...prev, [pageKey]: updatedPage };
      updateCompanyPages(updatedAll);
      return updatedAll;
    });
    addNotification(
      'Page Restored & Published',
      `"${title}" has been restored and re-added to customer footer links.`,
      'system'
    );
  };

  const handleDeleteCustomCompanyPage = (page: CustomCompanyPage) => {
    if (isFranchiseAdmin || !isSuperAdmin) {
      addNotification('Access Denied', 'Super Admin required to delete custom company pages.', 'system');
      return;
    }
    setDeleteModal({
      isOpen: true,
      title: `Permanently Delete ${page.title}`,
      message: `Are you sure you want to permanently delete the custom document "${page.title}"? This cannot be undone.`,
      itemName: page.title,
      onConfirm: () => {
        setCompanyPagesData((prev) => {
          const updatedPages = (prev.customPages || []).filter((p) => p.id !== page.id);
          const updatedAll = { ...prev, customPages: updatedPages };
          updateCompanyPages(updatedAll);
          return updatedAll;
        });
        setCompanyPageSubTab('about');
        addNotification(
          'Document Deleted',
          `"${page.title}" has been permanently removed.`,
          'system'
        );
      },
    });
  };

  const handleAddCustomStat = (number: string, label: string) => {
    if (!number.trim() || !label.trim()) return;
    const newStat = {
      id: `stat-${Date.now()}`,
      number: number.trim(),
      label: label.trim(),
    };
    setCompanyPagesData((prev) => ({
      ...prev,
      aboutUs: {
        ...prev.aboutUs,
        customStats: [...(prev.aboutUs.customStats || []), newStat],
      },
    }));
    addNotification('Stat Metric Added', `Added highlight card "${number} - ${label}".`, 'system');
  };

  const handleDeleteCustomStat = (id: string) => {
    setCompanyPagesData((prev) => ({
      ...prev,
      aboutUs: {
        ...prev.aboutUs,
        customStats: (prev.aboutUs.customStats || []).filter((s) => s.id !== id),
      },
    }));
    addNotification('Stat Metric Removed', 'Highlight card removed.', 'system');
  };

  const handleAddCustomChannel = (title: string, detail: string, subtext?: string) => {
    if (!title.trim() || !detail.trim()) return;
    const newChan = {
      id: `chan-${Date.now()}`,
      title: title.trim(),
      detail: detail.trim(),
      subtext: subtext?.trim() || '',
    };
    setCompanyPagesData((prev) => ({
      ...prev,
      contactSupport: {
        ...prev.contactSupport,
        customChannels: [...(prev.contactSupport.customChannels || []), newChan],
      },
    }));
    addNotification('Contact Channel Added', `Added support channel "${title}".`, 'system');
  };

  const handleDeleteCustomChannel = (id: string) => {
    setCompanyPagesData((prev) => ({
      ...prev,
      contactSupport: {
        ...prev.contactSupport,
        customChannels: (prev.contactSupport.customChannels || []).filter((c) => c.id !== id),
      },
    }));
    addNotification('Channel Removed', 'Support channel removed.', 'system');
  };

  const handleAddCustomSection = (
    targetPage: 'about' | 'privacy' | 'terms' | 'refund',
    title: string,
    content: string
  ) => {
    if (!title.trim() || !content.trim()) return;
    const newSec = {
      id: `sec-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
    };
    const keyMap: Record<string, keyof CompanyPagesContent> = {
      about: 'aboutUs',
      privacy: 'privacyPolicy',
      terms: 'termsConditions',
      refund: 'refundCancellation',
    };
    const pKey = keyMap[targetPage];
    setCompanyPagesData((prev) => ({
      ...prev,
      [pKey]: {
        ...(prev[pKey] as any),
        customSections: [...((prev[pKey] as any).customSections || []), newSec],
      },
    }));
    addNotification('Section Added', `Added section "${title}".`, 'system');
  };

  const handleDeleteCustomSection = (
    targetPage: 'about' | 'privacy' | 'terms' | 'refund',
    id: string
  ) => {
    const keyMap: Record<string, keyof CompanyPagesContent> = {
      about: 'aboutUs',
      privacy: 'privacyPolicy',
      terms: 'termsConditions',
      refund: 'refundCancellation',
    };
    const pKey = keyMap[targetPage];
    setCompanyPagesData((prev) => ({
      ...prev,
      [pKey]: {
        ...(prev[pKey] as any),
        customSections: ((prev[pKey] as any).customSections || []).filter((s: any) => s.id !== id),
      },
    }));
    addNotification('Section Removed', 'Clause/section removed.', 'system');
  };

  const PRESET_LOGOS = [
    {
      name: 'Gourmet Bistro & Cloche',
      url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
    },
    {
      name: 'Artisan Burger & Grill',
      url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80',
    },
    {
      name: 'Express Speed Courier',
      url: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=200&auto=format&fit=crop&q=80',
    },
    {
      name: 'Wok & Culinary Bowl',
      url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&auto=format&fit=crop&q=80',
    },
  ];

  const handleLogoFileUpload = async (file: File) => {
    if (!file) return;
    const validImgRegex = /\.(jpe?g|png|webp|gif|svg|avif|heic|heif|bmp|tiff)$/i;
    if (!file.type.startsWith('image/') && !validImgRegex.test(file.name)) {
      addNotification('Invalid File Type', 'Please upload a valid image file (PNG, JPG, SVG, WebP, GIF, AVIF, HEIC, BMP).', 'system');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      addNotification('File Too Large', 'Logo image size must be under 25MB.', 'system');
      return;
    }
    try {
      const res = await processAndPersistPhoto(file, {
        maxWidth: 600,
        maxHeight: 600,
        quality: 0.85,
        preserveTransparency: true,
      });
      if (res && res.dataUrl) {
        setTempLogoUrl(res.dataUrl);
        setLogoSaveSuccess(false);
        addNotification(
          'Logo Loaded & Prepared',
          `New ${res.format} brand logo processed and saved to permanent vault. Click "Save Brand Logo & Visual Identity" below to apply across all portals.`,
          'system'
        );
      }
    } catch {
      addNotification('Upload Failed', 'Could not process logo file. Please try another image format.', 'system');
    }
  };

  // Overall platform statistics
  const totalGMV = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const platformRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + Math.round(o.itemTotal * 0.15) + o.platformFee, 0);

  const totalFranchiseInvestment = franchises.reduce((acc, f) => acc + f.investmentAmount, 0);
  const totalFranchiseOutlets = franchises.reduce((acc, f) => acc + f.activeOutletsCount, 0);

  const handleExportCSV = (type: 'orders' | 'payouts' | 'restaurants' | 'franchises') => {
    if (type === 'franchises' && isFranchiseAdmin) {
      addNotification('Access Denied', 'Downloading Franchise Network Reports is restricted to Super Admin.', 'system');
      return;
    }
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (type === 'orders') {
      csvContent += 'Order ID,Customer,Restaurant,Total,Payment Method,Status,Date\n';
      orders.forEach((o) => {
        csvContent += `"${o.id}","${o.customerName}","${o.restaurantName}",${o.totalAmount},"${o.paymentMethod}","${o.status}","${o.createdAt}"\n`;
      });
    } else if (type === 'payouts') {
      csvContent += 'Payout ID,Recipient,Type,Amount,Status,Date\n';
      payoutRequests.forEach((p) => {
        csvContent += `"${p.id}","${p.recipientName}","${p.recipientType}",${p.amount},"${p.status}","${p.requestedAt}"\n`;
      });
    } else if (type === 'franchises') {
      csvContent += 'Franchise ID,Business Name,Partner,Territory,Tier,Royalty %,Investment,Outlets,Status\n';
      franchises.forEach((f) => {
        csvContent += `"${f.id}","${f.franchiseName}","${f.ownerName}","${f.territory}","${f.tier}",${f.revenueSharePercent},${f.investmentAmount},${f.activeOutletsCount},"${f.status}"\n`;
      });
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `likart_${type}_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendTicketReply = (id: string) => {
    if (!replyMessage) return;
    replySupportTicket(id, replyMessage);
    setReplyTicketId(null);
    setReplyMessage('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Admin Header */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {brandSettings.logoUrl ? (
            <div className="w-13 h-13 bg-white rounded-2xl p-1.5 flex items-center justify-center overflow-hidden border border-purple-400/40 shadow-lg shadow-purple-500/10 shrink-0">
              <img
                src={brandSettings.logoUrl}
                alt={brandSettings.brandName}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="p-3 bg-purple-600/30 text-purple-400 rounded-2xl border border-purple-500/30 shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black font-heading">
                {brandSettings.brandName} Food Super Admin Control
              </h2>
              <span className="bg-orange-500/20 text-orange-300 text-[10px] font-bold px-2 py-0.5 rounded border border-orange-500/40 uppercase">
                Food Operations • Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Super Admin Central Command • Full Add/Edit/Delete access for Platform Logo, Restaurants, Menus, Cuisines, Fleet, Zones, Gateways &amp; Maps
            </p>
          </div>
        </div>

        {/* Admin Session & Navigation Actions */}
        <div className="flex items-center gap-2.5 text-xs flex-wrap">
          {/* Permanent Save Access indicator & quick sync */}
          <button
            type="button"
            onClick={handleForcePermanentSave}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 font-bold rounded-xl transition active:scale-95 shadow-xs"
            title="Permanent storage access active. Click to immediately force-persist all data."
          >
            <span className={`w-2 h-2 rounded-full bg-emerald-400 ${isSyncingPermanentStorage ? 'animate-ping' : ''}`} />
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="hidden md:inline">Permanent Save Access:</span>
            <span>{isSyncingPermanentStorage ? 'Saving...' : 'Active'}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold hidden sm:inline">Active Admin:</span>
            <span className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold">
              {authAdmin?.name || 'Super Admin'} ({authAdmin?.role.replace(/_/g, ' ') || 'super admin'})
            </span>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('universal_link')}
            className={`px-3.5 py-2 font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 active:scale-95 ${
              activeTab === 'universal_link'
                ? 'bg-indigo-500 text-white ring-2 ring-white/30'
                : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white'
            }`}
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
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 active:scale-95"
            title="Download Google Play Store .aab bundle, standalone APK, or export complete Android Build Kit"
          >
            <Smartphone className="w-4 h-4 text-emerald-200" />
            <span>Android App (.aab / APK)</span>
          </button>

          <button
            onClick={() => logoutAdmin()}
            className="px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold rounded-xl border border-rose-500/40 transition"
          >
            Log Out
          </button>

          <button
            onClick={() => setActivePortal('customer')}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition"
          >
            Customer Web
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 overflow-x-auto gap-1 no-scrollbar">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'orders', label: isFranchiseAdmin ? `Orders (${orders.length}) (Read-Only)` : `Orders (${orders.length})`, icon: ShoppingBag },
          {
            id: 'restaurants',
            label: `Restaurants (${restaurants.length})`,
            icon: Store,
            badge: restaurants.filter((r) => r.status === 'pending').length || undefined,
          },
          {
            id: 'cuisines',
            label: isFranchiseAdmin ? `All Cuisines (Read-Only)` : `All Cuisines (${cuisines.length})`,
            icon: UtensilsCrossed,
          },
          {
            id: 'riders',
            label: `Delivery Partners (${deliveryPartners.length})`,
            icon: Bike,
            badge: deliveryPartners.filter((d) => d.status === 'pending').length || undefined,
          },
          { id: 'zones', label: isFranchiseAdmin ? `Zones (Read-Only)` : `Zones (${zones.length})`, icon: MapPin },
          { id: 'payments', label: isFranchiseAdmin ? `Payment Gateways (Read-Only)` : `Payment Gateways (${paymentGateways.length})`, icon: CreditCard },
          { id: 'coupons', label: isFranchiseAdmin ? `Coupons & Banners (Read-Only)` : `Coupons & Banners`, icon: Tag },
          { id: 'franchises', label: isFranchiseAdmin ? `Franchises (Read-Only)` : `Franchises (${franchises.length})`, icon: Building2 },
          { id: 'maps', label: isFranchiseAdmin ? `Google Maps & API Keys (Read-Only)` : `Google Maps & API Keys`, icon: Compass },
          { id: 'payouts', label: `Payouts (${payoutRequests.length})`, icon: DollarSign },
          { id: 'support', label: `Support (${supportTickets.length})`, icon: HelpCircle },
          ...(!isFranchiseAdmin ? [{ id: 'rbac', label: `Admin Roles (${adminUsers.length})`, icon: Users }] : []),
          { id: 'sounds', label: isSuperAdmin ? 'Order Alert Sounds (Super Admin)' : 'Order Alert Sounds', icon: Volume2 },
          { id: 'settings', label: isFranchiseAdmin ? 'Brand Identity (Read-Only)' : 'Settings', icon: Settings },
          { id: 'reports', label: 'Export & Reports', icon: Download },
          { id: 'android_app', label: 'Android & Play Store (.aab)', icon: Smartphone },
          { id: 'universal_link', label: 'Device Link (QR & Share)', icon: Smartphone },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition active:scale-95 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-black">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 1. OVERVIEW STATS TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Gross Merchandise Value (GMV)
              </span>
              <p className="text-2xl font-black font-heading text-slate-900 mt-1">₹{totalGMV}</p>
              <span className="text-[11px] text-emerald-600 font-bold mt-1 block">
                ↑ +18.4% this month
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Platform Commission Revenue
              </span>
              <p className="text-2xl font-black font-heading text-purple-600 mt-1">
                ₹{platformRevenue}
              </p>
              <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                Avg 15% rate + ₹5 fee
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Active Restaurants & Outlets
              </span>
              <p className="text-2xl font-black font-heading text-emerald-600 mt-1">
                {restaurants.filter((r) => r.status === 'approved').length}
              </p>
              <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                Across {zones.length} active delivery zones
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Franchise Network Investment
              </span>
              <p className="text-2xl font-black font-heading text-amber-600 mt-1">
                ₹{(totalFranchiseInvestment / 100000).toFixed(1)}L
              </p>
              <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                {franchises.length} regional franchises ({totalFranchiseOutlets} cloud outlets)
              </span>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className={`grid ${isFranchiseAdmin ? 'grid-cols-2 max-w-md' : 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-6'} gap-3`}>
            <button
              onClick={() => setRestaurantModal({ isOpen: true, mode: 'add' })}
              className="p-4 bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl text-left space-y-1 transition group shadow-xs"
            >
              <Store className="w-5 h-5 text-emerald-600 mb-2" />
              <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-600">+ Add Restaurant</div>
              <p className="text-[10px] text-slate-400">Enrol new outlet & KYC</p>
            </button>

            <button
              onClick={() => setRiderModal({ isOpen: true, mode: 'add' })}
              className="p-4 bg-white border border-slate-200 hover:border-blue-500 rounded-2xl text-left space-y-1 transition group shadow-xs"
            >
              <Bike className="w-5 h-5 text-blue-600 mb-2" />
              <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600">+ Add Rider</div>
              <p className="text-[10px] text-slate-400">Register delivery partner</p>
            </button>

            {!isFranchiseAdmin && (
              <>
                <button
                  onClick={() => setZoneModal({ isOpen: true, mode: 'add' })}
                  className="p-4 bg-white border border-slate-200 hover:border-purple-500 rounded-2xl text-left space-y-1 transition group shadow-xs"
                >
                  <MapPin className="w-5 h-5 text-purple-600 mb-2" />
                  <div className="text-xs font-bold text-slate-800 group-hover:text-purple-600">+ Add Zone</div>
                  <p className="text-[10px] text-slate-400">Define service boundary</p>
                </button>

                <button
                  onClick={() => setFranchiseModal({ isOpen: true, mode: 'add' })}
                  className="p-4 bg-white border border-slate-200 hover:border-amber-500 rounded-2xl text-left space-y-1 transition group shadow-xs"
                >
                  <Building2 className="w-5 h-5 text-amber-600 mb-2" />
                  <div className="text-xs font-bold text-slate-800 group-hover:text-amber-600">+ Add Franchise</div>
                  <p className="text-[10px] text-slate-400">Expand territory partners</p>
                </button>

                <button
                  onClick={() => setGatewayModal({ isOpen: true, mode: 'add' })}
                  className="p-4 bg-white border border-slate-200 hover:border-indigo-500 rounded-2xl text-left space-y-1 transition group shadow-xs"
                >
                  <CreditCard className="w-5 h-5 text-indigo-600 mb-2" />
                  <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">+ Add Gateway</div>
                  <p className="text-[10px] text-slate-400">Configure payment processor</p>
                </button>

                <button
                  onClick={() => setMapsKeyModal({ isOpen: true, mode: 'add' })}
                  className="p-4 bg-white border border-slate-200 hover:border-rose-500 rounded-2xl text-left space-y-1 transition group shadow-xs"
                >
                  <Compass className="w-5 h-5 text-rose-600 mb-2" />
                  <div className="text-xs font-bold text-slate-800 group-hover:text-rose-600">+ Maps API Key</div>
                  <p className="text-[10px] text-slate-400">Add Google Maps token</p>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* 2. ORDERS MANAGEMENT TAB */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
          {isFranchiseAdmin && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-xs text-amber-800">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Franchise Admin Mode:</strong> Customer orders dispatch records are in read-only view. The option to delete or modify customer orders is disabled and restricted to Super Admin.
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-black text-lg text-slate-900">
                Live Orders Dispatch & Life-Cycle Management
              </h3>
              <p className="text-xs text-slate-500">
                {isFranchiseAdmin
                  ? 'Track preparation, delivery partner pickup, and customer delivery OTPs (Read-Only for Franchise Admin)'
                  : 'Track preparation, delivery partner pickup, and customer delivery OTPs'}
              </p>
            </div>
            <button
              onClick={() => handleExportCSV('orders')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="space-y-3">
            {orders.length === 0 ? (
              <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-6">
                <ShoppingBag className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="font-bold text-sm text-slate-700">No Orders in Dispatch</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Customer orders placed through the customer portal will appear here for live lifecycle tracking.
                </p>
              </div>
            ) : (
              orders.map((o) => (
              <div
                key={o.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-slate-900">#{o.id}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-bold text-xs text-slate-800">{o.restaurantName}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-xs text-slate-600">Cust: {o.customerName} ({o.customerPhone})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900">₹{o.totalAmount}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-orange-100 text-orange-800">
                      {o.status.replace(/_/g, ' ')}
                    </span>
                    {!isFranchiseAdmin && (
                      <button
                        onClick={() =>
                          setDeleteModal({
                            isOpen: true,
                            title: 'Delete Order Record',
                            message: `Are you sure you want to permanently delete order #${o.id} (${o.customerName})? This will remove it from all active dispatches, customer histories, and audit records.`,
                            itemName: `Order #${o.id}`,
                            onConfirm: () => deleteOrder(o.id),
                          })
                        }
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
                  <div>
                    <span>Items: </span>
                    <span className="font-medium">
                      {o.items.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                    </span>
                  </div>
                  <div>
                    <span>Delivery OTP: </span>
                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300">
                      {o.deliveryOtp}
                    </span>
                  </div>
                  <div>
                    <span>Rider: </span>
                    <span className="font-bold text-slate-800">{o.deliveryPartnerName || 'Assigned Rider'}</span>
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
        </div>
      )}

      {/* 3. RESTAURANT & KYC MANAGEMENT TAB */}
      {activeTab === 'restaurants' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-heading font-black text-lg text-slate-900">
                Restaurants Management & Compliance
              </h3>
              <p className="text-xs text-slate-500">
                Super Admin Add, Edit, Delete access with FSSAI, GSTIN & UDYAM document verification
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setReportModalEntityType('restaurant');
                  setReportModalEntityId('all');
                  setIsStatementReportModalOpen(true);
                }}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition active:scale-95 border border-slate-200"
                title="Download Restaurant Statement of Account & Payout Reports (Excel / PDF)"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Restaurant Statements</span>
              </button>
              <button
                onClick={() => setRestaurantModal({ isOpen: true, mode: 'add' })}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Restaurant</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {restaurants.length === 0 ? (
              <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-6">
                <Store className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="font-bold text-sm text-slate-700">No Restaurants Registered</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Onboard your first restaurant kitchen using the "Add New Restaurant" button above.
                </p>
              </div>
            ) : (
              restaurants.map((r) => (
              <div
                key={r.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={r.logo}
                    alt={r.name}
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{r.name}</h4>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          r.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {r.status}
                      </span>
                      {r.pureVeg && (
                        <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-200">
                          Pure Veg
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Owner: <span className="font-semibold text-slate-700">{r.ownerName}</span> • Phone: {r.phone} • Email: {r.email} • Comm: <span className="font-bold text-purple-700">{r.commissionRate}%</span>
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      FSSAI: {r.kyc.fssaiNumber || 'N/A'} | GST: {r.kyc.gstinNumber || 'N/A'} | Zone: {r.zoneId}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status Toggle & KYC Actions */}
                  {r.status === 'pending' ? (
                    <button
                      onClick={() => updateRestaurantStatus(r.id, 'approved')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition"
                    >
                      Approve KYC
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        updateRestaurantStatus(
                          r.id,
                          r.status === 'approved' ? 'suspended' : 'approved'
                        )
                      }
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                        r.status === 'approved'
                          ? 'border border-amber-300 text-amber-700 hover:bg-amber-50'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {r.status === 'approved' ? 'Suspend' : 'Reactivate'}
                    </button>
                  )}

                  {/* Inspect KYC Documents Button */}
                  <button
                    onClick={() => setInspectRestaurantDocs(r)}
                    className="p-2 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl transition font-bold text-xs flex items-center gap-1"
                    title="Inspect Restaurant KYC Documents & Photo"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Docs</span>
                  </button>

                  {/* Statement of Account Button */}
                  <button
                    onClick={() => {
                      setReportModalEntityType('restaurant');
                      setReportModalEntityId(r.id);
                      setIsStatementReportModalOpen(true);
                    }}
                    className="p-2 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl transition font-bold text-xs flex items-center gap-1"
                    title={`Download Daily/Weekly/Monthly Statement of Account for ${r.name}`}
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Statement</span>
                  </button>

                  {/* Edit Restaurant Button */}
                  <button
                    onClick={() => setRestaurantModal({ isOpen: true, mode: 'edit', data: r })}
                    className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition font-bold text-xs flex items-center gap-1"
                    title="Edit Restaurant"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                    <span>Edit</span>
                  </button>

                  {/* Delete Restaurant Button */}
                  <button
                    onClick={() =>
                      setDeleteModal({
                        isOpen: true,
                        title: 'Delete Restaurant Outlet',
                        message: `Are you sure you want to permanently delete "${r.name}"? This action cannot be reversed.`,
                        itemName: r.name,
                        onConfirm: () => deleteRestaurant(r.id),
                      })
                    }
                    className="p-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl transition"
                    title="Delete Restaurant"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
            )}
          </div>
        </div>
      )}

      {/* 3B. ALL CUISINES MANAGEMENT TAB (SUPER ADMIN ACCESS) */}
      {activeTab === 'cuisines' && (
        <div className="space-y-6">
          {isFranchiseAdmin && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-xs text-amber-800">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Read-Only Franchise View:</strong> Master Cuisine catalog management (Add, Edit, Delete, and Status Toggle) is restricted exclusively to Super Administrators.
              </span>
            </div>
          )}

          {/* Header & KPI Summary Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
                  <UtensilsCrossed className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-heading font-black text-lg sm:text-xl text-slate-900">
                      All Cuisines & Culinary Categories
                    </h3>
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isSuperAdmin && !isFranchiseAdmin
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {isSuperAdmin && !isFranchiseAdmin ? (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                          <span>Super Admin Full Access</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Read-Only Mode</span>
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Add, edit, or delete master cuisines that power customer homepage category chips, search tags, and restaurant classifications.
                  </p>
                </div>
              </div>

              {!isFranchiseAdmin && (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleForcePermanentSave}
                    className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-300 flex items-center gap-1.5 transition active:scale-95 shadow-xs"
                    title="Force sync all master cuisines & configuration to permanent storage"
                  >
                    <CheckCircle2 className={`w-4 h-4 text-emerald-600 ${isSyncingPermanentStorage ? 'animate-spin' : ''}`} />
                    <span>{isSyncingPermanentStorage ? 'Persisting...' : 'Permanent Save All'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const json = exportPermanentCatalogBackup();
                      const blob = new Blob([json], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `likart_master_cuisines_backup_${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                      addNotification('Backup Exported', 'Permanent master catalog JSON downloaded successfully.', 'system');
                    }}
                    className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 transition active:scale-95"
                    title="Download permanent JSON backup of all cuisines, restaurants and categories"
                  >
                    <Download className="w-4 h-4 text-slate-500" />
                    <span className="hidden sm:inline">Export Backup</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCuisineModal({ isOpen: true, mode: 'add', data: null })}
                    className="px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-xs rounded-xl shadow-md shadow-orange-600/20 flex items-center gap-1.5 transition active:scale-95"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Add New Cuisine</span>
                  </button>
                </div>
              )}
            </div>

            {/* KPI Summary Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Total Master Cuisines
                </span>
                <p className="text-2xl font-black font-heading text-slate-900 mt-1">
                  {cuisines.length}
                </p>
                <span className="text-[11px] text-slate-500">Global catalog entries</span>
              </div>

              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                  Active in Customer App
                </span>
                <p className="text-2xl font-black font-heading text-emerald-700 mt-1">
                  {cuisines.filter((c) => c.isActive !== false).length}
                </p>
                <span className="text-[11px] text-emerald-600">Visible in CategoryBar</span>
              </div>

              <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200/80">
                <span className="text-[10px] uppercase font-bold text-blue-700 block flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Permanent Save Access</span>
                </span>
                <p className="text-2xl font-black font-heading text-blue-700 mt-1 flex items-center gap-1.5">
                  <span>Active</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </p>
                <span className="text-[11px] text-blue-600 font-medium">Auto-Persisted (Storage + IndexedDB)</span>
              </div>

              <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200/80">
                <span className="text-[10px] uppercase font-bold text-purple-700 block">
                  Mapped Restaurants
                </span>
                <p className="text-2xl font-black font-heading text-purple-700 mt-1">
                  {restaurants.length}
                </p>
                <span className="text-[11px] text-purple-600">Outlets tagged with cuisines</span>
              </div>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={cuisineSearch}
                  onChange={(e) => setCuisineSearch(e.target.value)}
                  placeholder="Search cuisines by name, slug, or description..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-orange-500"
                />
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'all', label: 'All Cuisines' },
                  { id: 'active', label: 'Active Only' },
                  { id: 'inactive', label: 'Inactive' },
                  { id: 'popular', label: '★ Popular' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setCuisineStatusFilter(f.id as any)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                      cuisineStatusFilter === f.id
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cuisines Grid */}
            {(() => {
              const filteredCuisines = cuisines.filter((c) => {
                if (cuisineStatusFilter === 'active' && c.isActive === false) return false;
                if (cuisineStatusFilter === 'inactive' && c.isActive !== false) return false;
                if (cuisineStatusFilter === 'popular' && !c.isPopular) return false;
                if (cuisineSearch.trim()) {
                  const q = cuisineSearch.toLowerCase();
                  const matchName = c.name.toLowerCase().includes(q);
                  const matchSlug = (c.slug || '').toLowerCase().includes(q);
                  const matchDesc = (c.description || '').toLowerCase().includes(q);
                  if (!matchName && !matchSlug && !matchDesc) return false;
                }
                return true;
              });

              if (filteredCuisines.length === 0) {
                return (
                  <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                    <UtensilsCrossed className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-sm font-bold text-slate-700">No Matching Cuisines Found</p>
                    <p className="text-xs text-slate-500">
                      Try clearing your search filter or click &ldquo;Add New Cuisine&rdquo; to create a new culinary category.
                    </p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCuisines.map((cui) => {
                    const mappedRests = restaurants.filter((r) =>
                      r.cuisine.some(
                        (rc) =>
                          rc.toLowerCase() === cui.name.toLowerCase() ||
                          rc.toLowerCase().includes(cui.name.toLowerCase()) ||
                          cui.name.toLowerCase().includes(rc.toLowerCase()) ||
                          (cui.slug && rc.toLowerCase().includes(cui.slug.toLowerCase()))
                      )
                    );

                    return (
                      <div
                        key={cui.id}
                        className={`rounded-2xl border p-4 flex flex-col justify-between gap-3.5 transition hover:shadow-md ${
                          cui.isActive !== false
                            ? 'bg-white border-slate-200'
                            : 'bg-slate-50/80 border-slate-200 opacity-75'
                        }`}
                      >
                        <div className="space-y-3">
                          {/* Top Row: Image + Emoji + Name + Badges */}
                          <div className="flex items-start gap-3">
                            <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                              {cui.image ? (
                                <img
                                  src={cui.image}
                                  alt={cui.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src =
                                      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 bg-orange-50">
                                  <UtensilsCrossed className="w-6 h-6 text-orange-500" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="font-heading font-black text-sm text-slate-900 truncate">
                                  {cui.name}
                                </h4>
                                {cui.isPopular && (
                                  <span className="text-[9px] font-black uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                    <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-600" />
                                    Popular
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                                slug: <span className="text-slate-600 font-semibold">{cui.slug}</span>
                              </p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span
                                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                    cui.isActive !== false
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-slate-200 text-slate-600'
                                  }`}
                                >
                                  {cui.isActive !== false ? '● Active' : '○ Hidden'}
                                </span>
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                  {mappedRests.length} {mappedRests.length === 1 ? 'Outlet' : 'Outlets'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {cui.description || 'Standard culinary category available for customer discovery and restaurant tagging.'}
                          </p>

                          {/* Mapped Restaurants Preview */}
                          {mappedRests.length > 0 && (
                            <div className="pt-1 flex items-center gap-1 flex-wrap">
                              <span className="text-[10px] font-bold text-slate-400">Serving:</span>
                              {mappedRests.slice(0, 3).map((mr) => (
                                <span
                                  key={mr.id}
                                  className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md truncate max-w-[130px]"
                                >
                                  {mr.name}
                                </span>
                              ))}
                              {mappedRests.length > 3 && (
                                <span className="text-[10px] font-bold text-slate-400">
                                  +{mappedRests.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Actions Footer */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          {!isFranchiseAdmin ? (
                            <>
                              <button
                                type="button"
                                onClick={() => toggleCuisineStatus(cui.id)}
                                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition ${
                                  cui.isActive !== false
                                    ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                                }`}
                              >
                                {cui.isActive !== false ? 'Disable' : 'Enable'}
                              </button>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setCuisineModal({
                                      isOpen: true,
                                      mode: 'edit',
                                      data: cui,
                                    })
                                  }
                                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] rounded-xl border border-blue-200 transition flex items-center gap-1"
                                  title="Edit Cuisine"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  <span>Edit</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeleteModal({
                                      isOpen: true,
                                      title: 'Delete Master Cuisine',
                                      message: `Are you sure you want to permanently delete "${cui.name}" from All Cuisines?${
                                        mappedRests.length > 0
                                          ? ` Note: ${mappedRests.length} restaurant(s) currently reference this cuisine.`
                                          : ''
                                      }`,
                                      itemName: `${cui.name} (${cui.slug})`,
                                      onConfirm: () => deleteCuisine(cui.id),
                                    })
                                  }
                                  className="p-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl transition"
                                  title="Delete Cuisine"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Super Admin Exclusive Actions
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 4. DELIVERY PARTNER & FLEET MANAGEMENT TAB */}
      {activeTab === 'riders' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-heading font-black text-lg text-slate-900">
                Delivery Partners & Fleet Management
              </h3>
              <p className="text-xs text-slate-500">
                Super Admin Add, Edit, Delete access with DL, RC, Aadhaar verification & UPI payouts
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setReportModalEntityType('delivery');
                  setReportModalEntityId('all');
                  setIsStatementReportModalOpen(true);
                }}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition active:scale-95 border border-slate-200"
                title="Download Delivery Partner Statement of Account & Payout Reports (Excel / PDF)"
              >
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                <span>Rider Statements</span>
              </button>
              <button
                onClick={() => setRiderModal({ isOpen: true, mode: 'add' })}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Enrol New Rider</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {deliveryPartners.length === 0 ? (
              <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-6">
                <Bike className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="font-bold text-sm text-slate-700">No Delivery Partners Registered</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Enrol delivery partners using the "Enrol New Rider" button above.
                </p>
              </div>
            ) : (
              deliveryPartners.map((rider) => (
              <div
                key={rider.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={rider.avatar}
                    alt={rider.name}
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{rider.name}</h4>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          rider.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rider.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {rider.status}
                      </span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-mono">
                        {rider.kyc.vehicleType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Phone: {rider.phone} • Email: {rider.email} • RC: <span className="font-mono text-slate-800">{rider.kyc.vehicleNumber}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      DL: {rider.kyc.drivingLicenseNumber} | Aadhaar: {rider.kyc.aadhaarNumber} | UPI: {rider.kyc.payoutUpiOrBank}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {rider.status === 'pending' ? (
                    <button
                      onClick={() => updateRiderStatus(rider.id, 'approved')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition"
                    >
                      Approve KYC
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        updateRiderStatus(
                          rider.id,
                          rider.status === 'approved' ? 'suspended' : 'approved'
                        )
                      }
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                        rider.status === 'approved'
                          ? 'border border-amber-300 text-amber-700 hover:bg-amber-50'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {rider.status === 'approved' ? 'Suspend' : 'Reactivate'}
                    </button>
                  )}

                  {/* Inspect KYC Documents Button */}
                  <button
                    onClick={() => setInspectRiderDocs(rider)}
                    className="p-2 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-xl transition font-bold text-xs flex items-center gap-1"
                    title="Inspect Live Selfie, DL, RC & Aadhaar"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Selfie & Docs</span>
                  </button>

                  {/* Statement of Account Button */}
                  <button
                    onClick={() => {
                      setReportModalEntityType('delivery');
                      setReportModalEntityId(rider.id);
                      setIsStatementReportModalOpen(true);
                    }}
                    className="p-2 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-xl transition font-bold text-xs flex items-center gap-1"
                    title={`Download Daily/Weekly/Monthly Statement of Account for ${rider.name}`}
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Statement</span>
                  </button>

                  {/* Edit Rider Button */}
                  <button
                    onClick={() => setRiderModal({ isOpen: true, mode: 'edit', data: rider })}
                    className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition font-bold text-xs flex items-center gap-1"
                    title="Edit Partner"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                    <span>Edit</span>
                  </button>

                  {/* Delete Rider Button */}
                  <button
                    onClick={() =>
                      setDeleteModal({
                        isOpen: true,
                        title: 'Delete Delivery Partner',
                        message: `Are you sure you want to permanently remove delivery partner "${rider.name}"?`,
                        itemName: rider.name,
                        onConfirm: () => deleteDeliveryPartner(rider.id),
                      })
                    }
                    className="p-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl transition"
                    title="Delete Partner"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
            )}
          </div>
        </div>
      )}

      {/* 5. ZONE MANAGEMENT TAB */}
      {activeTab === 'zones' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
          {isFranchiseAdmin && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-xs text-amber-800">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Franchise Admin Mode:</strong> Delivery zones are in read-only view. The options to add new zones, edit boundaries, or delete zones are disabled and restricted to Super Admin.
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-heading font-black text-lg text-slate-900">
                Delivery Zones & Geographic Pricing
              </h3>
              <p className="text-xs text-slate-500">
                {isFranchiseAdmin
                  ? 'Active delivery boundaries, base fees & per-km charges (Read-Only for Franchise Admin)'
                  : 'Super Admin Add, Edit, Delete access for territory boundaries, base fees & per-km charges'}
              </p>
            </div>
            {!isFranchiseAdmin && (
              <button
                onClick={() => setZoneModal({ isOpen: true, mode: 'add' })}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/20 flex items-center gap-1.5 transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Zone</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {zones.length === 0 ? (
              <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-6 md:col-span-2">
                <MapPin className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="font-bold text-sm text-slate-700">No Delivery Zones Configured</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Create delivery zones with custom boundary radiuses and fees using the "Create New Zone" button.
                </p>
              </div>
            ) : (
              zones.map((zone) => (
              <div
                key={zone.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-purple-600" />
                    <h4 className="font-black text-sm text-slate-900">{zone.name}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        zone.isActive ? 'text-emerald-700 bg-emerald-100' : 'text-slate-600 bg-slate-200'
                      }`}
                    >
                      {zone.isActive ? 'Active Zone' : 'Disabled'}
                    </span>
                    {!isFranchiseAdmin && (
                      <>
                        <button
                          onClick={() => setZoneModal({ isOpen: true, mode: 'edit', data: zone })}
                          className="p-1.5 text-slate-600 hover:text-purple-600 hover:bg-white rounded-lg transition"
                          title="Edit Zone"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteModal({
                              isOpen: true,
                              title: 'Delete Delivery Zone',
                              message: `Are you sure you want to remove delivery zone "${zone.name}"?`,
                              itemName: zone.name,
                              onConfirm: () => deleteZone(zone.id),
                            })
                          }
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition"
                          title="Delete Zone"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-xs pt-1 border-t border-slate-200/60">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Base Fee</span>
                    <span className="font-black text-slate-800">₹{zone.baseDeliveryFee}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Per-Km Fee</span>
                    <span className="font-black text-slate-800">₹{zone.perKmFee}/km</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Min Order</span>
                    <span className="font-black text-slate-800">₹{zone.minOrderValue}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Radius</span>
                    <span className="font-black text-slate-800">{zone.radiusKm} km</span>
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
        </div>
      )}

      {/* 6. PAYMENT GATEWAYS CONFIGURATION & TRANSACTIONS TAB */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-6">
          {isFranchiseAdmin && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-xs text-amber-800">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Franchise Admin Mode:</strong> Payment Gateways and transaction records are in read-only view. The options to configure, edit, toggle, or delete payment gateways and transactions are disabled and restricted to Super Admin.
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-heading font-black text-lg text-slate-900">
                Payment Gateways & Live Transactions Management
              </h3>
              <p className="text-xs text-slate-500">
                {isFranchiseAdmin
                  ? 'Razorpay, Cashfree, PhonePe, COD Gateways & Live Payment Transactions (Read-Only for Franchise Admin)'
                  : 'Super Admin Add, Edit, Delete access for Razorpay, Cashfree, PhonePe, COD Gateways & Live Payment Transactions'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setPaymentSubTab('gateways')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                    paymentSubTab === 'gateways' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Gateway Configs ({paymentGateways.length})
                </button>
                <button
                  onClick={() => setPaymentSubTab('transactions')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                    paymentSubTab === 'transactions' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Live Transactions ({paymentTransactions.length})
                </button>
              </div>

              {paymentSubTab === 'gateways' && !isFranchiseAdmin && (
                <button
                  onClick={() => setGatewayModal({ isOpen: true, mode: 'add' })}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Configure Gateway</span>
                </button>
              )}
            </div>
          </div>

          {/* Sub-View 1: Gateway Credentials */}
          {paymentSubTab === 'gateways' && (
            <div className="space-y-4">
              {/* Dedicated Cash on Delivery (COD) Master Control Banner */}
              {(() => {
                const codGw = paymentGateways.find((g) => g.provider === 'cod');
                const isCodActive = codGw ? codGw.enabled : brandSettings.gateways?.cod?.enabled ?? true;

                return (
                  <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border-2 border-amber-300/80 shadow-xs space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-emerald-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                          <Banknote className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-heading font-black text-slate-900 text-base">
                              Cash on Delivery (COD) Option
                            </h4>
                            <span
                              className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider border ${
                                isCodActive
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : 'bg-slate-200 text-slate-600 border-slate-300'
                              }`}
                            >
                              {isCodActive ? 'Active & Enabled ✓' : 'Disabled / Paused'}
                            </span>
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                              Doorstep Cash & UPI QR
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 max-w-xl">
                            Customers can place orders with <strong>zero advance payment</strong> and settle dues upon delivery via cash handover or by scanning the delivery partner's dynamic UPI QR code.
                          </p>
                        </div>
                      </div>

                      {!isFranchiseAdmin && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (codGw) {
                                updatePaymentGateway(codGw.id, { enabled: !codGw.enabled });
                              } else {
                                addPaymentGateway({
                                  provider: 'cod',
                                  name: 'Cash on Delivery (COD)',
                                  appOrMerchantId: 'COD-DOORSTEP',
                                  apiKeyOrSecretMasked: '••••••••••••COD',
                                  testMode: false,
                                  enabled: true,
                                  supportedMethods: [
                                    'Cash Payment on Delivery',
                                    'Doorstep UPI QR Code Scan',
                                    'Zero Advance Payment',
                                  ],
                                });
                              }
                              updateBrandSettings({
                                gateways: {
                                  ...brandSettings.gateways,
                                  cod: {
                                    enabled: !isCodActive,
                                    maxOrderLimit: 3000,
                                  },
                                },
                              });
                            }}
                            className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs transition flex items-center gap-1.5 active:scale-95 ${
                              isCodActive
                                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            }`}
                          >
                            <span>{isCodActive ? 'Pause Cash on Delivery' : 'Enable Cash on Delivery'}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-amber-200/60 text-xs">
                      <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/70">
                        <span className="text-[10px] font-black uppercase text-amber-900 block">Maximum COD Limit</span>
                        <span className="font-extrabold text-slate-900 text-xs">₹3,000 per order</span>
                      </div>
                      <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/70">
                        <span className="text-[10px] font-black uppercase text-emerald-900 block">Rider Wallet Deductions</span>
                        <span className="font-extrabold text-slate-900 text-xs">Auto-settled against delivery fees</span>
                      </div>
                      <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/70">
                        <span className="text-[10px] font-black uppercase text-blue-900 block">Doorstep Verification</span>
                        <span className="font-extrabold text-slate-900 text-xs">Customer 4-digit Delivery OTP</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {paymentGateways.length === 0 ? (
                <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-6">
                  <CreditCard className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="font-bold text-sm text-slate-700">No Payment Gateways Configured</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Configure your payment gateway integration credentials using the "Configure Gateway" button above.
                  </p>
                </div>
              ) : (
                paymentGateways.map((gw) => {
                  const isCod = gw.provider === 'cod';

                  return (
                    <div
                      key={gw.id}
                      className={`p-5 rounded-2xl border space-y-3 transition ${
                        isCod
                          ? 'bg-amber-50/40 border-amber-300/80 shadow-2xs'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2.5 rounded-xl ${
                              isCod ? 'bg-amber-500 text-white' : 'bg-indigo-100 text-indigo-700'
                            }`}
                          >
                            {isCod ? <Banknote className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-slate-900">{gw.name}</h4>
                              <span
                                className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  gw.enabled
                                    ? isCod
                                      ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                      : 'bg-emerald-100 text-emerald-800'
                                    : 'bg-slate-200 text-slate-600'
                                }`}
                              >
                                {gw.enabled
                                  ? isCod
                                    ? 'Active (Doorstep COD)'
                                    : 'Live Gateway'
                                  : 'Disabled'}
                              </span>
                              {gw.testMode && !isCod && (
                                <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                  Sandbox Test Mode
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Provider:{' '}
                              <span className="font-semibold uppercase">{gw.provider}</span> •{' '}
                              {isCod ? 'Collection Channel:' : 'Merchant/Client ID:'}{' '}
                              <span className="font-mono text-slate-800">{gw.appOrMerchantId}</span>
                            </p>
                          </div>
                        </div>

                    {!isFranchiseAdmin && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updatePaymentGateway(gw.id, { enabled: !gw.enabled })}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            gw.enabled
                              ? 'border border-slate-300 text-slate-700 hover:bg-white'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {gw.enabled ? 'Disable' : 'Enable Gateway'}
                        </button>
                        <button
                          onClick={() => setGatewayModal({ isOpen: true, mode: 'edit', data: gw })}
                          className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition text-xs font-bold flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() =>
                            setDeleteModal({
                              isOpen: true,
                              title: 'Remove Payment Gateway',
                              message: `Are you sure you want to delete payment gateway configuration "${gw.name}"?`,
                              itemName: gw.name,
                              onConfirm: () => deletePaymentGateway(gw.id),
                            })
                          }
                          className="p-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-200/60">
                    <div>
                      <span className="text-slate-400 text-[10px] block">API Secret Status</span>
                      <span className="font-mono font-bold text-slate-700">{gw.apiKeyOrSecretMasked}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Webhook Secret</span>
                      <span className="font-mono text-slate-600">{gw.webhookSecret || 'Default Encrypted'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Supported Methods</span>
                      <span className="font-medium text-slate-800">{gw.supportedMethods.join(', ')}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
            </div>
          )}

          {/* Sub-View 2: Live Payment Gateways Transactions */}
          {paymentSubTab === 'transactions' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-600">
                  Total Gateway Transactions: <span className="font-black text-slate-900">{paymentTransactions.length}</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  Processed via Razorpay, Cashfree, PhonePe & COD
                </span>
              </div>

              {paymentTransactions.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 rounded-2xl border border-slate-200">
                  <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No payment transactions found</p>
                  <p className="text-[11px] text-slate-400">Transactions processed by customers will appear here in real-time.</p>
                </div>
              ) : (
                paymentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {tx.gatewayTransactionId}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="font-bold text-xs text-slate-800">Order #{tx.orderId}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-xs text-slate-600">{tx.customerName}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Gateway: <span className="font-bold uppercase text-slate-700">{tx.gatewayProvider}</span> • Method: <span className="font-medium text-slate-600">{tx.paymentMethodDetails}</span> • Date: {tx.createdAt}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900 block">₹{tx.amount}</span>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            tx.status === 'success'
                              ? 'bg-emerald-100 text-emerald-800'
                              : tx.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </div>

                      {!isFranchiseAdmin && (
                        <button
                          onClick={() =>
                            setDeleteModal({
                              isOpen: true,
                              title: 'Delete Gateway Transaction',
                              message: `Are you sure you want to delete payment transaction record "${tx.gatewayTransactionId}" (₹${tx.amount})?`,
                              itemName: tx.gatewayTransactionId,
                              onConfirm: () => deletePaymentTransaction(tx.id),
                            })
                          }
                          className="p-2 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl transition"
                          title="Delete Transaction"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* 7. COUPONS & MARKETING BANNERS TAB */}
      {activeTab === 'coupons' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-6">
          {isFranchiseAdmin && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-xs text-amber-800">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Franchise Admin Mode:</strong> Coupons and Hero Banners are in read-only view. The options to create, edit, toggle, or delete promo discount codes and banners are disabled and restricted to Super Admin.
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-heading font-black text-lg text-slate-900">
                Coupons & Hero Banners Management
              </h3>
              <p className="text-xs text-slate-500">
                {isFranchiseAdmin
                  ? 'Promo discounts, marketing codes, and visual banners (Read-Only for Franchise Admin)'
                  : 'Super Admin Add, Edit, Delete access for promo discounts, marketing codes, and visual banners'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setPromoSubTab('coupons')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                    promoSubTab === 'coupons' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Promo Coupons ({coupons.length})
                </button>
                <button
                  onClick={() => setPromoSubTab('banners')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                    promoSubTab === 'banners' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Hero Banners ({banners.length})
                </button>
              </div>

              {!isFranchiseAdmin && (
                promoSubTab === 'coupons' ? (
                  <button
                    onClick={() => setCouponModal({ isOpen: true, mode: 'add' })}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Coupon</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setBannerModal({ isOpen: true, mode: 'add' })}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Banner</span>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Sub-View: Coupons */}
          {promoSubTab === 'coupons' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {coupons.map((cpn) => (
                <div
                  key={cpn.id}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-base text-orange-600 bg-white px-2 py-0.5 rounded border border-orange-200">
                        {cpn.code}
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        {cpn.discountPercent}% OFF (Max ₹{cpn.maxDiscount})
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{cpn.description}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Min Order: ₹{cpn.minOrderValue} • Expires: {cpn.validUntil || '2026-12-31'}
                    </p>
                  </div>

                  {!isFranchiseAdmin && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleCoupon(cpn.id)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition ${
                          cpn.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {cpn.isActive ? 'Active' : 'Disabled'}
                      </button>
                      <button
                        onClick={() => setCouponModal({ isOpen: true, mode: 'edit', data: cpn })}
                        className="p-1.5 text-slate-600 hover:text-orange-600 hover:bg-white rounded-lg transition"
                        title="Edit Coupon"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteModal({
                            isOpen: true,
                            title: 'Delete Coupon Code',
                            message: `Are you sure you want to permanently delete coupon "${cpn.code}"?`,
                            itemName: cpn.code,
                            onConfirm: () => deleteCoupon(cpn.id),
                          })
                        }
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Sub-View: Banners */}
          {promoSubTab === 'banners' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {banners.map((ban) => (
                <div
                  key={ban.id}
                  className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
                >
                  <div className={`p-5 bg-gradient-to-r ${ban.bgColor} text-white flex items-center justify-between gap-4`}>
                    <div className="space-y-1">
                      <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase">
                        {ban.code || 'PROMO'}
                      </span>
                      <h4 className="font-black text-base leading-tight">{ban.title}</h4>
                      <p className="text-xs text-white/80 line-clamp-2">{ban.subtitle}</p>
                    </div>
                    {ban.imageUrl && (
                      <img
                        src={ban.imageUrl}
                        alt={ban.title}
                        className="w-16 h-16 rounded-xl object-cover ring-2 ring-white/30 shrink-0"
                      />
                    )}
                  </div>
                  <div className="p-3 bg-white flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-500">CTA: {ban.linkText || 'Claim Offer'}</span>
                    {!isFranchiseAdmin && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setBannerModal({ isOpen: true, mode: 'edit', data: ban })}
                          className="p-1.5 text-slate-600 hover:text-orange-600 hover:bg-slate-100 rounded-lg transition flex items-center gap-1 font-bold"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() =>
                            setDeleteModal({
                              isOpen: true,
                              title: 'Delete Hero Banner',
                              message: `Are you sure you want to remove promotional banner "${ban.title}"?`,
                              itemName: ban.title,
                              onConfirm: () => deleteBanner(ban.id),
                            })
                          }
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 8. FRANCHISE MANAGEMENT TAB */}
      {activeTab === 'franchises' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-6">
          {isFranchiseAdmin && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-xs text-amber-800">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Franchise Admin Mode:</strong> Franchise network is in read-only view. The options to enrol new franchises, edit agreements, delete franchisees, or change administrator login credentials are disabled and restricted exclusively to Super Admin.
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-heading font-black text-lg text-slate-900">
                Franchise Network & Regional Hub Management
              </h3>
              <p className="text-xs text-slate-500">
                {isFranchiseAdmin
                  ? 'Master Franchises, Cloud Kitchen clusters & Royalty shares (Read-Only for Franchise Admin)'
                  : 'Super Admin Add, Edit, Delete access for Master Franchises, Cloud Kitchen clusters & Royalty shares'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!isFranchiseAdmin && (
                <>
                  <button
                    onClick={() => handleExportCSV('franchises')}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={() => setFranchiseModal({ isOpen: true, mode: 'add' })}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-600/20 flex items-center gap-1.5 transition active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Enrol Franchise</span>
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80">
              <span className="text-[10px] uppercase font-bold text-amber-800">Total Committed Investment</span>
              <p className="text-xl font-black text-amber-950 mt-1">₹{(totalFranchiseInvestment / 100000).toFixed(1)} Lakhs</p>
              <span className="text-[11px] text-amber-700 font-medium">Across active territories</span>
            </div>
            <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200/80">
              <span className="text-[10px] uppercase font-bold text-purple-800">Franchise Cloud Outlets</span>
              <p className="text-xl font-black text-purple-950 mt-1">{totalFranchiseOutlets} Kitchens</p>
              <span className="text-[11px] text-purple-700 font-medium">Operating under LIKART FOOD</span>
            </div>
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80">
              <span className="text-[10px] uppercase font-bold text-emerald-800">Avg Royalty Revenue Share</span>
              <p className="text-xl font-black text-emerald-950 mt-1">
                {(franchises.reduce((acc, f) => acc + f.revenueSharePercent, 0) / (franchises.length || 1)).toFixed(1)}%
              </p>
              <span className="text-[11px] text-emerald-700 font-medium">Monthly franchise remittance</span>
            </div>
          </div>

          {/* Franchise Status Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setFranchiseFilterStatus('all')}
                className={`px-3 py-1.5 rounded-xl transition ${
                  franchiseFilterStatus === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Franchises ({franchises.length})
              </button>
              <button
                type="button"
                onClick={() => setFranchiseFilterStatus('active')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  franchiseFilterStatus === 'active'
                    ? 'bg-emerald-600 text-white shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-300" />
                <span>Active ({franchises.filter((f) => f.status === 'active').length})</span>
              </button>
              <button
                type="button"
                onClick={() => setFranchiseFilterStatus('suspended')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  franchiseFilterStatus === 'suspended'
                    ? 'bg-rose-600 text-white shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-300" />
                <span>Deactivated ({franchises.filter((f) => f.status !== 'active').length})</span>
              </button>
            </div>

            <div className="text-[11px] font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200/80 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Likart Food Super Admin: Activate / Deactivate Franchise Access</span>
            </div>
          </div>

          <div className="space-y-4">
            {franchises.length === 0 ? (
              <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-6">
                <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="font-bold text-sm text-slate-700">No Franchises Enrolled</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Enrol regional franchise partners and assign territory clusters using the "Enrol Franchise" button above.
                </p>
              </div>
            ) : (
              franchises
                .filter((fr) => {
                  if (franchiseFilterStatus === 'active') return fr.status === 'active';
                  if (franchiseFilterStatus === 'suspended') return fr.status !== 'active';
                  return true;
                })
                .map((fr) => {
                  const isSuspended = fr.status !== 'active';

                  return (
                    <div
                      key={fr.id}
                      className={`p-5 rounded-2xl border space-y-3 transition ${
                        isSuspended
                          ? 'bg-rose-50/25 border-rose-200/90 shadow-2xs'
                          : 'bg-slate-50 rounded-2xl border-slate-200'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-3 rounded-2xl ${
                              isSuspended ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-bold text-sm text-slate-900">{fr.franchiseName}</h4>
                              <span className="bg-amber-100 text-amber-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                                {fr.tier}
                              </span>
                              {fr.status === 'active' ? (
                                <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                                  <span>Active Franchise</span>
                                </span>
                              ) : (
                                <span className="bg-rose-100 text-rose-800 border border-rose-300 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                                  <span>Deactivated by Super Admin</span>
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5">
                              Principal: <span className="font-bold text-slate-800">{fr.ownerName}</span> • Phone: {fr.phone} • Email: {fr.email}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                              Territory: <span className="font-bold text-slate-800">{fr.territory}</span> • Contract: {fr.contractStart} to {fr.contractEnd}
                            </p>
                            {fr.coordinates && (
                              <p className="text-[11px] text-amber-700 font-mono mt-0.5 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-amber-600 inline" />
                                <span>Google Map Hub: {fr.coordinates.lat}, {fr.coordinates.lng} ({fr.hubAddress || fr.territory})</span>
                              </p>
                            )}
                            {fr.zoneIds && fr.zoneIds.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1 mt-1">
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Covered Zones:</span>
                                {fr.zoneIds.map((zid) => {
                                  const z = zones.find((item) => item.id === zid);
                                  return (
                                    <span key={zid} className="bg-purple-50 text-purple-700 text-[10px] font-bold px-2 py-0.2 rounded border border-purple-200">
                                      {z?.name || zid}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>

                        {!isFranchiseAdmin && (
                          <div className="flex items-center gap-1.5">
                            {/* Super Admin Activate / Deactivate Toggle Button */}
                            {fr.status === 'active' ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setFranchiseDeactivateModal({
                                    isOpen: true,
                                    franchise: fr,
                                    reason: '',
                                  })
                                }
                                className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 border border-rose-300 hover:border-rose-400 rounded-xl transition text-xs font-black flex items-center gap-1.5 shadow-2xs active:scale-95"
                                title="Deactivate Franchise Agreement"
                              >
                                <Power className="w-3.5 h-3.5 text-rose-600" />
                                <span>Deactivate</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => toggleFranchiseStatus(fr.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition text-xs font-black flex items-center gap-1.5 shadow-xs active:scale-95"
                                title="Activate Franchise Agreement"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Activate</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setFranchiseModal({ isOpen: true, mode: 'edit', data: fr })}
                              className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition text-xs font-bold flex items-center gap-1"
                              title="Edit Franchise Details"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteModal({
                                  isOpen: true,
                                  title: 'Delete Franchise Agreement',
                                  message: `Are you sure you want to permanently delete franchise "${fr.franchiseName}"?`,
                                  itemName: fr.franchiseName,
                                  onConfirm: () => deleteFranchise(fr.id),
                                })
                              }
                              className="p-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl transition"
                              title="Delete Agreement"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Deactivation Notice Strip if deactivated */}
                      {isSuspended && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-black block">Franchise Status: Deactivated</span>
                            <span className="text-[11px] text-rose-700">
                              {fr.deactivationReason
                                ? `Reason: ${fr.deactivationReason}`
                                : 'Deactivated by Likart Food Super Admin. Franchise operations and outlet orders are suspended.'}
                              {fr.deactivatedAt && ` (Date: ${fr.deactivatedAt})`}
                            </span>
                          </div>
                        </div>
                      )}

                {/* Franchise Admin Login Credentials Strip (Super Admin Access) */}
                <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50/60 rounded-xl border border-amber-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-600 text-white rounded-lg shadow-xs shrink-0">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-slate-800">Franchise Admin Login:</span>
                        <span className="font-mono font-bold text-amber-900 bg-white px-2 py-0.5 rounded-md border border-amber-200">
                          {fr.adminUserId || fr.email}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-500 font-medium">Password:</span>
                        <span className="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          {fr.adminPassword ? '••••••••' : 'Not Set'}
                        </span>
                        {fr.lastPasswordChange && (
                          <span className="text-[10px] text-slate-400">
                            (Updated: {fr.lastPasswordChange})
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Super Admin can change ID/password anytime. Franchise admins use this to sign into the system.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `LIKART Franchise Admin Login Credentials:\nPortal: ${window.location.origin}\nUser ID: ${fr.adminUserId || fr.email}\nPassword: ${fr.adminPassword || 'Franchise@2026'}`
                        );
                        addNotification('Credentials Copied', `Login ID & password for ${fr.franchiseName} copied.`, 'system');
                      }}
                      className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-2xs"
                      title="Copy Login Credentials"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy</span>
                    </button>

                    {!isFranchiseAdmin && (
                      <button
                        type="button"
                        onClick={() =>
                          setFranchiseCredentialsModal({
                            isOpen: true,
                            franchise: fr,
                            userId: fr.adminUserId || `fr_${fr.ownerName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
                            password: fr.adminPassword || 'Franchise@2026',
                            showPass: false,
                          })
                        }
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1.5 active:scale-95"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Change ID / Password</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-2 border-t border-slate-200/60">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Royalty Share</span>
                    <span className="font-black text-amber-700 text-sm">{fr.revenueSharePercent}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Investment Capital</span>
                    <span className="font-black text-slate-800">₹{(fr.investmentAmount / 100000).toFixed(1)} Lakhs</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Active Kitchens</span>
                    <span className="font-black text-slate-800">{fr.activeOutletsCount} Outlets</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Notes</span>
                    <span className="font-medium text-slate-600 line-clamp-1">{fr.notes || 'No specific stipulations'}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
          </div>
        </div>
      )}

      {/* 9. GOOGLE MAPS & API KEYS TAB */}
      {activeTab === 'maps' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-6">
          {isFranchiseAdmin && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-xs text-amber-800">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Franchise Admin Mode:</strong> Google Maps platform configurations and API keys are in read-only view. Registering new keys, editing tokens, or deleting API credentials is restricted to Super Admin.
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-heading font-black text-lg text-slate-900">
                Google Maps Platform & API Key Credentials
              </h3>
              <p className="text-xs text-slate-500">
                {isFranchiseAdmin
                  ? 'Google Maps API keys, Places auto-complete & navigation quota (Read-Only for Franchise Admin)'
                  : 'Super Admin Add, Edit, Delete access for Google Maps API keys, Places auto-complete & navigation quota'}
              </p>
            </div>
            {!isFranchiseAdmin && (
              <button
                onClick={() => setMapsKeyModal({ isOpen: true, mode: 'add' })}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Register New API Key</span>
              </button>
            )}
          </div>

          {/* Global Maps Setting Card */}
          <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-xl">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">System Google Maps Engine Status</h4>
                  <p className="text-xs text-slate-400">
                    Primary Key: <span className="font-mono text-emerald-400 font-bold">{brandSettings.googleMapsApiKey.substring(0, 10)}••••••••</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 font-bold bg-emerald-950/80 text-emerald-400 px-3.5 py-2 rounded-xl border border-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Real Google Maps Platform Active in All Portals</span>
                </span>
              </div>
            </div>

            {/* Live Interactive Map Preview for Super Admin */}
            <div className="mt-3 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-bold flex items-center gap-1.5 text-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Super Admin Live Google Map Inspection (Bengaluru Operational Hub)</span>
                </span>
                <span className="text-[11px] font-mono text-emerald-400">@vis.gl/react-google-maps</span>
              </div>
              <LiveMap
                centerLat={12.9352}
                centerLng={77.6245}
                height="220px"
                interactive={true}
                radiusKm={7.5}
                restaurantCoords={{ lat: 12.9348, lng: 77.625, name: 'Central Cloud Kitchen' }}
                riderCoords={{ lat: 12.936, lng: 77.622, name: 'Active Fleet Rider' }}
              />
            </div>
          </div>

          {/* Registered API Keys List */}
          <div className="space-y-4">
            {googleMapsKeys.map((key) => (
              <div
                key={key.id}
                className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900">{key.label}</span>
                      {key.isPrimary && (
                        <span className="bg-purple-100 text-purple-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-purple-200">
                          Primary Key
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          key.status === 'healthy' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {key.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-slate-600 mt-1">
                      API Token: <span className="font-bold text-slate-800">{key.apiKey.substring(0, 12)}••••••••••••••••</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Last Verified: {key.lastTestedAt || 'Active & Ready'} • Daily Quota: {key.currentRequestsToday} / {key.dailyQuotaLimit} reqs
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => testGoogleMapsKey(key.id)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                    >
                      Test Connection
                    </button>
                    {!isFranchiseAdmin && (
                      <>
                        <button
                          onClick={() => setMapsKeyModal({ isOpen: true, mode: 'edit', data: key })}
                          className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition text-xs font-bold flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() =>
                            setDeleteModal({
                              isOpen: true,
                              title: 'Delete Google Maps Key',
                              message: `Are you sure you want to delete API key "${key.label}"?`,
                              itemName: key.label,
                              onConfirm: () => deleteGoogleMapsKey(key.id),
                            })
                          }
                          className="p-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                    Enabled Google Maps Services:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {key.enabledServices.map((srv) => (
                      <span
                        key={srv}
                        className="bg-white border border-slate-200 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-md"
                      >
                        ✓ {srv}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10. PAYOUTS MANAGEMENT TAB */}
      {activeTab === 'payouts' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-black text-lg text-slate-900">
                Partner Settlements & Payout Approvals
              </h3>
              <p className="text-xs text-slate-500">
                Approve restaurant and delivery partner wallet payout requests with bank transfer IDs
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setReportModalEntityType('restaurant');
                  setReportModalEntityId('all');
                  setIsStatementReportModalOpen(true);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-2xs active:scale-95"
                title="Download Daily, Weekly, Monthly Statement of Account & Payout Reports (Excel / PDF)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Statement of Account (Excel/PDF)</span>
              </button>

              <button
                onClick={() => handleExportCSV('payouts')}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {payoutRequests.length === 0 ? (
              <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-6">
                <DollarSign className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="font-bold text-sm text-slate-700">No Payout Requests</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Partner settlements and vendor withdrawal requests will appear here for review and bank transfer settlement.
                </p>
              </div>
            ) : (
              payoutRequests.map((p) => (
              <div
                key={p.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-black text-slate-900">#{p.id}</span>
                    <span className="font-bold text-slate-800">{p.recipientName}</span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        p.recipientType === 'restaurant'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {p.recipientType === 'restaurant' ? 'Restaurant Outlet' : 'Delivery Rider'}
                    </span>
                    {p.requestedAt && (
                      <span className="text-[10px] text-slate-400">• {p.requestedAt}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Account/UPI: <span className="font-mono font-semibold">{p.bankOrUpiDetails}</span>
                  </p>
                  {p.referenceId && (
                    <p className="text-[11px] text-emerald-700 font-mono mt-0.5">
                      Bank Ref ID: {p.referenceId}
                    </p>
                  )}
                  {p.rejectionReason && (
                    <p className="text-[11px] text-rose-600 font-medium mt-0.5">
                      Reason: {p.rejectionReason}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-base font-black text-slate-900 mr-1">₹{p.amount.toLocaleString('en-IN')}</span>
                  {p.status === 'pending' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          settlePayout(p.id, `NEFT-${Math.floor(100000 + Math.random() * 900000)}`)
                        }
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition"
                      >
                        Approve & Settle
                      </button>
                      <button
                        onClick={() => {
                          setAdminRejectionReason('Bank account details mismatch or verification required');
                          setRejectPayoutModal({
                            isOpen: true,
                            payoutId: p.id,
                            amount: p.amount,
                            recipientName: p.recipientName,
                          });
                        }}
                        className="px-3 py-2 bg-white hover:bg-rose-50 text-rose-600 font-bold text-xs border border-rose-200 rounded-xl transition"
                      >
                        Reject
                      </button>
                    </div>
                  ) : p.status === 'settled' ? (
                    <span className="text-xs font-black uppercase text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      Settled ✓
                    </span>
                  ) : (
                    <span className="text-xs font-black uppercase text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                      Rejected ✕
                    </span>
                  )}
                  <button
                    onClick={() =>
                      setDeleteModal({
                        isOpen: true,
                        title: 'Delete Payout Transaction',
                        message: `Are you sure you want to permanently delete payout settlement #${p.id} (₹${p.amount}) for ${p.recipientName}?`,
                        itemName: `Payout #${p.id}`,
                        onConfirm: () => deletePayout(p.id),
                      })
                    }
                    className="p-2 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl transition"
                    title="Delete Payout"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
            )}
          </div>
        </div>
      )}

      {/* 11. SUPPORT TICKETS TAB */}
      {activeTab === 'support' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
          <h3 className="font-heading font-black text-lg text-slate-900">
            Customer & Vendor Support Tickets
          </h3>
          <div className="space-y-3">
            {supportTickets.length === 0 ? (
              <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-6">
                <HelpCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="font-bold text-sm text-slate-700">No Support Tickets</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Customer queries, order concerns, and partner requests submitted via the Help desk will appear here.
                </p>
              </div>
            ) : (
              supportTickets.map((tck) => (
              <div
                key={tck.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono font-black text-slate-900">#{tck.id}</span>
                    <span className="text-slate-400 ml-2">from {tck.userName} ({tck.userType})</span>
                    <h4 className="font-bold text-xs text-slate-900 mt-0.5">{tck.subject}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        tck.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {tck.status.toUpperCase()}
                    </span>
                    <button
                      onClick={() =>
                        setDeleteModal({
                          isOpen: true,
                          title: 'Delete Support Ticket',
                          message: `Are you sure you want to permanently delete support ticket #${tck.id} from ${tck.userName}?`,
                          itemName: `Ticket #${tck.id}`,
                          onConfirm: () => deleteSupportTicket(tck.id),
                        })
                      }
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Ticket"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-600">{tck.message}</p>

                {tck.reply ? (
                  <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-900">
                    <span className="font-bold">Sent Reply: </span>
                    {tck.reply}
                  </div>
                ) : (
                  <div className="pt-2 flex gap-2">
                    <input
                      type="text"
                      placeholder="Type official support resolution..."
                      value={replyTicketId === tck.id ? replyMessage : ''}
                      onChange={(e) => {
                        setReplyTicketId(tck.id);
                        setReplyMessage(e.target.value);
                      }}
                      className="flex-1 text-xs p-2 bg-white border border-slate-300 rounded-xl"
                    />
                    <button
                      onClick={() => handleSendTicketReply(tck.id)}
                      className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs"
                    >
                      Resolve & Reply
                    </button>
                  </div>
                )}
              </div>
            ))
            )}
          </div>
        </div>
      )}

      {/* 12. RBAC ADMIN ROLES TAB */}
      {activeTab === 'rbac' && (
        isFranchiseAdmin ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4">
            <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-heading font-black text-lg text-slate-900">
                Admin Roles & RBAC Management Restricted
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Franchise Administrators do not have permission to create, edit, or delete platform administrator roles. This section is restricted exclusively to Super Administrators.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-heading font-black text-lg text-slate-900">
                  Role-Based Access Control (RBAC) Management
                </h3>
                <p className="text-xs text-slate-500">
                  Super Admin Add, Edit, Delete access for administrative credentials and permission controls
                </p>
              </div>
              {!isFranchiseAdmin && (
                <button
                  onClick={() => setAdminUserModal({ isOpen: true, mode: 'add' })}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/20 flex items-center gap-1.5 transition active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Admin</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {adminUsers.map((u) => (
                <div
                  key={u.id}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{u.name}</span>
                      <span className="bg-purple-100 text-purple-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                        {u.role.replace(/_/g, ' ')}
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {u.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{u.email}</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Permissions: <span className="font-mono text-slate-600">{u.permissions.join(', ')}</span>
                    </p>
                  </div>

                  {!isFranchiseAdmin && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setAdminUserModal({ isOpen: true, mode: 'edit', data: u })}
                        className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition text-xs font-bold flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                        <span>Edit Role</span>
                      </button>
                      {u.role !== 'super_admin' && (
                        <button
                          onClick={() =>
                            setDeleteModal({
                              isOpen: true,
                              title: 'Delete Admin User',
                              message: `Are you sure you want to revoke and delete administrator user "${u.name}"?`,
                              itemName: u.name,
                              onConfirm: () => deleteAdminUser(u.id),
                            })
                          }
                          className="p-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl transition"
                          title="Delete Admin"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {/* 12B. ORDER ALERT SOUNDS & AUDIO TUNE UPLOAD (SUPER ADMIN ACCESS) */}
      {activeTab === 'sounds' && (
        <div className="space-y-6">
          {/* Header & Access Permission Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4 border border-indigo-500/20">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/30">
                    <Volume2 className="w-5 h-5" />
                  </span>
                  <h3 className="font-heading font-black text-xl sm:text-2xl text-white">
                    Order Alert Sound System & Audio Tune Upload
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                    Super Admin Exclusive
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                  Upload custom audio tunes (.mp3, .wav, .ogg, .m4a) for Restaurant Orders Alerts and Delivery Partner Trip Alerts. All alerts are configured to <strong>ring continuously until accepted</strong> by the kitchen or delivery rider.
                </p>
              </div>

              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={handleSaveSoundSettings}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-900/30 transition flex items-center gap-2 active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Audio Alert Changes</span>
                </button>
              )}
            </div>

            {/* Non-Super-Admin Warning */}
            {!isSuperAdmin && (
              <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-2xl text-xs text-amber-200 flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>View-Only Preview:</strong> You are currently signed in as an operations administrator. Only the Super Administrator can upload audio tunes and modify platform dispatch audio alerts.
                </span>
              </div>
            )}

            {/* Error Banner */}
            {audioUploadError && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-xs text-rose-200 flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{audioUploadError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAudioUploadError(null)}
                  className="text-white/70 hover:text-white text-xs font-bold"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Master Toggle and Active Presets Bar */}
            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!isSuperAdmin}
                  checked={soundConfig.enabled}
                  onChange={(e) => setSoundConfig((prev) => ({ ...prev, enabled: e.target.checked }))}
                  className="w-5 h-5 text-indigo-600 rounded-lg focus:ring-indigo-500 cursor-pointer"
                />
                <span className="font-bold text-white">
                  Platform Master Sound Alerts Switch: {soundConfig.enabled ? 'ACTIVE (ON)' : 'MUTED (OFF)'}
                </span>
              </label>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Alerts Ring Until Accepted</span>
                </span>
              </div>
            </div>
          </div>

          {/* Two-Column Grid: Restaurant Sounds & Rider Sounds */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* 1. RESTAURANT ORDERS ALERT - AUDIO TUNE UPLOAD */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-orange-100 text-orange-700 rounded-2xl">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                      <span>Restaurant Orders Alert</span>
                      {soundConfig.restaurantAudioUrl && (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                          Custom Tune
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Rings continuously when customer orders arrive until kitchen accepts
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    disabled={!isSuperAdmin}
                    checked={soundConfig.restaurantSoundEnabled}
                    onChange={(e) =>
                      setSoundConfig((prev) => ({
                        ...prev,
                        restaurantSoundEnabled: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-orange-600 rounded"
                  />
                  <span>{soundConfig.restaurantSoundEnabled ? 'Enabled' : 'Muted'}</span>
                </label>
              </div>

              {/* Ringing Policy Notice */}
              <div className="p-3.5 bg-orange-50/70 border border-orange-200/80 rounded-2xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-orange-950">
                  <Bell className="w-3.5 h-3.5 text-orange-600" />
                  <span>Ringing Policy: Rings Until Accepted</span>
                </div>
                <p className="text-[11px] text-orange-800 leading-relaxed">
                  Incoming orders play continuously in kitchen terminals without stopping until restaurant staff clicks <strong>"Accept Order"</strong> or rejects.
                </p>
              </div>

              {/* Volume Slider */}
              <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Kitchen Terminal Alert Volume</span>
                  <span className="font-mono text-orange-600">{Math.round(soundConfig.restaurantVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  disabled={!isSuperAdmin}
                  value={soundConfig.restaurantVolume}
                  onChange={(e) =>
                    setSoundConfig((prev) => ({
                      ...prev,
                      restaurantVolume: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full accent-orange-600 cursor-pointer"
                />
              </div>

              {/* Audio Tune Upload & Active Tune Box */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                    Restaurant Audio Tune
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    MP3, WAV, OGG, M4A, AAC (Max 8MB)
                  </span>
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  id="restaurant-audio-upload-input"
                  accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleRestaurantAudioUpload(file);
                      e.target.value = '';
                    }
                  }}
                />

                {soundConfig.restaurantAudioUrl ? (
                  /* Uploaded Custom Audio Card */
                  <div className="p-4 rounded-2xl border-2 border-orange-400/80 bg-orange-50/50 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
                          <Volume2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 truncate max-w-[220px]">
                            {soundConfig.restaurantAudioFileName || 'Custom Kitchen Alert Tune'}
                          </p>
                          <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{soundConfig.restaurantAudioSizeKb ? `${soundConfig.restaurantAudioSizeKb} KB` : 'Audio File'}</span>
                            {soundConfig.restaurantAudioDurationSecs ? (
                              <>
                                <span>•</span>
                                <span>{soundConfig.restaurantAudioDurationSecs}s duration</span>
                              </>
                            ) : null}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                        Active Tune ✓
                      </span>
                    </div>

                    {/* Preview & Simulation Controls */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-orange-200/60">
                      <button
                        type="button"
                        onClick={handleToggleRestaurantPreview}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
                          isPlayingRestaurantPreview
                            ? 'bg-orange-600 text-white'
                            : 'bg-white hover:bg-orange-100 text-slate-800 border border-orange-200'
                        }`}
                        title="Play brief preview of uploaded tune"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isPlayingRestaurantPreview ? 'Playing Preview...' : 'Test Play Preview'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleToggleRestaurantRingingSimulation}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
                          isSimulatingRestaurantRing
                            ? 'bg-rose-600 text-white animate-pulse'
                            : 'bg-orange-600 hover:bg-orange-500 text-white'
                        }`}
                        title="Simulate continuous ringing until accepted"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span>{isSimulatingRestaurantRing ? 'Stop Ringing Loop' : 'Simulate Ring Until Accept'}</span>
                      </button>

                      {isSuperAdmin && (
                        <>
                          <button
                            type="button"
                            onClick={() => document.getElementById('restaurant-audio-upload-input')?.click()}
                            disabled={isUploadingRestaurantAudio}
                            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition flex items-center gap-1"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Replace Audio</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleRemoveRestaurantAudio}
                            className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 transition"
                            title="Reset to default synthesized kitchen chime"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Audio Tune Upload Box (No custom file yet) */
                  <div className="p-5 rounded-2xl border-2 border-dashed border-slate-300 hover:border-orange-400 bg-slate-50/60 hover:bg-orange-50/30 transition text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto shadow-2xs">
                      <Upload className="w-6 h-6" />
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800">
                        {isUploadingRestaurantAudio ? 'Uploading and processing audio...' : 'Upload Custom Kitchen Order Alert Tune'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Supports MP3, WAV, AAC, OGG, M4A up to 8MB. Will loop continuously on new orders.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      {isSuperAdmin && (
                        <button
                          type="button"
                          onClick={() => document.getElementById('restaurant-audio-upload-input')?.click()}
                          disabled={isUploadingRestaurantAudio}
                          className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 active:scale-95"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{isUploadingRestaurantAudio ? 'Uploading...' : 'Browse & Upload Audio File'}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleToggleRestaurantPreview}
                        className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-current text-orange-600" />
                        <span>{isPlayingRestaurantPreview ? 'Playing...' : 'Test Default Bell'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleToggleRestaurantRingingSimulation}
                        className={`px-3.5 py-2 font-bold text-xs rounded-xl transition flex items-center gap-1.5 ${
                          isSimulatingRestaurantRing
                            ? 'bg-rose-600 text-white animate-pulse'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <Radio className="w-3.5 h-3.5 text-rose-500" />
                        <span>{isSimulatingRestaurantRing ? 'Stop Ringing' : 'Simulate Ring Loop'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. DELIVERY PARTNER TRIP ALERT - AUDIO TUNE UPLOAD */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-blue-100 text-blue-700 rounded-2xl">
                    <Bike className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                      <span>Delivery Partner Trip Alert</span>
                      {soundConfig.riderAudioUrl && (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          Custom Tune
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Rings continuously when trip offer matches rider location until rider accepts
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    disabled={!isSuperAdmin}
                    checked={soundConfig.riderSoundEnabled}
                    onChange={(e) =>
                      setSoundConfig((prev) => ({
                        ...prev,
                        riderSoundEnabled: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>{soundConfig.riderSoundEnabled ? 'Enabled' : 'Muted'}</span>
                </label>
              </div>

              {/* Ringing Policy Notice */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-blue-950">
                  <Bell className="w-3.5 h-3.5 text-blue-600" />
                  <span>Ringing Policy: Rings Until Accepted</span>
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Incoming delivery trips ring continuously in rider handset and incoming trip modal until rider taps <strong>"Accept Trip"</strong> or rejects.
                </p>
              </div>

              {/* Volume Slider */}
              <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Rider Handset Alert Volume</span>
                  <span className="font-mono text-blue-600">{Math.round(soundConfig.riderVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  disabled={!isSuperAdmin}
                  value={soundConfig.riderVolume}
                  onChange={(e) =>
                    setSoundConfig((prev) => ({
                      ...prev,
                      riderVolume: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Audio Tune Upload & Active Tune Box */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                    Delivery Partner Audio Tune
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    MP3, WAV, OGG, M4A, AAC (Max 8MB)
                  </span>
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  id="rider-audio-upload-input"
                  accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleRiderAudioUpload(file);
                      e.target.value = '';
                    }
                  }}
                />

                {soundConfig.riderAudioUrl ? (
                  /* Uploaded Custom Audio Card */
                  <div className="p-4 rounded-2xl border-2 border-blue-400/80 bg-blue-50/50 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                          <Volume2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 truncate max-w-[220px]">
                            {soundConfig.riderAudioFileName || 'Custom Rider Trip Alert Tune'}
                          </p>
                          <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{soundConfig.riderAudioSizeKb ? `${soundConfig.riderAudioSizeKb} KB` : 'Audio File'}</span>
                            {soundConfig.riderAudioDurationSecs ? (
                              <>
                                <span>•</span>
                                <span>{soundConfig.riderAudioDurationSecs}s duration</span>
                              </>
                            ) : null}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                        Active Tune ✓
                      </span>
                    </div>

                    {/* Preview & Simulation Controls */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-blue-200/60">
                      <button
                        type="button"
                        onClick={handleToggleRiderPreview}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
                          isPlayingRiderPreview
                            ? 'bg-blue-600 text-white'
                            : 'bg-white hover:bg-blue-100 text-slate-800 border border-blue-200'
                        }`}
                        title="Play brief preview of uploaded tune"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isPlayingRiderPreview ? 'Playing Preview...' : 'Test Play Preview'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleToggleRiderRingingSimulation}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
                          isSimulatingRiderRing
                            ? 'bg-rose-600 text-white animate-pulse'
                            : 'bg-blue-600 hover:bg-blue-500 text-white'
                        }`}
                        title="Simulate continuous ringing until accepted"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span>{isSimulatingRiderRing ? 'Stop Ringing Loop' : 'Simulate Ring Until Accept'}</span>
                      </button>

                      {isSuperAdmin && (
                        <>
                          <button
                            type="button"
                            onClick={() => document.getElementById('rider-audio-upload-input')?.click()}
                            disabled={isUploadingRiderAudio}
                            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition flex items-center gap-1"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Replace Audio</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleRemoveRiderAudio}
                            className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 transition"
                            title="Reset to default synthesized rider chime"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Audio Tune Upload Box (No custom file yet) */
                  <div className="p-5 rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-blue-50/30 transition text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
                      <Upload className="w-6 h-6" />
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800">
                        {isUploadingRiderAudio ? 'Uploading and processing audio...' : 'Upload Custom Delivery Partner Trip Audio Tune'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Supports MP3, WAV, AAC, OGG, M4A up to 8MB. Will loop continuously on new trips.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      {isSuperAdmin && (
                        <button
                          type="button"
                          onClick={() => document.getElementById('rider-audio-upload-input')?.click()}
                          disabled={isUploadingRiderAudio}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 active:scale-95"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{isUploadingRiderAudio ? 'Uploading...' : 'Browse & Upload Audio File'}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleToggleRiderPreview}
                        className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-current text-blue-600" />
                        <span>{isPlayingRiderPreview ? 'Playing...' : 'Test Default Chime'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleToggleRiderRingingSimulation}
                        className={`px-3.5 py-2 font-bold text-xs rounded-xl transition flex items-center gap-1.5 ${
                          isSimulatingRiderRing
                            ? 'bg-rose-600 text-white animate-pulse'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <Radio className="w-3.5 h-3.5 text-rose-500" />
                        <span>{isSimulatingRiderRing ? 'Stop Ringing' : 'Simulate Ring Loop'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Super Admin Save Bar */}
          {isSuperAdmin && (
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-sm text-slate-900">
                    Ready to update platform sound alerts?
                  </h5>
                  <p className="text-xs text-slate-500">
                    Clicking save applies your uploaded audio tunes immediately to all connected restaurant dashboards and rider devices. Alerts will ring continuously until accepted.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveSoundSettings}
                className="py-3 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-2xl shadow-md transition flex items-center gap-2 active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Save Audio Alert Changes</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 13. BRAND & PLATFORM SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Sub-Navigation for Settings */}
          <div className="bg-white rounded-2xl p-2 border border-slate-200/90 shadow-xs flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSettingsSubTab('logo')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                settingsSubTab === 'logo'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Platform Brand Logo & Visual Identity</span>
            </button>

            <button
              type="button"
              onClick={() => setSettingsSubTab('commercial')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                settingsSubTab === 'commercial'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Commercial Commission & Operations Settings</span>
            </button>

            <button
              type="button"
              onClick={() => setSettingsSubTab('company')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                settingsSubTab === 'company'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Company Information & Legal Policies</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 font-black">
                5 Pages
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSettingsSubTab('data')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                settingsSubTab === 'data'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Data Protection & Backup</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-black">
                Protected
              </span>
            </button>
          </div>

          {/* SUBTAB 1: PLATFORM BRAND LOGO & VISUAL IDENTITY */}
          {settingsSubTab === 'logo' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-heading font-black text-xl text-slate-900">
                      Platform Brand Logo & Visual Identity
                    </h3>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isSuperAdmin && !isFranchiseAdmin
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {isSuperAdmin && !isFranchiseAdmin ? (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                          <span>Super Admin Exclusive Access</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Super Admin Role Required</span>
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Upload custom brand logo files in all formats (PNG, SVG, JPG, WebP, GIF, AVIF, HEIC). Automatically synchronizes across customer navbar, mobile views, partner portals, and official order receipts.
                  </p>
                </div>

                {isSuperAdmin && !isFranchiseAdmin && (
                  <button
                    type="button"
                    onClick={handleResetBrandLogo}
                    className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Default Logo</span>
                  </button>
                )}
              </div>

              {/* Security restriction banner */}
              {(!isSuperAdmin || isFranchiseAdmin) ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-800">
                  <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">Access Restricted to Super Administrators</p>
                    <p className="text-amber-700">
                      Your current administrative role is <span className="font-bold uppercase tracking-wider">{currentAdminRole.replace(/_/g, ' ')}</span>. Modifying the platform brand identity and logo assets requires <span className="font-bold">Super Admin</span> privileges.
                    </p>
                  </div>
                </div>
              ) : (
                /* SUPER ADMIN LOGO UPLOAD SUITE */
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left col: File Upload Drag & Drop & URL input */}
                    <div className="lg:col-span-7 space-y-4">
                      {/* File Upload Zone */}
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-2">
                          Upload Platform Logo File (PNG / JPG / SVG / WebP / HEIC)
                        </label>
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDraggingLogo(true);
                          }}
                          onDragLeave={() => setIsDraggingLogo(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDraggingLogo(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file) handleLogoFileUpload(file);
                          }}
                          className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer ${
                            isDraggingLogo
                              ? 'border-purple-500 bg-purple-50/50 scale-[1.01]'
                              : 'border-slate-300 hover:border-purple-400 bg-slate-50/60 hover:bg-purple-50/20'
                          }`}
                          onClick={() => document.getElementById('super-admin-logo-input')?.click()}
                        >
                          <input
                            id="super-admin-logo-input"
                            type="file"
                            accept="image/*,.png,.jpg,.jpeg,.webp,.svg,.gif,.avif,.heic,.heif,.bmp,.tiff"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleLogoFileUpload(file);
                            }}
                          />
                          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-center text-purple-600 mx-auto mb-3">
                            <Upload className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-800">
                              Click to browse file or drag & drop platform logo here
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Supports all formats: PNG, SVG, JPG, WEBP, GIF, AVIF, HEIC (Up to 15MB)
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Direct Logo URL & Favicon URL Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            Direct Brand Logo URL
                          </label>
                          <input
                            type="url"
                            value={tempLogoUrl}
                            onChange={(e) => {
                              setTempLogoUrl(e.target.value);
                              setLogoSaveSuccess(false);
                            }}
                            placeholder="https://example.com/logo.png"
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-purple-500"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            Favicon / Browser Icon URL
                          </label>
                          <input
                            type="text"
                            value={tempFaviconUrl}
                            onChange={(e) => {
                              setTempFaviconUrl(e.target.value);
                              setLogoSaveSuccess(false);
                            }}
                            placeholder="/favicon.ico or image URL"
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-purple-500"
                          />
                        </div>
                      </div>

                      {/* Curated Presets */}
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-2">
                          Or Choose from Curated Culinary Brand Emblems
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {PRESET_LOGOS.map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setTempLogoUrl(preset.url);
                                setLogoSaveSuccess(false);
                                addNotification('Emblem Loaded', `${preset.name} loaded into preview. Click "Save Brand Logo & Visual Identity" to apply.`, 'system');
                              }}
                              className={`p-2.5 bg-white border rounded-xl text-left hover:border-purple-500 transition group flex flex-col items-center gap-2 ${
                                tempLogoUrl === preset.url
                                  ? 'border-purple-600 ring-2 ring-purple-500/20 bg-purple-50/30'
                                  : 'border-slate-200'
                              }`}
                            >
                              <div className="w-12 h-12 rounded-lg bg-slate-100 p-1 flex items-center justify-center overflow-hidden">
                                <img src={preset.url} alt={preset.name} className="w-full h-full object-cover rounded" />
                              </div>
                              <span className="text-[10px] font-bold text-slate-700 text-center line-clamp-1 group-hover:text-purple-600">
                                {preset.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right col: Live Multi-Surface Preview */}
                    <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                          Live Multi-Surface Previews
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Auto-Preview</span>
                        </span>
                      </div>

                      {/* Surface 1: Customer Navbar (Light) */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-600">
                          1. Customer Navigation Bar (Light Surface)
                        </span>
                        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                            {tempLogoUrl ? (
                              <img
                                src={tempLogoUrl}
                                alt="Logo preview"
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <span className="font-heading font-black text-lg text-orange-600">L</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-black font-heading text-slate-900 leading-tight">
                              {brandSettings.brandName}
                            </div>
                            <div className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                              PREMIUM DELIVERY
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Surface 2: Admin Dashboard (Dark) */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-600">
                          2. Admin Control Bar (Dark Surface)
                        </span>
                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 shadow-xs flex items-center gap-3 text-white">
                          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 p-1 flex items-center justify-center overflow-hidden shrink-0">
                            {tempLogoUrl ? (
                              <img
                                src={tempLogoUrl}
                                alt="Logo preview"
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <ShieldCheck className="w-5 h-5 text-purple-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-black font-heading text-white truncate">
                              {brandSettings.brandName} Command
                            </div>
                            <div className="text-[9px] font-bold text-purple-400">
                              Super Admin Portal
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Surface 3: Order Invoice & Receipts */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-600">
                          3. Official Customer Tax Invoice / Receipt Header
                        </span>
                        <div className="p-3 bg-amber-50/50 rounded-xl border border-dashed border-amber-200 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            {tempLogoUrl && (
                              <img src={tempLogoUrl} alt="Logo" className="w-6 h-6 object-contain" />
                            )}
                            <span className="font-bold text-slate-800">{brandSettings.brandName} GST Invoice</span>
                          </div>
                          <span className="font-mono text-[10px] text-slate-500">INV-89021</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FEATURE SAVE OPTION: PLATFORM BRAND LOGO & VISUAL IDENTITY */}
                  <div className="p-4 bg-purple-50/60 border border-purple-200/80 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                        <Save className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-purple-950 uppercase tracking-wider">
                          Save Brand Logo & Visual Identity
                        </h4>
                        <p className="text-[11px] text-purple-700">
                          {tempLogoUrl !== brandSettings.logoUrl || tempFaviconUrl !== brandSettings.faviconUrl
                            ? 'You have pending visual identity changes. Click Save to permanently write to storage.'
                            : 'Brand identity is currently synchronized with permanent storage.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {tempLogoUrl !== brandSettings.logoUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setTempLogoUrl(brandSettings.logoUrl);
                            setTempFaviconUrl(brandSettings.faviconUrl || '/favicon.ico');
                          }}
                          className="px-3.5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition"
                        >
                          Discard Changes
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleSaveBrandLogo}
                        disabled={isSavingLogo}
                        className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm"
                      >
                        {isSavingLogo ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Saving Identity...</span>
                          </>
                        ) : logoSaveSuccess ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                            <span>Saved to Permanent Storage!</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Save Brand Logo & Visual Identity</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SUBTAB 2: COMMERCIAL COMMISSION & OPERATIONS SETTINGS */}
          {settingsSubTab === 'commercial' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-heading font-black text-xl text-slate-900">
                      Commercial Commission & Operations Settings
                    </h3>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isSuperAdmin && !isFranchiseAdmin
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {isSuperAdmin && !isFranchiseAdmin ? (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Super Admin Privileges</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Read-Only (Franchise Admin)</span>
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Configure customer platform fees, default restaurant commission percentages, statutory GST rates, and headquarters contact coordinates.
                  </p>
                </div>

                {isSuperAdmin && !isFranchiseAdmin && (
                  <button
                    type="button"
                    onClick={handleResetCommercial}
                    className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset / Discard Edits</span>
                  </button>
                )}
              </div>

              {isFranchiseAdmin && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-xs text-amber-800">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Franchise Admin Mode:</strong> Commercial commission rates, customer platform fees, and corporate coordinates are read-only. Modifying commercial settings requires Super Admin credentials.
                  </span>
                </div>
              )}

              {/* Commercial form inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Platform Brand Name
                  </label>
                  <input
                    type="text"
                    disabled={isFranchiseAdmin || !isSuperAdmin}
                    readOnly={isFranchiseAdmin || !isSuperAdmin}
                    value={commBrandName}
                    onChange={(e) => setCommBrandName(e.target.value)}
                    className={`w-full p-2.5 rounded-xl font-bold border transition ${
                      isFranchiseAdmin || !isSuperAdmin
                        ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                        : 'bg-slate-50 border-slate-200 focus:bg-white focus:outline-emerald-500'
                    }`}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Displayed in title, navbar, and customer receipts.</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Marketing Slogan / Tagline
                  </label>
                  <input
                    type="text"
                    disabled={isFranchiseAdmin || !isSuperAdmin}
                    readOnly={isFranchiseAdmin || !isSuperAdmin}
                    value={commTagline}
                    onChange={(e) => setCommTagline(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border transition ${
                      isFranchiseAdmin || !isSuperAdmin
                        ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                        : 'bg-slate-50 border-slate-200 focus:bg-white focus:outline-emerald-500'
                    }`}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Hero banner and meta slogan.</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Customer Platform Fee (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    disabled={isFranchiseAdmin || !isSuperAdmin}
                    readOnly={isFranchiseAdmin || !isSuperAdmin}
                    value={commPlatformFee}
                    onChange={(e) => setCommPlatformFee(Number(e.target.value))}
                    className={`w-full p-2.5 rounded-xl font-bold border transition ${
                      isFranchiseAdmin || !isSuperAdmin
                        ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                        : 'bg-slate-50 border-slate-200 focus:bg-white focus:outline-emerald-500'
                    }`}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Added to customer checkout bill.</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Default Restaurant Commission (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    disabled={isFranchiseAdmin || !isSuperAdmin}
                    readOnly={isFranchiseAdmin || !isSuperAdmin}
                    value={commDefaultCommissionRate}
                    onChange={(e) => setCommDefaultCommissionRate(Number(e.target.value))}
                    className={`w-full p-2.5 rounded-xl font-bold border transition ${
                      isFranchiseAdmin || !isSuperAdmin
                        ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                        : 'bg-slate-50 border-slate-200 focus:bg-white focus:outline-emerald-500'
                    }`}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Platform take-rate for new restaurant onboarding.</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Statutory GST Rate (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={28}
                    step={0.5}
                    disabled={isFranchiseAdmin || !isSuperAdmin}
                    readOnly={isFranchiseAdmin || !isSuperAdmin}
                    value={commGstRate}
                    onChange={(e) => setCommGstRate(Number(e.target.value))}
                    className={`w-full p-2.5 rounded-xl font-bold border transition ${
                      isFranchiseAdmin || !isSuperAdmin
                        ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                        : 'bg-slate-50 border-slate-200 focus:bg-white focus:outline-emerald-500'
                    }`}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Food service GST tax rate (standard: 5%).</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Customer Care Phone Number
                  </label>
                  <input
                    type="text"
                    disabled={isFranchiseAdmin || !isSuperAdmin}
                    readOnly={isFranchiseAdmin || !isSuperAdmin}
                    value={commSupportPhone}
                    onChange={(e) => setCommSupportPhone(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border transition ${
                      isFranchiseAdmin || !isSuperAdmin
                        ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                        : 'bg-slate-50 border-slate-200 focus:bg-white focus:outline-emerald-500'
                    }`}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Displayed on order invoices and contact modal.</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Support Care Email Address
                  </label>
                  <input
                    type="email"
                    disabled={isFranchiseAdmin || !isSuperAdmin}
                    readOnly={isFranchiseAdmin || !isSuperAdmin}
                    value={commSupportEmail}
                    onChange={(e) => setCommSupportEmail(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border transition ${
                      isFranchiseAdmin || !isSuperAdmin
                        ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                        : 'bg-slate-50 border-slate-200 focus:bg-white focus:outline-emerald-500'
                    }`}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Official escalation and dispute care inbox.</p>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Official Headquarters Physical Address
                  </label>
                  <input
                    type="text"
                    disabled={isFranchiseAdmin || !isSuperAdmin}
                    readOnly={isFranchiseAdmin || !isSuperAdmin}
                    value={commHeadquartersAddress}
                    onChange={(e) => setCommHeadquartersAddress(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border transition ${
                      isFranchiseAdmin || !isSuperAdmin
                        ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                        : 'bg-slate-50 border-slate-200 focus:bg-white focus:outline-emerald-500'
                    }`}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Printed on official invoices and contact page.</p>
                </div>
              </div>

              {/* FEATURE SAVE OPTION: COMMERCIAL COMMISSION & OPERATIONS SETTINGS */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Save className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                      Save Commercial Commission & Operations Settings
                    </h4>
                    <p className="text-[11px] text-emerald-700">
                      Changes will be permanently stored and immediately govern checkout calculations, platform fees, and commissions.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetCommercial}
                    className="px-3.5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition"
                  >
                    Reset
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveCommercial}
                    disabled={isSavingCommercial || isFranchiseAdmin || !isSuperAdmin}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSavingCommercial ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Saving Settings...</span>
                      </>
                    ) : commercialSaveSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                        <span>Saved to Permanent Storage!</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Commercial Commission & Operations Settings</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 3: COMPANY PAGES & LEGAL POLICIES (About Us, Contact & Support, Privacy Policy, Terms & Conditions, Refund & Cancellation Policy) */}
          {settingsSubTab === 'company' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-heading font-black text-xl text-slate-900">
                      Company Information & Legal Policy Configuration
                    </h3>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Live Publishing to Customer Footer & Policy Pages</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Full Add, Edit, and Delete access to official company pages, customer disclosures, and custom legal documents.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setCustomPageModal({ isOpen: true, mode: 'add', data: null })}
                    disabled={isFranchiseAdmin || !isSuperAdmin}
                    className="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Company Page</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePreviewCompanyPage(companyPageSubTab)}
                    className="px-3.5 py-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Live Customer View</span>
                  </button>

                  {['about', 'contact', 'privacy', 'terms', 'refund'].includes(companyPageSubTab) && (
                    <button
                      type="button"
                      onClick={() => handleResetCompanyPageToDefault(companyPageSubTab as any)}
                      className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore Template</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Company Policy Page Selector Pills with Active/Deleted Status Badges */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
                {[
                  {
                    id: 'about',
                    label: 'About Us',
                    icon: Building2,
                    enabled: companyPagesData.aboutUs.enabled !== false,
                  },
                  {
                    id: 'contact',
                    label: 'Contact & Support',
                    icon: Phone,
                    enabled: companyPagesData.contactSupport.enabled !== false,
                  },
                  {
                    id: 'privacy',
                    label: 'Privacy Policy',
                    icon: ShieldCheck,
                    enabled: companyPagesData.privacyPolicy.enabled !== false,
                  },
                  {
                    id: 'terms',
                    label: 'Terms & Conditions',
                    icon: FileSignature,
                    enabled: companyPagesData.termsConditions.enabled !== false,
                  },
                  {
                    id: 'refund',
                    label: 'Refund & Cancellation Policy',
                    icon: RotateCcw,
                    enabled: companyPagesData.refundCancellation.enabled !== false,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = companyPageSubTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCompanyPageSubTab(item.id)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          item.enabled ? 'bg-emerald-400' : 'bg-red-400'
                        }`}
                        title={item.enabled ? 'Published' : 'Deleted / Hidden'}
                      />
                    </button>
                  );
                })}

                {/* Custom Admin-Created Pages */}
                {companyPagesData.customPages?.map((cp) => {
                  const isActive = companyPageSubTab === cp.slug || companyPageSubTab === cp.id;
                  return (
                    <button
                      key={cp.id}
                      type="button"
                      onClick={() => setCompanyPageSubTab(cp.slug)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{cp.title}</span>
                      <span className="text-[10px] px-1 py-0.2 rounded bg-indigo-100 text-indigo-700 font-extrabold uppercase">
                        Custom
                      </span>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          cp.enabled ? 'bg-emerald-400' : 'bg-red-400'
                        }`}
                        title={cp.enabled ? 'Published' : 'Deleted / Hidden'}
                      />
                    </button>
                  );
                })}
              </div>

              {/* 1. ABOUT US EDITOR */}
              {companyPageSubTab === 'about' && (
                <div className="space-y-5">
                  {/* Status & Action Toolbar */}
                  <div className="p-4 bg-orange-50/70 border border-orange-200/90 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-slate-900">About Us Page</h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              companyPagesData.aboutUs.enabled !== false
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {companyPagesData.aboutUs.enabled !== false
                              ? 'Published (Live in Footer)'
                              : 'Deleted / Hidden'}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px]">
                          Brand story, mission statement, FSSAI standards, and culinary milestone metrics.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {companyPagesData.aboutUs.enabled !== false ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteStandardCompanyPage('about', 'About Us')}
                          className="px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl transition flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Page (Hide)</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRestoreStandardCompanyPage('about', 'About Us')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Restore / Re-Add Page</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {companyPagesData.aboutUs.enabled === false && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-xs text-red-800">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>
                          <strong>This page is deleted/inactive:</strong> It is removed from the customer website footer. Re-add or restore it to make it visible.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRestoreStandardCompanyPage('about', 'About Us')}
                        className="font-bold underline hover:text-red-950"
                      >
                        Restore Now →
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Page Main Heading</label>
                      <input
                        type="text"
                        value={companyPagesData.aboutUs.heading}
                        onChange={(e) =>
                          setCompanyPagesData((prev) => ({
                            ...prev,
                            aboutUs: { ...prev.aboutUs, heading: e.target.value },
                          }))
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-blue-500"
                        placeholder="e.g. About LIKART FOOD"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Subheading / Mission</label>
                      <input
                        type="text"
                        value={companyPagesData.aboutUs.subheading}
                        onChange={(e) =>
                          setCompanyPagesData((prev) => ({
                            ...prev,
                            aboutUs: { ...prev.aboutUs, subheading: e.target.value },
                          }))
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-blue-500"
                        placeholder="e.g. Gourmet Flavours, Delivered at Lightning Speed"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-700 block mb-1">Our Story & Brand Journey</label>
                      <textarea
                        rows={3}
                        value={companyPagesData.aboutUs.story}
                        onChange={(e) =>
                          setCompanyPagesData((prev) => ({
                            ...prev,
                            aboutUs: { ...prev.aboutUs, story: e.target.value },
                          }))
                        }
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-blue-500 leading-relaxed"
                        placeholder="Detail the origin, vision, and culinary philosophy of your platform..."
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-700 block mb-1">Culinary Standards & Quality Assurance</label>
                      <textarea
                        rows={2}
                        value={companyPagesData.aboutUs.standards}
                        onChange={(e) =>
                          setCompanyPagesData((prev) => ({
                            ...prev,
                            aboutUs: { ...prev.aboutUs, standards: e.target.value },
                          }))
                        }
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-blue-500 leading-relaxed"
                        placeholder="Explain kitchen hygiene, FSSAI compliance, thermal sealing, etc..."
                      />
                    </div>
                  </div>

                  {/* Highlights / Statistics Cards with Add/Delete Option */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-800 text-xs">
                        Key Highlights / Statistics Cards
                      </label>
                      <button
                        type="button"
                        onClick={() => setAddStatModal({ isOpen: true, number: '', label: '' })}
                        className="px-2.5 py-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Metric Card</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      {/* Metric 1 */}
                      <div className="p-3 bg-orange-50/50 rounded-2xl border border-orange-200 space-y-2">
                        <span className="text-[10px] font-black uppercase text-orange-700">Metric 1</span>
                        <input
                          type="text"
                          value={companyPagesData.aboutUs.stat1Number}
                          onChange={(e) =>
                            setCompanyPagesData((prev) => ({
                              ...prev,
                              aboutUs: { ...prev.aboutUs, stat1Number: e.target.value },
                            }))
                          }
                          placeholder="e.g. 25 Mins"
                          className="w-full p-2 bg-white rounded-lg border border-orange-200 font-black text-orange-600 text-sm"
                        />
                        <input
                          type="text"
                          value={companyPagesData.aboutUs.stat1Label}
                          onChange={(e) =>
                            setCompanyPagesData((prev) => ({
                              ...prev,
                              aboutUs: { ...prev.aboutUs, stat1Label: e.target.value },
                            }))
                          }
                          placeholder="Label description"
                          className="w-full p-1.5 bg-white rounded-lg border border-orange-200 text-slate-600 text-xs"
                        />
                      </div>

                      {/* Metric 2 */}
                      <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-2">
                        <span className="text-[10px] font-black uppercase text-emerald-700">Metric 2</span>
                        <input
                          type="text"
                          value={companyPagesData.aboutUs.stat2Number}
                          onChange={(e) =>
                            setCompanyPagesData((prev) => ({
                              ...prev,
                              aboutUs: { ...prev.aboutUs, stat2Number: e.target.value },
                            }))
                          }
                          placeholder="e.g. 100%"
                          className="w-full p-2 bg-white rounded-lg border border-emerald-200 font-black text-emerald-600 text-sm"
                        />
                        <input
                          type="text"
                          value={companyPagesData.aboutUs.stat2Label}
                          onChange={(e) =>
                            setCompanyPagesData((prev) => ({
                              ...prev,
                              aboutUs: { ...prev.aboutUs, stat2Label: e.target.value },
                            }))
                          }
                          placeholder="Label description"
                          className="w-full p-1.5 bg-white rounded-lg border border-emerald-200 text-slate-600 text-xs"
                        />
                      </div>

                      {/* Metric 3 */}
                      <div className="p-3 bg-purple-50/50 rounded-2xl border border-purple-200 space-y-2">
                        <span className="text-[10px] font-black uppercase text-purple-700">Metric 3</span>
                        <input
                          type="text"
                          value={companyPagesData.aboutUs.stat3Number}
                          onChange={(e) =>
                            setCompanyPagesData((prev) => ({
                              ...prev,
                              aboutUs: { ...prev.aboutUs, stat3Number: e.target.value },
                            }))
                          }
                          placeholder="e.g. 24/7"
                          className="w-full p-2 bg-white rounded-lg border border-purple-200 font-black text-purple-600 text-sm"
                        />
                        <input
                          type="text"
                          value={companyPagesData.aboutUs.stat3Label}
                          onChange={(e) =>
                            setCompanyPagesData((prev) => ({
                              ...prev,
                              aboutUs: { ...prev.aboutUs, stat3Label: e.target.value },
                            }))
                          }
                          placeholder="Label description"
                          className="w-full p-1.5 bg-white rounded-lg border border-purple-200 text-slate-600 text-xs"
                        />
                      </div>

                      {/* Custom Added Metrics */}
                      {companyPagesData.aboutUs.customStats?.map((st) => (
                        <div
                          key={st.id}
                          className="p-3 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-2 relative group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-blue-700">
                              Custom Metric
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteCustomStat(st.id)}
                              className="text-slate-400 hover:text-red-600 p-0.5 rounded"
                              title="Delete Metric Card"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="font-black text-blue-600 text-sm">{st.number}</div>
                          <div className="text-slate-600 text-xs">{st.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Custom Story Sections with Add/Delete */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-800 text-xs">
                        Custom Narrative & Milestone Sections
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setAddClauseModal({
                            isOpen: true,
                            targetPage: 'about',
                            title: '',
                            content: '',
                          })
                        }
                        className="px-2.5 py-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Section</span>
                      </button>
                    </div>

                    {companyPagesData.aboutUs.customSections?.map((sec) => (
                      <div
                        key={sec.id}
                        className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 relative"
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-slate-900 text-xs">{sec.title}</h5>
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomSection('about', sec.id)}
                            className="text-slate-400 hover:text-red-600 p-1 rounded"
                            title="Delete Section"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                          {sec.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. CONTACT & SUPPORT EDITOR */}
              {companyPageSubTab === 'contact' && (
                <div className="space-y-5">
                  <div className="p-4 bg-blue-50/70 border border-blue-200/90 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-slate-900">Contact & Support</h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              companyPagesData.contactSupport.enabled !== false
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {companyPagesData.contactSupport.enabled !== false
                              ? 'Published (Live in Footer)'
                              : 'Deleted / Hidden'}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px]">
                          Helplines, care email, physical headquarters, and custom support channels.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {companyPagesData.contactSupport.enabled !== false ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteStandardCompanyPage('contact', 'Contact & Support')}
                          className="px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl transition flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Page (Hide)</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRestoreStandardCompanyPage('contact', 'Contact & Support')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Restore / Re-Add Page</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {companyPagesData.contactSupport.enabled === false && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-xs text-red-800">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>
                          <strong>This page is deleted/inactive:</strong> Contact & Support is hidden from the customer website footer.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRestoreStandardCompanyPage('contact', 'Contact & Support')}
                        className="font-bold underline hover:text-red-950"
                      >
                        Restore Now →
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Page Title Heading</label>
                      <input
                        type="text"
                        value={companyPagesData.contactSupport.heading}
                        onChange={(e) =>
                          setCompanyPagesData((prev) => ({
                            ...prev,
                            contactSupport: { ...prev.contactSupport, heading: e.target.value },
                          }))
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-blue-500"
                        placeholder="e.g. Contact Headquarters & Support"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Operating Hours / Availability</label>
                      <input
                        type="text"
                        value={companyPagesData.contactSupport.operatingHours}
                        onChange={(e) =>
                          setCompanyPagesData((prev) => ({
                            ...prev,
                            contactSupport: { ...prev.contactSupport, operatingHours: e.target.value },
                          }))
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-blue-500"
                        placeholder="e.g. 24 Hours • 7 Days (Toll-Free Helpline)"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-700 block mb-1">Support Description / Intro</label>
                      <textarea
                        rows={2}
                        value={companyPagesData.contactSupport.description}
                        onChange={(e) =>
                          setCompanyPagesData((prev) => ({
                            ...prev,
                            contactSupport: { ...prev.contactSupport, description: e.target.value },
                          }))
                        }
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-blue-500"
                        placeholder="Guidance paragraph on how customers, riders, and restaurants can connect..."
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Toll-Free Customer Helpline</label>
                      <input
                        type="text"
                        value={companyPagesData.contactSupport.phone}
                        onChange={(e) =>
                          setCompanyPagesData((prev) => ({
                            ...prev,
                            contactSupport: { ...prev.contactSupport, phone: e.target.value },
                          }))
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-blue-500"
                        placeholder="+91 8000 123 456"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Customer Care Email</label>
                      <input
                        type="email"
                        value={companyPagesData.contactSupport.email}
                        onChange={(e) =>
                          setCompanyPagesData((prev) => ({
                            ...prev,
                            contactSupport: { ...prev.contactSupport, email: e.target.value },
                          }))
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-blue-500"
                        placeholder="care@likartfood.com"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Headquarters Street / Building</label>
                      <input
                        type="text"
                        value={companyPagesData.contactSupport.address}
                        onChange={(e) =>
                          setCompanyPagesData((prev) => ({
                            ...prev,
                            contactSupport: { ...prev.contactSupport, address: e.target.value },
                          }))
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-blue-500"
                        placeholder="e.g. Bengaluru Central Commercial Hub"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">City, State & Postal Code</label>
                      <input
                        type="text"
                        value={companyPagesData.contactSupport.cityStateZip}
                        onChange={(e) =>
                          setCompanyPagesData((prev) => ({
                            ...prev,
                            contactSupport: { ...prev.contactSupport, cityStateZip: e.target.value },
                          }))
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-blue-500"
                        placeholder="Karnataka, India - 560034"
                      />
                    </div>
                  </div>

                  {/* Custom Support Channels with Add/Delete Option */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-800 text-xs">
                        Additional Support Desks / Regional Branches
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setAddChannelModal({
                            isOpen: true,
                            title: '',
                            detail: '',
                            subtext: '',
                          })
                        }
                        className="px-2.5 py-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Channel / Branch</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {companyPagesData.contactSupport.customChannels?.map((chan) => (
                        <div
                          key={chan.id}
                          className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 relative"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs uppercase">
                              {chan.title}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteCustomChannel(chan.id)}
                              className="text-slate-400 hover:text-red-600 p-0.5 rounded"
                              title="Delete Channel"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="font-bold text-slate-800 text-xs">{chan.detail}</p>
                          {chan.subtext && (
                            <p className="text-[11px] text-slate-400">{chan.subtext}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. PRIVACY POLICY EDITOR */}
              {companyPageSubTab === 'privacy' && (
                <div className="space-y-5">
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200/90 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-slate-900">Privacy Policy</h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              companyPagesData.privacyPolicy.enabled !== false
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {companyPagesData.privacyPolicy.enabled !== false
                              ? 'Published (Live in Footer)'
                              : 'Deleted / Hidden'}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px]">
                          Customer data collection, GPS privacy disclosures, and payment partner certifications.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {companyPagesData.privacyPolicy.enabled !== false ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteStandardCompanyPage('privacy', 'Privacy Policy')}
                          className="px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl transition flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Page (Hide)</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRestoreStandardCompanyPage('privacy', 'Privacy Policy')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Restore / Re-Add Page</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {companyPagesData.privacyPolicy.enabled === false && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-xs text-red-800">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>
                          <strong>This page is deleted/inactive:</strong> Privacy Policy is hidden from customer footer links.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRestoreStandardCompanyPage('privacy', 'Privacy Policy')}
                        className="font-bold underline hover:text-red-950"
                      >
                        Restore Now →
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Document Heading</label>
                      <input
                        type="text"
                        value={companyPagesData.privacyPolicy.heading}
                        onChange={(e) =>
                          setCompanyPagesData((prev) => ({
                            ...prev,
                            privacyPolicy: { ...prev.privacyPolicy, heading: e.target.value },
                          }))
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-blue-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Last Updated Version Date</label>
                      <input
                        type="text"
                        value={companyPagesData.privacyPolicy.lastUpdated}
                        onChange={(e) =>
                          setCompanyPagesData((prev) => ({
                            ...prev,
                            privacyPolicy: { ...prev.privacyPolicy, lastUpdated: e.target.value },
                          }))
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-blue-500"
                        placeholder="e.g. October 2026"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-700 block mb-1">
                        Full Privacy Policy Body Text
                      </label>
                      <textarea
                        rows={11}
                        value={companyPagesData.privacyPolicy.content}
                        onChange={(e) =>
                          setCompanyPagesData((prev) => ({
                            ...prev,
                            privacyPolicy: { ...prev.privacyPolicy, content: e.target.value },
                          }))
                        }
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs focus:bg-white focus:outline-blue-500 leading-relaxed font-mono"
                        placeholder="Paste or write your full Privacy Policy text here..."
                      />
                    </div>
                  </div>

                  {/* Custom Clauses with Add/Delete Option */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-800 text-xs">
                        Custom Policy Clauses / Subsections
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setAddClauseModal({
                            isOpen: true,
                            targetPage: 'privacy',
                            title: '',
                            content: '',
                          })
                        }
                        className="px-2.5 py-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Policy Clause</span>
                      </button>
                    </div>

                    {companyPagesData.privacyPolicy.customSections?.map((sec) => (
                      <div
                        key={sec.id}
                        className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 relative"
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-slate-900 text-xs">{sec.title}</h5>
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomSection('privacy', sec.id)}
                            className="text-slate-400 hover:text-red-600 p-1 rounded"
                            title="Delete Clause"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                          {sec.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. TERMS & CONDITIONS EDITOR */}
              {companyPageSubTab === 'terms' && (
                <div className="space-y-5">
                  <div className="p-4 bg-indigo-50/70 border border-indigo-200/90 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                        <FileSignature className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-slate-900">Terms & Conditions</h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              companyPagesData.termsConditions.enabled !== false
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {companyPagesData.termsConditions.enabled !== false
                              ? 'Published (Live in Footer)'
                              : 'Deleted / Hidden'}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px]">
                          Commercial contract, ordering rules, delivery OTP handover, and platform fees.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {companyPagesData.termsConditions.enabled !== false ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteStandardCompanyPage('terms', 'Terms & Conditions')}
                          className="px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl transition flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Page (Hide)</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRestoreStandardCompanyPage('terms', 'Terms & Conditions')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Restore / Re-Add Page</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {companyPagesData.termsConditions.enabled === false && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-xs text-red-800">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>
                          <strong>This page is deleted/inactive:</strong> Terms & Conditions is hidden from customer website footer.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRestoreStandardCompanyPage('terms', 'Terms & Conditions')}
                        className="font-bold underline hover:text-red-950"
                      >
                        Restore Now →
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Document Heading</label>
                      <input
                        type="text"
                        value={companyPagesData.termsConditions.heading}
                        onChange={(e) =>
                          setCompanyPagesData((prev) => ({
                            ...prev,
                            termsConditions: { ...prev.termsConditions, heading: e.target.value },
                          }))
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-blue-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Effective Date</label>
                      <input
                        type="text"
                        value={companyPagesData.termsConditions.effectiveDate}
                        onChange={(e) =>
                          setCompanyPagesData((prev) => ({
                            ...prev,
                            termsConditions: { ...prev.termsConditions, effectiveDate: e.target.value },
                          }))
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-blue-500"
                        placeholder="e.g. October 2026"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-700 block mb-1">
                        Full Terms & Conditions Body Text
                      </label>
                      <textarea
                        rows={11}
                        value={companyPagesData.termsConditions.content}
                        onChange={(e) =>
                          setCompanyPagesData((prev) => ({
                            ...prev,
                            termsConditions: { ...prev.termsConditions, content: e.target.value },
                          }))
                        }
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs focus:bg-white focus:outline-blue-500 leading-relaxed font-mono"
                        placeholder="Paste or write your full Terms & Conditions text here..."
                      />
                    </div>
                  </div>

                  {/* Custom Clauses with Add/Delete Option */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-800 text-xs">
                        Custom Contract Clauses / Community Terms
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setAddClauseModal({
                            isOpen: true,
                            targetPage: 'terms',
                            title: '',
                            content: '',
                          })
                        }
                        className="px-2.5 py-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Terms Clause</span>
                      </button>
                    </div>

                    {companyPagesData.termsConditions.customSections?.map((sec) => (
                      <div
                        key={sec.id}
                        className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 relative"
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-slate-900 text-xs">{sec.title}</h5>
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomSection('terms', sec.id)}
                            className="text-slate-400 hover:text-red-600 p-1 rounded"
                            title="Delete Clause"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                          {sec.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. REFUND & CANCELLATION POLICY EDITOR */}
              {companyPageSubTab === 'refund' && (
                <div className="space-y-5">
                  <div className="p-4 bg-teal-50/70 border border-teal-200/90 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                        <RotateCcw className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-slate-900">Refund & Cancellation Policy</h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              companyPagesData.refundCancellation.enabled !== false
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {companyPagesData.refundCancellation.enabled !== false
                              ? 'Published (Live in Footer)'
                              : 'Deleted / Hidden'}
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px]">
                          Free cancellation thresholds, quality refund turnaround, and bank payout SLAs.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {companyPagesData.refundCancellation.enabled !== false ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteStandardCompanyPage('refund', 'Refund & Cancellation Policy')}
                          className="px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl transition flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Page (Hide)</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRestoreStandardCompanyPage('refund', 'Refund & Cancellation Policy')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Restore / Re-Add Page</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {companyPagesData.refundCancellation.enabled === false && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-xs text-red-800">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>
                          <strong>This page is deleted/inactive:</strong> Refund & Cancellation Policy is hidden from customer website footer.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRestoreStandardCompanyPage('refund', 'Refund & Cancellation Policy')}
                        className="font-bold underline hover:text-red-950"
                      >
                        Restore Now →
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Document Heading</label>
                      <input
                        type="text"
                        value={companyPagesData.refundCancellation.heading}
                        onChange={(e) =>
                          setCompanyPagesData((prev) => ({
                            ...prev,
                            refundCancellation: { ...prev.refundCancellation, heading: e.target.value },
                          }))
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-blue-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Policy Subtitle / Guarantee Tag</label>
                      <input
                        type="text"
                        value={companyPagesData.refundCancellation.subtitle}
                        onChange={(e) =>
                          setCompanyPagesData((prev) => ({
                            ...prev,
                            refundCancellation: { ...prev.refundCancellation, subtitle: e.target.value },
                          }))
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-blue-500"
                        placeholder="e.g. Fair Customer Protection & SLA Guarantee"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-700 block mb-1">
                        Full Cancellation & Refund Policy Body Text
                      </label>
                      <textarea
                        rows={11}
                        value={companyPagesData.refundCancellation.content}
                        onChange={(e) =>
                          setCompanyPagesData((prev) => ({
                            ...prev,
                            refundCancellation: { ...prev.refundCancellation, content: e.target.value },
                          }))
                        }
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs focus:bg-white focus:outline-blue-500 leading-relaxed font-mono"
                        placeholder="Paste or write your full Cancellation & Refund Policy terms here..."
                      />
                    </div>
                  </div>

                  {/* Custom Refund Rules with Add/Delete Option */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-800 text-xs">
                        Custom Refund Conditions & SLA Exceptions
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setAddClauseModal({
                            isOpen: true,
                            targetPage: 'refund',
                            title: '',
                            content: '',
                          })
                        }
                        className="px-2.5 py-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Refund Condition</span>
                      </button>
                    </div>

                    {companyPagesData.refundCancellation.customSections?.map((sec) => (
                      <div
                        key={sec.id}
                        className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 relative"
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-slate-900 text-xs">{sec.title}</h5>
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomSection('refund', sec.id)}
                            className="text-slate-400 hover:text-red-600 p-1 rounded"
                            title="Delete Condition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                          {sec.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. CUSTOM COMPANY PAGE EDITOR */}
              {companyPagesData.customPages?.find(
                (cp) => cp.slug === companyPageSubTab || cp.id === companyPageSubTab
              ) && (
                (() => {
                  const cp = companyPagesData.customPages.find(
                    (p) => p.slug === companyPageSubTab || p.id === companyPageSubTab
                  )!;
                  return (
                    <div className="space-y-5">
                      <div className="p-4 bg-indigo-50/70 border border-indigo-200/90 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-black text-slate-900">{cp.title}</h4>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                  cp.enabled
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {cp.enabled ? 'Published (Live in Footer)' : 'Deleted / Hidden'}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800 uppercase">
                                {cp.category || 'Custom Document'}
                              </span>
                            </div>
                            <p className="text-slate-600 text-[11px]">
                              Slug: <code className="bg-white/80 px-1 py-0.2 rounded font-mono">{cp.slug}</code> • Last updated: {cp.lastUpdated || 'Recent'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setCustomPageModal({ isOpen: true, mode: 'edit', data: cp })}
                            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition flex items-center gap-1.5"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit Metadata</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteCustomCompanyPage(cp)}
                            className="px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl transition flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Page</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Document Title</label>
                          <input
                            type="text"
                            value={cp.title}
                            onChange={(e) => {
                              const newTitle = e.target.value;
                              setCompanyPagesData((prev) => ({
                                ...prev,
                                customPages: (prev.customPages || []).map((p) =>
                                  p.id === cp.id ? { ...p, title: newTitle } : p
                                ),
                              }));
                            }}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-blue-500"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Subtitle / Summary</label>
                          <input
                            type="text"
                            value={cp.subtitle || ''}
                            onChange={(e) => {
                              const newSub = e.target.value;
                              setCompanyPagesData((prev) => ({
                                ...prev,
                                customPages: (prev.customPages || []).map((p) =>
                                  p.id === cp.id ? { ...p, subtitle: newSub } : p
                                ),
                              }));
                            }}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-blue-500"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="font-bold text-slate-700 block mb-1">
                            Full Document Content Text
                          </label>
                          <textarea
                            rows={12}
                            value={cp.content}
                            onChange={(e) => {
                              const newContent = e.target.value;
                              setCompanyPagesData((prev) => ({
                                ...prev,
                                customPages: (prev.customPages || []).map((p) =>
                                  p.id === cp.id ? { ...p, content: newContent } : p
                                ),
                              }));
                            }}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs focus:bg-white focus:outline-blue-500 leading-relaxed font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}

              {/* FEATURE SAVE OPTION: COMPANY PAGES & LEGAL CONTENT */}
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Save className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-blue-950 uppercase tracking-wider">
                      Save Company Information & Policy Changes
                    </h4>
                    <p className="text-[11px] text-blue-700">
                      Permanently stores edits and publishes immediately to customer footer links, checkout legal disclosures, and policy views.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePreviewCompanyPage(companyPageSubTab)}
                    className="px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Preview in Customer View</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const titles: Record<string, string> = {
                        about: 'About Us',
                        contact: 'Contact & Support',
                        privacy: 'Privacy Policy',
                        terms: 'Terms & Conditions',
                        refund: 'Refund & Cancellation Policy',
                      };
                      const customTitle = companyPagesData.customPages?.find(
                        (p) => p.slug === companyPageSubTab || p.id === companyPageSubTab
                      )?.title;
                      handleSaveCompanyPages(titles[companyPageSubTab] || customTitle || 'Company Pages');
                    }}
                    disabled={isSavingCompany || isFranchiseAdmin || !isSuperAdmin}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSavingCompany ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Saving Policy...</span>
                      </>
                    ) : companySaveSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                        <span>Permanently Saved & Published!</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Company Content & Policies</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SUBTAB 4: DATA PROTECTION & APPLICATION UPDATE IMMUNITY */}
          {settingsSubTab === 'data' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-heading font-black text-xl text-slate-900">
                      Permanent Data Persistence & Application Update Protection
                    </h3>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Immune to Application Updates & Resets</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Newly added data (restaurants, menu items, delivery partners, zones, promo coupons, banners, brand settings, and policies) is permanently saved and will NEVER be reset by future software updates or code deployments.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleForcePermanentSave}
                    className="px-3.5 py-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingPermanentStorage ? 'animate-spin' : ''}`} />
                    <span>{isSyncingPermanentStorage ? 'Writing to Disk...' : 'Force Disk Sync'}</span>
                  </button>
                </div>
              </div>

              {/* 3 Pillar Protection Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 uppercase">1. Zero-Reset Guarantee</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Application updates preserve all existing user data. Destructive database wipes have been permanently disabled across all modules.
                  </p>
                </div>

                <div className="p-5 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                    <Database className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 uppercase">2. Dual-Layer Storage</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Every modification mirrors to HTML5 LocalStorage and Master IndexedDB (<code>likart_master_permanent_db</code>) for maximum disk durability.
                  </p>
                </div>

                <div className="p-5 bg-purple-50/60 border border-purple-200 rounded-2xl space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                    <CheckCheck className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 uppercase">3. Self-Healing Recovery</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    If browser temporary cache is ever cleared by browser maintenance, missing collections are automatically recovered from IndexedDB on startup.
                  </p>
                </div>
              </div>

              {/* Live Database Entities Snapshot */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Live Database Records Status
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>All Records Synchronized</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Outlets & Kitchens</span>
                    <span className="text-lg font-black text-slate-900">{restaurants.length}</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Catalog Menu Items</span>
                    <span className="text-lg font-black text-slate-900">{menuItems.length}</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Delivery Fleet</span>
                    <span className="text-lg font-black text-slate-900">{deliveryPartners.length}</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Service Zones</span>
                    <span className="text-lg font-black text-slate-900">{zones.length}</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Coupons & Codes</span>
                    <span className="text-lg font-black text-slate-900">{coupons.length}</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Promotional Banners</span>
                    <span className="text-lg font-black text-slate-900">{banners.length}</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Payment Gateways</span>
                    <span className="text-lg font-black text-slate-900">{paymentGateways.length}</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
                    <span className="text-slate-400 text-[10px] font-bold uppercase block">Master Cuisines</span>
                    <span className="text-lg font-black text-slate-900">{cuisines.length}</span>
                  </div>
                </div>
              </div>

              {/* Database Export & Import Suite */}
              <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-400" />
                    <h4 className="font-bold text-sm">Downloadable Database Backup & Portability</h4>
                  </div>
                  <p className="text-xs text-slate-400 max-w-xl">
                    Export a standalone JSON snapshot of your entire platform database anytime. You can keep safe offline copies or restore them on any device.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    id="import-db-backup-file-input"
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImportDatabaseBackupFile(file);
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => document.getElementById('import-db-backup-file-input')?.click()}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4 text-purple-400" />
                    <span>Restore Backup (Import JSON)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadDatabaseBackup}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Full Backup (JSON)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 14. EXPORT & REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-heading font-black text-xl text-slate-900 flex items-center gap-2">
                <Download className="w-6 h-6 text-emerald-600" />
                <span>Export & Reports Center</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Download compiled Android APK packages, financial spreadsheets, settlement statements, and full platform database backups.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href="/likart-food-release.aab"
                download="likart-food-release.aab"
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-xs transition flex items-center gap-2 active:scale-95"
                title="Download official Google Play Store .aab bundle package"
              >
                <Sparkles className="w-4 h-4 fill-slate-950 text-slate-950" />
                <span>Download Play Store (.aab)</span>
              </a>
              <a
                href="/likart-food.apk"
                download="likart-food.apk"
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center gap-2 active:scale-95 border border-slate-700"
              >
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Download APK (.apk)</span>
              </a>
              <button
                type="button"
                onClick={() => setIsAndroidApkModalOpen(true)}
                className="px-4 py-2.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-500/40 font-black text-xs rounded-xl transition flex items-center gap-2"
              >
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Play Store &amp; APK Hub</span>
              </button>
            </div>
          </div>

          {/* Google Play Store (.aab) & Android Application Package (.apk) Export Card */}
          <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white rounded-3xl border border-emerald-700/50 shadow-lg space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Smartphone className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-300" />
                      <span>Google Play Console Ready</span>
                    </span>
                    <span className="text-[10px] font-bold text-teal-300">
                      Official .aab + Binary .apk
                    </span>
                  </div>
                  <h4 className="font-heading font-black text-lg text-white mt-1">
                    Google Play Store (.aab) &amp; Android Native Packages
                  </h4>
                  <p className="text-xs text-emerald-100/80 max-w-xl">
                    Download the official Google Play Store Android App Bundle (<code>likart-food-release.aab</code>) for Play Console publishing, standalone sideload <code>.apk</code>, or export the complete Android build kit with manifests and Gradle scripts.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <a
                  href="/likart-food-release.aab"
                  download="likart-food-release.aab"
                  className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-2 active:scale-95"
                  title="Direct download of Google Play Store .aab bundle"
                >
                  <Download className="w-4 h-4 fill-slate-950 text-slate-950" />
                  <span>Download Play Store .aab</span>
                </a>

                <a
                  href="/likart-food.apk"
                  download="likart-food.apk"
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition flex items-center gap-2"
                >
                  <Smartphone className="w-4 h-4 text-emerald-300" />
                  <span>Download .apk</span>
                </a>

                <button
                  type="button"
                  onClick={() => setIsAndroidApkModalOpen(true)}
                  className="px-4 py-3 bg-slate-900/80 hover:bg-slate-800 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-500/30 transition flex items-center gap-2"
                >
                  <Layers className="w-4 h-4 text-emerald-300" />
                  <span>Complete Build Kit</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/10 text-xs">
              <div className="p-2.5 bg-black/20 rounded-xl">
                <span className="text-[10px] text-emerald-300 block font-bold uppercase">Package ID</span>
                <span className="font-mono text-slate-200 text-[11px]">com.likart.fooddelivery</span>
              </div>
              <div className="p-2.5 bg-black/20 rounded-xl">
                <span className="text-[10px] text-emerald-300 block font-bold uppercase">Target SDK</span>
                <span className="font-mono text-slate-200 text-[11px]">Android 14 (API 34)</span>
              </div>
              <div className="p-2.5 bg-black/20 rounded-xl">
                <span className="text-[10px] text-emerald-300 block font-bold uppercase">Store Format</span>
                <span className="font-mono text-slate-200 text-[11px]">Google Play Bundle (.aab)</span>
              </div>
              <div className="p-2.5 bg-black/20 rounded-xl">
                <span className="text-[10px] text-emerald-300 block font-bold uppercase">Distribution</span>
                <span className="font-mono text-slate-200 text-[11px]">Play Store &amp; Sideload</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <h4 className="font-heading font-black text-base text-slate-900 mb-1">
              Data &amp; Financial Reports Export
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Download standard CSV spreadsheets for accounting, reconciliation, and tax filings
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <a
                href="/likart-food-release.aab"
                download="likart-food-release.aab"
                className="p-5 bg-gradient-to-br from-slate-900 to-emerald-950 text-white border-2 border-emerald-500/50 hover:border-emerald-400 rounded-2xl text-left space-y-2 transition group shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <Sparkles className="w-6 h-6 text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full">
                    Play Console
                  </span>
                </div>
                <h4 className="font-bold text-sm text-white">Google Play (.aab)</h4>
                <p className="text-xs text-slate-300">Official Android App Bundle for Google Play Console submission.</p>
                <span className="text-xs text-emerald-300 font-bold block pt-1 group-hover:underline">
                  Download likart-food-release.aab →
                </span>
              </a>

              <a
                href="/likart-food.apk"
                download="likart-food.apk"
                className="p-5 bg-emerald-50 border-2 border-emerald-300 hover:border-emerald-500 rounded-2xl text-left space-y-2 transition group"
              >
                <Smartphone className="w-6 h-6 text-emerald-700" />
                <h4 className="font-bold text-sm text-slate-900">Android APK (.apk)</h4>
                <p className="text-xs text-slate-600">Compiled APK binary for direct phone sideload &amp; testing.</p>
                <span className="text-xs text-emerald-700 font-bold block pt-1 group-hover:underline">
                  Download likart-food.apk →
                </span>
              </a>

              <button
                onClick={() => handleExportCSV('orders')}
                className="p-5 bg-slate-50 border border-slate-200 hover:border-orange-400 rounded-2xl text-left space-y-2 transition group"
              >
                <ShoppingBag className="w-6 h-6 text-orange-600" />
                <h4 className="font-bold text-sm text-slate-900">Orders & Sales Report</h4>
                <p className="text-xs text-slate-500">All customer orders with item totals, GST, and status.</p>
                <span className="text-xs text-orange-600 font-bold block pt-1 group-hover:underline">
                  Download Orders.csv →
                </span>
              </button>

            <button
              onClick={() => handleExportCSV('payouts')}
              className="p-5 bg-slate-50 border border-slate-200 hover:border-emerald-400 rounded-2xl text-left space-y-2 transition group"
            >
              <DollarSign className="w-6 h-6 text-emerald-600" />
              <h4 className="font-bold text-sm text-slate-900">Partner Settlements Report</h4>
              <p className="text-xs text-slate-500">Restaurant and rider payout history with bank transfer IDs.</p>
              <span className="text-xs text-emerald-600 font-bold block pt-1 group-hover:underline">
                Download Settlements.csv →
              </span>
            </button>

            <button
              onClick={() => {
                const martOrders = orders.filter(
                  (o) =>
                    o.restaurantId === 'likart-mart-hub-01' ||
                    o.restaurantName?.toLowerCase().includes('mart') ||
                    o.restaurantName?.toLowerCase().includes('dark store') ||
                    o.items.some((i) => i.menuItemId.startsWith('qc-'))
                );
                exportMartTallyReportToPDF({
                  orders: martOrders.length > 0 ? martOrders : orders,
                  darkStores,
                  categories: [],
                  items: martProducts || [],
                  periodScope: 'all',
                  podFilter: 'all',
                  generatedBy: 'Likart Super Admin Command Center',
                });
                addNotification(
                  'Tally PDF Generated',
                  'Likart Mart TallyPrime & Tally.ERP 9 double-entry financial report downloaded.',
                  'order'
                );
              }}
              className="p-5 bg-gradient-to-br from-teal-50 to-emerald-50 border-2 border-teal-300 hover:border-teal-500 rounded-2xl text-left space-y-2 transition group shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <FileSpreadsheet className="w-6 h-6 text-teal-800" />
                <span className="text-[10px] bg-teal-200/80 text-teal-950 font-black px-2 py-0.5 rounded-full uppercase">
                  Tally.ERP 9 / Prime
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">Likart Mart Tally Reports (.pdf)</h4>
              <p className="text-xs text-slate-600">Official double-entry trial balance, Day Book vouchers, stock valuation &amp; GST ledger.</p>
              <span className="text-xs text-teal-700 font-bold block pt-1 group-hover:underline">
                Download Tally Report PDF →
              </span>
            </button>

            {!isFranchiseAdmin ? (
              <button
                onClick={() => handleExportCSV('franchises')}
                className="p-5 bg-slate-50 border border-slate-200 hover:border-amber-400 rounded-2xl text-left space-y-2 transition group"
              >
                <Building2 className="w-6 h-6 text-amber-600" />
                <h4 className="font-bold text-sm text-slate-900">Franchise Network Report</h4>
                <p className="text-xs text-slate-500">Detailed list of territorial franchises and royalty commissions.</p>
                <span className="text-xs text-amber-600 font-bold block pt-1 group-hover:underline">
                  Download Franchises.csv →
                </span>
              </button>
            ) : (
              <div className="p-5 bg-slate-50/60 border border-slate-200/80 rounded-2xl text-left space-y-2 opacity-60 cursor-not-allowed">
                <div className="flex items-center justify-between">
                  <Building2 className="w-6 h-6 text-slate-400" />
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-600" />
                    <span>Super Admin Only</span>
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-600">Franchise Network Report</h4>
                <p className="text-xs text-slate-400">Download disabled. Franchise territory network reports are restricted to Super Admin.</p>
              </div>
            )}
          </div>
        </div>

          {/* Dedicated Statement of Account / Payout Reports Section */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h4 className="font-heading font-black text-base text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <span>Statement of Account & Payout Reports (Excel & PDF)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generate Daily, Weekly, and Monthly Statements for any Restaurant or Delivery Partner with executive summary KPIs, payout disbursement breakup, and itemized order-level audit view.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Restaurant Statements */}
              <div className="p-5 bg-gradient-to-br from-emerald-50/70 to-teal-50/40 border border-emerald-200/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <Store className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Vendor Audits
                  </span>
                </div>
                <div>
                  <h5 className="font-heading font-black text-sm text-slate-900">
                    Restaurant Statements of Account
                  </h5>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Daily, weekly & monthly reports with gross food sales, commission calculations, settled payouts, and line-item order view.
                  </p>
                </div>
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setReportModalEntityType('restaurant');
                      setReportModalEntityId('all');
                      setIsStatementReportModalOpen(true);
                    }}
                    className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Generate Restaurant Statements (Excel / PDF)</span>
                  </button>
                </div>
              </div>

              {/* Delivery Partner Statements */}
              <div className="p-5 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 border border-blue-200/80 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <Bike className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 bg-blue-100/90 px-2.5 py-0.5 rounded-full border border-blue-200">
                    Fleet Audits
                  </span>
                </div>
                <div>
                  <h5 className="font-heading font-black text-sm text-slate-900">
                    Delivery Partner Statements of Account
                  </h5>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Daily, weekly & monthly rider statements with completed deliveries, distance pay, tips, settled payouts, and trip-by-trip log.
                  </p>
                </div>
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setReportModalEntityType('delivery');
                      setReportModalEntityId('all');
                      setIsStatementReportModalOpen(true);
                    }}
                    className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Generate Rider Statements (Excel / PDF)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 15. ANDROID APP & GOOGLE PLAY STORE (.AAB) TAB */}
      {activeTab === 'android_app' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Banner */}
          <div className="p-6 bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white rounded-3xl border border-emerald-700/50 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Smartphone className="w-8 h-8 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-300" />
                      <span>Google Play Console Ready</span>
                    </span>
                    <span className="text-[10px] font-bold text-teal-300 bg-teal-900/60 px-2.5 py-0.5 rounded-full border border-teal-500/30">
                      Target SDK 34 (Android 14 &amp; 15)
                    </span>
                  </div>
                  <h3 className="font-heading font-black text-2xl text-white mt-1">
                    Google Play Store (.aab) &amp; Android Packages Hub
                  </h3>
                  <p className="text-xs text-emerald-100/80 max-w-2xl leading-relaxed mt-1">
                    Download the official Google Play Store Android App Bundle (<code>.aab</code>) for Play Console submission, get standalone compiled <code>.apk</code> binaries for testing, or export the complete Android Studio build kit.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <a
                  href="/likart-food-release.aab"
                  download="likart-food-release.aab"
                  className="px-5 py-3 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 active:scale-95"
                >
                  <Download className="w-4 h-4 fill-slate-950 text-slate-950" />
                  <span>Download Play Store (.aab)</span>
                </a>

                <a
                  href="/likart-food.apk"
                  download="likart-food.apk"
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition flex items-center gap-2 active:scale-95"
                >
                  <Smartphone className="w-4 h-4 text-emerald-300" />
                  <span>Download APK (.apk)</span>
                </a>

                <button
                  type="button"
                  onClick={() => setIsAndroidApkModalOpen(true)}
                  className="px-4 py-3 bg-slate-900/80 hover:bg-slate-800 text-emerald-300 font-bold text-xs rounded-xl border border-emerald-500/30 transition flex items-center gap-2 active:scale-95"
                >
                  <Layers className="w-4 h-4 text-emerald-300" />
                  <span>Complete Build Kit</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10 text-xs">
              <div className="p-3 bg-black/25 rounded-2xl">
                <span className="text-[10px] text-emerald-300 block font-bold uppercase tracking-wider">Package ID</span>
                <span className="font-mono text-white text-xs font-bold">com.likart.fooddelivery</span>
              </div>
              <div className="p-3 bg-black/25 rounded-2xl">
                <span className="text-[10px] text-emerald-300 block font-bold uppercase tracking-wider">Android Target</span>
                <span className="font-mono text-white text-xs font-bold">API 34 (Android 14+)</span>
              </div>
              <div className="p-3 bg-black/25 rounded-2xl">
                <span className="text-[10px] text-emerald-300 block font-bold uppercase tracking-wider">Bundle Format</span>
                <span className="font-mono text-white text-xs font-bold">Android App Bundle (.aab)</span>
              </div>
              <div className="p-3 bg-black/25 rounded-2xl">
                <span className="text-[10px] text-emerald-300 block font-bold uppercase tracking-wider">Distribution</span>
                <span className="font-mono text-white text-xs font-bold">Google Play Console</span>
              </div>
            </div>
          </div>

          {/* 3 Core Package Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Official .aab */}
            <div className="bg-white p-6 rounded-3xl border-2 border-emerald-500 shadow-md space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Sparkles className="w-6 h-6 text-emerald-600" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2.5 py-0.5 rounded-full">
                    Official .aab
                  </span>
                </div>
                <div>
                  <h4 className="font-heading font-black text-lg text-slate-900">
                    Google Play Store .aab Package
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Mandatory format for all new Google Play Store releases. Optimized with dynamic feature splits for minimal download size on customer phones.
                  </p>
                </div>
                <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="flex justify-between"><span>File:</span> <strong className="font-mono">likart-food-release.aab</strong></div>
                  <div className="flex justify-between"><span>Signing:</span> <strong>Production Release Key</strong></div>
                  <div className="flex justify-between"><span>Target:</span> <strong>Google Play Console</strong></div>
                </div>
              </div>

              <a
                href="/likart-food-release.aab"
                download="likart-food-release.aab"
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Download .aab Bundle</span>
              </a>
            </div>

            {/* 2. Standalone All-in-One APK */}
            <div className="bg-white p-6 rounded-3xl border-2 border-indigo-500 shadow-md space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                    <Smartphone className="w-6 h-6 text-indigo-600" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-2.5 py-0.5 rounded-full">
                    All 6 Portals in 1 APK
                  </span>
                </div>
                <div>
                  <h4 className="font-heading font-black text-lg text-slate-900">
                    Real All-in-One APK (.apk)
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Single pre-compiled real Android package containing all 6 portals (Food, Quick Mart, Kitchen, Fleet, Dark Store Pod, Super Admin) with instant switching and offline support.
                  </p>
                </div>
                <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="flex justify-between"><span>File:</span> <strong className="font-mono text-indigo-700">likart-all-portals.apk</strong></div>
                  <div className="flex justify-between"><span>Portals:</span> <strong>All 6 Ecosystem Portals</strong></div>
                  <div className="flex justify-between"><span>Install:</span> <strong>Direct Sideload / No Google Play Needed</strong></div>
                </div>
              </div>

              <div className="space-y-2">
                <a
                  href="/likart-all-portals.apk"
                  download="likart-all-portals.apk"
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download All-in-One Real APK</span>
                </a>
                <a
                  href="/likart-food.apk"
                  download="likart-food.apk"
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Download Food Store APK Only</span>
                </a>
              </div>
            </div>

            {/* 3. Complete Build Kit */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <Layers className="w-6 h-6 text-amber-600" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                    Full Source Kit
                  </span>
                </div>
                <div>
                  <h4 className="font-heading font-black text-lg text-slate-900">
                    Complete Android Build Kit (.zip)
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Includes <code>AndroidManifest.xml</code>, Gradle scripts, keystore tools, <code>assetlinks.json</code>, Bubblewrap config, and step-by-step publishing instructions.
                  </p>
                </div>
                <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="flex justify-between"><span>Contains:</span> <strong>.aab, .apk &amp; Gradle scripts</strong></div>
                  <div className="flex justify-between"><span>IDE:</span> <strong>Android Studio / CLI</strong></div>
                  <div className="flex justify-between"><span>Guide:</span> <strong>Google Play Submission Guide</strong></div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAndroidApkModalOpen(true)}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 active:scale-95"
              >
                <Layers className="w-4 h-4" />
                <span>Open Full Build Kit Hub</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 16. DEVICE LINK, QR & SHARE HUB */}
      {activeTab === 'universal_link' && (
        <DeviceLinkAdminHub />
      )}

      {/* ALL MODALS */}
      <RestaurantModal
        isOpen={restaurantModal.isOpen}
        onClose={() => setRestaurantModal({ isOpen: false, mode: 'add' })}
        mode={restaurantModal.mode}
        restaurant={restaurantModal.data}
        zones={zones}
        onSave={(data) => {
          if (restaurantModal.mode === 'add') {
            addRestaurant(data);
          } else if (restaurantModal.data) {
            updateRestaurant(restaurantModal.data.id, data);
          }
          persistAllDataToPermanentStorage();
        }}
      />

      <RiderModal
        isOpen={riderModal.isOpen}
        onClose={() => setRiderModal({ isOpen: false, mode: 'add' })}
        mode={riderModal.mode}
        rider={riderModal.data}
        zones={zones}
        onSave={(data) => {
          if (riderModal.mode === 'add') {
            addDeliveryPartner(data);
          } else if (riderModal.data) {
            updateDeliveryPartner(riderModal.data.id, data);
          }
          persistAllDataToPermanentStorage();
        }}
      />

      <ZoneModal
        isOpen={zoneModal.isOpen}
        onClose={() => setZoneModal({ isOpen: false, mode: 'add' })}
        mode={zoneModal.mode}
        zone={zoneModal.data}
        onSave={(data) => {
          if (isFranchiseAdmin) {
            addNotification('Access Denied', 'Franchise Administrators cannot modify delivery zones.', 'system');
            return;
          }
          if (zoneModal.mode === 'add') {
            addZone(data);
          } else if (zoneModal.data) {
            updateZone(zoneModal.data.id, data);
          }
          persistAllDataToPermanentStorage();
        }}
      />

      <GatewayModal
        isOpen={gatewayModal.isOpen}
        onClose={() => setGatewayModal({ isOpen: false, mode: 'add' })}
        mode={gatewayModal.mode}
        gateway={gatewayModal.data}
        onSave={(data) => {
          if (isFranchiseAdmin) {
            addNotification('Access Denied', 'Franchise Administrators cannot modify payment gateways.', 'system');
            return;
          }
          if (gatewayModal.mode === 'add') {
            addPaymentGateway(data);
          } else if (gatewayModal.data) {
            updatePaymentGateway(gatewayModal.data.id, data);
          }
          persistAllDataToPermanentStorage();
        }}
      />

      <CouponModal
        isOpen={couponModal.isOpen}
        onClose={() => setCouponModal({ isOpen: false, mode: 'add' })}
        mode={couponModal.mode}
        coupon={couponModal.data}
        onSave={(data) => {
          if (isFranchiseAdmin) {
            addNotification('Access Denied', 'Franchise Administrators cannot modify coupons.', 'system');
            return;
          }
          if (couponModal.mode === 'add') {
            addCoupon(data);
          } else if (couponModal.data) {
            updateCoupon(couponModal.data.id, data);
          }
          persistAllDataToPermanentStorage();
        }}
      />

      <BannerModal
        isOpen={bannerModal.isOpen}
        onClose={() => setBannerModal({ isOpen: false, mode: 'add' })}
        mode={bannerModal.mode}
        banner={bannerModal.data}
        onSave={(data) => {
          if (isFranchiseAdmin) {
            addNotification('Access Denied', 'Franchise Administrators cannot modify banners.', 'system');
            return;
          }
          if (bannerModal.mode === 'add') {
            addBanner(data);
          } else if (bannerModal.data) {
            updateBanner(bannerModal.data.id, data);
          }
          persistAllDataToPermanentStorage();
        }}
      />

      <FranchiseModal
        isOpen={franchiseModal.isOpen}
        onClose={() => setFranchiseModal({ isOpen: false, mode: 'add' })}
        mode={franchiseModal.mode}
        franchise={franchiseModal.data}
        zones={zones}
        onSave={(data) => {
          if (isFranchiseAdmin) {
            addNotification('Access Denied', 'Franchise Administrators cannot modify franchises.', 'system');
            return;
          }
          if (franchiseModal.mode === 'add') {
            addFranchise(data);
          } else if (franchiseModal.data) {
            updateFranchise(franchiseModal.data.id, data);
          }
          persistAllDataToPermanentStorage();
        }}
      />

      {/* Super Admin: Franchise Admin User ID & Password Change Modal */}
      {franchiseCredentialsModal.isOpen && franchiseCredentialsModal.franchise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base">
                    Franchise Admin Credentials
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {franchiseCredentialsModal.franchise.franchiseName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFranchiseCredentialsModal({ ...franchiseCredentialsModal, isOpen: false })}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (isFranchiseAdmin) {
                  addNotification('Access Denied', 'Franchise Administrators cannot change franchise credentials.', 'system');
                  setFranchiseCredentialsModal({ ...franchiseCredentialsModal, isOpen: false });
                  return;
                }
                if (!franchiseCredentialsModal.userId.trim()) {
                  alert('Please enter a valid Franchise Admin User ID.');
                  return;
                }
                if (!franchiseCredentialsModal.password.trim()) {
                  alert('Please enter a valid password.');
                  return;
                }
                updateFranchiseCredentials(
                  franchiseCredentialsModal.franchise!.id,
                  franchiseCredentialsModal.userId.trim(),
                  franchiseCredentialsModal.password.trim()
                );
                setFranchiseCredentialsModal({ ...franchiseCredentialsModal, isOpen: false });
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                <span className="font-bold block">Super Admin Access Control:</span>
                <span className="text-[11px] text-amber-800">
                  Add or change the login username/ID and password for this franchise administrator.
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Franchise Admin User ID / Login Username *
                </label>
                <input
                  type="text"
                  required
                  value={franchiseCredentialsModal.userId}
                  onChange={(e) =>
                    setFranchiseCredentialsModal({
                      ...franchiseCredentialsModal,
                      userId: e.target.value,
                    })
                  }
                  placeholder="e.g. fr_south_blr"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-800 focus:outline-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">
                    Franchise Admin Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
                      let gen = '';
                      for (let i = 0; i < 10; i++) gen += chars.charAt(Math.floor(Math.random() * chars.length));
                      setFranchiseCredentialsModal({
                        ...franchiseCredentialsModal,
                        password: gen,
                      });
                    }}
                    className="text-[11px] font-bold text-amber-600 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generate Strong Password</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={franchiseCredentialsModal.showPass ? 'text' : 'password'}
                    required
                    value={franchiseCredentialsModal.password}
                    onChange={(e) =>
                      setFranchiseCredentialsModal({
                        ...franchiseCredentialsModal,
                        password: e.target.value,
                      })
                    }
                    placeholder="Enter new password"
                    className="w-full p-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-800 focus:outline-amber-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFranchiseCredentialsModal({
                        ...franchiseCredentialsModal,
                        showPass: !franchiseCredentialsModal.showPass,
                      })
                    }
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {franchiseCredentialsModal.showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `Franchise Admin Login:\nUser ID: ${franchiseCredentialsModal.userId}\nPassword: ${franchiseCredentialsModal.password}`
                    );
                    addNotification('Credentials Copied', 'Login ID & password copied to clipboard.', 'system');
                  }}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFranchiseCredentialsModal({
                        ...franchiseCredentialsModal,
                        isOpen: false,
                      })
                    }
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-md transition active:scale-95"
                  >
                    Save Credentials
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Super Admin: Franchise Deactivate Confirmation Modal */}
      {franchiseDeactivateModal.isOpen && franchiseDeactivateModal.franchise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl">
                  <Power className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base">
                    Deactivate Food Franchise
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {franchiseDeactivateModal.franchise.franchiseName} ({franchiseDeactivateModal.franchise.territory})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFranchiseDeactivateModal({ isOpen: false, franchise: null, reason: '' })}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                toggleFranchiseStatus(
                  franchiseDeactivateModal.franchise!.id,
                  franchiseDeactivateModal.reason || 'Deactivated by Likart Food Super Admin'
                );
                setFranchiseDeactivateModal({ isOpen: false, franchise: null, reason: '' });
                persistAllDataToPermanentStorage();
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900">
                <span className="font-bold block">Likart Food Super Admin Control:</span>
                <span className="text-[11px] text-rose-800">
                  Deactivating this franchise immediately suspends access for the franchise administrator and places associated territory operations on administrative hold.
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Select Pre-Set Reason:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Annual Agreement & Compliance Review',
                    'Royalty Payment & Settlement Delay',
                    'Food Safety & Quality Non-Compliance',
                    'Territory Restructuring',
                    'Partner Requested Suspension',
                  ].map((pre) => (
                    <button
                      key={pre}
                      type="button"
                      onClick={() =>
                        setFranchiseDeactivateModal({
                          ...franchiseDeactivateModal,
                          reason: pre,
                        })
                      }
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                        franchiseDeactivateModal.reason === pre
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
                  value={franchiseDeactivateModal.reason}
                  onChange={(e) =>
                    setFranchiseDeactivateModal({
                      ...franchiseDeactivateModal,
                      reason: e.target.value,
                    })
                  }
                  placeholder="e.g. Failure to submit Q3 hygiene audit certifications and royalty settlement..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-rose-500 focus:bg-white resize-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFranchiseDeactivateModal({ isOpen: false, franchise: null, reason: '' })}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5"
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>Confirm Deactivate Franchise</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <GoogleMapsKeyModal
        isOpen={mapsKeyModal.isOpen}
        onClose={() => setMapsKeyModal({ isOpen: false, mode: 'add' })}
        mode={mapsKeyModal.mode}
        keyItem={mapsKeyModal.data}
        onSave={(data) => {
          if (isFranchiseAdmin) {
            addNotification('Access Denied', 'Franchise Administrators cannot modify Google Maps API keys.', 'system');
            return;
          }
          if (mapsKeyModal.mode === 'add') {
            addGoogleMapsKey(data);
          } else if (mapsKeyModal.data) {
            updateGoogleMapsKey(mapsKeyModal.data.id, data);
          }
          persistAllDataToPermanentStorage();
        }}
      />

      <AdminUserModal
        isOpen={adminUserModal.isOpen}
        onClose={() => setAdminUserModal({ isOpen: false, mode: 'add' })}
        mode={adminUserModal.mode}
        adminUser={adminUserModal.data}
        onSave={(data) => {
          if (isFranchiseAdmin) {
            addNotification('Access Denied', 'Franchise Administrators cannot modify administrator roles.', 'system');
            return;
          }
          if (adminUserModal.mode === 'add') {
            addAdminUser(data);
          } else if (adminUserModal.data) {
            updateAdminUser(adminUserModal.data.id, data);
          }
          persistAllDataToPermanentStorage();
        }}
      />

      <CuisineModal
        isOpen={cuisineModal.isOpen}
        onClose={() => setCuisineModal({ isOpen: false, mode: 'add', data: null })}
        mode={cuisineModal.mode}
        cuisine={cuisineModal.data}
        onSave={(data) => {
          if (isFranchiseAdmin) {
            addNotification('Access Denied', 'Franchise Administrators cannot modify master cuisines.', 'system');
            return;
          }
          if (cuisineModal.mode === 'add') {
            addCuisine(data);
          } else if (cuisineModal.data) {
            updateCuisine(cuisineModal.data.id, data);
          }
          // Permanent storage guarantee
          persistAllDataToPermanentStorage();
        }}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={() => {
          const lower = deleteModal.title.toLowerCase();
          if (
            isFranchiseAdmin &&
            (lower.includes('zone') ||
             lower.includes('cuisine') ||
             lower.includes('franchise') ||
             lower.includes('admin') ||
             lower.includes('order') ||
             lower.includes('gateway') ||
             lower.includes('coupon') ||
             lower.includes('banner') ||
             lower.includes('company') ||
             lower.includes('policy') ||
             lower.includes('document') ||
             lower.includes('map'))
          ) {
            addNotification('Access Denied', 'Franchise Administrators cannot perform delete actions on this entity.', 'system');
            setDeleteModal({ ...deleteModal, isOpen: false });
            return;
          }
          deleteModal.onConfirm();
          persistAllDataToPermanentStorage();
        }}
        title={deleteModal.title}
        message={deleteModal.message}
        itemName={deleteModal.itemName}
      />

      {/* Super Admin: Company Policy Page Add/Edit Modal */}
      <CompanyPageModal
        isOpen={customPageModal.isOpen}
        onClose={() => setCustomPageModal({ ...customPageModal, isOpen: false })}
        mode={customPageModal.mode}
        page={customPageModal.data}
        onSave={(data) => {
          if (isFranchiseAdmin || !isSuperAdmin) {
            addNotification('Access Denied', 'Super Admin required to create or edit company documents.', 'system');
            return;
          }
          if (customPageModal.mode === 'add') {
            const newDoc: CustomCompanyPage = {
              id: `cp-${Date.now()}`,
              ...data,
              createdAt: new Date().toISOString(),
            };
            setCompanyPagesData((prev) => {
              const updated = {
                ...prev,
                customPages: [...(prev.customPages || []), newDoc],
              };
              updateCompanyPages(updated);
              return updated;
            });
            setCompanyPageSubTab(newDoc.slug);
            addNotification('Company Document Created', `"${data.title}" added and published.`, 'system');
          } else if (customPageModal.data) {
            const docId = customPageModal.data.id;
            setCompanyPagesData((prev) => {
              const updated = {
                ...prev,
                customPages: (prev.customPages || []).map((p) =>
                  p.id === docId ? { ...p, ...data } : p
                ),
              };
              updateCompanyPages(updated);
              return updated;
            });
            addNotification('Company Document Updated', `"${data.title}" updated and published.`, 'system');
          }
          persistAllDataToPermanentStorage();
        }}
      />

      {/* Quick Modal: Add Custom Clause / Section */}
      {addClauseModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-black text-slate-900 text-base">
                Add New {addClauseModal.targetPage === 'refund' ? 'Refund Rule' : 'Policy Clause / Section'}
              </h3>
              <button
                onClick={() => setAddClauseModal({ ...addClauseModal, isOpen: false })}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Section / Clause Title</label>
                <input
                  type="text"
                  value={addClauseModal.title}
                  onChange={(e) => setAddClauseModal({ ...addClauseModal, title: e.target.value })}
                  placeholder="e.g. 4. Special Escalations & Grievance Desk"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-blue-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Clause Content</label>
                <textarea
                  rows={5}
                  value={addClauseModal.content}
                  onChange={(e) => setAddClauseModal({ ...addClauseModal, content: e.target.value })}
                  placeholder="Enter detailed policy wording, SLA terms, or disclosures..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-blue-500 font-sans"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAddClauseModal({ ...addClauseModal, isOpen: false })}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleAddCustomSection(
                    addClauseModal.targetPage,
                    addClauseModal.title,
                    addClauseModal.content
                  );
                  setAddClauseModal({ ...addClauseModal, isOpen: false, title: '', content: '' });
                }}
                disabled={!addClauseModal.title.trim() || !addClauseModal.content.trim()}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md disabled:opacity-50"
              >
                Add Clause
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Modal: Add Metric Highlight Card */}
      {addStatModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-black text-slate-900 text-base">
                Add Metric Highlight Card
              </h3>
              <button
                onClick={() => setAddStatModal({ ...addStatModal, isOpen: false })}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Metric Number / Stat</label>
                <input
                  type="text"
                  value={addStatModal.number}
                  onChange={(e) => setAddStatModal({ ...addStatModal, number: e.target.value })}
                  placeholder="e.g. 50,000+ or 99.9%"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-blue-600 text-sm focus:bg-white focus:outline-blue-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Metric Description Label</label>
                <input
                  type="text"
                  value={addStatModal.label}
                  onChange={(e) => setAddStatModal({ ...addStatModal, label: e.target.value })}
                  placeholder="e.g. Verified deliveries completed across zones"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAddStatModal({ ...addStatModal, isOpen: false })}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleAddCustomStat(addStatModal.number, addStatModal.label);
                  setAddStatModal({ ...addStatModal, isOpen: false, number: '', label: '' });
                }}
                disabled={!addStatModal.number.trim() || !addStatModal.label.trim()}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md disabled:opacity-50"
              >
                Add Metric
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Modal: Add Support Channel */}
      {addChannelModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-black text-slate-900 text-base">
                Add Support Channel / Regional Branch
              </h3>
              <button
                onClick={() => setAddChannelModal({ ...addChannelModal, isOpen: false })}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Channel / Desk Title</label>
                <input
                  type="text"
                  value={addChannelModal.title}
                  onChange={(e) => setAddChannelModal({ ...addChannelModal, title: e.target.value })}
                  placeholder="e.g. WhatsApp Fast Care / Franchise Desk"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-blue-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Contact Detail / Address / Number</label>
                <input
                  type="text"
                  value={addChannelModal.detail}
                  onChange={(e) => setAddChannelModal({ ...addChannelModal, detail: e.target.value })}
                  placeholder="e.g. +91 99999 12345 or desk@likartfood.com"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-blue-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Subtext / Hours / Notes</label>
                <input
                  type="text"
                  value={addChannelModal.subtext}
                  onChange={(e) => setAddChannelModal({ ...addChannelModal, subtext: e.target.value })}
                  placeholder="e.g. Mon-Sat 9 AM to 9 PM • Instant Chat"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAddChannelModal({ ...addChannelModal, isOpen: false })}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleAddCustomChannel(
                    addChannelModal.title,
                    addChannelModal.detail,
                    addChannelModal.subtext
                  );
                  setAddChannelModal({ ...addChannelModal, isOpen: false, title: '', detail: '', subtext: '' });
                }}
                disabled={!addChannelModal.title.trim() || !addChannelModal.detail.trim()}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md disabled:opacity-50"
              >
                Add Support Channel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Super Admin: Restaurant KYC & Documents Inspection Modal */}
      {inspectRestaurantDocs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black font-heading">
                    KYC & Statutory Compliance: {inspectRestaurantDocs.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Owner: {inspectRestaurantDocs.ownerName} • Phone: {inspectRestaurantDocs.phone} • Status:{' '}
                    <span className="uppercase font-bold text-emerald-400">
                      {inspectRestaurantDocs.status}
                    </span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInspectRestaurantDocs(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. Restaurant Photo */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">1. Outlet Photo</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-full">
                      Attached
                    </span>
                  </div>
                  <div className="h-32 rounded-xl overflow-hidden bg-slate-200 border border-slate-200">
                    <img
                      src={
                        inspectRestaurantDocs.kyc.restaurantPhotoUrl ||
                        inspectRestaurantDocs.bannerImage ||
                        inspectRestaurantDocs.logo
                      }
                      alt="Outlet"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">Storefront facade & dining ambiance</p>
                </div>

                {/* 2. FSSAI Certificate */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">2. FSSAI Certificate</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  </div>
                  <div className="h-32 rounded-xl overflow-hidden bg-white border border-slate-200 p-2.5 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400">License Number</span>
                      <p className="font-mono font-bold text-slate-900 text-xs">
                        {inspectRestaurantDocs.kyc.fssaiNumber || '11223344009871'}
                      </p>
                    </div>
                    <img
                      src={
                        inspectRestaurantDocs.kyc.fssaiDocUrl ||
                        'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80'
                      }
                      alt="FSSAI"
                      className="h-16 w-full object-cover rounded-lg"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">Food Safety Authority Registration</p>
                </div>

                {/* 3. GSTIN / UDYAM Certificate */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">3. GSTIN / UDYAM</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  </div>
                  <div className="h-32 rounded-xl overflow-hidden bg-white border border-slate-200 p-2.5 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400">GSTIN / MSME</span>
                      <p className="font-mono font-bold text-slate-900 text-xs">
                        {inspectRestaurantDocs.kyc.gstinNumber || '29ABCDE1234F1Z5'}
                      </p>
                    </div>
                    <img
                      src={
                        inspectRestaurantDocs.kyc.gstDocUrl ||
                        inspectRestaurantDocs.kyc.udyamDocUrl ||
                        'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80'
                      }
                      alt="GSTIN"
                      className="h-16 w-full object-cover rounded-lg"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">
                    UDYAM: {inspectRestaurantDocs.kyc.udyamNumber || 'N/A'}
                  </p>
                </div>

                {/* 4. Entity PAN Card */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">4. PAN Card</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  </div>
                  <div className="h-32 rounded-xl overflow-hidden bg-white border border-slate-200 p-2.5 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400">PAN Number</span>
                      <p className="font-mono font-bold text-slate-900 text-xs">
                        {inspectRestaurantDocs.kyc.panNumber || 'ABCDE1234F'}
                      </p>
                    </div>
                    <img
                      src={
                        inspectRestaurantDocs.kyc.panDocUrl ||
                        'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&auto=format&fit=crop&q=80'
                      }
                      alt="PAN"
                      className="h-16 w-full object-cover rounded-lg"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">Entity Income Tax Permanent Account</p>
                </div>

                {/* 5. Aadhaar Card */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">5. Aadhaar Card</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  </div>
                  <div className="h-32 rounded-xl overflow-hidden bg-white border border-slate-200 p-2.5 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400">Signatory Aadhaar</span>
                      <p className="font-mono font-bold text-slate-900 text-xs">
                        {inspectRestaurantDocs.kyc.aadhaarNumber || '7829 4019 2831'}
                      </p>
                    </div>
                    <img
                      src={
                        inspectRestaurantDocs.kyc.aadhaarDocUrl ||
                        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'
                      }
                      alt="Aadhaar"
                      className="h-16 w-full object-cover rounded-lg"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">Government ID for Owner Identity</p>
                </div>

                {/* 6. Bank Account Details */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">6. Bank Account</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  </div>
                  <div className="h-32 rounded-xl bg-white border border-slate-200 p-2.5 flex flex-col justify-between text-[11px]">
                    <div>
                      <p className="font-bold text-slate-900">{inspectRestaurantDocs.kyc.bankAccount?.bankName}</p>
                      <p className="font-mono text-slate-600 mt-0.5">
                        A/C: {inspectRestaurantDocs.kyc.bankAccount?.accountNumber}
                      </p>
                      <p className="font-mono text-slate-400 text-[10px]">
                        IFSC: {inspectRestaurantDocs.kyc.bankAccount?.ifscCode}
                      </p>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">
                      Holder: {inspectRestaurantDocs.kyc.bankAccount?.accountHolderName}
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-500">Direct Weekly Commercial Payouts</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">Super Admin Compliance Review</span>
              <div className="flex items-center gap-2">
                {inspectRestaurantDocs.status === 'pending' && (
                  <button
                    onClick={() => {
                      updateRestaurantStatus(inspectRestaurantDocs.id, 'approved');
                      setInspectRestaurantDocs(null);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition"
                  >
                    Approve Restaurant KYC
                  </button>
                )}
                <button
                  onClick={() => setInspectRestaurantDocs(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Super Admin: Delivery Partner KYC & Documents Inspection Modal */}
      {inspectRiderDocs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black font-heading">
                    Rider Identity & Fleet KYC: {inspectRiderDocs.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Phone: {inspectRiderDocs.phone} • Vehicle: {inspectRiderDocs.kyc.vehicleType} ({inspectRiderDocs.kyc.vehicleNumber}) • Status:{' '}
                    <span className="uppercase font-bold text-blue-400">{inspectRiderDocs.status}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInspectRiderDocs(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Live Selfie */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">1. Live Selfie</span>
                    <span className="text-[10px] text-blue-700 bg-blue-100 font-bold px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  </div>
                  <div className="h-32 rounded-xl overflow-hidden bg-slate-200 border border-slate-200 flex items-center justify-center">
                    <img
                      src={
                        inspectRiderDocs.kyc.selfieUrl ||
                        inspectRiderDocs.avatar ||
                        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80'
                      }
                      alt="Live Selfie"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">Live Camera Face Verification</p>
                </div>

                {/* 2. Aadhaar Card */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">2. Aadhaar Card</span>
                    <span className="text-[10px] text-blue-700 bg-blue-100 font-bold px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  </div>
                  <div className="h-32 rounded-xl overflow-hidden bg-white border border-slate-200 p-2.5 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400">Aadhaar No</span>
                      <p className="font-mono font-bold text-slate-900 text-xs">
                        {inspectRiderDocs.kyc.aadhaarNumber || '918273645192'}
                      </p>
                    </div>
                    <img
                      src={
                        inspectRiderDocs.kyc.aadhaarDocUrl ||
                        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'
                      }
                      alt="Aadhaar"
                      className="h-16 w-full object-cover rounded-lg"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">UIDAI Identity Card Document</p>
                </div>

                {/* 3. Driving License */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">3. Driving License</span>
                    <span className="text-[10px] text-blue-700 bg-blue-100 font-bold px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  </div>
                  <div className="h-32 rounded-xl overflow-hidden bg-white border border-slate-200 p-2.5 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400">DL Number</span>
                      <p className="font-mono font-bold text-slate-900 text-xs">
                        {inspectRiderDocs.kyc.drivingLicenseNumber || 'DL-KA0120190089123'}
                      </p>
                    </div>
                    <img
                      src={
                        inspectRiderDocs.kyc.dlDocUrl ||
                        'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80'
                      }
                      alt="DL"
                      className="h-16 w-full object-cover rounded-lg"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">Motor Vehicle License</p>
                </div>

                {/* 4. Vehicle RC */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">4. Vehicle RC</span>
                    <span className="text-[10px] text-blue-700 bg-blue-100 font-bold px-2 py-0.5 rounded-full">
                      Verified
                    </span>
                  </div>
                  <div className="h-32 rounded-xl overflow-hidden bg-white border border-slate-200 p-2.5 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400">RC Plate</span>
                      <p className="font-mono font-bold text-slate-900 text-xs">
                        {inspectRiderDocs.kyc.vehicleNumber || 'KA-01-EQ-9182'}
                      </p>
                    </div>
                    <img
                      src={
                        inspectRiderDocs.kyc.rcDocUrl ||
                        'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80'
                      }
                      alt="RC"
                      className="h-16 w-full object-cover rounded-lg"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">Registration Certificate Book</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">Super Admin Fleet Verification</span>
              <div className="flex items-center gap-2">
                {inspectRiderDocs.status === 'pending' && (
                  <button
                    onClick={() => {
                      updateRiderStatus(inspectRiderDocs.id, 'approved');
                      setInspectRiderDocs(null);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition"
                  >
                    Approve Rider KYC
                  </button>
                )}
                <button
                  onClick={() => setInspectRiderDocs(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Reject Payout Request Modal */}
      {rejectPayoutModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-rose-50/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base text-slate-900">
                    Reject Payout Request
                  </h3>
                  <p className="text-xs text-slate-500">
                    Request ID: #{rejectPayoutModal.payoutId.slice(-6).toUpperCase()} • ₹{rejectPayoutModal.amount.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRejectPayoutModal({ ...rejectPayoutModal, isOpen: false })}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white/80 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Recipient Name / Outlet:
                </label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                  {rejectPayoutModal.recipientName || 'Outlet / Fleet Partner'}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Specify Rejection Reason <span className="text-rose-500">*</span>:
                </label>
                <textarea
                  rows={3}
                  value={adminRejectionReason}
                  onChange={(e) => setAdminRejectionReason(e.target.value)}
                  placeholder="e.g. Bank IFSC code mismatch or KYC verification document pending..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-rose-500 resize-none font-medium"
                />
              </div>

              {/* Quick Preset Reasons */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 block mb-1.5 uppercase">
                  Quick Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Bank account details mismatch',
                    'IFSC code invalid or unverified',
                    'KYC document reverification needed',
                    'Disputed order reconciliation pending',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAdminRejectionReason(preset)}
                      className="text-[10px] font-bold px-2.5 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 rounded-lg border border-slate-200 transition"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setRejectPayoutModal({ ...rejectPayoutModal, isOpen: false })}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!adminRejectionReason.trim()) return;
                  rejectPayout(rejectPayoutModal.payoutId, adminRejectionReason.trim());
                  setRejectPayoutModal({ ...rejectPayoutModal, isOpen: false });
                }}
                disabled={!adminRejectionReason.trim()}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statement of Account & Payout Reports Modal */}
      <StatementReportModal
        isOpen={isStatementReportModalOpen}
        onClose={() => setIsStatementReportModalOpen(false)}
        orders={orders}
        payoutRequests={payoutRequests}
        restaurants={restaurants}
        deliveryPartners={deliveryPartners}
        initialEntityType={reportModalEntityType}
        initialEntityId={reportModalEntityId}
      />

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
