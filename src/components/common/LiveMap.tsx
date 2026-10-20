import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  Circle,
  Polyline,
  useMap,
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Navigation,
  Compass,
  Layers,
  Store,
  Bike,
  Home,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Search,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { reverseGeocodeLocation, searchLocationsOnMap, SearchLocationResult } from '../../utils/geoUtils';

interface LiveMapProps {
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  height?: string;
  interactive?: boolean;
  showRoute?: boolean;
  navigationMode?: 'pickup' | 'dropoff' | 'both';
  turnInstruction?: string;
  externalNavUrl?: string;
  restaurantCoords?: { lat: number; lng: number; name?: string; address?: string };
  customerCoords?: { lat: number; lng: number; address?: string; name?: string };
  riderCoords?: { lat: number; lng: number; name?: string; speed?: number; heading?: string };
  onLocationSelect?: (coords: { lat: number; lng: number; address: string }) => void;
  radiusKm?: number;
  enableSearch?: boolean;
}

// Controller component to smoothly update camera center/zoom when props change
const MapCameraUpdater: React.FC<{
  center: { lat: number; lng: number };
  zoom: number;
}> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.panTo(center);
    }
  }, [map, center.lat, center.lng]);

  return null;
};

export const LiveMap: React.FC<LiveMapProps> = ({
  centerLat = 12.9352,
  centerLng = 77.6245,
  zoom = 14,
  height = '350px',
  interactive = false,
  showRoute = false,
  navigationMode = 'both',
  turnInstruction,
  externalNavUrl,
  restaurantCoords,
  customerCoords,
  riderCoords,
  onLocationSelect,
  radiusKm,
  enableSearch,
}) => {
  const { brandSettings } = useApp();

  const apiKey = useMemo(() => {
    return (
      brandSettings.googleMapsApiKey?.trim() ||
      (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string)?.trim() ||
      'AIzaSyCh6AvlBs1g6vAf5dkPQc7z7HeG6NDl73Y'
    );
  }, [brandSettings.googleMapsApiKey]);

  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [currentPin, setCurrentPin] = useState<{ lat: number; lng: number }>({
    lat: centerLat,
    lng: centerLng,
  });
  const [selectedAddressLabel, setSelectedAddressLabel] = useState<string>('');
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);

  // Search feature states
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchLocationResult[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Debounced search places on Google Map
  useEffect(() => {
    const trimmed = mapSearchQuery.trim();
    if (!trimmed || trimmed.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchLocationsOnMap(trimmed, apiKey);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [mapSearchQuery, apiKey]);

  const handleSelectSearchResult = (result: SearchLocationResult) => {
    setCurrentPin({ lat: result.lat, lng: result.lng });
    setSelectedAddressLabel(result.address);
    setMapSearchQuery(result.name);
    setIsSearchOpen(false);

    if (onLocationSelect) {
      onLocationSelect({
        lat: result.lat,
        lng: result.lng,
        address: result.address,
      });
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (searchResults.length > 0) {
      handleSelectSearchResult(searchResults[0]);
    }
  };

  // Sync internal pin with props when center changes
  useEffect(() => {
    setCurrentPin({ lat: centerLat, lng: centerLng });
  }, [centerLat, centerLng]);

  // Rider animated progress between restaurant and customer
  const [riderProgress, setRiderProgress] = useState(0.45);
  useEffect(() => {
    if (!showRoute) return;
    const interval = setInterval(() => {
      setRiderProgress((prev) => {
        if (prev >= 0.96) return 0.96;
        return prev + 0.015;
      });
    }, 1800);
    return () => clearInterval(interval);
  }, [showRoute]);

  // Interpolated animated rider coordinates
  const animatedRiderCoords = useMemo(() => {
    if (riderCoords) return riderCoords;
    if (restaurantCoords && customerCoords) {
      const t = riderProgress;
      const lat = restaurantCoords.lat + (customerCoords.lat - restaurantCoords.lat) * t;
      const lng = restaurantCoords.lng + (customerCoords.lng - restaurantCoords.lng) * t;
      return { lat, lng, name: 'Assigned Delivery Partner' };
    }
    return undefined;
  }, [riderCoords, restaurantCoords, customerCoords, riderProgress]);

  // Route path polyline points with realistic road-following waypoints
  const routePolylinePath = useMemo(() => {
    if (!showRoute) return [];

    const generateWaypoints = (
      p1: { lat: number; lng: number },
      p2: { lat: number; lng: number }
    ) => {
      // Generate realistic street corridor waypoints between points
      const midLat = p1.lat * 0.45 + p2.lat * 0.55;
      const midLng = p1.lng * 0.75 + p2.lng * 0.25;
      return [
        p1,
        { lat: p1.lat, lng: midLng },
        { lat: midLat, lng: midLng },
        { lat: midLat, lng: p2.lng },
        p2,
      ];
    };

    if (navigationMode === 'pickup') {
      const start = animatedRiderCoords || riderCoords || { lat: 12.9352, lng: 77.6245 };
      const end = restaurantCoords || { lat: 12.9348, lng: 77.625 };
      return generateWaypoints(start, end);
    }

    if (navigationMode === 'dropoff') {
      const start = animatedRiderCoords || riderCoords || restaurantCoords || { lat: 12.9348, lng: 77.625 };
      const end = customerCoords || { lat: 12.9352, lng: 77.6245 };
      return generateWaypoints(start, end);
    }

    // Default / 'both': Full rider -> restaurant -> customer route
    const pts: { lat: number; lng: number }[] = [];
    const rStart = animatedRiderCoords || riderCoords;
    if (rStart && restaurantCoords) {
      pts.push(...generateWaypoints(rStart, restaurantCoords));
    } else if (restaurantCoords) {
      pts.push(restaurantCoords);
    }
    if (customerCoords) {
      const from = restaurantCoords || rStart;
      if (from) {
        pts.push(...generateWaypoints(from, customerCoords).slice(1));
      } else {
        pts.push(customerCoords);
      }
    }
    return pts;
  }, [showRoute, navigationMode, restaurantCoords, animatedRiderCoords, riderCoords, customerCoords]);

  const routePolylineColor = useMemo(() => {
    if (navigationMode === 'pickup') return '#2563eb'; // blue for pickup
    if (navigationMode === 'dropoff') return '#059669'; // emerald for customer dropoff
    return '#ea580c'; // orange for overall
  }, [navigationMode]);

  // Handle click on the real Google Map
  const handleMapClick = useCallback(
    async (e: any) => {
      setIsSearchOpen(false);
      if (!interactive) return;

      const clickLat = e.detail?.latLng?.lat;
      const clickLng = e.detail?.latLng?.lng;

      if (typeof clickLat !== 'number' || typeof clickLng !== 'number') return;

      const roundedLat = Number(clickLat.toFixed(5));
      const roundedLng = Number(clickLng.toFixed(5));

      setCurrentPin({ lat: roundedLat, lng: roundedLng });
      setIsGeocoding(true);

      try {
        const geoResult = await reverseGeocodeLocation(roundedLat, roundedLng, apiKey);
        const resolvedAddress = geoResult.fullAddress || `Point (${roundedLat}, ${roundedLng})`;
        setSelectedAddressLabel(resolvedAddress);

        if (onLocationSelect) {
          onLocationSelect({
            lat: roundedLat,
            lng: roundedLng,
            address: resolvedAddress,
          });
        }
      } catch (err) {
        const fallbackAddress = `Location (${roundedLat}, ${roundedLng}), Bengaluru`;
        setSelectedAddressLabel(fallbackAddress);
        if (onLocationSelect) {
          onLocationSelect({
            lat: roundedLat,
            lng: roundedLng,
            address: fallbackAddress,
          });
        }
      } finally {
        setIsGeocoding(false);
      }
    },
    [interactive, apiKey, onLocationSelect]
  );

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-slate-100 select-none group"
      style={{ height }}
    >
      <APIProvider apiKey={apiKey} libraries={['places', 'marker', 'routes', 'geometry']}>
        <Map
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
          defaultCenter={{ lat: centerLat, lng: centerLng }}
          center={{ lat: currentPin.lat, lng: currentPin.lng }}
          defaultZoom={zoom}
          gestureHandling={'greedy'}
          mapTypeId={mapType === 'satellite' ? 'hybrid' : 'roadmap'}
          disableDefaultUI={false}
          clickableIcons={false}
          onClick={handleMapClick}
        >
          <MapCameraUpdater center={{ lat: currentPin.lat, lng: currentPin.lng }} zoom={zoom} />

          {/* Interactive selected pin marker */}
          {interactive && (
            <AdvancedMarker position={currentPin} title="Selected Doorstep Pin">
              <div className="relative flex items-center justify-center -translate-y-1">
                <span className="absolute w-8 h-8 rounded-full bg-orange-500/30 animate-ping pointer-events-none" />
                <div className="relative px-2.5 py-1 bg-slate-900 text-white rounded-xl shadow-xl border-2 border-orange-500 flex items-center gap-1.5 text-[11px] font-black tracking-tight animate-bounce">
                  <MapPin className="w-4 h-4 text-orange-400 fill-current" />
                  <span>Target Pin</span>
                </div>
              </div>
            </AdvancedMarker>
          )}

          {/* Restaurant Storefront Marker */}
          {restaurantCoords && (
            <AdvancedMarker
              position={{ lat: restaurantCoords.lat, lng: restaurantCoords.lng }}
              title={restaurantCoords.name || 'Restaurant Kitchen'}
            >
              <div className="relative flex flex-col items-center">
                <div
                  className={`px-2.5 py-1 text-white rounded-xl shadow-lg border border-white flex items-center gap-1.5 text-[11px] font-extrabold whitespace-nowrap transition-transform ${
                    navigationMode === 'pickup'
                      ? 'bg-blue-600 ring-4 ring-blue-400/40 scale-105'
                      : 'bg-orange-600'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>
                    {navigationMode === 'pickup' ? '📍 Pickup: ' : ''}
                    {restaurantCoords.name || 'Kitchen Outlet'}
                  </span>
                </div>
                <div
                  className={`w-2 h-2 rotate-45 -mt-1 shadow-xs ${
                    navigationMode === 'pickup' ? 'bg-blue-600' : 'bg-orange-600'
                  }`}
                />
              </div>
            </AdvancedMarker>
          )}

          {/* Customer Doorstep Marker */}
          {customerCoords && (
            <AdvancedMarker
              position={{ lat: customerCoords.lat, lng: customerCoords.lng }}
              title={customerCoords.address || 'Delivery Destination'}
            >
              <div className="relative flex flex-col items-center">
                <div
                  className={`px-2.5 py-1 text-white rounded-xl shadow-lg border border-white flex items-center gap-1.5 text-[11px] font-extrabold whitespace-nowrap transition-transform ${
                    navigationMode === 'dropoff'
                      ? 'bg-emerald-600 ring-4 ring-emerald-400/40 scale-105'
                      : 'bg-emerald-600'
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>
                    {navigationMode === 'dropoff' ? '🏠 Dropoff: ' : ''}
                    {customerCoords.name ? `${customerCoords.name} (Doorstep)` : 'Doorstep Destination'}
                  </span>
                </div>
                <div className="w-2 h-2 bg-emerald-600 rotate-45 -mt-1 shadow-xs" />
              </div>
            </AdvancedMarker>
          )}

          {/* Real-Time Delivery Rider Marker */}
          {animatedRiderCoords && (
            <AdvancedMarker
              position={{ lat: animatedRiderCoords.lat, lng: animatedRiderCoords.lng }}
              title={animatedRiderCoords.name || 'Delivery Partner'}
            >
              <div className="relative flex flex-col items-center">
                <span className="absolute w-12 h-12 rounded-full bg-blue-500/30 animate-ping pointer-events-none" />
                <div className="relative p-2 bg-gradient-to-tr from-blue-700 to-indigo-600 text-white rounded-2xl shadow-2xl border-2 border-white flex items-center justify-center">
                  <Bike className="w-4 h-4 animate-pulse" />
                </div>
                {riderCoords?.speed && (
                  <span className="mt-1 bg-slate-900/90 text-white text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md shadow border border-slate-700">
                    {riderCoords.speed} km/h
                  </span>
                )}
              </div>
            </AdvancedMarker>
          )}

          {/* Service Area Delivery Zone Radius Circle */}
          {radiusKm && radiusKm > 0 && (
            <Circle
              center={{ lat: centerLat, lng: centerLng }}
              radius={radiusKm * 1000}
              strokeColor="#ea580c"
              strokeOpacity={0.8}
              strokeWeight={2}
              fillColor="#ea580c"
              fillOpacity={0.12}
            />
          )}

          {/* Route Polyline connecting points */}
          {showRoute && routePolylinePath.length > 1 && (
            <Polyline
              path={routePolylinePath}
              strokeColor={routePolylineColor}
              strokeOpacity={0.92}
              strokeWeight={navigationMode !== 'both' ? 5 : 4}
            />
          )}
        </Map>
      </APIProvider>

      {/* In-Map Navigation Turn-by-Turn Instruction Banner */}
      {turnInstruction && (
        <div className="absolute top-12 left-3 right-3 sm:left-auto sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-20 pointer-events-auto bg-slate-900/95 backdrop-blur-md text-white px-4 py-2 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center gap-2.5 max-w-md animate-in fade-in slide-in-from-top-1">
          <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-md">
            <Navigation className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
              {navigationMode === 'pickup' ? 'Pickup Route' : navigationMode === 'dropoff' ? 'Dropoff Route' : 'Live Navigation'}
            </span>
            <p className="text-xs font-black truncate text-white">{turnInstruction}</p>
          </div>
        </div>
      )}

      {/* Floating Bottom-Right Direct Google Maps Launcher */}
      {externalNavUrl && (
        <a
          href={externalNavUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 right-3 z-20 pointer-events-auto px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black rounded-xl shadow-xl flex items-center gap-1.5 transition active:scale-95 border border-white/20"
          title="Open Google Maps App on your device"
        >
          <Navigation className="w-3.5 h-3.5 text-white" />
          <span>Start in Google Maps ↗</span>
        </a>
      )}

      {/* Floating Top Controls & Search Bar Overlay */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-20">
        {/* Search Option in Google Map */}
        {(enableSearch ?? interactive) ? (
          <div ref={searchContainerRef} className="flex-1 min-w-[200px] max-w-sm relative pointer-events-auto">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-orange-500 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={mapSearchQuery}
                onChange={(e) => {
                  setMapSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSearchSubmit(e);
                  }
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search place, area, or landmark on map..."
                className="w-full text-xs pl-8 pr-7 py-2 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl shadow-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 font-medium transition"
              />
              {isSearching ? (
                <RefreshCw className="w-3.5 h-3.5 text-orange-500 animate-spin absolute right-2.5 top-2.5" />
              ) : mapSearchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setMapSearchQuery('');
                    setSearchResults([]);
                    setIsSearchOpen(false);
                  }}
                  className="absolute right-2.5 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              ) : null}
            </div>

            {/* Places Search Dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-30 max-h-52 overflow-y-auto animate-in fade-in slide-in-from-top-1">
                <div className="p-1.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400 px-3">
                  <span>Google Map Locations</span>
                  <span>{searchResults.length} Results</span>
                </div>
                {searchResults.map((res, i) => (
                  <button
                    key={`${res.name}-${i}`}
                    type="button"
                    onClick={() => handleSelectSearchResult(res)}
                    className="w-full text-left px-3 py-2.5 hover:bg-orange-50/80 transition border-b border-slate-100 last:border-0 flex items-start gap-2.5 text-xs group"
                  >
                    <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 group-hover:text-orange-600 truncate">{res.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{res.address}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Empty Search Feedback */}
            {isSearchOpen && mapSearchQuery.trim().length >= 2 && !isSearching && searchResults.length === 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-30 text-center animate-in fade-in slide-in-from-top-1">
                <p className="text-xs font-semibold text-slate-700">No locations found</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Try searching a major area like Koramangala, Indiranagar, HSR Layout, or Whitefield
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-lg border border-slate-700/80 pointer-events-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Google Maps Active</span>
            {isGeocoding && (
              <RefreshCw className="w-3 h-3 text-orange-400 animate-spin ml-1" />
            )}
          </div>
        )}

        <div className="flex items-center gap-1.5 pointer-events-auto shrink-0">
          {/* Satellite vs Roadmap Toggle */}
          <button
            type="button"
            onClick={() => setMapType((prev) => (prev === 'roadmap' ? 'satellite' : 'roadmap'))}
            className="px-2.5 py-1.5 bg-white/95 hover:bg-white text-slate-800 text-[11px] font-black rounded-xl shadow-md border border-slate-200 flex items-center gap-1 transition active:scale-95"
            title="Toggle Satellite / Street View"
          >
            <Layers className="w-3.5 h-3.5 text-orange-600" />
            <span className="capitalize">{mapType === 'roadmap' ? 'Satellite' : 'Roadmap'}</span>
          </button>

          {/* Reset Center */}
          <button
            type="button"
            onClick={() => setCurrentPin({ lat: centerLat, lng: centerLng })}
            className="p-1.5 bg-white/95 hover:bg-white text-slate-800 rounded-xl shadow-md border border-slate-200 transition active:scale-95"
            title="Reset Map Center"
          >
            <Compass className="w-4 h-4 text-slate-700" />
          </button>
        </div>
      </div>

      {/* Interactive Helper Bottom Banner */}
      {interactive && (
        <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md rounded-xl p-2.5 shadow-lg border border-slate-200/90 text-xs flex items-center justify-between gap-2 pointer-events-auto z-10">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 bg-orange-100 text-orange-700 rounded-lg shrink-0">
              <Navigation className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Click map to reposition pin
              </p>
              <p className="text-xs font-black text-slate-900 truncate">
                {selectedAddressLabel || `${currentPin.lat}, ${currentPin.lng}`}
              </p>
            </div>
          </div>
          <span className="shrink-0 text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Precise GPS</span>
          </span>
        </div>
      )}
    </div>
  );
};
