import React, { useState, useEffect } from 'react';
import { X, MapPin, Navigation, Home, Briefcase, CheckCircle, Sparkles, CheckCircle2, Edit } from 'lucide-react';
import { SavedAddress, DeliveryZone } from '../../types';
import { LiveMap } from '../common/LiveMap';
import { useApp } from '../../context/AppContext';
import {
  findMatchingZone,
  reverseGeocodeLocation,
  getAccurateCurrentPosition
} from '../../utils/geoUtils';

interface AddressSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddressSaved?: (address: SavedAddress) => void;
  editingAddress?: SavedAddress | null;
}

export const AddressSaveModal: React.FC<AddressSaveModalProps> = ({
  isOpen,
  onClose,
  onAddressSaved,
  editingAddress,
}) => {
  const { currentLocation, zones, addCustomerAddress, updateCustomerAddress, customerUser, googleMapsKeys } = useApp();

  const activeMapKey = googleMapsKeys.find(
    (k) => (k.isPrimary || k.isActive) && k.status !== 'quota_exceeded'
  )?.apiKey;

  const [type, setType] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [flat, setFlat] = useState('');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: currentLocation.lat || 12.9352,
    lng: currentLocation.lng || 77.6245,
  });
  const [isFetchingGps, setIsFetchingGps] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<string | null>(null);

  useEffect(() => {
    if (editingAddress) {
      setType(editingAddress.type);
      setFlat(editingAddress.flat);
      setArea(editingAddress.area);
      setLandmark(editingAddress.landmark || '');
      setPincode(editingAddress.pincode || '560034');
      setIsDefault(editingAddress.isDefault || false);
      setCoords(editingAddress.coordinates);
    } else {
      setType('Home');
      setFlat('');
      setArea('');
      setLandmark('');
      setPincode('');
      setIsDefault(false);
      setCoords({
        lat: currentLocation.lat || 12.9352,
        lng: currentLocation.lng || 77.6245,
      });
      setGpsAccuracy(null);
    }
  }, [editingAddress, isOpen]);

  if (!isOpen) return null;

  const match = findMatchingZone(coords.lat, coords.lng, zones);

  const handleAutoFetchLocation = async () => {
    setIsFetchingGps(true);
    try {
      const { lat, lng, accuracy } = await getAccurateCurrentPosition();
      setCoords({ lat, lng });
      setGpsAccuracy(`±${accuracy}m High Precision`);

      const geocoded = await reverseGeocodeLocation(lat, lng, activeMapKey);
      setFlat(geocoded.flat);
      setArea(geocoded.area);
      setLandmark(geocoded.landmark);
      setPincode(geocoded.pincode);
    } catch {
      setCoords({ lat: 12.9352, lng: 77.6245 });
      setGpsAccuracy('GPS Active (Koramangala Center)');
      if (!area) {
        setArea('Koramangala 4th Block, Bengaluru');
      }
    } finally {
      setIsFetchingGps(false);
    }
  };

  const handleMapPinSelected = async (selected: { lat: number; lng: number; address: string }) => {
    setCoords({ lat: selected.lat, lng: selected.lng });
    const geocoded = await reverseGeocodeLocation(selected.lat, selected.lng, activeMapKey);
    setFlat(geocoded.flat);
    setArea(geocoded.area);
    setLandmark(geocoded.landmark);
    setPincode(geocoded.pincode);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flat || !area) {
      alert('Please fill in complete flat/door and area details.');
      return;
    }

    const currentMatch = findMatchingZone(coords.lat, coords.lng, zones);

    if (editingAddress) {
      updateCustomerAddress(editingAddress.id, {
        type,
        title: `${type} Address`,
        flat,
        area,
        landmark,
        city: currentMatch.zone.city || 'Bengaluru',
        coordinates: coords,
        isDefault,
        zoneId: currentMatch.zone.id,
        zoneName: currentMatch.zone.name,
        pincode,
      });
      onClose();
      return;
    }

    const newAddress: SavedAddress = {
      id: `addr-${Date.now()}`,
      type,
      title: `${type} Address`,
      flat,
      area,
      landmark,
      city: currentMatch.zone.city || 'Bengaluru',
      coordinates: coords,
      isDefault: customerUser ? (isDefault || customerUser.addresses.length === 0) : true,
      zoneId: currentMatch.zone.id,
      zoneName: currentMatch.zone.name,
      pincode,
    };

    addCustomerAddress(newAddress);
    if (onAddressSaved) {
      onAddressSaved(newAddress);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-500/20 text-orange-400 rounded-xl">
              {editingAddress ? <Edit className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-heading font-black text-base">
                {editingAddress ? 'Edit Saved Delivery Address' : 'Save New Delivery Address'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Google Maps GPS auto-pinning & active delivery zone detection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Google Maps GPS Auto-Fetch Bar */}
          <div className="p-3.5 bg-orange-50/70 border border-orange-200 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase text-orange-800 tracking-wider block">
                Google Maps Accurate Geocoding
              </span>
              <p className="text-xs text-slate-700 font-medium">
                Auto-fill address fields & detect nearest delivery zone
              </p>
              {gpsAccuracy && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md mt-1 inline-block">
                  GPS: {gpsAccuracy}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleAutoFetchLocation}
              disabled={isFetchingGps}
              className="px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              <Navigation className={`w-3.5 h-3.5 ${isFetchingGps ? 'animate-spin' : ''}`} />
              <span>{isFetchingGps ? 'Locating...' : 'Auto-Fetch Location'}</span>
            </button>
          </div>

          {/* Interactive Google Map with Draggable Pin & Search */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 relative">
            <div className="h-64 sm:h-72 w-full">
              <LiveMap
                centerLat={coords.lat}
                centerLng={coords.lng}
                customerCoords={{ lat: coords.lat, lng: coords.lng }}
                onLocationSelect={handleMapPinSelected}
                height="100%"
                interactive={true}
                enableSearch={true}
              />
            </div>
            <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-xs border border-slate-200 text-slate-700 flex items-center gap-1.5 z-10 pointer-events-none">
              <MapPin className="w-3 h-3 text-orange-600 fill-orange-600" />
              <span>Click map or use search bar above to set exact doorstep</span>
            </div>
          </div>

          {/* Matched Zone Alert Badge */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Matched Zone:</span>
              <span className="font-black text-orange-600 bg-orange-100 px-2 py-0.5 rounded-md">
                {match.zone.name}
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              Coverage: {match.zone.radiusKm} km radius
            </span>
          </div>

          {/* Address Details Form */}
          <form id="address-form" onSubmit={handleSubmit} className="space-y-3.5">
            {/* Tag Selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Save As</label>
              <div className="flex gap-2">
                {[
                  { id: 'Home', icon: Home },
                  { id: 'Work', icon: Briefcase },
                  { id: 'Other', icon: MapPin },
                ].map((t) => {
                  const Icon = t.icon;
                  const isSelected = type === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setType(t.id as any)}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-orange-50 border-orange-500 text-orange-600 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Flat / House No */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                House / Flat / Block / Floor No. *
              </label>
              <input
                type="text"
                required
                value={flat}
                onChange={(e) => setFlat(e.target.value)}
                placeholder="e.g. Flat 304, Tower B, Prestige Acropolis"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-orange-500 font-medium"
              />
            </div>

            {/* Street & Area */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Street / Area / Locality *
              </label>
              <input
                type="text"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. 80 Feet Road, 4th Block, Koramangala"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-orange-500 font-medium"
              />
            </div>

            {/* Landmark & Pincode Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nearby Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Opposite Sony Center"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-orange-500 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="e.g. 560034"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-orange-500 font-medium"
                />
              </div>
            </div>

            {/* Default address toggle */}
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-xs text-slate-700 font-medium">
                Set as default delivery address for future orders
              </span>
            </label>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="address-form"
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{editingAddress ? 'Update & Save Address' : 'Save Delivery Address'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
