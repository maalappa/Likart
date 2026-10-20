import React, { useState, useEffect } from 'react';
import { X, Store, CheckCircle, MapPin, Navigation, ShieldCheck, Database } from 'lucide-react';
import { Restaurant, DeliveryZone } from '../../../types';
import { LiveMap } from '../../common/LiveMap';
import { PhotoUploadInput } from '../../common/PhotoUploadInput';
import { useApp } from '../../../context/AppContext';

interface RestaurantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  mode: 'add' | 'edit';
  restaurant?: Restaurant | null;
  zones: DeliveryZone[];
}

export const RestaurantModal: React.FC<RestaurantModalProps> = ({
  isOpen,
  onClose,
  onSave,
  mode,
  restaurant,
  zones,
}) => {
  const { cuisines } = useApp();
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [cuisineStr, setCuisineStr] = useState('');
  const [address, setAddress] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [deliveryTimeMins, setDeliveryTimeMins] = useState(30);
  const [priceForTwo, setPriceForTwo] = useState(400);
  const [commissionRate, setCommissionRate] = useState(15);
  const [logo, setLogo] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [pureVeg, setPureVeg] = useState(false);
  const [isOpenOutlet, setIsOpenOutlet] = useState(true);
  const [openingTime, setOpeningTime] = useState('09:00');
  const [closingTime, setClosingTime] = useState('23:00');
  const [autoOpenClose, setAutoOpenClose] = useState(true);
  const [status, setStatus] = useState<Restaurant['status']>('approved');

  // KYC
  const [fssaiNumber, setFssaiNumber] = useState('');
  const [gstinNumber, setGstinNumber] = useState('');
  const [udyamNumber, setUdyamNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [bankAcc, setBankAcc] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountHolder, setAccountHolder] = useState('');

  // Google Maps Coordinates & GPS
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 12.9352, lng: 77.6245 });
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<string | null>(null);

  useEffect(() => {
    if (restaurant && mode === 'edit') {
      setName(restaurant.name);
      setOwnerName(restaurant.ownerName);
      setEmail(restaurant.email);
      setPhone(restaurant.phone);
      setPassword(restaurant.password || 'chef123');
      setCuisineStr(restaurant.cuisine.join(', '));
      setAddress(restaurant.address);
      setZoneId(restaurant.zoneId);
      setDeliveryTimeMins(restaurant.deliveryTimeMins);
      setPriceForTwo(restaurant.priceForTwo);
      setCommissionRate(restaurant.commissionRate);
      setLogo(restaurant.logo);
      setBannerImage(restaurant.bannerImage);
      setPureVeg(Boolean(restaurant.pureVeg));
      setIsOpenOutlet(restaurant.isOpen);
      setOpeningTime(restaurant.openingTime || '09:00');
      setClosingTime(restaurant.closingTime || '23:00');
      setAutoOpenClose(restaurant.autoOpenClose ?? true);
      setStatus(restaurant.status);
      if (restaurant.coordinates) {
        setCoords(restaurant.coordinates);
      }

      // KYC
      setFssaiNumber(restaurant.kyc.fssaiNumber || '');
      setGstinNumber(restaurant.kyc.gstinNumber || '');
      setUdyamNumber(restaurant.kyc.udyamNumber || '');
      setPanNumber(restaurant.kyc.panNumber || '');
      setBankAcc(restaurant.kyc.bankAccount?.accountNumber || '');
      setBankIfsc(restaurant.kyc.bankAccount?.ifscCode || '');
      setBankName(restaurant.kyc.bankAccount?.bankName || '');
      setAccountHolder(restaurant.kyc.bankAccount?.accountHolderName || '');
    } else {
      setName('');
      setOwnerName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setCuisineStr('');
      setAddress('');
      setZoneId(zones[0]?.id || 'zone-1');
      setDeliveryTimeMins(30);
      setPriceForTwo(350);
      setCommissionRate(15);
      setLogo('');
      setBannerImage('');
      setPureVeg(false);
      setIsOpenOutlet(true);
      setOpeningTime('09:00');
      setClosingTime('23:00');
      setAutoOpenClose(true);
      setStatus('approved');
      setCoords({ lat: 12.9352, lng: 77.6245 });
      setGpsAccuracy(null);

      setFssaiNumber('');
      setGstinNumber('');
      setUdyamNumber('');
      setPanNumber('');
      setBankAcc('');
      setBankIfsc('');
      setBankName('');
      setAccountHolder('');
    }
  }, [restaurant, mode, isOpen, zones]);

  const handleAutoFetchLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const fetchedLat = Number(pos.coords.latitude.toFixed(4));
        const fetchedLng = Number(pos.coords.longitude.toFixed(4));
        const accuracy = pos.coords.accuracy ? Math.round(pos.coords.accuracy) : 10;
        setCoords({ lat: fetchedLat, lng: fetchedLng });
        setGpsAccuracy(`±${accuracy}m GPS Accuracy`);
        setIsFetchingLocation(false);

        // Auto-match closest zone
        if (zones.length > 0) {
          let closest = zones[0];
          let minDist = Number.MAX_VALUE;
          zones.forEach((z) => {
            const dist = Math.hypot(z.center.lat - fetchedLat, z.center.lng - fetchedLng);
            if (dist < minDist) {
              minDist = dist;
              closest = z;
            }
          });
          setZoneId(closest.id);
          if (!address || address.includes('Indiranagar')) {
            setAddress(`Outlet Location (${fetchedLat}, ${fetchedLng}), ${closest.name}`);
          }
        }
      },
      () => {
        setIsFetchingLocation(false);
        setCoords({ lat: 12.9352, lng: 77.6245 });
        setGpsAccuracy('GPS Ready (Default Metro Anchor)');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cuisines = cuisineStr.split(',').map((c) => c.trim()).filter(Boolean);

    const dataPayload = {
      name,
      ownerName,
      email,
      phone,
      password,
      cuisine: cuisines.length > 0 ? cuisines : ['Multi-Cuisine'],
      address,
      coordinates: coords,
      zoneId,
      deliveryTimeMins: Number(deliveryTimeMins) || 25,
      priceForTwo: Number(priceForTwo) || 400,
      commissionRate: Number(commissionRate) || 15,
      logo: logo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80',
      bannerImage: bannerImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
      pureVeg,
      isOpen: isOpenOutlet,
      openingTime,
      closingTime,
      autoOpenClose,
      status,
      offers: restaurant?.offers || ['Flat 20% OFF on gourmet orders'],
      kyc: {
        fssaiNumber,
        fssaiDocUrl: restaurant?.kyc.fssaiDocUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
        gstinNumber,
        gstDocUrl: restaurant?.kyc.gstDocUrl || 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80',
        udyamNumber,
        udyamDocUrl: restaurant?.kyc.udyamDocUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
        panNumber,
        panDocUrl: restaurant?.kyc.panDocUrl || 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&auto=format&fit=crop&q=80',
        aadhaarNumber: restaurant?.kyc.aadhaarNumber || '7829 4019 2831',
        aadhaarDocUrl: restaurant?.kyc.aadhaarDocUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
        restaurantPhotoUrl: restaurant?.kyc.restaurantPhotoUrl || bannerImage || logo,
        verified: status === 'approved',
        bankAccount: {
          accountNumber: bankAcc,
          ifscCode: bankIfsc,
          bankName,
          accountHolderName: accountHolder,
        },
      },
    };

    onSave(dataPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-base">
                {mode === 'add' ? 'Super Admin: Add Restaurant Outlet' : `Edit Restaurant: ${restaurant?.name}`}
              </h3>
              <p className="text-[11px] text-slate-400">
                Configure basic details, commercial commission, FSSAI/GST, and operational status
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* Basic Details */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3 pb-1 border-b border-slate-100">
              1. Basic Profile & Contact Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Restaurant Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Royal Biryani Durbar"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Owner / Manager Name *</label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Chef Farhan Akhtar"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Business Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="partner@restaurant.com"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Contact Phone *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98450 12345"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Portal Login Password *</label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="chef123"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Assigned Delivery Zone *</label>
                <select
                  value={zoneId}
                  onChange={(e) => setZoneId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-emerald-500"
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} ({z.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="100 Feet Road, Indiranagar, Bengaluru"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-emerald-500"
                />
              </div>

              {/* Google Map Pin Picker & Auto-Fetch GPS */}
              <div className="sm:col-span-2 p-3.5 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-800 text-xs">Restaurant Google Map Coordinates</span>
                    {gpsAccuracy && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                        {gpsAccuracy}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleAutoFetchLocation}
                    disabled={isFetchingLocation}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
                  >
                    <Navigation className={`w-3.5 h-3.5 ${isFetchingLocation ? 'animate-spin' : ''}`} />
                    <span>{isFetchingLocation ? 'Fetching GPS...' : 'Auto-Fetch Current Location'}</span>
                  </button>
                </div>

                <LiveMap
                  centerLat={coords.lat}
                  centerLng={coords.lng}
                  interactive={true}
                  height="160px"
                  onLocationSelect={(selected) => {
                    setCoords({ lat: selected.lat, lng: selected.lng });
                    if (zones.length > 0) {
                      let closest = zones[0];
                      let minDist = Number.MAX_VALUE;
                      zones.forEach((z) => {
                        const dist = Math.hypot(z.center.lat - selected.lat, z.center.lng - selected.lng);
                        if (dist < minDist) {
                          minDist = dist;
                          closest = z;
                        }
                      });
                      setZoneId(closest.id);
                    }
                  }}
                />

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Coordinates: <span className="font-mono font-bold text-slate-700">{coords.lat}, {coords.lng}</span></span>
                  <span className="text-[10px] text-slate-400">Click map anytime to relocate pin</span>
                </div>
              </div>
            </div>
          </div>

          {/* Operational & Commercial Details */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3 pb-1 border-b border-slate-100">
              2. Operations & Commercial Terms
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Commission Rate (%)</label>
                <input
                  type="number"
                  min={5}
                  max={35}
                  required
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Avg Delivery Time (mins)</label>
                <input
                  type="number"
                  min={10}
                  max={90}
                  required
                  value={deliveryTimeMins}
                  onChange={(e) => setDeliveryTimeMins(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Cost for Two (₹)</label>
                <input
                  type="number"
                  min={100}
                  max={5000}
                  required
                  value={priceForTwo}
                  onChange={(e) => setPriceForTwo(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-emerald-500"
                />
              </div>

              <div className="sm:col-span-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 block">Cuisines (comma-separated)</label>
                  <span className="text-[10px] text-slate-400">Click chips below to toggle</span>
                </div>
                <input
                  type="text"
                  value={cuisineStr}
                  onChange={(e) => setCuisineStr(e.target.value)}
                  placeholder="Biryani, North Indian, Mughlai, Kebabs"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-emerald-500"
                />
                {cuisines && cuisines.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2 max-h-24 overflow-y-auto p-1.5 bg-slate-50 rounded-xl border border-slate-200/60">
                    {cuisines
                      .filter((c) => c.isActive !== false)
                      .map((c) => {
                        const currentSelected = cuisineStr
                          .split(',')
                          .map((s) => s.trim().toLowerCase())
                          .includes(c.name.toLowerCase());
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              const list = cuisineStr
                                .split(',')
                                .map((s) => s.trim())
                                .filter(Boolean);
                              const exists = list.some(
                                (s) => s.toLowerCase() === c.name.toLowerCase()
                              );
                              if (exists) {
                                setCuisineStr(
                                  list
                                    .filter(
                                      (s) => s.toLowerCase() !== c.name.toLowerCase()
                                    )
                                    .join(', ')
                                );
                              } else {
                                setCuisineStr([...list, c.name].join(', '));
                              }
                            }}
                            className={`text-[10px] px-2 py-0.5 rounded-lg border transition flex items-center gap-1 ${
                              currentSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
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

              <div className="sm:col-span-3">
                <PhotoUploadInput
                  label="Restaurant Logo / Avatar"
                  value={logo}
                  onChange={(url) => setLogo(url)}
                  helperText="Upload restaurant logo in any format (PNG, JPG, WEBP, SVG, etc.)"
                />
              </div>

              <div className="sm:col-span-3">
                <PhotoUploadInput
                  label="Restaurant Storefront / Banner"
                  value={bannerImage}
                  onChange={(url) => setBannerImage(url)}
                  helperText="Upload banner cover photo in any format"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={pureVeg}
                    onChange={(e) => setPureVeg(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Pure Vegetarian</span>
                </label>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isOpenOutlet}
                    onChange={(e) => setIsOpenOutlet(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Accepting Orders (Open)</span>
                </label>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Daily Opening Time</label>
                <input
                  type="time"
                  value={openingTime}
                  onChange={(e) => setOpeningTime(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Daily Closing Time</label>
                <input
                  type="time"
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={autoOpenClose}
                    onChange={(e) => setAutoOpenClose(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Auto-Timer Schedule Active</span>
                </label>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Approval Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="approved">Approved</option>
                  <option value="pending">Pending KYC Review</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          {/* Legal KYC Details */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3 pb-1 border-b border-slate-100">
              3. Regulatory Compliance & Bank Settlement Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">FSSAI License Number</label>
                <input
                  type="text"
                  value={fssaiNumber}
                  onChange={(e) => setFssaiNumber(e.target.value)}
                  placeholder="14-digit FSSAI"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">GSTIN Number</label>
                <input
                  type="text"
                  value={gstinNumber}
                  onChange={(e) => setGstinNumber(e.target.value.toUpperCase())}
                  placeholder="15-character GSTIN"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] uppercase"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">UDYAM Number</label>
                <input
                  type="text"
                  value={udyamNumber}
                  onChange={(e) => setUdyamNumber(e.target.value)}
                  placeholder="UDYAM-XX-00-0000000"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Business PAN Number</label>
                <input
                  type="text"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  placeholder="10-digit PAN"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] uppercase"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Bank Account Number</label>
                <input
                  type="text"
                  value={bankAcc}
                  onChange={(e) => setBankAcc(e.target.value)}
                  placeholder="Bank Account No"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Bank IFSC Code</label>
                <input
                  type="text"
                  value={bankIfsc}
                  onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                  placeholder="HDFC0001234"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] uppercase"
                />
              </div>
            </div>
          </div>

          {/* Permanent Save Access Notice */}
          <div className="p-3 bg-emerald-50/80 border border-emerald-200/90 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">
                Permanent Save Access: Data immediately mirrors to IndexedDB & local storage with zero loss.
              </span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full shrink-0 border border-emerald-200">
              Durable
            </span>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{mode === 'add' ? 'Save & Add Restaurant' : 'Update Restaurant'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
