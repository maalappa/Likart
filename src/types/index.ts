export type UserRole = 'customer' | 'restaurant' | 'delivery' | 'admin' | 'mart_manager';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  address: string;
  city: string;
  zoneId?: string;
  zoneName?: string;
  pincode?: string;
  landmark?: string;
  accuracyMeters?: number;
  isWithinZone?: boolean;
}

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  avatar?: string;
  addresses: SavedAddress[];
  favorites: string[]; // Restaurant IDs
  walletBalance?: number;
  loyaltyPoints?: number;
  status?: 'active' | 'blocked';
  createdAt: string;
}

export interface SavedAddress {
  id: string;
  type: 'Home' | 'Work' | 'Other';
  title: string;
  flat: string;
  area: string;
  landmark?: string;
  city: string;
  coordinates: { lat: number; lng: number };
  isDefault: boolean;
  zoneId?: string;
  zoneName?: string;
  pincode?: string;
  addressLine?: string;
  label?: string;
}

export interface FoodVariant {
  id: string;
  name: string; // e.g. "Half (Serves 1)", "Full (Serves 2)", "Regular", "Medium", "Large"
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  isDefault?: boolean;
  isAvailable?: boolean;
  stockQuantity?: number;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  // Stocks & Inventory
  hasStockTracking?: boolean;
  stockQuantity?: number;
  lowStockThreshold?: number;
  // Discounts & Promotions
  hasDiscount?: boolean;
  discountType?: 'percentage' | 'flat';
  discountValue?: number;
  discountPercent?: number;
  discountLabel?: string;
  category: string;
  image: string;
  isVeg: boolean;
  isBestseller?: boolean;
  isAvailable: boolean;
  rating?: number;
  spiceLevel?: 'mild' | 'medium' | 'spicy';
  variants?: FoodVariant[];
  videoUrl?: string;
}

export interface RestaurantCategory {
  id: string;
  restaurantId?: string;
  name: string;
  image: string;
  videoUrl?: string;
}

export interface Cuisine {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  image?: string;
  videoUrl?: string;
  description?: string;
  isPopular?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type RestaurantStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface RestaurantKYC {
  fssaiNumber: string;
  fssaiDocUrl?: string;
  gstinNumber: string;
  gstDocUrl?: string;
  udyamNumber: string;
  udyamDocUrl?: string;
  panNumber: string;
  panDocUrl?: string;
  aadhaarNumber?: string;
  aadhaarDocUrl?: string;
  restaurantPhotoUrl?: string;
  bankAccount: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    accountHolderName: string;
  };
  verified: boolean;
  verifiedAt?: string;
  rejectionReason?: string;
}

export interface DaySchedule {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  isOpen: boolean;
  openTime: string; // e.g. "09:00"
  closeTime: string; // e.g. "23:00"
}

export interface Restaurant {
  id: string;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  password?: string;
  cuisine: string[];
  rating: number;
  ratingCount: number;
  deliveryTimeMins: number;
  priceForTwo: number;
  logo: string;
  bannerImage: string;
  address: string;
  coordinates: { lat: number; lng: number };
  zoneId: string;
  status: RestaurantStatus;
  isOpen: boolean;
  commissionRate: number; // e.g. 15%
  kyc: RestaurantKYC;
  offers: string[];
  pureVeg?: boolean;
  openingTime?: string; // Standard opening time, e.g. "09:00"
  closingTime?: string; // Standard closing time, e.g. "23:00"
  autoOpenClose?: boolean; // Whether kitchen automatically follows schedule
  schedule?: DaySchedule[]; // Day-wise customized schedule
  videoUrl?: string;
  createdAt: string;
}

export type DeliveryPartnerStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface DeliveryPartnerKYC {
  fatherName: string;
  dob: string;
  aadhaarNumber: string;
  aadhaarDocUrl?: string;
  panNumber: string;
  panDocUrl?: string;
  drivingLicenseNumber: string;
  dlDocUrl?: string;
  rcNumber: string;
  rcDocUrl?: string;
  selfieUrl?: string;
  vehicleType: 'Motorcycle' | 'Scooter' | 'Electric Bike' | 'Bicycle';
  vehicleNumber: string;
  payoutUpiOrBank: string;
  verified: boolean;
  rejectionReason?: string;
}

export interface DeliveryPartner {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  avatar: string;
  zoneId: string;
  status: DeliveryPartnerStatus;
  isOnline: boolean;
  currentLocation: { lat: number; lng: number };
  rating: number;
  totalTrips: number;
  walletBalance: number;
  totalCashCollected?: number; // Total physical COD cash collected from customers
  totalEarnings?: number; // Total gross trip earnings + tips earned lifetime
  floatingCashLimit?: number; // Max cash holding limit (typically ₹1,000)
  vehicleType?: 'bike' | 'scooter' | 'ev' | 'bicycle' | string;
  vehicleNumber?: string;
  assignedStoreId?: string;
  assignedStoreName?: string;
  kyc: DeliveryPartnerKYC;
  createdAt: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  city: string;
  center: { lat: number; lng: number };
  radiusKm: number;
  baseDeliveryFee: number;
  perKmFee: number;
  minOrderValue: number;
  isActive: boolean;
}

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'rider_assigned'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  isVeg: boolean;
  variantName?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  restaurantId: string;
  restaurantName: string;
  restaurantAddress: string;
  restaurantPhone: string;
  deliveryPartnerId?: string;
  riderId?: string;
  deliveryPartnerName?: string;
  deliveryPartnerPhone?: string;
  deliveryPartnerLocation?: { lat: number; lng: number };
  items: OrderItem[];
  itemTotal: number;
  deliveryFee: number;
  platformFee: number;
  taxes: number;
  tipAmount: number;
  discount: number;
  couponCode?: string;
  totalAmount: number;
  paymentMethod: 'razorpay' | 'cashfree' | 'phonepe' | 'cod' | 'stripe' | 'payu';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  paymentCollectedAt?: string;
  paymentCollectedMethod?: 'upi_qr' | 'cash';
  codCashDeducted?: boolean; // Track if collected cash was auto-deducted from rider wallet
  status: OrderStatus;
  deliveryOtp: string; // 4-digit OTP for verification
  deliveryAddress: SavedAddress;
  deliveryInstructions?: string;
  cancellationReason?: string;
  rejectedByRestaurant?: boolean;
  restaurantRejectionReason?: string;
  rejectedByDeliveryPartnerIds?: string[];
  deliveryPartnerRejectionReason?: string;
  estimatedPrepTimeMins?: number;
  timeline: {
    status: OrderStatus;
    timestamp: string;
    note: string;
  }[];
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountPercent: number;
  maxDiscount: number;
  minOrderValue: number;
  validUntil: string;
  expiryDate?: string;
  isActive: boolean;
}

export interface PayoutRequest {
  id: string;
  recipientType: 'restaurant' | 'delivery';
  recipientId: string;
  recipientName: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'settled';
  bankOrUpiDetails: string;
  payoutMethod?: 'upi' | 'bank_transfer';
  upiId?: string;
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    holderName: string;
    bankName: string;
  };
  referenceId?: string;
  requestedAt: string;
  createdAt?: string;
  processedAt?: string;
  rejectionReason?: string;
}

export interface DeliveryWalletTransaction {
  id: string;
  riderId: string;
  type:
    | 'trip_earning'
    | 'customer_tip'
    | 'cod_cash_deduction'
    | 'payout_withdrawal'
    | 'payout_refund'
    | 'floating_cash_deposit'
    | 'bonus';
  amount: number; // positive for credit (+), negative for debit (-)
  orderId?: string;
  description: string;
  balanceAfter: number;
  timestamp: string;
  referenceId?: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userType: UserRole;
  userName: string;
  orderId?: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  reply?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'super_admin' | 'operations' | 'restaurant_manager' | 'delivery_manager' | 'finance' | 'support' | 'franchise_admin';
  franchiseId?: string;
  status: 'active' | 'inactive';
  permissions: string[];
  lastLogin: string;
}

export type RestaurantAlertTone =
  | 'kitchen_bell'
  | 'classic_chime'
  | 'digital_beep'
  | 'urgent_siren'
  | 'marimba_joy'
  | 'ding_dong'
  | string;

export type RiderAlertTone =
  | 'radar_pulse'
  | 'motorcycle_horn'
  | 'cash_register'
  | 'fast_whistle'
  | 'digital_ping'
  | 'two_tone_chime'
  | string;

export interface UploadedAudioTune {
  id: string;
  name: string;
  fileName: string;
  dataUrl: string; // base64 Data URL
  fileSizeKb: number;
  durationSecs?: number;
  uploadedAt: string;
  category: 'restaurant' | 'rider';
}

export interface SoundAlertSettings {
  enabled: boolean;
  ringUntilAccepted?: boolean; // Always rings continuously until accepted
  // Restaurant Orders Alert
  restaurantSoundEnabled: boolean;
  restaurantVolume: number; // 0.1 to 1
  restaurantAudioUrl?: string; // Uploaded custom audio tune Data URL
  restaurantAudioFileName?: string;
  restaurantAudioName?: string;
  restaurantAudioSizeKb?: number;
  restaurantAudioDurationSecs?: number;
  restaurantAlertTone?: RestaurantAlertTone;
  restaurantRepeatIntervalSecs?: number;

  // Delivery Partner Trip Alert
  riderSoundEnabled: boolean;
  riderVolume: number; // 0.1 to 1
  riderAudioUrl?: string; // Uploaded custom audio tune Data URL
  riderAudioFileName?: string;
  riderAudioName?: string;
  riderAudioSizeKb?: number;
  riderAudioDurationSecs?: number;
  riderAlertTone?: RiderAlertTone;
  riderRepeatIntervalSecs?: number;

  // Audio Tune Library
  uploadedTunes?: UploadedAudioTune[];
}

export interface CustomCompanyPage {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  content: string;
  category?: 'company' | 'legal' | 'support' | 'compliance';
  lastUpdated?: string;
  enabled: boolean;
  createdAt?: string;
}

export interface CompanyPagesContent {
  aboutUs: {
    heading: string;
    subheading: string;
    story: string;
    standards: string;
    stat1Number: string;
    stat1Label: string;
    stat2Number: string;
    stat2Label: string;
    stat3Number: string;
    stat3Label: string;
    enabled?: boolean;
    customStats?: { id: string; number: string; label: string }[];
    customSections?: { id: string; title: string; content: string }[];
  };
  contactSupport: {
    heading: string;
    description: string;
    phone: string;
    email: string;
    address: string;
    cityStateZip: string;
    operatingHours: string;
    enabled?: boolean;
    customChannels?: { id: string; title: string; detail: string; subtext?: string }[];
  };
  privacyPolicy: {
    heading: string;
    lastUpdated: string;
    content: string;
    enabled?: boolean;
    customSections?: { id: string; title: string; content: string }[];
  };
  termsConditions: {
    heading: string;
    effectiveDate: string;
    content: string;
    enabled?: boolean;
    customSections?: { id: string; title: string; content: string }[];
  };
  refundCancellation: {
    heading: string;
    subtitle: string;
    content: string;
    enabled?: boolean;
    customSections?: { id: string; title: string; content: string }[];
  };
  customPages?: CustomCompanyPage[];
}

export interface BrandSettings {
  brandName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  supportPhone: string;
  supportEmail: string;
  headquartersAddress?: string;
  googleMapsApiKey: string;
  isMapSimulation: boolean;
  defaultCommissionRate: number;
  platformFee: number;
  gstRate: number; // e.g. 5%
  soundAlerts?: SoundAlertSettings;
  companyPages?: CompanyPagesContent;
  gateways: {
    razorpay: {
      enabled: boolean;
      keyId: string;
      keySecretMasked: string;
      testMode: boolean;
    };
    cashfree: {
      enabled: boolean;
      appId: string;
      secretMasked: string;
      testMode: boolean;
    };
    phonepe: {
      enabled: boolean;
      merchantId: string;
      saltKeyMasked: string;
      testMode: boolean;
    };
    cod: {
      enabled: boolean;
      maxOrderLimit: number;
    };
  };
}

export interface BannerPromo {
  id: string;
  title: string;
  subtitle: string;
  code: string;
  bgColor: string;
  imageUrl: string;
  videoUrl?: string;
  linkText: string;
  targetCategory?: string;
  targetSearch?: string;
  discountText?: string;
  badge?: string;
  isActive?: boolean;
}

export type MartBannerPromo = BannerPromo;

export interface MartBannerAutoSlideConfig {
  autoSlide: boolean;
  intervalMs: number; // e.g. 4000
  pauseOnHover: boolean;
  showDots: boolean;
  showArrows: boolean;
  transitionEffect?: 'slide' | 'fade' | 'zoom' | 'flip';
  showProgressBar?: boolean;
  autoLoop?: boolean;
}

export interface Franchise {
  id: string;
  franchiseName: string;
  ownerName: string;
  email: string;
  phone: string;
  territory: string;
  tier: 'Master Franchise' | 'Territory Franchise' | 'Unit Cloud Kitchen';
  revenueSharePercent: number; // e.g. 8%
  investmentAmount: number; // e.g. 15,00,000
  activeOutletsCount: number;
  status: 'active' | 'pending' | 'suspended' | 'inactive';
  deactivationReason?: string;
  deactivatedAt?: string;
  contractStart: string;
  contractEnd: string;
  notes?: string;
  coordinates?: { lat: number; lng: number };
  zoneIds?: string[];
  hubAddress?: string;
  createdAt: string;
  // Franchise Admin Credentials (Super Admin Control)
  adminUserId?: string;
  adminPassword?: string;
  adminName?: string;
  lastPasswordChange?: string;
}

export interface GoogleMapsKeyItem {
  id: string;
  label: string;
  apiKey: string;
  enabledServices: string[];
  isActive: boolean;
  isPrimary: boolean;
  dailyQuotaLimit: number;
  currentRequestsToday: number;
  lastTestedAt?: string;
  status: 'healthy' | 'warning' | 'quota_exceeded';
  createdAt: string;
}

export interface PaymentGatewayItem {
  id: string;
  provider: string;
  name: string;
  appOrMerchantId: string;
  apiKeyOrSecretMasked: string;
  webhookSecret?: string;
  testMode: boolean;
  enabled: boolean;
  supportedMethods: string[];
  createdAt: string;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  customerName: string;
  gatewayProvider: 'razorpay' | 'cashfree' | 'phonepe' | 'cod' | 'stripe' | 'payu';
  gatewayTransactionId: string;
  amount: number;
  currency: string;
  status: 'success' | 'pending' | 'failed' | 'refunded';
  paymentMethodDetails: string;
  createdAt: string;
}

export interface QuickCommerceCategory {
  id: string;
  name: string;
  icon: string;
  image: string;
  videoUrl?: string;
  badge?: string;
  department?: 'fresh' | 'grocery' | 'snacks' | 'household' | 'wellness' | string;
}

export interface QuickCommerceVariant {
  id: string; // e.g. "var-500g", "var-1kg", "var-1l"
  unit: string; // e.g. "500 ml", "1 Litre", "1 kg", "Pack of 2"
  label?: string; // e.g. "Small Pack", "Family Saver Pack", "Twin Pack"
  price: number; // selling price for this variant
  originalPrice?: number; // MRP
  discountPercent?: number;
  inStock?: boolean;
  stockCount?: number;
  sku?: string;
  isDefault?: boolean;
}

export interface QuickCommerceItem {
  id: string;
  name: string;
  brand: string;
  unit: string; // e.g. "500g", "1 Litre", "1 kg", "Pack of 6"
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  image: string;
  videoUrl?: string;
  category: string;
  subcategory?: string; // e.g. "leafy_seasonings", "exotic_veg", "nectr", "pooja_festive"
  isVeg: boolean;
  inStock: boolean;
  stockCount?: number;
  rating: number;
  ratingCount?: number;
  deliveryTimeMins: number; // e.g. 10 or 12 mins
  description: string;
  isBestseller?: boolean;
  qualityTag?: string; // e.g. "More Tender Bite", "Sweet & Crunchier"
  isAd?: boolean;
  weightVariants?: string[]; // e.g. ["300-500 g", "1 kg"]
  variants?: QuickCommerceVariant[];
  selectedVariantId?: string;
}

export interface DarkStoreHub {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  serviceRadiusKm: number; // e.g. 2.5 km
  slaMinutes: number; // e.g. 10 mins
  isOpen: boolean; // Shift / daily open for orders
  isActive?: boolean; // Super Admin master status (active vs deactivated/suspended)
  deactivationReason?: string;
  deactivatedAt?: string;
  managerName: string;
  managerPhone: string;
  managerEmail: string;
  activeRidersCount: number;
  totalSkus: number;
  lowStockItemsCount: number;
  contactNumber: string;
  openingTime: string; // e.g. "06:00 AM"
  closingTime: string; // e.g. "12:00 AM" (or 24x7)
  is24x7: boolean;
  createdAt: string;
}

export interface MartServiceConfig {
  isActive: boolean; // Global Likart Mart service active/deactivated
  deactivationNotice?: string;
  deactivatedAt?: string;
  deactivatedBy?: string;
}

export interface DarkStoreManager {
  id: string;
  storeId: string;
  storeName: string;
  name: string;
  email: string;
  phone: string;
  userId?: string;
  password?: string;
  role: 'hub_lead' | 'shift_supervisor' | 'inventory_operator';
  shift: 'morning' | 'evening' | 'night' | 'full_day';
  status: 'active' | 'on_leave' | 'inactive';
  accessPin: string;
  lastActive: string;
  createdAt: string;
}

export interface MartAlertToneSettings {
  enabled: boolean;
  soundType: 'siren' | 'express_bell' | 'radar_pulse' | 'dispatch_beep' | 'custom';
  volume: number; // 0 to 100
  autoRepeatIntervalSec: number;
  vibrate: boolean;
  customAudioUrl?: string;
  customAudioFileName?: string;
  customAudioSizeKb?: number;
  customAudioDurationSecs?: number;
}

export interface MartOffer {
  id: string;
  title: string;
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minOrderValue: number;
  badge: string;
  category: string;
  validTill: string;
  status: 'active' | 'inactive';
  usageCount: number;
  description?: string;
}

export interface MartReview {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone?: string;
  rating: number; // 1 to 5
  comment: string;
  podStoreName?: string;
  itemsOrdered?: string[];
  reply?: string;
  status: 'published' | 'hidden' | 'flagged';
  createdAt: string;
}

export interface MartPaymentTransaction {
  id: string;
  orderId: string;
  amount: number;
  method: 'upi' | 'card' | 'netbanking' | 'cod' | 'wallet';
  status: 'successful' | 'pending' | 'failed' | 'refunded';
  gateway: string;
  customerName: string;
  customerPhone: string;
  referenceId: string;
  createdAt: string;
}

export interface MartStaffUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  userId?: string;
  password?: string;
  role: 'mart_super_admin' | 'store_supervisor' | 'inventory_controller' | 'dispatch_lead' | 'support_agent';
  assignedStoreId?: string; // or 'all'
  assignedStoreName?: string;
  status: 'active' | 'suspended';
  lastLogin?: string;
  createdAt: string;
}

export interface MartRoleConfig {
  id: string;
  roleName: string;
  description: string;
  permissions: {
    canManageOrders: boolean;
    canManageStores: boolean;
    canManageManagers: boolean;
    canManageProducts: boolean;
    canManageCategories: boolean;
    canManageInventory: boolean;
    canManageCouponsOffers: boolean;
    canManagePayments: boolean;
    canManagePayouts: boolean;
    canManageSupport: boolean;
    canManageReviews: boolean;
    canManageUsersRoles: boolean;
    canDeleteRecords: boolean;
    canExportReports: boolean;
  };
  usersCount?: number;
}

export interface MartAuditLog {
  id: string;
  timestamp: string;
  performedBy: string;
  role: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'EXPORT' | 'PAYOUT_SETTLE' | 'NOTIFICATION_DISPATCH';
  module:
    | 'Orders'
    | 'Stores'
    | 'Managers'
    | 'Products'
    | 'Categories'
    | 'Inventory'
    | 'Customers'
    | 'Delivery Partners'
    | 'Payments'
    | 'Payouts'
    | 'Coupons'
    | 'Offers'
    | 'Reviews'
    | 'Support'
    | 'Users & Roles'
    | 'Settings';
  targetId?: string;
  details: string;
  ipAddress?: string;
}


