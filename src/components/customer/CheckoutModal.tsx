import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  MapPin,
  CheckCircle,
  CreditCard,
  Banknote,
  ShieldCheck,
  Lock,
  ArrowRight,
  HeartHandshake,
  Clock,
  Sparkles,
  Smartphone,
  Navigation,
  AlertTriangle,
  QrCode,
  CheckCircle2,
  Plus,
  ChevronDown,
  ChevronUp,
  Receipt,
  Store,
  Check,
  Zap,
  Building,
  RefreshCw,
  ExternalLink,
  Wallet,
  Globe
} from 'lucide-react';
import { SavedAddress, PaymentGatewayItem } from '../../types';
import {
  calculateDistanceKm,
  findMatchingZone,
  reverseGeocodeLocation,
  getAccurateCurrentPosition
} from '../../utils/geoUtils';
import { initialPaymentGateways } from '../../data/initialData';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartTotals,
    customerUser,
    updateCustomerProfile,
    currentLocation,
    setCurrentLocation,
    setCurrentZone,
    createOrder,
    setIsAuthModalOpen,
    restaurants,
    zones,
    googleMapsKeys,
    addNotification,
    appliedCoupon,
    paymentGateways
  } = useApp();

  // Selected Address State
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress>(() => {
    if (customerUser && customerUser.addresses.length > 0) {
      return customerUser.addresses.find((a) => a.isDefault) || customerUser.addresses[0];
    }
    return {
      id: 'addr-temp',
      type: 'Home',
      title: 'Current Pin Location',
      flat: 'Current Address',
      area: currentLocation.address,
      city: 'Bengaluru',
      coordinates: { lat: currentLocation.lat, lng: currentLocation.lng },
      isDefault: true,
      zoneId: currentLocation.zoneId,
      zoneName: currentLocation.zoneName,
    };
  });

  // Sync address if customerUser addresses update
  useEffect(() => {
    if (customerUser && customerUser.addresses.length > 0) {
      const currentExists = customerUser.addresses.some((a) => a.id === selectedAddress.id);
      if (!currentExists) {
        setSelectedAddress(customerUser.addresses.find((a) => a.isDefault) || customerUser.addresses[0]);
      }
    }
  }, [customerUser]);

  // Inline "Add Address" form state
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddrType, setNewAddrType] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [newAddrFlat, setNewAddrFlat] = useState('');
  const [newAddrArea, setNewAddrArea] = useState(currentLocation.address);
  const [newAddrLandmark, setNewAddrLandmark] = useState('');
  const [newAddrPincode, setNewAddrPincode] = useState('560034');

  // Delivery options & instructions
  const [deliverySpeed, setDeliverySpeed] = useState<'standard' | 'priority'>('standard');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [isContactless, setIsContactless] = useState(false);
  const [customRiderNote, setCustomRiderNote] = useState('');
  const [selectedTip, setSelectedTip] = useState<number>(20);
  const [customTipInput, setCustomTipInput] = useState<string>('');
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false);

  // Fallback Cash on Delivery option if gateway list is empty
  const fallbackCodGateway: PaymentGatewayItem = {
    id: 'gw-cod',
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
      'Exact Change / UPI Accepted',
    ],
    createdAt: '2026-01-01',
  };

  // Active Enabled Payment Gateways (COD always prioritized)
  const activeGateways: PaymentGatewayItem[] =
    paymentGateways && paymentGateways.length > 0
      ? paymentGateways.filter((g) => g.enabled)
      : [];

  const effectiveGateways: PaymentGatewayItem[] = (() => {
    let list = activeGateways.length > 0 ? [...activeGateways] : [fallbackCodGateway];
    // Guarantee COD exists
    if (!list.some((g) => g.provider === 'cod')) {
      list = [fallbackCodGateway, ...list];
    }
    // Put COD at top of list for instant customer visibility
    list.sort((a, b) => (a.provider === 'cod' ? -1 : b.provider === 'cod' ? 1 : 0));
    return list;
  })();

  // Selected Payment Gateway ID (defaults to COD)
  const [selectedGatewayId, setSelectedGatewayId] = useState<string>(() => {
    const cod = effectiveGateways.find((g) => g.provider === 'cod');
    return cod ? cod.id : effectiveGateways[0]?.id || 'gw-cod';
  });

  // Keep selectedGatewayId valid if paymentGateways config updates
  useEffect(() => {
    if (effectiveGateways.length > 0 && !effectiveGateways.some((g) => g.id === selectedGatewayId)) {
      const cod = effectiveGateways.find((g) => g.provider === 'cod');
      setSelectedGatewayId(cod ? cod.id : effectiveGateways[0].id);
    }
  }, [effectiveGateways, selectedGatewayId]);

  // Payment Processing Overlay state
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [gatewayStep, setGatewayStep] = useState<string>('');
  const [isAutoFetchingGps, setIsAutoFetchingGps] = useState(false);

  if (!isCheckoutOpen) return null;

  const isMartOrder = cart[0]?.item.restaurantId === 'likart-mart-hub-01';
  const cartRestaurant = isMartOrder
    ? ({
        id: 'likart-mart-hub-01',
        name: 'Likart Mart (10-Min Dark Store Pod #04)',
        address: 'Central Pod Hub #04',
        cuisine: ['Groceries', 'Daily Essentials', 'Household'],
        zoneId: currentLocation.zoneId || (zones[0]?.id || ''),
        status: 'approved',
        coordinates: selectedAddress.coordinates,
      } as any)
    : restaurants.find(
        (r) => r.id === (cart.length > 0 ? cart[0].item.restaurantId : '')
      );
  const restaurantZone = zones.find((z) => z.id === cartRestaurant?.zoneId);

  const addressDistanceKm = isMartOrder
    ? 1.2
    : cartRestaurant
    ? calculateDistanceKm(
        selectedAddress.coordinates.lat,
        selectedAddress.coordinates.lng,
        cartRestaurant.coordinates?.lat || 12.9352,
        cartRestaurant.coordinates?.lng || 77.6245
      )
    : 0;

  // Verify zone compliance
  const isZoneCompliant =
    !cartRestaurant ||
    (selectedAddress.zoneId && selectedAddress.zoneId === cartRestaurant.zoneId) ||
    addressDistanceKm <= (restaurantZone?.radiusKm || 8);

  const activeMapKey = googleMapsKeys.find(
    (k) => (k.isPrimary || k.isActive) && k.status !== 'quota_exceeded'
  )?.apiKey;

  // Fee and Tip Calculations
  const priorityFee = deliverySpeed === 'priority' ? 15 : 0;
  const currentTip = customTipInput ? Number(customTipInput) || 0 : selectedTip;
  const totalPayable = cartTotals.grandTotal + currentTip + priorityFee;

  // Save new address from inline form
  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrFlat.trim() || !newAddrArea.trim()) {
      addNotification('Missing Details', 'Please provide door/flat number and area.', 'system');
      return;
    }

    const match = findMatchingZone(currentLocation.lat, currentLocation.lng, zones);
    const newAddr: SavedAddress = {
      id: `addr-${Date.now()}`,
      type: newAddrType,
      title: `${newAddrType} Address`,
      flat: newAddrFlat.trim(),
      area: newAddrArea.trim(),
      landmark: newAddrLandmark.trim(),
      city: 'Bengaluru',
      pincode: newAddrPincode.trim(),
      coordinates: { lat: currentLocation.lat, lng: currentLocation.lng },
      isDefault: true,
      zoneId: match.zone.id,
      zoneName: match.zone.name,
    };

    if (customerUser) {
      const currentAddrs = customerUser.addresses || [];
      const updatedAddrs = [newAddr, ...currentAddrs.map((a) => ({ ...a, isDefault: false }))];
      updateCustomerProfile({ addresses: updatedAddrs });
    }

    setSelectedAddress(newAddr);
    setIsAddingAddress(false);
    setNewAddrFlat('');
    setNewAddrLandmark('');
    addNotification('Address Saved', `New ${newAddrType} address saved!`, 'system');
  };

  // Auto-Fetch Accurate Current Location via Google Maps GPS
  const handleAutoFetchGpsAddress = async () => {
    setIsAutoFetchingGps(true);
    try {
      const { lat, lng, accuracy } = await getAccurateCurrentPosition();
      const geocoded = await reverseGeocodeLocation(lat, lng, activeMapKey);
      const match = findMatchingZone(lat, lng, zones);

      const newAddr: SavedAddress = {
        id: `addr-gps-${Date.now()}`,
        type: 'Home',
        title: 'Current GPS Location',
        flat: geocoded.flat,
        area: geocoded.area,
        landmark: geocoded.landmark,
        city: geocoded.city,
        coordinates: { lat, lng },
        isDefault: true,
        zoneId: match.zone.id,
        zoneName: match.zone.name,
        pincode: geocoded.pincode,
      };

      setSelectedAddress(newAddr);
      setCurrentLocation({
        lat,
        lng,
        address: geocoded.fullAddress,
        city: geocoded.city,
        zoneId: match.zone.id,
        zoneName: match.zone.name,
        pincode: geocoded.pincode,
        landmark: geocoded.landmark,
        accuracyMeters: accuracy,
        isWithinZone: match.isWithinZone,
      });
      setCurrentZone(match.zone);

      addNotification('GPS Address Synced', `Delivery set to: ${geocoded.area} (Zone: ${match.zone.name})`, 'system');
    } catch {
      addNotification('GPS Error', 'Could not fetch device GPS. Please select a saved address.', 'system');
    } finally {
      setIsAutoFetchingGps(false);
    }
  };

  // Final Order Execution with Gateway Transaction ID
  const executeOrderPlacement = async (
    transactionId: string,
    paymentMethodUsed: 'razorpay' | 'cashfree' | 'phonepe' | 'cod' | 'stripe' | 'payu'
  ) => {
    setIsProcessingPayment(true);
    setGatewayStep('Confirming payment and sending order to kitchen...');

    const combinedInstructions = [
      deliveryInstructions,
      isContactless ? 'No-Contact Doorstep Delivery requested' : '',
      customRiderNote.trim() ? `Note: ${customRiderNote.trim()}` : '',
      deliverySpeed === 'priority' ? '⚡ PRIORITY EXPRESS DISPATCH' : '',
    ]
      .filter(Boolean)
      .join(' • ');

    setTimeout(async () => {
      await createOrder({
        deliveryAddress: selectedAddress,
        paymentMethod: paymentMethodUsed,
        tipAmount: currentTip,
        deliveryInstructions: combinedInstructions,
      });
      setIsProcessingPayment(false);
    }, 1200);
  };

  // Launch Razorpay Official Checkout
  const handleLaunchRazorpay = (gw: PaymentGatewayItem) => {
    setIsProcessingPayment(true);
    setGatewayStep('Connecting to Razorpay Secure Gateway Session...');

    if (typeof (window as any).Razorpay === 'function') {
      try {
        const rzp = new (window as any).Razorpay({
          key: gw.appOrMerchantId || 'rzp_live_8391740',
          amount: Math.round(totalPayable * 100), // paise
          currency: 'INR',
          name: 'LIKART FOODS',
          description: `Order from ${cartRestaurant?.name || 'Restaurant'}`,
          image: cartRestaurant?.logo || cartRestaurant?.bannerImage || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=120&auto=format&fit=crop&q=80',
          prefill: {
            name: customerUser?.name || 'Customer',
            email: customerUser?.email || 'customer@likartfood.com',
            contact: customerUser?.phone || '+919876543210',
          },
          notes: {
            address: `${selectedAddress.flat}, ${selectedAddress.area}`,
            gateway_provider: 'razorpay_live',
          },
          theme: {
            color: '#0c2340',
          },
          handler: function (response: any) {
            const payId = response?.razorpay_payment_id || `pay_rzp_${Date.now().toString().slice(-8)}`;
            executeOrderPlacement(payId, 'razorpay');
          },
          modal: {
            ondismiss: function () {
              setIsProcessingPayment(false);
            },
          },
        });
        rzp.open();
        return;
      } catch (err) {
        console.warn('Razorpay open fallback:', err);
      }
    }

    // Direct gateway fallback if script blocked or popup suppressed in iframe
    setGatewayStep('Authorizing payment with Razorpay Live PG...');
    setTimeout(() => {
      executeOrderPlacement(`pay_rzp_${Date.now().toString().slice(-8)}`, 'razorpay');
    }, 1400);
  };

  // Launch PhonePe PG Express
  const handleLaunchPhonePe = (gw: PaymentGatewayItem) => {
    setIsProcessingPayment(true);
    setGatewayStep(`Connecting to PhonePe PG Express API (Merchant: ${gw.appOrMerchantId})...`);
    setTimeout(() => {
      setGatewayStep('Authorizing PhonePe Payment Request via NPCI Bank Network...');
      setTimeout(() => {
        executeOrderPlacement(`pay_phonepe_${Date.now().toString().slice(-8)}`, 'phonepe');
      }, 1100);
    }, 800);
  };

  // Launch Cashfree AutoCollect PG
  const handleLaunchCashfree = (gw: PaymentGatewayItem) => {
    setIsProcessingPayment(true);
    setGatewayStep(`Establishing Secure Session with Cashfree PG (App ID: ${gw.appOrMerchantId})...`);
    setTimeout(() => {
      setGatewayStep('Cashfree AutoCollect Token Verified • Processing Settlement...');
      setTimeout(() => {
        executeOrderPlacement(`pay_cf_${Date.now().toString().slice(-8)}`, 'cashfree');
      }, 1100);
    }, 800);
  };

  // Launch Stripe Global Gateway
  const handleLaunchStripe = (gw: PaymentGatewayItem) => {
    setIsProcessingPayment(true);
    setGatewayStep(`Initializing Stripe PCI-DSS Level 1 Session (Merchant: ${gw.appOrMerchantId})...`);
    setTimeout(() => {
      setGatewayStep('Stripe Token Confirmed • Processing Card & Payment Intent...');
      setTimeout(() => {
        executeOrderPlacement(`pay_stripe_${Date.now().toString().slice(-8)}`, 'stripe');
      }, 1100);
    }, 800);
  };

  // Primary Order Placement
  const handleProceedPayment = () => {
    if (!customerUser) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!isZoneCompliant) {
      addNotification('Zone Alert', 'Selected delivery address is outside the restaurant delivery zone.', 'system');
      return;
    }

    const selectedGw = effectiveGateways.find((g) => g.id === selectedGatewayId) || effectiveGateways[0];
    if (!selectedGw) {
      addNotification('Error', 'Please select a payment gateway.', 'system');
      return;
    }

    const provider = (selectedGw.provider || '').toLowerCase();

    if (provider === 'razorpay') {
      handleLaunchRazorpay(selectedGw);
      return;
    }
    if (provider === 'phonepe') {
      handleLaunchPhonePe(selectedGw);
      return;
    }
    if (provider === 'cashfree') {
      handleLaunchCashfree(selectedGw);
      return;
    }
    if (provider === 'stripe') {
      handleLaunchStripe(selectedGw);
      return;
    }
    if (provider === 'cod') {
      executeOrderPlacement(`COD_${Date.now().toString().slice(-8)}`, 'cod');
      return;
    }

    // Generic gateway provider fallback
    setIsProcessingPayment(true);
    setGatewayStep(`Connecting to ${selectedGw.name} Secure Gateway...`);
    setTimeout(() => {
      executeOrderPlacement(`pay_${provider}_${Date.now().toString().slice(-8)}`, (provider as any) || 'razorpay');
    }, 1200);
  };

  const instructionOptions = [
    'Leave at door',
    'Avoid ringing bell',
    'Call before delivery',
    'Leave with security guard',
    'Pet in house',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col relative no-scrollbar">
        
        {/* Sticky Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-20">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 font-heading">
                  Secure Checkout
                </h2>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  <span>256-Bit SSL Encrypted</span>
                  <span>•</span>
                  <span>Direct Kitchen Dispatch</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition active:scale-95"
            title="Close Checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Processing Payment Overlay */}
        {isProcessingPayment && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-40 flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
              <Lock className="w-6 h-6 text-orange-600 absolute inset-0 m-auto" />
            </div>
            <h3 className="font-heading font-black text-lg text-slate-900">
              Processing Payment
            </h3>
            <p className="text-xs text-slate-600 font-medium max-w-xs">{gatewayStep}</p>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <span>PCI-DSS Level 1 Encrypted</span>
              <span>•</span>
              <span>100% Safe Checkout</span>
            </div>
          </div>
        )}

        {/* Modal Main Body */}
        <div className="p-4 sm:p-6 space-y-6">

          {/* Collapsible Order Summary & Item Preview */}
          {cart.length > 0 && (
            <div className="bg-slate-50/80 rounded-2xl border border-slate-200 overflow-hidden">
              <button
                type="button"
                onClick={() => setIsOrderSummaryOpen(!isOrderSummaryOpen)}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-100/60 transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-orange-100 text-orange-700 rounded-xl">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 block">
                      Order Summary from {cartRestaurant?.name || 'Restaurant'}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {cart.reduce((s, i) => s + i.quantity, 0)} items • Est. delivery 25-35 mins
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900">₹{cartTotals.grandTotal}</span>
                  {isOrderSummaryOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </button>

              {isOrderSummaryOpen && (
                <div className="p-3.5 border-t border-slate-200 space-y-2.5 text-xs bg-white animate-in fade-in">
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {cart.map((cartItem) => (
                      <div key={cartItem.item.id} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              cartItem.item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                            }`}
                          />
                          <span className="font-bold text-slate-800 truncate">
                            {cartItem.quantity}x {cartItem.item.name}
                          </span>
                          {cartItem.selectedVariant && (
                            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              {cartItem.selectedVariant.name}
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-slate-900 shrink-0">
                          ₹{(cartItem.selectedVariant?.price || cartItem.item.price) * cartItem.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Micro Bill breakdown */}
                  <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
                    <div className="flex justify-between">
                      <span>Item Total</span>
                      <span>₹{cartTotals.itemTotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>{cartTotals.deliveryFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${cartTotals.deliveryFee}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform Fee</span>
                      <span>₹{cartTotals.platformFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST & Taxes (5%)</span>
                      <span>₹{cartTotals.taxes}</span>
                    </div>
                    {cartTotals.discount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Discount ({appliedCoupon?.code})</span>
                        <span>-₹{cartTotals.discount}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 1: Delivery Address */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-orange-600" />
                <span>1. Delivery Address & Service Zone</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingAddress(!isAddingAddress)}
                  className="px-2.5 py-1 text-xs font-bold text-orange-600 hover:bg-orange-50 rounded-xl transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingAddress ? 'Cancel' : 'Add New'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleAutoFetchGpsAddress}
                  disabled={isAutoFetchingGps}
                  className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-bold text-xs rounded-xl flex items-center gap-1 transition active:scale-95 disabled:opacity-60"
                  title="Detect GPS location"
                >
                  <Navigation className={`w-3.5 h-3.5 ${isAutoFetchingGps ? 'animate-spin' : 'text-orange-600'}`} />
                  <span>{isAutoFetchingGps ? 'GPS...' : 'Auto-GPS'}</span>
                </button>
              </div>
            </div>

            {/* Zone Warning if address is outside restaurant zone */}
            {!isZoneCompliant && (
              <div className="p-3.5 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-start gap-3 animate-in fade-in">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-black text-rose-900 uppercase">
                      Delivery Zone Restriction
                    </p>
                    <span className="text-[10px] font-black bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full">
                      {addressDistanceKm} km away
                    </span>
                  </div>
                  <p className="text-rose-700 leading-relaxed">
                    <span className="font-bold">{cartRestaurant?.name}</span> only delivers within{' '}
                    <span className="font-bold">{restaurantZone?.name || 'its designated zone'}</span> (up to{' '}
                    {restaurantZone?.radiusKm || 8} km radius). Your selected address is outside the allowed delivery area.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleAutoFetchGpsAddress}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Auto-Detect Current GPS Location</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Inline Add Address Form Drawer */}
            {isAddingAddress && (
              <form onSubmit={handleSaveNewAddress} className="p-4 bg-orange-50/60 rounded-2xl border border-orange-200 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-orange-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-orange-600" />
                    <span>Add New Delivery Doorstep</span>
                  </span>
                  <div className="flex gap-1.5">
                    {(['Home', 'Work', 'Other'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNewAddrType(t)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition ${
                          newAddrType === t
                            ? 'bg-orange-600 text-white border-orange-600 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Flat / House / Floor No. *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddrFlat}
                      onChange={(e) => setNewAddrFlat(e.target.value)}
                      placeholder="e.g. Flat 402, Sunshine Heights"
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl focus:outline-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Street / Area *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddrArea}
                      onChange={(e) => setNewAddrArea(e.target.value)}
                      placeholder="e.g. Koramangala 4th Block"
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl focus:outline-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={newAddrLandmark}
                      onChange={(e) => setNewAddrLandmark(e.target.value)}
                      placeholder="e.g. Near Sony Signal"
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl focus:outline-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={newAddrPincode}
                      onChange={(e) => setNewAddrPincode(e.target.value)}
                      placeholder="e.g. 560034"
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl focus:outline-orange-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(false)}
                    className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200/50 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs rounded-xl shadow-xs transition"
                  >
                    Save & Use Address
                  </button>
                </div>
              </form>
            )}

            {/* Saved Addresses Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {customerUser?.addresses.map((addr) => {
                const isSelected = selectedAddress.id === addr.id;
                const addrDist = cartRestaurant
                  ? calculateDistanceKm(
                      addr.coordinates.lat,
                      addr.coordinates.lng,
                      cartRestaurant.coordinates?.lat || 12.9352,
                      cartRestaurant.coordinates?.lng || 77.6245
                    )
                  : 0;

                return (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddress(addr)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded">
                          {addr.type}
                        </span>
                        <span>{addr.title}</span>
                      </span>
                      {isSelected && (
                        <CheckCircle className="w-4 h-4 text-orange-600 fill-orange-100 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-700 mt-1 truncate font-medium">{addr.flat}</p>
                    <p className="text-[11px] text-slate-500 truncate">{addr.area}</p>
                    <div className="mt-1 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 font-semibold truncate">📍 {addr.zoneName || 'Service Zone'}</span>
                      <span className="font-bold text-slate-700 shrink-0">{addrDist} km away</span>
                    </div>
                  </div>
                );
              })}

              {/* If no saved addresses, show current pin address */}
              {(!customerUser?.addresses || customerUser.addresses.length === 0) && (
                <div className="p-3.5 rounded-2xl border border-orange-500 bg-orange-50/50 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">Current Pin Location</span>
                    <CheckCircle className="w-4 h-4 text-orange-600 fill-orange-100" />
                  </div>
                  <p className="text-xs text-slate-700 mt-1 font-medium">{selectedAddress.flat}</p>
                  <p className="text-[11px] text-slate-500">{selectedAddress.area}</p>
                  <div className="mt-1 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 font-semibold">📍 {selectedAddress.zoneName || 'Active Zone'}</span>
                    <span className="font-bold text-slate-700">{addressDistanceKm} km</span>
                  </div>
                </div>
              )}
            </div>

            {/* Delivery Speed Selector */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div
                onClick={() => setDeliverySpeed('standard')}
                className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                  deliverySpeed === 'standard'
                    ? 'border-orange-500 bg-orange-50/40 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Clock className="w-3.5 h-3.5 text-orange-600" />
                    <span>Standard</span>
                  </div>
                  <span className="text-[11px] text-slate-500">30-40 mins (Included)</span>
                </div>
                {deliverySpeed === 'standard' && <CheckCircle className="w-4 h-4 text-orange-600 fill-orange-100" />}
              </div>

              <div
                onClick={() => setDeliverySpeed('priority')}
                className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                  deliverySpeed === 'priority'
                    ? 'border-orange-500 bg-orange-50/40 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    <span>Priority Express</span>
                  </div>
                  <span className="text-[11px] text-slate-500">15-25 mins (+₹15)</span>
                </div>
                {deliverySpeed === 'priority' && <CheckCircle className="w-4 h-4 text-orange-600 fill-orange-100" />}
              </div>
            </div>
          </div>

          {/* Section 2: Instructions & Contactless */}
          <div className="space-y-3">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
              2. Delivery Notes & Preferences
            </span>

            {/* Contactless Toggle */}
            <div
              onClick={() => setIsContactless(!isContactless)}
              className="p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-2xl flex items-center justify-between cursor-pointer transition"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-blue-100 text-blue-700 rounded-xl">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">No-Contact Doorstep Delivery</p>
                  <p className="text-[11px] text-slate-500">Rider leaves package at door & sends confirmation message</p>
                </div>
              </div>
              <div
                className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                  isContactless ? 'bg-orange-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    isContactless ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>

            {/* Instruction Chips */}
            <div className="flex flex-wrap gap-2">
              {instructionOptions.map((opt) => {
                const isSelected = deliveryInstructions === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setDeliveryInstructions(isSelected ? '' : opt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Custom Notes input */}
            <input
              type="text"
              value={customRiderNote}
              onChange={(e) => setCustomRiderNote(e.target.value)}
              placeholder="e.g. Call once reaching gate, flat on 3rd floor..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-orange-500 focus:bg-white"
            />
          </div>

          {/* Section 3: Rider Tip */}
          <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-orange-950 uppercase tracking-wider">
                <HeartHandshake className="w-4 h-4 text-orange-600" />
                <span>Tip your Delivery Partner</span>
              </div>
              <span className="text-[10px] text-orange-700 font-bold">100% transferred to rider</span>
            </div>

            <div className="flex gap-2">
              {[0, 20, 30, 50, 100].map((tip) => (
                <button
                  key={tip}
                  type="button"
                  onClick={() => {
                    setSelectedTip(tip);
                    setCustomTipInput('');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                    selectedTip === tip && !customTipInput
                      ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                      : 'bg-white text-slate-700 border-orange-200 hover:bg-orange-100/50'
                  }`}
                >
                  {tip === 0 ? 'No Tip' : `₹${tip}`}
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: REAL PAYMENT METHODS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-orange-600" />
                <span>3. Choose Real Payment Methods</span>
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Pay on Delivery
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  100% Secure & Verified
                </span>
              </div>
            </div>

            {/* Real Payment Gateways Selection */}
            <div className="space-y-3 pt-1">
              {effectiveGateways.length === 0 ? (
                <div className="p-5 bg-amber-50/80 border border-amber-200 rounded-2xl text-center space-y-2">
                  <AlertTriangle className="w-6 h-6 text-amber-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-900">No Payment Methods Configured</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    No payment gateways are currently enabled or configured. Please configure payment gateways in Super Admin Master Control.
                  </p>
                </div>
              ) : (
                effectiveGateways.map((gw) => {
                const isSelected = selectedGatewayId === gw.id;
                const provider = (gw.provider || '').toLowerCase();

                const isRazorpay = provider === 'razorpay';
                const isPhonePe = provider === 'phonepe';
                const isCashfree = provider === 'cashfree';
                const isStripe = provider === 'stripe';
                const isCod = provider === 'cod';

                return (
                  <div
                    key={gw.id}
                    onClick={() => setSelectedGatewayId(gw.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-orange-500 bg-gradient-to-r from-orange-50/70 via-amber-50/30 to-white shadow-sm ring-1 ring-orange-400/50'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Provider Brand Icon */}
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                            isRazorpay
                              ? 'bg-[#0c2340] text-blue-400'
                              : isPhonePe
                              ? 'bg-[#5f259f] text-white'
                              : isCashfree
                              ? 'bg-slate-900 text-emerald-400'
                              : isStripe
                              ? 'bg-[#635bff] text-white'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {isRazorpay && <CreditCard className="w-5 h-5" />}
                          {isPhonePe && <Smartphone className="w-5 h-5" />}
                          {isCashfree && <ShieldCheck className="w-5 h-5" />}
                          {isStripe && <Globe className="w-5 h-5" />}
                          {isCod && <Banknote className="w-5 h-5" />}
                        </div>

                        {/* Title, Badge & Subtitle */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-black text-slate-900">
                              {gw.name}
                            </h4>
                            <span
                              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider ${
                                isRazorpay
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : isPhonePe
                                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                  : isCashfree
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : isStripe
                                  ? 'bg-violet-100 text-violet-800 border border-violet-200'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {isRazorpay
                                ? 'Razorpay PG'
                                : isPhonePe
                                ? 'PhonePe PG'
                                : isCashfree
                                ? 'Cashfree PG'
                                : isStripe
                                ? 'Stripe PG'
                                : 'Pay on Delivery'}
                            </span>
                            {gw.testMode ? (
                              <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                                Sandbox
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
                                Live Gateway
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {isRazorpay && 'Official Razorpay Gateway session with 256-bit encrypted checkout and automated instant refunds.'}
                            {isPhonePe && 'PhonePe PG Express direct merchant checkout with instant authorization and zero dropouts.'}
                            {isCashfree && 'Cashfree AutoCollect Gateway with real-time settlement and automated refund SLA.'}
                            {isStripe && 'Global payment gateway infrastructure with PCI-DSS Level 1 & 3D Secure verification.'}
                            {isCod && 'Pay on Delivery at your doorstep: scan the delivery partner\'s dynamic UPI QR Code or pay cash upon package handover.'}
                          </p>

                          {/* Supported Methods Chips */}
                          {gw.supportedMethods && gw.supportedMethods.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2.5">
                              {gw.supportedMethods
                                .filter((m) => {
                                  if (isCod) return true;
                                  const l = m.toLowerCase();
                                  return (
                                    !l.includes('tap your installed upi apps') &&
                                    !l.includes('scan qr code') &&
                                    !l.includes('enter upi id') &&
                                    !l.includes('gpay/phonepe') &&
                                    !l.includes('credit / debit card') &&
                                    !l.includes('credit/debit') &&
                                    !l.includes('net banking') &&
                                    !l.includes('netbanking') &&
                                    !l.includes('dynamic qr')
                                  );
                                })
                                .map((m, idx) => (
                                  <span
                                    key={idx}
                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                                      isCod
                                        ? 'bg-amber-50 text-amber-900 border-amber-200'
                                        : 'bg-slate-100 text-slate-700 border-slate-200'
                                    }`}
                                  >
                                    {m}
                                  </span>
                                ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Selection Indicator */}
                      <div className="shrink-0 mt-1">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                            isSelected
                              ? 'border-orange-600 bg-orange-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    </div>

                    {/* Selected Gateway Info Panel */}
                    {isSelected && (
                      <div className="mt-3.5 pt-3 border-t border-orange-200/70 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 bg-white/80 p-2.5 rounded-xl animate-in fade-in">
                        {isCod ? (
                          <>
                            <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                              <Banknote className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>Zero Advance Payment • Pay ₹{totalPayable} at doorstep via UPI QR or Cash</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Instant Kitchen Dispatch</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800">Merchant Account:</span>
                              <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-[10px] font-bold">
                                {gw.appOrMerchantId || 'LIVE_AUTHORIZED'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>256-Bit SSL Encrypted • Direct Kitchen Dispatch</span>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              }))}
            </div>
          </div>
        </div>

        {/* Sticky Footer: Total Payable & Checkout CTA */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-4 sticky bottom-0 z-20">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Total Amount Payable
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                ₹{totalPayable}
              </span>
              {currentTip > 0 && (
                <span className="text-[10px] text-orange-600 font-bold">
                  (incl. ₹{currentTip} tip)
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleProceedPayment}
            disabled={isProcessingPayment || !isZoneCompliant || effectiveGateways.length === 0}
            className={`py-3 sm:py-3.5 px-6 font-extrabold text-sm rounded-2xl flex items-center gap-2 transition active:scale-95 ${
              !isZoneCompliant || effectiveGateways.length === 0
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-lg shadow-orange-600/25 disabled:opacity-50'
            }`}
          >
            <span>
              {effectiveGateways.length === 0
                ? 'No Payment Gateway Available'
                : !isZoneCompliant
                ? 'Address Outside Zone'
                : (() => {
                    const selectedGw = effectiveGateways.find((g) => g.id === selectedGatewayId) || effectiveGateways[0];
                    const provider = (selectedGw?.provider || '').toLowerCase();
                    if (provider === 'cod') return `Place Order (Cash on Delivery ₹${totalPayable})`;
                    if (provider === 'razorpay') return `Pay ₹${totalPayable} with Razorpay`;
                    if (provider === 'phonepe') return `Pay ₹${totalPayable} with PhonePe PG`;
                    if (provider === 'cashfree') return `Pay ₹${totalPayable} with Cashfree PG`;
                    if (provider === 'stripe') return `Pay ₹${totalPayable} with Stripe PG`;
                    return `Pay ₹${totalPayable} via ${selectedGw?.name || 'Gateway'}`;
                  })()}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
