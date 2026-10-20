import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { LiveMap } from '../common/LiveMap';
import {
  Bike,
  Navigation,
  Phone,
  CheckCircle,
  MapPin,
  Clock,
  DollarSign,
  ShieldCheck,
  Power,
  KeyRound,
  AlertCircle,
  ArrowRight,
  Smartphone,
  Radio,
  Zap,
  RefreshCw,
  Compass,
  CheckCircle2,
  PackageCheck,
  ShoppingBag,
  Store,
  ExternalLink,
  XCircle,
  AlertOctagon,
  X,
  Bell,
  Volume2,
  VolumeX,
  ThumbsDown,
  Lock,
  Unlock,
  Sparkles,
  Banknote,
  Wallet,
  Search,
  Copy,
  Crosshair,
  SlidersHorizontal,
  Bookmark,
  Star,
  Flame,
  Target,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  Trash2,
  Check,
} from 'lucide-react';
import {
  calculateDistanceKm,
  findMatchingZone,
  reverseGeocodeLocation,
  getAccurateCurrentPosition,
  searchLocationsOnMap,
  parseCoordinatesFromString,
  SearchLocationResult,
} from '../../utils/geoUtils';
import {
  playRiderTone,
  startRiderTripRinging,
  stopRiderTripRinging,
  playAudioTunePreview,
} from '../../utils/soundUtils';
import { DeliveryPaymentQRCard } from './DeliveryPaymentQRCard';
import { IncomingTripModal } from './IncomingTripModal';
import { RiderPayoutModal } from './RiderPayoutModal';
import { RiderEarningsLedger } from './RiderEarningsLedger';
import { RiderPaymentGatewayDepositModal } from './RiderPaymentGatewayDepositModal';

export interface DispatchPreset {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  zoneName: string;
  createdAt: string;
}

const defaultPresets: DispatchPreset[] = [
  {
    id: 'preset-kormangala',
    name: 'Koramangala 4th Block (Sony World Signal)',
    lat: 12.9352,
    lng: 77.6245,
    address: '80 Feet Road, 4th Block, Koramangala',
    zoneName: 'Koramangala Zone',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'preset-indiranagar',
    name: 'Indiranagar 100 Feet Road (Metro Hub)',
    lat: 12.9716,
    lng: 77.6412,
    address: '100 Feet Road, HAL 2nd Stage, Indiranagar',
    zoneName: 'Indiranagar Zone',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'preset-hsr',
    name: 'HSR Layout Sector 1 (BDA Food Hub)',
    lat: 12.9116,
    lng: 77.6473,
    address: '27th Main Road, Sector 1, HSR Layout',
    zoneName: 'HSR Layout Zone',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'preset-whitefield',
    name: 'Whitefield EPIP Corridor (ITPB Food Court)',
    lat: 12.9866,
    lng: 77.7382,
    address: 'ITPB Main Road, Whitefield',
    zoneName: 'Whitefield Zone',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'preset-cbd',
    name: 'Central Business District (MG Road / Brigade)',
    lat: 12.9756,
    lng: 77.6066,
    address: 'MG Road Junction, Central Bengaluru',
    zoneName: 'Bengaluru Metro Hub',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'preset-jayanagar',
    name: 'Jayanagar 4th Block (Shopping Complex)',
    lat: 12.9255,
    lng: 77.5833,
    address: '11th Main Road, 4th Block, Jayanagar',
    zoneName: 'South Bengaluru Zone',
    createdAt: new Date().toISOString(),
  },
];

export const DeliveryDashboard: React.FC = () => {
  const {
    deliveryPartners,
    currentRiderId,
    setCurrentRiderId,
    authRider,
    logoutRider,
    setActivePortal,
    toggleRiderOnline,
    orders,
    updateOrderStatus,
    markOrderAsPaid,
    verifyDeliveryOtp,
    requestPayout,
    payoutRequests,
    deliveryWalletTransactions,
    cancelRiderPayoutRequest,
    addNotification,
    updateRiderLocation,
    acceptOrderForDelivery,
    rejectOrderForDelivery,
    reassignOrderFromDelivery,
    depositRiderFloatingCash,
    restaurants,
    zones,
    googleMapsKeys,
    brandSettings,
  } = useApp();

  const [dashboardTab, setDashboardTab] = useState<'orders' | 'earnings' | 'payouts'>('orders');
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isCashDepositModalOpen, setIsCashDepositModalOpen] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [payoutRequested, setPayoutRequested] = useState(false);
  const otpInputRef = useRef<HTMLInputElement>(null);

  // Reassign Active Trip Modal States
  const [reassignTripModal, setReassignTripModal] = useState<{
    orderId: string;
    restaurantName: string;
  } | null>(null);
  const [reassignReason, setReassignReason] = useState('Vehicle breakdown / flat tire / puncture');
  const [customReassignReason, setCustomReassignReason] = useState('');

  // Incoming Trip Dispatch Pop-up Offer State
  const [activePopupOfferOrderId, setActivePopupOfferOrderId] = useState<string | null>(null);
  const [isOfferPopupMinimized, setIsOfferPopupMinimized] = useState<boolean>(false);
  const [hasDismissedOfferBatch, setHasDismissedOfferBatch] = useState<boolean>(false);

  // Food Items Collection Verification State at Restaurant
  const [collectedItemIds, setCollectedItemIds] = useState<Record<string, boolean>>({});

  // Sound Alerts State
  const [riderSoundAlerts, setRiderSoundAlerts] = useState(true);

  // GPS and Live Location States
  const [isFetchingGps, setIsFetchingGps] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(8);
  const [currentAddressText, setCurrentAddressText] = useState<string>('Koramangala 4th Block, 80 Feet Road');
  const [isLiveGpsTracking, setIsLiveGpsTracking] = useState(true);
  const [isCoordsUnlocked, setIsCoordsUnlocked] = useState(false);
  const [customLatInput, setCustomLatInput] = useState<string>('');
  const [customLngInput, setCustomLngInput] = useState<string>('');
  const [hubSearchQuery, setHubSearchQuery] = useState<string>('');
  const [overrideSubTab, setOverrideSubTab] = useState<'quick_fetch' | 'search' | 'coordinates' | 'kitchens' | 'presets'>('quick_fetch');
  const [lastGpsLockedTime, setLastGpsLockedTime] = useState<string>('Live Sensor Active');
  const [nudgeStepMode, setNudgeStepMode] = useState<'fine' | 'coarse'>('fine');

  // Landmark Search States
  const [placeSearchQuery, setPlaceSearchQuery] = useState('');
  const [placeSearchResults, setPlaceSearchResults] = useState<SearchLocationResult[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);

  // Quick Paste & Auto-Fetch States
  const [quickPasteInput, setQuickPasteInput] = useState('');
  const [isPastingCoords, setIsPastingCoords] = useState(false);

  // Dispatch Presets States
  const [savedPresets, setSavedPresets] = useState<DispatchPreset[]>(() => {
    const saved = localStorage.getItem('likart_rider_dispatch_presets');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return defaultPresets;
  });
  const [newPresetName, setNewPresetName] = useState('');
  const [isAddingPreset, setIsAddingPreset] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  const activeMapKey = googleMapsKeys.find(
    (k) => (k.isPrimary || k.isActive) && k.status !== 'quota_exceeded'
  )?.apiKey;

  const rider =
    authRider ||
    deliveryPartners.find((d) => d.id === currentRiderId) ||
    deliveryPartners[0];

  if (!rider) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-md">
          <Bike className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold font-heading text-slate-900">No Delivery Partner Enrolled</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          No delivery partner is currently enrolled or active in your session. Please register as a delivery partner or sign in.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => setActivePortal('customer')}
            className="px-4 py-2.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
          >
            Customer Website
          </button>
          <button
            onClick={() => logoutRider()}
            className="px-5 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md transition"
          >
            Partner Sign In
          </button>
        </div>
      </div>
    );
  }

  const riderCashHeld = rider?.totalCashCollected || 0;
  const riderTotalEarnings =
    typeof rider?.totalEarnings === 'number'
      ? rider.totalEarnings
      : Math.max(0, (rider?.walletBalance || 0) + riderCashHeld);
  // Formula: available withdrawal balance is total earnings - cash in hand = withdraw available balance
  const withdrawAvailableBalance = Math.max(
    0,
    rider?.walletBalance ?? (riderTotalEarnings - riderCashHeld)
  );
  const cashHoldingLimit = rider?.floatingCashLimit || 1000;
  const isCashHoldingLimitExceeded = riderCashHeld >= cashHoldingLimit;
  const excessCashAmount = Math.max(0, riderCashHeld - cashHoldingLimit);
  const cashLimitUsagePercent = Math.min(
    100,
    Math.round((riderCashHeld / cashHoldingLimit) * 100)
  );

  const riderLat = rider.currentLocation?.lat || 12.9352;
  const riderLng = rider.currentLocation?.lng || 77.6245;

  const riderZoneMatch = findMatchingZone(riderLat, riderLng, zones);

  // Assigned or active order for this rider
  const activeOrder = orders.find(
    (o) =>
      o.deliveryPartnerId === rider.id &&
      o.status !== 'delivered' &&
      o.status !== 'cancelled'
  );

  // Active Navigation Mode: 'pickup' (Rider -> Restaurant) or 'dropoff' (Rider -> Customer) or 'both'
  const [activeNavMode, setActiveNavMode] = useState<'pickup' | 'dropoff' | 'both'>('pickup');

  // Automatically switch navigation mode according to trip progress
  useEffect(() => {
    if (activeOrder) {
      if (activeOrder.status === 'out_for_delivery') {
        setActiveNavMode('dropoff');
      } else {
        setActiveNavMode('pickup');
      }
    }
  }, [activeOrder?.status]);

  // Restaurant & Customer Coordinates for active order
  const activeOrderRestaurant = activeOrder
    ? restaurants.find(
        (r) =>
          r.id === activeOrder.restaurantId ||
          r.name.toLowerCase() === activeOrder.restaurantName.toLowerCase()
      )
    : null;

  const activeRestLat = activeOrderRestaurant?.coordinates?.lat || 12.9348;
  const activeRestLng = activeOrderRestaurant?.coordinates?.lng || 77.625;

  const activeCustLat = activeOrder?.deliveryAddress.coordinates.lat || 12.9352;
  const activeCustLng = activeOrder?.deliveryAddress.coordinates.lng || 77.6245;

  // Real GPS distances from live rider position
  const distRiderToRestKm = calculateDistanceKm(riderLat, riderLng, activeRestLat, activeRestLng);
  const distRiderToCustKm = calculateDistanceKm(riderLat, riderLng, activeCustLat, activeCustLng);
  const distRestToCustKm = calculateDistanceKm(activeRestLat, activeRestLng, activeCustLat, activeCustLng);

  // Turn-by-turn guidance preview
  const currentTurnInstruction =
    activeNavMode === 'pickup'
      ? `Ride to ${activeOrder?.restaurantName || 'Restaurant'} (${distRiderToRestKm} km away) • Pickup order #${activeOrder?.id}`
      : activeNavMode === 'dropoff'
      ? `Ride to ${activeOrder?.customerName || 'Customer'} (${distRiderToCustKm} km away) • Deliver to ${activeOrder?.deliveryAddress.flat || 'doorstep'}`
      : `Full Route: ${activeOrder?.restaurantName} (${distRiderToRestKm} km) ➔ Customer (${distRestToCustKm} km)`;

  // Direct Google Maps Turn-by-Turn Navigation URLs (bike / two-wheeler mode)
  const pickupGoogleMapsNavUrl = `https://www.google.com/maps/dir/?api=1&origin=${riderLat},${riderLng}&destination=${activeRestLat},${activeRestLng}&travelmode=two-wheeler`;
  const dropoffGoogleMapsNavUrl = `https://www.google.com/maps/dir/?api=1&origin=${riderLat},${riderLng}&destination=${activeCustLat},${activeCustLng}&travelmode=two-wheeler`;
  const activeExternalNavUrl = activeNavMode === 'pickup' ? pickupGoogleMapsNavUrl : dropoffGoogleMapsNavUrl;

  const completedTrips = orders.filter(
    (o) => o.deliveryPartnerId === rider?.id && o.status === 'delivered'
  );

  const declinedTrips = orders.filter(
    (o) => o.rejectedByDeliveryPartnerIds && o.rejectedByDeliveryPartnerIds.includes(rider?.id)
  );

  // Nearby unassigned orders available for pickup (excluding trips declined by this rider)
  const nearbyAvailableOrders = orders
    .filter(
      (o) =>
        !o.deliveryPartnerId &&
        (!o.rejectedByDeliveryPartnerIds || !o.rejectedByDeliveryPartnerIds.includes(rider?.id)) &&
        (o.status === 'placed' ||
          o.status === 'confirmed' ||
          o.status === 'preparing' ||
          o.status === 'ready_for_pickup')
    )
    .map((o) => {
      const rest = restaurants.find(
        (r) => r.name.toLowerCase() === o.restaurantName.toLowerCase()
      );
      const restLat = rest?.coordinates?.lat || 12.9348;
      const restLng = rest?.coordinates?.lng || 77.625;

      const distToRestaurantKm = calculateDistanceKm(
        riderLat,
        riderLng,
        restLat,
        restLng
      );

      const distToCustomerKm = calculateDistanceKm(
        restLat,
        restLng,
        o.deliveryAddress.coordinates.lat,
        o.deliveryAddress.coordinates.lng
      );

      const estimatedEarnings = o.deliveryFee + (o.tipAmount || 0);

      return {
        order: o,
        restaurant: rest,
        distToRestaurantKm,
        distToCustomerKm,
        estimatedEarnings,
      };
    })
    .sort((a, b) => a.distToRestaurantKm - b.distToRestaurantKm);

  // Real Current Restaurants Hubs (filtering registered restaurants with valid coordinates)
  const realRestaurantHubs = restaurants
    .filter(
      (r) =>
        r.coordinates &&
        typeof r.coordinates.lat === 'number' &&
        typeof r.coordinates.lng === 'number' &&
        !isNaN(r.coordinates.lat) &&
        !isNaN(r.coordinates.lng)
    )
    .map((r) => {
      const distKm = calculateDistanceKm(
        riderLat,
        riderLng,
        r.coordinates.lat,
        r.coordinates.lng
      );
      const waitingOrdersCount = nearbyAvailableOrders.filter(
        (o) =>
          o.order.restaurantId === r.id ||
          o.order.restaurantName?.toLowerCase() === r.name?.toLowerCase()
      ).length;
      const isCurrentHub =
        Math.abs(riderLat - r.coordinates.lat) < 0.0008 &&
        Math.abs(riderLng - r.coordinates.lng) < 0.0008;

      return {
        ...r,
        distKm,
        waitingOrdersCount,
        isCurrentHub,
      };
    })
    .sort((a, b) => {
      if (b.waitingOrdersCount !== a.waitingOrdersCount) {
        return b.waitingOrdersCount - a.waitingOrdersCount;
      }
      return a.distKm - b.distKm;
    });

  const filteredRestaurantHubs = realRestaurantHubs.filter((r) => {
    if (!hubSearchQuery.trim()) return true;
    const q = hubSearchQuery.toLowerCase();
    const cuisineStr = Array.isArray(r.cuisine) ? r.cuisine.join(' ').toLowerCase() : '';
    const zoneObj = zones.find((z) => z.id === r.zoneId);
    const zoneStr = zoneObj ? zoneObj.name.toLowerCase() : '';
    return (
      r.name.toLowerCase().includes(q) ||
      cuisineStr.includes(q) ||
      (r.address && r.address.toLowerCase().includes(q)) ||
      zoneStr.includes(q)
    );
  });

  const restaurantsWithinRange = realRestaurantHubs.filter((r) => r.distKm <= 3.5);
  const pendingOrdersWithinRange = nearbyAvailableOrders.filter((o) => o.distToRestaurantKm <= 3.5);
  const nearestRestaurant = realRestaurantHubs.length > 0 ? realRestaurantHubs[0] : null;
  const hotspotRestaurant =
    [...realRestaurantHubs].sort((a, b) => b.waitingOrdersCount - a.waitingOrdersCount)[0] || nearestRestaurant;

  // Upgraded Auto-Fetch Accurate Current Location via Google Maps GPS
  const handleAutoFetchGpsLocation = async () => {
    setIsFetchingGps(true);
    try {
      const { lat, lng, accuracy } = await getAccurateCurrentPosition();
      setGpsAccuracy(accuracy);
      setCustomLatInput(lat.toFixed(5));
      setCustomLngInput(lng.toFixed(5));

      const geocoded = await reverseGeocodeLocation(lat, lng, activeMapKey);
      const address = geocoded.fullAddress || `${geocoded.flat}, ${geocoded.area}`;
      setCurrentAddressText(address);

      updateRiderLocation(rider.id, {
        lat,
        lng,
        address,
      });

      setLastGpsLockedTime(new Date().toLocaleTimeString());
      const matched = findMatchingZone(lat, lng, zones);

      addNotification(
        'GPS Dispatch Location Locked',
        `Live device GPS locked: ${geocoded.area} (Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)} • ±${accuracy}m precision • Zone: ${matched.zone.name})`,
        'system'
      );
    } catch (err: any) {
      console.warn('Rider GPS error:', err?.message);
      // Fallback gracefully to first active restaurant or current coordinates
      const fallbackRest = restaurants.find((r) => r.coordinates?.lat && r.coordinates?.lng) || restaurants[0];
      const fallbackLat = fallbackRest?.coordinates?.lat || 12.9352;
      const fallbackLng = fallbackRest?.coordinates?.lng || 77.6245;
      const fallbackName = fallbackRest?.name || riderZoneMatch.zone.name;
      setCustomLatInput(fallbackLat.toFixed(5));
      setCustomLngInput(fallbackLng.toFixed(5));
      updateRiderLocation(rider.id, {
        lat: fallbackLat,
        lng: fallbackLng,
        address: fallbackRest?.address || 'Central Hub, Bengaluru',
      });
      setLastGpsLockedTime('Default Anchor');
      addNotification(
        'GPS Coordinates Locked',
        `Device sensor unavailable. Locked to ${fallbackName} (${fallbackLat.toFixed(5)}, ${fallbackLng.toFixed(5)}). Tap any Real Restaurant Hub below to override.`,
        'system'
      );
    } finally {
      setIsFetchingGps(false);
    }
  };

  // 1-Click Auto-Fetch to Nearest Real Restaurant Hub
  const handleAutoFetchNearestRestaurant = () => {
    if (realRestaurantHubs.length === 0) {
      addNotification('No Restaurants Found', 'No restaurants with coordinates are registered yet.', 'system');
      return;
    }
    const nearest = realRestaurantHubs[0];
    handleSelectHubPreset(
      nearest.name,
      nearest.coordinates.lat,
      nearest.coordinates.lng,
      nearest.address
    );
    addNotification(
      'Nearest Restaurant Hub Auto-Fetched',
      `Snapped to closest kitchen: ${nearest.name} (${nearest.distKm.toFixed(1)} km away). Ready for kitchen dispatch.`,
      'system'
    );
  };

  // 1-Click Auto-Fetch to High-Demand Hotspot Kitchen
  const handleAutoFetchHotspotRestaurant = () => {
    const hotspot = [...realRestaurantHubs].sort((a, b) => b.waitingOrdersCount - a.waitingOrdersCount)[0];
    if (!hotspot || hotspot.waitingOrdersCount === 0) {
      handleAutoFetchNearestRestaurant();
      return;
    }
    handleSelectHubPreset(
      hotspot.name,
      hotspot.coordinates.lat,
      hotspot.coordinates.lng,
      hotspot.address
    );
    addNotification(
      'High-Demand Hotspot Auto-Fetched',
      `Locked to ${hotspot.name} (${hotspot.waitingOrdersCount} live order(s) waiting). Snapped to kitchen dispatch.`,
      'system'
    );
  };

  // 1-Click Auto-Fetch from text or clipboard (Google Maps link or lat,lng pair)
  const handleAutoFetchFromTextOrClipboard = async (manualText?: string) => {
    let text = (manualText !== undefined ? manualText : quickPasteInput).trim();
    if (!text && navigator.clipboard && navigator.clipboard.readText) {
      try {
        text = (await navigator.clipboard.readText()).trim();
      } catch {
        // clipboard permission blocked in iframe
      }
    }

    if (!text) {
      setIsPastingCoords(true);
      return;
    }

    const parsed = parseCoordinatesFromString(text);
    if (!parsed) {
      addNotification(
        'Format Not Recognized',
        'Could not parse coordinates from input. Example formats: "12.9352, 77.6245" or paste a Google Maps share link.',
        'system'
      );
      setIsPastingCoords(true);
      return;
    }

    const { lat, lng } = parsed;
    setCustomLatInput(lat.toFixed(5));
    setCustomLngInput(lng.toFixed(5));
    const geocoded = await reverseGeocodeLocation(lat, lng, activeMapKey);
    const address = geocoded.fullAddress || `${geocoded.flat}, ${geocoded.area}`;
    setCurrentAddressText(address);
    updateRiderLocation(rider.id, { lat, lng, address });
    setQuickPasteInput('');
    setIsPastingCoords(false);
    const matched = findMatchingZone(lat, lng, zones);
    addNotification(
      'Coordinates Auto-Fetched & Locked',
      `Dispatch override applied from text/link: ${geocoded.area} (Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)} • Zone: ${matched.zone.name})`,
      'system'
    );
  };

  // Search places and landmarks to auto-fetch coordinates
  const handleSearchPlaces = async (query: string) => {
    setPlaceSearchQuery(query);
    if (!query || query.trim().length < 2) {
      setPlaceSearchResults([]);
      return;
    }
    setIsSearchingPlaces(true);
    try {
      const results = await searchLocationsOnMap(query, activeMapKey);
      setPlaceSearchResults(results);
    } catch (err) {
      console.warn('Place search error:', err);
    } finally {
      setIsSearchingPlaces(false);
    }
  };

  // 1-Click Select search result to auto-fetch Lat/Lng
  const handleSelectSearchResult = async (item: SearchLocationResult) => {
    setCustomLatInput(item.lat.toFixed(5));
    setCustomLngInput(item.lng.toFixed(5));
    let finalAddress = item.address;
    try {
      const geocoded = await reverseGeocodeLocation(item.lat, item.lng, activeMapKey);
      finalAddress = geocoded.fullAddress || item.address;
    } catch {}
    const addr = finalAddress || `${item.name}, Bengaluru`;
    setCurrentAddressText(addr);
    updateRiderLocation(rider.id, {
      lat: item.lat,
      lng: item.lng,
      address: addr,
    });
    const matched = findMatchingZone(item.lat, item.lng, zones);
    addNotification(
      'Landmark Auto-Fetched',
      `Dispatch relocated to ${item.name} (${item.lat.toFixed(5)}, ${item.lng.toFixed(5)} • Zone: ${matched.zone.name})`,
      'system'
    );
  };

  // Directional Nudgers (North, South, East, West with fine/coarse steps)
  const handleDirectionalNudge = (direction: 'north' | 'south' | 'east' | 'west') => {
    const step = nudgeStepMode === 'fine' ? 0.001 : 0.005; // ~110m or ~550m
    const currentLat = parseFloat(customLatInput) || riderLat;
    const currentLng = parseFloat(customLngInput) || riderLng;
    let newLat = currentLat;
    let newLng = currentLng;
    if (direction === 'north') newLat += step;
    if (direction === 'south') newLat -= step;
    if (direction === 'east') newLng += step;
    if (direction === 'west') newLng -= step;
    newLat = Number(newLat.toFixed(5));
    newLng = Number(newLng.toFixed(5));
    setCustomLatInput(newLat.toFixed(5));
    setCustomLngInput(newLng.toFixed(5));
  };

  // Reset override back to authentic hardware device sensor
  const handleResetToNativeSensor = async () => {
    setIsFetchingGps(true);
    try {
      const { lat, lng, accuracy } = await getAccurateCurrentPosition();
      setGpsAccuracy(accuracy);
      setCustomLatInput(lat.toFixed(5));
      setCustomLngInput(lng.toFixed(5));
      const geocoded = await reverseGeocodeLocation(lat, lng, activeMapKey);
      const address = geocoded.fullAddress || `${geocoded.flat}, ${geocoded.area}`;
      setCurrentAddressText(address);
      updateRiderLocation(rider.id, { lat, lng, address });
      setLastGpsLockedTime(new Date().toLocaleTimeString());
      addNotification(
        'Reverted to Device GPS Sensor',
        `Restored authentic hardware sensor: ±${accuracy}m precision at ${geocoded.area}.`,
        'system'
      );
    } catch {
      addNotification('GPS Sensor Notice', 'Could not read device GPS. Coordinates unchanged.', 'system');
    } finally {
      setIsFetchingGps(false);
    }
  };

  // Save current location as a custom preset
  const handleSavePreset = () => {
    const name = newPresetName.trim() || `Custom Spot (${riderLat.toFixed(4)}, ${riderLng.toFixed(4)})`;
    const newPreset: DispatchPreset = {
      id: `preset-${Date.now()}`,
      name,
      lat: riderLat,
      lng: riderLng,
      address: currentAddressText || `${riderLat.toFixed(5)}, ${riderLng.toFixed(5)}`,
      zoneName: riderZoneMatch.zone.name,
      createdAt: new Date().toISOString(),
    };
    const updated = [newPreset, ...savedPresets];
    setSavedPresets(updated);
    try {
      localStorage.setItem('likart_rider_dispatch_presets', JSON.stringify(updated));
    } catch {}
    setNewPresetName('');
    setIsAddingPreset(false);
    addNotification('Preset Saved', `"${name}" saved to your quick dispatch hotspots.`, 'system');
  };

  // Delete a saved preset
  const handleDeletePreset = (id: string, name: string) => {
    const updated = savedPresets.filter((p) => p.id !== id);
    setSavedPresets(updated);
    try {
      localStorage.setItem('likart_rider_dispatch_presets', JSON.stringify(updated));
    } catch {}
    addNotification('Preset Deleted', `Preset "${name}" removed.`, 'system');
  };

  // Fine-tune coordinate nudger (±0.005 deg)
  const handleAdjustCoordinates = (latDelta: number, lngDelta: number) => {
    const currentLat = parseFloat(customLatInput) || riderLat;
    const currentLng = parseFloat(customLngInput) || riderLng;
    const newLat = Number((currentLat + latDelta).toFixed(5));
    const newLng = Number((currentLng + lngDelta).toFixed(5));
    setCustomLatInput(newLat.toFixed(5));
    setCustomLngInput(newLng.toFixed(5));
  };

  // Copy coordinates to clipboard
  const handleCopyCoordinates = () => {
    const text = `${riderLat.toFixed(5)}, ${riderLng.toFixed(5)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      addNotification('Coordinates Copied', `Coordinates "${text}" copied to clipboard!`, 'system');
    }
  };

  // Custom Coordinate Handlers - Unlocking Lat/Lng
  const handleApplyCustomCoords = async () => {
    const lat = parseFloat(customLatInput);
    const lng = parseFloat(customLngInput);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      addNotification('Invalid Coordinates', 'Please enter valid Latitude (-90 to 90) and Longitude (-180 to 180).', 'system');
      return;
    }
    const geocoded = await reverseGeocodeLocation(lat, lng, activeMapKey);
    const address = geocoded.fullAddress || `${geocoded.flat}, ${geocoded.area}`;
    setCurrentAddressText(address);
    updateRiderLocation(rider.id, {
      lat,
      lng,
      address,
    });
    addNotification('Dispatch Override Applied', `Position set to: ${geocoded.area} (${lat.toFixed(5)}, ${lng.toFixed(5)}). Searching nearby kitchen orders.`, 'system');
  };

  const handleSelectHubPreset = async (
    hubName: string,
    lat: number,
    lng: number,
    restaurantAddress?: string
  ) => {
    setCustomLatInput(lat.toFixed(5));
    setCustomLngInput(lng.toFixed(5));
    let finalAddress = restaurantAddress;
    try {
      const geocoded = await reverseGeocodeLocation(lat, lng, activeMapKey);
      finalAddress = geocoded.fullAddress || restaurantAddress;
    } catch {
      // fallback
    }
    const address = finalAddress || `${hubName}, Bengaluru`;
    setCurrentAddressText(address);
    updateRiderLocation(rider.id, {
      lat,
      lng,
      address,
    });
    addNotification('Real Restaurant Hub Locked', `Relocated dispatch to ${hubName} (${lat.toFixed(5)}, ${lng.toFixed(5)}). Matching live kitchen orders!`, 'system');
  };

  // Continuous watchPosition for live GPS updates when online
  useEffect(() => {
    if (isLiveGpsTracking && rider.isOnline && 'geolocation' in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        async (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(5));
          const lng = Number(pos.coords.longitude.toFixed(5));
          const accuracy = pos.coords.accuracy ? Math.round(pos.coords.accuracy) : 10;
          setGpsAccuracy(accuracy);

          // Update rider coordinates in context
          updateRiderLocation(rider.id, { lat, lng });
        },
        (err) => {
          console.warn('WatchPosition notice:', err.message);
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
      );
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isLiveGpsTracking, rider.isOnline, rider.id]);


  // Rider Order Alert Sound Configuration from Brand Settings
  const isRiderSoundActive =
    (brandSettings.soundAlerts?.enabled !== false) &&
    (brandSettings.soundAlerts?.riderSoundEnabled !== false) &&
    riderSoundAlerts &&
    rider.isOnline;
  const currentRiderTone = brandSettings.soundAlerts?.riderAlertTone || 'radar_pulse';
  const currentRiderVolume = brandSettings.soundAlerts?.riderVolume ?? 0.85;
  const currentRiderRepeatIntervalSecs = brandSettings.soundAlerts?.riderRepeatIntervalSecs || 20;

  // Sound chime when new available trips arrive
  const prevAvailableCountRef = useRef(nearbyAvailableOrders.length);
  const prevActiveOrderIdRef = useRef(activeOrder?.id || null);

  // Continuous ringing UNTIL trip offer is accepted (or rejected)
  useEffect(() => {
    if (
      nearbyAvailableOrders.length === 0 ||
      activeOrder ||
      !isRiderSoundActive
    ) {
      stopRiderTripRinging();
      return;
    }

    startRiderTripRinging(brandSettings.soundAlerts?.riderAudioUrl, currentRiderVolume);

    return () => {
      stopRiderTripRinging();
    };
  }, [
    nearbyAvailableOrders.length,
    activeOrder,
    isRiderSoundActive,
    brandSettings.soundAlerts?.riderAudioUrl,
    currentRiderVolume,
  ]);

  // Auto-pop up trip offer when rider is online, free of active orders, and nearby orders are available
  useEffect(() => {
    if (rider.isOnline && !activeOrder && nearbyAvailableOrders.length > 0) {
      if (!activePopupOfferOrderId && !hasDismissedOfferBatch) {
        setActivePopupOfferOrderId(nearbyAvailableOrders[0].order.id);
        setIsOfferPopupMinimized(false);
      }
    } else if (activeOrder) {
      setActivePopupOfferOrderId(null);
      setIsOfferPopupMinimized(false);
    }
  }, [rider.isOnline, activeOrder, nearbyAvailableOrders, activePopupOfferOrderId, hasDismissedOfferBatch]);

  // When a brand new order is dispatched (available count increases), un-dismiss and show pop-up
  useEffect(() => {
    if (
      nearbyAvailableOrders.length > prevAvailableCountRef.current &&
      rider.isOnline &&
      !activeOrder
    ) {
      setHasDismissedOfferBatch(false);
      setIsOfferPopupMinimized(false);
      if (nearbyAvailableOrders.length > 0) {
        setActivePopupOfferOrderId(nearbyAvailableOrders[0].order.id);
      }
    }
  }, [nearbyAvailableOrders.length, rider.isOnline, activeOrder]);

  const handleAcceptTripFromPopup = (
    orderId: string,
    options?: { navigateImmediately?: boolean }
  ) => {
    acceptOrderForDelivery(orderId, rider.id);
    setActivePopupOfferOrderId(null);
    setIsOfferPopupMinimized(false);
    setCollectedItemIds({});
    playRiderTone('radar_pulse', 0.9);
    addNotification(
      'Trip Accepted!',
      `Trip offer #${orderId} accepted. Turn-by-turn route locked to restaurant pickup.`,
      'order'
    );
  };

  const handleRejectTripFromPopup = (
    orderId: string,
    reason: string,
    action?: 'pass' | 'break' | 'offline'
  ) => {
    rejectOrderForDelivery(orderId, rider.id, reason);
    playRiderTone('gentle_alert', 0.6);

    if (action === 'offline') {
      setActivePopupOfferOrderId(null);
      setIsOfferPopupMinimized(false);
      setHasDismissedOfferBatch(true);
      toggleRiderOnline(rider.id);
      addNotification('Duty Status: Offline', 'Trip declined. You are now OFFLINE and dispatches are paused.', 'info');
      return;
    }

    if (action === 'break') {
      setActivePopupOfferOrderId(null);
      setIsOfferPopupMinimized(false);
      setHasDismissedOfferBatch(true);
      addNotification('15-Min Break Active', 'Trip declined. New trip dispatches are paused for 15 minutes.', 'info');
      setTimeout(() => {
        setHasDismissedOfferBatch(false);
      }, 15 * 60 * 1000);
      return;
    }

    // Default 'pass': show next available order if any
    const remaining = nearbyAvailableOrders.filter((n) => n.order.id !== orderId);
    if (remaining.length > 0) {
      setActivePopupOfferOrderId(remaining[0].order.id);
      setIsOfferPopupMinimized(false);
      addNotification('Next Dispatch Offer', `Loading next nearby trip offer #${remaining[0].order.id}.`, 'system');
    } else {
      setActivePopupOfferOrderId(null);
      setIsOfferPopupMinimized(false);
      setHasDismissedOfferBatch(true);
      addNotification('Trip Passed', 'Trip passed. Standing by for new orders.', 'info');
    }
  };

  const activeOfferItem =
    nearbyAvailableOrders.find((n) => n.order.id === activePopupOfferOrderId) ||
    nearbyAvailableOrders[0];

  const handlePaymentSuccess = (method: 'cash' | 'upi_qr', txnId: string) => {
    if (!activeOrder) return;
    markOrderAsPaid(activeOrder.id, method, txnId);
    setOtpError('');
  };

  const handleAutoRedirectToDeliver = () => {
    if (otpInputRef.current) {
      otpInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      otpInputRef.current.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;
    if (activeOrder.paymentMethod === 'cod' && activeOrder.paymentStatus !== 'completed') {
      setOtpError(
        `Payment Pending! Please collect ₹${activeOrder.totalAmount} in cash from customer before completing delivery.`
      );
      return;
    }
    const isSuccess = verifyDeliveryOtp(activeOrder.id, enteredOtp);
    if (!isSuccess) {
      setOtpError('Invalid OTP! Please ask customer for correct 4-digit code.');
    } else {
      setOtpError('');
      setEnteredOtp('');
    }
  };

  const handleRequestPayout = () => {
    requestPayout({
      recipientType: 'delivery',
      recipientId: rider.id,
      amount: rider.walletBalance,
      bankOrUpiDetails: rider.kyc.payoutUpiOrBank,
    });
    setPayoutRequested(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Rider Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={rider.avatar}
            alt={rider.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500/30"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black font-heading text-slate-900">
                {rider.name}
              </h2>
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  rider.status === 'approved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {rider.status.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {rider.kyc.vehicleType} • {rider.kyc.vehicleNumber} • Rating: ★ {rider.rating}
            </p>
          </div>
        </div>

        {/* Rider Actions: Total Earnings in Wallet, Cash in Hand Option, Withdraw Available Balance, Duty Toggle & Log Out */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* 1. Total Earnings (in Wallet) */}
          <div className="flex items-center gap-2 p-1.5 pl-3 bg-slate-50 border border-slate-200 rounded-2xl shadow-2xs">
            <div>
              <span className="text-[9px] uppercase font-bold text-blue-600 block leading-tight">
                Total Earnings
              </span>
              <span className="text-sm font-black text-slate-900 font-heading leading-tight">
                ₹{riderTotalEarnings}
              </span>
            </div>
            <span className="text-[9px] font-bold text-slate-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-md">
              Wallet
            </span>
          </div>

          {/* 2. Cash in Hand Option */}
          <div className="flex items-center gap-2 p-1.5 pl-3 bg-slate-50 border border-slate-200 rounded-2xl shadow-2xs">
            <div>
              <span className="text-[9px] uppercase font-bold text-amber-700 block leading-tight">
                Cash in Hand
              </span>
              <span
                className={`text-sm font-black font-heading leading-tight ${
                  isCashHoldingLimitExceeded ? 'text-rose-600' : 'text-slate-900'
                }`}
              >
                ₹{riderCashHeld}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsCashDepositModalOpen(true)}
              className={`px-2.5 py-1.5 font-black text-[11px] rounded-xl shadow-xs transition active:scale-95 ${
                isCashHoldingLimitExceeded
                  ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
              title="Deposit collected COD cash to Likart via Razorpay Payment Gateway"
            >
              Deposit (Razorpay)
            </button>
          </div>

          {/* 3. Withdraw Available Balance: Earnings Only Access */}
          <div className="flex items-center gap-2 p-1.5 pl-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 rounded-2xl shadow-2xs">
            <div>
              <span className="text-[9px] uppercase font-bold text-emerald-800 block leading-tight flex items-center gap-1">
                <span>Earnings Avail</span>
                <span className="text-[8px] font-bold bg-emerald-200/80 text-emerald-900 px-1 py-0.2 rounded" title="Earnings Only Withdrawal Policy">
                  Earnings Only
                </span>
              </span>
              <span className="text-sm font-black text-emerald-950 font-heading leading-tight">
                ₹{withdrawAvailableBalance}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsPayoutModalOpen(true)}
              disabled={withdrawAvailableBalance <= 0}
              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] rounded-xl shadow-xs transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              title={
                withdrawAvailableBalance > 0
                  ? "Request instant payout from delivery earnings"
                  : "Withdrawal access locked: Only positive delivery earnings can be withdrawn"
              }
            >
              Withdraw
            </button>
          </div>

          <button
            onClick={() => toggleRiderOnline(rider.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-2 shadow-xs ${
              rider.isOnline
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{rider.isOnline ? 'ONLINE (DUTY)' : 'OFFLINE'}</span>
          </button>

          <button
            onClick={() => logoutRider()}
            className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition"
          >
            Log Out
          </button>

          <button
            onClick={() => setActivePortal('customer')}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
          >
            Customer Web
          </button>
        </div>
      </div>

      {/* Portal Main Navigation Tab Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setDashboardTab('orders')}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs transition flex items-center gap-2 ${
              dashboardTab === 'orders'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>Live Trips & GPS Radar</span>
            {nearbyAvailableOrders.length > 0 && !activeOrder && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  dashboardTab === 'orders'
                    ? 'bg-white/20 text-white'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {nearbyAvailableOrders.length}
              </span>
            )}
            {activeOrder && (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping ml-1" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setDashboardTab('earnings')}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs transition flex items-center gap-2 ${
              dashboardTab === 'earnings'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Earnings & Total in Wallet</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                dashboardTab === 'earnings'
                  ? 'bg-white/20 text-white'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              ₹{riderTotalEarnings}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setDashboardTab('payouts')}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs transition flex items-center gap-2 ${
              dashboardTab === 'payouts'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Wallet className="w-4 h-4 text-amber-500" />
            <span>Wallet & Cash in Hand</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                dashboardTab === 'payouts'
                  ? 'bg-white/20 text-white'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              Avail: ₹{withdrawAvailableBalance}
            </span>
            {isCashHoldingLimitExceeded ? (
              <span className="text-[10px] bg-rose-100 text-rose-900 border border-rose-300 px-2 py-0.5 rounded-full font-bold animate-pulse">
                ⚠️ Over Limit (₹{riderCashHeld})
              </span>
            ) : riderCashHeld > 0 ? (
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                ₹{riderCashHeld} Cash in Hand
              </span>
            ) : null}
            {payoutRequests.filter((p) => p.recipientId === rider.id && p.status === 'pending').length > 0 && (
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                Pending
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <button
            type="button"
            onClick={() => setIsCashDepositModalOpen(true)}
            className={`px-3.5 py-2.5 rounded-xl font-black text-xs transition active:scale-95 shadow-xs flex items-center gap-1.5 ${
              isCashHoldingLimitExceeded
                ? 'bg-rose-600 hover:bg-rose-500 text-white ring-2 ring-rose-400/50 animate-pulse'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            <Banknote className="w-3.5 h-3.5 text-amber-300" />
            <span>
              {isCashHoldingLimitExceeded
                ? `Pay Excess Dues (₹${excessCashAmount}) via Razorpay`
                : 'Deposit Cash via Razorpay'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsPayoutModalOpen(true)}
            disabled={withdrawAvailableBalance <= 0}
            className="px-3.5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-xs transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            title={
              withdrawAvailableBalance > 0
                ? "Request instant payout from delivery earnings"
                : "Withdrawal locked: Only positive delivery earnings can be withdrawn"
            }
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>
              {withdrawAvailableBalance > 0 ? 'Request Payout' : 'Withdrawal Locked (₹0)'}
            </span>
          </button>
        </div>
      </div>

      {/* Floating Cash Holding Limit Exceeded Alert Banner */}
      {isCashHoldingLimitExceeded && (
        <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 rounded-3xl border-2 border-rose-300 shadow-md flex flex-wrap items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start sm:items-center gap-3.5">
            <span className="p-3 bg-rose-600 text-white rounded-2xl shadow-sm shrink-0">
              <Banknote className="w-6 h-6 stroke-[2.5]" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-heading font-black text-sm sm:text-base text-rose-950">
                  Floating Cash Limit Exceeded (Holding ₹{riderCashHeld} / ₹{cashHoldingLimit} Max Limit)
                </h4>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 border border-rose-300 animate-pulse">
                  🚨 Cash Orders Assignment Blocked
                </span>
              </div>
              <p className="text-xs text-rose-800 mt-1 max-w-2xl leading-relaxed">
                You are holding <strong>₹{excessCashAmount}</strong> in excess of the ₹{cashHoldingLimit} limit.
                New Cash on Delivery orders cannot be assigned to you until excess dues are deposited back to Likart.
                Prepaid online orders remain active. Clear your dues now using <strong>Razorpay Payment Gateway</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap ml-auto">
            <button
              type="button"
              onClick={() => setIsCashDepositModalOpen(true)}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-md transition active:scale-95 flex items-center gap-2 ring-2 ring-rose-400/40"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Deposit ₹{excessCashAmount} via Razorpay Now</span>
            </button>
            <button
              type="button"
              onClick={() => setDashboardTab('payouts')}
              className="px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-rose-200 transition"
            >
              Open Wallet / Payouts / Floating Cash →
            </button>
          </div>
        </div>
      )}

      {dashboardTab === 'orders' ? (
        <>
          {/* Google Maps GPS Auto-Fetch & Real-Time Location Radar Card */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl border border-blue-800/60 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl border border-blue-400/30">
              <Compass className="w-6 h-6 animate-pulse text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-heading font-black text-base sm:text-lg">
                  Google Maps Accurate GPS Dispatch Radar
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  {gpsAccuracy ? `±${gpsAccuracy}m GPS Precision` : 'High Accuracy GPS'}
                </span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">
                  Zone: {riderZoneMatch.zone.name}
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-1 flex items-center gap-1.5 truncate max-w-xl">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Current Location: <span className="font-semibold text-white">{currentAddressText}</span></span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Auto-Fetch GPS Button */}
            <button
              onClick={handleAutoFetchGpsLocation}
              disabled={isFetchingGps}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2 active:scale-95 disabled:opacity-60"
            >
              <Navigation className={`w-3.5 h-3.5 ${isFetchingGps ? 'animate-spin' : ''}`} />
              <span>{isFetchingGps ? 'Locking GPS...' : 'Auto-Fetch Current Location'}</span>
            </button>

            {/* Continuous Live GPS toggle */}
            <button
              onClick={() => setIsLiveGpsTracking(!isLiveGpsTracking)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                isLiveGpsTracking
                  ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                  : 'bg-white/10 border-white/20 text-slate-300'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${isLiveGpsTracking ? 'animate-pulse text-emerald-400' : ''}`} />
              <span>Live GPS: {isLiveGpsTracking ? 'ACTIVE' : 'PAUSED'}</span>
            </button>

            {/* Dispatch Radar Pop-up Status Indicator */}
            <div
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border bg-emerald-500/15 border-emerald-400/40 text-emerald-300"
              title="Interactive Pop-up Dispatch System Active"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>Pop-Up Dispatch: ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Live Coordinates Footer & Upgraded Lat/Lng Dispatch Override Controls */}
        <div className="pt-2 border-t border-blue-800/40 space-y-3">
          <div className="flex flex-wrap items-center justify-between text-[11px] text-blue-300 gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Active Dispatch Coordinates:</span>
              </span>
              <span className="font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded border border-white/20">
                {riderLat.toFixed(5)}, {riderLng.toFixed(5)}
              </span>
              <button
                type="button"
                onClick={() => {
                  setCustomLatInput(riderLat.toFixed(5));
                  setCustomLngInput(riderLng.toFixed(5));
                  setIsCoordsUnlocked(!isCoordsUnlocked);
                }}
                className={`px-3.5 py-1.5 text-xs font-black rounded-xl border transition flex items-center gap-2 active:scale-95 shadow-md ${
                  isCoordsUnlocked
                    ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400/40'
                    : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-500 hover:to-indigo-500 text-white border-blue-400/50'
                }`}
              >
                <Crosshair className={`w-3.5 h-3.5 ${isCoordsUnlocked ? 'animate-spin' : ''}`} />
                <span>{isCoordsUnlocked ? 'Close Dispatch Override' : '⚡ Auto-Fetch Lat/Lng Dispatch Override'}</span>
                <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px] font-black">
                  {realRestaurantHubs.length} Kitchen Hubs
                </span>
              </button>
              <span className="text-blue-400">•</span>
              <span>Serving Zone: <strong>{riderZoneMatch.zone.name}</strong> ({riderZoneMatch.zone.radiusKm} km radius)</span>
            </div>

            <div className="text-right text-emerald-300 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{restaurantsWithinRange.length} Kitchens & {pendingOrdersWithinRange.length} Orders within 3.5 km</span>
            </div>
          </div>

          {/* Interactive Unlocked Coordinate Editor & Real Restaurant Hubs Drawer */}
          {isCoordsUnlocked && (
            <div className="p-4 sm:p-6 bg-slate-900/98 rounded-3xl border-2 border-blue-500/50 shadow-2xl space-y-5 animate-in fade-in">
              {/* Header and Quick Auto-Fetch Control Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <Target className="w-3 h-3 text-blue-400" />
                      <span>Telemetry & Dispatch Engine</span>
                    </span>
                    <h4 className="font-black text-sm sm:text-base text-white flex items-center gap-2">
                      <Crosshair className="w-4 h-4 text-amber-400" />
                      <span>Auto-Fetch Lat/Lng Dispatch Override & Hubs Radar</span>
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Auto-fetch live GPS telemetry, instant geocode by landmark/address, snap to real kitchen entrances, or paste coordinates to lock dispatch location.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* 1-Click Auto-Fetch My Device GPS */}
                  <button
                    type="button"
                    onClick={handleAutoFetchGpsLocation}
                    disabled={isFetchingGps}
                    className="px-3.5 py-2 text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                    title="Fetch high-precision device GPS coordinates and lock dispatch"
                  >
                    <Navigation className={`w-3.5 h-3.5 ${isFetchingGps ? 'animate-spin' : ''}`} />
                    <span>{isFetchingGps ? 'Locking GPS...' : '⚡ Auto-Fetch My GPS'}</span>
                  </button>

                  {/* 1-Click Snap to Nearest Kitchen Hub */}
                  <button
                    type="button"
                    onClick={handleAutoFetchNearestRestaurant}
                    className="px-3.5 py-2 text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95"
                    title="Automatically snap coordinates to the closest real restaurant kitchen"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>📍 Snap Nearest ({nearestRestaurant?.distKm ? `${nearestRestaurant.distKm.toFixed(1)}km` : 'Kitchen'})</span>
                  </button>

                  {/* 1-Click Snap to High Demand Hotspot */}
                  <button
                    type="button"
                    onClick={handleAutoFetchHotspotRestaurant}
                    className="px-3.5 py-2 text-xs font-black bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95"
                    title="Snap to the kitchen with the most pending orders waiting for pickup"
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-200" />
                    <span>🔥 Snap Hotspot ({hotspotRestaurant?.waitingOrdersCount || 0} Orders)</span>
                  </button>

                  {/* Copy Current Coordinates */}
                  <button
                    type="button"
                    onClick={handleCopyCoordinates}
                    className="p-2 bg-white/10 hover:bg-white/20 text-slate-200 rounded-xl transition border border-white/10"
                    title="Copy active Lat/Lng to clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  {/* Open in Google Maps */}
                  <a
                    href={`https://www.google.com/maps?q=${riderLat},${riderLng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white/10 hover:bg-white/20 text-slate-200 rounded-xl transition border border-white/10 flex items-center justify-center"
                    title="View pin on Google Maps"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Sub-Tabs Selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-white/10 pb-2">
                <button
                  type="button"
                  onClick={() => setOverrideSubTab('quick_fetch')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap ${
                    overrideSubTab === 'quick_fetch'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>⚡ Instant Auto-Fetch & Telemetry</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOverrideSubTab('search')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap ${
                    overrideSubTab === 'search'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>🔍 Landmark & Area Search</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOverrideSubTab('coordinates')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap ${
                    overrideSubTab === 'coordinates'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>🎯 Precision Lat/Lng & Nudgers</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOverrideSubTab('kitchens')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap ${
                    overrideSubTab === 'kitchens'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>🍳 Real Kitchen Hubs ({realRestaurantHubs.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOverrideSubTab('presets')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap ${
                    overrideSubTab === 'presets'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>⭐ Saved Presets ({savedPresets.length})</span>
                </button>
              </div>

              {/* SUB-TAB 1: QUICK AUTO-FETCH & TELEMETRY */}
              {overrideSubTab === 'quick_fetch' && (
                <div className="space-y-4 animate-in fade-in">
                  {/* Live Telemetry Sensor Card */}
                  <div className="bg-black/40 p-4 rounded-2xl border border-white/10 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                          <Radio className="w-4 h-4 animate-pulse" />
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">Live Telemetry Sensor Status</span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                              {gpsAccuracy ? `±${gpsAccuracy}m Precision • Satellite Locked` : 'Sensor Active'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Last Telemetry Sync: <span className="text-slate-200 font-mono font-semibold">{lastGpsLockedTime}</span>
                          </p>
                        </div>
                      </div>

                      {/* Continuous Live GPS toggle */}
                      <button
                        type="button"
                        onClick={() => setIsLiveGpsTracking(!isLiveGpsTracking)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                          isLiveGpsTracking
                            ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                            : 'bg-white/10 border-white/20 text-slate-400'
                        }`}
                      >
                        <Radio className={`w-3.5 h-3.5 ${isLiveGpsTracking ? 'animate-pulse text-emerald-400' : ''}`} />
                        <span>Auto-Stream GPS: {isLiveGpsTracking ? 'STREAMING ON' : 'PAUSED'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Latitude</span>
                        <span className="text-sm font-mono font-black text-white">{riderLat.toFixed(5)}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Longitude</span>
                        <span className="text-sm font-mono font-black text-white">{riderLng.toFixed(5)}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Serving Zone</span>
                        <span className="text-sm font-black text-emerald-400 truncate block">{riderZoneMatch.zone.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* 3 Quick Auto-Fetch Action Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Device Sensor */}
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Navigation className="w-4 h-4 text-blue-400" />
                          <h5 className="font-black text-xs text-white">Device GPS Hardware</h5>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Auto-fetch precise coordinates from device Wi-Fi, cell tower and satellite sensors.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAutoFetchGpsLocation}
                        disabled={isFetchingGps}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>{isFetchingGps ? 'Auto-Fetching...' : '⚡ Auto-Fetch Sensor'}</span>
                      </button>
                    </div>

                    {/* Nearest Kitchen */}
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Store className="w-4 h-4 text-emerald-400" />
                          <h5 className="font-black text-xs text-white">Nearest Kitchen Snapper</h5>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {nearestRestaurant ? `${nearestRestaurant.name} • ${nearestRestaurant.distKm.toFixed(1)} km` : 'No restaurants registered'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAutoFetchNearestRestaurant}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>📍 Snap to Nearest</span>
                      </button>
                    </div>

                    {/* High Demand Hotspot */}
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Flame className="w-4 h-4 text-amber-400" />
                          <h5 className="font-black text-xs text-white">Peak Demand Hotspot</h5>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {hotspotRestaurant?.waitingOrdersCount
                            ? `${hotspotRestaurant.name} • ${hotspotRestaurant.waitingOrdersCount} live order(s)`
                            : 'All kitchens active'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAutoFetchHotspotRestaurant}
                        className="w-full py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>🔥 Snap to Hotspot</span>
                      </button>
                    </div>
                  </div>

                  {/* 1-Click Paste & Auto-Fetch Input Bar */}
                  <div className="bg-black/30 p-3.5 rounded-2xl border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span className="font-bold flex items-center gap-1.5">
                        <Copy className="w-3.5 h-3.5 text-blue-400" />
                        <span>Quick Paste & Auto-Fetch (Google Maps Link or Lat/Lng Pair)</span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Supports "12.9352, 77.6245" or maps.google.com/?q=...
                      </span>
                    </div>

                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                      <input
                        type="text"
                        value={quickPasteInput}
                        onChange={(e) => setQuickPasteInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAutoFetchFromTextOrClipboard();
                        }}
                        placeholder="Paste coordinates (e.g. 12.93520, 77.62450) or Google Maps URL..."
                        className="w-full p-2.5 bg-black/60 border border-blue-400/30 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => handleAutoFetchFromTextOrClipboard()}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition shrink-0 active:scale-95 shadow-md flex items-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>Auto-Fetch & Apply</span>
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (navigator.clipboard?.readText) {
                            try {
                              const clip = await navigator.clipboard.readText();
                              setQuickPasteInput(clip);
                              handleAutoFetchFromTextOrClipboard(clip);
                            } catch {
                              // clipboard denied
                            }
                          }
                        }}
                        className="px-3 py-2.5 bg-white/10 hover:bg-white/20 text-slate-200 rounded-xl text-xs font-bold transition shrink-0 border border-white/10"
                        title="Read clipboard text directly"
                      >
                        <span>Paste Clipboard</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB 2: LANDMARK & AREA SEARCH */}
              {overrideSubTab === 'search' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 block">
                      Search Landmark, Food Hub, Metro Station or Tech Park:
                    </label>
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={placeSearchQuery}
                        onChange={(e) => handleSearchPlaces(e.target.value)}
                        placeholder="Type area (e.g. 'Indiranagar 100ft', 'Sony World Koramangala', 'HSR Layout', 'Whitefield ITPB')..."
                        className="w-full pl-9 pr-8 py-2.5 bg-black/50 border border-blue-400/40 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"
                      />
                      {placeSearchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setPlaceSearchQuery('');
                            setPlaceSearchResults([]);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Popular Food Hub Chips */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 block">Popular Bengaluru Food Dispatch Hotspots:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { name: 'Koramangala 4th Block', lat: 12.9352, lng: 77.6245 },
                        { name: 'Indiranagar 100 Feet Rd', lat: 12.9716, lng: 77.6412 },
                        { name: 'HSR Layout Sector 1', lat: 12.9116, lng: 77.6473 },
                        { name: 'Whitefield ITPB Corridor', lat: 12.9866, lng: 77.7382 },
                        { name: 'MG Road / CBD Junction', lat: 12.9756, lng: 77.6066 },
                        { name: 'Jayanagar 4th Block', lat: 12.9255, lng: 77.5833 },
                        { name: 'Marathahalli Bridge ORR', lat: 12.9388, lng: 77.6963 },
                      ].map((chip) => (
                        <button
                          key={chip.name}
                          type="button"
                          onClick={() =>
                            handleSelectSearchResult({
                              name: chip.name,
                              address: `${chip.name}, Bengaluru`,
                              lat: chip.lat,
                              lng: chip.lng,
                            })
                          }
                          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-blue-600 hover:text-white text-slate-300 text-[11px] font-bold transition border border-white/10 flex items-center gap-1 active:scale-95"
                        >
                          <MapPin className="w-3 h-3 text-blue-400" />
                          <span>{chip.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Search Results */}
                  {isSearchingPlaces ? (
                    <div className="p-6 rounded-2xl bg-black/30 text-center text-xs text-slate-400">
                      <Navigation className="w-5 h-5 animate-spin mx-auto text-blue-400 mb-1" />
                      <span>Geocoding coordinates on map...</span>
                    </div>
                  ) : placeSearchResults.length > 0 ? (
                    <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar">
                      <span className="text-[11px] font-bold text-slate-400 block">Search Results ({placeSearchResults.length}):</span>
                      {placeSearchResults.map((result, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between gap-3 transition"
                        >
                          <div className="min-w-0">
                            <h5 className="font-bold text-xs text-white truncate">{result.name}</h5>
                            <p className="text-[11px] text-slate-400 truncate">{result.address}</p>
                            <span className="text-[10px] font-mono text-blue-300">
                              Lat: {result.lat.toFixed(5)}, Lng: {result.lng.toFixed(5)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSelectSearchResult(result)}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black transition shrink-0 active:scale-95 shadow-md flex items-center gap-1"
                          >
                            <Crosshair className="w-3.5 h-3.5" />
                            <span>Auto-Fetch & Snap</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : placeSearchQuery.trim().length > 1 ? (
                    <div className="p-4 rounded-xl bg-white/5 text-center text-xs text-slate-400">
                      No matching places found. Try tapping one of the popular hotspots above or enter custom coordinates.
                    </div>
                  ) : null}
                </div>
              )}

              {/* SUB-TAB 3: PRECISION LAT/LNG & NUDGERS */}
              {overrideSubTab === 'coordinates' && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="bg-black/30 p-4 rounded-2xl border border-white/10 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
                      <span>Manual Lat/Lng Inputs & Directional Step Nudgers</span>
                      <span className="text-[11px] text-blue-300 font-mono">
                        Active Pinned: {riderLat.toFixed(5)}, {riderLng.toFixed(5)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-slate-300">Latitude (-90 to 90)</label>
                        </div>
                        <input
                          type="number"
                          step="0.00001"
                          value={customLatInput}
                          onChange={(e) => setCustomLatInput(e.target.value)}
                          placeholder="e.g. 12.93520"
                          className="w-full p-2.5 bg-black/50 border border-blue-400/40 rounded-xl text-white font-mono font-bold focus:border-blue-400 focus:outline-none"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-slate-300">Longitude (-180 to 180)</label>
                        </div>
                        <input
                          type="number"
                          step="0.00001"
                          value={customLngInput}
                          onChange={(e) => setCustomLngInput(e.target.value)}
                          placeholder="e.g. 77.62450"
                          className="w-full p-2.5 bg-black/50 border border-blue-400/40 rounded-xl text-white font-mono font-bold focus:border-blue-400 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={handleApplyCustomCoords}
                          className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-black rounded-xl transition shadow-lg flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Apply Lat/Lng Override</span>
                        </button>
                      </div>
                    </div>

                    {/* Step Nudge Controller */}
                    <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400">Step Sensitivity:</span>
                        <div className="flex items-center bg-white/10 rounded-lg p-0.5 border border-white/10">
                          <button
                            type="button"
                            onClick={() => setNudgeStepMode('fine')}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold transition ${
                              nudgeStepMode === 'fine' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Fine (±0.001° ~110m)
                          </button>
                          <button
                            type="button"
                            onClick={() => setNudgeStepMode('coarse')}
                            className={`px-2.5 py-1 rounded text-[10px] font-bold transition ${
                              nudgeStepMode === 'coarse' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Coarse (±0.005° ~550m)
                          </button>
                        </div>
                      </div>

                      {/* Directional Pad */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-400 mr-1">Nudge:</span>
                        <button
                          type="button"
                          onClick={() => handleDirectionalNudge('north')}
                          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 active:scale-95"
                          title="Nudge North (+Lat)"
                        >
                          <ArrowUp className="w-3.5 h-3.5 text-blue-400" />
                          <span>North</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDirectionalNudge('south')}
                          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 active:scale-95"
                          title="Nudge South (-Lat)"
                        >
                          <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
                          <span>South</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDirectionalNudge('west')}
                          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 active:scale-95"
                          title="Nudge West (-Lng)"
                        >
                          <ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
                          <span>West</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDirectionalNudge('east')}
                          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 active:scale-95"
                          title="Nudge East (+Lng)"
                        >
                          <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                          <span>East</span>
                        </button>
                      </div>

                      {/* Reset to Sensor GPS */}
                      <button
                        type="button"
                        onClick={handleResetToNativeSensor}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 active:scale-95"
                        title="Revert override and restore authentic device sensor telemetry"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Reset to Hardware GPS</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB 4: REAL CURRENT RESTAURANTS HUBS */}
              {overrideSubTab === 'kitchens' && (
                <div className="space-y-3 animate-in fade-in">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1 bg-amber-500/20 text-amber-300 rounded-lg">
                        <Store className="w-4 h-4" />
                      </span>
                      <span className="text-xs font-black text-white">
                        Real Current Restaurants Hubs ({realRestaurantHubs.length} Kitchens):
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Tap any real restaurant kitchen entrance to lock dispatch location
                      </span>
                    </div>

                    {realRestaurantHubs.length > 3 && (
                      <div className="relative w-full sm:w-64">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={hubSearchQuery}
                          onChange={(e) => setHubSearchQuery(e.target.value)}
                          placeholder="Filter real restaurants..."
                          className="w-full pl-8 pr-2.5 py-1 bg-black/40 border border-white/20 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"
                        />
                      </div>
                    )}
                  </div>

                  {filteredRestaurantHubs.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center text-xs text-slate-400">
                      {realRestaurantHubs.length === 0
                        ? 'No restaurants registered yet. Once restaurants are added to the platform, their real kitchen dispatch hubs will automatically appear here.'
                        : `No restaurants match "${hubSearchQuery}". Clear search to view all real hubs.`}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto no-scrollbar pt-1">
                      {filteredRestaurantHubs.map((hub) => {
                        const lat = hub.coordinates?.lat || 12.9352;
                        const lng = hub.coordinates?.lng || 77.6245;
                        const isLocked = hub.isCurrentHub;
                        const isWithinRange = hub.distKm <= 3.5;

                        return (
                          <div
                            key={hub.id}
                            onClick={() => handleSelectHubPreset(hub.name, lat, lng, hub.address)}
                            className={`p-3 rounded-2xl border cursor-pointer transition text-left flex flex-col justify-between gap-2.5 ${
                              isLocked
                                ? 'bg-gradient-to-br from-emerald-950/90 to-slate-900 border-emerald-400 text-white shadow-lg ring-1 ring-emerald-400/50'
                                : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200 hover:border-blue-400/50'
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <h5 className="font-black text-xs text-white truncate max-w-[170px]" title={hub.name}>
                                  {hub.name}
                                </h5>
                                {isLocked ? (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black shrink-0">
                                    Locked ✓
                                  </span>
                                ) : (
                                  <span className={`text-[10px] font-bold font-mono shrink-0 ${isWithinRange ? 'text-emerald-400' : 'text-blue-300'}`}>
                                    {hub.distKm.toFixed(1)} km
                                  </span>
                                )}
                              </div>

                              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                {Array.isArray(hub.cuisine) ? hub.cuisine.join(', ') : hub.address || 'Restaurant Kitchen'}
                              </p>
                              <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                📍 {hub.address}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-1.5 border-t border-white/10 text-[10px]">
                              {hub.waitingOrdersCount > 0 ? (
                                <span className="font-black text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-400/30">
                                  🔥 {hub.waitingOrdersCount} Trip(s) Ready
                                </span>
                              ) : isWithinRange ? (
                                <span className="text-emerald-400 font-bold">Within Reach (3.5km)</span>
                              ) : (
                                <span className="text-slate-400 font-medium">Ready for Orders</span>
                              )}
                              <span className="text-blue-300 font-bold hover:underline">
                                {isLocked ? 'Active Hub' : 'Lock Hub →'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* SUB-TAB 5: SAVED DISPATCH PRESETS */}
              {overrideSubTab === 'presets' && (
                <div className="space-y-4 animate-in fade-in">
                  {/* Save current location header */}
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h5 className="font-bold text-xs text-white flex items-center gap-1.5">
                        <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                        <span>Save Current Dispatch Spot ({riderLat.toFixed(4)}, {riderLng.toFixed(4)})</span>
                      </h5>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5 max-w-md">
                        {currentAddressText} • Zone: {riderZoneMatch.zone.name}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newPresetName}
                        onChange={(e) => setNewPresetName(e.target.value)}
                        placeholder="Preset label (e.g. 'My Lunch Hub')..."
                        className="p-2 bg-black/60 border border-white/20 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 w-48 sm:w-60"
                      />
                      <button
                        type="button"
                        onClick={handleSavePreset}
                        className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95"
                      >
                        <Star className="w-3.5 h-3.5 fill-slate-950" />
                        <span>Save Spot</span>
                      </button>
                    </div>
                  </div>

                  {/* Saved presets list */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto no-scrollbar">
                    {savedPresets.map((preset) => {
                      const distKm = calculateDistanceKm(riderLat, riderLng, preset.lat, preset.lng);
                      const isCurrent = Math.abs(riderLat - preset.lat) < 0.0008 && Math.abs(riderLng - preset.lng) < 0.0008;

                      return (
                        <div
                          key={preset.id}
                          className={`p-3.5 rounded-2xl border transition flex flex-col justify-between gap-2.5 ${
                            isCurrent
                              ? 'bg-gradient-to-br from-emerald-950/80 to-slate-900 border-emerald-400 shadow-md ring-1 ring-emerald-400/50'
                              : 'bg-white/5 hover:bg-white/10 border-white/10'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h5 className="font-bold text-xs text-white truncate max-w-[170px]" title={preset.name}>
                                {preset.name}
                              </h5>
                              {isCurrent ? (
                                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black shrink-0">
                                  Active ✓
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono text-blue-300 font-bold shrink-0">
                                  {distKm.toFixed(1)} km
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">{preset.address}</p>
                            <span className="text-[10px] font-mono text-slate-500">
                              Lat: {preset.lat.toFixed(4)}, Lng: {preset.lng.toFixed(4)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-1.5 border-t border-white/10">
                            <button
                              type="button"
                              onClick={() => handleSelectHubPreset(preset.name, preset.lat, preset.lng, preset.address)}
                              className="text-xs font-black text-blue-300 hover:text-white flex items-center gap-1 transition"
                            >
                              <Crosshair className="w-3.5 h-3.5" />
                              <span>{isCurrent ? 'Pinned Location' : 'Auto-Fetch Spot'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeletePreset(preset.id, preset.name)}
                              className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                              title="Delete preset"
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

              {/* LIVE DISPATCH DIAGNOSTICS FOOTER BAR */}
              <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    <span>Pinned Address: <strong className="text-white">{currentAddressText}</strong></span>
                  </div>
                  <span className="text-white/20">•</span>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Serving Zone: <strong className="text-white">{riderZoneMatch.zone.name}</strong></span>
                  </div>
                  <span className="text-white/20">•</span>
                  <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{restaurantsWithinRange.length} Kitchens reachable within 3.5 km</span>
                  </div>
                  {pendingOrdersWithinRange.length > 0 && (
                    <>
                      <span className="text-white/20">•</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[11px] font-bold">
                        🔥 {pendingOrdersWithinRange.length} Live Orders Ready
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyCoordinates}
                    className="text-[11px] text-blue-300 hover:text-white flex items-center gap-1 transition"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy ({riderLat.toFixed(4)}, {riderLng.toFixed(4)})</span>
                  </button>
                  <span className="text-white/20">•</span>
                  <a
                    href={`https://www.google.com/maps?q=${riderLat},${riderLng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>Verify in Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Active Trip / Available Nearby Orders & Wallet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Trip OR Available Nearby Orders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Trip Navigation (if order is assigned) */}
          {activeOrder ? (
            <div className="bg-white rounded-3xl p-6 border-2 border-blue-500/40 shadow-md space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                    <Navigation className="w-5 h-5 animate-pulse" />
                  </span>
                  <div>
                    <span className="text-xs font-black uppercase text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                      Active Trip #{activeOrder.id}
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Earn for this trip:{' '}
                      <span className="font-bold text-emerald-600">
                        ₹{activeOrder.deliveryFee + (activeOrder.tipAmount || 0)}
                      </span>
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black uppercase text-orange-600 bg-orange-50 px-3 py-1 rounded-xl border border-orange-200">
                  {activeOrder.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Google Maps Live Navigation Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  <button
                    type="button"
                    onClick={() => setActiveNavMode('pickup')}
                    className={`px-3 py-1.5 text-xs font-black rounded-xl transition flex items-center gap-1.5 ${
                      activeNavMode === 'pickup'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>1. Pickup Route ({distRiderToRestKm} km)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveNavMode('dropoff')}
                    className={`px-3 py-1.5 text-xs font-black rounded-xl transition flex items-center gap-1.5 ${
                      activeNavMode === 'dropoff'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>2. Dropoff Route ({distRiderToCustKm} km)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveNavMode('both')}
                    className={`px-3 py-1.5 text-xs font-black rounded-xl transition flex items-center gap-1.5 ${
                      activeNavMode === 'both'
                        ? 'bg-orange-600 text-white shadow-md'
                        : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Entire Trip ({distRestToCustKm} km)</span>
                  </button>
                </div>

                <a
                  href={activeExternalNavUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-black rounded-xl shadow-md transition flex items-center gap-1.5 ml-auto"
                  title="Launch Google Maps App for Turn-by-Turn GPS Navigation"
                >
                  <Navigation className="w-3.5 h-3.5 text-white" />
                  <span>Google Maps App ↗</span>
                </a>
              </div>

              {/* Navigation Map */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                <LiveMap
                  centerLat={activeNavMode === 'pickup' ? activeRestLat : activeNavMode === 'dropoff' ? activeCustLat : riderLat}
                  centerLng={activeNavMode === 'pickup' ? activeRestLng : activeNavMode === 'dropoff' ? activeCustLng : riderLng}
                  height="280px"
                  showRoute={true}
                  navigationMode={activeNavMode}
                  turnInstruction={currentTurnInstruction}
                  externalNavUrl={activeExternalNavUrl}
                  restaurantCoords={{
                    lat: activeRestLat,
                    lng: activeRestLng,
                    name: activeOrder.restaurantName,
                    address: activeOrder.restaurantAddress,
                  }}
                  customerCoords={{
                    lat: activeCustLat,
                    lng: activeCustLng,
                    name: activeOrder.customerName,
                    address: `${activeOrder.deliveryAddress.flat}, ${activeOrder.deliveryAddress.area}`,
                  }}
                  riderCoords={{
                    lat: riderLat,
                    lng: riderLng,
                    name: `${rider.name} (Your GPS)`,
                    speed: 28,
                  }}
                />
              </div>

              {/* Step Navigation Details */}
              {(() => {
                const isFoodCollected = activeOrder.status === 'out_for_delivery';
                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* 1. Pickup Restaurant */}
                      <div
                        className={`p-4 rounded-2xl border transition space-y-3 ${
                          isFoodCollected
                            ? 'bg-slate-50 border-slate-200'
                            : activeNavMode === 'pickup'
                            ? 'bg-blue-50/80 border-blue-400 shadow-xs ring-1 ring-blue-400/40'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg flex items-center gap-1 ${
                              isFoodCollected
                                ? 'text-emerald-800 bg-emerald-100 border border-emerald-200'
                                : 'text-blue-700 bg-blue-100/90'
                            }`}
                          >
                            {isFoodCollected ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Step 1: Restaurant Pickup (Collected ✓)</span>
                              </>
                            ) : (
                              <>
                                <Store className="w-3 h-3" />
                                <span>Step 1: Restaurant Pickup (Active)</span>
                              </>
                            )}
                          </span>
                          <a
                            href={`tel:${activeOrder.restaurantPhone}`}
                            className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-emerald-600 shadow-2xs"
                            title="Call Restaurant"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        </div>

                        <div>
                          <h4 className="font-bold text-xs text-slate-900">{activeOrder.restaurantName}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">{activeOrder.restaurantAddress}</p>
                          <p className="text-[10px] font-bold text-blue-600 mt-1">
                            Distance: {distRiderToRestKm} km from your live location
                          </p>
                        </div>

                        {/* Navigation Action Buttons */}
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                          <button
                            type="button"
                            onClick={() => setActiveNavMode('pickup')}
                            className="flex-1 py-2 px-2.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-[11px] rounded-xl border border-slate-200 transition text-center"
                          >
                            Focus on Radar
                          </button>
                          <a
                            href={pickupGoogleMapsNavUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 px-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] rounded-xl shadow-xs transition flex items-center justify-center gap-1 text-center"
                            title="Open Google Maps with Turn-by-Turn GPS Navigation"
                          >
                            <Navigation className="w-3 h-3 text-white" />
                            <span>Google Maps Nav ↗</span>
                          </a>
                        </div>
                      </div>

                      {/* 2. Drop Customer */}
                      <div
                        className={`p-4 rounded-2xl border transition space-y-3 ${
                          !isFoodCollected
                            ? 'bg-slate-50/80 border-dashed border-2 border-slate-300'
                            : activeNavMode === 'dropoff'
                            ? 'bg-emerald-50/80 border-emerald-400 shadow-xs ring-1 ring-emerald-400/50'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg flex items-center gap-1 ${
                              !isFoodCollected
                                ? 'text-slate-600 bg-slate-200/80'
                                : 'text-emerald-700 bg-emerald-100/80'
                            }`}
                          >
                            {!isFoodCollected ? (
                              <>
                                <Lock className="w-3 h-3 text-amber-600" />
                                <span>Step 2: Customer Dropoff (Locked)</span>
                              </>
                            ) : (
                              <>
                                <MapPin className="w-3 h-3 text-emerald-600" />
                                <span>Step 2: Customer Dropoff (Active)</span>
                              </>
                            )}
                          </span>
                          {isFoodCollected ? (
                            <a
                              href={`tel:${activeOrder.customerPhone}`}
                              className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 shadow-2xs"
                              title="Call Customer"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <span className="p-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-400 cursor-not-allowed">
                              <Lock className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="font-bold text-xs text-slate-900">{activeOrder.customerName}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {activeOrder.deliveryAddress.flat}, {activeOrder.deliveryAddress.area}
                          </p>
                          <p className="text-[10px] font-bold text-emerald-600 mt-1">
                            Distance: {distRiderToCustKm} km from your live location
                          </p>
                          {!isFoodCollected && (
                            <p className="text-[10px] font-bold text-amber-700 bg-amber-50/80 border border-amber-200/70 p-1.5 rounded-lg mt-2 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>Step 2 Dropoff option will open after you collect food in Step 1.</span>
                            </p>
                          )}
                        </div>

                        {/* Navigation Action Buttons */}
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                          {isFoodCollected ? (
                            <>
                              <button
                                type="button"
                                onClick={() => setActiveNavMode('dropoff')}
                                className="flex-1 py-2 px-2.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-[11px] rounded-xl border border-slate-200 transition text-center"
                              >
                                Focus on Radar
                              </button>
                              <a
                                href={dropoffGoogleMapsNavUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-2 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] rounded-xl shadow-xs transition flex items-center justify-center gap-1 text-center"
                                title="Open Google Maps with Turn-by-Turn GPS Navigation to Customer Doorstep"
                              >
                                <Navigation className="w-3 h-3 text-white" />
                                <span>Google Maps Nav ↗</span>
                              </a>
                            </>
                          ) : (
                            <div className="w-full py-2 px-2.5 bg-slate-100 text-slate-400 font-bold text-[11px] rounded-xl border border-slate-200 text-center flex items-center justify-center gap-1">
                              <Lock className="w-3 h-3 text-slate-400" />
                              <span>Step 2 Dropoff Locked • Complete Pickup First</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Delivery Actions */}
                    <div className="pt-2 border-t border-slate-100">
                      {!isFoodCollected ? (
                        /* STEP 1 ACTIVE: Collect food from restaurant */
                        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-blue-50 border border-blue-200 rounded-2xl space-y-4 shadow-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <span className="p-2 bg-blue-600 text-white rounded-xl shadow-2xs">
                                <Store className="w-4 h-4" />
                              </span>
                              <div>
                                <span className="text-xs font-black uppercase tracking-wider text-blue-950">
                                  Step 1: Restaurant Pickup & Food Collection
                                </span>
                                <p className="text-xs text-blue-800">
                                  Arrive at {activeOrder.restaurantName} and collect food packet
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-full">
                              {activeOrder.status === 'ready_for_pickup' ? 'Ready for Pickup' : 'Kitchen Preparing'}
                            </span>
                          </div>

                          {/* Order Items Checklist */}
                          <div className="space-y-2 bg-white p-3.5 rounded-xl border border-blue-100 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black uppercase tracking-wide text-slate-700">
                                Verify Order Items ({activeOrder.items.length}):
                              </span>
                              <span className="text-[11px] font-bold text-slate-500">
                                Total Value: ₹{activeOrder.totalAmount}
                              </span>
                            </div>
                            <div className="space-y-1.5">
                              {activeOrder.items.map((item, idx) => {
                                const itemKey = item.menuItemId || `item-${idx}`;
                                const isChecked = !!collectedItemIds[itemKey];
                                return (
                                  <label
                                    key={itemKey}
                                    onClick={() =>
                                      setCollectedItemIds((prev) => ({
                                        ...prev,
                                        [itemKey]: !prev[itemKey],
                                      }))
                                    }
                                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition select-none ${
                                      isChecked
                                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                                        : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        readOnly
                                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 pointer-events-none"
                                      />
                                      <span>
                                        {item.quantity}x {item.name}
                                      </span>
                                    </div>
                                    <span className="text-[11px] text-slate-500 font-semibold">
                                      ₹{item.price * item.quantity}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          {/* Food Collected Confirmation Button */}
                          <button
                            type="button"
                            onClick={() => {
                              updateOrderStatus(
                                activeOrder.id,
                                'out_for_delivery',
                                'Rider collected food parcel from restaurant. Heading to customer location.'
                              );
                              setActiveNavMode('dropoff');
                              playRiderTone('radar_pulse', 0.9);
                              addNotification(
                                'Food Collected!',
                                `Food collected from ${activeOrder.restaurantName}. Step 2: Customer Dropoff is now open!`,
                                'order'
                              );
                            }}
                            className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/25 transition flex items-center justify-center gap-2 active:scale-95"
                          >
                            <PackageCheck className="w-5 h-5 text-white" />
                            <span>Confirm Food Collected • Open Step 2 Customer Dropoff</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        /* STEP 2 ACTIVE: Customer Dropoff, Cash Collection, and OTP */
                        <div className="space-y-4">
                          {/* Step 2 Header Banner */}
                          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span className="text-xs font-black uppercase text-emerald-900">
                                Step 2: Customer Dropoff Open & Active
                              </span>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                              Food Collected ✓
                            </span>
                          </div>

                          {/* Pay on Delivery Cash Collection Section */}
                          {activeOrder.paymentMethod === 'cod' && (
                            <DeliveryPaymentQRCard
                              order={activeOrder}
                              onPaymentSuccess={handlePaymentSuccess}
                              onAutoRedirectToDeliver={handleAutoRedirectToDeliver}
                            />
                          )}

                          {/* Step 2: Customer Delivery Verification OTP & Complete Delivery */}
                          {activeOrder.paymentMethod === 'cod' &&
                          activeOrder.paymentStatus !== 'completed' ? (
                            /* LOCKED STATE: Rider must collect payment first */
                            <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl text-center space-y-2">
                              <div className="flex items-center justify-center gap-2 text-slate-700 font-black text-xs uppercase tracking-wider">
                                <Lock className="w-4 h-4 text-amber-600" />
                                <span>Step 2: Delivery Completion Locked</span>
                              </div>
                              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                                Customer selected Pay on Delivery. Collect <strong>₹{activeOrder.totalAmount}</strong> in cash from customer to unlock OTP verification and complete this delivery.
                              </p>
                            </div>
                          ) : (
                            /* UNLOCKED STATE: Payment verified or pre-paid */
                            <form
                              onSubmit={handleVerifyOtp}
                              className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <KeyRound className="w-4 h-4 text-blue-700" />
                                  <span className="text-xs font-black uppercase text-blue-900">
                                    {activeOrder.paymentMethod === 'cod'
                                      ? 'Step 2: Customer Delivery Verification OTP'
                                      : 'Customer Delivery Verification OTP'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {activeOrder.paymentMethod === 'cod' &&
                                    activeOrder.paymentStatus === 'completed' && (
                                      <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                                        <Unlock className="w-3 h-3 text-emerald-600" />
                                        Payment Received ✓
                                      </span>
                                    )}
                                  {/* Demo Autofill Hint Button */}
                                  <button
                                    type="button"
                                    onClick={() => setEnteredOtp(activeOrder.deliveryOtp)}
                                    className="text-[10px] font-bold bg-white text-blue-700 border border-blue-300 hover:bg-blue-50 px-2 py-0.5 rounded-full transition"
                                    title="Click to autofill OTP for quick test"
                                  >
                                    Demo OTP: {activeOrder.deliveryOtp}
                                  </button>
                                </div>
                              </div>
                              <p className="text-xs text-blue-800">
                                Ask the customer for the 4-digit OTP shown on their screen to complete delivery:
                              </p>

                              <div className="flex gap-2">
                                <input
                                  ref={otpInputRef}
                                  type="text"
                                  maxLength={4}
                                  required
                                  value={enteredOtp}
                                  onChange={(e) => setEnteredOtp(e.target.value)}
                                  placeholder="Enter 4-digit code (e.g. 7482)"
                                  className="flex-1 text-base font-mono font-black text-center tracking-widest bg-white border border-blue-300 rounded-xl focus:outline-blue-600 shadow-inner"
                                />
                                <button
                                  type="submit"
                                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95 shrink-0"
                                >
                                  Verify OTP & Deliver
                                </button>
                              </div>

                              {otpError && <p className="text-xs font-bold text-rose-600">{otpError}</p>}
                            </form>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

                {/* Trip Option: Reassign or Report Breakdown */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[11px] text-slate-500">
                    Encountered an issue or vehicle breakdown?
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setReassignTripModal({
                        orderId: activeOrder.id,
                        restaurantName: activeOrder.restaurantName,
                      });
                      setReassignReason('Vehicle breakdown / flat tire / puncture');
                      setCustomReassignReason('');
                    }}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition flex items-center gap-1.5 active:scale-95 shrink-0"
                  >
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                    <span>Decline / Reassign Trip</span>
                  </button>
                </div>
              </div>
          ) : (
            /* Available Nearby Restaurant Orders List */
            <div className="space-y-4">
              {/* Incoming Trip Offer Banner (Quick Pop-up Trigger) */}
              {activeOfferItem && rider.isOnline && (
                <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 border border-blue-500/40 shadow-xl flex flex-wrap items-center justify-between gap-4 animate-in fade-in">
                  <div className="flex items-center gap-3.5">
                    <div className="relative">
                      <span className="w-3 h-3 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 animate-ping" />
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                        <Bike className="w-6 h-6 text-emerald-400" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          Incoming Trip Offer • Order #{activeOfferItem.order.id}
                        </span>
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full">
                          {nearbyAvailableOrders.length} Trip{nearbyAvailableOrders.length > 1 ? 's' : ''} Available
                        </span>
                      </div>
                      <h4 className="text-base font-black font-heading mt-1">
                        {activeOfferItem.order.restaurantName} ➔ {activeOfferItem.order.deliveryAddress.area}
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Pickup: {activeOfferItem.distToRestaurantKm} km away • Drop: +{activeOfferItem.distToCustomerKm} km • Earn <strong className="text-emerald-400">₹{activeOfferItem.estimatedEarnings}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setActivePopupOfferOrderId(activeOfferItem.order.id);
                        setIsOfferPopupMinimized(false);
                      }}
                      className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      <span>Open Pop-up & Accept/Reject ↗</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Radar Overview Banner */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                    <Radio className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-base text-slate-900">
                      Nearby Restaurant Orders ({nearbyAvailableOrders.length})
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Matched using your live GPS location ({riderLat.toFixed(4)}, {riderLng.toFixed(4)})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setRiderSoundAlerts(!riderSoundAlerts)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                        riderSoundAlerts
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                      title="Toggle Rider Trip Audio Alerts"
                    >
                      {riderSoundAlerts ? <Volume2 className="w-3.5 h-3.5 text-blue-600" /> : <VolumeX className="w-3.5 h-3.5" />}
                      <span>{riderSoundAlerts ? 'Alerts: ON' : 'Muted'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => playAudioTunePreview(brandSettings.soundAlerts?.riderAudioUrl, 'rider', currentRiderVolume)}
                      className="p-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                      title="Test Rider Trip Alert Sound"
                    >
                      <Bell className="w-3.5 h-3.5 text-blue-600" />
                    </button>
                  </div>

                  <button
                    onClick={handleAutoFetchGpsLocation}
                    disabled={isFetchingGps}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isFetchingGps ? 'animate-spin' : ''}`} />
                    <span>Refresh Radar</span>
                  </button>
                </div>
              </div>

              {/* Radar Live Map */}
              <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-orange-600" />
                    <span>Radar Map: Your GPS Location & Nearby Kitchens</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Radius: 5 km coverage zone
                  </span>
                </div>

                <div className="rounded-2xl overflow-hidden border border-slate-200">
                  <LiveMap
                    centerLat={riderLat}
                    centerLng={riderLng}
                    height="220px"
                    interactive={false}
                    radiusKm={5}
                    riderCoords={{
                      lat: riderLat,
                      lng: riderLng,
                      name: `${rider.name} (You)`,
                    }}
                    restaurantCoords={
                      nearbyAvailableOrders.length > 0
                        ? {
                            lat: nearbyAvailableOrders[0].restaurant?.coordinates?.lat || 12.9348,
                            lng: nearbyAvailableOrders[0].restaurant?.coordinates?.lng || 77.625,
                            name: nearbyAvailableOrders[0].order.restaurantName,
                          }
                        : undefined
                    }
                  />
                </div>
              </div>

              {/* Order Cards List */}
              {nearbyAvailableOrders.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                    <Bike className="w-8 h-8" />
                  </div>
                  <h3 className="font-heading font-black text-lg text-slate-900">
                    {rider.isOnline
                      ? 'No pending orders waiting for pickup right now'
                      : 'You are currently Offline'}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {rider.isOnline
                      ? 'You are active in ' + riderZoneMatch.zone.name + '. As soon as a customer orders from nearby restaurants, trips will appear here automatically.'
                      : 'Toggle the switch above to go Online and start receiving delivery dispatches!'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {nearbyAvailableOrders.map(
                    ({ order: ord, restaurant: rest, distToRestaurantKm, distToCustomerKm, estimatedEarnings }) => (
                      <div
                        key={ord.id}
                        className="bg-white rounded-3xl p-5 border-2 border-slate-200/90 hover:border-blue-400 shadow-xs hover:shadow-md transition space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="p-2 bg-orange-100 text-orange-700 rounded-xl">
                              <Store className="w-4 h-4" />
                            </span>
                            <div>
                              <h4 className="font-bold text-sm text-slate-900">
                                {ord.restaurantName}
                              </h4>
                              <p className="text-[11px] text-slate-500">
                                Order #{ord.id} • {ord.items.length} items (₹{ord.totalAmount})
                              </p>
                              {ord.paymentMethod === 'cod' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200 mt-1">
                                  💵 Pay on Delivery • Collect ₹{ord.totalAmount} in Cash
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200 mt-1">
                                  💳 Pre-paid Online (Direct Handover)
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-base font-black text-emerald-600">
                              ₹{estimatedEarnings}
                            </span>
                            <p className="text-[10px] text-slate-400">Rider Earning</p>
                          </div>
                        </div>

                        {/* Route Distances & Navigation Preview */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          {/* Restaurant Distance */}
                          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 space-y-1.5 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between text-blue-900 font-bold">
                                <span className="flex items-center gap-1">
                                  <Store className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Pickup Distance</span>
                                </span>
                                <span className="font-black text-blue-700">{distToRestaurantKm} km</span>
                              </div>
                              <p className="text-[11px] text-slate-600 truncate mt-0.5">{ord.restaurantAddress}</p>
                            </div>
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&origin=${riderLat},${riderLng}&destination=${rest?.coordinates?.lat || 12.9348},${rest?.coordinates?.lng || 77.625}&travelmode=two-wheeler`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 hover:text-blue-900 hover:underline pt-1"
                            >
                              <Navigation className="w-3 h-3" />
                              <span>View Pickup in Google Maps ↗</span>
                            </a>
                          </div>

                          {/* Customer Drop Distance */}
                          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-1.5 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between text-emerald-900 font-bold">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Dropoff Distance</span>
                                </span>
                                <span className="font-black text-emerald-700">{distToCustomerKm} km</span>
                              </div>
                              <p className="text-[11px] text-slate-600 truncate mt-0.5">
                                {ord.deliveryAddress.flat}, {ord.deliveryAddress.area}
                              </p>
                            </div>
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&origin=${rest?.coordinates?.lat || 12.9348},${rest?.coordinates?.lng || 77.625}&destination=${ord.deliveryAddress.coordinates.lat},${ord.deliveryAddress.coordinates.lng}&travelmode=two-wheeler`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-900 hover:underline pt-1"
                            >
                              <Navigation className="w-3 h-3" />
                              <span>View Dropoff in Google Maps ↗</span>
                            </a>
                          </div>
                        </div>

                        {/* Order Items Preview */}
                        <div className="text-[11px] text-slate-500 bg-slate-50/70 p-2.5 rounded-xl flex items-center justify-between">
                          <span className="truncate">
                            Food: {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                          </span>
                          <span className="font-semibold text-orange-600 uppercase text-[10px] shrink-0 ml-2">
                            {ord.status.replace(/_/g, ' ')}
                          </span>
                        </div>

                        {/* Action: Open Upgraded Pop-Up to Review & Accept / Reject */}
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setActivePopupOfferOrderId(ord.id);
                              setIsOfferPopupMinimized(false);
                            }}
                            disabled={!rider.isOnline}
                            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-black text-xs rounded-2xl shadow-md transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 group"
                          >
                            <Sparkles className="w-4 h-4 text-amber-300 group-hover:scale-110 transition" />
                            <span>Show Pop-Up & Review Trip Dispatch (Earn ₹{estimatedEarnings})</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )}

          {/* Past Trips History */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200">
            <h4 className="font-heading font-black text-base text-slate-900 mb-3">
              Completed Delivery Trips ({completedTrips.length})
            </h4>
            <div className="space-y-2">
              {completedTrips.map((tr) => (
                <div
                  key={tr.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900">Trip #{tr.id}</span>
                    <p className="text-[11px] text-slate-500">
                      {tr.restaurantName} → {tr.deliveryAddress.area}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-emerald-600 text-sm">
                      ₹{tr.deliveryFee + (tr.tipAmount || 0)}
                    </span>
                    <p className="text-[10px] text-slate-400">Completed ✓</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Wallet, Cash in Hand & Withdraw Available Balance */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200">
                Earnings Withdrawable Balance
              </span>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-md">
                Earnings Only Access
              </span>
            </div>

            <div>
              <h3 className="text-3xl font-black font-heading text-emerald-300">
                ₹{withdrawAvailableBalance}
              </h3>
              <p className="text-[11px] text-blue-200 mt-1">
                Verified delivery earnings ready for: <span className="font-mono font-bold text-white">{rider.kyc.payoutUpiOrBank}</span>
              </p>
            </div>

            {/* Visual Equation Card */}
            <div className="bg-white/10 rounded-2xl p-3 border border-white/10 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-200 flex items-center justify-between">
                <span>Earnings Balance Equation</span>
                <span className="text-[9px] text-emerald-300">Live Auto-Update</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                <div className="bg-white/10 rounded-xl p-1.5">
                  <span className="text-[9px] text-blue-200 block font-bold">Total Earnings</span>
                  <span className="font-black text-white">₹{riderTotalEarnings}</span>
                  <span className="text-[8px] text-blue-300 block">Trip fees & tips</span>
                </div>
                <div className="bg-white/10 rounded-xl p-1.5">
                  <span className="text-[9px] text-amber-200 block font-bold">(-) Cash in Hand</span>
                  <span className="font-black text-amber-300">-₹{riderCashHeld}</span>
                  <span className="text-[8px] text-amber-300/80 block">Non-withdrawable</span>
                </div>
                <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-1.5">
                  <span className="text-[9px] text-emerald-200 block font-bold">(=) Withdrawable</span>
                  <span className="font-black text-emerald-300">₹{withdrawAvailableBalance}</span>
                  <span className="text-[8px] text-emerald-300 block">Eligible earnings</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => setIsPayoutModalOpen(true)}
                disabled={withdrawAvailableBalance <= 0}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                title={
                  withdrawAvailableBalance > 0
                    ? `Request instant withdrawal of ₹${withdrawAvailableBalance} from earnings`
                    : 'Withdrawal locked: Only positive delivery earnings can be withdrawn'
                }
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>
                  {withdrawAvailableBalance > 0
                    ? `Withdraw ₹${withdrawAvailableBalance} from Earnings`
                    : 'Withdrawal Locked (₹0 Available)'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setDashboardTab('earnings')}
                className="w-full py-2 bg-blue-800/80 hover:bg-blue-800 text-blue-100 font-bold text-xs rounded-xl border border-blue-600/40 transition text-center"
              >
                View Earnings & COD Ledger →
              </button>
            </div>
          </div>

          {/* Floating Cash Holding Card in Right Column */}
          <div
            className={`rounded-3xl p-6 border shadow-xs space-y-3.5 ${
              isCashHoldingLimitExceeded
                ? 'bg-rose-50/90 border-rose-300 text-rose-950'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                Floating Cash in Hand
              </span>
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  isCashHoldingLimitExceeded
                    ? 'bg-rose-200 text-rose-900 border border-rose-300 animate-pulse'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Limit: ₹{cashHoldingLimit}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <h3
                className={`text-2xl font-black font-heading ${
                  isCashHoldingLimitExceeded ? 'text-rose-600' : 'text-slate-900'
                }`}
              >
                ₹{riderCashHeld}
              </h3>
              {isCashHoldingLimitExceeded ? (
                <span className="text-xs font-bold text-rose-600">
                  +₹{excessCashAmount} over limit
                </span>
              ) : (
                <span className="text-xs font-bold text-emerald-600">
                  ₹{cashHoldingLimit - riderCashHeld} buffer left
                </span>
              )}
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isCashHoldingLimitExceeded
                    ? 'bg-rose-600'
                    : cashLimitUsagePercent > 75
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, cashLimitUsagePercent)}%` }}
              />
            </div>

            <p className="text-xs text-slate-600 leading-snug">
              {isCashHoldingLimitExceeded ? (
                <span className="text-rose-700 font-semibold">
                  ⛔ Cash orders stopped. Pay ₹{excessCashAmount} via Razorpay to unlock.
                </span>
              ) : (
                <span>
                  Physical cash collected from COD orders. Deposit dues back anytime via Razorpay.
                </span>
              )}
            </p>

            <button
              type="button"
              onClick={() => setIsCashDepositModalOpen(true)}
              className={`w-full py-2.5 font-black text-xs rounded-xl shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5 ${
                isCashHoldingLimitExceeded
                  ? 'bg-rose-600 hover:bg-rose-500 text-white ring-2 ring-rose-400/40 animate-pulse'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <Banknote className="w-4 h-4 text-amber-300" />
              <span>
                {isCashHoldingLimitExceeded
                  ? `Pay Excess Dues (₹${excessCashAmount}) via Razorpay`
                  : 'Deposit Cash via Razorpay'}
              </span>
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-4">
            <h4 className="font-heading font-black text-base text-slate-900">
              Today's Performance
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Trips Done</span>
                <p className="text-lg font-black text-slate-900 mt-0.5">8</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Customer Tips</span>
                <p className="text-lg font-black text-emerald-600 mt-0.5">₹140</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Distance Covered</span>
                <p className="text-lg font-black text-slate-900 mt-0.5">32.4 km</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Hours Online</span>
                <p className="text-lg font-black text-slate-900 mt-0.5">4.5 hrs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
        </>
      ) : (
        <RiderEarningsLedger
          rider={rider}
          transactions={deliveryWalletTransactions}
          payoutRequests={payoutRequests}
          completedOrders={completedTrips}
          onOpenPayoutModal={() => setIsPayoutModalOpen(true)}
          onCancelPayoutRequest={(payoutId) => cancelRiderPayoutRequest(payoutId)}
          onOpenRazorpayDepositModal={() => setIsCashDepositModalOpen(true)}
        />
      )}


      {/* Reassign Active Trip Modal */}
      {reassignTripModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-rose-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                  <AlertOctagon className="w-5 h-5 text-rose-600" />
                </span>
                <div>
                  <h3 className="text-base font-black font-heading text-rose-950">
                    Decline & Reassign Active Trip
                  </h3>
                  <p className="text-xs text-slate-500">
                    Order #{reassignTripModal.orderId} • {reassignTripModal.restaurantName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReassignTripModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Please specify why you need to unassign from this active delivery:
            </p>

            <div className="space-y-2">
              {[
                'Vehicle breakdown / flat tire / puncture',
                'Medical or personal emergency',
                'Restaurant preparation delay exceeds 30 mins',
                'Customer address unreachable / incorrect address',
                'Extreme weather / heavy downpour',
                'Other reason',
              ].map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                    reassignReason === r
                      ? 'bg-rose-50 border-rose-400 font-bold text-rose-950'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="reassignReason"
                    value={r}
                    checked={reassignReason === r}
                    onChange={() => setReassignReason(r)}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>

            {reassignReason === 'Other reason' && (
              <textarea
                value={customReassignReason}
                onChange={(e) => setCustomReassignReason(e.target.value)}
                placeholder="State your reason for reassigning..."
                rows={2}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-rose-500"
              />
            )}

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <span>Immediate Re-Dispatch Notice</span>
              </p>
              <p className="text-amber-800">
                This trip will be unassigned from your shift immediately and dispatched to another rider in the area to ensure the customer receives their order promptly.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReassignTripModal(null)}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Keep Trip
              </button>
              <button
                type="button"
                onClick={() => {
                  const finalReason =
                    reassignReason === 'Other reason' && customReassignReason.trim()
                      ? customReassignReason.trim()
                      : reassignReason;
                  reassignOrderFromDelivery(reassignTripModal.orderId, rider.id, finalReason);
                  setReassignTripModal(null);
                }}
                className="flex-2 py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 active:scale-95"
              >
                <XCircle className="w-4 h-4" />
                <span>Confirm Reassignment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pop-up Trip Accept / Reject Dispatch Modal */}
      {activeOfferItem && rider.isOnline && !activeOrder && (
        <IncomingTripModal
          isOpen={!isOfferPopupMinimized && !!activePopupOfferOrderId}
          order={activeOfferItem.order}
          restaurant={activeOfferItem.restaurant}
          rider={rider}
          distToRestaurantKm={activeOfferItem.distToRestaurantKm}
          distToCustomerKm={activeOfferItem.distToCustomerKm}
          totalDistanceKm={parseFloat(
            (activeOfferItem.distToRestaurantKm + activeOfferItem.distToCustomerKm).toFixed(1)
          )}
          estimatedEarnings={activeOfferItem.estimatedEarnings}
          estimatedEtaMins={Math.round(
            (activeOfferItem.distToRestaurantKm + activeOfferItem.distToCustomerKm) * 4.5 +
              (activeOfferItem.order.estimatedPrepTimeMins || 15)
          )}
          totalAvailableOffers={nearbyAvailableOrders.length}
          allAvailableOffers={nearbyAvailableOrders}
          onSelectOffer={(orderId) => {
            setActivePopupOfferOrderId(orderId);
            setIsOfferPopupMinimized(false);
          }}
          onAccept={handleAcceptTripFromPopup}
          onReject={handleRejectTripFromPopup}
          onCloseOrMinimize={() => {
            setIsOfferPopupMinimized(true);
            setHasDismissedOfferBatch(false);
          }}
          onOpenRazorpayDeposit={() => setIsCashDepositModalOpen(true)}
          riderLat={riderLat}
          riderLng={riderLng}
        />
      )}

      {/* Floating Minimized Dispatch Radar Pill */}
      {activeOfferItem && rider.isOnline && !activeOrder && isOfferPopupMinimized && (
        <div className="fixed bottom-5 right-5 z-40 animate-in slide-in-from-bottom-3 duration-200">
          <button
            type="button"
            onClick={() => setIsOfferPopupMinimized(false)}
            className="p-3 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-2xl shadow-2xl border-2 border-emerald-400/60 flex items-center gap-3 hover:scale-105 transition active:scale-95 group"
          >
            <div className="relative">
              <span className="w-3 h-3 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 animate-ping" />
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
                <Bike className="w-5 h-5" />
              </div>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                  Dispatch Waiting
                </span>
                <span className="text-[10px] font-bold text-amber-300 bg-amber-950/60 px-1.5 py-0.2 rounded">
                  {nearbyAvailableOrders.length} Offer{nearbyAvailableOrders.length > 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-xs font-bold text-white truncate max-w-[150px]">
                {activeOfferItem.order.restaurantName}
              </p>
              <p className="text-[10px] text-emerald-300 font-black">
                Earn ₹{activeOfferItem.estimatedEarnings} • Tap to Open Pop-Up ↗
              </p>
            </div>
          </button>
        </div>
      )}

      {/* Rider Instant Payout & Withdrawal Modal */}
      <RiderPayoutModal
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        rider={rider}
        onRequestPayout={(params) => requestPayout(params)}
      />

      {/* Rider Real Payment Gateway Floating Cash Deposit Modal */}
      <RiderPaymentGatewayDepositModal
        isOpen={isCashDepositModalOpen}
        onClose={() => setIsCashDepositModalOpen(false)}
        rider={rider}
        onDepositSuccess={depositRiderFloatingCash}
      />
    </div>
  );
};
