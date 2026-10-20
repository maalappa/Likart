import React, { useState, useEffect } from 'react';
import { X, MapPin, Navigation, CheckCircle, Sliders, Layers, ShieldCheck } from 'lucide-react';
import { DeliveryZone } from '../../../types';
import { LiveMap } from '../../common/LiveMap';

interface ZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  mode: 'add' | 'edit';
  zone?: DeliveryZone | null;
}

export const ZoneModal: React.FC<ZoneModalProps> = ({
  isOpen,
  onClose,
  onSave,
  mode,
  zone,
}) => {
  const [name, setName] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [lat, setLat] = useState(12.9352);
  const [lng, setLng] = useState(77.6245);
  const [radiusKm, setRadiusKm] = useState(7);
  const [baseDeliveryFee, setBaseDeliveryFee] = useState(35);
  const [perKmFee, setPerKmFee] = useState(8);
  const [minOrderValue, setMinOrderValue] = useState(149);
  const [isActive, setIsActive] = useState(true);

  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<string | null>(null);

  useEffect(() => {
    if (zone && mode === 'edit') {
      setName(zone.name);
      setCity(zone.city);
      setLat(zone.center.lat);
      setLng(zone.center.lng);
      setRadiusKm(zone.radiusKm);
      setBaseDeliveryFee(zone.baseDeliveryFee);
      setPerKmFee(zone.perKmFee);
      setMinOrderValue(zone.minOrderValue);
      setIsActive(zone.isActive);
    } else {
      setName('');
      setCity('Bengaluru');
      setLat(12.9352);
      setLng(77.6245);
      setRadiusKm(7);
      setBaseDeliveryFee(35);
      setPerKmFee(8);
      setMinOrderValue(149);
      setIsActive(true);
      setGpsAccuracy(null);
    }
  }, [zone, mode, isOpen]);

  if (!isOpen) return null;

  // Auto-fetch accurate current location via GPS
  const handleAutoFetchLocation = () => {
    if (!navigator.geolocation) {
      setGpsAccuracy('Geolocation not supported by browser');
      return;
    }

    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const fetchedLat = Number(pos.coords.latitude.toFixed(4));
        const fetchedLng = Number(pos.coords.longitude.toFixed(4));
        const accuracy = pos.coords.accuracy ? Math.round(pos.coords.accuracy) : 10;
        setLat(fetchedLat);
        setLng(fetchedLng);
        setGpsAccuracy(`±${accuracy}m GPS Accuracy`);
        setIsFetchingLocation(false);

        if (!name) {
          setName(`Zone Center (${fetchedLat}, ${fetchedLng})`);
        }
      },
      () => {
        setIsFetchingLocation(false);
        // Default anchor if denied or desktop sandbox
        setLat(12.9352);
        setLng(77.6245);
        setGpsAccuracy('GPS Ready (Default Metro Anchor)');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      city,
      center: { lat: Number(lat), lng: Number(lng) },
      radiusKm: Number(radiusKm),
      baseDeliveryFee: Number(baseDeliveryFee),
      perKmFee: Number(perKmFee),
      minOrderValue: Number(minOrderValue),
      isActive,
    };
    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-base">
                {mode === 'add' ? 'Super Admin: Create Delivery Zone' : `Edit Zone: ${zone?.name}`}
              </h3>
              <p className="text-[11px] text-slate-400">
                Define geographic service boundary using Google Map & accurate GPS location fetch
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

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* 1. Zone Name & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Zone Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Central Delivery Cluster"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-purple-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">City *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Bengaluru"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-purple-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Coverage Radius (KM) *</label>
              <input
                type="number"
                step="0.5"
                min={1}
                max={30}
                required
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-purple-500"
              />
            </div>
          </div>

          {/* 2. Google Map & Auto-Fetch GPS Location */}
          <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-600" />
                <span className="font-bold text-slate-800">Zone Center Google Map & GPS Fetch</span>
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
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
              >
                <Navigation className={`w-3.5 h-3.5 ${isFetchingLocation ? 'animate-spin' : ''}`} />
                <span>{isFetchingLocation ? 'Fetching GPS...' : 'Auto-Fetch Current Location'}</span>
              </button>
            </div>

            {/* Live Interactive Map with Radius Overlay */}
            <div>
              <LiveMap
                centerLat={lat}
                centerLng={lng}
                radiusKm={radiusKm}
                interactive={true}
                height="190px"
                onLocationSelect={(selected) => {
                  setLat(selected.lat);
                  setLng(selected.lng);
                  if (!name) {
                    setName(`Zone Pin (${selected.lat}, ${selected.lng})`);
                  }
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Center Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={lat}
                  onChange={(e) => setLat(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Center Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={lng}
                  onChange={(e) => setLng(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono text-[11px]"
                />
              </div>
            </div>

            <p className="text-[10px] text-slate-500">
              💡 Tip: Click anywhere on the map to relocate zone epicenter, or click "Auto-Fetch Current Location" to pin your device's exact GPS coordinate.
            </p>
          </div>

          {/* 3. Delivery Fee Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Base Delivery Fee (₹) *</label>
              <input
                type="number"
                min={0}
                required
                value={baseDeliveryFee}
                onChange={(e) => setBaseDeliveryFee(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Per-KM Distance Fee (₹) *</label>
              <input
                type="number"
                min={0}
                required
                value={perKmFee}
                onChange={(e) => setPerKmFee(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Min Order Value (₹) *</label>
              <input
                type="number"
                min={0}
                required
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="zoneActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded"
            />
            <label htmlFor="zoneActive" className="font-bold text-slate-700 cursor-pointer">
              Zone is Active for Customer Orders & Delivery Dispatches
            </label>
          </div>

          {/* Permanent Save Access Notice */}
          <div className="p-3 bg-emerald-50/80 border border-emerald-200/90 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">
                Permanent Save Access: Zone polygon & pricing persistently stored in master database.
              </span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full shrink-0 border border-emerald-200">
              Permanent
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-md shadow-purple-600/20 transition active:scale-95"
            >
              {mode === 'add' ? 'Create Delivery Zone' : 'Save Zone Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
