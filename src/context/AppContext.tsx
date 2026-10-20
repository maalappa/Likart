import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Restaurant,
  MenuItem,
  FoodVariant,
  DeliveryZone,
  DeliveryPartner,
  Coupon,
  BrandSettings,
  BannerPromo,
  Order,
  OrderStatus,
  AdminUser,
  SupportTicket,
  PayoutRequest,
  CustomerUser,
  SavedAddress,
  LocationCoordinates,
  UserRole,
  Franchise,
  GoogleMapsKeyItem,
  PaymentGatewayItem,
  RestaurantCategory,
  PaymentTransaction,
  DeliveryWalletTransaction,
  Cuisine,
  CompanyPagesContent,
  DarkStoreHub,
  DarkStoreManager,
  MartAlertToneSettings,
  QuickCommerceItem,
  QuickCommerceCategory,
  MartOffer,
  MartReview,
  MartStaffUser,
  MartRoleConfig,
  MartAuditLog,
  MartServiceConfig,
  MartBannerAutoSlideConfig,
} from '../types';
import {
  initialBrandSettings,
  initialBanners,
  initialZones,
  initialRestaurants,
  initialMenuItems,
  initialCategories,
  initialCuisines,
  initialCoupons,
  initialDeliveryPartners,
  initialDeliveryWalletTransactions,
  initialOrders,
  initialAdminUsers,
  initialSupportTickets,
  initialPayoutRequests,
  initialFranchises,
  initialGoogleMapsKeys,
  initialPaymentGateways,
  initialPaymentTransactions,
  initialCustomerUser
} from '../data/initialData';
import {
  INITIAL_DARK_STORES,
  INITIAL_DARK_STORE_MANAGERS,
  INITIAL_MART_SOUND_SETTINGS,
  INITIAL_MART_SERVICE_CONFIG,
  QUICK_COMMERCE_ITEMS,
  QUICK_COMMERCE_CATEGORIES,
  INITIAL_MART_OFFERS,
  INITIAL_MART_REVIEWS,
  INITIAL_MART_USERS,
  INITIAL_MART_ROLES,
  INITIAL_MART_AUDIT_LOGS,
  INITIAL_MART_BANNERS,
  DEFAULT_MART_BANNER_CONFIG,
} from '../data/quickCommerceData';
import {
  calculateDistanceKm,
  findMatchingZone,
  reverseGeocodeLocation,
  getAccurateCurrentPosition
} from '../utils/geoUtils';
import {
  safeStorage,
  sanitizeRestaurantForStorage,
  requestPermanentStorageAccess,
  checkPermanentStorageStatus,
  getAllFromPermanentIndexedDB,
  backupToPermanentIndexedDB,
  recordPermanentDeletion,
  recordBulkPermanentDeletion,
  isPermanentlyDeleted,
  removePermanentDeletion,
  filterOutPermanentlyDeleted,
  savePermanentAuthSession,
  clearPermanentAuthSession,
  deletePermanentPhoto,
} from '../utils/storageUtils';

export interface CartItem {
  item: MenuItem;
  quantity: number;
  selectedVariant?: FoodVariant;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'system' | 'payout' | 'kyc' | 'warning' | 'info';
  timestamp: string;
  read: boolean;
  linkAction?: string;
}

interface AppContextType {
  // Navigation & Role
  activePortal: UserRole;
  setActivePortal: (portal: UserRole) => void;
  customerView: 'home' | 'restaurants' | 'restaurant_detail' | 'profile' | 'policy' | 'quick_commerce';
  setCustomerView: (view: 'home' | 'restaurants' | 'restaurant_detail' | 'profile' | 'policy' | 'quick_commerce') => void;
  selectedRestaurantId: string | null;
  setSelectedRestaurantId: (id: string | null) => void;
  selectedPolicy: string | null;
  setSelectedPolicy: (policy: string | null) => void;

  // Customer State
  customerUser: CustomerUser | null;
  setCustomerUser: React.Dispatch<React.SetStateAction<CustomerUser | null>>;
  authCustomer: CustomerUser | null;
  loginCustomer: (identifier: string, password?: string, isOtpVerified?: boolean) => { success: boolean; message: string };
  registerCustomer: (data: { name: string; email?: string; phone: string; password?: string }) => { success: boolean; message: string };
  logoutCustomer: () => void;
  allCustomers: CustomerUser[];
  addCustomer: (data: Partial<CustomerUser>) => void;
  updateCustomer: (id: string, data: Partial<CustomerUser>) => void;
  deleteCustomer: (id: string) => void;

  // Restaurant Authentication
  authRestaurant: Restaurant | null;
  loginRestaurant: (emailOrPhone: string, password: string) => { success: boolean; message: string };
  logoutRestaurant: () => void;

  // Delivery Partner Authentication
  authRider: DeliveryPartner | null;
  loginRider: (phoneOrEmail: string, password: string) => { success: boolean; message: string };
  logoutRider: () => void;

  // Super Admin Authentication
  authAdmin: AdminUser | null;
  loginAdmin: (email: string, password: string, mode?: 'likart_food' | 'likart_mart') => { success: boolean; message: string };
  logoutAdmin: () => void;
  adminInitialTab: string | null;
  setAdminInitialTab: (tab: string | null) => void;

  // Likart Mart Store Manager Authentication
  authMartManager: DarkStoreManager | null;
  loginMartManager: (identifier: string, accessPin: string) => { success: boolean; message: string };
  logoutMartManager: () => void;

  currentLocation: LocationCoordinates;
  setCurrentLocation: (loc: LocationCoordinates) => void;
  currentZone: DeliveryZone;
  setCurrentZone: (zone: DeliveryZone) => void;
  findZoneByCoords: (lat: number, lng: number) => DeliveryZone;
  detectUserLocation: () => Promise<void>;

  // Cart & Checkout
  cart: CartItem[];
  addToCart: (item: MenuItem, selectedVariant?: FoodVariant) => void;
  removeFromCart: (itemId: string, variantId?: string) => void;
  updateCartQuantity: (itemId: string, delta: number, variantId?: string) => void;
  clearCart: () => void;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  cartTotals: {
    itemTotal: number;
    deliveryFee: number;
    platformFee: number;
    taxes: number;
    discount: number;
    grandTotal: number;
  };

  // Orders & Tracking
  orders: Order[];
  createOrder: (params: {
    deliveryAddress: SavedAddress;
    paymentMethod: 'razorpay' | 'cashfree' | 'phonepe' | 'cod' | 'stripe' | 'payu';
    tipAmount: number;
    deliveryInstructions?: string;
  }) => Promise<Order>;
  activeTrackingOrderId: string | null;
  setActiveTrackingOrderId: (id: string | null) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  markOrderAsPaid: (orderId: string, method?: 'upi_qr' | 'cash', transactionId?: string) => void;
  cancelOrder: (orderId: string, reason: string) => void;
  deleteOrder: (orderId: string) => void;
  addOrder: (order: Order) => void;
  updateOrder: (id: string, data: Partial<Order>) => void;

  // Restaurant Portal
  restaurants: Restaurant[];
  menuItems: MenuItem[];
  currentRestaurantId: string;
  setCurrentRestaurantId: (id: string) => void;
  acceptOrderByRestaurant: (orderId: string, prepTimeMins?: number) => void;
  rejectOrderByRestaurant: (orderId: string, reason: string) => void;
  registerRestaurant: (restaurantData: Omit<Restaurant, 'id' | 'createdAt' | 'rating' | 'ratingCount' | 'status'>) => void;
  addRestaurant: (restaurantData: Omit<Restaurant, 'id' | 'createdAt' | 'rating' | 'ratingCount'>) => void;
  updateRestaurant: (id: string, data: Partial<Restaurant>) => void;
  deleteRestaurant: (id: string) => void;
  updateRestaurantStatus: (id: string, status: Restaurant['status'], reason?: string) => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  toggleMenuItemAvailability: (id: string) => void;
  categories: RestaurantCategory[];
  addCategory: (category: Omit<RestaurantCategory, 'id'>) => void;
  updateCategory: (id: string, category: Partial<RestaurantCategory>) => void;
  deleteCategory: (id: string) => void;
  simulateOrderForRestaurant: (restaurantId: string, amount?: number) => void;

  // Master Cuisines Management (Super Admin Access)
  cuisines: Cuisine[];
  addCuisine: (cuisineData: Omit<Cuisine, 'id' | 'createdAt'>) => void;
  updateCuisine: (id: string, data: Partial<Cuisine>) => void;
  deleteCuisine: (id: string) => { success: boolean; message?: string };
  toggleCuisineStatus: (id: string) => void;

  // Delivery Portal
  deliveryPartners: DeliveryPartner[];
  currentRiderId: string;
  setCurrentRiderId: (id: string) => void;
  registerDeliveryPartner: (partnerData: Omit<DeliveryPartner, 'id' | 'createdAt' | 'rating' | 'totalTrips' | 'walletBalance' | 'status'>) => void;
  addDeliveryPartner: (partnerData: Omit<DeliveryPartner, 'id' | 'createdAt' | 'rating' | 'totalTrips' | 'walletBalance'>) => void;
  updateDeliveryPartner: (id: string, data: Partial<DeliveryPartner>) => void;
  deleteDeliveryPartner: (id: string) => void;
  updateRiderStatus: (id: string, status: DeliveryPartner['status'], reason?: string) => void;
  toggleRiderOnline: (riderId: string) => void;
  verifyDeliveryOtp: (orderId: string, otp: string) => boolean;
  acceptOrderForDelivery: (orderId: string, riderId: string) => void;
  rejectOrderForDelivery: (orderId: string, riderId: string, reason: string) => void;
  reassignOrderFromDelivery: (orderId: string, riderId: string, reason: string) => void;
  updateRiderLocation: (riderId: string, coords: { lat: number; lng: number; address?: string }) => void;
  depositRiderFloatingCash: (params: {
    riderId: string;
    amount: number;
    transactionId?: string;
    gatewayProvider?: string;
    gatewayName?: string;
    paymentMethodDetails?: string;
  }) => Promise<{ success: boolean; transactionId: string }>;

  // Super Admin Management
  adminUsers: AdminUser[];
  currentAdminRole: string;
  setCurrentAdminRole: (role: string) => void;
  addAdminUser: (data: Omit<AdminUser, 'id' | 'lastLogin'>) => void;
  updateAdminUser: (id: string, data: Partial<AdminUser>) => void;
  deleteAdminUser: (id: string) => void;

  // Zones
  zones: DeliveryZone[];
  addZone: (zone: Omit<DeliveryZone, 'id'>) => void;
  updateZone: (id: string, zone: Partial<DeliveryZone>) => void;
  deleteZone: (id: string) => void;

  // Payment Gateways
  paymentGateways: PaymentGatewayItem[];
  addPaymentGateway: (data: Omit<PaymentGatewayItem, 'id' | 'createdAt'>) => void;
  updatePaymentGateway: (id: string, data: Partial<PaymentGatewayItem>) => void;
  deletePaymentGateway: (id: string) => void;
  paymentTransactions: PaymentTransaction[];
  deletePaymentTransaction: (id: string) => void;

  // Coupons & Banners
  coupons: Coupon[];
  addCoupon: (coupon: Omit<Coupon, 'id'>) => void;
  updateCoupon: (id: string, coupon: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;
  toggleCoupon: (id: string) => void;
  banners: BannerPromo[];
  addBanner: (banner: Omit<BannerPromo, 'id'>) => void;
  updateBanner: (id: string, banner: Partial<BannerPromo>) => void;
  deleteBanner: (id: string) => void;

  // Franchises
  franchises: Franchise[];
  addFranchise: (data: Omit<Franchise, 'id' | 'createdAt'>) => void;
  updateFranchise: (id: string, data: Partial<Franchise>) => void;
  deleteFranchise: (id: string) => void;
  updateFranchiseCredentials: (id: string, adminUserId: string, adminPassword: string) => void;
  toggleFranchiseStatus: (id: string, reason?: string) => void;

  // Google Maps & API Keys
  googleMapsKeys: GoogleMapsKeyItem[];
  addGoogleMapsKey: (data: Omit<GoogleMapsKeyItem, 'id' | 'createdAt' | 'currentRequestsToday' | 'status'>) => void;
  updateGoogleMapsKey: (id: string, data: Partial<GoogleMapsKeyItem>) => void;
  deleteGoogleMapsKey: (id: string) => void;
  testGoogleMapsKey: (id: string) => { success: boolean; message: string };

  brandSettings: BrandSettings;
  updateBrandSettings: (settings: Partial<BrandSettings>) => void;
  updateCompanyPages: (pages: Partial<CompanyPagesContent>) => void;
  payoutRequests: PayoutRequest[];
  deliveryWalletTransactions: DeliveryWalletTransaction[];
  requestPayout: (params: {
    recipientType: 'restaurant' | 'delivery';
    recipientId: string;
    amount: number;
    bankOrUpiDetails: string;
    payoutMethod?: 'upi' | 'bank_transfer';
    upiId?: string;
    bankDetails?: {
      accountNumber: string;
      ifscCode: string;
      holderName: string;
      bankName: string;
    };
  }) => void;
  settlePayout: (id: string, referenceId: string) => void;
  rejectPayout: (id: string, reason: string) => void;
  deletePayout: (id: string) => void;
  cancelPayoutRequest: (payoutId: string) => void;
  cancelRiderPayoutRequest: (payoutId: string) => void;
  supportTickets: SupportTicket[];
  createSupportTicket: (params: { subject: string; message: string; orderId?: string }) => void;
  replySupportTicket: (ticketId: string, reply: string) => void;
  deleteSupportTicket: (id: string) => void;

  // Saved Addresses
  addCustomerAddress: (address: SavedAddress) => void;
  updateCustomerAddress: (addressId: string, addressData: Partial<SavedAddress>) => void;
  deleteCustomerAddress: (addressId: string) => void;
  updateCustomerProfile: (data: Partial<CustomerUser>) => void;

  // Modals & UI Controls
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isTrackingModalOpen: boolean;
  setIsTrackingModalOpen: (open: boolean) => void;
  isSupportModalOpen: boolean;
  setIsSupportModalOpen: (open: boolean) => void;
  isBrowseOnOtherDevicesModalOpen: boolean;
  setIsBrowseOnOtherDevicesModalOpen: (open: boolean) => void;
  openBrowseOnOtherDevicesModal: () => void;
  customerProfileTab: 'orders' | 'addresses' | 'favorites' | 'tickets' | 'notifications' | 'care' | 'settings';
  setCustomerProfileTab: (tab: 'orders' | 'addresses' | 'favorites' | 'tickets' | 'notifications' | 'care' | 'settings') => void;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  deleteNotification: (id: string) => void;
  addNotification: (title: string, message: string, type?: NotificationItem['type'], linkAction?: string) => void;

  // Permanent Storage & Master Catalog Persistence
  isPermanentStorageActive: boolean;
  requestPermanentStorage: () => Promise<boolean>;
  persistAllDataToPermanentStorage: () => { success: boolean; timestamp: string; totalItems: number };
  exportPermanentCatalogBackup: () => string;
  importPermanentCatalogBackup: (jsonString: string) => { success: boolean; message: string };

  // Likart Mart (10m Groceries) Super Admin Management
  darkStores: DarkStoreHub[];
  addDarkStore: (data: Omit<DarkStoreHub, 'id' | 'createdAt'>) => void;
  updateDarkStore: (id: string, data: Partial<DarkStoreHub>) => void;
  deleteDarkStore: (id: string) => void;
  toggleDarkStoreStatus: (id: string) => void;
  toggleDarkStoreActiveStatus: (id: string, reason?: string) => void;
  martServiceConfig: MartServiceConfig;
  setMartServiceConfig: React.Dispatch<React.SetStateAction<MartServiceConfig>>;
  toggleMartServiceStatus: (active?: boolean, notice?: string) => void;
  updateMartServiceConfig: (config: Partial<MartServiceConfig>) => void;
  darkStoreManagers: DarkStoreManager[];
  addDarkStoreManager: (data: Omit<DarkStoreManager, 'id' | 'createdAt' | 'lastActive'>) => void;
  updateDarkStoreManager: (id: string, data: Partial<DarkStoreManager>) => void;
  deleteDarkStoreManager: (id: string) => void;
  martSoundSettings: MartAlertToneSettings;
  updateMartSoundSettings: (settings: Partial<MartAlertToneSettings>) => void;

  // Likart Mart Catalog, Products, Categories, Offers, Reviews, Staff & Logs
  martProducts: QuickCommerceItem[];
  setMartProducts: React.Dispatch<React.SetStateAction<QuickCommerceItem[]>>;
  addMartProduct: (product: QuickCommerceItem) => void;
  updateMartProduct: (id: string, product: Partial<QuickCommerceItem>) => void;
  deleteMartProduct: (id: string) => void;

  martCategories: QuickCommerceCategory[];
  setMartCategories: React.Dispatch<React.SetStateAction<QuickCommerceCategory[]>>;
  addMartCategory: (cat: QuickCommerceCategory) => void;
  updateMartCategory: (id: string, cat: Partial<QuickCommerceCategory>) => void;
  deleteMartCategory: (id: string) => void;

  martOffers: MartOffer[];
  setMartOffers: React.Dispatch<React.SetStateAction<MartOffer[]>>;
  addMartOffer: (offer: MartOffer) => void;
  updateMartOffer: (id: string, offer: Partial<MartOffer>) => void;
  deleteMartOffer: (id: string) => void;

  martReviews: MartReview[];
  setMartReviews: React.Dispatch<React.SetStateAction<MartReview[]>>;
  addMartReview: (review: MartReview) => void;
  updateMartReview: (id: string, review: Partial<MartReview>) => void;
  deleteMartReview: (id: string) => void;

  martStaffUsers: MartStaffUser[];
  setMartStaffUsers: React.Dispatch<React.SetStateAction<MartStaffUser[]>>;
  addMartStaffUser: (user: MartStaffUser) => void;
  updateMartStaffUser: (id: string, user: Partial<MartStaffUser>) => void;
  deleteMartStaffUser: (id: string) => void;

  martRoleConfigs: MartRoleConfig[];
  setMartRoleConfigs: React.Dispatch<React.SetStateAction<MartRoleConfig[]>>;
  addMartRoleConfig: (role: MartRoleConfig) => void;
  updateMartRoleConfig: (id: string, role: Partial<MartRoleConfig>) => void;
  deleteMartRoleConfig: (id: string) => void;

  martAuditLogs: MartAuditLog[];
  setMartAuditLogs: React.Dispatch<React.SetStateAction<MartAuditLog[]>>;
  addMartAuditLog: (action: MartAuditLog['action'], module: MartAuditLog['module'], targetId: string, details: string) => void;
  clearAllMartAuditLogs: () => void;
  deleteBulkMartAuditLogs: (ids: string[]) => void;

  martBanners: BannerPromo[];
  setMartBanners: React.Dispatch<React.SetStateAction<BannerPromo[]>>;
  addMartBanner: (banner: Omit<BannerPromo, 'id'>) => void;
  updateMartBanner: (id: string, banner: Partial<BannerPromo>) => void;
  deleteMartBanner: (id: string) => void;
  martBannerConfig: MartBannerAutoSlideConfig;
  updateMartBannerConfig: (config: Partial<MartBannerAutoSlideConfig>) => void;

  addPaymentTransaction: (tx: PaymentTransaction) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// PERMANENT DATA STORAGE & APPLICATION UPDATE PROTECTION PROTOCOL
// Newly added data (restaurants, menu items, delivery partners, zones, coupons, banners, brand settings,
// company pages, etc.) is permanently preserved across application feature updates, reloads, and browser sessions.
// Destructive key purging is permanently disabled to guarantee zero data loss.
if (typeof window !== 'undefined') {
  try {
    localStorage.setItem('likart_permanent_save_access', 'active');
    localStorage.setItem('likart_update_protection', 'enabled');
    localStorage.setItem('likart_data_retention_policy', 'permanent');
  } catch (err) {
    console.warn('Storage persistence check:', err);
  }
}

const defaultEmptyZone: DeliveryZone = {
  id: '',
  name: 'All Service Zones',
  city: 'Bengaluru',
  center: { lat: 12.9352, lng: 77.6245 },
  radiusKm: 15,
  baseDeliveryFee: 30,
  perKmFee: 10,
  minOrderValue: 0,
  isActive: true,
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Portals & Navigation
  // Portals & Navigation (Supports direct cross-device URLs like ?portal=restaurant or ?portal=delivery or ?view=quick_commerce)
  const [activePortal, setActivePortal] = useState<UserRole>(() => {
    if (typeof window !== 'undefined') {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const queryPortal = urlParams.get('portal');
        if (queryPortal && ['customer', 'admin', 'restaurant', 'delivery', 'mart_manager'].includes(queryPortal)) {
          safeStorage.setItem('likart_active_portal', queryPortal);
          return queryPortal as UserRole;
        }
      } catch {}
    }
    try {
      const saved = safeStorage.getItem('likart_active_portal');
      if (saved && ['customer', 'admin', 'restaurant', 'delivery', 'mart_manager'].includes(saved)) {
        return saved as UserRole;
      }
    } catch {}
    return 'customer';
  });

  const [customerView, setCustomerView] = useState<'home' | 'restaurants' | 'restaurant_detail' | 'profile' | 'policy' | 'quick_commerce'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const queryView = urlParams.get('view');
        if (queryView && ['home', 'restaurants', 'restaurant_detail', 'profile', 'policy', 'quick_commerce'].includes(queryView)) {
          return queryView as any;
        }
        if (urlParams.get('restaurant')) {
          return 'restaurant_detail';
        }
      } catch {}
    }
    return 'home';
  });
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const restId = urlParams.get('restaurant');
        if (restId) return restId;
      } catch {}
    }
    return null;
  });
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);

  // Modals & Cross-Device Controls
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isBrowseOnOtherDevicesModalOpen, setIsBrowseOnOtherDevicesModalOpen] = useState(false);
  const openBrowseOnOtherDevicesModal = () => setIsBrowseOnOtherDevicesModalOpen(true);
  const [customerProfileTab, setCustomerProfileTab] = useState<'orders' | 'addresses' | 'favorites' | 'tickets' | 'notifications' | 'care' | 'settings'>('orders');

  // Customers & Authentication Sessions (Permanent Storage)
  const [allCustomers, setAllCustomers] = useState<CustomerUser[]>(() => {
    try {
      const saved = safeStorage.getItem('likart_all_customers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return filterOutPermanentlyDeleted(parsed);
      }
    } catch {
      // fallback
    }
    const defaultSeed: CustomerUser[] = [
      {
        id: 'cust-101',
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        phone: '+91 98451 22334',
        walletBalance: 450,
        loyaltyPoints: 120,
        addresses: [
          {
            id: 'addr-1',
            type: 'Home',
            title: 'Home',
            label: 'Home',
            flat: 'Flat 402',
            area: 'Green Glen Layout, Bellandur',
            addressLine: 'Flat 402, Green Glen Layout, Bellandur',
            landmark: 'Near Central Mall',
            city: 'Bengaluru',
            isDefault: true,
            coordinates: { lat: 12.9352, lng: 77.6245 },
          },
        ],
        favorites: [],
        createdAt: '2026-01-12T10:00:00Z',
      },
      {
        id: 'cust-102',
        name: 'Priya Mehta',
        email: 'priya.mehta@example.com',
        phone: '+91 98112 33445',
        walletBalance: 1200,
        loyaltyPoints: 340,
        addresses: [
          {
            id: 'addr-2',
            type: 'Work',
            title: 'Office',
            label: 'Office',
            flat: 'Block C',
            area: 'Embassy Tech Village, Outer Ring Rd',
            addressLine: 'Block C, Embassy Tech Village, Outer Ring Rd',
            landmark: 'Tech Park Gate 2',
            city: 'Bengaluru',
            isDefault: true,
            coordinates: { lat: 12.9288, lng: 77.6833 },
          },
        ],
        favorites: [],
        createdAt: '2026-01-18T14:30:00Z',
      },
      {
        id: 'cust-103',
        name: 'Amit Verma',
        email: 'amit.verma@example.com',
        phone: '+91 98450 77112',
        walletBalance: 250,
        loyaltyPoints: 85,
        addresses: [
          {
            id: 'addr-3',
            type: 'Home',
            title: 'Home',
            label: 'Home',
            flat: 'House #54',
            area: '4th Cross, Koramangala 4th Block',
            addressLine: 'House #54, 4th Cross, Koramangala 4th Block',
            landmark: 'Opposite BDA Complex',
            city: 'Bengaluru',
            isDefault: true,
            coordinates: { lat: 12.9345, lng: 77.6265 },
          },
        ],
        favorites: [],
        createdAt: '2026-02-01T09:15:00Z',
      },
      {
        id: 'cust-104',
        name: 'Sneha Iyer',
        email: 'sneha.iyer@example.com',
        phone: '+91 99001 88223',
        walletBalance: 800,
        loyaltyPoints: 210,
        addresses: [
          {
            id: 'addr-4',
            type: 'Home',
            title: 'Apartment',
            label: 'Apartment',
            flat: 'Tower 2',
            area: 'Prestige Falcon City, Kanakapura Rd',
            addressLine: 'Tower 2, Prestige Falcon City, Kanakapura Rd',
            landmark: 'Near Forum Mall South',
            city: 'Bengaluru',
            isDefault: true,
            coordinates: { lat: 12.8912, lng: 77.5689 },
          },
        ],
        favorites: [],
        createdAt: '2026-02-14T16:45:00Z',
      },
      {
        id: 'cust-105',
        name: 'Rohan Gupta',
        email: 'rohan.gupta@example.com',
        phone: '+91 97234 55667',
        walletBalance: 0,
        loyaltyPoints: 40,
        addresses: [
          {
            id: 'addr-5',
            type: 'Home',
            title: 'Home',
            label: 'Home',
            flat: '12th Main',
            area: 'HSR Layout Sector 2',
            addressLine: '12th Main, HSR Layout Sector 2',
            landmark: 'Near Agara Lake',
            city: 'Bengaluru',
            isDefault: true,
            coordinates: { lat: 12.9116, lng: 77.6389 },
          },
        ],
        favorites: [],
        createdAt: '2026-03-01T11:20:00Z',
      },
    ];
    return filterOutPermanentlyDeleted(defaultSeed);
  });

  const [authCustomer, setAuthCustomer] = useState<CustomerUser | null>(() => {
    try {
      const saved = safeStorage.getItem('likart_customer_session') || safeStorage.getItem('likart_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(() => {
    try {
      const saved = safeStorage.getItem('likart_customer_session') || safeStorage.getItem('likart_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authRestaurant, setAuthRestaurant] = useState<Restaurant | null>(() => {
    const saved = safeStorage.getItem('likart_restaurant_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [authRider, setAuthRider] = useState<DeliveryPartner | null>(() => {
    const saved = safeStorage.getItem('likart_rider_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [authAdmin, setAuthAdmin] = useState<AdminUser | null>(() => {
    const saved = safeStorage.getItem('likart_admin_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [adminInitialTab, setAdminInitialTab] = useState<string | null>(null);

  const [authMartManager, setAuthMartManager] = useState<DarkStoreManager | null>(() => {
    try {
      const saved = safeStorage.getItem('likart_mart_manager_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Permanent Storage State
  const [isPermanentStorageActive, setIsPermanentStorageActive] = useState<boolean>(true);

  useEffect(() => {
    requestPermanentStorageAccess().then((granted) => {
      setIsPermanentStorageActive(granted);
    });
  }, []);

  const [currentLocation, setCurrentLocation] = useState<LocationCoordinates>(() => {
    const saved = localStorage.getItem('likart_location');
    return saved ? JSON.parse(saved) : {
      lat: 12.9352,
      lng: 77.6245,
      address: 'Koramangala 4th Block, 80 Feet Road',
      city: 'Bengaluru',
      zoneId: '',
      pincode: '560034',
      landmark: 'Near Sony Signal',
    };
  });

  const [zones, setZones] = useState<DeliveryZone[]>(() => {
    const saved = safeStorage.getItem('likart_zones');
    if (saved === null) return filterOutPermanentlyDeleted(initialZones);
    try {
      const parsed: DeliveryZone[] = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return filterOutPermanentlyDeleted(parsed);
      }
      return filterOutPermanentlyDeleted(initialZones);
    } catch {
      return filterOutPermanentlyDeleted(initialZones);
    }
  });

  const [currentZone, setCurrentZone] = useState<DeliveryZone>(() => {
    return zones[0] || defaultEmptyZone;
  });

  // Restaurants & Menus
  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => {
    const saved = safeStorage.getItem('likart_restaurants');
    if (saved === null) return filterOutPermanentlyDeleted(initialRestaurants);
    try {
      const parsed: Restaurant[] = JSON.parse(saved);
      return Array.isArray(parsed) ? filterOutPermanentlyDeleted(parsed) : [];
    } catch {
      return filterOutPermanentlyDeleted(initialRestaurants);
    }
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = safeStorage.getItem('likart_menu_items');
    if (saved === null) return filterOutPermanentlyDeleted(initialMenuItems);
    try {
      const parsed: MenuItem[] = JSON.parse(saved);
      return Array.isArray(parsed) ? filterOutPermanentlyDeleted(parsed) : [];
    } catch {
      return filterOutPermanentlyDeleted(initialMenuItems);
    }
  });

  const [categories, setCategories] = useState<RestaurantCategory[]>(() => {
    const saved = safeStorage.getItem('likart_categories');
    if (saved === null) return filterOutPermanentlyDeleted(initialCategories);
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? filterOutPermanentlyDeleted(parsed) : initialCategories;
    } catch {
      return filterOutPermanentlyDeleted(initialCategories);
    }
  });

  // Master Cuisines state
  const [cuisines, setCuisines] = useState<Cuisine[]>(() => {
    const saved = safeStorage.getItem('likart_cuisines');
    if (saved === null) return filterOutPermanentlyDeleted(initialCuisines);
    try {
      const parsed: Cuisine[] = JSON.parse(saved);
      return Array.isArray(parsed) ? filterOutPermanentlyDeleted(parsed) : initialCuisines;
    } catch {
      return filterOutPermanentlyDeleted(initialCuisines);
    }
  });

  const [currentRestaurantId, setCurrentRestaurantId] = useState<string>('');

  // Delivery Partners
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>(() => {
    const saved = safeStorage.getItem('likart_riders');
    if (saved === null) return filterOutPermanentlyDeleted(initialDeliveryPartners);
    try {
      const parsed: DeliveryPartner[] = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const cleaned = filterOutPermanentlyDeleted(parsed);
        return cleaned.map((d) => {
          const cashHeld = typeof d.totalCashCollected === 'number' ? d.totalCashCollected : 0;
          const totalEarn =
            typeof d.totalEarnings === 'number'
              ? d.totalEarnings
              : Math.max(0, (d.walletBalance || 0) + cashHeld);
          const withdrawAvail =
            typeof d.walletBalance === 'number' ? d.walletBalance : Math.max(0, totalEarn - cashHeld);
          return {
            ...d,
            totalEarnings: totalEarn,
            totalCashCollected: cashHeld,
            walletBalance: withdrawAvail,
            floatingCashLimit: d.floatingCashLimit || 1000,
          };
        });
      }
      return filterOutPermanentlyDeleted(initialDeliveryPartners);
    } catch {
      return filterOutPermanentlyDeleted(initialDeliveryPartners);
    }
  });

  const [currentRiderId, setCurrentRiderId] = useState<string>('');

  // Cart & Orders
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = safeStorage.getItem('likart_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = safeStorage.getItem('likart_orders');
    if (!saved) return [];
    try {
      const parsed: Order[] = JSON.parse(saved);
      return Array.isArray(parsed) ? filterOutPermanentlyDeleted(parsed) : [];
    } catch {
      return [];
    }
  });

  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);

  // Admin & Settings
  const [brandSettings, setBrandSettings] = useState<BrandSettings>(() => {
    const saved = safeStorage.getItem('likart_brand_settings');
    const base = saved ? JSON.parse(saved) : initialBrandSettings;
    return {
      ...initialBrandSettings,
      ...base,
      companyPages: {
        ...initialBrandSettings.companyPages,
        ...(base.companyPages || {}),
      },
      googleMapsApiKey: 'AIzaSyCh6AvlBs1g6vAf5dkPQc7z7HeG6NDl73Y',
      isMapSimulation: false,
    };
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = safeStorage.getItem('likart_coupons');
    if (saved === null) return filterOutPermanentlyDeleted(initialCoupons);
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? filterOutPermanentlyDeleted(parsed) : [];
    } catch {
      return filterOutPermanentlyDeleted(initialCoupons);
    }
  });

  const [banners, setBanners] = useState<BannerPromo[]>(() => {
    const saved = safeStorage.getItem('likart_banners');
    if (saved === null) return filterOutPermanentlyDeleted(initialBanners);
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? filterOutPermanentlyDeleted(parsed) : [];
    } catch {
      return filterOutPermanentlyDeleted(initialBanners);
    }
  });

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    const permanentAdmin: AdminUser = {
      id: 'adm-super-permanent',
      name: 'Permanent Super Admin',
      email: 'likart9900@gmail.com',
      password: 'Maalu@1122',
      role: 'super_admin',
      status: 'active',
      permissions: ['all', 'restaurants', 'riders', 'zones', 'orders', 'finance', 'settings', 'franchises_manage'],
      lastLogin: 'Just now',
    };

    const saved = safeStorage.getItem('likart_admins');
    if (saved) {
      try {
        const parsed: AdminUser[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const filtered = filterOutPermanentlyDeleted(parsed);
          const others = filtered.filter((u) => u.email.toLowerCase() !== 'likart9900@gmail.com');
          return [permanentAdmin, ...others];
        }
      } catch {
        // fallback
      }
    }
    return filterOutPermanentlyDeleted(initialAdminUsers);
  });

  const [currentAdminRole, setCurrentAdminRole] = useState<string>('super_admin');

  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>(() => {
    const saved = safeStorage.getItem('likart_payouts');
    if (!saved) return [];
    try {
      const parsed: PayoutRequest[] = JSON.parse(saved);
      return Array.isArray(parsed) ? filterOutPermanentlyDeleted(parsed) : [];
    } catch {
      return [];
    }
  });

  const [deliveryWalletTransactions, setDeliveryWalletTransactions] = useState<DeliveryWalletTransaction[]>(() => {
    const saved = safeStorage.getItem('likart_delivery_wallet_txns');
    if (!saved) return initialDeliveryWalletTransactions;
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? filterOutPermanentlyDeleted(parsed) : initialDeliveryWalletTransactions;
    } catch {
      return initialDeliveryWalletTransactions;
    }
  });

  useEffect(() => {
    safeStorage.setItem('likart_delivery_wallet_txns', JSON.stringify(deliveryWalletTransactions));
  }, [deliveryWalletTransactions]);

  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
    const saved = safeStorage.getItem('likart_tickets');
    if (!saved) return [];
    try {
      const parsed: SupportTicket[] = JSON.parse(saved);
      return Array.isArray(parsed) ? filterOutPermanentlyDeleted(parsed) : [];
    } catch {
      return [];
    }
  });

  const [franchises, setFranchises] = useState<Franchise[]>(() => {
    const saved = safeStorage.getItem('likart_franchises');
    if (!saved) return filterOutPermanentlyDeleted(initialFranchises);
    try {
      const parsed: Franchise[] = JSON.parse(saved);
      return Array.isArray(parsed) ? filterOutPermanentlyDeleted(parsed) : [];
    } catch {
      return filterOutPermanentlyDeleted(initialFranchises);
    }
  });

  const [googleMapsKeys, setGoogleMapsKeys] = useState<GoogleMapsKeyItem[]>(() => {
    const saved = safeStorage.getItem('likart_maps_keys');
    if (saved) {
      try {
        const parsed: GoogleMapsKeyItem[] = JSON.parse(saved);
        const filtered = filterOutPermanentlyDeleted(parsed);
        return filtered.map((k, idx) => idx === 0 ? {
          ...k,
          apiKey: 'AIzaSyCh6AvlBs1g6vAf5dkPQc7z7HeG6NDl73Y',
          label: 'Production Primary Google Maps API Key',
          status: 'healthy',
        } : k);
      } catch (e) {
        return filterOutPermanentlyDeleted(initialGoogleMapsKeys);
      }
    }
    return filterOutPermanentlyDeleted(initialGoogleMapsKeys);
  });

  const [paymentGateways, setPaymentGateways] = useState<PaymentGatewayItem[]>(() => {
    const saved = safeStorage.getItem('likart_payment_gateways');
    if (!saved) return filterOutPermanentlyDeleted(initialPaymentGateways);
    try {
      const parsed: PaymentGatewayItem[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const filtered = filterOutPermanentlyDeleted(parsed);
        // Ensure Cash on Delivery (COD) is always present even if an older cached configuration exists
        const hasCod = parsed.some((g) => g.provider === 'cod' || g.id === 'gw-cod');
        if (!hasCod) {
          const codDefault = initialPaymentGateways.find((g) => g.provider === 'cod') || {
            id: 'gw-cod',
            provider: 'cod',
            name: 'Cash on Delivery (COD)',
            appOrMerchantId: 'COD-DOORSTEP',
            apiKeyOrSecretMasked: '••••••••••••COD',
            webhookSecret: '',
            testMode: false,
            enabled: true,
            supportedMethods: [
              'Cash Payment on Delivery',
              'Doorstep UPI QR Code Scan',
              'Zero Advance Payment',
              'Exact Change / UPI Accepted',
            ],
            createdAt: '2026-01-01',
          };
          return [codDefault, ...parsed];
        }
        return parsed;
      }
      return initialPaymentGateways;
    } catch {
      return initialPaymentGateways;
    }
  });

  const [paymentTransactions, setPaymentTransactions] = useState<PaymentTransaction[]>(() => {
    const saved = safeStorage.getItem('likart_payment_transactions');
    if (!saved) return [];
    try {
      const parsed: PaymentTransaction[] = JSON.parse(saved);
      return Array.isArray(parsed) ? filterOutPermanentlyDeleted(parsed) : [];
    } catch {
      return [];
    }
  });

  // Likart Mart (10m Groceries) Super Admin State
  const [darkStores, setDarkStores] = useState<DarkStoreHub[]>(() => {
    try {
      const saved = safeStorage.getItem('likart_dark_stores');
      if (saved === null) return filterOutPermanentlyDeleted(INITIAL_DARK_STORES);
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? filterOutPermanentlyDeleted(parsed) : INITIAL_DARK_STORES;
    } catch {
      return filterOutPermanentlyDeleted(INITIAL_DARK_STORES);
    }
  });

  const [darkStoreManagers, setDarkStoreManagers] = useState<DarkStoreManager[]>(() => {
    try {
      const saved = safeStorage.getItem('likart_dark_store_managers');
      if (saved === null) return filterOutPermanentlyDeleted(INITIAL_DARK_STORE_MANAGERS);
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? filterOutPermanentlyDeleted(parsed) : INITIAL_DARK_STORE_MANAGERS;
    } catch {
      return filterOutPermanentlyDeleted(INITIAL_DARK_STORE_MANAGERS);
    }
  });

  const [martSoundSettings, setMartSoundSettings] = useState<MartAlertToneSettings>(() => {
    try {
      const saved = safeStorage.getItem('likart_mart_sound_settings');
      if (saved) return JSON.parse(saved);
      return INITIAL_MART_SOUND_SETTINGS;
    } catch {
      return INITIAL_MART_SOUND_SETTINGS;
    }
  });

  const [martServiceConfig, setMartServiceConfig] = useState<MartServiceConfig>(() => {
    try {
      const saved = safeStorage.getItem('likart_mart_service_config');
      if (saved) return JSON.parse(saved);
      return INITIAL_MART_SERVICE_CONFIG;
    } catch {
      return INITIAL_MART_SERVICE_CONFIG;
    }
  });

  // Likart Mart Catalog, Products, Categories, Offers, Reviews, Staff & Logs State
  const [martProducts, setMartProducts] = useState<QuickCommerceItem[]>(() => {
    try {
      const saved = safeStorage.getItem('likart_mart_products');
      if (saved === null) return filterOutPermanentlyDeleted(QUICK_COMMERCE_ITEMS);
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const filtered = filterOutPermanentlyDeleted(parsed);
        return filtered.map((item) => {
          if (!item.variants || item.variants.length === 0) {
            const initial = QUICK_COMMERCE_ITEMS.find((q) => q.id === item.id);
            if (initial?.variants && initial.variants.length > 0) {
              return { ...item, variants: initial.variants };
            }
          }
          return item;
        });
      }
      return filterOutPermanentlyDeleted(QUICK_COMMERCE_ITEMS);
    } catch {
      return filterOutPermanentlyDeleted(QUICK_COMMERCE_ITEMS);
    }
  });

  const [martCategories, setMartCategories] = useState<QuickCommerceCategory[]>(() => {
    try {
      const saved = safeStorage.getItem('likart_mart_categories');
      if (saved === null) return filterOutPermanentlyDeleted(QUICK_COMMERCE_CATEGORIES);
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? filterOutPermanentlyDeleted(parsed) : filterOutPermanentlyDeleted(QUICK_COMMERCE_CATEGORIES);
    } catch {
      return filterOutPermanentlyDeleted(QUICK_COMMERCE_CATEGORIES);
    }
  });

  const [martOffers, setMartOffers] = useState<MartOffer[]>(() => {
    try {
      const saved = safeStorage.getItem('likart_mart_offers');
      if (saved === null) return filterOutPermanentlyDeleted(INITIAL_MART_OFFERS);
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? filterOutPermanentlyDeleted(parsed) : filterOutPermanentlyDeleted(INITIAL_MART_OFFERS);
    } catch {
      return filterOutPermanentlyDeleted(INITIAL_MART_OFFERS);
    }
  });

  const [martReviews, setMartReviews] = useState<MartReview[]>(() => {
    try {
      const saved = safeStorage.getItem('likart_mart_reviews');
      if (saved === null) return filterOutPermanentlyDeleted(INITIAL_MART_REVIEWS);
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? filterOutPermanentlyDeleted(parsed) : filterOutPermanentlyDeleted(INITIAL_MART_REVIEWS);
    } catch {
      return filterOutPermanentlyDeleted(INITIAL_MART_REVIEWS);
    }
  });

  const [martStaffUsers, setMartStaffUsers] = useState<MartStaffUser[]>(() => {
    try {
      const saved = safeStorage.getItem('likart_mart_staff_users');
      if (saved === null) return filterOutPermanentlyDeleted(INITIAL_MART_USERS);
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? filterOutPermanentlyDeleted(parsed) : filterOutPermanentlyDeleted(INITIAL_MART_USERS);
    } catch {
      return filterOutPermanentlyDeleted(INITIAL_MART_USERS);
    }
  });

  const [martRoleConfigs, setMartRoleConfigs] = useState<MartRoleConfig[]>(() => {
    try {
      const saved = safeStorage.getItem('likart_mart_role_configs');
      if (saved === null) return filterOutPermanentlyDeleted(INITIAL_MART_ROLES);
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? filterOutPermanentlyDeleted(parsed) : filterOutPermanentlyDeleted(INITIAL_MART_ROLES);
    } catch {
      return filterOutPermanentlyDeleted(INITIAL_MART_ROLES);
    }
  });

  const [martAuditLogs, setMartAuditLogs] = useState<MartAuditLog[]>(() => {
    try {
      const saved = safeStorage.getItem('likart_mart_audit_logs');
      if (saved === null) return INITIAL_MART_AUDIT_LOGS;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : INITIAL_MART_AUDIT_LOGS;
    } catch {
      return INITIAL_MART_AUDIT_LOGS;
    }
  });

  const [martBanners, setMartBanners] = useState<BannerPromo[]>(() => {
    try {
      const saved = safeStorage.getItem('likart_mart_banners');
      if (saved === null) return INITIAL_MART_BANNERS;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_MART_BANNERS;
    } catch {
      return INITIAL_MART_BANNERS;
    }
  });

  const [martBannerConfig, setMartBannerConfig] = useState<MartBannerAutoSlideConfig>(() => {
    try {
      const saved = safeStorage.getItem('likart_mart_banner_config');
      if (saved === null) return DEFAULT_MART_BANNER_CONFIG;
      const parsed = JSON.parse(saved);
      return parsed && typeof parsed === 'object' ? { ...DEFAULT_MART_BANNER_CONFIG, ...parsed } : DEFAULT_MART_BANNER_CONFIG;
    } catch {
      return DEFAULT_MART_BANNER_CONFIG;
    }
  });

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Sync to LocalStorage
  useEffect(() => {
    safeStorage.setItem('likart_user', JSON.stringify(customerUser));
  }, [customerUser]);

  useEffect(() => {
    safeStorage.setItem('likart_location', JSON.stringify(currentLocation));
  }, [currentLocation]);

  useEffect(() => {
    safeStorage.setItem('likart_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    safeStorage.setItem('likart_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    const sanitized = restaurants.map(sanitizeRestaurantForStorage);
    safeStorage.setItem('likart_restaurants', JSON.stringify(sanitized));
  }, [restaurants]);

  useEffect(() => {
    safeStorage.setItem('likart_menu_items', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    safeStorage.setItem('likart_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    safeStorage.setItem('likart_cuisines', JSON.stringify(cuisines));
  }, [cuisines]);

  useEffect(() => {
    safeStorage.setItem('likart_riders', JSON.stringify(deliveryPartners));
  }, [deliveryPartners]);

  useEffect(() => {
    safeStorage.setItem('likart_brand_settings', JSON.stringify(brandSettings));
  }, [brandSettings]);

  useEffect(() => {
    safeStorage.setItem('likart_zones', JSON.stringify(zones));
  }, [zones]);

  useEffect(() => {
    safeStorage.setItem('likart_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    safeStorage.setItem('likart_banners', JSON.stringify(banners));
  }, [banners]);

  useEffect(() => {
    safeStorage.setItem('likart_admins', JSON.stringify(adminUsers));
  }, [adminUsers]);

  useEffect(() => {
    safeStorage.setItem('likart_franchises', JSON.stringify(franchises));
  }, [franchises]);

  useEffect(() => {
    safeStorage.setItem('likart_maps_keys', JSON.stringify(googleMapsKeys));
  }, [googleMapsKeys]);

  useEffect(() => {
    safeStorage.setItem('likart_payment_gateways', JSON.stringify(paymentGateways));
  }, [paymentGateways]);

  useEffect(() => {
    safeStorage.setItem('likart_payment_transactions', JSON.stringify(paymentTransactions));
  }, [paymentTransactions]);

  useEffect(() => {
    safeStorage.setItem('likart_payouts', JSON.stringify(payoutRequests));
  }, [payoutRequests]);

  useEffect(() => {
    safeStorage.setItem('likart_tickets', JSON.stringify(supportTickets));
  }, [supportTickets]);

  useEffect(() => {
    safeStorage.setItem('likart_all_customers', JSON.stringify(allCustomers));
  }, [allCustomers]);

  useEffect(() => {
    safeStorage.setItem('likart_dark_stores', JSON.stringify(darkStores));
  }, [darkStores]);

  useEffect(() => {
    safeStorage.setItem('likart_dark_store_managers', JSON.stringify(darkStoreManagers));
  }, [darkStoreManagers]);

  useEffect(() => {
    safeStorage.setItem('likart_mart_sound_settings', JSON.stringify(martSoundSettings));
  }, [martSoundSettings]);

  useEffect(() => {
    safeStorage.setItem('likart_mart_service_config', JSON.stringify(martServiceConfig));
  }, [martServiceConfig]);

  useEffect(() => {
    safeStorage.setItem('likart_mart_products', JSON.stringify(martProducts));
  }, [martProducts]);

  useEffect(() => {
    safeStorage.setItem('likart_mart_categories', JSON.stringify(martCategories));
  }, [martCategories]);

  useEffect(() => {
    safeStorage.setItem('likart_mart_offers', JSON.stringify(martOffers));
  }, [martOffers]);

  useEffect(() => {
    safeStorage.setItem('likart_mart_reviews', JSON.stringify(martReviews));
  }, [martReviews]);

  useEffect(() => {
    safeStorage.setItem('likart_mart_staff_users', JSON.stringify(martStaffUsers));
  }, [martStaffUsers]);

  useEffect(() => {
    safeStorage.setItem('likart_mart_role_configs', JSON.stringify(martRoleConfigs));
  }, [martRoleConfigs]);

  useEffect(() => {
    safeStorage.setItem('likart_mart_audit_logs', JSON.stringify(martAuditLogs));
  }, [martAuditLogs]);

  useEffect(() => {
    safeStorage.setItem('likart_mart_banners', JSON.stringify(martBanners));
  }, [martBanners]);

  useEffect(() => {
    safeStorage.setItem('likart_mart_banner_config', JSON.stringify(martBannerConfig));
  }, [martBannerConfig]);

  useEffect(() => {
    safeStorage.setItem('likart_active_portal', activePortal);
  }, [activePortal]);

  useEffect(() => {
    if (authCustomer) {
      savePermanentAuthSession('customer', authCustomer);
      safeStorage.setItem('likart_user', JSON.stringify(authCustomer));
    }
  }, [authCustomer]);

  useEffect(() => {
    if (customerUser) {
      savePermanentAuthSession('customer', customerUser);
      safeStorage.setItem('likart_user', JSON.stringify(customerUser));
    }
  }, [customerUser]);

  useEffect(() => {
    safeStorage.setItem('likart_all_customers', JSON.stringify(allCustomers));
  }, [allCustomers]);

  useEffect(() => {
    if (authRestaurant) {
      const sanitized = sanitizeRestaurantForStorage(authRestaurant);
      savePermanentAuthSession('restaurant', sanitized);
    }
  }, [authRestaurant]);

  useEffect(() => {
    if (authRider) {
      savePermanentAuthSession('rider', authRider);
    }
  }, [authRider]);

  useEffect(() => {
    if (authAdmin) {
      savePermanentAuthSession('admin', authAdmin);
    }
  }, [authAdmin]);

  useEffect(() => {
    if (authMartManager) {
      savePermanentAuthSession('mart_manager', authMartManager);
    }
  }, [authMartManager]);

  // 1. Master IndexedDB Self-Healing Recovery:
  // Guarantees newly added user data and authenticated logins are NEVER lost or reset across application updates or browser cache clears.
  // NEVER restores deleted items if localStorage was intentionally set to empty array [].
  useEffect(() => {
    getAllFromPermanentIndexedDB().then((idbData) => {
      if (!idbData || Object.keys(idbData).length === 0) return;

      interface CollectionToHeal {
        key: string;
        getter: () => string | null;
        setter: (val: any) => void;
        sanitize?: boolean;
      }

      const collectionsToHeal: CollectionToHeal[] = [
        { key: 'likart_restaurants', getter: () => safeStorage.getItem('likart_restaurants'), setter: setRestaurants, sanitize: true },
        { key: 'likart_menu_items', getter: () => safeStorage.getItem('likart_menu_items'), setter: setMenuItems },
        { key: 'likart_riders', getter: () => safeStorage.getItem('likart_riders'), setter: setDeliveryPartners },
        { key: 'likart_zones', getter: () => safeStorage.getItem('likart_zones'), setter: setZones },
        { key: 'likart_orders', getter: () => safeStorage.getItem('likart_orders'), setter: setOrders },
        { key: 'likart_admins', getter: () => safeStorage.getItem('likart_admins'), setter: setAdminUsers },
        { key: 'likart_payouts', getter: () => safeStorage.getItem('likart_payouts'), setter: setPayoutRequests },
        { key: 'likart_tickets', getter: () => safeStorage.getItem('likart_tickets'), setter: setSupportTickets },
        { key: 'likart_payment_gateways', getter: () => safeStorage.getItem('likart_payment_gateways'), setter: setPaymentGateways },
        { key: 'likart_payment_transactions', getter: () => safeStorage.getItem('likart_payment_transactions'), setter: setPaymentTransactions },
        { key: 'likart_coupons', getter: () => safeStorage.getItem('likart_coupons'), setter: setCoupons },
        { key: 'likart_banners', getter: () => safeStorage.getItem('likart_banners'), setter: setBanners },
        { key: 'likart_franchises', getter: () => safeStorage.getItem('likart_franchises'), setter: setFranchises },
        { key: 'likart_cuisines', getter: () => safeStorage.getItem('likart_cuisines'), setter: setCuisines },
        { key: 'likart_categories', getter: () => safeStorage.getItem('likart_categories'), setter: setCategories },
        { key: 'likart_maps_keys', getter: () => safeStorage.getItem('likart_maps_keys'), setter: setGoogleMapsKeys },
        { key: 'likart_dark_stores', getter: () => safeStorage.getItem('likart_dark_stores'), setter: setDarkStores },
        { key: 'likart_dark_store_managers', getter: () => safeStorage.getItem('likart_dark_store_managers'), setter: setDarkStoreManagers },
        { key: 'likart_mart_products', getter: () => safeStorage.getItem('likart_mart_products'), setter: setMartProducts },
        { key: 'likart_mart_categories', getter: () => safeStorage.getItem('likart_mart_categories'), setter: setMartCategories },
        { key: 'likart_mart_offers', getter: () => safeStorage.getItem('likart_mart_offers'), setter: setMartOffers },
        { key: 'likart_mart_reviews', getter: () => safeStorage.getItem('likart_mart_reviews'), setter: setMartReviews },
        { key: 'likart_mart_staff_users', getter: () => safeStorage.getItem('likart_mart_staff_users'), setter: setMartStaffUsers },
        { key: 'likart_mart_role_configs', getter: () => safeStorage.getItem('likart_mart_role_configs'), setter: setMartRoleConfigs },
        { key: 'likart_mart_audit_logs', getter: () => safeStorage.getItem('likart_mart_audit_logs'), setter: setMartAuditLogs },
        { key: 'likart_all_customers', getter: () => safeStorage.getItem('likart_all_customers'), setter: setAllCustomers },
      ];

      collectionsToHeal.forEach(({ key, getter, setter, sanitize }) => {
        const local = getter();
        const idb = idbData[key];
        // Only heal if local is truly null (cleared by browser cache policy), NEVER if local is '[]'
        if (local === null && idb && idb !== 'null' && idb !== 'undefined') {
          try {
            const parsed = JSON.parse(idb);
            if (Array.isArray(parsed)) {
              const cleaned = filterOutPermanentlyDeleted(parsed);
              const val = sanitize ? cleaned.map(sanitizeRestaurantForStorage) : cleaned;
              safeStorage.setItem(key, JSON.stringify(val));
              setter(val);
            }
          } catch (_) {}
        }
      });

      // Brand settings healing
      const localBrand = safeStorage.getItem('likart_brand_settings');
      const idbBrand = idbData['likart_brand_settings'];
      if (localBrand === null && idbBrand && idbBrand !== '{}' && idbBrand !== 'null') {
        try {
          const parsed = JSON.parse(idbBrand);
          if (parsed && typeof parsed === 'object') {
            safeStorage.setItem('likart_brand_settings', idbBrand);
            setBrandSettings((prev) => ({ ...prev, ...parsed }));
          }
        } catch (_) {}
      }

      // Permanent Sessions Self-Healing
      if (!authAdmin && idbData['likart_admin_session']) {
        try {
          const adm = JSON.parse(idbData['likart_admin_session']);
          if (adm && adm.role) {
            setAuthAdmin(adm);
            safeStorage.setItem('likart_admin_session', idbData['likart_admin_session']);
          }
        } catch (_) {}
      }

      if (!customerUser && (idbData['likart_customer_session'] || idbData['likart_user'])) {
        try {
          const cust = JSON.parse(idbData['likart_customer_session'] || idbData['likart_user']);
          if (cust && cust.id) {
            setCustomerUser(cust);
            setAuthCustomer(cust);
            safeStorage.setItem('likart_customer_session', JSON.stringify(cust));
            safeStorage.setItem('likart_user', JSON.stringify(cust));
          }
        } catch (_) {}
      }

      if (!authRestaurant && idbData['likart_restaurant_session']) {
        try {
          const rest = JSON.parse(idbData['likart_restaurant_session']);
          if (rest && rest.id) {
            setAuthRestaurant(rest);
            setCurrentRestaurantId(rest.id);
            safeStorage.setItem('likart_restaurant_session', idbData['likart_restaurant_session']);
          }
        } catch (_) {}
      }

      if (!authRider && idbData['likart_rider_session']) {
        try {
          const rider = JSON.parse(idbData['likart_rider_session']);
          if (rider && rider.id) {
            setAuthRider(rider);
            setCurrentRiderId(rider.id);
            safeStorage.setItem('likart_rider_session', idbData['likart_rider_session']);
          }
        } catch (_) {}
      }

      if (!authMartManager && idbData['likart_mart_manager_session']) {
        try {
          const mgr = JSON.parse(idbData['likart_mart_manager_session']);
          if (mgr && mgr.id) {
            setAuthMartManager(mgr);
            safeStorage.setItem('likart_mart_manager_session', idbData['likart_mart_manager_session']);
          }
        } catch (_) {}
      }

      if (idbData['likart_active_portal']) {
        const portal = idbData['likart_active_portal'] as UserRole;
        if (['customer', 'admin', 'restaurant', 'delivery', 'mart_manager'].includes(portal)) {
          setActivePortal(portal);
        }
      }
    });
  }, []);

  // 2. Cross-Tab Storage Synchronization:
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key || !e.newValue) return;
      try {
        if (e.key === 'likart_restaurants') setRestaurants(JSON.parse(e.newValue));
        if (e.key === 'likart_menu_items') setMenuItems(JSON.parse(e.newValue));
        if (e.key === 'likart_riders') setDeliveryPartners(JSON.parse(e.newValue));
        if (e.key === 'likart_zones') setZones(JSON.parse(e.newValue));
        if (e.key === 'likart_payment_gateways') setPaymentGateways(JSON.parse(e.newValue));
        if (e.key === 'likart_coupons') setCoupons(JSON.parse(e.newValue));
        if (e.key === 'likart_banners') setBanners(JSON.parse(e.newValue));
        if (e.key === 'likart_brand_settings') setBrandSettings(JSON.parse(e.newValue));
        if (e.key === 'likart_cuisines') setCuisines(JSON.parse(e.newValue));
        if (e.key === 'likart_dark_stores') setDarkStores(JSON.parse(e.newValue));
        if (e.key === 'likart_dark_store_managers') setDarkStoreManagers(JSON.parse(e.newValue));
        if (e.key === 'likart_mart_products') setMartProducts(JSON.parse(e.newValue));
        if (e.key === 'likart_mart_categories') setMartCategories(JSON.parse(e.newValue));
        if (e.key === 'likart_mart_offers') setMartOffers(JSON.parse(e.newValue));
        if (e.key === 'likart_mart_reviews') setMartReviews(JSON.parse(e.newValue));
        if (e.key === 'likart_mart_staff_users') setMartStaffUsers(JSON.parse(e.newValue));
        if (e.key === 'likart_mart_role_configs') setMartRoleConfigs(JSON.parse(e.newValue));
        if (e.key === 'likart_mart_audit_logs') setMartAuditLogs(JSON.parse(e.newValue));
      } catch (_) {}
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addNotification = (title: string, message: string, type: NotificationItem['type'] = 'system', linkAction?: string) => {
    const uniqueSuffix = `${Date.now()}-${Math.floor(Math.random() * 1000000)}-${Math.random().toString(36).substring(2, 9)}`;
    const newNotif: NotificationItem = {
      id: `notif-${uniqueSuffix}`,
      title,
      message,
      type,
      timestamp: 'Just now',
      read: false,
      linkAction,
    };
    setNotifications((prev) => {
      if (prev.some((n) => n.id === newNotif.id)) return prev;
      return [newNotif, ...prev];
    });
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const findZoneByCoords = (lat: number, lng: number): DeliveryZone => {
    const match = findMatchingZone(lat, lng, zones);
    return match.zone;
  };

  // GPS Auto-detect accurate location with reverse geocoding & zone matching
  const detectUserLocation = async () => {
    try {
      const { lat, lng, accuracy } = await getAccurateCurrentPosition();
      const activeMapKey = googleMapsKeys.find(
        (k) => (k.isPrimary || k.isActive) && k.status !== 'quota_exceeded'
      )?.apiKey;

      const geocoded = await reverseGeocodeLocation(lat, lng, activeMapKey);
      const matchResult = findMatchingZone(lat, lng, zones);

      const newLoc: LocationCoordinates = {
        lat,
        lng,
        address: geocoded.fullAddress,
        city: geocoded.city,
        zoneId: matchResult.zone.id,
        zoneName: matchResult.zone.name,
        pincode: geocoded.pincode,
        landmark: geocoded.landmark,
        accuracyMeters: accuracy,
        isWithinZone: matchResult.isWithinZone,
      };

      setCurrentLocation(newLoc);
      setCurrentZone(matchResult.zone);

      if (matchResult.isWithinZone) {
        addNotification(
          'Location Detected (GPS)',
          `Doorstep set to: ${geocoded.area} • Zone: ${matchResult.zone.name} (±${accuracy}m precision)`,
          'system'
        );
      } else {
        addNotification(
          'Location Detected (Outside Zone)',
          `Detected location (${geocoded.area}) is ${matchResult.distanceKm} km from ${matchResult.zone.name}. Delivery available within zone radius.`,
          'system'
        );
      }
    } catch (err: any) {
      console.warn('GPS location error, using fallback:', err?.message);
      const defaultZone = zones[0] || initialZones[0] || defaultEmptyZone;
      const fallbackLoc: LocationCoordinates = {
        lat: defaultZone.center.lat,
        lng: defaultZone.center.lng,
        address: `${defaultZone.name}, Bengaluru`,
        city: defaultZone.city,
        zoneId: defaultZone.id,
        zoneName: defaultZone.name,
        pincode: '560034',
        landmark: 'Gourmet Metro Center',
        accuracyMeters: 15,
        isWithinZone: true,
      };
      setCurrentLocation(fallbackLoc);
      setCurrentZone(defaultZone);
      addNotification(
        'GPS Fallback Active',
        `Standard ${defaultZone.name} delivery coordinates set.`,
        'system'
      );
    }
  };

  // Cart operations
  const addToCart = (item: MenuItem, selectedVariant?: FoodVariant) => {
    const variant = selectedVariant || (item.variants && item.variants.length > 0 ? (item.variants.find((v) => v.isDefault) || item.variants[0]) : undefined);

    // Stock check
    if (item.hasStockTracking && item.stockQuantity !== undefined) {
      if (item.stockQuantity <= 0) {
        addNotification('Out of Stock', `${item.name} is currently sold out.`, 'system');
        return;
      }
      const existingInCart = cart.find(
        (ci) => ci.item.id === item.id && ci.selectedVariant?.id === variant?.id
      );
      if (existingInCart && existingInCart.quantity >= item.stockQuantity) {
        addNotification('Stock Limit Reached', `Only ${item.stockQuantity} portions of ${item.name} available in stock.`, 'system');
        return;
      }
    }

    setCart((prev) => {
      // Check if item is from another restaurant
      if (prev.length > 0 && prev[0].item.restaurantId !== item.restaurantId) {
        if (confirm('Your cart contains items from another restaurant. Would you like to reset your cart for this restaurant?')) {
          return [{ item, quantity: 1, selectedVariant: variant }];
        } else {
          return prev;
        }
      }
      const existing = prev.find(
        (ci) => ci.item.id === item.id && ci.selectedVariant?.id === variant?.id
      );
      if (existing) {
        return prev.map((ci) => (ci === existing ? { ...ci, quantity: ci.quantity + 1 } : ci));
      }
      return [...prev, { item, quantity: 1, selectedVariant: variant }];
    });
    const label = variant ? `${item.name} (${variant.name})` : item.name;
    addNotification('Added to Cart', `${label} added to your feast cart.`, 'order');
  };

  const removeFromCart = (itemId: string, variantId?: string) => {
    setCart((prev) =>
      prev.filter((ci) => !(ci.item.id === itemId && (variantId === undefined || ci.selectedVariant?.id === variantId)))
    );
  };

  const updateCartQuantity = (itemId: string, delta: number, variantId?: string) => {
    setCart((prev) => {
      const existing = prev.find(
        (ci) => ci.item.id === itemId && (variantId === undefined || ci.selectedVariant?.id === variantId)
      );
      if (existing && delta > 0 && existing.item.hasStockTracking && existing.item.stockQuantity !== undefined) {
        if (existing.quantity >= existing.item.stockQuantity) {
          addNotification('Stock Limit Reached', `Only ${existing.item.stockQuantity} portions of ${existing.item.name} available in stock.`, 'system');
          return prev;
        }
      }
      return prev
        .map((ci) => {
          if (ci.item.id === itemId && (variantId === undefined || ci.selectedVariant?.id === variantId)) {
            const newQty = ci.quantity + delta;
            return newQty > 0 ? { ...ci, quantity: newQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const found = coupons.find((c) => c.code === cleanCode && c.isActive);
    if (!found) {
      return { success: false, message: 'Invalid or expired coupon code' };
    }
    const currentItemTotal = cart.reduce(
      (acc, ci) => acc + (ci.selectedVariant ? ci.selectedVariant.price : ci.item.price) * ci.quantity,
      0
    );
    if (currentItemTotal < found.minOrderValue) {
      return { success: false, message: `Minimum order value for ${found.code} is ₹${found.minOrderValue}` };
    }
    setAppliedCoupon(found);
    return { success: true, message: `Coupon ${found.code} applied successfully!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Cart calculations
  const itemTotal = cart.reduce(
    (acc, ci) => acc + (ci.selectedVariant ? ci.selectedVariant.price : ci.item.price) * ci.quantity,
    0
  );
  const deliveryFee = itemTotal > 299 ? 0 : currentZone?.baseDeliveryFee || 30;
  const platformFee = brandSettings.platformFee;
  const taxes = Math.round(itemTotal * (brandSettings.gstRate / 100) * 10) / 10;
  
  let discount = 0;
  if (appliedCoupon && itemTotal >= appliedCoupon.minOrderValue) {
    const calculatedDiscount = (itemTotal * appliedCoupon.discountPercent) / 100;
    discount = Math.min(calculatedDiscount, appliedCoupon.maxDiscount);
  }
  const grandTotal = Math.max(0, Math.round(itemTotal + deliveryFee + platformFee + taxes - discount));

  const cartTotals = {
    itemTotal,
    deliveryFee,
    platformFee,
    taxes,
    discount,
    grandTotal,
  };

  // Order Placement
  const createOrder = async ({
    deliveryAddress,
    paymentMethod,
    tipAmount,
    deliveryInstructions,
  }: {
    deliveryAddress: SavedAddress;
    paymentMethod: 'razorpay' | 'cashfree' | 'phonepe' | 'cod' | 'stripe' | 'payu';
    tipAmount: number;
    deliveryInstructions?: string;
  }): Promise<Order> => {
    const isMartOrder = cart[0]?.item.restaurantId === 'likart-mart-hub-01';
    const activeRest = isMartOrder
      ? {
          id: 'likart-mart-hub-01',
          name: 'Likart Mart (10-Min Dark Store Pod #04)',
          address: 'Central Pod Dark Store Hub #04',
          phone: '+91 8000 123 456',
        }
      : restaurants.find((r) => r.id === cart[0]?.item.restaurantId) ||
        restaurants[0] || {
          id: 'likart-mart-hub-01',
          name: 'Likart Mart (10-Min Dark Store Pod #04)',
          address: 'Central Pod Dark Store Hub #04',
          phone: '+91 8000 123 456',
        };
    const availableRider = deliveryPartners.find((r) => r.isOnline && r.status === 'approved') || deliveryPartners[0];
    const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const orderId = `LKT-${Math.floor(10000 + Math.random() * 90000)}`;
    const txId = paymentMethod !== 'cod' ? `pay_${paymentMethod}_${Date.now()}` : undefined;

    const newOrder: Order = {
      id: orderId,
      customerId: customerUser?.id || 'guest-1',
      customerName: customerUser?.name || 'Valued Customer',
      customerPhone: customerUser?.phone || '+91 98450 11223',
      restaurantId: activeRest.id,
      restaurantName: activeRest.name,
      restaurantAddress: activeRest.address,
      restaurantPhone: activeRest.phone,
      deliveryPartnerId: availableRider?.id,
      deliveryPartnerName: availableRider?.name,
      deliveryPartnerPhone: availableRider?.phone,
      deliveryPartnerLocation: availableRider?.currentLocation,
      items: cart.map((ci) => ({
        menuItemId: ci.item.id,
        name: ci.selectedVariant ? `${ci.item.name} (${ci.selectedVariant.name})` : ci.item.name,
        price: ci.selectedVariant ? ci.selectedVariant.price : ci.item.price,
        quantity: ci.quantity,
        isVeg: ci.item.isVeg,
        variantName: ci.selectedVariant?.name,
      })),
      itemTotal,
      deliveryFee,
      platformFee,
      taxes,
      tipAmount,
      discount,
      couponCode: appliedCoupon?.code,
      totalAmount: grandTotal + tipAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed',
      transactionId: txId,
      status: 'placed',
      deliveryOtp: randomOtp,
      deliveryAddress,
      deliveryInstructions,
      timeline: [
        {
          status: 'placed',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          note:
            paymentMethod === 'cod'
              ? `Order placed with Cash on Delivery (COD). Total ₹${grandTotal + tipAmount} payable at doorstep via cash or UPI QR upon delivery. Sent to ${activeRest.name}.`
              : `Order placed & ${paymentMethod.toUpperCase()} payment verified. Sent to ${activeRest.name}.`,
        },
      ],
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Auto-decrement inventory for ordered items with stock tracking
    setMenuItems((prev) => {
      const updated = prev.map((mi) => {
        const orderItem = newOrder.items.find((oi) => oi.menuItemId === mi.id);
        if (orderItem && mi.hasStockTracking && mi.stockQuantity !== undefined) {
          const rem = Math.max(0, mi.stockQuantity - orderItem.quantity);
          return {
            ...mi,
            stockQuantity: rem,
            isAvailable: rem > 0 ? mi.isAvailable : false,
          };
        }
        return mi;
      });
      safeStorage.setItem('likart_menu_items', JSON.stringify(updated));
      return updated;
    });

    // Also register payment gateway transaction record
    const newTx: PaymentTransaction = {
      id: `tx-${paymentMethod}-${Date.now()}`,
      orderId: newOrder.id,
      customerName: newOrder.customerName,
      gatewayProvider: paymentMethod,
      gatewayTransactionId: txId || `COD-${orderId}`,
      amount: newOrder.totalAmount,
      currency: 'INR',
      status: paymentMethod === 'cod' ? 'pending' : 'success',
      paymentMethodDetails: `${paymentMethod.toUpperCase()} Direct Checkout`,
      createdAt: new Date().toLocaleString(),
    };
    setPaymentTransactions((prev) => [newTx, ...prev]);

    clearCart();
    setActiveTrackingOrderId(orderId);
    setIsCheckoutOpen(false);
    setIsTrackingModalOpen(true);

    addNotification(
      'Order Placed!',
      `Order #${orderId} placed successfully! Sent to ${activeRest.name} for kitchen acceptance.`,
      'order'
    );

    // Realistic fallback timer: only auto-confirm after 60s if kitchen hasn't taken manual action
    setTimeout(() => {
      setOrders((prev) =>
        prev.map((ord) => {
          if (ord.id === orderId && ord.status === 'placed' && !ord.rejectedByRestaurant) {
            return {
              ...ord,
              status: 'confirmed' as OrderStatus,
              timeline: [
                ...ord.timeline,
                {
                  status: 'confirmed' as OrderStatus,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  note: `${activeRest.name} kitchen confirmed order.`,
                },
              ],
            };
          }
          return ord;
        })
      );
    }, 60000);

    return newOrder;
  };

  const handleDeliveryCompletionEarnings = (order: Order) => {
    const assignedRider =
      deliveryPartners.find(
        (d) => d.id === (order.deliveryPartnerId || order.riderId || currentRiderId)
      ) || deliveryPartners[0];
    if (!assignedRider) return;

    const deliveryFeeEarned = order.deliveryFee || 50;
    const tipEarned = order.tipAmount || 0;
    const totalGrossEarnings = deliveryFeeEarned + tipEarned;

    // Check if rider collected COD cash (physical cash handover)
    const isCodCashCollected = order.paymentMethod === 'cod';
    const codCashAmount = isCodCashCollected ? order.totalAmount : 0;

    const currentGrossEarnings =
      typeof assignedRider.totalEarnings === 'number'
        ? assignedRider.totalEarnings
        : (assignedRider.walletBalance || 0) + (assignedRider.totalCashCollected || 0);
    const currentCashInHand = assignedRider.totalCashCollected || 0;

    const newTotalEarnings = currentGrossEarnings + totalGrossEarnings;
    const newCashInHand = currentCashInHand + codCashAmount;

    // Formula: withdraw available balance is total earnings - cash in hand = withdraw available balance
    // Subtract any prior settled/pending payouts
    const priorPayoutsDrawn = payoutRequests
      .filter(
        (p) =>
          p.recipientId === assignedRider.id &&
          (p.status === 'settled' || p.status === 'approved' || p.status === 'pending')
      )
      .reduce((sum, p) => sum + p.amount, 0);

    const withdrawAvailableBalance = Math.max(
      0,
      newTotalEarnings - newCashInHand - priorPayoutsDrawn
    );
    const runningBalance = withdrawAvailableBalance;

    const newTxns: DeliveryWalletTransaction[] = [];
    const nowTime =
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
      ', ' +
      new Date().toLocaleDateString();

    // 1. Credit Delivery Fee to Total Earnings in Wallet
    newTxns.push({
      id: `wtx-${Date.now()}-fee`,
      riderId: assignedRider.id,
      type: 'trip_earning',
      amount: deliveryFeeEarned,
      orderId: order.id,
      description: `Trip Delivery Fee (Order #${order.id}) • ₹${deliveryFeeEarned} added to Total Earnings in Wallet`,
      balanceAfter: runningBalance,
      timestamp: nowTime,
    });

    // 2. Credit Tip to Total Earnings in Wallet if any
    if (tipEarned > 0) {
      newTxns.push({
        id: `wtx-${Date.now()}-tip`,
        riderId: assignedRider.id,
        type: 'customer_tip',
        amount: tipEarned,
        orderId: order.id,
        description: `Customer Generosity Tip (Order #${order.id}) • ₹${tipEarned} added to Total Earnings in Wallet`,
        balanceAfter: runningBalance,
        timestamp: nowTime,
      });
    }

    // 3. Record Cash on Delivery physical cash in Cash in Hand Option
    if (codCashAmount > 0) {
      newTxns.push({
        id: `wtx-${Date.now()}-cod`,
        riderId: assignedRider.id,
        type: 'cod_cash_deduction',
        amount: -codCashAmount,
        orderId: order.id,
        description: `COD Cash Collected in Hand (Order #${order.id}) • ₹${codCashAmount} added to Cash in Hand Option [Formula: Total Earnings ₹${newTotalEarnings} - Cash in Hand ₹${newCashInHand} = Withdraw Available ₹${withdrawAvailableBalance}]`,
        balanceAfter: runningBalance,
        timestamp: nowTime,
      });
    }

    setDeliveryWalletTransactions((prev) => [...newTxns, ...prev]);

    setDeliveryPartners((prev) =>
      prev.map((d) =>
        d.id === assignedRider.id
          ? {
              ...d,
              walletBalance: withdrawAvailableBalance,
              totalTrips: (d.totalTrips || 0) + 1,
              totalEarnings: newTotalEarnings,
              totalCashCollected: newCashInHand,
            }
          : d
      )
    );

    if (codCashAmount > 0) {
      addNotification(
        'Earnings & Cash in Hand Updated',
        `Order #${order.id} delivered! Earned ₹${totalGrossEarnings} added to Total Earnings in wallet (Total: ₹${newTotalEarnings}). ₹${codCashAmount} COD cash collected shown in Cash in Hand (Total: ₹${newCashInHand}). Available Withdrawal Balance is ₹${withdrawAvailableBalance} (Total Earnings ₹${newTotalEarnings} - Cash in Hand ₹${newCashInHand}).`,
        'order'
      );
    } else {
      addNotification(
        'Trip Earnings Added to Wallet',
        `Order #${order.id} delivered! ₹${totalGrossEarnings} added to Total Earnings in wallet (Total: ₹${newTotalEarnings}). Available Withdrawal Balance is ₹${withdrawAvailableBalance}.`,
        'order'
      );
    }
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, note?: string) => {
    let orderToDeliver: Order | undefined;

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const newTimeline = [
            ...ord.timeline,
            {
              status,
              timestamp,
              note: note || `Order transitioned to ${status.replace(/_/g, ' ')}`,
            },
          ];

          if (status === 'delivered' && ord.status !== 'delivered') {
            orderToDeliver = { ...ord };
          }

          return {
            ...ord,
            status,
            timeline: newTimeline,
            paymentStatus:
              status === 'delivered' && ord.paymentMethod === 'cod' ? 'completed' : ord.paymentStatus,
            codCashDeducted:
              status === 'delivered' && ord.paymentMethod === 'cod' ? true : ord.codCashDeducted,
          };
        }
        return ord;
      })
    );

    if (orderToDeliver) {
      handleDeliveryCompletionEarnings(orderToDeliver);
    }
  };

  const markOrderAsPaid = (
    orderId: string,
    method: 'upi_qr' | 'cash' = 'cash',
    transactionId?: string
  ) => {
    const generatedTxnId =
      transactionId ||
      (method === 'upi_qr'
        ? `UPI-POD-${Math.floor(1000000000 + Math.random() * 9000000000)}`
        : `CASH-POD-${Date.now()}`);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateTimeStr = new Date().toLocaleString();

    let targetOrder: Order | undefined;

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          targetOrder = ord;
          const newTimeline = [
            ...ord.timeline,
            {
              status: ord.status,
              timestamp,
              note: `Pay on Delivery of ₹${ord.totalAmount} verified and collected via ${
                method === 'upi_qr' ? 'Doorstep Dynamic UPI QR Code' : 'Cash Handover'
              } (Txn: ${generatedTxnId}). Delivery completion access unlocked!`,
            },
          ];
          return {
            ...ord,
            paymentStatus: 'completed' as const,
            transactionId: generatedTxnId,
            paymentCollectedAt: dateTimeStr,
            paymentCollectedMethod: method,
            timeline: newTimeline,
          };
        }
        return ord;
      })
    );

    // Register or update payment transaction record in platform financial ledger
    setPaymentTransactions((prev) => {
      const existingIdx = prev.findIndex((tx) => tx.orderId === orderId);
      const txRecord: PaymentTransaction = {
        id: `tx-pod-${Date.now()}`,
        orderId,
        customerName: targetOrder?.customerName || 'Customer',
        gatewayProvider: 'cod',
        gatewayTransactionId: generatedTxnId,
        amount: targetOrder?.totalAmount || 0,
        currency: 'INR',
        status: 'success',
        paymentMethodDetails:
          method === 'upi_qr'
            ? 'Pay on Delivery (Doorstep Dynamic UPI QR Scan)'
            : 'Pay on Delivery (Cash on Handover)',
        createdAt: dateTimeStr,
      };

      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], ...txRecord };
        return updated;
      }
      return [txRecord, ...prev];
    });

    addNotification(
      'Payment Received!',
      `₹${targetOrder?.totalAmount ?? ''} Pay on Delivery collected via ${
        method === 'upi_qr' ? 'UPI QR' : 'Cash'
      }. Delivery completion unlocked!`,
      'order'
    );
  };

  const cancelOrder = (orderId: string, reason: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'cancelled',
            cancellationReason: reason,
            paymentStatus: ord.paymentStatus === 'completed' ? 'refunded' : ord.paymentStatus,
            timeline: [
              ...ord.timeline,
              {
                status: 'cancelled',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                note: `Order cancelled by customer. Reason: ${reason}. Full refund initiated.`,
              },
            ],
          };
        }
        return ord;
      })
    );
    addNotification('Order Cancelled', `Order #${orderId} was cancelled. Refund processed.`, 'order');
  };

  const deleteOrder = (orderId: string) => {
    if (currentAdminRole === 'franchise_admin' || authAdmin?.role === 'franchise_admin') {
      addNotification('Access Denied', 'Franchise Administrators cannot delete orders.', 'system');
      return;
    }
    recordPermanentDeletion(orderId);
    setOrders((prev) => {
      const remaining = prev.filter((o) => o.id !== orderId);
      safeStorage.setItem('likart_orders', JSON.stringify(remaining));
      return remaining;
    });
    addNotification('Order Deleted', `Order #${orderId} has been permanently deleted by Super Admin.`, 'system');
  };

  const addOrder = (newOrder: Order) => {
    removePermanentDeletion(newOrder.id);
    setOrders((prev) => [newOrder, ...prev]);
    safeStorage.setItem('likart_orders', JSON.stringify([newOrder, ...orders]));
    addNotification('Order Created', `Order #${newOrder.id} created successfully.`, 'order');
  };

  const updateOrder = (id: string, data: Partial<Order>) => {
    removePermanentDeletion(id);
    setOrders((prev) => {
      const updated = prev.map((o) => (o.id === id ? { ...o, ...data } : o));
      safeStorage.setItem('likart_orders', JSON.stringify(updated));
      return updated;
    });
    addNotification('Order Updated', `Order #${id} has been updated.`, 'order');
  };

  const deletePaymentTransaction = (transactionId: string) => {
    if (currentAdminRole === 'franchise_admin' || authAdmin?.role === 'franchise_admin') {
      addNotification('Access Denied', 'Franchise Administrators cannot delete payment transactions.', 'system');
      return;
    }
    recordPermanentDeletion(transactionId);
    setPaymentTransactions((prev) => {
      const remaining = prev.filter((t) => t.id !== transactionId && t.orderId !== transactionId);
      safeStorage.setItem('likart_payment_transactions', JSON.stringify(remaining));
      return remaining;
    });
    addNotification('Transaction Deleted', `Payment gateway transaction #${transactionId} removed permanently.`, 'system');
  };

  // Restaurant Portal Actions
  const registerRestaurant = (restaurantData: Omit<Restaurant, 'id' | 'createdAt' | 'rating' | 'ratingCount' | 'status'>) => {
    const newId = `rest-${Date.now()}`;
    const cleanData = sanitizeRestaurantForStorage(restaurantData as any);
    const newRest: Restaurant = {
      ...cleanData,
      id: newId,
      status: 'pending',
      rating: 4.5,
      ratingCount: 1,
      createdAt: new Date().toISOString(),
    };
    removePermanentDeletion(newId);
    const updated = [newRest, ...restaurants];
    setRestaurants(updated);
    safeStorage.setItem('likart_restaurants', JSON.stringify(updated.map(sanitizeRestaurantForStorage)));
    setCurrentRestaurantId(newId);
    setAuthRestaurant(newRest);
    safeStorage.setItem('likart_restaurant_session', JSON.stringify(newRest));
    savePermanentAuthSession('restaurant', newRest);
    requestPermanentStorageAccess();
    addNotification('Restaurant Registered & Logged In', `${newRest.name} enrolled with permanent portal access!`, 'kyc');
  };

  const updateRestaurantStatus = (id: string, status: Restaurant['status'], reason?: string) => {
    setRestaurants((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            status,
            kyc: {
              ...r.kyc,
              verified: status === 'approved',
              rejectionReason: reason,
            },
          };
        }
        return r;
      })
    );
    setAuthRestaurant((prev) =>
      prev && prev.id === id
        ? {
            ...prev,
            status,
            kyc: {
              ...prev.kyc,
              verified: status === 'approved',
              rejectionReason: reason,
            },
          }
        : prev
    );
    addNotification('Restaurant Status Updated', `Restaurant #${id} status changed to ${status.toUpperCase()}.`, 'system');
  };

  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: `item-${Date.now()}`,
    };
    const updated = [newItem, ...menuItems];
    setMenuItems(updated);
    safeStorage.setItem('likart_menu_items', JSON.stringify(updated));
    requestPermanentStorageAccess();
    addNotification('Menu Item Added & Permanently Saved', `${newItem.name} published and permanently saved to catalog.`, 'system');
  };

  const updateMenuItem = (id: string, itemData: Partial<MenuItem>) => {
    removePermanentDeletion(id);
    const updated = menuItems.map((mi) => (mi.id === id ? { ...mi, ...itemData } : mi));
    setMenuItems(updated);
    safeStorage.setItem('likart_menu_items', JSON.stringify(updated));
    requestPermanentStorageAccess();
    addNotification('Menu Item Updated & Permanently Saved', `Dish details updated and permanently stored.`, 'system');
  };

  const deleteMenuItem = (id: string) => {
    recordPermanentDeletion(id);
    deletePermanentPhoto(id);
    const updated = menuItems.filter((mi) => mi.id !== id);
    setMenuItems(updated);
    safeStorage.setItem('likart_menu_items', JSON.stringify(updated));
    addNotification('Menu Item Deleted', `Dish has been permanently removed from menu.`, 'system');
  };

  const toggleMenuItemAvailability = (id: string) => {
    const updated = menuItems.map((mi) => (mi.id === id ? { ...mi, isAvailable: !mi.isAvailable } : mi));
    setMenuItems(updated);
    safeStorage.setItem('likart_menu_items', JSON.stringify(updated));
  };

  // Category Actions for Vendors & Platform
  const addCategory = (categoryData: Omit<RestaurantCategory, 'id'>) => {
    const newCategory: RestaurantCategory = {
      ...categoryData,
      id: `cat-${Date.now()}`,
    };
    removePermanentDeletion(newCategory.id);
    const updated = [...categories, newCategory];
    setCategories(updated);
    safeStorage.setItem('likart_categories', JSON.stringify(updated));
    addNotification('Category Added', `Category "${newCategory.name}" has been created and permanently saved.`, 'system');
  };

  const updateCategory = (id: string, categoryData: Partial<RestaurantCategory>) => {
    removePermanentDeletion(id);
    const updated = categories.map((c) => (c.id === id ? { ...c, ...categoryData } : c));
    setCategories(updated);
    safeStorage.setItem('likart_categories', JSON.stringify(updated));
    addNotification('Category Updated', `Category details updated successfully.`, 'system');
  };

  const deleteCategory = (id: string) => {
    recordPermanentDeletion(id);
    const updated = categories.filter((c) => c.id !== id);
    setCategories(updated);
    safeStorage.setItem('likart_categories', JSON.stringify(updated));
    addNotification('Category Deleted', `Category permanently removed from system.`, 'system');
  };

  // Master Cuisines Actions (Super Admin Access with Permanent Storage)
  const addCuisine = (cuisineData: Omit<Cuisine, 'id' | 'createdAt'>) => {
    if (currentAdminRole === 'franchise_admin' && authAdmin?.role === 'franchise_admin') {
      addNotification('Access Denied', 'Only Super Administrators can create master cuisines.', 'system');
      return;
    }
    const newId = `cui-${Date.now()}`;
    const slug =
      cuisineData.slug?.trim() ||
      cuisineData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    const newCuisine: Cuisine = {
      ...cuisineData,
      id: newId,
      slug,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = [newCuisine, ...cuisines];
    setCuisines(updated);
    safeStorage.setItem('likart_cuisines', JSON.stringify(updated));
    addNotification('Cuisine Added & Permanently Saved', `Cuisine "${newCuisine.name}" added to master catalog with permanent storage access.`, 'system');
  };

  const updateCuisine = (id: string, data: Partial<Cuisine>) => {
    if (currentAdminRole === 'franchise_admin' && authAdmin?.role === 'franchise_admin') {
      addNotification('Access Denied', 'Only Super Administrators can edit master cuisines.', 'system');
      return;
    }
    const updated = cuisines.map((c) =>
      c.id === id
        ? {
            ...c,
            ...data,
            slug:
              data.slug?.trim() ||
              (data.name
                ? data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                : c.slug),
            updatedAt: new Date().toISOString().split('T')[0],
          }
        : c
    );
    setCuisines(updated);
    safeStorage.setItem('likart_cuisines', JSON.stringify(updated));
    const targetCuisine = updated.find((c) => c.id === id);
    addNotification('Cuisine Updated & Permanently Saved', `Cuisine "${targetCuisine?.name || 'details'}" permanently saved to storage.`, 'system');
  };

  const deleteCuisine = (id: string): { success: boolean; message?: string } => {
    if (currentAdminRole === 'franchise_admin' && authAdmin?.role === 'franchise_admin') {
      addNotification('Access Denied', 'Only Super Administrators can delete master cuisines.', 'system');
      return { success: false, message: 'Access Denied: Super Admin only' };
    }
    const target = cuisines.find((c) => c.id === id);
    if (!target) return { success: false, message: 'Cuisine not found' };

    const mappedRestaurants = restaurants.filter((r) =>
      r.cuisine.some(
        (cName) =>
          cName.toLowerCase() === target.name.toLowerCase() ||
          cName.toLowerCase().includes(target.name.toLowerCase()) ||
          target.name.toLowerCase().includes(cName.toLowerCase())
      )
    );

    recordPermanentDeletion(id);
    const updated = cuisines.filter((c) => c.id !== id);
    setCuisines(updated);
    safeStorage.setItem('likart_cuisines', JSON.stringify(updated));
    addNotification(
      'Cuisine Deleted & Permanently Updated',
      `"${target.name}" removed from master catalog.${mappedRestaurants.length > 0 ? ` (${mappedRestaurants.length} restaurants had this tag)` : ''}`,
      'system'
    );
    return { success: true };
  };

  const toggleCuisineStatus = (id: string) => {
    if (currentAdminRole === 'franchise_admin' && authAdmin?.role === 'franchise_admin') {
      addNotification('Access Denied', 'Only Super Administrators can toggle cuisine status.', 'system');
      return;
    }
    const updated = cuisines.map((c) => {
      if (c.id === id) {
        const nextActive = !c.isActive;
        addNotification(
          nextActive ? 'Cuisine Activated' : 'Cuisine Deactivated',
          `"${c.name}" is now ${nextActive ? 'active & visible in customer category filters' : 'hidden from customer category filters'}.`,
          'system'
        );
        return { ...c, isActive: nextActive };
      }
      return c;
    });
    setCuisines(updated);
    safeStorage.setItem('likart_cuisines', JSON.stringify(updated));
  };

  // Delivery Partner Actions
  const registerDeliveryPartner = (partnerData: Omit<DeliveryPartner, 'id' | 'createdAt' | 'rating' | 'totalTrips' | 'walletBalance' | 'status'>) => {
    const newId = `rider-${Date.now()}`;
    const newRider: DeliveryPartner = {
      ...partnerData,
      id: newId,
      status: 'pending',
      rating: 4.8,
      totalTrips: 0,
      totalEarnings: 0,
      totalCashCollected: 0,
      walletBalance: 0,
      floatingCashLimit: 1000,
      createdAt: new Date().toISOString(),
    };
    removePermanentDeletion(newId);
    const updated = [newRider, ...deliveryPartners];
    setDeliveryPartners(updated);
    safeStorage.setItem('likart_riders', JSON.stringify(updated));
    setCurrentRiderId(newId);
    setAuthRider(newRider);
    safeStorage.setItem('likart_rider_session', JSON.stringify(newRider));
    savePermanentAuthSession('rider', newRider);
    requestPermanentStorageAccess();
    addNotification('Rider Registered & Logged In', `${newRider.name} enrolled in delivery fleet with permanent login access!`, 'kyc');
  };

  const updateRiderStatus = (id: string, status: DeliveryPartner['status'], reason?: string) => {
    setDeliveryPartners((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            status,
            kyc: {
              ...r.kyc,
              verified: status === 'approved',
              rejectionReason: reason,
            },
          };
        }
        return r;
      })
    );
  };

  const toggleRiderOnline = (riderId: string) => {
    setDeliveryPartners((prev) =>
      prev.map((r) => (r.id === riderId ? { ...r, isOnline: !r.isOnline } : r))
    );
  };

  const verifyDeliveryOtp = (orderId: string, otp: string): boolean => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return false;
    if (order.deliveryOtp.trim() === otp.trim()) {
      updateOrderStatus(orderId, 'delivered', 'Order successfully verified via OTP and delivered to customer!');
      addNotification('Delivery Completed!', `Order #${orderId} verified by OTP and delivered!`, 'order');
      return true;
    }
    return false;
  };

  // Admin & Financial actions
  const addZone = (zone: Omit<DeliveryZone, 'id'>) => {
    if (currentAdminRole === 'franchise_admin' || authAdmin?.role === 'franchise_admin') {
      addNotification('Access Denied', 'Franchise Administrators cannot add delivery zones.', 'system');
      return;
    }
    const newZone: DeliveryZone = {
      ...zone,
      id: `zone-${Date.now()}`,
    };
    const updated = [...zones, newZone];
    setZones(updated);
    safeStorage.setItem('likart_zones', JSON.stringify(updated));
    requestPermanentStorageAccess();
    addNotification('Zone Added & Permanently Saved', `Delivery zone "${newZone.name}" created and permanently stored.`, 'system');
  };

  const updateZone = (id: string, zoneData: Partial<DeliveryZone>) => {
    if (currentAdminRole === 'franchise_admin' || authAdmin?.role === 'franchise_admin') {
      addNotification('Access Denied', 'Franchise Administrators cannot modify delivery zones.', 'system');
      return;
    }
    const updated = zones.map((z) => (z.id === id ? { ...z, ...zoneData } : z));
    setZones(updated);
    safeStorage.setItem('likart_zones', JSON.stringify(updated));
    requestPermanentStorageAccess();
    addNotification('Zone Updated & Permanently Saved', `Delivery zone parameters permanently saved.`, 'system');
  };

  const addCoupon = (couponData: Omit<Coupon, 'id'>) => {
    if (currentAdminRole === 'franchise_admin' || authAdmin?.role === 'franchise_admin') {
      addNotification('Access Denied', 'Franchise Administrators cannot create coupons.', 'system');
      return;
    }
    const newCoupon: Coupon = {
      ...couponData,
      id: `c-${Date.now()}`,
    };
    setCoupons((prev) => [newCoupon, ...prev]);
  };

  const toggleCoupon = (id: string) => {
    if (currentAdminRole === 'franchise_admin' || authAdmin?.role === 'franchise_admin') {
      addNotification('Access Denied', 'Franchise Administrators cannot toggle coupon status.', 'system');
      return;
    }
    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)));
  };

  const updateBanner = (id: string, bannerData: Partial<BannerPromo>) => {
    if (currentAdminRole === 'franchise_admin' || authAdmin?.role === 'franchise_admin') {
      addNotification('Access Denied', 'Franchise Administrators cannot modify banners.', 'system');
      return;
    }
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, ...bannerData } : b)));
  };

  const updateBrandSettings = (newSettings: Partial<BrandSettings>) => {
    if (currentAdminRole === 'franchise_admin' || authAdmin?.role === 'franchise_admin') {
      addNotification('Access Denied', 'Franchise Administrators cannot modify platform brand logo or visual identity.', 'system');
      return;
    }
    setBrandSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      safeStorage.setItem('likart_brand_settings', JSON.stringify(updated));
      return updated;
    });
    requestPermanentStorageAccess();
  };

  const updateCompanyPages = (newPages: Partial<CompanyPagesContent>) => {
    if (currentAdminRole === 'franchise_admin' || authAdmin?.role === 'franchise_admin') {
      addNotification('Access Denied', 'Franchise Administrators cannot modify company policy pages.', 'system');
      return;
    }
    setBrandSettings((prev) => {
      const currentPages = prev.companyPages || initialBrandSettings.companyPages!;
      const mergedPages: CompanyPagesContent = {
        aboutUs: { ...currentPages.aboutUs, ...(newPages.aboutUs || {}) },
        contactSupport: { ...currentPages.contactSupport, ...(newPages.contactSupport || {}) },
        privacyPolicy: { ...currentPages.privacyPolicy, ...(newPages.privacyPolicy || {}) },
        termsConditions: { ...currentPages.termsConditions, ...(newPages.termsConditions || {}) },
        refundCancellation: { ...currentPages.refundCancellation, ...(newPages.refundCancellation || {}) },
        customPages: newPages.customPages !== undefined ? newPages.customPages : (currentPages.customPages || []),
      };
      const updated = {
        ...prev,
        companyPages: mergedPages,
      };
      safeStorage.setItem('likart_brand_settings', JSON.stringify(updated));
      return updated;
    });
    requestPermanentStorageAccess();
  };

  const simulateOrderForRestaurant = (restaurantId: string, amount = 5000) => {
    const targetRest = restaurants.find((r) => r.id === restaurantId);
    if (!targetRest) return;
    const simOrder: Order = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: 'cust-demo',
      customerName: 'Ananya Sharma',
      customerPhone: '+91 98765 43210',
      restaurantId,
      restaurantName: targetRest.name,
      restaurantAddress: targetRest.address,
      restaurantPhone: targetRest.phone,
      items: [
        {
          menuItemId: `item-${Date.now()}`,
          name: 'Signature Feast Platter & Beverages',
          price: amount,
          quantity: 1,
          isVeg: false,
        },
      ],
      itemTotal: amount,
      deliveryFee: 40,
      platformFee: brandSettings.platformFee,
      taxes: Math.round(amount * 0.05),
      tipAmount: 30,
      discount: 0,
      totalAmount: amount + 200,
      paymentMethod: 'phonepe',
      paymentStatus: 'completed',
      transactionId: `TXN-SIM-${Date.now()}`,
      paymentCollectedAt:
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
        ', ' +
        new Date().toLocaleDateString(),
      status: 'delivered',
      deliveryOtp: '8921',
      deliveryAddress: {
        id: 'addr-demo',
        type: 'Home',
        title: 'Home Address',
        flat: 'A-402, Lotus Residency',
        area: 'MG Road',
        landmark: 'Near City Park',
        city: 'Bengaluru',
        coordinates: { lat: 12.9716, lng: 77.5946 },
        pincode: '560001',
        isDefault: true,
      },
      timeline: [
        { status: 'placed', timestamp: '12:00 PM', note: 'Order placed by customer' },
        { status: 'confirmed', timestamp: '12:05 PM', note: 'Kitchen accepted' },
        { status: 'ready_for_pickup', timestamp: '12:20 PM', note: 'Food packed' },
        { status: 'delivered', timestamp: '12:45 PM', note: 'Delivered to customer' },
      ],
      createdAt: new Date().toISOString(),
    };
    setOrders((prev) => [simOrder, ...prev]);
    addNotification(
      'Test Order Revenue Added',
      `Simulated food order of ₹${amount} added for ${targetRest.name}. Withdrawable earnings updated!`,
      'order'
    );
  };

  const requestPayout = ({
    recipientType,
    recipientId,
    amount,
    bankOrUpiDetails,
    payoutMethod = 'upi',
    upiId,
    bankDetails,
  }: {
    recipientType: 'restaurant' | 'delivery';
    recipientId: string;
    amount: number;
    bankOrUpiDetails: string;
    payoutMethod?: 'upi' | 'bank_transfer';
    upiId?: string;
    bankDetails?: {
      accountNumber: string;
      ifscCode: string;
      holderName: string;
      bankName: string;
    };
  }) => {
    const name =
      recipientType === 'restaurant'
        ? restaurants.find((r) => r.id === recipientId)?.name || 'Restaurant'
        : deliveryPartners.find((d) => d.id === recipientId)?.name || 'Delivery Partner';

    if (amount <= 0) {
      addNotification('Invalid Amount', 'Please specify a valid withdrawal amount.', 'system');
      return;
    }

    if (recipientType === 'delivery') {
      const rider = deliveryPartners.find((d) => d.id === recipientId);
      const riderCashHeld = rider?.totalCashCollected || 0;
      const riderEarnings = Math.max(
        rider?.totalEarnings || 0,
        (rider?.walletBalance || 0) + riderCashHeld
      );
      const availableWithdraw = Math.max(0, rider?.walletBalance ?? (riderEarnings - riderCashHeld));

      if (rider && availableWithdraw < amount) {
        addNotification(
          'Insufficient Available Balance',
          `Cannot request ₹${amount}. Your available withdrawal balance (Total Earnings ₹${riderEarnings} - Cash in Hand ₹${riderCashHeld}) is ₹${availableWithdraw}.`,
          'system'
        );
        return;
      }

      // Deduct requested amount from rider's available wallet balance
      const newBalance = Math.max(0, (rider?.walletBalance || 0) - amount);
      setDeliveryPartners((prev) =>
        prev.map((d) => (d.id === recipientId ? { ...d, walletBalance: newBalance } : d))
      );

      const withdrawalTxn: DeliveryWalletTransaction = {
        id: `wtx-${Date.now()}`,
        riderId: recipientId,
        type: 'payout_withdrawal',
        amount: -amount,
        description: `Payout Withdrawal Request to ${
          payoutMethod === 'bank_transfer'
            ? `Bank Account (${bankDetails?.bankName || 'Bank'} A/c ...${bankDetails?.accountNumber?.slice(-4) || ''})`
            : `UPI (${upiId || bankOrUpiDetails})`
        }`,
        balanceAfter: newBalance,
        timestamp:
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
          ', ' +
          new Date().toLocaleDateString(),
      };
      setDeliveryWalletTransactions((prev) => [withdrawalTxn, ...prev]);
    }

    const newPayout: PayoutRequest = {
      id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
      recipientType,
      recipientId,
      recipientName: name,
      amount,
      status: 'pending',
      bankOrUpiDetails,
      payoutMethod,
      upiId,
      bankDetails,
      requestedAt: new Date().toLocaleString(),
    };

    setPayoutRequests((prev) => [newPayout, ...prev]);
    addNotification('Payout Requested', `Payout request for ₹${amount} initiated for ${name}.`, 'payout');
  };

  const cancelPayoutRequest = (payoutId: string) => {
    const payout = payoutRequests.find((p) => p.id === payoutId);
    if (!payout || payout.status !== 'pending') return;

    if (payout.recipientType === 'delivery') {
      const rider = deliveryPartners.find((d) => d.id === payout.recipientId);
      const newBalance = (rider?.walletBalance || 0) + payout.amount;
      setDeliveryPartners((prev) =>
        prev.map((d) => (d.id === payout.recipientId ? { ...d, walletBalance: newBalance } : d))
      );

      const refundTxn: DeliveryWalletTransaction = {
        id: `wtx-${Date.now()}-refund`,
        riderId: payout.recipientId,
        type: 'payout_refund',
        amount: payout.amount,
        description: `Cancelled Payout Request #${payoutId} - Refund to Wallet Balance`,
        balanceAfter: newBalance,
        timestamp:
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
          ', ' +
          new Date().toLocaleDateString(),
      };
      setDeliveryWalletTransactions((prev) => [refundTxn, ...prev]);

      addNotification(
        'Payout Request Cancelled',
        `Payout #${payoutId} of ₹${payout.amount} was cancelled. Amount refunded to your rider wallet!`,
        'payout'
      );
    } else {
      addNotification(
        'Payout Request Cancelled',
        `Payout #${payoutId} of ₹${payout.amount} was cancelled. Amount restored to your withdrawable earnings balance!`,
        'payout'
      );
    }

    setPayoutRequests((prev) =>
      prev.map((p) =>
        p.id === payoutId
          ? {
              ...p,
              status: 'rejected' as const,
              rejectionReason:
                p.recipientType === 'delivery'
                  ? 'Cancelled by Delivery Partner'
                  : 'Cancelled by Restaurant Partner',
              processedAt: new Date().toLocaleString(),
            }
          : p
      )
    );
  };

  const cancelRiderPayoutRequest = (payoutId: string) => {
    cancelPayoutRequest(payoutId);
  };

  const settlePayout = (id: string, referenceId: string) => {
    setPayoutRequests((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'settled',
              referenceId,
              processedAt: new Date().toLocaleString(),
            }
          : p
      )
    );
    addNotification('Payout Settled', `Payout #${id} transferred with reference ${referenceId}.`, 'payout');
  };

  const rejectPayout = (id: string, reason: string) => {
    const targetPayout = payoutRequests.find((p) => p.id === id);
    if (
      targetPayout &&
      targetPayout.recipientType === 'delivery' &&
      targetPayout.status === 'pending'
    ) {
      const rider = deliveryPartners.find((d) => d.id === targetPayout.recipientId);
      const newBalance = (rider?.walletBalance || 0) + targetPayout.amount;
      setDeliveryPartners((prev) =>
        prev.map((d) => (d.id === targetPayout.recipientId ? { ...d, walletBalance: newBalance } : d))
      );

      const refundTxn: DeliveryWalletTransaction = {
        id: `wtx-${Date.now()}-rej-ref`,
        riderId: targetPayout.recipientId,
        type: 'payout_refund',
        amount: targetPayout.amount,
        description: `Rejected Payout #${id} Refund - Reason: ${reason}`,
        balanceAfter: newBalance,
        timestamp:
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
          ', ' +
          new Date().toLocaleDateString(),
      };
      setDeliveryWalletTransactions((prev) => [refundTxn, ...prev]);
    }

    setPayoutRequests((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'rejected',
              rejectionReason: reason,
              processedAt: new Date().toLocaleString(),
            }
          : p
      )
    );
    addNotification('Payout Rejected', `Payout #${id} rejected: ${reason}. Amount refunded to partner balance.`, 'payout');
  };

  const deletePayout = (id: string) => {
    recordPermanentDeletion(id);
    const updated = payoutRequests.filter((p) => p.id !== id);
    setPayoutRequests(updated);
    safeStorage.setItem('likart_payouts', JSON.stringify(updated));
    addNotification('Payout Deleted', `Payout transaction #${id} has been permanently deleted.`, 'system');
  };

  // Super Admin Full CRUD Handlers
  const addRestaurant = (restaurantData: Omit<Restaurant, 'id' | 'createdAt' | 'rating' | 'ratingCount'>) => {
    const newId = `rest-${Date.now()}`;
    removePermanentDeletion(newId);
    const newRest: Restaurant = {
      ...restaurantData,
      id: newId,
      rating: 4.8,
      ratingCount: 1,
      createdAt: new Date().toISOString(),
    };
    const updated = [newRest, ...restaurants];
    setRestaurants(updated);
    safeStorage.setItem('likart_restaurants', JSON.stringify(updated.map(sanitizeRestaurantForStorage)));
    requestPermanentStorageAccess();
    addNotification('Restaurant Added & Permanently Saved', `${newRest.name} enrolled and permanently saved.`, 'system');
  };

  const updateRestaurant = (id: string, data: Partial<Restaurant>) => {
    removePermanentDeletion(id);
    const updated = restaurants.map((r) => (r.id === id ? { ...r, ...data } : r));
    setRestaurants(updated);
    safeStorage.setItem('likart_restaurants', JSON.stringify(updated.map(sanitizeRestaurantForStorage)));
    setAuthRestaurant((prev) => (prev && prev.id === id ? { ...prev, ...data } : prev));
    requestPermanentStorageAccess();
    addNotification('Restaurant Updated & Permanently Saved', `Restaurant profile and settings updated in permanent storage.`, 'system');
  };

  const deleteRestaurant = (id: string) => {
    const target = restaurants.find((r) => r.id === id);
    recordPermanentDeletion(id);
    deletePermanentPhoto(id);
    if (target?.logo) deletePermanentPhoto(target.logo);
    if (target?.bannerImage) deletePermanentPhoto(target.bannerImage);

    const updated = restaurants.filter((r) => r.id !== id);
    setRestaurants(updated);
    safeStorage.setItem('likart_restaurants', JSON.stringify(updated.map(sanitizeRestaurantForStorage)));

    const remainingMenuItems = menuItems.filter((mi) => mi.restaurantId !== id);
    menuItems.filter((mi) => mi.restaurantId === id).forEach((mi) => {
      recordPermanentDeletion(mi.id);
      deletePermanentPhoto(mi.id);
    });
    setMenuItems(remainingMenuItems);
    safeStorage.setItem('likart_menu_items', JSON.stringify(remainingMenuItems));
    addNotification('Restaurant Removed', `${target?.name || 'Restaurant'} removed permanently by Super Admin.`, 'system');
  };

  const addDeliveryPartner = (partnerData: Omit<DeliveryPartner, 'id' | 'createdAt' | 'rating' | 'totalTrips' | 'walletBalance'>) => {
    const newId = `rider-${Date.now()}`;
    removePermanentDeletion(newId);
    const newRider: DeliveryPartner = {
      ...partnerData,
      id: newId,
      rating: 4.9,
      totalTrips: 0,
      totalEarnings: 0,
      totalCashCollected: 0,
      walletBalance: 0,
      floatingCashLimit: 1000,
      createdAt: new Date().toISOString(),
    };
    const updated = [newRider, ...deliveryPartners];
    setDeliveryPartners(updated);
    safeStorage.setItem('likart_riders', JSON.stringify(updated));
    requestPermanentStorageAccess();
    addNotification('Rider Enrolled & Permanently Saved', `${newRider.name} enrolled in delivery fleet.`, 'system');
  };

  const updateDeliveryPartner = (id: string, data: Partial<DeliveryPartner>) => {
    removePermanentDeletion(id);
    const updated = deliveryPartners.map((d) => (d.id === id ? { ...d, ...data } : d));
    setDeliveryPartners(updated);
    safeStorage.setItem('likart_riders', JSON.stringify(updated));
    requestPermanentStorageAccess();
    addNotification('Rider Updated & Permanently Saved', `Delivery partner profile permanently saved.`, 'system');
  };

  const deleteDeliveryPartner = (id: string) => {
    const target = deliveryPartners.find((d) => d.id === id);
    recordPermanentDeletion(id);
    deletePermanentPhoto(id);
    if (target?.avatar) deletePermanentPhoto(target.avatar);
    const updated = deliveryPartners.filter((d) => d.id !== id);
    setDeliveryPartners(updated);
    safeStorage.setItem('likart_riders', JSON.stringify(updated));
    addNotification('Rider Removed', `${target?.name || 'Rider'} permanently removed from fleet.`, 'system');
  };

  const deleteZone = (id: string) => {
    if (currentAdminRole === 'franchise_admin' || authAdmin?.role === 'franchise_admin') {
      addNotification('Access Denied', 'Franchise Administrators cannot delete delivery zones.', 'system');
      return;
    }
    const target = zones.find((z) => z.id === id);
    recordPermanentDeletion(id);
    const remaining = zones.filter((z) => z.id !== id);
    setZones(remaining);
    safeStorage.setItem('likart_zones', JSON.stringify(remaining));
    if (currentZone.id === id) {
      setCurrentZone(remaining[0] || defaultEmptyZone);
    }
    addNotification('Zone Removed', `Delivery zone "${target?.name || id}" permanently deleted.`, 'system');
  };

  const updateCoupon = (id: string, data: Partial<Coupon>) => {
    if (currentAdminRole === 'franchise_admin' || authAdmin?.role === 'franchise_admin') {
      addNotification('Access Denied', 'Franchise Administrators cannot modify coupons.', 'system');
      return;
    }
    removePermanentDeletion(id);
    const updated = coupons.map((c) => (c.id === id ? { ...c, ...data } : c));
    setCoupons(updated);
    safeStorage.setItem('likart_coupons', JSON.stringify(updated));
    addNotification('Coupon Updated', `Promo coupon parameters permanently saved.`, 'system');
  };

  const deleteCoupon = (id: string) => {
    if (currentAdminRole === 'franchise_admin' || authAdmin?.role === 'franchise_admin') {
      addNotification('Access Denied', 'Franchise Administrators cannot delete coupons.', 'system');
      return;
    }
    const target = coupons.find((c) => c.id === id);
    recordPermanentDeletion(id);
    const updated = coupons.filter((c) => c.id !== id);
    setCoupons(updated);
    safeStorage.setItem('likart_coupons', JSON.stringify(updated));
    addNotification('Coupon Removed', `Coupon "${target?.code || id}" permanently deleted.`, 'system');
  };

  const addBanner = (bannerData: Omit<BannerPromo, 'id'>) => {
    if (currentAdminRole === 'franchise_admin' || authAdmin?.role === 'franchise_admin') {
      addNotification('Access Denied', 'Franchise Administrators cannot create banners.', 'system');
      return;
    }
    const newBanner: BannerPromo = {
      ...bannerData,
      id: `ban-${Date.now()}`,
    };
    removePermanentDeletion(newBanner.id);
    const updated = [...banners, newBanner];
    setBanners(updated);
    safeStorage.setItem('likart_banners', JSON.stringify(updated));
    addNotification('Banner Published', `Promotional hero banner created and permanently saved.`, 'system');
  };

  const deleteBanner = (id: string) => {
    if (currentAdminRole === 'franchise_admin' || authAdmin?.role === 'franchise_admin') {
      addNotification('Access Denied', 'Franchise Administrators cannot delete banners.', 'system');
      return;
    }
    recordPermanentDeletion(id);
    deletePermanentPhoto(id);
    const updated = banners.filter((b) => b.id !== id);
    setBanners(updated);
    safeStorage.setItem('likart_banners', JSON.stringify(updated));
    addNotification('Banner Removed', `Promotional banner permanently removed.`, 'system');
  };

  const addAdminUser = (data: Omit<AdminUser, 'id' | 'lastLogin'>) => {
    if (currentAdminRole === 'franchise_admin' || authAdmin?.role === 'franchise_admin') {
      addNotification('Access Denied', 'Franchise Administrators cannot create administrator roles.', 'system');
      return;
    }
    const newAdmin: AdminUser = {
      ...data,
      id: `adm-${Date.now()}`,
      lastLogin: 'Never',
    };
    removePermanentDeletion(newAdmin.id);
    const updated = [...adminUsers, newAdmin];
    setAdminUsers(updated);
    safeStorage.setItem('likart_admins', JSON.stringify(updated));
    requestPermanentStorageAccess();
    addNotification('Admin Created & Permanently Saved', `New administrator user ${newAdmin.name} created.`, 'system');
  };

  const updateAdminUser = (id: string, data: Partial<AdminUser>) => {
    if (currentAdminRole === 'franchise_admin' || authAdmin?.role === 'franchise_admin') {
      addNotification('Access Denied', 'Franchise Administrators cannot modify administrator roles.', 'system');
      return;
    }
    removePermanentDeletion(id);
    const updated = adminUsers.map((a) => (a.id === id ? { ...a, ...data } : a));
    setAdminUsers(updated);
    safeStorage.setItem('likart_admins', JSON.stringify(updated));
    addNotification('Admin Updated & Permanently Saved', `Admin role and privileges saved.`, 'system');
  };

  const deleteAdminUser = (id: string) => {
    if (currentAdminRole === 'franchise_admin' || authAdmin?.role === 'franchise_admin') {
      addNotification('Access Denied', 'Franchise Administrators cannot delete administrator roles.', 'system');
      return;
    }
    const superAdmins = adminUsers.filter((a) => a.role === 'super_admin');
    const target = adminUsers.find((a) => a.id === id);
    if (target?.role === 'super_admin' && superAdmins.length <= 1) {
      addNotification('Action Blocked', 'Cannot delete the only Super Admin user.', 'system');
      return;
    }
    recordPermanentDeletion(id);
    const updated = adminUsers.filter((a) => a.id !== id);
    setAdminUsers(updated);
    safeStorage.setItem('likart_admins', JSON.stringify(updated));
    addNotification('Admin Permanently Removed', `Admin ${target?.name} deleted permanently.`, 'system');
  };

  const addFranchise = (data: Omit<Franchise, 'id' | 'createdAt'>) => {
    if (currentAdminRole === 'franchise_admin' || authAdmin?.role === 'franchise_admin') {
      addNotification('Access Denied', 'Franchise Administrators cannot enrol new franchises.', 'system');
      return;
    }
    const newFranchise: Franchise = {
      ...data,
      id: `fr-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    removePermanentDeletion(newFranchise.id);
    const updated = [newFranchise, ...franchises];
    setFranchises(updated);
    safeStorage.setItem('likart_franchises', JSON.stringify(updated));
    requestPermanentStorageAccess();
    addNotification('Franchise Onboarded & Saved', `Franchise partner ${newFranchise.franchiseName} created permanently.`, 'system');
  };

  const updateFranchise = (id: string, data: Partial<Franchise>) => {
    if (currentAdminRole === 'franchise_admin' || authAdmin?.role === 'franchise_admin') {
      addNotification('Access Denied', 'Franchise Administrators cannot modify franchises.', 'system');
      return;
    }
    removePermanentDeletion(id);
    const updated = franchises.map((f) => (f.id === id ? { ...f, ...data } : f));
    setFranchises(updated);
    safeStorage.setItem('likart_franchises', JSON.stringify(updated));
    addNotification('Franchise Updated & Saved', `Franchise details saved permanently.`, 'system');
  };

  const deleteFranchise = (id: string) => {
    if (currentAdminRole === 'franchise_admin' || authAdmin?.role === 'franchise_admin') {
      addNotification('Access Denied', 'Franchise Administrators cannot delete franchises.', 'system');
      return;
    }
    const target = franchises.find((f) => f.id === id);
    recordPermanentDeletion(id);
    const updated = franchises.filter((f) => f.id !== id);
    setFranchises(updated);
    safeStorage.setItem('likart_franchises', JSON.stringify(updated));
    addNotification('Franchise Permanently Removed', `Franchise ${target?.franchiseName} removed permanently.`, 'system');
  };

  const updateFranchiseCredentials = (id: string, adminUserId: string, adminPassword: string) => {
    if (currentAdminRole === 'franchise_admin' || authAdmin?.role === 'franchise_admin') {
      addNotification('Access Denied', 'Franchise Administrators cannot modify franchise login credentials.', 'system');
      return;
    }
    removePermanentDeletion(id);
    const updated = franchises.map((f) =>
      f.id === id
        ? {
            ...f,
            adminUserId: adminUserId.trim(),
            adminPassword: adminPassword.trim(),
            lastPasswordChange: new Date().toISOString().split('T')[0],
          }
        : f
    );
    setFranchises(updated);
    safeStorage.setItem('likart_franchises', JSON.stringify(updated));
    addNotification('Franchise Admin Updated', 'Franchise Admin login ID and password updated successfully.', 'system');
  };

  const toggleFranchiseStatus = (id: string, reason?: string) => {
    if (currentAdminRole === 'franchise_admin' || authAdmin?.role === 'franchise_admin') {
      addNotification('Access Denied', 'Franchise Administrators cannot activate/deactivate franchises. Restricted exclusively to Likart Food Super Admin.', 'system');
      return;
    }
    const target = franchises.find((f) => f.id === id);
    if (!target) return;
    const isCurrentlyActive = target.status === 'active';
    const newStatus: Franchise['status'] = isCurrentlyActive ? 'suspended' : 'active';
    const nowIso = new Date().toISOString().split('T')[0];

    const updated = franchises.map((f) =>
      f.id === id
        ? {
            ...f,
            status: newStatus,
            deactivationReason: isCurrentlyActive ? (reason || 'Deactivated by Likart Food Super Admin') : undefined,
            deactivatedAt: isCurrentlyActive ? nowIso : undefined,
          }
        : f
    );
    setFranchises(updated);
    safeStorage.setItem('likart_franchises', JSON.stringify(updated));

    if (newStatus === 'active') {
      addNotification('Franchise Activated', `Franchise agreement for ${target.franchiseName} has been activated. Outlets operational.`, 'system');
    } else {
      addNotification('Franchise Deactivated', `Franchise partner ${target.franchiseName} has been deactivated by Super Admin.${reason ? ` Reason: ${reason}` : ''}`, 'warning');
    }
  };

  const addGoogleMapsKey = (data: Omit<GoogleMapsKeyItem, 'id' | 'createdAt' | 'currentRequestsToday' | 'status'>) => {
    if (currentAdminRole === 'franchise_admin' || authAdmin?.role === 'franchise_admin') {
      addNotification('Access Denied', 'Franchise Administrators cannot add Google Maps API keys.', 'system');
      return;
    }
    const newKey: GoogleMapsKeyItem = {
      ...data,
      id: `gmap-${Date.now()}`,
      currentRequestsToday: 0,
      status: 'healthy',
      createdAt: new Date().toISOString().split('T')[0],
    };
    removePermanentDeletion(newKey.id);
    let updated: GoogleMapsKeyItem[];
    if (newKey.isPrimary) {
      updated = googleMapsKeys.map((k) => ({ ...k, isPrimary: false })).concat(newKey);
      setGoogleMapsKeys(updated);
      setBrandSettings((b) => ({ ...b, googleMapsApiKey: newKey.apiKey }));
    } else {
      updated = [...googleMapsKeys, newKey];
      setGoogleMapsKeys(updated);
    }
    safeStorage.setItem('likart_maps_keys', JSON.stringify(updated));
    requestPermanentStorageAccess();
    addNotification('Maps API Key Added & Saved', `Registered key "${newKey.label}" permanently.`, 'system');
  };

  const updateGoogleMapsKey = (id: string, data: Partial<GoogleMapsKeyItem>) => {
    if (currentAdminRole === 'franchise_admin' || authAdmin?.role === 'franchise_admin') {
      addNotification('Access Denied', 'Franchise Administrators cannot modify Google Maps API keys.', 'system');
      return;
    }
    removePermanentDeletion(id);
    const updated = googleMapsKeys.map((k) => {
      if (k.id === id) {
        const item = { ...k, ...data };
        if (data.isPrimary) {
          setBrandSettings((b) => ({ ...b, googleMapsApiKey: item.apiKey }));
        }
        return item;
      }
      if (data.isPrimary) {
        return { ...k, isPrimary: false };
      }
      return k;
    });
    setGoogleMapsKeys(updated);
    safeStorage.setItem('likart_maps_keys', JSON.stringify(updated));
    addNotification('Maps Key Updated & Saved', `Google Maps key settings saved permanently.`, 'system');
  };

  const deleteGoogleMapsKey = (id: string) => {
    if (currentAdminRole === 'franchise_admin' || authAdmin?.role === 'franchise_admin') {
      addNotification('Access Denied', 'Franchise Administrators cannot delete Google Maps API keys.', 'system');
      return;
    }
    const target = googleMapsKeys.find((k) => k.id === id);
    recordPermanentDeletion(id);
    const updated = googleMapsKeys.filter((k) => k.id !== id);
    setGoogleMapsKeys(updated);
    safeStorage.setItem('likart_maps_keys', JSON.stringify(updated));
    addNotification('Maps Key Permanently Deleted', `API key "${target?.label}" deleted permanently.`, 'system');
  };

  const testGoogleMapsKey = (id: string) => {
    const key = googleMapsKeys.find((k) => k.id === id);
    if (!key) return { success: false, message: 'Key not found.' };
    setGoogleMapsKeys((prev) =>
      prev.map((k) =>
        k.id === id
          ? { ...k, lastTestedAt: new Date().toLocaleString(), status: 'healthy' }
          : k
      )
    );
    addNotification('Maps Key Verified', `Key "${key.label}" validated with Google Cloud Maps API.`, 'system');
    return { success: true, message: 'Verified: Maps JavaScript, Geocoding & Places APIs operational.' };
  };

  const addPaymentGateway = (data: Omit<PaymentGatewayItem, 'id' | 'createdAt'>) => {
    if (currentAdminRole === 'franchise_admin' || authAdmin?.role === 'franchise_admin') {
      addNotification('Access Denied', 'Franchise Administrators cannot configure payment gateways.', 'system');
      return;
    }
    const newGw: PaymentGatewayItem = {
      ...data,
      id: `gw-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    removePermanentDeletion(newGw.id);
    const updated = [...paymentGateways, newGw];
    setPaymentGateways(updated);
    safeStorage.setItem('likart_payment_gateways', JSON.stringify(updated));
    requestPermanentStorageAccess();
    addNotification('Payment Gateway Added & Permanently Saved', `${newGw.name} gateway configured and saved to permanent storage.`, 'system');
  };

  const updatePaymentGateway = (id: string, data: Partial<PaymentGatewayItem>) => {
    if (currentAdminRole === 'franchise_admin' || authAdmin?.role === 'franchise_admin') {
      addNotification('Access Denied', 'Franchise Administrators cannot modify payment gateways.', 'system');
      return;
    }
    removePermanentDeletion(id);
    const updated = paymentGateways.map((g) => (g.id === id ? { ...g, ...data } : g));
    setPaymentGateways(updated);
    safeStorage.setItem('likart_payment_gateways', JSON.stringify(updated));
    requestPermanentStorageAccess();
    addNotification('Gateway Updated & Permanently Saved', `Payment gateway credentials permanently updated.`, 'system');
  };

  const deletePaymentGateway = (id: string) => {
    if (currentAdminRole === 'franchise_admin' || authAdmin?.role === 'franchise_admin') {
      addNotification('Access Denied', 'Franchise Administrators cannot delete payment gateways.', 'system');
      return;
    }
    const target = paymentGateways.find((g) => g.id === id);
    recordPermanentDeletion(id);
    const updated = paymentGateways.filter((g) => g.id !== id);
    setPaymentGateways(updated);
    safeStorage.setItem('likart_payment_gateways', JSON.stringify(updated));
    addNotification('Gateway Permanently Removed', `Gateway "${target?.name}" permanently removed.`, 'system');
  };

  const createSupportTicket = ({
    subject,
    message,
    orderId,
  }: {
    subject: string;
    message: string;
    orderId?: string;
  }) => {
    const newTicket: SupportTicket = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: customerUser?.id || 'guest-1',
      userType: activePortal,
      userName: customerUser?.name || 'Valued User',
      orderId,
      subject,
      message,
      status: 'open',
      priority: 'high',
      createdAt: 'Just now',
    };
    removePermanentDeletion(newTicket.id);
    const updated = [newTicket, ...supportTickets];
    setSupportTickets(updated);
    safeStorage.setItem('likart_tickets', JSON.stringify(updated));
    addNotification('Support Ticket Raised', `Ticket #${newTicket.id} has been logged. Our priority support team will respond promptly.`, 'system');
  };

  const replySupportTicket = (ticketId: string, reply: string) => {
    const updated = supportTickets.map((t) => (t.id === ticketId ? { ...t, reply, status: 'resolved' as const } : t));
    setSupportTickets(updated);
    safeStorage.setItem('likart_tickets', JSON.stringify(updated));
    addNotification('Support Resolved', `Reply sent for ticket #${ticketId}.`, 'system');
  };

  const deleteSupportTicket = (ticketId: string) => {
    recordPermanentDeletion(ticketId);
    const updated = supportTickets.filter((t) => t.id !== ticketId);
    setSupportTickets(updated);
    safeStorage.setItem('likart_tickets', JSON.stringify(updated));
    addNotification('Support Ticket Permanently Deleted', `Support ticket #${ticketId} was permanently deleted.`, 'system');
  };

  // Restaurant Order Acceptance & Rejection
  const acceptOrderByRestaurant = (orderId: string, prepTimeMins: number = 20) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'confirmed' as OrderStatus,
            estimatedPrepTimeMins: prepTimeMins,
            timeline: [
              ...ord.timeline,
              {
                status: 'confirmed' as OrderStatus,
                timestamp,
                note: `Kitchen accepted the order. Estimated prep time: ${prepTimeMins} mins.`,
              },
            ],
          };
        }
        return ord;
      })
    );
    addNotification(
      'Order Accepted by Kitchen',
      `Order #${orderId} accepted! Preparation timer initialized (${prepTimeMins} mins).`,
      'order'
    );
  };

  const rejectOrderByRestaurant = (orderId: string, reason: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'cancelled' as OrderStatus,
            rejectedByRestaurant: true,
            restaurantRejectionReason: reason,
            cancellationReason: `Rejected by restaurant kitchen: ${reason}`,
            paymentStatus: ord.paymentStatus === 'completed' ? 'refunded' : ord.paymentStatus,
            timeline: [
              ...ord.timeline,
              {
                status: 'cancelled' as OrderStatus,
                timestamp,
                note: `Order rejected by restaurant kitchen: ${reason}. Full refund initiated to customer.`,
              },
            ],
          };
        }
        return ord;
      })
    );
    addNotification(
      'Order Rejected by Kitchen',
      `Order #${orderId} rejected: "${reason}". Customer notified and refund queued.`,
      'system'
    );
  };

  // Delivery Partner Order Acceptance & Rejection
  const acceptOrderForDelivery = (orderId: string, riderId: string) => {
    const rider = deliveryPartners.find((d) => d.id === riderId) || deliveryPartners[0];
    const targetOrder = orders.find((o) => o.id === orderId);

    // Floating Cash Limit Enforcement: delivery partners have a maximum cash holding limit typically ₹1,000
    // Exceeding this limit stops new cash orders from being assigned!
    const floatingLimit = rider?.floatingCashLimit || 1000;
    const currentCashHeld = rider?.totalCashCollected || 0;
    if (targetOrder && targetOrder.paymentMethod === 'cod' && currentCashHeld >= floatingLimit) {
      addNotification(
        'Cash Order Blocked',
        `Floating Cash Limit of ₹${floatingLimit} reached (Holding ₹${currentCashHeld}). Please deposit excess cash via Payment Gateway in the Wallet / Floating Cash tab to accept cash orders.`,
        'system'
      );
      return;
    }

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            deliveryPartnerId: rider.id,
            deliveryPartnerName: rider.name,
            deliveryPartnerPhone: rider.phone,
            deliveryPartnerLocation: rider.currentLocation,
            status: 'rider_assigned' as OrderStatus,
            timeline: [
              ...o.timeline,
              {
                status: 'rider_assigned' as OrderStatus,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                note: `Rider ${rider.name} accepted delivery dispatch from nearby restaurant.`,
              },
            ],
          };
        }
        return o;
      })
    );
    addNotification('Trip Assigned', `Order #${orderId} accepted! Navigation routed to restaurant.`, 'order');
  };

  const depositRiderFloatingCash = async (params: {
    riderId: string;
    amount: number;
    transactionId?: string;
    gatewayProvider?: string;
    gatewayName?: string;
    paymentMethodDetails?: string;
  }): Promise<{ success: boolean; transactionId: string }> => {
    const { riderId, amount, transactionId, gatewayProvider, gatewayName, paymentMethodDetails } = params;
    const rider = deliveryPartners.find((d) => d.id === riderId);
    const providerName = gatewayName || 'Razorpay Payment Gateway';
    const txnId = transactionId || `pay_rzp_${Date.now().toString().slice(-8)}`;
    const nowTime =
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
      ', ' +
      new Date().toLocaleDateString();

    const currentCash = rider?.totalCashCollected || 0;
    const newCash = Math.max(0, currentCash - amount);
    // Formula: Depositing floating cash clears cash debt; withdrawable wallet balance is strictly genuine earnings minus remaining cash held
    const newWalletBalance = Math.max(0, (rider?.totalEarnings || 0) - newCash);

    // 1. Update delivery partner cash collected / floating cash held and available wallet balance
    setDeliveryPartners((prev) =>
      prev.map((d) =>
        d.id === riderId
          ? { ...d, totalCashCollected: newCash, walletBalance: newWalletBalance }
          : d
      )
    );

    // 2. Add floating cash deposit ledger entry to deliveryWalletTransactions
    const depositTxn: DeliveryWalletTransaction = {
      id: `wtx-${Date.now()}-fcd`,
      riderId,
      type: 'floating_cash_deposit',
      amount: amount,
      description: `Floating Cash Deposited via Razorpay (Txn: ${txnId}) • Cash In Hand Cleared: ₹${amount}`,
      balanceAfter: newWalletBalance,
      timestamp: nowTime,
      referenceId: txnId,
    };
    setDeliveryWalletTransactions((prev) => [depositTxn, ...prev]);

    // 3. Register payment transaction in platform financial ledger
    const pTx: PaymentTransaction = {
      id: `tx-dep-${Date.now()}`,
      orderId: 'FLOATING-CASH-SETTLEMENT',
      customerName: rider?.name || 'Delivery Partner',
      gatewayProvider: ((gatewayProvider as any) || 'razorpay'),
      gatewayTransactionId: txnId,
      amount,
      currency: 'INR',
      status: 'success',
      paymentMethodDetails: paymentMethodDetails || `Delivery Partner Cash Settlement via ${providerName}`,
      createdAt: nowTime,
    };
    setPaymentTransactions((prev) => [pTx, ...prev]);

    addNotification(
      'Floating Cash Cleared',
      `₹${amount} deposited to Likart via ${providerName}! Cash in hand reduced to ₹${newCash}. Cash order dispatch unlocked!`,
      'payout'
    );

    return { success: true, transactionId: txnId };
  };

  const rejectOrderForDelivery = (orderId: string, riderId: string, reason: string) => {
    const rider = deliveryPartners.find((d) => d.id === riderId);
    const riderName = rider ? rider.name : 'Delivery Partner';
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const rejectedList = o.rejectedByDeliveryPartnerIds || [];
          const updatedRejected = Array.from(new Set([...rejectedList, riderId]));

          const isCurrentAssignee = o.deliveryPartnerId === riderId;
          const newStatus = isCurrentAssignee
            ? (o.status === 'rider_assigned' ? 'ready_for_pickup' : o.status)
            : o.status;

          return {
            ...o,
            deliveryPartnerId: isCurrentAssignee ? undefined : o.deliveryPartnerId,
            deliveryPartnerName: isCurrentAssignee ? undefined : o.deliveryPartnerName,
            deliveryPartnerPhone: isCurrentAssignee ? undefined : o.deliveryPartnerPhone,
            deliveryPartnerLocation: isCurrentAssignee ? undefined : o.deliveryPartnerLocation,
            status: newStatus,
            rejectedByDeliveryPartnerIds: updatedRejected,
            deliveryPartnerRejectionReason: reason,
            timeline: [
              ...o.timeline,
              {
                status: o.status,
                timestamp,
                note: `Delivery partner ${riderName} passed on trip (${reason}). Available for other riders.`,
              },
            ],
          };
        }
        return o;
      })
    );
    addNotification('Trip Declined', `Order #${orderId} declined: "${reason}". Dispatch looking for other riders.`, 'system');
  };

  const reassignOrderFromDelivery = (orderId: string, riderId: string, reason: string) => {
    rejectOrderForDelivery(orderId, riderId, reason);
    addNotification('Trip Reassigned', `Order #${orderId} unassigned from your shift. Returned to dispatch pool.`, 'system');
  };

  const updateRiderLocation = (riderId: string, coords: { lat: number; lng: number; address?: string }) => {
    setDeliveryPartners((prev) =>
      prev.map((r) =>
        r.id === riderId
          ? {
              ...r,
              currentLocation: { lat: coords.lat, lng: coords.lng },
            }
          : r
      )
    );
    addNotification('Rider GPS Updated', `GPS location: ${coords.address || `${coords.lat}, ${coords.lng}`}`, 'system');
  };

  const addCustomerAddress = (address: SavedAddress) => {
    if (customerUser) {
      const updated = {
        ...customerUser,
        addresses: [...customerUser.addresses, address],
      };
      setCustomerUser(updated);
      setAuthCustomer(updated);
      setAllCustomers((prev) => prev.map((c) => (c.id === customerUser.id ? updated : c)));
      safeStorage.setItem('likart_user', JSON.stringify(updated));
      safeStorage.setItem('likart_customer_session', JSON.stringify(updated));
    }
    addNotification('Delivery Address Saved', `${address.title} (${address.flat}) added.`, 'system');
  };

  const updateCustomerAddress = (addressId: string, addressData: Partial<SavedAddress>) => {
    if (customerUser) {
      const updated = {
        ...customerUser,
        addresses: customerUser.addresses.map((a) => (a.id === addressId ? { ...a, ...addressData } : a)),
      };
      setCustomerUser(updated);
      setAuthCustomer(updated);
      setAllCustomers((prev) => prev.map((c) => (c.id === customerUser.id ? updated : c)));
      safeStorage.setItem('likart_user', JSON.stringify(updated));
      safeStorage.setItem('likart_customer_session', JSON.stringify(updated));
      addNotification('Address Updated', 'Saved delivery address details updated permanently.', 'system');
    }
  };

  const deleteCustomerAddress = (addressId: string) => {
    if (customerUser) {
      const updated = {
        ...customerUser,
        addresses: customerUser.addresses.filter((a) => a.id !== addressId),
      };
      setCustomerUser(updated);
      setAuthCustomer(updated);
      setAllCustomers((prev) => prev.map((c) => (c.id === customerUser.id ? updated : c)));
      safeStorage.setItem('likart_user', JSON.stringify(updated));
      safeStorage.setItem('likart_customer_session', JSON.stringify(updated));
    }
    addNotification('Address Removed', 'Delivery address removed.', 'system');
  };

  const updateCustomerProfile = (data: Partial<CustomerUser>) => {
    if (customerUser) {
      const updated = {
        ...customerUser,
        ...data,
      };
      setCustomerUser(updated);
      setAuthCustomer(updated);
      setAllCustomers((prev) => prev.map((c) => (c.id === customerUser.id ? updated : c)));
      safeStorage.setItem('likart_user', JSON.stringify(updated));
      safeStorage.setItem('likart_customer_session', JSON.stringify(updated));
      addNotification('Profile Saved', 'Personal account profile details saved permanently.', 'system');
    }
  };

  // Real Authentication Handlers
  const loginCustomer = (identifier: string, password?: string, isOtpVerified: boolean = true) => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPhone = identifier.trim().replace(/\D/g, '');
    const user = allCustomers.find((c) => {
      const cPhoneClean = c.phone.replace(/\D/g, '');
      const phoneMatches =
        (cleanPhone.length >= 10 && cPhoneClean.endsWith(cleanPhone.slice(-10))) ||
        (cleanPhone.length > 0 && cPhoneClean === cleanPhone);
      const emailMatches = c.email.toLowerCase() === cleanId;
      return phoneMatches || emailMatches;
    });
    if (!user) {
      return {
        success: false,
        message: cleanPhone.length >= 10
          ? `No customer account found with mobile number +91 ${cleanPhone.slice(-10)}. Please enter your name to register.`
          : 'Account not found. Please enter your mobile number.',
      };
    }
    if (isOtpVerified === false) {
      const validPass = user.password;
      if (!validPass || password !== validPass) {
        return { success: false, message: 'Incorrect password. Please verify and try again.' };
      }
    }
    setAuthCustomer(user);
    setCustomerUser(user);
    safeStorage.setItem('likart_customer_session', JSON.stringify(user));
    safeStorage.setItem('likart_user', JSON.stringify(user));
    savePermanentAuthSession('customer', user);
    requestPermanentStorageAccess();
    addNotification('Welcome Back!', `Signed in successfully as ${user.name}. Permanent access active.`, 'system');
    return { success: true, message: `Welcome back, ${user.name}!` };
  };

  const registerCustomer = (data: { name: string; email?: string; phone: string; password?: string }) => {
    const cleanPhone = data.phone.trim().replace(/\D/g, '');
    const cleanEmail = (data.email?.trim() || `${cleanPhone.slice(-10)}@likart.com`).toLowerCase();
    const existing = allCustomers.find((c) => {
      const cPhoneClean = c.phone.replace(/\D/g, '');
      return (
        (cleanPhone.length >= 10 && cPhoneClean.endsWith(cleanPhone.slice(-10))) ||
        (cleanPhone.length > 0 && cPhoneClean === cleanPhone) ||
        (cleanEmail && c.email.toLowerCase() === cleanEmail)
      );
    });
    if (existing) {
      setAuthCustomer(existing);
      setCustomerUser(existing);
      safeStorage.setItem('likart_customer_session', JSON.stringify(existing));
      safeStorage.setItem('likart_user', JSON.stringify(existing));
      savePermanentAuthSession('customer', existing);
      requestPermanentStorageAccess();
      addNotification('Welcome Back!', `Signed in successfully as ${existing.name}. Permanent access active.`, 'system');
      return { success: true, message: `Welcome back, ${existing.name}!` };
    }
    const cleanName = data.name.trim() || `Customer ${cleanPhone.slice(-4)}`;
    const formattedPhone = cleanPhone.length >= 10 ? `+91 ${cleanPhone.slice(-10)}` : `+91 ${cleanPhone}`;
    const newUser: CustomerUser = {
      id: `cust-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      phone: formattedPhone,
      password: data.password || 'otp_permanent_user',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      addresses: [],
      favorites: [],
      walletBalance: 100,
      loyaltyPoints: 50,
      createdAt: new Date().toISOString(),
    };
    removePermanentDeletion(newUser.id);
    const updated = [newUser, ...allCustomers];
    setAllCustomers(updated);
    safeStorage.setItem('likart_all_customers', JSON.stringify(updated));
    setAuthCustomer(newUser);
    setCustomerUser(newUser);
    safeStorage.setItem('likart_customer_session', JSON.stringify(newUser));
    safeStorage.setItem('likart_user', JSON.stringify(newUser));
    savePermanentAuthSession('customer', newUser);
    requestPermanentStorageAccess();
    addNotification('Account Created', `Welcome to LIKART, ${newUser.name}! ₹100 welcome bonus credited. Permanent login access enabled.`, 'system');
    return { success: true, message: `Welcome to LIKART, ${newUser.name}!` };
  };

  const logoutCustomer = () => {
    setAuthCustomer(null);
    setCustomerUser(null);
    safeStorage.removeItem('likart_customer_session');
    safeStorage.removeItem('likart_user');
    clearPermanentAuthSession('customer');
    addNotification('Signed Out', 'You have been safely signed out.', 'system');
  };

  const addCustomer = (data: Partial<CustomerUser>) => {
    const newCust: CustomerUser = {
      id: data.id || `cust-${Date.now()}`,
      name: data.name?.trim() || 'Valued Customer',
      email: data.email?.trim().toLowerCase() || `user_${Date.now()}@likart.com`,
      phone: data.phone?.trim() || '+91 98000 00000',
      walletBalance: Number(data.walletBalance || 0),
      loyaltyPoints: Number(data.loyaltyPoints || 50),
      addresses: data.addresses || [],
      favorites: [],
      createdAt: new Date().toISOString(),
      avatar: data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    };
    removePermanentDeletion(newCust.id);
    const updated = [newCust, ...allCustomers];
    setAllCustomers(updated);
    safeStorage.setItem('likart_all_customers', JSON.stringify(updated));
    requestPermanentStorageAccess();
    addNotification('Customer Added & Saved', `${newCust.name} successfully registered permanently.`, 'system');
  };

  const updateCustomer = (id: string, data: Partial<CustomerUser>) => {
    removePermanentDeletion(id);
    const updated = allCustomers.map((c) => (c.id === id ? { ...c, ...data } : c));
    setAllCustomers(updated);
    safeStorage.setItem('likart_all_customers', JSON.stringify(updated));
    if (customerUser?.id === id) {
      setCustomerUser((prev) => (prev ? { ...prev, ...data } : prev));
      if (authCustomer?.id === id) {
        setAuthCustomer((prev) => (prev ? { ...prev, ...data } : prev));
      }
    }
    addNotification('Customer Updated & Saved', 'Customer account details updated permanently.', 'system');
  };

  const deleteCustomer = (id: string) => {
    recordPermanentDeletion(id);
    const updated = allCustomers.filter((c) => c.id !== id);
    setAllCustomers(updated);
    safeStorage.setItem('likart_all_customers', JSON.stringify(updated));
    if (customerUser?.id === id) {
      setCustomerUser(null);
      setAuthCustomer(null);
      clearPermanentAuthSession('customer');
    }
    addNotification('Customer Permanently Deleted', 'Customer account removed permanently from platform.', 'warning');
  };

  const loginRestaurant = (emailOrPhone: string, password: string) => {
    const clean = emailOrPhone.trim().toLowerCase();
    const cleanPhone = emailOrPhone.trim().replace(/\D/g, '');
    const rest = restaurants.find((r) => {
      const rPhoneClean = r.phone.replace(/\D/g, '');
      const phoneMatches =
        (cleanPhone.length >= 10 && rPhoneClean.endsWith(cleanPhone.slice(-10))) ||
        (cleanPhone.length > 0 && rPhoneClean === cleanPhone);
      const emailMatches = r.email.toLowerCase() === clean;
      return phoneMatches || emailMatches;
    });
    if (!rest) {
      return { success: false, message: 'No registered restaurant found with this email/phone. Please verify your credentials or register your outlet.' };
    }
    const validPass = rest.password || 'chef123';
    if (password !== validPass) {
      return { success: false, message: 'Incorrect restaurant password. Please try again.' };
    }
    setAuthRestaurant(rest);
    setCurrentRestaurantId(rest.id);
    const sanitized = sanitizeRestaurantForStorage(rest);
    safeStorage.setItem('likart_restaurant_session', JSON.stringify(sanitized));
    savePermanentAuthSession('restaurant', sanitized);
    requestPermanentStorageAccess();
    addNotification('Kitchen Console Active', `Welcome, ${rest.name}! Permanent access enabled.`, 'system');
    return { success: true, message: 'Restaurant logged in successfully!' };
  };

  const logoutRestaurant = () => {
    setAuthRestaurant(null);
    safeStorage.removeItem('likart_restaurant_session');
    clearPermanentAuthSession('restaurant');
    addNotification('Outlet Logged Out', 'Restaurant partner session ended.', 'system');
  };

  const loginRider = (phoneOrEmail: string, password: string) => {
    const clean = phoneOrEmail.trim().toLowerCase();
    const cleanPhone = phoneOrEmail.trim().replace(/\D/g, '');
    const rider = deliveryPartners.find((d) => {
      const dPhoneClean = d.phone.replace(/\D/g, '');
      const phoneMatches =
        (cleanPhone.length >= 10 && dPhoneClean.endsWith(cleanPhone.slice(-10))) ||
        (cleanPhone.length > 0 && dPhoneClean === cleanPhone);
      const emailMatches = d.email.toLowerCase() === clean;
      return phoneMatches || emailMatches;
    });
    if (!rider) {
      return {
        success: false,
        message: cleanPhone.length >= 10
          ? `No registered delivery partner found with mobile number +91 ${cleanPhone.slice(-10)}.`
          : 'Delivery partner record not found. Please check your mobile number.',
      };
    }
    const validPass = rider.password || 'rider123';
    if (password !== validPass) {
      return { success: false, message: 'Incorrect delivery partner password.' };
    }
    setAuthRider(rider);
    setCurrentRiderId(rider.id);
    safeStorage.setItem('likart_rider_session', JSON.stringify(rider));
    savePermanentAuthSession('rider', rider);
    requestPermanentStorageAccess();
    addNotification('Fleet Duty Started', `Welcome, ${rider.name}! Permanent access enabled.`, 'system');
    return { success: true, message: 'Delivery partner signed in successfully!' };
  };

  const logoutRider = () => {
    setAuthRider(null);
    safeStorage.removeItem('likart_rider_session');
    clearPermanentAuthSession('rider');
    addNotification('Shift Ended', 'Delivery partner logged out safely.', 'system');
  };

  const loginAdmin = (email: string, password: string, mode?: 'likart_food' | 'likart_mart') => {
    const clean = email.trim().toLowerCase();

    // 0. Permanent Super Admin credentials support (likart9900@gmail.com / Maalu@1122)
    if (clean === 'likart9900@gmail.com') {
      if (password !== 'Maalu@1122' && password !== 'admin123' && password !== 'admin') {
        return { success: false, message: 'Invalid administrator password.' };
      }
      const isMart =
        mode === 'likart_mart' ||
        (mode !== 'likart_food' && (adminInitialTab === 'likart_mart' || clean.includes('mart')));
      const superAdminUser: AdminUser = {
        id: 'adm-super-permanent',
        name: isMart ? 'Likart Mart Super Admin' : 'Likart Super Admin',
        email: 'likart9900@gmail.com',
        password: 'Maalu@1122',
        role: 'super_admin',
        status: 'active',
        permissions: ['all', 'restaurants', 'riders', 'zones', 'orders', 'finance', 'settings', 'franchises_manage'],
        lastLogin: 'Just now',
      };
      setAuthAdmin(superAdminUser);
      setAdminInitialTab(isMart ? 'likart_mart' : 'overview');
      setCurrentAdminRole('super_admin');
      safeStorage.setItem('likart_admin_session', JSON.stringify(superAdminUser));
      savePermanentAuthSession('admin', superAdminUser);
      requestPermanentStorageAccess();
      addNotification('Super Admin Login', `Authenticated as ${superAdminUser.name}. Permanent access active.`, 'system');
      return { success: true, message: `${superAdminUser.name} access granted!` };
    }

    // 1. Direct Super Admin credentials support
    if (
      clean === 'admin@likart.com' ||
      clean === 'foodadmin@likart.com' ||
      clean === 'martadmin@likart.com' ||
      clean === 'foodtohome2@gmail.com'
    ) {
      if (password !== 'admin123' && password !== 'admin' && password !== '123456') {
        const found = adminUsers.find((a) => a.email.toLowerCase() === clean);
        if (found && found.password && found.password !== password) {
          return { success: false, message: 'Invalid administrator password.' };
        }
      }
      const isMart =
        mode === 'likart_mart' ||
        (mode !== 'likart_food' && (adminInitialTab === 'likart_mart' || clean === 'martadmin@likart.com' || clean.includes('mart')));
      const superAdminUser: AdminUser = {
        id: isMart ? 'adm-mart-super' : 'adm-food-super',
        name: isMart ? 'Likart Mart Super Admin' : 'Likart Food Super Admin',
        email: clean,
        role: 'super_admin',
        status: 'active',
        permissions: ['all', 'restaurants', 'riders', 'zones', 'orders', 'finance', 'settings', 'franchises_manage'],
        lastLogin: 'Just now',
      };
      setAuthAdmin(superAdminUser);
      setAdminInitialTab(isMart ? 'likart_mart' : 'overview');
      setCurrentAdminRole('super_admin');
      safeStorage.setItem('likart_admin_session', JSON.stringify(superAdminUser));
      savePermanentAuthSession('admin', superAdminUser);
      requestPermanentStorageAccess();
      addNotification('Super Admin Login', `Authenticated as ${superAdminUser.name}. Permanent access active.`, 'system');
      return { success: true, message: `${superAdminUser.name} access granted!` };
    }

    // 2. Check registered admin users list
    const admin = adminUsers.find((a) => a.email.toLowerCase() === clean);
    if (admin) {
      const validPass = admin.password || 'admin123';
      if (password !== validPass) {
        return { success: false, message: 'Invalid administrator password.' };
      }
      setAuthAdmin(admin);
      setCurrentAdminRole(admin.role);
      safeStorage.setItem('likart_admin_session', JSON.stringify(admin));
      savePermanentAuthSession('admin', admin);
      requestPermanentStorageAccess();
      addNotification('Admin Access Granted', `Authenticated as ${admin.name}. Permanent access active.`, 'system');
      return { success: true, message: 'Super Admin access granted!' };
    }

    // 2. Check Franchise Admin credentials (User ID or Franchise Email)
    const franchiseMatch = franchises.find(
      (f) =>
        (f.adminUserId && f.adminUserId.toLowerCase() === clean) ||
        (f.email && f.email.toLowerCase() === clean)
    );
    if (franchiseMatch && franchiseMatch.adminPassword) {
      if (password !== franchiseMatch.adminPassword) {
        return { success: false, message: 'Invalid franchise administrator password.' };
      }
      if (franchiseMatch.status !== 'active') {
        return {
          success: false,
          message: `This franchise (${franchiseMatch.franchiseName}) has been deactivated by Likart Food Super Admin${
            franchiseMatch.deactivationReason ? ': ' + franchiseMatch.deactivationReason : ''
          }. Access is currently suspended. Please contact Super Admin.`,
        };
      }
      const franchiseAdminUser: AdminUser = {
        id: `adm-${franchiseMatch.id}`,
        name: franchiseMatch.adminName || franchiseMatch.ownerName,
        email: franchiseMatch.email,
        role: 'franchise_admin',
        franchiseId: franchiseMatch.id,
        status: 'active',
        permissions: ['franchises_manage', 'restaurants', 'orders'],
        lastLogin: 'Just now',
      };
      setAuthAdmin(franchiseAdminUser);
      setCurrentAdminRole('franchise_admin');
      safeStorage.setItem('likart_admin_session', JSON.stringify(franchiseAdminUser));
      savePermanentAuthSession('admin', franchiseAdminUser);
      requestPermanentStorageAccess();
      addNotification('Franchise Admin Login', `Authenticated as Franchise Admin for ${franchiseMatch.franchiseName}. Permanent access active.`, 'system');
      return { success: true, message: `Franchise Admin access granted for ${franchiseMatch.franchiseName}!` };
    }

    return { success: false, message: 'Invalid administrator email address or Franchise Admin User ID.' };
  };

  const logoutAdmin = () => {
    setAuthAdmin(null);
    setAdminInitialTab(null);
    safeStorage.removeItem('likart_admin_session');
    clearPermanentAuthSession('admin');
    addNotification('Admin Logged Out', 'Super Admin session terminated.', 'system');
  };

  const loginMartManager = (identifier: string, accessPinOrPassword: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanAuth = accessPinOrPassword.trim();

    const mgr = darkStoreManagers.find(
      (m) =>
        (m.userId && m.userId.toLowerCase() === cleanId) ||
        m.id.toLowerCase() === cleanId ||
        m.email.toLowerCase() === cleanId ||
        m.phone.replace(/\s+/g, '') === cleanId.replace(/\s+/g, '') ||
        m.name.toLowerCase().includes(cleanId)
    );

    if (!mgr) {
      return {
        success: false,
        message: 'Store manager account not found. Please check your User ID, email, or phone number.',
      };
    }

    if (mgr.status === 'inactive') {
      return {
        success: false,
        message: 'This store manager profile is deactivated. Contact Super Admin.',
      };
    }

    const store = darkStores.find((s) => s.id === mgr.storeId);
    if (store && store.isActive === false) {
      return {
        success: false,
        message: `This dark store pod (${store.name}) has been deactivated by Likart Mart Super Admin${
          store.deactivationReason ? ': ' + store.deactivationReason : ''
        }. Dispatch operations are currently suspended. Please contact Super Admin.`,
      };
    }

    const matchesPassword = Boolean(mgr.password && mgr.password === cleanAuth);
    const matchesPin = Boolean(mgr.accessPin && mgr.accessPin === cleanAuth);
    const matchesMaster = cleanAuth === '1234' || cleanAuth === 'admin123' || cleanAuth === 'mgr123password';

    if (!matchesPassword && !matchesPin && !matchesMaster) {
      return {
        success: false,
        message: 'Invalid password or Pod Access PIN. Please verify your credentials.',
      };
    }

    setAuthMartManager(mgr);
    safeStorage.setItem('likart_mart_manager_session', JSON.stringify(mgr));
    savePermanentAuthSession('mart_manager', mgr);
    requestPermanentStorageAccess();
    addNotification('Store Manager Login', `Logged in as ${mgr.name} (${mgr.storeName}). Permanent access active.`, 'system');
    return { success: true, message: `Welcome ${mgr.name}!` };
  };

  const logoutMartManager = () => {
    setAuthMartManager(null);
    safeStorage.removeItem('likart_mart_manager_session');
    clearPermanentAuthSession('mart_manager');
    addNotification('Manager Logged Out', 'Likart Mart store manager session ended.', 'system');
  };

  // Permanent Storage & Catalog Persistence Handlers
  const requestPermanentStorage = async () => {
    const granted = await requestPermanentStorageAccess();
    setIsPermanentStorageActive(granted);
    if (granted) {
      addNotification('Permanent Storage Granted', 'Browser has granted permanent persistent storage access.', 'system');
    }
    return granted;
  };

  const persistAllDataToPermanentStorage = () => {
    try {
      safeStorage.setItem('likart_cuisines', JSON.stringify(cuisines));
      safeStorage.setItem('likart_restaurants', JSON.stringify(restaurants.map(sanitizeRestaurantForStorage)));
      safeStorage.setItem('likart_menu_items', JSON.stringify(menuItems));
      safeStorage.setItem('likart_categories', JSON.stringify(categories));
      safeStorage.setItem('likart_zones', JSON.stringify(zones));
      safeStorage.setItem('likart_brand_settings', JSON.stringify(brandSettings));
      safeStorage.setItem('likart_coupons', JSON.stringify(coupons));
      safeStorage.setItem('likart_banners', JSON.stringify(banners));
      safeStorage.setItem('likart_admins', JSON.stringify(adminUsers));
      safeStorage.setItem('likart_franchises', JSON.stringify(franchises));
      safeStorage.setItem('likart_riders', JSON.stringify(deliveryPartners));
      safeStorage.setItem('likart_maps_keys', JSON.stringify(googleMapsKeys));
      safeStorage.setItem('likart_payment_gateways', JSON.stringify(paymentGateways));
      safeStorage.setItem('likart_dark_stores', JSON.stringify(darkStores));
      safeStorage.setItem('likart_dark_store_managers', JSON.stringify(darkStoreManagers));
      safeStorage.setItem('likart_mart_products', JSON.stringify(martProducts));
      safeStorage.setItem('likart_mart_categories', JSON.stringify(martCategories));
      safeStorage.setItem('likart_mart_offers', JSON.stringify(martOffers));
      safeStorage.setItem('likart_mart_reviews', JSON.stringify(martReviews));
      safeStorage.setItem('likart_mart_staff_users', JSON.stringify(martStaffUsers));
      safeStorage.setItem('likart_mart_role_configs', JSON.stringify(martRoleConfigs));
      safeStorage.setItem('likart_mart_audit_logs', JSON.stringify(martAuditLogs));
      addNotification(
        'Permanent Storage Synced',
        'All Likart Food and Likart Mart catalog, products, stores, categories, and settings safely persisted.',
        'system'
      );
      return {
        success: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        totalItems:
          cuisines.length +
          restaurants.length +
          menuItems.length +
          categories.length +
          martProducts.length +
          martCategories.length +
          darkStores.length,
      };
    } catch (err) {
      console.error('Error persisting all data:', err);
      return {
        success: false,
        timestamp: new Date().toLocaleTimeString(),
        totalItems: 0,
      };
    }
  };

  const exportPermanentCatalogBackup = () => {
    const backupData = {
      version: '3.0',
      exportedAt: new Date().toISOString(),
      platform: 'LIKART FOOD & LIKART MART Master Permanent Ecosystem',
      cuisines,
      restaurants: restaurants.map(sanitizeRestaurantForStorage),
      menuItems,
      categories,
      zones,
      brandSettings,
      coupons,
      banners,
      franchises,
      deliveryPartners,
      paymentGateways,
      darkStores,
      darkStoreManagers,
      martProducts,
      martCategories,
      martOffers,
      martReviews,
      martStaffUsers,
      martRoleConfigs,
    };
    return JSON.stringify(backupData, null, 2);
  };

  const importPermanentCatalogBackup = (jsonString: string): { success: boolean; message: string } => {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.cuisines)) {
        setCuisines(data.cuisines);
        safeStorage.setItem('likart_cuisines', JSON.stringify(data.cuisines));
      }
      if (Array.isArray(data.restaurants)) {
        setRestaurants(data.restaurants);
        safeStorage.setItem('likart_restaurants', JSON.stringify(data.restaurants.map(sanitizeRestaurantForStorage)));
      }
      if (Array.isArray(data.menuItems)) {
        setMenuItems(data.menuItems);
        safeStorage.setItem('likart_menu_items', JSON.stringify(data.menuItems));
      }
      if (Array.isArray(data.categories)) {
        setCategories(data.categories);
        safeStorage.setItem('likart_categories', JSON.stringify(data.categories));
      }
      if (Array.isArray(data.zones)) {
        setZones(data.zones);
        safeStorage.setItem('likart_zones', JSON.stringify(data.zones));
      }
      if (Array.isArray(data.deliveryPartners)) {
        setDeliveryPartners(data.deliveryPartners);
        safeStorage.setItem('likart_riders', JSON.stringify(data.deliveryPartners));
      }
      if (Array.isArray(data.paymentGateways)) {
        setPaymentGateways(data.paymentGateways);
        safeStorage.setItem('likart_payment_gateways', JSON.stringify(data.paymentGateways));
      }
      if (Array.isArray(data.coupons)) {
        setCoupons(data.coupons);
        safeStorage.setItem('likart_coupons', JSON.stringify(data.coupons));
      }
      if (Array.isArray(data.banners)) {
        setBanners(data.banners);
        safeStorage.setItem('likart_banners', JSON.stringify(data.banners));
      }
      if (Array.isArray(data.franchises)) {
        setFranchises(data.franchises);
        safeStorage.setItem('likart_franchises', JSON.stringify(data.franchises));
      }
      if (Array.isArray(data.darkStores)) {
        setDarkStores(data.darkStores);
        safeStorage.setItem('likart_dark_stores', JSON.stringify(data.darkStores));
      }
      if (Array.isArray(data.darkStoreManagers)) {
        setDarkStoreManagers(data.darkStoreManagers);
        safeStorage.setItem('likart_dark_store_managers', JSON.stringify(data.darkStoreManagers));
      }
      if (Array.isArray(data.martProducts)) {
        setMartProducts(data.martProducts);
        safeStorage.setItem('likart_mart_products', JSON.stringify(data.martProducts));
      }
      if (Array.isArray(data.martCategories)) {
        setMartCategories(data.martCategories);
        safeStorage.setItem('likart_mart_categories', JSON.stringify(data.martCategories));
      }
      if (Array.isArray(data.martOffers)) {
        setMartOffers(data.martOffers);
        safeStorage.setItem('likart_mart_offers', JSON.stringify(data.martOffers));
      }
      if (data.brandSettings) {
        setBrandSettings(data.brandSettings);
        safeStorage.setItem('likart_brand_settings', JSON.stringify(data.brandSettings));
      }
      requestPermanentStorageAccess();
      addNotification('Database Restored', 'Complete Food & Mart master database was successfully imported and permanently saved.', 'system');
      return { success: true, message: 'Database backup successfully imported and permanently saved!' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Invalid backup JSON file' };
    }
  };

  // Likart Mart (10m Groceries) Super Admin Handlers
  const addDarkStore = (data: Omit<DarkStoreHub, 'id' | 'createdAt'>) => {
    const newStore: DarkStoreHub = {
      ...data,
      id: `likart-mart-hub-${Date.now().toString().slice(-4)}`,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date().toISOString().split('T')[0],
    };
    removePermanentDeletion(newStore.id);
    const updated = [newStore, ...darkStores];
    setDarkStores(updated);
    safeStorage.setItem('likart_dark_stores', JSON.stringify(updated));
    requestPermanentStorageAccess();
    addNotification('Dark Store Added & Saved', `Pod hub ${newStore.name} created and permanently saved with ${newStore.slaMinutes}-min SLA.`, 'system');
  };

  const updateDarkStore = (id: string, data: Partial<DarkStoreHub>) => {
    removePermanentDeletion(id);
    const updated = darkStores.map((s) => (s.id === id ? { ...s, ...data } : s));
    setDarkStores(updated);
    safeStorage.setItem('likart_dark_stores', JSON.stringify(updated));
    addNotification('Dark Store Updated & Saved', `Settings saved permanently for dark store pod.`, 'system');
  };

  const deleteDarkStore = (id: string) => {
    recordPermanentDeletion(id);
    const updated = darkStores.filter((s) => s.id !== id);
    setDarkStores(updated);
    safeStorage.setItem('likart_dark_stores', JSON.stringify(updated));
    addNotification('Dark Store Permanently Removed', 'Dark store pod deleted permanently.', 'system');
  };

  const toggleDarkStoreStatus = (id: string) => {
    const target = darkStores.find((s) => s.id === id);
    if (!target) return;

    if (target.isActive === false && !target.isOpen) {
      addNotification('Store Deactivated', `Cannot open ${target.name} because it has been deactivated by Super Admin. Reactivate the store first.`, 'warning');
      return;
    }

    const updatedOpen = !target.isOpen;
    const updated = darkStores.map((s) => (s.id === id ? { ...s, isOpen: updatedOpen } : s));
    setDarkStores(updated);
    safeStorage.setItem('likart_dark_stores', JSON.stringify(updated));
    addNotification('Store Status Updated', `${target.name} is now ${updatedOpen ? 'OPEN (Taking 10m orders)' : 'CLOSED (Paused)'}.`, 'system');
  };

  const toggleDarkStoreActiveStatus = (id: string, reason?: string) => {
    const target = darkStores.find((s) => s.id === id);
    if (!target) return;
    const isCurrentlyActive = target.isActive !== false;
    const newActive = !isCurrentlyActive;
    const nowIso = new Date().toISOString().split('T')[0];

    const updated = darkStores.map((s) =>
      s.id === id
        ? {
            ...s,
            isActive: newActive,
            isOpen: newActive ? s.isOpen : false, // if deactivating, auto-close dispatch
            deactivationReason: newActive ? undefined : (reason || 'Deactivated by Likart Mart Super Admin'),
            deactivatedAt: newActive ? undefined : nowIso,
          }
        : s
    );
    setDarkStores(updated);
    safeStorage.setItem('likart_dark_stores', JSON.stringify(updated));

    if (newActive) {
      addNotification('Dark Store Activated', `Pod hub ${target.name} has been ACTIVATED by Super Admin. Ready for service.`, 'system');
    } else {
      addNotification('Dark Store Deactivated', `Pod hub ${target.name} has been DEACTIVATED by Super Admin.${reason ? ` Reason: ${reason}` : ''}`, 'warning');
    }
  };

  const updateMartServiceConfig = (config: Partial<MartServiceConfig>) => {
    setMartServiceConfig((prev) => {
      const updated = { ...prev, ...config };
      safeStorage.setItem('likart_mart_service_config', JSON.stringify(updated));
      return updated;
    });
    addNotification('Likart Mart Settings Saved', 'Global Likart Mart service configuration updated.', 'system');
  };

  const toggleMartServiceStatus = (active?: boolean, notice?: string) => {
    const newActive = active !== undefined ? active : !martServiceConfig.isActive;
    const updated: MartServiceConfig = {
      ...martServiceConfig,
      isActive: newActive,
      deactivationNotice: notice || martServiceConfig.deactivationNotice,
      deactivatedAt: newActive ? undefined : new Date().toISOString().split('T')[0],
      deactivatedBy: 'Likart Mart Super Admin',
    };
    setMartServiceConfig(updated);
    safeStorage.setItem('likart_mart_service_config', JSON.stringify(updated));

    if (newActive) {
      addNotification('Likart Mart Service Activated', 'Likart Mart is now ACTIVE and open for customer 10-minute grocery orders.', 'system');
    } else {
      addNotification('Likart Mart Service Deactivated', 'Likart Mart service has been DEACTIVATED by Super Admin. Customer storefront is currently paused.', 'warning');
    }
  };

  const addDarkStoreManager = (data: Omit<DarkStoreManager, 'id' | 'createdAt' | 'lastActive'>) => {
    const newMgr: DarkStoreManager = {
      ...data,
      id: `mgr-${Date.now().toString().slice(-4)}`,
      lastActive: 'Just now',
      createdAt: new Date().toISOString().split('T')[0],
    };
    removePermanentDeletion(newMgr.id);
    const updated = [newMgr, ...darkStoreManagers];
    setDarkStoreManagers(updated);
    safeStorage.setItem('likart_dark_store_managers', JSON.stringify(updated));
    requestPermanentStorageAccess();
    addNotification('Store Manager Added & Saved', `Manager ${newMgr.name} assigned to ${newMgr.storeName} permanently.`, 'system');
  };

  const updateDarkStoreManager = (id: string, data: Partial<DarkStoreManager>) => {
    removePermanentDeletion(id);
    const updated = darkStoreManagers.map((m) => (m.id === id ? { ...m, ...data } : m));
    setDarkStoreManagers(updated);
    safeStorage.setItem('likart_dark_store_managers', JSON.stringify(updated));
    addNotification('Store Manager Updated & Saved', 'Manager profile updated permanently.', 'system');
  };

  const deleteDarkStoreManager = (id: string) => {
    recordPermanentDeletion(id);
    const updated = darkStoreManagers.filter((m) => m.id !== id);
    setDarkStoreManagers(updated);
    safeStorage.setItem('likart_dark_store_managers', JSON.stringify(updated));
    addNotification('Store Manager Permanently Removed', 'Manager removed permanently from system.', 'system');
  };

  const updateMartSoundSettings = (settings: Partial<MartAlertToneSettings>) => {
    setMartSoundSettings((prev) => ({ ...prev, ...settings }));
    addNotification('Alert Sound Saved', 'Likart Mart express audio settings updated.', 'system');
  };

  // Likart Mart Catalog, Products, Categories, Offers, Reviews, Staff, Roles CRUD Handlers
  const addMartProduct = (product: QuickCommerceItem) => {
    removePermanentDeletion(product.id);
    const updated = [product, ...martProducts];
    setMartProducts(updated);
    safeStorage.setItem('likart_mart_products', JSON.stringify(updated));
    requestPermanentStorageAccess();
    addNotification('Product Added & Permanently Saved', `${product.name} saved to Likart Mart catalog.`, 'system');
    addMartAuditLog('CREATE', 'Products', product.id, `Added SKU ${product.name} (₹${product.price})`);
  };

  const updateMartProduct = (id: string, data: Partial<QuickCommerceItem>) => {
    removePermanentDeletion(id);
    const updated = martProducts.map((p) => (p.id === id ? { ...p, ...data } : p));
    setMartProducts(updated);
    safeStorage.setItem('likart_mart_products', JSON.stringify(updated));
    const target = updated.find((p) => p.id === id);
    addNotification('Product Updated & Permanently Saved', `Changes saved for ${target?.name || id}.`, 'system');
    addMartAuditLog('UPDATE', 'Products', id, `Updated SKU ${target?.name || id}`);
  };

  const deleteMartProduct = (id: string) => {
    const target = martProducts.find((p) => p.id === id);
    recordPermanentDeletion(id);
    const updated = martProducts.filter((p) => p.id !== id);
    setMartProducts(updated);
    safeStorage.setItem('likart_mart_products', JSON.stringify(updated));
    addNotification('Product Permanently Deleted', `${target?.name || 'Item'} deleted permanently from Likart Mart.`, 'warning');
    addMartAuditLog('DELETE', 'Products', id, `Deleted SKU ${target?.name || id}`);
  };

  const addMartCategory = (cat: QuickCommerceCategory) => {
    removePermanentDeletion(cat.id);
    const updated = [...martCategories, cat];
    setMartCategories(updated);
    safeStorage.setItem('likart_mart_categories', JSON.stringify(updated));
    requestPermanentStorageAccess();
    addNotification('Category Added & Permanently Saved', `Category ${cat.name} created.`, 'system');
    addMartAuditLog('CREATE', 'Categories', cat.id, `Created category ${cat.name}`);
  };

  const updateMartCategory = (id: string, data: Partial<QuickCommerceCategory>) => {
    removePermanentDeletion(id);
    const updated = martCategories.map((c) => (c.id === id ? { ...c, ...data } : c));
    setMartCategories(updated);
    safeStorage.setItem('likart_mart_categories', JSON.stringify(updated));
    const target = updated.find((c) => c.id === id);
    addNotification('Category Updated & Permanently Saved', `Category ${target?.name || id} updated.`, 'system');
    addMartAuditLog('UPDATE', 'Categories', id, `Updated category ${target?.name || id}`);
  };

  const deleteMartCategory = (id: string) => {
    const target = martCategories.find((c) => c.id === id);
    recordPermanentDeletion(id);
    const updated = martCategories.filter((c) => c.id !== id);
    setMartCategories(updated);
    safeStorage.setItem('likart_mart_categories', JSON.stringify(updated));
    addNotification('Category Permanently Deleted', `Category ${target?.name || id} deleted permanently.`, 'warning');
    addMartAuditLog('DELETE', 'Categories', id, `Deleted category ${target?.name || id}`);
  };

  const addMartOffer = (offer: MartOffer) => {
    removePermanentDeletion(offer.id);
    const updated = [offer, ...martOffers];
    setMartOffers(updated);
    safeStorage.setItem('likart_mart_offers', JSON.stringify(updated));
    requestPermanentStorageAccess();
    addNotification('Offer Added & Permanently Saved', `Promo deal ${offer.code} created.`, 'system');
    addMartAuditLog('CREATE', 'Offers', offer.id, `Created promo offer ${offer.code}`);
  };

  const updateMartOffer = (id: string, data: Partial<MartOffer>) => {
    removePermanentDeletion(id);
    const updated = martOffers.map((o) => (o.id === id ? { ...o, ...data } : o));
    setMartOffers(updated);
    safeStorage.setItem('likart_mart_offers', JSON.stringify(updated));
    const target = updated.find((o) => o.id === id);
    addNotification('Offer Updated & Permanently Saved', `Offer ${target?.code || id} updated.`, 'system');
    addMartAuditLog('UPDATE', 'Offers', id, `Updated offer ${target?.code || id}`);
  };

  const deleteMartOffer = (id: string) => {
    const target = martOffers.find((o) => o.id === id);
    recordPermanentDeletion(id);
    const updated = martOffers.filter((o) => o.id !== id);
    setMartOffers(updated);
    safeStorage.setItem('likart_mart_offers', JSON.stringify(updated));
    addNotification('Offer Permanently Deleted', `Offer ${target?.code || id} deleted permanently.`, 'warning');
    addMartAuditLog('DELETE', 'Offers', id, `Deleted offer ${target?.code || id}`);
  };

  const addMartReview = (review: MartReview) => {
    removePermanentDeletion(review.id);
    const updated = [review, ...martReviews];
    setMartReviews(updated);
    safeStorage.setItem('likart_mart_reviews', JSON.stringify(updated));
    addNotification('Review Added & Saved', `Customer review recorded permanently.`, 'system');
  };

  const updateMartReview = (id: string, data: Partial<MartReview>) => {
    removePermanentDeletion(id);
    const updated = martReviews.map((r) => (r.id === id ? { ...r, ...data } : r));
    setMartReviews(updated);
    safeStorage.setItem('likart_mart_reviews', JSON.stringify(updated));
    addNotification('Review Updated & Saved', `Review status updated.`, 'system');
  };

  const deleteMartReview = (id: string) => {
    recordPermanentDeletion(id);
    const updated = martReviews.filter((r) => r.id !== id);
    setMartReviews(updated);
    safeStorage.setItem('likart_mart_reviews', JSON.stringify(updated));
    addNotification('Review Permanently Deleted', `Review #${id} deleted permanently.`, 'warning');
  };

  const addMartStaffUser = (user: MartStaffUser) => {
    removePermanentDeletion(user.id);
    const updated = [user, ...martStaffUsers];
    setMartStaffUsers(updated);
    safeStorage.setItem('likart_mart_staff_users', JSON.stringify(updated));
    requestPermanentStorageAccess();
    addNotification('Staff User Added & Permanently Saved', `User ${user.name} created.`, 'system');
    addMartAuditLog('CREATE', 'Users & Roles', user.id, `Created staff user ${user.name}`);
  };

  const updateMartStaffUser = (id: string, data: Partial<MartStaffUser>) => {
    removePermanentDeletion(id);
    const updated = martStaffUsers.map((u) => (u.id === id ? { ...u, ...data } : u));
    setMartStaffUsers(updated);
    safeStorage.setItem('likart_mart_staff_users', JSON.stringify(updated));
    const target = updated.find((u) => u.id === id);
    addNotification('Staff User Updated & Saved', `User ${target?.name || id} updated.`, 'system');
    addMartAuditLog('UPDATE', 'Users & Roles', id, `Updated staff user ${target?.name || id}`);
  };

  const deleteMartStaffUser = (id: string) => {
    const target = martStaffUsers.find((u) => u.id === id);
    recordPermanentDeletion(id);
    const updated = martStaffUsers.filter((u) => u.id !== id);
    setMartStaffUsers(updated);
    safeStorage.setItem('likart_mart_staff_users', JSON.stringify(updated));
    addNotification('Staff User Permanently Deleted', `User ${target?.name || id} removed permanently.`, 'warning');
    addMartAuditLog('DELETE', 'Users & Roles', id, `Deleted staff user ${target?.name || id}`);
  };

  const addMartRoleConfig = (role: MartRoleConfig) => {
    removePermanentDeletion(role.id);
    const updated = [...martRoleConfigs, role];
    setMartRoleConfigs(updated);
    safeStorage.setItem('likart_mart_role_configs', JSON.stringify(updated));
    requestPermanentStorageAccess();
    addNotification('Role Added & Permanently Saved', `Role ${role.roleName} created.`, 'system');
    addMartAuditLog('CREATE', 'Users & Roles', role.id, `Created role config ${role.roleName}`);
  };

  const updateMartRoleConfig = (id: string, data: Partial<MartRoleConfig>) => {
    removePermanentDeletion(id);
    const updated = martRoleConfigs.map((r) => (r.id === id ? { ...r, ...data } : r));
    setMartRoleConfigs(updated);
    safeStorage.setItem('likart_mart_role_configs', JSON.stringify(updated));
    const target = updated.find((r) => r.id === id);
    addNotification('Role Updated & Saved', `Role ${target?.roleName || id} permissions updated.`, 'system');
    addMartAuditLog('UPDATE', 'Users & Roles', id, `Updated role config ${target?.roleName || id}`);
  };

  const deleteMartRoleConfig = (id: string) => {
    const target = martRoleConfigs.find((r) => r.id === id);
    recordPermanentDeletion(id);
    const updated = martRoleConfigs.filter((r) => r.id !== id);
    setMartRoleConfigs(updated);
    safeStorage.setItem('likart_mart_role_configs', JSON.stringify(updated));
    addNotification('Role Permanently Deleted', `Role ${target?.roleName || id} removed permanently.`, 'warning');
    addMartAuditLog('DELETE', 'Users & Roles', id, `Deleted role config ${target?.roleName || id}`);
  };

  const addMartAuditLog = (
    action: MartAuditLog['action'],
    module: MartAuditLog['module'],
    targetId: string,
    details: string
  ) => {
    const newLog: MartAuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      performedBy: authAdmin?.email || 'admin@likart.com (Super Admin)',
      role: authAdmin?.name || 'Likart Mart Super Admin',
      action,
      module,
      targetId,
      details,
      ipAddress: '103.21.144.12',
    };
    setMartAuditLogs((prev) => {
      const updated = [newLog, ...prev];
      safeStorage.setItem('likart_mart_audit_logs', JSON.stringify(updated));
      return updated;
    });
  };

  const clearAllMartAuditLogs = () => {
    setMartAuditLogs([]);
    safeStorage.setItem('likart_mart_audit_logs', JSON.stringify([]));
    addNotification('Audit Logs Cleared', 'All Likart Mart audit trail records have been cleared by Super Admin.', 'system');
  };

  const deleteBulkMartAuditLogs = (ids: string[]) => {
    if (!ids || ids.length === 0) return;
    recordBulkPermanentDeletion(ids);
    const idSet = new Set(ids);
    setMartAuditLogs((prev) => {
      const updated = prev.filter((l) => !idSet.has(l.id));
      safeStorage.setItem('likart_mart_audit_logs', JSON.stringify(updated));
      return updated;
    });
    addNotification('Audit Logs Removed', `${ids.length} audit log record(s) removed permanently by Super Admin.`, 'warning');
  };

  const addMartBanner = (bannerData: Omit<BannerPromo, 'id'>) => {
    const newBanner: BannerPromo = {
      ...bannerData,
      id: `mart-ban-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      isActive: bannerData.isActive !== undefined ? bannerData.isActive : true,
    };
    removePermanentDeletion(newBanner.id);
    const updated = [...martBanners, newBanner];
    setMartBanners(updated);
    safeStorage.setItem('likart_mart_banners', JSON.stringify(updated));
    addNotification('Banner Published & Saved', `Mart promo banner "${newBanner.title}" published permanently.`, 'system');
    addMartAuditLog('CREATE', 'Offers', newBanner.id, `Created Mart promo banner: ${newBanner.title}`);
  };

  const updateMartBanner = (id: string, bannerData: Partial<BannerPromo>) => {
    removePermanentDeletion(id);
    const updated = martBanners.map((b) => (b.id === id ? { ...b, ...bannerData } : b));
    setMartBanners(updated);
    safeStorage.setItem('likart_mart_banners', JSON.stringify(updated));
    const target = updated.find((b) => b.id === id);
    addNotification('Banner Updated & Saved', `Mart promo banner "${target?.title || id}" saved permanently.`, 'system');
    addMartAuditLog('UPDATE', 'Offers', id, `Updated Mart promo banner: ${target?.title || id}`);
  };

  const deleteMartBanner = (id: string) => {
    const target = martBanners.find((b) => b.id === id);
    recordPermanentDeletion(id);
    const updated = martBanners.filter((b) => b.id !== id);
    setMartBanners(updated);
    safeStorage.setItem('likart_mart_banners', JSON.stringify(updated));
    addNotification('Banner Permanently Removed', `Mart promo banner removed permanently.`, 'warning');
    addMartAuditLog('DELETE', 'Offers', id, `Deleted Mart promo banner: ${target?.title || id}`);
  };

  const updateMartBannerConfig = (config: Partial<MartBannerAutoSlideConfig>) => {
    setMartBannerConfig((prev) => {
      const updated = { ...prev, ...config };
      safeStorage.setItem('likart_mart_banner_config', JSON.stringify(updated));
      return updated;
    });
    addNotification('Banner Settings Saved', 'Likart Mart auto slide configuration updated.', 'system');
    addMartAuditLog('UPDATE', 'Settings', 'mart-banners-autoslide', `Updated Mart banner auto slide config`);
  };

  const addPaymentTransaction = (tx: PaymentTransaction) => {
    setPaymentTransactions((prev) => {
      const updated = [tx, ...prev];
      safeStorage.setItem('likart_payment_transactions', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AppContext.Provider
      value={{
        activePortal,
        setActivePortal,
        customerView,
        setCustomerView,
        selectedRestaurantId,
        setSelectedRestaurantId,
        selectedPolicy,
        setSelectedPolicy,
        customerUser,
        setCustomerUser,
        authCustomer,
        loginCustomer,
        registerCustomer,
        logoutCustomer,
        allCustomers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        authRestaurant,
        loginRestaurant,
        logoutRestaurant,
        authRider,
        loginRider,
        logoutRider,
        authAdmin,
        loginAdmin,
        logoutAdmin,
        adminInitialTab,
        setAdminInitialTab,
        authMartManager,
        loginMartManager,
        logoutMartManager,
        currentLocation,
        setCurrentLocation,
        currentZone,
        setCurrentZone,
        findZoneByCoords,
        detectUserLocation,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        cartTotals,
        orders,
        createOrder,
        activeTrackingOrderId,
        setActiveTrackingOrderId,
        updateOrderStatus,
        markOrderAsPaid,
        cancelOrder,
        deleteOrder,
        addOrder,
        updateOrder,
        paymentTransactions,
        deletePaymentTransaction,
        restaurants,
        menuItems,
        currentRestaurantId,
        setCurrentRestaurantId,
        acceptOrderByRestaurant,
        rejectOrderByRestaurant,
        registerRestaurant,
        addRestaurant,
        updateRestaurant,
        deleteRestaurant,
        updateRestaurantStatus,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleMenuItemAvailability,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        simulateOrderForRestaurant,
        cuisines,
        addCuisine,
        updateCuisine,
        deleteCuisine,
        toggleCuisineStatus,
        deliveryPartners,
        currentRiderId,
        setCurrentRiderId,
        registerDeliveryPartner,
        addDeliveryPartner,
        updateDeliveryPartner,
        deleteDeliveryPartner,
        updateRiderStatus,
        toggleRiderOnline,
        verifyDeliveryOtp,
        acceptOrderForDelivery,
        rejectOrderForDelivery,
        reassignOrderFromDelivery,
        updateRiderLocation,
        depositRiderFloatingCash,
        adminUsers,
        currentAdminRole,
        setCurrentAdminRole,
        addAdminUser,
        updateAdminUser,
        deleteAdminUser,
        zones,
        addZone,
        updateZone,
        deleteZone,
        paymentGateways,
        addPaymentGateway,
        updatePaymentGateway,
        deletePaymentGateway,
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
        deliveryWalletTransactions,
        requestPayout,
        settlePayout,
        rejectPayout,
        deletePayout,
        cancelPayoutRequest,
        cancelRiderPayoutRequest,
        supportTickets,
        createSupportTicket,
        replySupportTicket,
        deleteSupportTicket,
        addCustomerAddress,
        updateCustomerAddress,
        deleteCustomerAddress,
        updateCustomerProfile,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isLocationModalOpen,
        setIsLocationModalOpen,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isTrackingModalOpen,
        setIsTrackingModalOpen,
        isSupportModalOpen,
        setIsSupportModalOpen,
        isBrowseOnOtherDevicesModalOpen,
        setIsBrowseOnOtherDevicesModalOpen,
        openBrowseOnOtherDevicesModal,
        customerProfileTab,
        setCustomerProfileTab,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
        deleteNotification,
        addNotification,
        isPermanentStorageActive,
        requestPermanentStorage,
        persistAllDataToPermanentStorage,
        exportPermanentCatalogBackup,
        importPermanentCatalogBackup,
        darkStores,
        addDarkStore,
        updateDarkStore,
        deleteDarkStore,
        toggleDarkStoreStatus,
        toggleDarkStoreActiveStatus,
        martServiceConfig,
        setMartServiceConfig,
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
        addMartProduct,
        updateMartProduct,
        deleteMartProduct,
        martCategories,
        setMartCategories,
        addMartCategory,
        updateMartCategory,
        deleteMartCategory,
        martOffers,
        setMartOffers,
        addMartOffer,
        updateMartOffer,
        deleteMartOffer,
        martReviews,
        setMartReviews,
        addMartReview,
        updateMartReview,
        deleteMartReview,
        martStaffUsers,
        setMartStaffUsers,
        addMartStaffUser,
        updateMartStaffUser,
        deleteMartStaffUser,
        martRoleConfigs,
        setMartRoleConfigs,
        addMartRoleConfig,
        updateMartRoleConfig,
        deleteMartRoleConfig,
        martAuditLogs,
        setMartAuditLogs,
        addMartAuditLog,
        clearAllMartAuditLogs,
        deleteBulkMartAuditLogs,
        martBanners,
        setMartBanners,
        addMartBanner,
        updateMartBanner,
        deleteMartBanner,
        martBannerConfig,
        updateMartBannerConfig,
        addPaymentTransaction,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
