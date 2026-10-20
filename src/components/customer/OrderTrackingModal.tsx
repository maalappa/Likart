import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useApp } from '../../context/AppContext';
import { LiveMap } from '../common/LiveMap';
import {
  X,
  Clock,
  Phone,
  CheckCircle,
  AlertCircle,
  Bike,
  ShieldCheck,
  ChevronRight,
  HelpCircle,
  RotateCcw,
  QrCode,
  Banknote,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { OrderStatus } from '../../types';
import { playPaymentSuccessSound } from '../../utils/soundUtils';

export const OrderTrackingModal: React.FC = () => {
  const {
    isTrackingModalOpen,
    setIsTrackingModalOpen,
    activeTrackingOrderId,
    orders,
    cancelOrder,
    markOrderAsPaid,
    setIsSupportModalOpen,
    restaurants,
    deliveryPartners
  } = useApp();

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('Placed order by mistake');
  const [showCustomerQr, setShowCustomerQr] = useState(false);
  const [customerQrDataUrl, setCustomerQrDataUrl] = useState<string>('');
  const [isProcessingCustomerPay, setIsProcessingCustomerPay] = useState(false);

  const currentOrder =
    orders.find((o) => o.id === activeTrackingOrderId) || orders[0];

  useEffect(() => {
    if (
      isTrackingModalOpen &&
      currentOrder &&
      currentOrder.paymentMethod === 'cod' &&
      currentOrder.paymentStatus !== 'completed'
    ) {
      const upiPayload = `upi://pay?pa=likart.food@okaxis&pn=${encodeURIComponent(
        'Likart Food Delivery'
      )}&am=${currentOrder.totalAmount}&cu=INR&tn=${encodeURIComponent(
        `Order ${currentOrder.id} Doorstep Pay`
      )}&tr=${currentOrder.id}`;

      QRCode.toDataURL(upiPayload, {
        width: 260,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setCustomerQrDataUrl(url))
        .catch((err) => console.error('QR code generation error:', err));
    }
  }, [
    isTrackingModalOpen,
    currentOrder?.id,
    currentOrder?.totalAmount,
    currentOrder?.paymentMethod,
    currentOrder?.paymentStatus,
  ]);

  if (!isTrackingModalOpen || !currentOrder) return null;

  const restaurant = restaurants.find((r) => r.id === currentOrder.restaurantId);
  const rider = deliveryPartners.find((d) => d.id === currentOrder.deliveryPartnerId);

  const stages: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'placed', label: 'Order Placed', desc: 'Payment verified & sent to restaurant' },
    { key: 'confirmed', label: 'Restaurant Accepted', desc: 'Order confirmed by kitchen' },
    { key: 'preparing', label: 'Cooking Your Meal', desc: 'Chef preparing fresh dishes' },
    { key: 'ready_for_pickup', label: 'Food Packed', desc: 'Hygiene sealed and ready for rider' },
    { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Rider is on the way to your door' },
    { key: 'delivered', label: 'Delivered', desc: 'Enjoy your hot meal!' },
  ];

  const getStageIndex = (status: OrderStatus) => {
    switch (status) {
      case 'placed':
        return 0;
      case 'confirmed':
        return 1;
      case 'preparing':
        return 2;
      case 'ready_for_pickup':
        return 3;
      case 'rider_assigned':
      case 'out_for_delivery':
        return 4;
      case 'delivered':
        return 5;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const currentStageIndex = getStageIndex(currentOrder.status);

  const handleConfirmCancel = () => {
    cancelOrder(currentOrder.id, cancelReason);
    setShowCancelDialog(false);
  };

  const handleCustomerSimulatePay = () => {
    if (isProcessingCustomerPay) return;
    setIsProcessingCustomerPay(true);
    setTimeout(() => {
      const txnId = `UPI-CUST-${Math.floor(100000000000 + Math.random() * 900000000000)}`;
      playPaymentSuccessSound(currentOrder.totalAmount);
      markOrderAsPaid(currentOrder.id, 'upi_qr', txnId);
      setIsProcessingCustomerPay(false);
      setShowCustomerQr(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/65 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                Order #{currentOrder.id}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {currentOrder.restaurantName}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 font-heading mt-0.5">
              Live Order & GPS Tracking
            </h2>
          </div>
          <button
            onClick={() => setIsTrackingModalOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Live Map Tracking Canvas */}
          <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-200">
            <LiveMap
              centerLat={currentOrder.deliveryAddress.coordinates.lat}
              centerLng={currentOrder.deliveryAddress.coordinates.lng}
              height="260px"
              showRoute={currentOrder.status !== 'cancelled' && currentOrder.status !== 'delivered'}
              restaurantCoords={{
                lat: 12.9348,
                lng: 77.625,
                name: currentOrder.restaurantName,
              }}
              customerCoords={{
                lat: currentOrder.deliveryAddress.coordinates.lat,
                lng: currentOrder.deliveryAddress.coordinates.lng,
                address: currentOrder.deliveryAddress.flat,
              }}
              riderCoords={{
                lat: 12.934,
                lng: 77.626,
                name: currentOrder.deliveryPartnerName || 'Rider',
              }}
            />
          </div>

          {/* OTP Verification Pill & ETA Banner */}
          {currentOrder.status !== 'delivered' && currentOrder.status !== 'cancelled' ? (
            <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 rounded-2xl p-4 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 backdrop-blur-xs rounded-xl">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-orange-100 uppercase tracking-wider">
                    Estimated Arrival in
                  </p>
                  <p className="text-xl font-black font-heading">
                    18-24 Minutes
                  </p>
                </div>
              </div>

              {/* Delivery OTP */}
              <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30 text-center">
                <p className="text-[10px] uppercase tracking-wider font-extrabold text-orange-100">
                  Delivery OTP
                </p>
                <p className="text-2xl font-black tracking-widest font-mono text-white">
                  {currentOrder.deliveryOtp}
                </p>
                <p className="text-[9px] text-white/80">Give to rider upon arrival</p>
              </div>
            </div>
          ) : currentOrder.status === 'delivered' ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-black">Order Delivered Successfully!</p>
                <p className="text-xs text-emerald-700">Hope you loved your feast. Rate your experience below.</p>
              </div>
            </div>
          ) : (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-900 flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-black">
                  {currentOrder.rejectedByRestaurant ? 'Order Rejected by Restaurant' : 'Order Cancelled'}
                </p>
                <p className="text-xs text-rose-700 font-medium">
                  {currentOrder.restaurantRejectionReason || currentOrder.cancellationReason || 'The kitchen was unable to fulfill this order.'}
                </p>
                <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-md mt-1">
                  <span>✓ 100% Refund (₹{currentOrder.totalAmount}) Initiated to {currentOrder.paymentMethod.toUpperCase()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Pay on Delivery Status Notification for Customer */}
          {currentOrder.paymentMethod === 'cod' && currentOrder.status !== 'cancelled' && (
            <div
              className={`p-4 rounded-2xl border ${
                currentOrder.paymentStatus === 'completed'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50/90 border-amber-300 text-amber-900'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    currentOrder.paymentStatus === 'completed'
                      ? 'bg-emerald-200 text-emerald-800'
                      : 'bg-amber-200 text-amber-800'
                  }`}
                >
                  {currentOrder.paymentStatus === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-700" />
                  ) : (
                    <QrCode className="w-5 h-5 text-amber-800" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-black uppercase tracking-wider">
                      {currentOrder.paymentStatus === 'completed'
                        ? 'Pay on Delivery • Verified ✓'
                        : 'Pay on Delivery • Doorstep Payment'}
                    </h4>
                    <span className="font-mono font-bold text-xs bg-white/70 px-2 py-0.5 rounded-md border border-amber-200">
                      ₹{currentOrder.totalAmount}
                    </span>
                  </div>
                  <p className="text-[11px] mt-1 leading-relaxed opacity-90">
                    {currentOrder.paymentStatus === 'completed'
                      ? `Payment of ₹${currentOrder.totalAmount} verified via ${
                          currentOrder.paymentCollectedMethod === 'cash' ? 'Cash' : 'Dynamic UPI QR Code'
                        } (Txn: ${currentOrder.transactionId || 'SUCCESS'}). Share your delivery OTP with the rider to receive your food.`
                      : `Please keep ₹${currentOrder.totalAmount} ready. When your delivery partner arrives, scan the dynamic UPI QR code on their screen or pay cash.`}
                  </p>

                  {/* If not paid yet, offer QR Code button */}
                  {currentOrder.paymentStatus !== 'completed' && (
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => setShowCustomerQr(!showCustomerQr)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-xl shadow-xs transition active:scale-95"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>{showCustomerQr ? 'Hide Payment QR Code' : 'View / Scan UPI QR Code'}</span>
                        {showCustomerQr ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {showCustomerQr && (
                        <div className="mt-3 p-4 bg-white rounded-2xl border border-amber-200 text-center shadow-md animate-in fade-in">
                          <p className="text-xs font-black text-slate-800">
                            Scan with Any UPI App to Pay ₹{currentOrder.totalAmount}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Google Pay • PhonePe • Paytm • BHIM • CRED
                          </p>

                          <div className="my-3 inline-block p-2 bg-white rounded-2xl border-2 border-slate-900 shadow-md">
                            {customerQrDataUrl ? (
                              <img
                                src={customerQrDataUrl}
                                alt="Payment QR"
                                className="w-44 h-44 rounded-lg object-contain mx-auto"
                              />
                            ) : (
                              <div className="w-44 h-44 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                                Generating QR...
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center justify-center gap-2">
                            <button
                              type="button"
                              disabled={isProcessingCustomerPay}
                              onClick={handleCustomerSimulatePay}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-xs transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{isProcessingCustomerPay ? 'Verifying...' : 'Pay ₹' + currentOrder.totalAmount + ' via UPI'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Delivery Partner Details */}
          {rider && currentOrder.status !== 'cancelled' && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={rider.avatar}
                  alt={rider.name}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-orange-500/30"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-black text-slate-900">{rider.name}</p>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                      ★ {rider.rating}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Vaccinated • {rider.kyc.vehicleType} ({rider.kyc.vehicleNumber})
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <a
                  href={`tel:${rider.phone}`}
                  className="p-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl shadow-xs transition"
                  title="Call Delivery Partner"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          {/* Order Lifecycle Progress Timeline */}
          {currentOrder.status !== 'cancelled' && (
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4">
                Order Lifecycle Status
              </h3>
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {stages.map((stage, idx) => {
                  const isDone = currentStageIndex >= idx;
                  const isCurrent = currentStageIndex === idx;

                  return (
                    <div key={stage.key} className="relative flex items-start gap-3">
                      <div
                        className={`absolute -left-6 w-4 h-4 rounded-full border-2 transition ${
                          isDone
                            ? 'bg-orange-600 border-white ring-2 ring-orange-500'
                            : 'bg-white border-slate-300'
                        } ${isCurrent ? 'animate-ping' : ''}`}
                      />

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p
                            className={`text-xs font-bold ${
                              isDone ? 'text-slate-900' : 'text-slate-400'
                            }`}
                          >
                            {stage.label}
                          </p>
                          {isCurrent && (
                            <span className="text-[10px] text-orange-600 font-extrabold uppercase bg-orange-50 px-2 py-0.5 rounded">
                              Current Step
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{stage.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Order Items Breakdown */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2">
              Items in this Order
            </h4>
            {currentOrder.items.map((it, idx) => (
              <div key={idx} className="flex justify-between text-xs text-slate-700">
                <span>
                  {it.quantity}x {it.name}
                </span>
                <span className="font-bold">₹{it.price * it.quantity}</span>
              </div>
            ))}
            <div className="border-t border-slate-200 pt-2 flex justify-between text-xs font-black text-slate-900">
              <span>
                {currentOrder.paymentMethod === 'cod'
                  ? currentOrder.paymentStatus === 'completed'
                    ? `Paid via Pay on Delivery (${
                        currentOrder.paymentCollectedMethod === 'cash' ? 'Cash' : 'UPI QR'
                      })`
                    : 'Pay on Delivery (Doorstep UPI QR / Cash)'
                  : `Total Paid via ${currentOrder.paymentMethod.toUpperCase()}`}
              </span>
              <span>₹{currentOrder.totalAmount}</span>
            </div>
          </div>

          {/* Cancel Order / Support Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            {currentOrder.status !== 'delivered' && currentOrder.status !== 'cancelled' && (
              <button
                onClick={() => setShowCancelDialog(true)}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold underline"
              >
                Cancel Order & Request Refund
              </button>
            )}

            <button
              onClick={() => {
                setIsTrackingModalOpen(false);
                setIsSupportModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-bold ml-auto"
            >
              <HelpCircle className="w-4 h-4 text-orange-500" />
              <span>Need Help with Order?</span>
            </button>
          </div>

          {/* Cancel confirmation dialog */}
          {showCancelDialog && (
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 space-y-3">
              <h4 className="text-xs font-black text-rose-900 uppercase">
                Confirm Order Cancellation
              </h4>
              <p className="text-xs text-rose-700">
                Please select a cancellation reason. A full refund of ₹{currentOrder.totalAmount} will be immediately processed.
              </p>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-rose-300 rounded-xl focus:outline-rose-500"
              >
                <option value="Placed order by mistake">Placed order by mistake</option>
                <option value="Delivery time is too long">Delivery time is too long</option>
                <option value="Want to change delivery address">Want to change delivery address</option>
                <option value="Ordered duplicate items">Ordered duplicate items</option>
              </select>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowCancelDialog(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleConfirmCancel}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Yes, Cancel & Refund
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
