import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  MapPin,
  Navigation,
  Check,
  Layers,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Power,
} from 'lucide-react';
import { Franchise, DeliveryZone } from '../../../types';
import { LiveMap } from '../../common/LiveMap';

interface FranchiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  mode: 'add' | 'edit';
  franchise?: Franchise | null;
  zones?: DeliveryZone[];
}

export const FranchiseModal: React.FC<FranchiseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  mode,
  franchise,
  zones = [],
}) => {
  const [franchiseName, setFranchiseName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [territory, setTerritory] = useState('');
  const [tier, setTier] = useState<Franchise['tier']>('Territory Franchise');
  const [revenueSharePercent, setRevenueSharePercent] = useState<number>(8);
  const [investmentAmount, setInvestmentAmount] = useState<number>(0);
  const [activeOutletsCount, setActiveOutletsCount] = useState<number>(1);
  const [status, setStatus] = useState<Franchise['status']>('active');
  const [deactivationReason, setDeactivationReason] = useState('');
  const [contractStart, setContractStart] = useState('');
  const [contractEnd, setContractEnd] = useState('');
  const [notes, setNotes] = useState('');

  // Franchise Admin Login Credentials (Super Admin Control)
  const [adminUserId, setAdminUserId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Google Maps Coordinates & Zone Selection
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 12.9352, lng: 77.6245 });
  const [hubAddress, setHubAddress] = useState('');
  const [selectedZoneIds, setSelectedZoneIds] = useState<string[]>([]);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<string | null>(null);

  useEffect(() => {
    if (franchise && mode === 'edit') {
      setFranchiseName(franchise.franchiseName);
      setOwnerName(franchise.ownerName);
      setEmail(franchise.email);
      setPhone(franchise.phone);
      setTerritory(franchise.territory);
      setTier(franchise.tier);
      setRevenueSharePercent(franchise.revenueSharePercent);
      setInvestmentAmount(franchise.investmentAmount);
      setActiveOutletsCount(franchise.activeOutletsCount);
      setStatus(franchise.status);
      setDeactivationReason(franchise.deactivationReason || '');
      setContractStart(franchise.contractStart);
      setContractEnd(franchise.contractEnd);
      setNotes(franchise.notes || '');
      setAdminUserId(franchise.adminUserId || '');
      setAdminPassword(franchise.adminPassword || '');
      if (franchise.coordinates) {
        setCoords(franchise.coordinates);
      }
      if (franchise.hubAddress) {
        setHubAddress(franchise.hubAddress);
      }
      if (franchise.zoneIds && franchise.zoneIds.length > 0) {
        setSelectedZoneIds(franchise.zoneIds);
      } else if (zones.length > 0) {
        setSelectedZoneIds([zones[0].id]);
      }
    } else {
      setFranchiseName('');
      setOwnerName('');
      setEmail('');
      setPhone('');
      setTerritory('');
      setTier('Territory Franchise');
      setRevenueSharePercent(8);
      setInvestmentAmount(0);
      setActiveOutletsCount(1);
      setStatus('active');
      setDeactivationReason('');
      setContractStart('');
      setContractEnd('');
      setNotes('');
      setAdminUserId('');
      setAdminPassword('');
      setCoords({ lat: 12.9352, lng: 77.6245 });
      setHubAddress('');
      setGpsAccuracy(null);
      if (zones.length > 0) {
        setSelectedZoneIds([zones[0].id]);
      }
    }
  }, [franchise, mode, isOpen, zones]);

  if (!isOpen) return null;

  // Auto-fetch accurate current location via GPS
  const handleAutoFetchLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lng = Number(pos.coords.longitude.toFixed(4));
        const accuracy = pos.coords.accuracy ? Math.round(pos.coords.accuracy) : 10;
        setCoords({ lat, lng });
        setGpsAccuracy(`±${accuracy}m accuracy`);
        setIsFetchingLocation(false);

        // Auto-match closest delivery zone
        if (zones.length > 0) {
          let closestZone = zones[0];
          let minDistance = Number.MAX_VALUE;
          zones.forEach((z) => {
            const dist = Math.hypot(z.center.lat - lat, z.center.lng - lng);
            if (dist < minDistance) {
              minDistance = dist;
              closestZone = z;
            }
          });
          if (!selectedZoneIds.includes(closestZone.id)) {
            setSelectedZoneIds((prev) => [...prev, closestZone.id]);
          }
          setTerritory(`${closestZone.name} & Surrounds`);
          setHubAddress(`Regional Hub Point (${lat}, ${lng}), ${closestZone.city}`);
        }
      },
      (err) => {
        setIsFetchingLocation(false);
        // Fallback to high-precision simulation if blocked
        const simLat = 12.9352;
        const simLng = 77.6245;
        setCoords({ lat: simLat, lng: simLng });
        setGpsAccuracy('GPS Ready (Default Metro Anchor)');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const toggleZoneSelection = (zoneId: string) => {
    setSelectedZoneIds((prev) =>
      prev.includes(zoneId) ? prev.filter((id) => id !== zoneId) : [...prev, zoneId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedZoneIds.length === 0) {
      alert('Please select at least one delivery zone for this franchise territory.');
      return;
    }

    onSave({
      franchiseName,
      ownerName,
      email,
      phone,
      territory,
      tier,
      revenueSharePercent: Number(revenueSharePercent),
      investmentAmount: Number(investmentAmount),
      activeOutletsCount: Number(activeOutletsCount),
      status,
      deactivationReason: status !== 'active' ? (deactivationReason.trim() || 'Deactivated by Likart Food Super Admin') : undefined,
      deactivatedAt: status !== 'active' ? (franchise?.deactivatedAt || new Date().toISOString().split('T')[0]) : undefined,
      contractStart,
      contractEnd,
      notes,
      coordinates: coords,
      hubAddress,
      zoneIds: selectedZoneIds,
      adminUserId: adminUserId.trim(),
      adminPassword: adminPassword.trim(),
      adminName: ownerName,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-base">
                {mode === 'add' ? 'Super Admin: Enrol Franchise Partner' : `Edit Franchise: ${franchise?.franchiseName}`}
              </h3>
              <p className="text-[11px] text-slate-400">
                Configure regional territory rights with Google Maps & select operational delivery zones
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
          {/* 1. Franchise Entity Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Franchise Business / Entity Name *</label>
              <input
                type="text"
                required
                value={franchiseName}
                onChange={(e) => setFranchiseName(e.target.value)}
                placeholder="e.g. LIKART Premium South Hub LLP"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-amber-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Franchise Principal / Partner *</label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Partner Full Name"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-amber-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Official Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="franchise@likartfood.com"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-amber-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98450 11223"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-amber-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Franchise Tier / Model *</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as Franchise['tier'])}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-amber-500"
              >
                <option value="Master Franchise">Master Franchise (Multi-City / Macro)</option>
                <option value="Territory Franchise">Territory Franchise (Cluster / Ward)</option>
                <option value="Unit Cloud Kitchen">Unit Cloud Kitchen (Single Outlet)</option>
              </select>
            </div>
          </div>

          {/* Franchise Admin Login Credentials (Super Admin Control) */}
          <div className="p-4 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-purple-500/10 rounded-2xl border border-amber-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500 text-white rounded-lg">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs">Franchise Admin Login ID & Password</h4>
                  <p className="text-[10px] text-slate-500">Super Admin can create or change credentials to access the franchise management portal</p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-purple-600" />
                <span>Super Admin Access</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Franchise Admin User ID / Username *</label>
                  <button
                    type="button"
                    onClick={() => {
                      const base = ownerName.trim() ? ownerName.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'franchise';
                      setAdminUserId(`fr_${base}_${Math.floor(100 + Math.random() * 900)}`);
                    }}
                    className="text-[10px] font-bold text-amber-600 hover:underline flex items-center gap-0.5"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Auto-Suggest</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={adminUserId}
                  onChange={(e) => setAdminUserId(e.target.value)}
                  placeholder="e.g. fr_south_admin"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold font-mono text-slate-800 focus:outline-amber-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Franchise Admin Password *</label>
                  <button
                    type="button"
                    onClick={() => {
                      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
                      let gen = '';
                      for (let i = 0; i < 10; i++) gen += chars.charAt(Math.floor(Math.random() * chars.length));
                      setAdminPassword(gen);
                    }}
                    className="text-[10px] font-bold text-amber-600 hover:underline flex items-center gap-0.5"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Generate Strong</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter or generate password"
                    className="w-full p-2.5 pr-10 bg-white border border-slate-200 rounded-xl font-bold font-mono text-slate-800 focus:outline-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Google Map & Hub Location */}
          <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-slate-800">Franchise Hub Google Map Location</span>
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
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
              >
                <Navigation className={`w-3.5 h-3.5 ${isFetchingLocation ? 'animate-spin' : ''}`} />
                <span>{isFetchingLocation ? 'Fetching GPS...' : 'Auto-Fetch Current Location'}</span>
              </button>
            </div>

            <div>
              <LiveMap
                centerLat={coords.lat}
                centerLng={coords.lng}
                interactive={true}
                height="180px"
                onLocationSelect={(selected) => {
                  setCoords({ lat: selected.lat, lng: selected.lng });
                  setHubAddress(selected.address);
                }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Hub Address / Landmark</label>
                <input
                  type="text"
                  value={hubAddress}
                  onChange={(e) => setHubAddress(e.target.value)}
                  placeholder="Street / Hub Facility Address"
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-0.5">Assigned Territory Label</label>
                <input
                  type="text"
                  value={territory}
                  onChange={(e) => setTerritory(e.target.value)}
                  placeholder="e.g. Metro North Territory"
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                Lat: {coords.lat}
              </span>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                Lng: {coords.lng}
              </span>
              <span>(Click map anytime to relocate franchise anchor pin)</span>
            </div>
          </div>

          {/* 3. Operational Delivery Zones Selection */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-600" />
                <span className="font-bold text-slate-800">Select Operational Delivery Zones *</span>
              </div>
              <span className="text-[11px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                {selectedZoneIds.length} Zone{selectedZoneIds.length !== 1 ? 's' : ''} Selected
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Select which delivery service zones are serviced under this franchise agreement:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {zones.map((z) => {
                const isSelected = selectedZoneIds.includes(z.id);
                return (
                  <div
                    key={z.id}
                    onClick={() => toggleZoneSelection(z.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50/70 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">{z.name}</span>
                      <span className="text-[10px] text-slate-500">
                        {z.city} • Radius: {z.radiusKm} km • Base Fee: ₹{z.baseDeliveryFee}
                      </span>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center border transition ${
                        isSelected
                          ? 'bg-purple-600 border-purple-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Financial & Commercial Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Monthly Royalty Share (%) *</label>
              <input
                type="number"
                step="0.5"
                min={1}
                max={50}
                required
                value={revenueSharePercent}
                onChange={(e) => setRevenueSharePercent(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-amber-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Committed Investment (₹) *</label>
              <input
                type="number"
                step={50000}
                min={100000}
                required
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-amber-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Active Cloud Kitchens *</label>
              <input
                type="number"
                min={1}
                max={50}
                required
                value={activeOutletsCount}
                onChange={(e) => setActiveOutletsCount(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-amber-500"
              />
            </div>
          </div>

          {/* 5. Agreement Contract Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Contract Start Date</label>
              <input
                type="date"
                required
                value={contractStart}
                onChange={(e) => setContractStart(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Contract End Date</label>
              <input
                type="date"
                required
                value={contractEnd}
                onChange={(e) => setContractEnd(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Operational Notes / Stipulations</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Master kitchen rights covering evening dinner delivery peak hours..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl resize-none"
            />
          </div>

          {/* 6. Administrative Status (Super Admin Control) */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-bold text-xs text-slate-900 block">
                  Franchise Administrative Status (Super Admin Control)
                </label>
                <span className="text-[11px] text-slate-500">
                  {status === 'active'
                    ? 'Franchise agreement is ACTIVE. Regional territory operations and admin login are authorized.'
                    : 'Franchise is DEACTIVATED / SUSPENDED. Administrator login is blocked and outlets on administrative hold.'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setStatus(status === 'active' ? 'suspended' : 'active')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-2xs active:scale-95 ${
                  status === 'active'
                    ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{status === 'active' ? 'Active Franchise' : 'Deactivated'}</span>
              </button>
            </div>

            {status !== 'active' && (
              <div className="pt-2 border-t border-slate-200">
                <label className="text-[11px] font-bold text-rose-800 block mb-1">
                  Reason for Deactivation / Suspension *
                </label>
                <input
                  type="text"
                  value={deactivationReason}
                  onChange={(e) => setDeactivationReason(e.target.value)}
                  placeholder="e.g. Compliance review, royalty payment audit, quality hold..."
                  className="w-full p-2 bg-white border border-rose-200 rounded-xl text-xs font-medium focus:outline-rose-500"
                />
              </div>
            )}
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
              className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-md shadow-amber-600/20 transition active:scale-95"
            >
              {mode === 'add' ? 'Confirm & Enrol Franchise' : 'Save Franchise Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
