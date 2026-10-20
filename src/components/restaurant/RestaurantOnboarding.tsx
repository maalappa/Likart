import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LiveMap } from '../common/LiveMap';
import { DocumentUploadCard } from '../common/DocumentUploadCard';
import { PhotoUploadInput } from '../common/PhotoUploadInput';
import {
  Store,
  MapPin,
  FileCheck,
  Building,
  Upload,
  CheckCircle,
  ArrowRight,
  ShieldAlert,
  ArrowLeft,
  Camera,
  ShieldCheck,
  Navigation,
  Clock,
} from 'lucide-react';
import { getDefaultSchedule, formatTime12h } from '../../utils/timeUtils';

interface RestaurantOnboardingProps {
  onBackToCustomer: () => void;
  onGoToDashboard: () => void;
}

export const RestaurantOnboarding: React.FC<RestaurantOnboardingProps> = ({
  onBackToCustomer,
  onGoToDashboard,
}) => {
  const { registerRestaurant, zones, cuisines, addNotification } = useApp();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    cuisine: '',
    priceForTwo: 350,
    openingTime: '09:00',
    closingTime: '23:00',
    address: '',
    zoneId: zones[0]?.id || 'zone-1',
    lat: 12.9716,
    lng: 77.5946,
    pureVeg: false,
    bannerImage: '',
    logo: '',
    // KYC & Government IDs
    fssaiNumber: '',
    gstinNumber: '',
    udyamNumber: '',
    panNumber: '',
    aadhaarNumber: '',
    // Uploaded Documents
    restaurantPhotoUrl: '',
    restaurantPhotoName: '',
    fssaiDocUrl: '',
    fssaiDocName: '',
    gstDocUrl: '',
    gstDocName: '',
    udyamDocUrl: '',
    udyamDocName: '',
    panDocUrl: '',
    panDocName: '',
    aadhaarDocUrl: '',
    aadhaarDocName: '',
    // Bank
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    accountHolderName: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFetchingGps, setIsFetchingGps] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<string | null>(null);

  const handleAutoFetchLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsFetchingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const fetchedLat = Number(pos.coords.latitude.toFixed(4));
        const fetchedLng = Number(pos.coords.longitude.toFixed(4));
        const accuracy = pos.coords.accuracy ? Math.round(pos.coords.accuracy) : 10;
        setIsFetchingGps(false);
        setGpsAccuracy(`±${accuracy}m GPS Accuracy`);

        let closestZone = zones[0];
        let minDist = Number.MAX_VALUE;
        zones.forEach((z) => {
          const dist = Math.hypot(z.center.lat - fetchedLat, z.center.lng - fetchedLng);
          if (dist < minDist) {
            minDist = dist;
            closestZone = z;
          }
        });

        setFormData((prev) => ({
          ...prev,
          lat: fetchedLat,
          lng: fetchedLng,
          zoneId: closestZone ? closestZone.id : prev.zoneId,
          address: `Outlet Point (${fetchedLat}, ${fetchedLng}), ${closestZone ? closestZone.name : 'Bengaluru'}`,
        }));
        addNotification('Location Detected', `Auto-detected location (${fetchedLat}, ${fetchedLng}) in ${closestZone?.name || 'delivery zone'}`, 'system');
      },
      () => {
        setIsFetchingGps(false);
        setGpsAccuracy('GPS Ready (Default Metro Anchor)');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = formData.phone.replace(/\D/g, '').slice(-10);
    const cleanPhone = cleanDigits.length === 10 ? `+91 ${cleanDigits}` : formData.phone.trim();
    const cleanEmail = formData.email.trim().toLowerCase();

    registerRestaurant({
      name: formData.name.trim(),
      ownerName: formData.ownerName.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password: formData.password.trim() || 'chef123',
      cuisine: formData.cuisine.split(',').map((c) => c.trim()),
      deliveryTimeMins: 30,
      priceForTwo: Number(formData.priceForTwo),
      logo: formData.logo,
      bannerImage: formData.bannerImage,
      address: formData.address,
      coordinates: { lat: formData.lat, lng: formData.lng },
      zoneId: formData.zoneId,
      isOpen: true,
      openingTime: formData.openingTime || '09:00',
      closingTime: formData.closingTime || '23:00',
      autoOpenClose: true,
      schedule: getDefaultSchedule(formData.openingTime || '09:00', formData.closingTime || '23:00'),
      commissionRate: 15,
      kyc: {
        fssaiNumber: formData.fssaiNumber,
        fssaiDocUrl: formData.fssaiDocUrl,
        gstinNumber: formData.gstinNumber,
        gstDocUrl: formData.gstDocUrl,
        udyamNumber: formData.udyamNumber,
        udyamDocUrl: formData.udyamDocUrl,
        panNumber: formData.panNumber,
        panDocUrl: formData.panDocUrl,
        aadhaarNumber: formData.aadhaarNumber,
        aadhaarDocUrl: formData.aadhaarDocUrl,
        restaurantPhotoUrl: formData.restaurantPhotoUrl,
        bankAccount: {
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode,
          bankName: formData.bankName,
          accountHolderName: formData.accountHolderName,
        },
        verified: false,
      },
      offers: ['20% OFF on all orders'],
      pureVeg: formData.pureVeg,
    });

    setIsSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Top navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBackToCustomer}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customer Portal</span>
        </button>

        <button
          onClick={onGoToDashboard}
          className="text-xs font-bold text-orange-600 hover:underline"
        >
          Go to Active Restaurant Dashboard →
        </button>
      </div>

      {isSubmitted ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-lg space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black font-heading text-slate-900">
            Restaurant Onboarding Application Submitted!
          </h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Your documents (FSSAI: {formData.fssaiNumber}, GSTIN: {formData.gstinNumber}) and bank verification are currently under review by the Super Admin. You will receive an SMS and email notification upon approval.
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={onGoToDashboard}
              className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              Open Restaurant Live Dashboard
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-md">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 p-6 sm:p-8 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Store className="w-5 h-5 text-emerald-300" />
              <span className="text-xs font-black uppercase tracking-wider text-emerald-200">
                PARTNER WITH LIKART FOOD
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-heading">
              Restaurant Partner Onboarding & Registration
            </h2>
            <p className="text-xs text-slate-200 mt-1 max-w-xl">
              Grow your food business with thousands of foodies across Bengaluru. Simple onboarding, low commission, and weekly payouts.
            </p>

            {/* Stepper */}
            <div className="flex gap-2 mt-6">
              {[
                { s: 1, label: 'Restaurant Info' },
                { s: 2, label: 'Location & Map' },
                { s: 3, label: 'KYC & FSSAI' },
                { s: 4, label: 'Bank Details' },
              ].map((st) => (
                <div
                  key={st.s}
                  onClick={() => setStep(st.s)}
                  className={`flex-1 p-2 rounded-xl border text-center cursor-pointer transition ${
                    step === st.s
                      ? 'bg-white/20 border-white text-white font-bold'
                      : 'border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <span className="text-[10px] block uppercase">Step {st.s}</span>
                  <span className="text-xs font-semibold">{st.label}</span>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-heading font-black text-base text-slate-900 border-b border-slate-100 pb-2">
                  1. Restaurant & Owner Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Restaurant Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Royal Biryani & Kebabs"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Owner / Managing Partner Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      placeholder="e.g. Vikramaditya Rao"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Business Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="partner@restaurant.com"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Contact Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="10-digit mobile number"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Portal Login Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Create a secure kitchen login password"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Cuisines (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.cuisine}
                      onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                      placeholder="e.g. North Indian, Biryani, Mughlai"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-orange-500"
                    />
                    {cuisines && cuisines.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5 max-h-20 overflow-y-auto p-1.5 bg-slate-50 rounded-xl border border-slate-200/60">
                        {cuisines
                          .filter((c) => c.isActive !== false)
                          .map((c) => {
                            const currentSelected = formData.cuisine
                              .split(',')
                              .map((s) => s.trim().toLowerCase())
                              .includes(c.name.toLowerCase());
                            return (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                  const list = formData.cuisine
                                    .split(',')
                                    .map((s) => s.trim())
                                    .filter(Boolean);
                                  const exists = list.some(
                                    (s) => s.toLowerCase() === c.name.toLowerCase()
                                  );
                                  if (exists) {
                                    setFormData({
                                      ...formData,
                                      cuisine: list
                                        .filter((s) => s.toLowerCase() !== c.name.toLowerCase())
                                        .join(', '),
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      cuisine: [...list, c.name].join(', '),
                                    });
                                  }
                                }}
                                className={`text-[10px] px-2 py-0.5 rounded-lg border transition flex items-center gap-1 ${
                                  currentSelected
                                    ? 'bg-orange-600 text-white border-orange-600 font-bold'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {c.image ? (
                                  <img src={c.image} alt={c.name} className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
                                ) : null}
                                <span>{c.name}</span>
                              </button>
                            );
                          })}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Estimated Cost for Two (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.priceForTwo || ''}
                      onChange={(e) => setFormData({ ...formData, priceForTwo: Number(e.target.value) })}
                      placeholder="e.g. 400"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-orange-500"
                    />
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span>Daily Operating Timings</span>
                    </span>
                    <span className="text-[11px] font-bold text-orange-700 bg-white px-2 py-0.5 rounded-lg border border-orange-200">
                      {formatTime12h(formData.openingTime)} – {formatTime12h(formData.closingTime)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Opening Time</label>
                      <input
                        type="time"
                        value={formData.openingTime}
                        onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                        className="w-full text-xs font-bold p-2 bg-white border border-slate-200 rounded-xl focus:outline-orange-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Closing Time</label>
                      <input
                        type="time"
                        value={formData.closingTime}
                        onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                        className="w-full text-xs font-bold p-2 bg-white border border-slate-200 rounded-xl focus:outline-orange-500"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    You can further customize day-by-day weekly schedules in your vendor dashboard after setup.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <PhotoUploadInput
                    label="Restaurant Storefront / Banner Photo"
                    value={formData.bannerImage}
                    onChange={(url) =>
                      setFormData({
                        ...formData,
                        bannerImage: url,
                        restaurantPhotoUrl: formData.restaurantPhotoUrl || url,
                      })
                    }
                    helperText="Upload your outlet storefront or dining ambiance photo"
                    required={true}
                  />

                  <PhotoUploadInput
                    label="Restaurant Logo / Branding Icon"
                    value={formData.logo}
                    onChange={(url) => setFormData({ ...formData, logo: url })}
                    helperText="Square logo for menus and search listings"
                    required={true}
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="pureveg"
                    checked={formData.pureVeg}
                    onChange={(e) => setFormData({ ...formData, pureVeg: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="pureveg" className="text-xs font-bold text-slate-700">
                    This is a 100% Pure Vegetarian Restaurant
                  </label>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
                  >
                    <span>Proceed to Location</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Location & Google Map */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-heading font-black text-base text-slate-900 border-b border-slate-100 pb-2">
                  2. Outlet Location & Delivery Zone
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Full Outlet Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="e.g. 14th Main, Sector 4, HSR Layout, Bengaluru"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Assigned Delivery Zone *
                    </label>
                    <select
                      value={formData.zoneId}
                      onChange={(e) => setFormData({ ...formData, zoneId: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-orange-500 font-medium"
                    >
                      {zones.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.name} (Base Fee: ₹{z.baseDeliveryFee})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Google Maps Pin Picker & Auto-Fetch */}
                <div className="p-3.5 bg-orange-50/50 border border-orange-200/80 rounded-2xl space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-orange-600" />
                      <label className="text-xs font-bold text-slate-800">
                        Pin Outlet Coordinates on Google Map (Click to adjust)
                      </label>
                      {gpsAccuracy && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                          {gpsAccuracy}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleAutoFetchLocation}
                      disabled={isFetchingGps}
                      className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                    >
                      <Navigation className={`w-3.5 h-3.5 ${isFetchingGps ? 'animate-spin' : ''}`} />
                      <span>{isFetchingGps ? 'Detecting Location...' : 'Auto-Fetch Current Location via GPS'}</span>
                    </button>
                  </div>

                  <LiveMap
                    centerLat={formData.lat}
                    centerLng={formData.lng}
                    interactive={true}
                    height="200px"
                    onLocationSelect={(coords) => {
                      setFormData({ ...formData, lat: coords.lat, lng: coords.lng });
                    }}
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Coordinates: <span className="font-mono font-bold text-slate-700">{formData.lat}, {formData.lng}</span></span>
                    <span className="text-[10px] text-slate-400">Click anywhere on map to reposition pin</span>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
                  >
                    <span>Proceed to KYC Documents</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: KYC & Compliance */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-heading font-black text-base text-slate-900 border-b border-slate-100 pb-2">
                  3. Legal Compliance & Government Licenses
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      FSSAI Food License Number (14-digits) *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={14}
                      value={formData.fssaiNumber}
                      onChange={(e) => setFormData({ ...formData, fssaiNumber: e.target.value })}
                      placeholder="e.g. 11223344009988"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      GSTIN Number (15-characters) *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={15}
                      value={formData.gstinNumber}
                      onChange={(e) => setFormData({ ...formData, gstinNumber: e.target.value.toUpperCase() })}
                      placeholder="29AAAAA0000A1Z5"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      UDYAM / Udyam Aadhaar Registration *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.udyamNumber}
                      onChange={(e) => setFormData({ ...formData, udyamNumber: e.target.value })}
                      placeholder="UDYAM-KR-03-0099112"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Entity PAN Card Number *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={formData.panNumber}
                      onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                      placeholder="AAAAA0000A"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-orange-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Owner / Signatory Aadhaar Card Number (12-digits) *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={14}
                      value={formData.aadhaarNumber}
                      onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                      placeholder="XXXX XXXX XXXX"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-orange-500"
                    />
                  </div>
                </div>

                {/* Mandatory Documents Upload Section */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Mandatory Compliance Document Uploads
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>
                        {[
                          formData.restaurantPhotoUrl,
                          formData.fssaiDocUrl,
                          formData.gstDocUrl,
                          formData.panDocUrl,
                          formData.aadhaarDocUrl,
                        ].filter(Boolean).length}{' '}
                        of 5 Uploaded
                      </span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {/* 1. Restaurant Photo */}
                    <DocumentUploadCard
                      id="restaurant-photo"
                      title="Restaurants Photo"
                      description="Upload kitchen, storefront facade, or dining area photo (JPG/PNG)"
                      required={true}
                      fileUrl={formData.restaurantPhotoUrl}
                      fileName={formData.restaurantPhotoName}
                      iconType="photo"
                      onChange={(url, name) =>
                        setFormData({
                          ...formData,
                          restaurantPhotoUrl: url,
                          restaurantPhotoName: name,
                        })
                      }
                      onRemove={() =>
                        setFormData({
                          ...formData,
                          restaurantPhotoUrl: '',
                          restaurantPhotoName: '',
                        })
                      }
                    />

                    {/* 2. FSSAI Certificate */}
                    <DocumentUploadCard
                      id="fssai-cert"
                      title="FSSAI Certificate"
                      description="Government Food Safety & Standards Authority License (PDF/JPG)"
                      required={true}
                      fileUrl={formData.fssaiDocUrl}
                      fileName={formData.fssaiDocName}
                      iconType="fssai"
                      onChange={(url, name, type) =>
                        setFormData({
                          ...formData,
                          fssaiDocUrl: url,
                          fssaiDocName: name,
                        })
                      }
                      onRemove={() =>
                        setFormData({
                          ...formData,
                          fssaiDocUrl: '',
                          fssaiDocName: '',
                        })
                      }
                    />

                    {/* 3. GSTIN Registration / UDYAM Certificate */}
                    <DocumentUploadCard
                      id="gstin-udyam-cert"
                      title="GSTIN Registration / UDYAM Certificate"
                      description="GST Registration form REG-06 or MSME UDYAM certificate (PDF/JPG)"
                      required={true}
                      fileUrl={formData.gstDocUrl}
                      fileName={formData.gstDocName}
                      iconType="gst"
                      onChange={(url, name, type) =>
                        setFormData({
                          ...formData,
                          gstDocUrl: url,
                          gstDocName: name,
                          udyamDocUrl: url,
                          udyamDocName: name,
                        })
                      }
                      onRemove={() =>
                        setFormData({
                          ...formData,
                          gstDocUrl: '',
                          gstDocName: '',
                          udyamDocUrl: '',
                          udyamDocName: '',
                        })
                      }
                    />

                    {/* 4. PAN Card */}
                    <DocumentUploadCard
                      id="pan-card"
                      title="PAN Card"
                      description="Entity PAN Card or Proprietor PAN document copy (JPG/PDF)"
                      required={true}
                      fileUrl={formData.panDocUrl}
                      fileName={formData.panDocName}
                      iconType="pan"
                      onChange={(url, name, type) =>
                        setFormData({
                          ...formData,
                          panDocUrl: url,
                          panDocName: name,
                        })
                      }
                      onRemove={() =>
                        setFormData({
                          ...formData,
                          panDocUrl: '',
                          panDocName: '',
                        })
                      }
                    />

                    {/* 5. Aadhaar Card */}
                    <div className="md:col-span-2">
                      <DocumentUploadCard
                        id="aadhaar-card"
                        title="Aadhaar Card Document"
                        description="Front & back copy of owner/managing partner Aadhaar card (PDF/JPG)"
                        required={true}
                        fileUrl={formData.aadhaarDocUrl}
                        fileName={formData.aadhaarDocName}
                        iconType="aadhaar"
                        onChange={(url, name, type) =>
                          setFormData({
                            ...formData,
                            aadhaarDocUrl: url,
                            aadhaarDocName: name,
                          })
                        }
                        onRemove={() =>
                          setFormData({
                            ...formData,
                            aadhaarDocUrl: '',
                            aadhaarDocName: '',
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
                  >
                    <span>Proceed to Bank Settlement</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Bank Details & Submission */}
            {step === 4 && (
              <div className="space-y-4">
                <h3 className="font-heading font-black text-base text-slate-900 border-b border-slate-100 pb-2">
                  4. Bank Account for Weekly Payouts
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Bank Account Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      placeholder="e.g. 91802938475611"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      IFSC Code *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={11}
                      value={formData.ifscCode}
                      onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                      placeholder="e.g. HDFC0001889"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Bank Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      placeholder="e.g. HDFC Bank Ltd"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Beneficiary Account Holder Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.accountHolderName}
                      onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                      placeholder="e.g. Tandoori Tales Kitchens"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-orange-500"
                    />
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
                  <p className="font-bold flex items-center gap-1.5 mb-1">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Transparent 15% Platform Commission
                  </p>
                  <span>
                    Your restaurant receives 85% of net food sales. Payments settled every Tuesday via direct NEFT / IMPS to your registered bank account.
                  </span>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-lg transition"
                  >
                    Submit Application for Approval
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};
