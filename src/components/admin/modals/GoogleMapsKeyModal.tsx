import React, { useState, useEffect } from 'react';
import { X, KeyRound, CheckCircle } from 'lucide-react';
import { GoogleMapsKeyItem } from '../../../types';

interface GoogleMapsKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  mode: 'add' | 'edit';
  keyItem?: GoogleMapsKeyItem | null;
}

const AVAILABLE_MAPS_SERVICES = [
  'Maps JavaScript API',
  'Places API (New)',
  'Geocoding API',
  'Directions API (Navigation Routing)',
  'Distance Matrix API (ETA Calculation)',
  'Geolocation API',
  'Roads API',
];

export const GoogleMapsKeyModal: React.FC<GoogleMapsKeyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  mode,
  keyItem,
}) => {
  const [label, setLabel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [enabledServices, setEnabledServices] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isPrimary, setIsPrimary] = useState(false);
  const [dailyQuotaLimit, setDailyQuotaLimit] = useState(100000);

  useEffect(() => {
    if (keyItem && mode === 'edit') {
      setLabel(keyItem.label);
      setApiKey(keyItem.apiKey);
      setEnabledServices(keyItem.enabledServices || []);
      setIsActive(keyItem.isActive);
      setIsPrimary(keyItem.isPrimary);
      setDailyQuotaLimit(keyItem.dailyQuotaLimit || 100000);
    } else {
      setLabel('');
      setApiKey('');
      setEnabledServices([
        'Maps JavaScript API',
        'Places API (New)',
        'Geocoding API',
        'Directions API (Navigation Routing)',
        'Distance Matrix API (ETA Calculation)',
      ]);
      setIsActive(true);
      setIsPrimary(false);
      setDailyQuotaLimit(100000);
    }
  }, [keyItem, mode, isOpen]);

  if (!isOpen) return null;

  const toggleService = (srv: string) => {
    setEnabledServices((prev) =>
      prev.includes(srv) ? prev.filter((s) => s !== srv) : [...prev, srv]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      label,
      apiKey: apiKey.trim(),
      enabledServices,
      isActive,
      isPrimary,
      dailyQuotaLimit: Number(dailyQuotaLimit),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-base">
                {mode === 'add' ? 'Super Admin: Register Google Maps API Key' : `Edit Maps Key: ${keyItem?.label}`}
              </h3>
              <p className="text-[11px] text-slate-400">
                Configure Google Cloud API Key, enabled services & quota throttle
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
          <div>
            <label className="font-bold text-slate-700 block mb-1">Key Label / Environment *</label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Production Web & PWA Key"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-emerald-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Google Maps API Key (AIzaSy...) *</label>
            <input
              type="text"
              required
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] focus:bg-white focus:outline-emerald-500"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Ensure HTTP Referrer restrictions in Google Cloud Console match your application domain.
            </span>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Daily Request Quota Limit</label>
            <input
              type="number"
              min={1000}
              max={1000000}
              required
              value={dailyQuotaLimit}
              onChange={(e) => setDailyQuotaLimit(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:outline-emerald-500"
            />
          </div>

          {/* Services Checklist */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5 uppercase text-[10px] tracking-wider">
              Enabled Google Maps Platform APIs:
            </label>
            <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              {AVAILABLE_MAPS_SERVICES.map((srv) => (
                <label
                  key={srv}
                  className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-white transition text-[11px]"
                >
                  <input
                    type="checkbox"
                    checked={enabledServices.includes(srv)}
                    onChange={() => toggleService(srv)}
                    className="w-3.5 h-3.5 text-emerald-600 rounded"
                  />
                  <span className={enabledServices.includes(srv) ? 'font-bold text-slate-900' : 'text-slate-600'}>
                    {srv}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span>Key Active</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
              <input
                type="checkbox"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span>Set as Primary System Key (Used by Customer UI)</span>
            </label>
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
              <span>{mode === 'add' ? 'Save API Key' : 'Update Key'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
