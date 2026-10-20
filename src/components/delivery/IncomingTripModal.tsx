import React, { useState, useEffect, useRef } from 'react';
import {
  Bike,
  MapPin,
  Store,
  Clock,
  X,
  Check,
  XCircle,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Timer,
  Banknote,
  AlertCircle,
  Navigation,
  Lock,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Coffee,
  PowerOff,
  Flame,
  CheckCircle2,
  SlidersHorizontal,
  Compass,
} from 'lucide-react';
import { Order, Restaurant, DeliveryPartner } from '../../types';
import { useApp } from '../../context/AppContext';
import { startRiderTripRinging, stopRiderTripRinging } from '../../utils/soundUtils';

export interface AvailableTripItem {
  order: Order;
  restaurant: Restaurant | null | undefined;
  distToRestaurantKm: number;
  distToCustomerKm: number;
  estimatedEarnings: number;
}

export interface IncomingTripModalProps {
  isOpen: boolean;
  order: Order;
  restaurant: Restaurant | null | undefined;
  rider: DeliveryPartner;
  distToRestaurantKm: number;
  distToCustomerKm: number;
  totalDistanceKm: number;
  estimatedEarnings: number;
  estimatedEtaMins: number;
  totalAvailableOffers?: number;
  allAvailableOffers?: AvailableTripItem[];
  onSelectOffer?: (orderId: string) => void;
  onAccept: (orderId: string, options?: { navigateImmediately?: boolean }) => void;
  onReject: (orderId: string, reason: string, action?: 'pass' | 'break' | 'offline') => void;
  onCloseOrMinimize: () => void;
  onOpenRazorpayDeposit?: () => void;
  riderLat?: number;
  riderLng?: number;
}

export interface RejectReasonCategory {
  category: string;
  reasons: string[];
}

const REJECT_REASON_CATEGORIES: RejectReasonCategory[] = [
  {
    category: 'Route & Distance',
    reasons: [
      'Pickup location is too far from my current GPS position',
      'Dropoff destination is in a heavy traffic / gridlock zone',
      'Customer area is outside my preferred delivery sector',
      'Poor road conditions / unpaved terrain to dropoff',
    ],
  },
  {
    category: 'Fare & Effort',
    reasons: [
      'Payout fare is too low for the total distance and time',
      'Order parcel is too large / bulky / heavy for my bike bag',
      'Multiple liquid / fragile items prone to spillage',
    ],
  },
  {
    category: 'Vehicle & Fuel / Battery',
    reasons: [
      'Vehicle mechanical issue / flat tire / puncture',
      'EV battery low / need to recharge at swap station',
      'Fuel reserve low / need to refuel immediately',
    ],
  },
  {
    category: 'Weather & Safety',
    reasons: [
      'Heavy rain / waterlogging / storm conditions',
      'Night visibility issue / unsafe route at this hour',
    ],
  },
  {
    category: 'Shift & Availability',
    reasons: [
      'Taking a scheduled meal / tea break',
      'Ending shift for today / heading home',
      'Personal or family emergency',
    ],
  },
];

export const IncomingTripModal: React.FC<IncomingTripModalProps> = ({
  isOpen,
  order,
  restaurant,
  rider,
  distToRestaurantKm,
  distToCustomerKm,
  totalDistanceKm,
  estimatedEarnings,
  estimatedEtaMins,
  totalAvailableOffers = 1,
  allAvailableOffers = [],
  onSelectOffer,
  onAccept,
  onReject,
  onCloseOrMinimize,
  onOpenRazorpayDeposit,
  riderLat = 12.9352,
  riderLng = 77.6245,
}) => {
  const [countdown, setCountdown] = useState(45);
  const [maxCountdown, setMaxCountdown] = useState(45);
  const [showRejectDrawer, setShowRejectDrawer] = useState(false);
  const [selectedRejectCategory, setSelectedRejectCategory] = useState<string>('Route & Distance');
  const [selectedRejectReason, setSelectedRejectReason] = useState<string>(
    REJECT_REASON_CATEGORIES[0].reasons[0]
  );
  const [customRejectReason, setCustomRejectReason] = useState('');
  const [rejectActionType, setRejectActionType] = useState<'pass' | 'break' | 'offline'>('pass');

  // Accept method toggle: 'tap' (1-Tap button) vs 'slide' (Swiper gesture)
  const [acceptMethod, setAcceptMethod] = useState<'tap' | 'slide'>('tap');
  const [autoNavigateGps, setAutoNavigateGps] = useState(true);

  // Audio mute toggle inside popup
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // Slide to Accept State
  const [sliderPosition, setSliderPosition] = useState(0);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const sliderTrackRef = useRef<HTMLDivElement>(null);

  // Floating cash limit evaluation
  const isCod = order?.paymentMethod === 'cod';
  const currentCash = rider?.totalCashCollected || 0;
  const cashLimit = rider?.floatingCashLimit || 1000;
  const isCashOrderBlocked = isCod && currentCash >= cashLimit;
  const excessCash = Math.max(0, currentCash - cashLimit);

  const { brandSettings } = useApp();
  const isRiderSoundConfigured =
    brandSettings.soundAlerts?.enabled !== false &&
    brandSettings.soundAlerts?.riderSoundEnabled !== false;
  const riderAudioUrl = brandSettings.soundAlerts?.riderAudioUrl;
  const riderVolume = brandSettings.soundAlerts?.riderVolume ?? 0.85;

  // Ring continuously UNTIL trip offer is accepted (or rejected / timed out)
  useEffect(() => {
    if (isOpen && order && isRiderSoundConfigured && !isAudioMuted) {
      startRiderTripRinging(riderAudioUrl, riderVolume);
    } else {
      stopRiderTripRinging();
    }

    return () => {
      stopRiderTripRinging();
    };
  }, [isOpen, order?.id, isRiderSoundConfigured, isAudioMuted, riderAudioUrl, riderVolume]);

  // Reset countdown & form when a new order ID comes in
  useEffect(() => {
    if (isOpen && order) {
      setCountdown(45);
      setMaxCountdown(45);
      setShowRejectDrawer(false);
      setSelectedRejectCategory('Route & Distance');
      setSelectedRejectReason(REJECT_REASON_CATEGORIES[0].reasons[0]);
      setCustomRejectReason('');
      setSliderPosition(0);
      setIsDraggingSlider(false);
    }
  }, [isOpen, order?.id]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || !order) return;
    if (countdown <= 0) {
      // Auto-pass trip when timer expires
      onReject(order.id, 'Offer timer expired (No response within dispatch window)', 'pass');
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, order?.id, countdown, onReject]);

  // Handle slide to accept gesture
  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDraggingSlider || !sliderTrackRef.current || isCashOrderBlocked) return;
    const rect = sliderTrackRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const relativeX = clientX - rect.left - 24; // offset half handle width
    const maxDrag = rect.width - 52;
    const bounded = Math.max(0, Math.min(maxDrag, relativeX));
    const percent = bounded / maxDrag;
    setSliderPosition(percent);

    if (percent >= 0.88) {
      // Trigger accept!
      setIsDraggingSlider(false);
      setSliderPosition(1);
      triggerAccept();
    }
  };

  const handleDragEnd = () => {
    if (!isDraggingSlider) return;
    setIsDraggingSlider(false);
    if (sliderPosition < 0.88) {
      setSliderPosition(0);
    }
  };

  const triggerAccept = () => {
    stopRiderTripRinging();
    if (autoNavigateGps && restaurant) {
      const restLat = restaurant?.coordinates?.lat || 12.9348;
      const restLng = restaurant?.coordinates?.lng || 77.625;
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${riderLat},${riderLng}&destination=${restLat},${restLng}&travelmode=two-wheeler`;
      window.open(mapsUrl, '_blank');
    }
    onAccept(order.id, { navigateImmediately: autoNavigateGps });
  };

  const handleConfirmReject = () => {
    stopRiderTripRinging();
    const finalReason =
      selectedRejectReason === 'Other custom reason' && customRejectReason.trim()
        ? customRejectReason.trim()
        : selectedRejectReason;
    onReject(order.id, finalReason, rejectActionType);
  };

  if (!isOpen || !order) return null;

  const totalItemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const progressPercent = Math.max(0, Math.min(100, (countdown / maxCountdown) * 100));

  // Current order index in multi-offer list
  const currentOfferIndex = allAvailableOffers.findIndex((o) => o.order.id === order.id);
  const activeOfferNumber = currentOfferIndex >= 0 ? currentOfferIndex + 1 : 1;
  const totalOffersCount = Math.max(totalAvailableOffers, allAvailableOffers.length, 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[94vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col relative animate-in zoom-in-95 duration-200">
        {/* Top Countdown Linear Progress Bar */}
        <div className="w-full bg-slate-200 h-2 overflow-hidden rounded-t-3xl">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${
              countdown <= 10
                ? 'bg-rose-500 animate-pulse'
                : countdown <= 20
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 absolute -top-1 -right-1 animate-ping" />
                <span className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-inner">
                  <Bike className="w-5 h-5 text-emerald-400" />
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Live Trip Dispatch</span>
                  </span>

                  {totalOffersCount > 1 && (
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-950/70 px-2 py-0.5 rounded-full border border-amber-500/40">
                      Offer {activeOfferNumber} of {totalOffersCount}
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-black font-heading tracking-tight mt-0.5 text-white">
                  Trip Offer #{order.id}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Audio Toggle */}
              <button
                type="button"
                onClick={() => setIsAudioMuted(!isAudioMuted)}
                className={`p-2 rounded-xl transition border ${
                  isAudioMuted
                    ? 'bg-slate-800 text-slate-400 border-slate-700'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 animate-pulse'
                }`}
                title={isAudioMuted ? 'Unmute Dispatch Chime' : 'Mute Dispatch Chime'}
              >
                {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Countdown Badge with +15s option */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-black border transition ${
                  countdown <= 10
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                    : 'bg-white/10 text-white border-white/20'
                }`}
              >
                <Timer className="w-3.5 h-3.5" />
                <span>{countdown}s</span>
              </div>

              {/* Minimize / Dismiss */}
              <button
                type="button"
                onClick={onCloseOrMinimize}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
                title="Minimize pop-up offer to radar pill"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Multi-Offer Carousel Tabs (When > 1 order available) */}
          {allAvailableOffers.length > 1 && onSelectOffer && (
            <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                Switch Nearby Offers:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-[70%]">
                {allAvailableOffers.map((item, idx) => {
                  const isSelected = item.order.id === order.id;
                  return (
                    <button
                      key={item.order.id}
                      type="button"
                      onClick={() => onSelectOffer(item.order.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 shrink-0 ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                          : 'bg-white/10 hover:bg-white/20 text-slate-200'
                      }`}
                    >
                      <span>#{item.order.id}</span>
                      <span className="opacity-80">₹{item.estimatedEarnings}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* Earnings & Trip Metrics Card */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 text-white shadow-lg shadow-emerald-700/20 flex items-center justify-between relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-white/10 rounded-full blur-md" />

            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-100 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Guaranteed Rider Payout</span>
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-3xl sm:text-4xl font-black font-heading text-white tracking-tight">
                  ₹{estimatedEarnings}
                </span>
                <span className="text-xs font-bold text-emerald-100 bg-white/20 px-2 py-0.5 rounded-full">
                  Instant Wallet Credit
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-emerald-50 mt-1 flex-wrap">
                <span>Base Fare ₹35</span>
                <span>•</span>
                <span>Dist Bonus ₹{(totalDistanceKm * 12).toFixed(0)}</span>
                {order.tipAmount && order.tipAmount > 0 ? (
                  <>
                    <span>•</span>
                    <span className="text-amber-200 font-bold">+₹{order.tipAmount} Tip!</span>
                  </>
                ) : null}
              </div>
            </div>

            <div className="text-right space-y-1.5 relative z-10">
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-slate-900 bg-white px-3 py-1.5 rounded-2xl shadow-md">
                <Navigation className="w-3.5 h-3.5 text-emerald-700" />
                <span>{totalDistanceKm} km total</span>
              </div>
              <div className="text-xs font-bold text-emerald-100 flex items-center justify-end gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-200" />
                <span>~{estimatedEtaMins} mins ETA</span>
              </div>
            </div>
          </div>

          {/* Two-Step Route Breakdown */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Turn-By-Turn Route Breakdown
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Live GPS optimized
              </span>
            </div>

            {/* Step 1: Restaurant/Store Pickup */}
            <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200 flex items-start gap-3 transition hover:border-blue-300">
              <span className="p-2.5 bg-blue-600 text-white rounded-xl shrink-0 mt-0.5 shadow-2xs">
                <Store className="w-4 h-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                    Step 1: Store Pickup
                  </span>
                  <span className="text-xs font-black text-blue-800">
                    {distToRestaurantKm} km away
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 mt-1 truncate">
                  {order.restaurantName}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                  {restaurant?.address || order.restaurantAddress}
                </p>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-blue-100 text-[11px]">
                  <span className="text-slate-500 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3 text-blue-600" />
                    <span>Prep: ~{order.estimatedPrepTimeMins || 15} mins</span>
                  </span>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${riderLat},${riderLng}&destination=${restaurant?.coordinates?.lat || 12.9348},${restaurant?.coordinates?.lng || 77.625}&travelmode=two-wheeler`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 hover:underline"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Preview in Google Maps ↗</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Step 2: Customer Dropoff */}
            <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex items-start gap-3 transition hover:border-emerald-300">
              <span className="p-2.5 bg-emerald-600 text-white rounded-xl shrink-0 mt-0.5 shadow-2xs">
                <MapPin className="w-4 h-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Step 2: Customer Dropoff
                  </span>
                  <span className="text-xs font-black text-emerald-800">
                    +{distToCustomerKm} km drop
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 mt-1 truncate">
                  {order.customerName}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                  {order.deliveryAddress.flat}, {order.deliveryAddress.area}
                </p>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-100 text-[11px]">
                  <span className="text-slate-500 font-medium">
                    Landmark: {order.deliveryAddress.landmark || 'Customer Pin'}
                  </span>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${restaurant?.coordinates?.lat || 12.9348},${restaurant?.coordinates?.lng || 77.625}&destination=${order.deliveryAddress.coordinates.lat},${order.deliveryAddress.coordinates.lng}&travelmode=two-wheeler`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 hover:underline"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Preview in Google Maps ↗</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Order Contents & Payment Verification */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-700 font-bold flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
                <span>Package Items ({totalItemCount} items)</span>
              </span>
              <span className="text-slate-900 font-black">
                Order Value: ₹{order.totalAmount}
              </span>
            </div>

            <p className="text-xs text-slate-600 line-clamp-2">
              {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
            </p>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
              <div>
                {isCod ? (
                  <span className="text-[11px] font-black text-amber-800 bg-amber-100/90 border border-amber-300 px-2.5 py-1 rounded-xl flex items-center gap-1">
                    <Banknote className="w-3.5 h-3.5 text-amber-700" />
                    <span>Pay on Delivery (Cash on Handover)</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-xl flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Prepaid Online (No Cash Collection)</span>
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500 font-semibold">
                SLA: Direct Kitchen Handover
              </span>
            </div>
          </div>

          {/* Floating Cash Limit Warning Card for COD orders */}
          {isCashOrderBlocked && (
            <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl space-y-2.5 text-rose-950 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-rose-200 text-rose-800 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-rose-700" />
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-rose-950">
                    Cash Order Assignment Blocked
                  </span>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 border border-rose-300">
                  Limit: ₹{cashLimit}
                </span>
              </div>

              <p className="text-xs text-rose-900 leading-relaxed">
                You are currently holding <strong>₹{currentCash}</strong> in floating cash. 
                Exceeding your ₹{cashLimit} limit stops cash orders from being accepted. 
                Deposit your excess dues (₹{excessCash}) via Razorpay to unlock cash dispatches.
              </p>

              {onOpenRazorpayDeposit && (
                <button
                  type="button"
                  onClick={onOpenRazorpayDeposit}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-black text-xs rounded-xl shadow-xs transition active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Deposit ₹{excessCash} via Razorpay Now →</span>
                </button>
              )}
            </div>
          )}

          {/* Upgraded Reject Options Drawer (Collapsible) */}
          {showRejectDrawer && (
            <div className="p-4 bg-rose-50/90 border-2 border-rose-200 rounded-3xl space-y-3.5 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between border-b border-rose-200/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-rose-200 text-rose-800 rounded-lg">
                    <XCircle className="w-4 h-4 text-rose-700" />
                  </span>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-rose-950 block">
                      Decline & Re-Route Trip
                    </span>
                    <span className="text-[10px] text-rose-700 font-medium">
                      Select reason for accurate fleet dispatching
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRejectDrawer(false)}
                  className="text-xs text-rose-600 hover:text-rose-800 font-bold px-2 py-1 rounded-lg hover:bg-rose-100"
                >
                  Cancel
                </button>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {REJECT_REASON_CATEGORIES.map((cat) => (
                  <button
                    key={cat.category}
                    type="button"
                    onClick={() => {
                      setSelectedRejectCategory(cat.category);
                      setSelectedRejectReason(cat.reasons[0]);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap transition ${
                      selectedRejectCategory === cat.category
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'bg-white text-slate-700 hover:bg-rose-100 border border-rose-200'
                    }`}
                  >
                    {cat.category}
                  </button>
                ))}
              </div>

              {/* Reasons List for Current Category */}
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {REJECT_REASON_CATEGORIES.find((c) => c.category === selectedRejectCategory)?.reasons.map(
                  (reason, idx) => (
                    <label
                      key={idx}
                      className={`flex items-start gap-2 p-2.5 rounded-xl text-xs font-semibold cursor-pointer border transition ${
                        selectedRejectReason === reason
                          ? 'bg-rose-100/90 border-rose-400 text-rose-950 font-bold shadow-2xs'
                          : 'bg-white border-rose-100 text-slate-700 hover:bg-rose-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="rejectReason"
                        value={reason}
                        checked={selectedRejectReason === reason}
                        onChange={(e) => setSelectedRejectReason(e.target.value)}
                        className="text-rose-600 focus:ring-rose-500 mt-0.5"
                      />
                      <span>{reason}</span>
                    </label>
                  )
                )}

                <label
                  className={`flex items-start gap-2 p-2.5 rounded-xl text-xs font-semibold cursor-pointer border transition ${
                    selectedRejectReason === 'Other custom reason'
                      ? 'bg-rose-100/90 border-rose-400 text-rose-950 font-bold shadow-2xs'
                      : 'bg-white border-rose-100 text-slate-700 hover:bg-rose-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="rejectReason"
                    value="Other custom reason"
                    checked={selectedRejectReason === 'Other custom reason'}
                    onChange={(e) => setSelectedRejectReason(e.target.value)}
                    className="text-rose-600 focus:ring-rose-500 mt-0.5"
                  />
                  <span>Other custom reason</span>
                </label>
              </div>

              {selectedRejectReason === 'Other custom reason' && (
                <textarea
                  value={customRejectReason}
                  onChange={(e) => setCustomRejectReason(e.target.value)}
                  placeholder="Explain why this trip is not suitable right now..."
                  rows={2}
                  className="w-full text-xs p-2.5 bg-white border border-rose-300 rounded-xl focus:outline-rose-500"
                />
              )}

              {/* Rejection Next Action Selector */}
              <div className="pt-2 border-t border-rose-200/80 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-900 block">
                  Select Action After Declining:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setRejectActionType('pass')}
                    className={`p-2 rounded-xl text-center text-[10px] font-bold border transition ${
                      rejectActionType === 'pass'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-white text-slate-700 border-rose-200 hover:bg-rose-50'
                    }`}
                  >
                    <span>Pass to Next Rider</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRejectActionType('break')}
                    className={`p-2 rounded-xl text-center text-[10px] font-bold border transition flex flex-col items-center justify-center gap-0.5 ${
                      rejectActionType === 'break'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-white text-slate-700 border-rose-200 hover:bg-amber-50'
                    }`}
                  >
                    <span>Take 15m Break</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRejectActionType('offline')}
                    className={`p-2 rounded-xl text-center text-[10px] font-bold border transition flex flex-col items-center justify-center gap-0.5 ${
                      rejectActionType === 'offline'
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-white text-slate-700 border-rose-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>Go Offline</span>
                  </button>
                </div>
              </div>

              {/* Confirm Reject Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>
                    {rejectActionType === 'pass'
                      ? 'Confirm & Pass Trip to Next Partner'
                      : rejectActionType === 'break'
                      ? 'Confirm & Pause Dispatches for 15m'
                      : 'Confirm & Go Offline Now'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/90 rounded-b-3xl space-y-3">
          {/* Accept Mode Toggle & GPS checkbox */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500">Accept Mode:</span>
              <div className="inline-flex bg-slate-200 p-0.5 rounded-lg text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setAcceptMethod('tap')}
                  className={`px-2 py-0.5 rounded-md transition ${
                    acceptMethod === 'tap'
                      ? 'bg-white text-emerald-800 font-black shadow-2xs'
                      : 'text-slate-600'
                  }`}
                >
                  1-Tap
                </button>
                <button
                  type="button"
                  onClick={() => setAcceptMethod('slide')}
                  className={`px-2 py-0.5 rounded-md transition ${
                    acceptMethod === 'slide'
                      ? 'bg-white text-emerald-800 font-black shadow-2xs'
                      : 'text-slate-600'
                  }`}
                >
                  Slide
                </button>
              </div>
            </div>

            <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={autoNavigateGps}
                onChange={(e) => setAutoNavigateGps(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
              />
              <span>Launch Google Maps GPS</span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            {/* Reject / Decline Button (toggles drawer) */}
            {!showRejectDrawer ? (
              <button
                type="button"
                onClick={() => setShowRejectDrawer(true)}
                className="py-3.5 px-4 bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 font-bold text-xs rounded-2xl border border-slate-200 hover:border-rose-300 transition flex items-center justify-center gap-1.5 shadow-2xs active:scale-95"
              >
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Reject / Pass</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowRejectDrawer(false)}
                className="py-3.5 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-2xl transition"
              >
                Back
              </button>
            )}

            {/* Accept Trip Option: 1-Tap vs Slide */}
            {acceptMethod === 'tap' ? (
              <button
                type="button"
                onClick={triggerAccept}
                disabled={isCashOrderBlocked}
                className={`flex-1 py-3.5 px-5 font-black text-xs sm:text-sm rounded-2xl transition active:scale-95 flex items-center justify-center gap-2 ${
                  isCashOrderBlocked
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                    : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white shadow-lg shadow-emerald-600/25'
                }`}
                title={
                  isCashOrderBlocked
                    ? `Cannot accept cash order: Floating Cash Limit reached. Deposit via Razorpay.`
                    : `Accept trip and earn ₹${estimatedEarnings}`
                }
              >
                {isCashOrderBlocked ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Cash Order Blocked • Deposit via Razorpay</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
                    <span>Accept Trip • Earn ₹{estimatedEarnings}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              /* SLIDE TO ACCEPT SWIPER */
              <div
                ref={sliderTrackRef}
                onMouseMove={handleTouchMove}
                onTouchMove={handleTouchMove}
                onMouseUp={handleDragEnd}
                onTouchEnd={handleDragEnd}
                className={`flex-1 relative h-13 rounded-2xl flex items-center select-none overflow-hidden transition ${
                  isCashOrderBlocked
                    ? 'bg-slate-200 border border-slate-300'
                    : 'bg-emerald-950 border-2 border-emerald-500/50'
                }`}
              >
                {/* Background progress fill */}
                <div
                  className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-600 to-teal-500 transition-all duration-75"
                  style={{ width: `${Math.max(12, sliderPosition * 100)}%` }}
                />

                {/* Track label */}
                <div className="w-full text-center text-xs font-black text-white relative z-10 pointer-events-none tracking-wide">
                  {isCashOrderBlocked ? (
                    <span className="text-slate-400">Cash Order Blocked (Limit Reached)</span>
                  ) : sliderPosition > 0.6 ? (
                    <span>Release to Confirm!</span>
                  ) : (
                    <span>Slide to Accept (Earn ₹{estimatedEarnings}) ➔</span>
                  )}
                </div>

                {/* Draggable knob */}
                {!isCashOrderBlocked && (
                  <div
                    onMouseDown={() => setIsDraggingSlider(true)}
                    onTouchStart={() => setIsDraggingSlider(true)}
                    style={{
                      transform: `translateX(${
                        sliderPosition *
                        ((sliderTrackRef.current?.getBoundingClientRect().width || 250) - 52)
                      }px)`,
                    }}
                    className="absolute left-1 top-1 bottom-1 w-11 bg-white rounded-xl shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing z-20 text-emerald-800 transition-transform duration-75"
                  >
                    <Bike className="w-5 h-5 text-emerald-600 animate-pulse" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
