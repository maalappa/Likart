import {
  Restaurant,
  MenuItem,
  RestaurantCategory,
  Cuisine,
  DeliveryZone,
  DeliveryPartner,
  Coupon,
  BrandSettings,
  BannerPromo,
  Order,
  AdminUser,
  SupportTicket,
  PayoutRequest,
  CustomerUser,
  Franchise,
  GoogleMapsKeyItem,
  PaymentGatewayItem,
  PaymentTransaction,
  DeliveryWalletTransaction,
} from '../types';

export const initialBrandSettings: BrandSettings = {
  brandName: 'LIKART FOOD',
  tagline: 'Gourmet Flavours, Delivered at Lightning Speed',
  logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=120&auto=format&fit=crop&q=80',
  faviconUrl: '/favicon.ico',
  supportPhone: '+91 8000 123 456',
  supportEmail: 'care@likartfood.com',
  headquartersAddress: 'Bengaluru Central Commercial Hub, Karnataka, India - 560034',
  googleMapsApiKey: 'AIzaSyCh6AvlBs1g6vAf5dkPQc7z7HeG6NDl73Y',
  isMapSimulation: false,
  defaultCommissionRate: 15,
  platformFee: 5,
  gstRate: 5,
  companyPages: {
    aboutUs: {
      enabled: true,
      heading: 'About LIKART FOOD',
      subheading: 'Gourmet Flavours, Delivered at Lightning Speed',
      story: 'Founded with the singular mission of bringing Michelin-quality flavours and culinary street food icons straight to your doorstep, LIKART FOOD is a premier on-demand culinary platform connecting food enthusiasts with verified kitchens.',
      standards: 'We partner exclusively with hygienic, FSSAI-certified master kitchens and culinary artisans. Every order is tracked in real-time with Google Maps precision, sealed with tamper-proof packaging, and delivered by our trained, insured delivery fleet.',
      stat1Number: '25 Mins',
      stat1Label: 'Average delivery time across zones',
      stat2Number: '100%',
      stat2Label: 'FSSAI verified kitchens & hygiene checked',
      stat3Number: '24/7',
      stat3Label: 'Dedicated customer care & chat resolution',
      customStats: [],
      customSections: [],
    },
    contactSupport: {
      enabled: true,
      heading: 'Contact Headquarters & Support',
      description: 'Have questions regarding orders, vendor partnerships, or delivery fleet onboarding? Reach out anytime.',
      phone: '+91 8000 123 456',
      email: 'care@likartfood.com',
      address: 'Bengaluru Central Commercial Hub',
      cityStateZip: 'Karnataka, India - 560034',
      operatingHours: '24 Hours • 7 Days (Toll-Free Helpline)',
      customChannels: [],
    },
    privacyPolicy: {
      enabled: true,
      heading: 'Privacy & Data Protection Policy',
      lastUpdated: 'October 2026',
      content: `At LIKART FOOD, we take the confidentiality and privacy of our customers, restaurant partners, and delivery professionals with utmost gravity.

1. Location & GPS Data
We collect foreground and background geolocation coordinates exclusively during active delivery operations to provide accurate distance estimations, auto-detect nearest kitchens, and enable live Google Maps route tracking.

2. Payment Security
All payment credentials (credit/debit cards, UPI VPA, net banking) are handled by certified, PCI-DSS Level 1 compliant partners (Razorpay, Cashfree, PhonePe). We do not store plain text card credentials.

3. Data Retention & Safeguards
User profile data, delivery addresses, and invoice histories are protected using 256-bit SSL encryption and strict role-based access controls. You may request account deletion or data export anytime via Customer Support.`,
      customSections: [],
    },
    termsConditions: {
      enabled: true,
      heading: 'Terms & Conditions of Service',
      effectiveDate: 'October 2026',
      content: `By accessing the LIKART FOOD application or web portal, you agree to comply with our commercial terms and community standards.

1. Ordering & Acceptance
Orders placed on the platform constitute an offer to purchase culinary items from our independent restaurant vendors. The contract is executed upon restaurant confirmation and kitchen dispatch.

2. Delivery Verification OTP
For consumer protection and parcel handover security, orders require oral disclosure of the 4-digit numeric verification OTP displayed on the tracking screen to the delivery partner upon arrival.

3. Pricing & Platform Fees
Menu prices are set by individual restaurants. Applicable platform fees, delivery delivery fees, and statutory GST are clearly calculated and displayed before payment confirmation.`,
      customSections: [],
    },
    refundCancellation: {
      enabled: true,
      heading: 'Cancellation & Refund Policy',
      subtitle: 'Fair Customer Protection & SLA Guarantee',
      content: `We understand plans can change. Here is our transparent cancellation policy:

• Immediate Cancellations: Free full 100% cancellation before the restaurant starts food preparation.

• Quality Assurance Refunds: In the rare event of food spill, incorrect items, or extreme delivery delays, full or partial instant refunds are credited within 24-48 hours.

• Refund Routing: Online payments are credited back to the source bank account, credit card, or UPI wallet with an official transaction reference.

• Doorstep Verification: For Pay on Delivery orders, please verify package seal before payment handover to delivery executive.`,
      customSections: [],
    },
    customPages: [],
  },
  soundAlerts: {
    enabled: true,
    ringUntilAccepted: true,
    restaurantSoundEnabled: true,
    restaurantVolume: 0.85,
    riderSoundEnabled: true,
    riderVolume: 0.85,
  },
  gateways: {
    razorpay: {
      enabled: false,
      keyId: '',
      keySecretMasked: '',
      testMode: false,
    },
    cashfree: {
      enabled: false,
      appId: '',
      secretMasked: '',
      testMode: false,
    },
    phonepe: {
      enabled: false,
      merchantId: '',
      saltKeyMasked: '',
      testMode: false,
    },
    cod: {
      enabled: true,
      maxOrderLimit: 3000,
    },
  },
};

export const initialBanners: BannerPromo[] = [
  {
    id: 'ban-welcome50',
    title: 'Flat 50% OFF First 3 Orders',
    subtitle: 'Craving something delicious? Enjoy 50% discount up to ₹150 with Likart lightning-fast doorstep delivery.',
    code: 'WELCOME50',
    bgColor: 'from-orange-600 via-rose-600 to-amber-600',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&auto=format&fit=crop&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-slice-of-pizza-42805-large.mp4',
    linkText: 'Claim 50% OFF',
  },
  {
    id: 'ban-freeship',
    title: 'Free Express Delivery Fest',
    subtitle: 'Zero delivery fees on all gourmet orders above ₹199 from top-rated kitchens in your area.',
    code: 'FREESHIP',
    bgColor: 'from-emerald-600 via-teal-600 to-cyan-700',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1000&auto=format&fit=crop&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-table-with-burgers-and-french-fries-41865-large.mp4',
    linkText: 'Free Delivery',
  },
  {
    id: 'ban-fiesta150',
    title: 'Weekend Gourmet Fiesta',
    subtitle: 'Save up to ₹150 on authentic dum biryanis, wood-fired pizzas, cheesy pastas & sizzlers.',
    code: 'FIESTA150',
    bgColor: 'from-violet-600 via-purple-600 to-indigo-700',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1000&auto=format&fit=crop&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-chef-cooking-vegetables-in-a-wok-pan-43093-large.mp4',
    linkText: 'Explore Fiesta',
  },
  {
    id: 'ban-sweet100',
    title: 'Desserts & Thick Shakes Carnival',
    subtitle: 'Flat ₹100 instant discount on artisanal waffles, dark chocolate brownies, gelato & chilled milkshakes.',
    code: 'SWEET100',
    bgColor: 'from-pink-600 via-rose-600 to-red-600',
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1000&auto=format&fit=crop&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-chocolate-sauce-on-pancakes-42845-large.mp4',
    linkText: 'Order Desserts',
  },
];

export const initialCategories: RestaurantCategory[] = [
  { id: 'cat-1', name: 'Biryani Special', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&auto=format&fit=crop&q=80', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-chef-cooking-vegetables-in-a-wok-pan-43093-large.mp4' },
  { id: 'cat-2', name: 'Pizzas & Pasta', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=80', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-slice-of-pizza-42805-large.mp4' },
  { id: 'cat-3', name: 'Pure Veg Delights', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop&q=80' },
  { id: 'cat-4', name: 'South Indian Tiffin', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=300&auto=format&fit=crop&q=80' },
  { id: 'cat-5', name: 'Chinese & Wok', image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=300&auto=format&fit=crop&q=80' },
  { id: 'cat-6', name: 'Burgers & Wraps', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=80', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-table-with-burgers-and-french-fries-41865-large.mp4' },
  { id: 'cat-7', name: 'Desserts & Cakes', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&auto=format&fit=crop&q=80' },
  { id: 'cat-8', name: 'Beverages & Shakes', image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=300&auto=format&fit=crop&q=80', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-refreshing-soda-drink-with-ice-and-mint-42838-large.mp4' },
];

export const initialCuisines: Cuisine[] = [
  {
    id: 'cui-biryani',
    name: 'Biryani Special',
    slug: 'biryani',
    emoji: '🥘',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-chef-cooking-vegetables-in-a-wok-pan-43093-large.mp4',
    description: 'Aromatic Hyderabadi, Lucknowi, and Dum Biryanis with slow-cooked meats, fragrant saffron rice, and salan.',
    isPopular: true,
    isActive: true,
    createdAt: '2026-01-10',
  },
  {
    id: 'cui-pizza',
    name: 'Pizzas & Pasta',
    slug: 'pizza',
    emoji: '🍕',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-slice-of-pizza-42805-large.mp4',
    description: 'Wood-fired hand-tossed sourdough pizzas, creamy Alfredo & Arrabiata pastas, and cheesy garlic breads.',
    isPopular: true,
    isActive: true,
    createdAt: '2026-01-10',
  },
  {
    id: 'cui-veg',
    name: 'Pure Veg Delights',
    slug: 'veg',
    emoji: '🥗',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80',
    description: '100% pure vegetarian culinary specialties, paneer curries, dal makhani, and nutritious green bowls.',
    isPopular: true,
    isActive: true,
    createdAt: '2026-01-10',
  },
  {
    id: 'cui-south',
    name: 'South Indian Tiffin',
    slug: 'south',
    emoji: '🥞',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80',
    description: 'Crispy ghee podi roast dosas, steaming soft button idlis, crunchy medu vadas, and traditional filter coffee.',
    isPopular: true,
    isActive: true,
    createdAt: '2026-01-10',
  },
  {
    id: 'cui-chinese',
    name: 'Chinese & Wok',
    slug: 'chinese',
    emoji: '🥟',
    image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=500&auto=format&fit=crop&q=80',
    description: 'Sizzling hakka noodles, steamed momos, crispy Manchurian gravy, dim sums, and fiery Schezwan wok bowls.',
    isPopular: true,
    isActive: true,
    createdAt: '2026-01-10',
  },
  {
    id: 'cui-burger',
    name: 'Burgers & Fries',
    slug: 'burger',
    emoji: '🍔',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
    description: 'Juicy gourmet smash burgers, loaded peri-peri fries, crunchy crispy fried chicken wings, and dips.',
    isPopular: true,
    isActive: true,
    createdAt: '2026-01-10',
  },
  {
    id: 'cui-desserts',
    name: 'Desserts & Cakes',
    slug: 'desserts',
    emoji: '🍰',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=80',
    description: 'Decadent Belgian chocolate brownies, artisanal pastries, cheesecakes, ice creams, and warm gulab jamuns.',
    isPopular: true,
    isActive: true,
    createdAt: '2026-01-10',
  },
  {
    id: 'cui-beverages',
    name: 'Chai & Shakes',
    slug: 'beverages',
    emoji: '🥤',
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=500&auto=format&fit=crop&q=80',
    description: 'Kulhad ginger masala chai, cold coffees, thick milkshakes, fresh fruit smoothies, and mocktails.',
    isPopular: true,
    isActive: true,
    createdAt: '2026-01-10',
  },
  {
    id: 'cui-mughlai',
    name: 'Mughlai & Kebabs',
    slug: 'mughlai',
    emoji: '🍢',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=80',
    description: 'Royal Mughlai recipes, galouti kebabs, butter chicken, rich mutton rogan josh, and tandoori breads.',
    isPopular: false,
    isActive: true,
    createdAt: '2026-01-10',
  },
  {
    id: 'cui-north',
    name: 'North Indian Curries',
    slug: 'north-indian',
    emoji: '🍲',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&auto=format&fit=crop&q=80',
    description: 'Hearty Punjabi thalis, paneer tikka masala, garlic butter naans, and Amritsari stuffed kulchas.',
    isPopular: false,
    isActive: true,
    createdAt: '2026-01-10',
  },
  {
    id: 'cui-street',
    name: 'Street Food & Chaat',
    slug: 'street-food',
    emoji: '🧆',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80',
    description: 'Tangy crispy pani puri, samosas, dahi sev puri, pav bhaji, chole bhature, and chaat platters.',
    isPopular: false,
    isActive: true,
    createdAt: '2026-01-10',
  },
  {
    id: 'cui-seafood',
    name: 'Seafood & Coastal',
    slug: 'seafood',
    emoji: '🦐',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=80',
    description: 'Fresh catch fish curries, Mangalorean ghee roast prawns, Malabar fish fry, and crab masala.',
    isPopular: false,
    isActive: true,
    createdAt: '2026-01-10',
  },
];

export const initialZones: DeliveryZone[] = [];

export const initialRestaurants: Restaurant[] = [];

export const initialMenuItems: MenuItem[] = [];

export const initialCoupons: Coupon[] = [
  {
    id: 'coup-welcome50',
    code: 'WELCOME50',
    discountPercent: 50,
    maxDiscount: 150,
    minOrderValue: 249,
    validUntil: '2027-12-31',
    description: 'Flat 50% discount up to ₹150 on your food orders',
    isActive: true,
  },
  {
    id: 'coup-freeship',
    code: 'FREESHIP',
    discountPercent: 100,
    maxDiscount: 60,
    minOrderValue: 199,
    validUntil: '2027-12-31',
    description: 'Free doorstep express delivery across all service zones',
    isActive: true,
  },
  {
    id: 'coup-fiesta150',
    code: 'FIESTA150',
    discountPercent: 30,
    maxDiscount: 150,
    minOrderValue: 399,
    validUntil: '2027-12-31',
    description: 'Save up to ₹150 on pizzas, biryanis & multi-cuisine platters',
    isActive: true,
  },
  {
    id: 'coup-sweet100',
    code: 'SWEET100',
    discountPercent: 25,
    maxDiscount: 100,
    minOrderValue: 299,
    validUntil: '2027-12-31',
    description: 'Flat ₹100 instant discount on shakes, desserts & bakery',
    isActive: true,
  },
];

export const initialDeliveryPartners: DeliveryPartner[] = [
  {
    id: 'rider-1',
    name: 'Rahul Sharma',
    email: 'rahul.rider@likartfood.com',
    phone: '9876543210',
    password: 'rider123',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop&crop=faces',
    zoneId: 'zone-koramangala',
    status: 'approved',
    isOnline: true,
    currentLocation: { lat: 12.9352, lng: 77.6245 },
    rating: 4.9,
    totalTrips: 14,
    // Total gross trip earnings + tips earned lifetime = ₹1,250
    totalEarnings: 1250,
    // Cash collected amount currently in hand from COD orders = ₹450
    totalCashCollected: 450,
    // Withdraw available balance = Total Earnings (₹1,250) - Cash in Hand (₹450) = ₹800
    walletBalance: 800,
    floatingCashLimit: 1000,
    kyc: {
      fatherName: 'Rajesh Sharma',
      dob: '1996-05-14',
      aadhaarNumber: '928172938472',
      panNumber: 'ABCDE1234F',
      drivingLicenseNumber: 'KA-05-2019-0029182',
      rcNumber: 'KA05EJ4921',
      vehicleType: 'Motorcycle',
      vehicleNumber: 'KA-05-EJ-4921',
      payoutUpiOrBank: 'rahul@oksbi',
      verified: true,
    },
    createdAt: '2026-01-15T09:00:00Z',
  },
];

export const initialDeliveryWalletTransactions: DeliveryWalletTransaction[] = [
  {
    id: 'wtx-init-1',
    riderId: 'rider-1',
    type: 'trip_earning',
    amount: 65,
    orderId: 'ORD-9821',
    description: 'Trip Delivery Fee Earned - Order #ORD-9821 • Added to Total Earnings in Wallet',
    balanceAfter: 800,
    timestamp: '11:45 AM, 11/10/2026',
  },
  {
    id: 'wtx-init-2',
    riderId: 'rider-1',
    type: 'customer_tip',
    amount: 25,
    orderId: 'ORD-9821',
    description: 'Customer Generosity Tip Earned - Order #ORD-9821 • Added to Total Earnings in Wallet',
    balanceAfter: 735,
    timestamp: '11:45 AM, 11/10/2026',
  },
  {
    id: 'wtx-init-3',
    riderId: 'rider-1',
    type: 'cod_cash_deduction',
    amount: -450,
    orderId: 'ORD-9815',
    description: 'COD Cash Collected from Customer at Doorstep (Recorded in Cash in Hand Option) - Order #ORD-9815',
    balanceAfter: 710,
    timestamp: '10:15 AM, 11/10/2026',
  },
  {
    id: 'wtx-init-4',
    riderId: 'rider-1',
    type: 'trip_earning',
    amount: 80,
    orderId: 'ORD-9815',
    description: 'Trip Delivery Fee Earned - Order #ORD-9815 • Added to Total Earnings in Wallet',
    balanceAfter: 1160,
    timestamp: '10:15 AM, 11/10/2026',
  },
  {
    id: 'wtx-init-5',
    riderId: 'rider-1',
    type: 'trip_earning',
    amount: 1080,
    description: 'Accumulated Lifetime Trip Deliveries & Direct Customer Tips • Added to Total Earnings',
    balanceAfter: 1080,
    timestamp: '09:00 AM, 10/10/2026',
  },
];

export const initialOrders: Order[] = [];

export const initialAdminUsers: AdminUser[] = [
  {
    id: 'adm-super-permanent',
    name: 'Permanent Super Admin',
    email: 'likart9900@gmail.com',
    password: 'Maalu@1122',
    role: 'super_admin',
    status: 'active',
    permissions: ['all', 'restaurants', 'riders', 'zones', 'orders', 'finance', 'settings', 'franchises_manage'],
    lastLogin: 'Just now',
  },
  {
    id: 'adm-super',
    name: 'Super Admin',
    email: 'foodtohome2@gmail.com',
    password: 'admin123',
    role: 'super_admin',
    status: 'active',
    permissions: ['all', 'restaurants', 'riders', 'zones', 'orders', 'finance', 'settings', 'franchises_manage'],
    lastLogin: 'Just now',
  },
];

export const initialSupportTickets: SupportTicket[] = [];

export const initialPayoutRequests: PayoutRequest[] = [];

export const initialCustomerUser: CustomerUser | null = null;

export const initialFranchises: Franchise[] = [];

export const initialGoogleMapsKeys: GoogleMapsKeyItem[] = [];

export const initialPaymentGateways: PaymentGatewayItem[] = [
  {
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
  },
  {
    id: 'gw-razorpay',
    provider: 'razorpay',
    name: 'Razorpay Payment Gateway',
    appOrMerchantId: 'rzp_live_8391740',
    apiKeyOrSecretMasked: '••••••••••••7409',
    webhookSecret: 'whsec_rzp_live_8391',
    testMode: false,
    enabled: true,
    supportedMethods: ['UPI (GPay / PhonePe / Paytm)', 'Credit & Debit Cards', 'Net Banking'],
    createdAt: '2026-01-01',
  },
  {
    id: 'gw-phonepe',
    provider: 'phonepe',
    name: 'PhonePe PG Express',
    appOrMerchantId: 'M23061604832',
    apiKeyOrSecretMasked: '••••••••••••8821',
    webhookSecret: 'whsec_phonepe_live',
    testMode: false,
    enabled: true,
    supportedMethods: ['PhonePe Direct UPI', 'UPI QR Scanner', 'Saved Cards'],
    createdAt: '2026-01-01',
  },
  {
    id: 'gw-cashfree',
    provider: 'cashfree',
    name: 'Cashfree Payments AutoCollect',
    appOrMerchantId: 'CF_APP_892103',
    apiKeyOrSecretMasked: '••••••••••••3310',
    webhookSecret: 'whsec_cf_auto_892',
    testMode: false,
    enabled: true,
    supportedMethods: ['AutoCollect UPI', 'NetBanking', 'Instant Settlement'],
    createdAt: '2026-01-01',
  },
];

export const initialPaymentTransactions: PaymentTransaction[] = [];


