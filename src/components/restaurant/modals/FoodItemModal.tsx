import React, { useState, useEffect } from 'react';
import {
  X,
  Utensils,
  CheckCircle,
  Sparkles,
  Flame,
  Plus,
  Trash2,
  Layers,
  Check,
  Info,
  Tag,
  Percent,
  Package,
  AlertTriangle,
  ShieldCheck,
  TrendingDown,
} from 'lucide-react';
import { MenuItem, RestaurantCategory, FoodVariant } from '../../../types';
import { PhotoUploadInput } from '../../common/PhotoUploadInput';

interface FoodItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<MenuItem, 'id'> | Partial<MenuItem>) => void;
  mode: 'add' | 'edit';
  item?: MenuItem | null;
  restaurantId: string;
  categories: RestaurantCategory[];
  onOpenAddCategory?: () => void;
}

export const FoodItemModal: React.FC<FoodItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  mode,
  item,
  restaurantId,
  categories,
  onOpenAddCategory,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('249');
  const [originalPrice, setOriginalPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80'
  );
  const [isVeg, setIsVeg] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [spiceLevel, setSpiceLevel] = useState<'mild' | 'medium' | 'spicy'>('medium');

  // Stocks & Inventory Management
  const [hasStockTracking, setHasStockTracking] = useState(false);
  const [stockQuantity, setStockQuantity] = useState('30');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');

  // Discounts & Promotional Offers
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage');
  const [discountValue, setDiscountValue] = useState('20');
  const [discountLabel, setDiscountLabel] = useState('');

  // Food Variants & Portions
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<FoodVariant[]>([]);

  useEffect(() => {
    if (item && mode === 'edit') {
      setName(item.name);
      setCategory(item.category);
      setPrice(String(item.price));
      setOriginalPrice(item.originalPrice ? String(item.originalPrice) : '');
      setDescription(item.description);
      setImage(item.image);
      setIsVeg(item.isVeg);
      setIsBestseller(Boolean(item.isBestseller));
      setIsAvailable(item.isAvailable);
      setSpiceLevel(item.spiceLevel || 'medium');

      // Stock Tracking
      const isTracked = Boolean(item.hasStockTracking || item.stockQuantity !== undefined);
      setHasStockTracking(isTracked);
      setStockQuantity(item.stockQuantity !== undefined ? String(item.stockQuantity) : '25');
      setLowStockThreshold(item.lowStockThreshold !== undefined ? String(item.lowStockThreshold) : '5');

      // Discounts
      const isDisc = Boolean(
        item.hasDiscount ||
        (item.originalPrice && item.originalPrice > item.price)
      );
      setHasDiscount(isDisc);
      setDiscountType(item.discountType || 'percentage');
      if (item.discountValue !== undefined) {
        setDiscountValue(String(item.discountValue));
      } else if (item.originalPrice && item.originalPrice > item.price) {
        const computedPct = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
        setDiscountValue(String(computedPct));
      } else {
        setDiscountValue('20');
      }
      setDiscountLabel(item.discountLabel || (item.originalPrice && item.originalPrice > item.price ? `${Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF` : ''));

      if (item.variants && item.variants.length > 0) {
        setHasVariants(true);
        setVariants(item.variants);
      } else {
        setHasVariants(false);
        setVariants([
          { id: 'v-1', name: 'Half (Serves 1)', price: item.price || 180, isDefault: true },
          { id: 'v-2', name: 'Full (Serves 2)', price: Math.round((item.price || 180) * 1.7), isDefault: false },
        ]);
      }
    } else {
      setName('');
      setCategory(categories[0]?.name || 'Main Course');
      setPrice('299');
      setOriginalPrice('');
      setDescription('');
      setImage('https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80');
      setIsVeg(false);
      setIsBestseller(false);
      setIsAvailable(true);
      setSpiceLevel('medium');

      // Defaults for new item
      setHasStockTracking(false);
      setStockQuantity('30');
      setLowStockThreshold('5');
      setHasDiscount(false);
      setDiscountType('percentage');
      setDiscountValue('20');
      setDiscountLabel('');

      setHasVariants(false);
      setVariants([
        { id: 'v-1', name: 'Half (Serves 1)', price: 180, isDefault: true },
        { id: 'v-2', name: 'Full (Serves 2)', price: 320, isDefault: false },
      ]);
    }
  }, [item, mode, isOpen, categories]);

  if (!isOpen) return null;

  const handleApplyPreset = (type: 'half_full' | 'regular_large' | 'small_med_large' | 'grams' | 'pieces' | 'combo') => {
    const baseP = Number(price) || 199;
    if (type === 'half_full') {
      setVariants([
        { id: `v-${Date.now()}-1`, name: 'Half (Serves 1)', price: baseP, isDefault: true, isAvailable: true },
        { id: `v-${Date.now()}-2`, name: 'Full (Serves 2)', price: Math.round(baseP * 1.7), isDefault: false, isAvailable: true },
      ]);
    } else if (type === 'regular_large') {
      setVariants([
        { id: `v-${Date.now()}-1`, name: 'Regular', price: baseP, isDefault: true, isAvailable: true },
        { id: `v-${Date.now()}-2`, name: 'Medium', price: Math.round(baseP * 1.5), isDefault: false, isAvailable: true },
        { id: `v-${Date.now()}-3`, name: 'Large', price: Math.round(baseP * 2.1), isDefault: false, isAvailable: true },
      ]);
    } else if (type === 'small_med_large') {
      setVariants([
        { id: `v-${Date.now()}-1`, name: 'Small (Personal)', price: baseP, isDefault: true, isAvailable: true },
        { id: `v-${Date.now()}-2`, name: 'Medium (Sharing)', price: Math.round(baseP * 1.5), isDefault: false, isAvailable: true },
        { id: `v-${Date.now()}-3`, name: 'Large (Party Size)', price: Math.round(baseP * 2.2), isDefault: false, isAvailable: true },
      ]);
    } else if (type === 'grams') {
      setVariants([
        { id: `v-${Date.now()}-1`, name: '250 gm', price: baseP, isDefault: true, isAvailable: true },
        { id: `v-${Date.now()}-2`, name: '500 gm', price: Math.round(baseP * 1.9), isDefault: false, isAvailable: true },
        { id: `v-${Date.now()}-3`, name: '1 Kg', price: Math.round(baseP * 3.6), isDefault: false, isAvailable: true },
      ]);
    } else if (type === 'pieces') {
      setVariants([
        { id: `v-${Date.now()}-1`, name: '2 Pieces', price: baseP, isDefault: true, isAvailable: true },
        { id: `v-${Date.now()}-2`, name: '4 Pieces', price: Math.round(baseP * 1.8), isDefault: false, isAvailable: true },
        { id: `v-${Date.now()}-3`, name: '6 Pieces', price: Math.round(baseP * 2.6), isDefault: false, isAvailable: true },
      ]);
    } else if (type === 'combo') {
      setVariants([
        { id: `v-${Date.now()}-1`, name: 'Solo Pack', price: baseP, isDefault: true, isAvailable: true },
        { id: `v-${Date.now()}-2`, name: 'Couple Combo', price: Math.round(baseP * 1.85), isDefault: false, isAvailable: true },
        { id: `v-${Date.now()}-3`, name: 'Family Feast Pack', price: Math.round(baseP * 3.4), isDefault: false, isAvailable: true },
      ]);
    }
  };

  const handleAddVariantRow = () => {
    setVariants((prev) => [
      ...prev,
      {
        id: `v-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: '',
        price: Number(price) || 199,
        isDefault: prev.length === 0,
        isAvailable: true,
      },
    ]);
  };

  const handleRemoveVariantRow = (id: string) => {
    setVariants((prev) => {
      const remaining = prev.filter((v) => v.id !== id);
      if (remaining.length > 0 && !remaining.some((v) => v.isDefault)) {
        remaining[0].isDefault = true;
      }
      return remaining;
    });
  };

  const handleUpdateVariantRow = (id: string, field: keyof FoodVariant, val: any) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (field === 'isDefault') {
          return { ...v, isDefault: v.id === id };
        }
        if (v.id === id) {
          return { ...v, [field]: val };
        }
        return v;
      })
    );
  };

  // Discount preset helpers
  const handleApplyDiscountPreset = (pct: number) => {
    setHasDiscount(true);
    setDiscountType('percentage');
    setDiscountValue(String(pct));
    setDiscountLabel(`${pct}% OFF`);

    const currentPrice = Number(price) || 200;
    const currentOrig = Number(originalPrice);

    if (currentOrig && currentOrig > 0) {
      const calculatedSelling = Math.max(1, Math.round(currentOrig * (1 - pct / 100)));
      setPrice(String(calculatedSelling));
    } else {
      const derivedOrig = Math.round(currentPrice / (1 - pct / 100));
      setOriginalPrice(String(derivedOrig));
    }
  };

  const handleApplyFlatDiscountPreset = (flatAmt: number) => {
    setHasDiscount(true);
    setDiscountType('flat');
    setDiscountValue(String(flatAmt));
    setDiscountLabel(`Flat ₹${flatAmt} OFF`);

    const currentPrice = Number(price) || 200;
    const currentOrig = Number(originalPrice);

    if (currentOrig && currentOrig > flatAmt) {
      setPrice(String(Math.max(1, currentOrig - flatAmt)));
    } else {
      setOriginalPrice(String(currentPrice + flatAmt));
    }
  };

  // Stock helpers
  const handleAdjustStock = (delta: number) => {
    setHasStockTracking(true);
    setStockQuantity((prev) => {
      const current = parseInt(prev, 10) || 0;
      const nextVal = Math.max(0, current + delta);
      if (nextVal === 0) setIsAvailable(false);
      else if (!isAvailable) setIsAvailable(true);
      return String(nextVal);
    });
  };

  const handleSetStockDirect = (qty: number) => {
    setHasStockTracking(true);
    const clamped = Math.max(0, qty);
    setStockQuantity(String(clamped));
    if (clamped === 0) setIsAvailable(false);
    else if (!isAvailable) setIsAvailable(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const validVariants = hasVariants
      ? variants
          .filter((v) => v.name.trim() && Number(v.price) > 0)
          .map((v, idx) => ({
            ...v,
            name: v.name.trim(),
            price: Number(v.price),
            originalPrice: v.originalPrice ? Number(v.originalPrice) : undefined,
            isDefault: idx === 0 && !variants.some((itemV) => itemV.isDefault) ? true : Boolean(v.isDefault),
            isAvailable: v.isAvailable !== false,
          }))
      : [];

    const effectivePrice =
      validVariants.length > 0
        ? validVariants.find((v) => v.isDefault)?.price || validVariants[0].price
        : Number(price);

    const parsedStockQty = hasStockTracking ? Math.max(0, parseInt(stockQuantity, 10) || 0) : undefined;
    const isActuallyAvailable = hasStockTracking && parsedStockQty === 0 ? false : isAvailable;

    const parsedPrice = effectivePrice;
    const parsedOriginal = originalPrice ? Number(originalPrice) : undefined;
    const computedPercent =
      parsedOriginal && parsedOriginal > parsedPrice
        ? Math.round(((parsedOriginal - parsedPrice) / parsedOriginal) * 100)
        : undefined;

    onSave({
      restaurantId,
      name: name.trim(),
      category: category || categories[0]?.name || 'Starters',
      price: parsedPrice,
      originalPrice: parsedOriginal,
      // Stocks & Inventory
      hasStockTracking,
      stockQuantity: parsedStockQty,
      lowStockThreshold: hasStockTracking ? Math.max(1, parseInt(lowStockThreshold, 10) || 5) : undefined,
      // Discounts & Promotions
      hasDiscount: Boolean(hasDiscount && ((parsedOriginal && parsedOriginal > parsedPrice) || Number(discountValue) > 0)),
      discountType,
      discountValue: hasDiscount ? Number(discountValue) || 0 : undefined,
      discountPercent: computedPercent,
      discountLabel: hasDiscount ? (discountLabel.trim() || (computedPercent ? `${computedPercent}% OFF` : undefined)) : undefined,
      description: description.trim() || 'Prepared fresh with chef secret spices and ingredients.',
      image: image || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&auto=format&fit=crop&q=80',
      isVeg,
      isBestseller,
      isAvailable: isActuallyAvailable,
      spiceLevel,
      rating: item?.rating || 4.8,
      variants: validVariants.length > 0 ? validVariants : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black font-heading text-slate-900">
                {mode === 'add' ? 'Add New Food Item to Menu' : 'Edit Food Item Details'}
              </h3>
              <p className="text-xs text-slate-400">
                Manage your dishes, upload photos, and set pricing
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Dish Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Food Item Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Royal Nawabi Chicken Dum Biryani"
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500 font-medium"
            />
          </div>

          {/* Category & Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Category *</label>
                {onOpenAddCategory && (
                  <button
                    type="button"
                    onClick={onOpenAddCategory}
                    className="text-[10px] text-emerald-600 font-bold hover:underline inline-flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" />
                    <span>New</span>
                  </button>
                )}
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500 font-medium"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                required
                min={1}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="249"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Original Price (₹) <span className="text-slate-400 font-normal">(Optional MRP)</span>
              </label>
              <input
                type="number"
                min={1}
                value={originalPrice}
                onChange={(e) => {
                  const val = e.target.value;
                  setOriginalPrice(val);
                  if (val && Number(val) > Number(price)) {
                    setHasDiscount(true);
                  }
                }}
                placeholder="299 (Strikethrough)"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500 font-medium"
              />
            </div>
          </div>

          {/* Discounts & Special Offers Section */}
          <div className="p-4 bg-amber-50/50 rounded-2xl border-2 border-amber-200/80 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
                  <Percent className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-900 tracking-wide flex items-center gap-1.5">
                    <span>Discounts & Special Offers</span>
                    <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.2 rounded-full">
                      Hot Deals
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Add percentage or flat rupee discounts with automatic strikethrough MRP & badges
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-amber-200 shadow-2xs">
                <input
                  type="checkbox"
                  checked={hasDiscount}
                  onChange={(e) => {
                    const enabled = e.target.checked;
                    setHasDiscount(enabled);
                    if (enabled && !originalPrice) {
                      const currentP = Number(price) || 200;
                      setOriginalPrice(String(Math.round(currentP * 1.25)));
                      setDiscountLabel('20% OFF');
                    }
                  }}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <span className="text-xs font-extrabold text-slate-800">
                  {hasDiscount ? 'Discount Active ✓' : 'Enable Discount'}
                </span>
              </label>
            </div>

            {hasDiscount && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-1">
                {/* Discount Mode / Type */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDiscountType('percentage');
                      setDiscountValue('20');
                      setDiscountLabel('20% OFF');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-black border transition flex items-center justify-center gap-1.5 ${
                      discountType === 'percentage'
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Percent className="w-3.5 h-3.5" />
                    <span>Percentage (% OFF)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDiscountType('flat');
                      setDiscountValue('50');
                      setDiscountLabel('Flat ₹50 OFF');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-black border transition flex items-center justify-center gap-1.5 ${
                      discountType === 'flat'
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>Flat Rupee (₹ OFF)</span>
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-500 mr-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    Quick Deals:
                  </span>
                  {discountType === 'percentage' ? (
                    <>
                      {[10, 15, 20, 25, 30, 40, 50].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => handleApplyDiscountPreset(pct)}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition ${
                            Number(discountValue) === pct
                              ? 'bg-amber-600 text-white border-amber-700 shadow-2xs'
                              : 'bg-white hover:bg-amber-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {pct}% OFF
                        </button>
                      ))}
                    </>
                  ) : (
                    <>
                      {[20, 30, 50, 75, 100, 150].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => handleApplyFlatDiscountPreset(amt)}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition ${
                            Number(discountValue) === amt
                              ? 'bg-amber-600 text-white border-amber-700 shadow-2xs'
                              : 'bg-white hover:bg-amber-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          Flat ₹{amt}
                        </button>
                      ))}
                    </>
                  )}
                </div>

                {/* Input controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      {discountType === 'percentage' ? 'Discount Percentage (%) *' : 'Flat Discount Amount (₹) *'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={1}
                        max={discountType === 'percentage' ? 99 : 5000}
                        value={discountValue}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDiscountValue(val);
                          const numVal = Number(val) || 0;
                          if (discountType === 'percentage') {
                            setDiscountLabel(numVal > 0 ? `${numVal}% OFF` : '');
                            if (originalPrice && Number(originalPrice) > 0 && numVal > 0) {
                              setPrice(String(Math.max(1, Math.round(Number(originalPrice) * (1 - numVal / 100)))));
                            }
                          } else {
                            setDiscountLabel(numVal > 0 ? `Flat ₹${numVal} OFF` : '');
                            if (originalPrice && Number(originalPrice) > numVal) {
                              setPrice(String(Math.max(1, Number(originalPrice) - numVal)));
                            }
                          }
                        }}
                        placeholder={discountType === 'percentage' ? '20' : '50'}
                        className="w-full text-xs p-2.5 bg-white border border-amber-300 rounded-xl focus:outline-amber-500 font-bold"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                        {discountType === 'percentage' ? '%' : '₹'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Deal Badge Tag <span className="text-slate-400 font-normal">(Display Label)</span>
                    </label>
                    <input
                      type="text"
                      value={discountLabel}
                      onChange={(e) => setDiscountLabel(e.target.value)}
                      placeholder="e.g. 20% OFF or Deal of the Day"
                      className="w-full text-xs p-2.5 bg-white border border-amber-300 rounded-xl focus:outline-amber-500 font-medium"
                    />
                  </div>
                </div>

                {/* Real-time Savings Breakdown Banner */}
                {Number(originalPrice) > Number(price) && (
                  <div className="p-2.5 bg-white rounded-xl border border-amber-200/90 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                        {discountLabel || `${Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100)}% OFF`}
                      </span>
                      <span className="text-xs text-slate-600">
                        MRP: <span className="line-through font-semibold text-slate-400">₹{originalPrice}</span> ➔ Selling Price: <span className="font-black text-slate-900">₹{price}</span>
                      </span>
                    </div>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                      Customer Saves ₹{Number(originalPrice) - Number(price)}!
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stocks & Inventory Management Section */}
          <div className="p-4 bg-sky-50/50 rounded-2xl border-2 border-sky-200/80 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-200/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-sky-100 text-sky-800 rounded-lg">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-900 tracking-wide flex items-center gap-1.5">
                    <span>Food Item Stocks & Inventory</span>
                    <span className="text-[10px] font-bold bg-sky-200 text-sky-900 px-2 py-0.2 rounded-full">
                      Kitchen Portions
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Track available dish quantities, set low-stock thresholds, or keep unlimited
                  </p>
                </div>
              </div>

              {/* Toggle: Unlimited vs Track Inventory */}
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-sky-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => {
                    setHasStockTracking(false);
                    setIsAvailable(true);
                  }}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                    !hasStockTracking
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Unlimited
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHasStockTracking(true);
                    if (!stockQuantity || stockQuantity === '0') setStockQuantity('25');
                  }}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                    hasStockTracking
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Track Units
                </button>
              </div>
            </div>

            {hasStockTracking ? (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Quantity in stock */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Available Stock Quantity (Portions) *
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAdjustStock(-1)}
                        className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-black border border-slate-200 flex items-center justify-center transition active:scale-95"
                        title="Decrease by 1"
                      >
                        -1
                      </button>
                      <input
                        type="number"
                        min={0}
                        value={stockQuantity}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStockQuantity(val);
                          const num = parseInt(val, 10);
                          if (num === 0) {
                            setIsAvailable(false);
                          } else if (num > 0 && !isAvailable) {
                            setIsAvailable(true);
                          }
                        }}
                        className="w-full text-center text-sm font-black p-2 bg-white border border-sky-300 rounded-xl focus:outline-sky-500 text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => handleAdjustStock(1)}
                        className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-black border border-slate-200 flex items-center justify-center transition active:scale-95"
                        title="Increase by 1"
                      >
                        +1
                      </button>
                    </div>
                  </div>

                  {/* Low Stock Alert Threshold */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Low Stock Warning Threshold
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(e.target.value)}
                      placeholder="5"
                      className="w-full text-xs p-2.5 bg-white border border-sky-300 rounded-xl focus:outline-sky-500 font-medium"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Triggers low stock notice when {lowStockThreshold || 5} or fewer units remain
                    </p>
                  </div>
                </div>

                {/* Quick Quantity Shortcuts */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-500 mr-1">Quick Add:</span>
                  <button
                    type="button"
                    onClick={() => handleAdjustStock(5)}
                    className="px-2 py-0.5 bg-white hover:bg-sky-50 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition"
                  >
                    +5
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustStock(10)}
                    className="px-2 py-0.5 bg-white hover:bg-sky-50 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition"
                  >
                    +10
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustStock(25)}
                    className="px-2 py-0.5 bg-white hover:bg-sky-50 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition"
                  >
                    +25
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetStockDirect(50)}
                    className="px-2 py-0.5 bg-white hover:bg-sky-50 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition"
                  >
                    Set 50
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSetStockDirect(0);
                      setIsAvailable(false);
                    }}
                    className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-[11px] font-black rounded-lg transition ml-auto"
                  >
                    Mark 0 (Sold Out)
                  </button>
                </div>

                {/* Live Status indicator */}
                <div className="p-2.5 bg-white rounded-xl border border-sky-200/90 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2">
                    {parseInt(stockQuantity, 10) === 0 ? (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                        <span className="text-xs font-black text-rose-700">Out of Stock (0 units left)</span>
                      </>
                    ) : parseInt(stockQuantity, 10) <= (parseInt(lowStockThreshold, 10) || 5) ? (
                      <>
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-black text-amber-800">
                          Low Stock Alert: Only {stockQuantity} portions remaining!
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-black text-emerald-800">
                          In Stock: {stockQuantity} portions ready to prepare
                        </span>
                      </>
                    )}
                  </div>

                  <span className="text-[10px] font-bold text-slate-400">
                    Auto-decrements on customer orders
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-white rounded-xl border border-sky-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  <span className="text-xs font-bold text-slate-700">
                    Unlimited Portions (Continuous Kitchen Availability)
                  </span>
                </div>
                <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Always In Stock
                </span>
              </div>
            )}
          </div>

          {/* Food Variants & Portions Section */}
          <div className="p-4 bg-emerald-50/40 rounded-2xl border-2 border-emerald-200/80 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-900 tracking-wide flex items-center gap-1.5">
                    <span>Food Variants & Portions</span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full">
                      Sizes & Portions
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Allow customers to pick Half/Full, Regular/Large, weights, or piece quantities
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs">
                <input
                  type="checkbox"
                  checked={hasVariants}
                  onChange={(e) => setHasVariants(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-xs font-extrabold text-slate-800">
                  {hasVariants ? 'Variants Enabled ✓' : 'Enable Variants'}
                </span>
              </label>
            </div>

            {hasVariants && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-1">
                {/* Presets */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-500 mr-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Quick Presets:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('half_full')}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition"
                  >
                    Half / Full
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('regular_large')}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition"
                  >
                    Regular / Med / Large
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('small_med_large')}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition"
                  >
                    Small / Med / Large
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('grams')}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition"
                  >
                    250g / 500g / 1kg
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('pieces')}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition"
                  >
                    2 Pcs / 4 Pcs / 6 Pcs
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('combo')}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 border border-slate-200 text-slate-700 text-[11px] font-bold rounded-lg transition"
                  >
                    Solo / Couple / Family
                  </button>
                </div>

                {/* Variants List */}
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-[10px] font-bold uppercase text-slate-500 px-1">
                    <div className="col-span-1 text-center" title="Default pre-selected variant for customers">Def</div>
                    <div className="col-span-4 sm:col-span-4">Variant / Size Name *</div>
                    <div className="col-span-3 sm:col-span-3">Selling Price (₹) *</div>
                    <div className="col-span-2 sm:col-span-2">Original (₹)</div>
                    <div className="col-span-2 sm:col-span-2 text-center">Status / Del</div>
                  </div>

                  {variants.map((v) => (
                    <div
                      key={v.id}
                      className={`grid grid-cols-12 gap-2 items-center bg-white p-2 rounded-xl border transition ${
                        v.isDefault ? 'border-emerald-400 ring-1 ring-emerald-300/40 shadow-xs' : 'border-slate-200 shadow-2xs'
                      }`}
                    >
                      {/* Default Radio */}
                      <div className="col-span-1 flex items-center justify-center">
                        <input
                          type="radio"
                          name="defaultVariantRadio"
                          checked={Boolean(v.isDefault)}
                          onChange={() => handleUpdateVariantRow(v.id, 'isDefault', true)}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          title="Set as pre-selected default variant"
                        />
                      </div>

                      {/* Name */}
                      <div className="col-span-4 sm:col-span-4">
                        <input
                          type="text"
                          required
                          value={v.name}
                          onChange={(e) => handleUpdateVariantRow(v.id, 'name', e.target.value)}
                          placeholder="e.g. Half (Serves 1)"
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold focus:bg-white focus:outline-emerald-500"
                        />
                      </div>

                      {/* Price */}
                      <div className="col-span-3 sm:col-span-3">
                        <input
                          type="number"
                          required
                          min={1}
                          value={v.price}
                          onChange={(e) => handleUpdateVariantRow(v.id, 'price', e.target.value)}
                          placeholder="180"
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:bg-white focus:outline-emerald-500"
                        />
                      </div>

                      {/* Original Price */}
                      <div className="col-span-2 sm:col-span-2">
                        <input
                          type="number"
                          min={1}
                          value={v.originalPrice || ''}
                          onChange={(e) => handleUpdateVariantRow(v.id, 'originalPrice', e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="MRP"
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-500 focus:bg-white focus:outline-emerald-500"
                        />
                      </div>

                      {/* In Stock toggle + Delete */}
                      <div className="col-span-2 sm:col-span-2 flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateVariantRow(v.id, 'isAvailable', v.isAvailable === false ? true : false)}
                          className={`text-[9px] font-black px-1.5 py-1 rounded transition ${
                            v.isAvailable !== false
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                          }`}
                          title="Click to toggle in stock / out of stock"
                        >
                          {v.isAvailable !== false ? 'In Stock' : 'Sold Out'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveVariantRow(v.id)}
                          disabled={variants.length <= 1}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:bg-transparent"
                          title="Delete variant"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleAddVariantRow}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1 transition active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Another Variant</span>
                  </button>

                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Customers can pick their preferred size directly on the menu or cart</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Dish Description & Ingredients
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Fresh farm-raised chicken marinated in saffron curd, slow cooked on low charcoal flame..."
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500"
            />
          </div>

          {/* Photo Upload Option */}
          <div className="pt-1">
            <PhotoUploadInput
              label="Dish Photo Upload"
              value={image}
              onChange={setImage}
              helperText="Upload dish photo from device or choose from HD food library"
              required={true}
            />
          </div>

          {/* Preferences & Dietary Tags */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Veg / Non-Veg Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isVegCheckbox"
                checked={isVeg}
                onChange={(e) => setIsVeg(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="isVegCheckbox" className="text-xs font-bold text-slate-700 cursor-pointer">
                {isVeg ? '🥗 Pure Vegetarian' : '🍗 Non-Vegetarian'}
              </label>
            </div>

            {/* Bestseller */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isBestsellerCheckbox"
                checked={isBestseller}
                onChange={(e) => setIsBestseller(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
              />
              <label htmlFor="isBestsellerCheckbox" className="text-xs font-bold text-slate-700 cursor-pointer">
                ⭐ Mark Bestseller
              </label>
            </div>

            {/* Spice Level */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                Spice Level
              </label>
              <select
                value={spiceLevel}
                onChange={(e) => setSpiceLevel(e.target.value as any)}
                className="w-full text-xs p-1.5 bg-white border border-slate-200 rounded-lg font-medium"
              >
                <option value="mild">🌶️ Mild</option>
                <option value="medium">🌶️🌶️ Medium</option>
                <option value="spicy">🌶️🌶️🌶️ Spicy</option>
              </select>
            </div>
          </div>

          {/* In Stock Availability */}
          <div className="flex items-center justify-between p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl">
            <div>
              <p className="text-xs font-bold text-slate-800">Available to Order (Customer Visible)</p>
              <p className="text-[11px] text-slate-500">
                {hasStockTracking
                  ? Number(stockQuantity) > 0
                    ? `Item is active with ${stockQuantity} units in stock`
                    : 'Inventory is 0 (marked Sold Out automatically)'
                  : 'Customers can place orders continuously'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const nextAvail = !isAvailable;
                setIsAvailable(nextAvail);
                if (nextAvail && hasStockTracking && Number(stockQuantity) === 0) {
                  setStockQuantity('15');
                }
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                isAvailable
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              {isAvailable ? 'In Stock ✓' : 'Out of Stock'}
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{mode === 'add' ? 'Add Dish to Menu' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
