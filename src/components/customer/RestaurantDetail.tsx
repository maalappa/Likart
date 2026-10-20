import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeft,
  Star,
  Clock,
  MapPin,
  Tag,
  ShieldCheck,
  Search,
  Plus,
  Minus,
  Check,
  Flame,
  Info,
  Layers,
  X,
  Sparkles,
  AlertTriangle,
  Store,
  Film,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { MenuItem, FoodVariant } from '../../types';
import { calculateDistanceKm } from '../../utils/geoUtils';
import { checkRestaurantOpenStatus, formatTime12h } from '../../utils/timeUtils';
import { CustomerVideoReelModal, VideoReelData } from './CustomerVideoReelModal';

interface RestaurantDetailProps {
  onBack: () => void;
}

export const RestaurantDetail: React.FC<RestaurantDetailProps> = ({ onBack }) => {
  const [activeReel, setActiveReel] = useState<VideoReelData | null>(null);
  const {
    restaurants,
    selectedRestaurantId,
    menuItems,
    cart,
    addToCart,
    updateCartQuantity,
    applyCoupon,
    setIsCartOpen,
    addNotification,
    currentLocation,
    zones,
  } = useApp();

  const [filterVegOnly, setFilterVegOnly] = useState(false);
  const [filterBestsellerOnly, setFilterBestsellerOnly] = useState(false);
  const [menuSearch, setMenuSearch] = useState('');
  const [showFssaiModal, setShowFssaiModal] = useState(false);

  // Variant Customisation Modal State
  const [variantModalItem, setVariantModalItem] = useState<MenuItem | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<FoodVariant | null>(null);
  const [variantQuantity, setVariantQuantity] = useState(1);

  const restaurant = restaurants.find((r) => r.id === selectedRestaurantId) || restaurants[0];

  if (!restaurant) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
          <Store className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold font-heading text-slate-800">No Restaurant Selected</h3>
        <p className="text-xs text-slate-500">
          No restaurant is currently available or selected.
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
        >
          Back to Restaurants
        </button>
      </div>
    );
  }

  const openStatus = checkRestaurantOpenStatus(restaurant);
  const items = menuItems.filter((m) => m.restaurantId === restaurant.id);
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

  // Group items by category
  const categories = Array.from(new Set(items.map((i) => i.category)));

  // Filter items
  const filteredItems = items.filter((item) => {
    if (filterVegOnly && !item.isVeg) return false;
    if (filterBestsellerOnly && !item.isBestseller) return false;
    if (menuSearch && !item.name.toLowerCase().includes(menuSearch.toLowerCase())) return false;
    return true;
  });

  const getCartQuantity = (itemId: string) => {
    const found = cart.find((ci) => ci.item.id === itemId);
    return found ? found.quantity : 0;
  };

  const handleApplyOffer = (offerText: string) => {
    const res = applyCoupon('LIKART50');
    addNotification('Offer Applied', res.message, 'system');
    setIsCartOpen(true);
  };

  return (
    <div className="py-6 max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-orange-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to all restaurants</span>
      </button>

      {/* Restaurant Header Card */}
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-md">
        {/* Banner */}
        <div className="relative h-56 sm:h-72 overflow-hidden bg-slate-900">
          <img
            src={restaurant.bannerImage}
            alt={restaurant.name}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

          {/* Restaurant identity floating badge */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                {restaurant.pureVeg && (
                  <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                    Pure Veg
                  </span>
                )}
                {/* Live Kitchen Status Badge */}
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs ${
                  openStatus.isOpen ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>{openStatus.timeBadgeText}</span>
                </span>
                <span className="bg-white/20 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  FSSAI Verified
                </span>
                <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  LIKART Partner
                </span>
                {restZone && (
                  <span className="bg-orange-600/90 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                    <MapPin className="w-3 h-3 text-orange-200" />
                    <span>Zone: {restZone.name} ({distKm} km away)</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-black font-heading tracking-tight drop-shadow">
                {restaurant.name}
              </h1>

              <p className="text-xs sm:text-sm text-slate-200 mt-1 font-medium">
                {restaurant.cuisine.join(' • ')}
              </p>

              <div className="flex items-center gap-3 flex-wrap mt-1 text-xs text-slate-200">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-400" />
                  <span>{restaurant.address}</span>
                </span>
                <span>•</span>
                <span className="bg-white/10 backdrop-blur-xs px-2 py-0.5 rounded-md flex items-center gap-1 text-amber-300 font-bold border border-white/10">
                  <Clock className="w-3 h-3" />
                  <span>Daily Hours: {formatTime12h(restaurant.openingTime || '09:00')} – {formatTime12h(restaurant.closingTime || '23:00')}</span>
                </span>
              </div>
            </div>

            {/* Rating & Delivery Info Box */}
            <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 shrink-0 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10">
              <div className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1 rounded-xl text-sm font-black shadow">
                <Star className="w-4 h-4 fill-white" />
                <span>{restaurant.rating}</span>
                <span className="text-[10px] opacity-80 font-normal">
                  ({restaurant.ratingCount}+ reviews)
                </span>
              </div>
              <div className="text-xs text-slate-200 font-semibold flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-orange-400" />
                <span>{restaurant.deliveryTimeMins} mins</span>
                <span>•</span>
                <span>₹{restaurant.priceForTwo} for two</span>
              </div>
            </div>
          </div>
        </div>

        {/* Closed Alert Banner if restaurant is currently closed */}
        {!openStatus.isOpen && (
          <div className="bg-rose-50 border-b border-rose-200/80 p-3.5 px-6 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-rose-900 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse shrink-0" />
              <span>Kitchen is currently closed ({openStatus.timeBadgeText}). You can preview the menu dishes, but orders cannot be accepted right now.</span>
            </div>
            <span className="text-rose-700 bg-white font-extrabold px-3 py-1 rounded-xl border border-rose-200 shadow-2xs">
              {openStatus.nextScheduleText}
            </span>
          </div>
        )}

        {/* Offers ticker */}
        <div className="bg-amber-50/70 border-b border-amber-200/60 p-3.5 px-6 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-900 font-bold">
            <Tag className="w-4 h-4 text-orange-600" />
            <span>Available Deals:</span>
            {restaurant.offers.map((offer, idx) => (
              <span
                key={idx}
                className="bg-white px-2.5 py-1 rounded-lg border border-amber-200 text-orange-700 font-extrabold shadow-2xs"
              >
                {offer}
              </span>
            ))}
          </div>

          <button
            onClick={() => handleApplyOffer(restaurant.offers[0])}
            className="text-orange-600 font-bold hover:underline"
          >
            Apply Promo LIKART50 →
          </button>
        </div>
      </div>

      {/* Menu Filters & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4 sticky top-28 z-30">
        <div className="flex items-center gap-2">
          {/* Veg Only Toggle */}
          <button
            onClick={() => setFilterVegOnly(!filterVegOnly)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${
              filterVegOnly
                ? 'bg-emerald-50 text-emerald-700 border-emerald-500 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="w-4 h-4 border-2 border-emerald-600 rounded flex items-center justify-center p-0.5">
              <div className="w-2 h-2 rounded-full bg-emerald-600" />
            </div>
            <span>Pure Veg</span>
          </button>

          {/* Bestseller Toggle */}
          <button
            onClick={() => setFilterBestsellerOnly(!filterBestsellerOnly)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${
              filterBestsellerOnly
                ? 'bg-orange-50 text-orange-700 border-orange-500 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>Bestsellers</span>
          </button>
        </div>

        {/* Search inside menu */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={menuSearch}
            onChange={(e) => setMenuSearch(e.target.value)}
            placeholder="Search within this menu..."
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-orange-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Menu Categories & Items List */}
      <div className="space-y-8">
        {categories.map((category) => {
          const categoryItems = filteredItems.filter((i) => i.category === category);
          if (categoryItems.length === 0) return null;

          return (
            <div key={category} className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <h3 className="text-xl font-black font-heading text-slate-900">
                  {category}
                </h3>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {categoryItems.length}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryItems.map((item) => {
                  const qty = getCartQuantity(item.id);
                  const hasVariants = Boolean(item.variants && item.variants.length > 0);
                  const minPrice = hasVariants ? Math.min(...item.variants!.map((v) => v.price)) : item.price;
                  const maxPrice = hasVariants ? Math.max(...item.variants!.map((v) => v.price)) : item.price;
                  const totalItemQty = cart
                    .filter((ci) => ci.item.id === item.id)
                    .reduce((sum, ci) => sum + ci.quantity, 0);

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl p-4 border border-slate-200/90 hover:border-orange-300 shadow-xs hover:shadow-md transition flex justify-between gap-4 group"
                    >
                      {/* Left: Food details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          {/* Veg/Non-veg symbol + tags */}
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className={`w-4 h-4 border-2 rounded flex items-center justify-center p-0.5 ${
                                item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                              }`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                                }`}
                              />
                            </div>
                            {item.isBestseller && (
                              <span className="bg-amber-100 text-amber-800 text-[9px] font-black uppercase px-1.5 py-0.2 rounded">
                                Bestseller
                              </span>
                            )}
                            {item.rating && (
                              <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-emerald-600" />
                                {item.rating}
                              </span>
                            )}
                          </div>

                          {/* Item name and Customisable badge */}
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-heading font-black text-sm text-slate-900 group-hover:text-orange-600 transition">
                              {item.name}
                            </h4>
                            {item.originalPrice && item.originalPrice > item.price && (
                              <span className="text-[10px] font-black text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded-md shadow-2xs">
                                {item.discountLabel ||
                                  `${Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF`}
                              </span>
                            )}
                            {hasVariants && (
                              <span className="text-[9px] font-black uppercase text-orange-700 bg-orange-100 px-1.5 py-0.2 rounded-md">
                                Customisable
                              </span>
                            )}
                          </div>

                          {/* Price */}
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-sm font-black text-slate-900">
                              {hasVariants && minPrice !== maxPrice ? `₹${minPrice} - ₹${maxPrice}` : `₹${item.price}`}
                            </span>
                            {item.originalPrice && item.originalPrice > item.price && (
                              <>
                                <span className="text-xs text-slate-400 line-through">
                                  ₹{item.originalPrice}
                                </span>
                                <span className="text-[10px] font-bold text-emerald-700">
                                  Save ₹{item.originalPrice - item.price}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Low Stock Alert */}
                          {item.hasStockTracking &&
                            (item.stockQuantity ?? 0) > 0 &&
                            (item.stockQuantity ?? 0) <= (item.lowStockThreshold ?? 5) && (
                              <div className="mt-1">
                                <span className="text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md inline-flex items-center gap-1 animate-pulse">
                                  ⚡ Only {item.stockQuantity} left in stock!
                                </span>
                              </div>
                            )}

                          {/* Quick Variant Chips */}
                          {hasVariants && (
                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                              {item.variants!.map((v) => {
                                const inCartVariant = cart.find(
                                  (ci) => ci.item.id === item.id && ci.selectedVariant?.id === v.id
                                );
                                const isVariantInStock = v.isAvailable !== false;
                                return (
                                  <button
                                    key={v.id}
                                    type="button"
                                    disabled={!item.isAvailable || !isVariantInStock}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!openStatus.isOpen) {
                                        addNotification(
                                          'Restaurant Closed',
                                          `Kitchen is currently closed (${openStatus.timeBadgeText}). Ordering will resume once open.`,
                                          'system'
                                        );
                                        return;
                                      }
                                      addToCart(item, v);
                                    }}
                                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition flex items-center gap-1 active:scale-95 ${
                                      !isVariantInStock
                                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                                        : inCartVariant
                                        ? 'bg-orange-600 text-white border-orange-600 shadow-2xs'
                                        : 'bg-white hover:bg-orange-50 text-slate-700 border-slate-200 hover:border-orange-300'
                                    }`}
                                    title={!isVariantInStock ? `${v.name} is currently sold out` : `Add ${item.name} (${v.name}) to cart`}
                                  >
                                    <span>{v.name}</span>
                                    {isVariantInStock ? (
                                      <span className={inCartVariant ? 'text-white font-extrabold' : 'text-slate-900 font-extrabold'}>
                                        ₹{v.price}
                                      </span>
                                    ) : (
                                      <span className="text-[9px] text-rose-500 font-bold no-underline">Sold Out</span>
                                    )}
                                    {inCartVariant && (
                                      <span className="bg-white/30 text-white rounded-full px-1 text-[9px] font-black">
                                        {inCartVariant.quantity}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {/* Description */}
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Right: Item Image / Video + Add to Cart Button */}
                      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shrink-0 bg-slate-900 flex flex-col items-center">
                        {item.videoUrl ? (
                          <video
                            src={item.videoUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        )}

                        {/* Live Video Reel Badge Button */}
                        {item.videoUrl && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveReel({
                                title: item.name,
                                subtitle: `${restaurant.name} • ${item.category}`,
                                videoUrl: item.videoUrl!,
                                type: 'food_item',
                                price: item.price,
                                originalPrice: item.originalPrice,
                                discountLabel: item.discountLabel,
                                description: item.description,
                                isVeg: item.isVeg,
                                rating: item.rating,
                                actionButtonText: 'Add to Cart',
                                onAddToCart: () => addToCart(item),
                              });
                            }}
                            className="absolute top-1.5 right-1.5 z-10 bg-red-600 hover:bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-0.5 border border-white animate-pulse transition active:scale-90"
                            title="Watch dish video reel with sound"
                          >
                            <Film className="w-2.5 h-2.5" />
                            <span>REEL</span>
                          </button>
                        )}

                        {/* Discount badge on image */}
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="absolute top-1.5 left-1.5 z-10 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
                            <Tag className="w-2.5 h-2.5" />
                            <span>
                              {item.discountLabel ||
                                `${Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF`}
                            </span>
                          </span>
                        )}

                        {/* Out of Stock overlay if item is not available or stock is 0 */}
                        {(!item.isAvailable || (item.hasStockTracking && (item.stockQuantity ?? 0) <= 0)) && (
                          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                            <span className="bg-rose-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow-md tracking-wider">
                              Sold Out
                            </span>
                          </div>
                        )}

                        {/* Add / Quantity Button overlaid at bottom */}
                        <div className="absolute -bottom-1">
                          {hasVariants ? (
                            <button
                              type="button"
                              onClick={() => {
                                setVariantModalItem(item);
                                setSelectedVariant(
                                  item.variants?.find((v) => v.isDefault) || item.variants?.[0] || null
                                );
                                setVariantQuantity(1);
                              }}
                              disabled={!item.isAvailable || (item.hasStockTracking && (item.stockQuantity ?? 0) <= 0)}
                              className={`px-3 py-1.5 font-black text-xs rounded-xl shadow-lg transition active:scale-95 uppercase tracking-wider flex items-center gap-1 ${
                                item.isAvailable && (!item.hasStockTracking || (item.stockQuantity ?? 0) > 0)
                                  ? 'bg-white text-orange-600 border border-slate-200 hover:bg-orange-50'
                                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              <span>
                                {item.isAvailable && (!item.hasStockTracking || (item.stockQuantity ?? 0) > 0)
                                  ? totalItemQty > 0
                                    ? `ADD + (${totalItemQty})`
                                    : 'CUSTOMISE'
                                  : 'Sold Out'}
                              </span>
                              {item.isAvailable && (!item.hasStockTracking || (item.stockQuantity ?? 0) > 0) && (
                                <Plus className="w-3 h-3 text-orange-600" />
                              )}
                            </button>
                          ) : qty === 0 ? (
                            <button
                              type="button"
                              onClick={() => addToCart(item)}
                              disabled={!item.isAvailable || (item.hasStockTracking && (item.stockQuantity ?? 0) <= 0)}
                              className={`px-4 py-1.5 font-black text-xs rounded-xl shadow-lg transition active:scale-95 uppercase tracking-wider ${
                                item.isAvailable && (!item.hasStockTracking || (item.stockQuantity ?? 0) > 0)
                                  ? 'bg-white text-orange-600 border border-slate-200 hover:bg-orange-50'
                                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              {item.isAvailable && (!item.hasStockTracking || (item.stockQuantity ?? 0) > 0)
                                ? 'ADD'
                                : 'Sold Out'}
                            </button>
                          ) : (
                            <div className="flex items-center bg-orange-600 text-white rounded-xl shadow-lg border border-orange-500 overflow-hidden text-xs font-black">
                              <button
                                type="button"
                                onClick={() => updateCartQuantity(item.id, -1)}
                                className="px-2 py-1.5 hover:bg-orange-700 transition"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2.5">{qty}</span>
                              <button
                                type="button"
                                onClick={() => updateCartQuantity(item.id, 1)}
                                className="px-2 py-1.5 hover:bg-orange-700 transition"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* FSSAI & Legal Info Footer */}
      <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>
            FSSAI License: <span className="font-mono font-bold text-slate-800">{restaurant.kyc.fssaiNumber}</span>
          </span>
        </div>
        <div>
          <span>Zone: </span>
          <span className="font-semibold text-slate-800">
            {zones.find((z) => z.id === restaurant.zoneId)?.name || 'Direct Service Area'}
          </span>
        </div>
      </div>

      {/* Variant Selection Modal */}
      {variantModalItem && selectedVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden max-h-[90vh]">
            {/* Header with Photo */}
            <div className="relative h-44 bg-slate-100 shrink-0">
              <img
                src={variantModalItem.image}
                alt={variantModalItem.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-black/20 to-transparent" />
              <button
                type="button"
                onClick={() => setVariantModalItem(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-700 transition backdrop-blur-xs shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-3.5 h-3.5 border-2 rounded flex items-center justify-center p-0.5 shrink-0 ${
                      variantModalItem.isVeg ? 'border-emerald-400 bg-emerald-950/40' : 'border-rose-400 bg-rose-950/40'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        variantModalItem.isVeg ? 'bg-emerald-400' : 'bg-rose-400'
                      }`}
                    />
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white/90">
                    {variantModalItem.category}
                  </span>
                </div>
                <h3 className="font-heading font-black text-base mt-0.5 leading-snug">
                  {variantModalItem.name}
                </h3>
              </div>
            </div>

            {/* Content / Variants List */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-orange-600" />
                    <span>Choose Size / Portion Option</span>
                  </h4>
                  <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">
                    Required
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Select your portion preference for this freshly prepared feast
                </p>
              </div>

              <div className="space-y-2">
                {variantModalItem.variants?.map((v) => {
                  const isSelected = selectedVariant.id === v.id;
                  const isStock = v.isAvailable !== false;
                  return (
                    <div
                      key={v.id}
                      onClick={() => {
                        if (!isStock) return;
                        setSelectedVariant(v);
                      }}
                      className={`p-3.5 rounded-2xl border-2 transition flex items-center justify-between gap-3 ${
                        !isStock
                          ? 'border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed'
                          : isSelected
                          ? 'border-orange-500 bg-orange-50/70 shadow-xs cursor-pointer'
                          : 'border-slate-200 hover:border-orange-200 hover:bg-slate-50/60 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                            !isStock
                              ? 'border-slate-300 bg-slate-200'
                              : isSelected
                              ? 'border-orange-600 bg-orange-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && isStock && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-slate-900">{v.name}</p>
                            {!isStock && (
                              <span className="text-[9px] font-black uppercase bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded">
                                Sold Out
                              </span>
                            )}
                          </div>
                          {v.isDefault && (
                            <span className="text-[10px] text-slate-400 font-medium">Standard size</span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900">₹{v.price}</span>
                        {v.originalPrice && (
                          <span className="text-xs text-slate-400 line-through block">
                            ₹{v.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quantity selector */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700">Quantity</span>
                <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setVariantQuantity(Math.max(1, variantQuantity - 1))}
                    className="p-2 hover:bg-slate-100 text-slate-600 transition"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-black text-slate-900">{variantQuantity}</span>
                  <button
                    type="button"
                    onClick={() => setVariantQuantity(variantQuantity + 1)}
                    className="p-2 hover:bg-slate-100 text-slate-600 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Item Total</p>
                <p className="text-base font-black text-slate-900 font-heading">
                  ₹{selectedVariant.price * variantQuantity}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!openStatus.isOpen) {
                    addNotification(
                      'Kitchen Closed',
                      `This restaurant is currently closed (${openStatus.timeBadgeText}). Orders cannot be placed right now.`,
                      'system'
                    );
                    return;
                  }
                  for (let i = 0; i < variantQuantity; i++) {
                    addToCart(variantModalItem, selectedVariant);
                  }
                  setVariantModalItem(null);
                }}
                className="py-3 px-6 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-600/25 transition active:scale-95 flex items-center gap-1.5"
              >
                <span>Add to Feast Cart</span>
                <span>• ₹{selectedVariant.price * variantQuantity}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Video Reel Modal */}
      <CustomerVideoReelModal
        isOpen={Boolean(activeReel)}
        onClose={() => setActiveReel(null)}
        data={activeReel}
      />
    </div>
  );
};
