import React, { useState } from 'react';
import { Restaurant, MenuItem } from '../../types';
import { Star, Clock, MapPin, Tag, Heart, Sparkles, UtensilsCrossed, Film, Volume2, VolumeX } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateDistanceKm } from '../../utils/geoUtils';
import { checkRestaurantOpenStatus, formatTime12h } from '../../utils/timeUtils';
import { CustomerVideoReelModal, VideoReelData } from './CustomerVideoReelModal';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
  matchingDishes?: MenuItem[];
  searchHighlightQuery?: string;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onClick,
  matchingDishes,
  searchHighlightQuery,
}) => {
  const { customerUser, setCustomerUser, zones, currentLocation } = useApp();
  const [isMuted, setIsMuted] = useState(true);
  const [activeReel, setActiveReel] = useState<VideoReelData | null>(null);

  const openStatus = checkRestaurantOpenStatus(restaurant);
  const isFavorite = customerUser?.favorites?.includes(restaurant.id);
  const restZone = zones.find((z) => z.id === restaurant.zoneId);

  const distKm = Math.max(
    0.5,
    calculateDistanceKm(
      restaurant.coordinates?.lat || 12.9352,
      restaurant.coordinates?.lng || 77.6245,
      currentLocation.lat,
      currentLocation.lng
    )
  );

  const isInCustomerZone =
    currentLocation.zoneId ? restaurant.zoneId === currentLocation.zoneId : distKm <= 7;

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!customerUser) return;
    const currentFavs = customerUser.favorites || [];
    const newFavs = isFavorite
      ? currentFavs.filter((id) => id !== restaurant.id)
      : [...currentFavs, restaurant.id];

    setCustomerUser({
      ...customerUser,
      favorites: newFavs,
    });
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted((prev) => !prev);
  };

  const handleOpenReel = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!restaurant.videoUrl) return;
    setActiveReel({
      title: restaurant.name,
      subtitle: `${restaurant.cuisine?.join(', ')} • ${restaurant.address}`,
      videoUrl: restaurant.videoUrl,
      type: 'restaurant',
      rating: restaurant.rating,
      description: `Experience the live kitchen ambiance and freshly-prepared specialties from ${restaurant.name}.`,
      actionButtonText: 'View Restaurant Menu',
      onViewDetails: onClick,
    });
  };

  return (
    <>
      <div
        onClick={onClick}
        className={`bg-white rounded-3xl overflow-hidden border transition-all duration-300 cursor-pointer flex flex-col group relative ${
          openStatus.isOpen
            ? 'border-slate-200/80 hover:border-orange-300 shadow-xs hover:shadow-xl'
            : 'border-slate-200 opacity-90 hover:opacity-100 hover:border-slate-300 shadow-xs'
        }`}
      >
        {/* Banner & Badges */}
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
          {restaurant.videoUrl ? (
            <video
              src={restaurant.videoUrl}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                !openStatus.isOpen ? 'filter grayscale-[30%] brightness-90' : ''
              }`}
            />
          ) : (
            <img
              src={restaurant.bannerImage}
              alt={restaurant.name}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                !openStatus.isOpen ? 'filter grayscale-[30%] brightness-90' : ''
              }`}
            />
          )}

          {/* Gradient shadow for contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

          {/* Live Video Reel Indicator & Audio Toggle */}
          {restaurant.videoUrl && (
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleOpenReel}
                className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 animate-pulse border border-white/20 transition active:scale-95"
                title="Watch full kitchen reel"
              >
                <Film className="w-3 h-3" />
                <span>Live Kitchen</span>
              </button>

              <button
                type="button"
                onClick={handleToggleMute}
                className="p-1 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 shadow-xs transition active:scale-90"
                title={isMuted ? 'Unmute video sound' : 'Mute video sound'}
              >
                {isMuted ? (
                  <VolumeX className="w-3 h-3 text-amber-300" />
                ) : (
                  <Volume2 className="w-3 h-3 text-emerald-400" />
                )}
              </button>
            </div>
          )}

          {/* Closed Overlay Alert if currently closed */}
          {!openStatus.isOpen && (
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center p-4">
              <div className="bg-slate-900/90 border border-white/20 text-white rounded-2xl px-4 py-2 text-center shadow-xl">
                <span className="text-[10px] uppercase font-black tracking-widest text-rose-400 block">
                  Temporarily Closed
                </span>
                <p className="text-xs font-bold mt-0.5 text-slate-100">
                  {openStatus.timeBadgeText}
                </p>
              </div>
            </div>
          )}

          {/* Favorite heart */}
          <button
            onClick={toggleFavorite}
            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white backdrop-blur-xs rounded-full shadow-md text-slate-400 hover:text-rose-500 transition active:scale-90 z-10"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>

          {/* Pure Veg Badge */}
          {restaurant.pureVeg && !restaurant.videoUrl && (
            <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow flex items-center gap-1 z-10">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              <span>Pure Veg</span>
            </div>
          )}

          {/* Zone & Timing Badge Overlay */}
          <div className="absolute top-3 left-auto right-12 sm:right-14 flex items-center gap-1.5 z-10">
          {openStatus.isOpen ? (
            <span className="bg-emerald-600/95 backdrop-blur-xs text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>{openStatus.timeBadgeText}</span>
            </span>
          ) : (
            <span className="bg-rose-600/95 backdrop-blur-xs text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
              Closed
            </span>
          )}
        </div>

        {/* Offer Banner Overlay at bottom of photo */}
        {restaurant.offers.length > 0 && (
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center gap-1.5 text-white text-xs font-black drop-shadow z-10">
            <Tag className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
            <span className="truncate">{restaurant.offers[0]}</span>
          </div>
        )}
      </div>

      {/* Details Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Header Row: Title & Rating */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-heading font-black text-base text-slate-900 group-hover:text-orange-600 transition truncate">
              {restaurant.name}
            </h3>

            <div className="flex items-center gap-1 bg-emerald-600 text-white px-2 py-0.5 rounded-lg text-xs font-black shrink-0 shadow-xs">
              <Star className="w-3 h-3 fill-white" />
              <span>{restaurant.rating}</span>
            </div>
          </div>

          {/* Cuisines */}
          <p className="text-xs text-slate-500 mt-1 truncate">
            {restaurant.cuisine.join(' • ')}
          </p>

          {/* Zone & Operating Timings Info */}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
            <span className="font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1 truncate max-w-[200px]">
              <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
              <span>{restZone?.name || restaurant.address}</span>
            </span>

            <span className="font-medium text-slate-600 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-600" />
              <span>{formatTime12h(restaurant.openingTime || '09:00')} - {formatTime12h(restaurant.closingTime || '23:00')}</span>
            </span>
          </div>
          {/* Matching Food Dishes if searching */}
          {matchingDishes && matchingDishes.length > 0 && (
            <div className="mt-2.5 p-2 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200/80 text-[11px] text-orange-950 space-y-1">
              <div className="flex items-center gap-1 font-black text-orange-900 text-[10px] uppercase tracking-wide">
                <Sparkles className="w-3 h-3 text-orange-600 shrink-0" />
                <span>{matchingDishes.length} Matching {matchingDishes.length === 1 ? 'Dish' : 'Dishes'}:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {matchingDishes.slice(0, 3).map((d) => (
                  <span
                    key={d.id}
                    className="bg-white/95 border border-orange-200 px-1.5 py-0.5 rounded-md font-semibold text-slate-800 text-[10px] truncate max-w-[180px] shadow-2xs"
                  >
                    {d.name} <strong className="text-orange-700">₹{d.price}</strong>
                  </span>
                ))}
                {matchingDishes.length > 3 && (
                  <span className="text-[10px] font-black text-orange-700 self-center pl-0.5">
                    +{matchingDishes.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Row: Delivery Time, Distance & Price for two */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-semibold">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-orange-500" />
            <span>{restaurant.deliveryTimeMins} mins</span>
            <span className="text-slate-300">•</span>
            <span className="font-black text-slate-900">{distKm} km</span>
          </div>

          <div className="text-slate-700 font-bold">
            ₹{restaurant.priceForTwo} for two
          </div>
        </div>
      </div>
    </div>

      {/* Customer Video Reel Modal */}
      <CustomerVideoReelModal
        isOpen={Boolean(activeReel)}
        onClose={() => setActiveReel(null)}
        data={activeReel}
      />
    </>
  );
};
