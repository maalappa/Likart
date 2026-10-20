import React, { useState, useMemo, useEffect } from 'react';
import {
  Zap,
  Clock,
  MapPin,
  Search,
  X,
  Plus,
  Minus,
  Check,
  Sparkles,
  ShoppingBag,
  Flame,
  ShieldCheck,
  ChevronRight,
  Truck,
  RotateCcw,
  Tag,
  ArrowRight,
  Store,
  Filter,
  LayoutGrid,
  ListFilter,
  SlidersHorizontal,
  ArrowUpDown,
  CheckCircle2,
  Heart,
  ChevronDown,
  Layers,
  AlertTriangle,
  Film,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  QUICK_COMMERCE_CATEGORIES,
  QUICK_COMMERCE_ITEMS,
  quickCommerceItemToMenuItem,
} from '../../data/quickCommerceData';
import { QuickCommerceItem, QuickCommerceCategory, QuickCommerceVariant } from '../../types';
import { MartHeroBanners } from './mart/MartHeroBanners';
import { MartSearchAndFilter } from './mart/MartSearchAndFilter';
import { CustomerVideoReelModal, VideoReelData } from './CustomerVideoReelModal';

interface QuickCommerceViewProps {
  onSwitchToFoodDelivery: () => void;
  setIsCartOpen: (open: boolean) => void;
  initialCategory?: string;
}

// Color and styling presets matching signature quick-commerce visual designs
const CATEGORY_STYLE_MAP: Record<
  string,
  {
    bg: string;
    border: string;
    hoverBorder: string;
    text: string;
    tagBg: string;
    accentGlow: string;
  }
> = {
  fruits_vegetables: {
    bg: 'bg-emerald-50/80',
    border: 'border-emerald-200/80',
    hoverBorder: 'hover:border-emerald-500',
    text: 'text-emerald-950',
    tagBg: 'bg-emerald-600',
    accentGlow: 'hover:shadow-emerald-100',
  },
  fresh_fruits: {
    bg: 'bg-rose-50/80',
    border: 'border-rose-200/80',
    hoverBorder: 'hover:border-rose-500',
    text: 'text-rose-950',
    tagBg: 'bg-rose-600',
    accentGlow: 'hover:shadow-rose-100',
  },
  dairy_breakfast: {
    bg: 'bg-amber-50/80',
    border: 'border-amber-200/80',
    hoverBorder: 'hover:border-amber-500',
    text: 'text-amber-950',
    tagBg: 'bg-amber-600',
    accentGlow: 'hover:shadow-amber-100',
  },
  meat_seafood: {
    bg: 'bg-red-50/80',
    border: 'border-red-200/80',
    hoverBorder: 'hover:border-red-500',
    text: 'text-red-950',
    tagBg: 'bg-red-600',
    accentGlow: 'hover:shadow-red-100',
  },
  atta_rice_oil: {
    bg: 'bg-yellow-50/80',
    border: 'border-yellow-200/80',
    hoverBorder: 'hover:border-yellow-500',
    text: 'text-yellow-950',
    tagBg: 'bg-yellow-700',
    accentGlow: 'hover:shadow-yellow-100',
  },
  masalas: {
    bg: 'bg-orange-50/80',
    border: 'border-orange-200/80',
    hoverBorder: 'hover:border-orange-500',
    text: 'text-orange-950',
    tagBg: 'bg-orange-600',
    accentGlow: 'hover:shadow-orange-100',
  },
  oils_ghee: {
    bg: 'bg-amber-50/80',
    border: 'border-amber-200/80',
    hoverBorder: 'hover:border-amber-500',
    text: 'text-amber-950',
    tagBg: 'bg-amber-600',
    accentGlow: 'hover:shadow-amber-100',
  },
  cereals_breakfast: {
    bg: 'bg-yellow-50/80',
    border: 'border-yellow-200/80',
    hoverBorder: 'hover:border-yellow-500',
    text: 'text-yellow-950',
    tagBg: 'bg-yellow-600',
    accentGlow: 'hover:shadow-yellow-100',
  },
  cold_drinks: {
    bg: 'bg-teal-50/80',
    border: 'border-teal-200/80',
    hoverBorder: 'hover:border-teal-500',
    text: 'text-teal-950',
    tagBg: 'bg-teal-600',
    accentGlow: 'hover:shadow-teal-100',
  },
  ice_creams: {
    bg: 'bg-purple-50/80',
    border: 'border-purple-200/80',
    hoverBorder: 'hover:border-purple-500',
    text: 'text-purple-950',
    tagBg: 'bg-purple-600',
    accentGlow: 'hover:shadow-purple-100',
  },
  snacks_munchies: {
    bg: 'bg-orange-50/80',
    border: 'border-orange-200/80',
    hoverBorder: 'hover:border-orange-500',
    text: 'text-orange-950',
    tagBg: 'bg-orange-600',
    accentGlow: 'hover:shadow-orange-100',
  },
  chocolates_sweets: {
    bg: 'bg-fuchsia-50/80',
    border: 'border-fuchsia-200/80',
    hoverBorder: 'hover:border-fuchsia-500',
    text: 'text-fuchsia-950',
    tagBg: 'bg-fuchsia-600',
    accentGlow: 'hover:shadow-fuchsia-100',
  },
  biscuits_cookies: {
    bg: 'bg-amber-50/80',
    border: 'border-amber-200/80',
    hoverBorder: 'hover:border-amber-500',
    text: 'text-amber-950',
    tagBg: 'bg-amber-700',
    accentGlow: 'hover:shadow-amber-100',
  },
  tea_coffee: {
    bg: 'bg-stone-50/80',
    border: 'border-stone-200/80',
    hoverBorder: 'hover:border-stone-500',
    text: 'text-stone-950',
    tagBg: 'bg-stone-700',
    accentGlow: 'hover:shadow-stone-100',
  },
  sauces_spreads: {
    bg: 'bg-rose-50/80',
    border: 'border-rose-200/80',
    hoverBorder: 'hover:border-rose-500',
    text: 'text-rose-950',
    tagBg: 'bg-rose-600',
    accentGlow: 'hover:shadow-rose-100',
  },
  sweets_mithai: {
    bg: 'bg-pink-50/80',
    border: 'border-pink-200/80',
    hoverBorder: 'hover:border-pink-500',
    text: 'text-pink-950',
    tagBg: 'bg-pink-600',
    accentGlow: 'hover:shadow-pink-100',
  },
  household_cleaning: {
    bg: 'bg-sky-50/80',
    border: 'border-sky-200/80',
    hoverBorder: 'hover:border-sky-500',
    text: 'text-sky-950',
    tagBg: 'bg-sky-600',
    accentGlow: 'hover:shadow-sky-100',
  },
  personal_care: {
    bg: 'bg-pink-50/80',
    border: 'border-pink-200/80',
    hoverBorder: 'hover:border-pink-500',
    text: 'text-pink-950',
    tagBg: 'bg-pink-600',
    accentGlow: 'hover:shadow-pink-100',
  },
  baby_wellness: {
    bg: 'bg-blue-50/80',
    border: 'border-blue-200/80',
    hoverBorder: 'hover:border-blue-500',
    text: 'text-blue-950',
    tagBg: 'bg-blue-600',
    accentGlow: 'hover:shadow-blue-100',
  },
  all: {
    bg: 'bg-slate-50/90',
    border: 'border-slate-200/80',
    hoverBorder: 'hover:border-emerald-500',
    text: 'text-slate-900',
    tagBg: 'bg-emerald-600',
    accentGlow: 'hover:shadow-emerald-100',
  },
};

// Department grouped layout matching reference photo rows
const REFERENCE_DEPARTMENT_SECTIONS = [
  {
    id: 'fresh',
    title: 'Fresh Produce & Daily Harvest',
    subtitle: 'Direct farm veggies, seasonal fruits, milk, eggs & fresh cuts',
    icon: '🥦',
    badge: 'FRESH 6 AM',
    categoryIds: ['fruits_vegetables', 'fresh_fruits', 'dairy_breakfast', 'meat_seafood'],
  },
  {
    id: 'grocery',
    title: 'Grocery, Atta & Kitchen Staples',
    subtitle: 'Daily grain flour, fragrant rice, pure dals, aromatic masalas & ghee',
    icon: '🍚',
    badge: 'MANDI STAPLES',
    categoryIds: ['atta_rice_oil', 'masalas', 'oils_ghee', 'cereals_breakfast'],
  },
  {
    id: 'snacks',
    title: 'Snacks, Munchies & Chilled Drinks',
    subtitle: 'Chilled sodas, instant ice creams, crunchy chips & fine chocolates',
    icon: '🍿',
    badge: 'CHILLED 10M',
    categoryIds: ['cold_drinks', 'ice_creams', 'snacks_munchies', 'chocolates_sweets'],
  },
  {
    id: 'beverages',
    title: 'Beverages, Bakery & Sweet Treats',
    subtitle: 'Crisp biscuits, roasted coffee & tea, dips, sauces & sweet desserts',
    icon: '🍪',
    badge: 'TEA TIME',
    categoryIds: ['biscuits_cookies', 'tea_coffee', 'sauces_spreads', 'sweets_mithai'],
  },
  {
    id: 'household',
    title: 'Household Essentials & Wellness',
    subtitle: 'Cleaning detergents, personal care hygiene & safe baby care',
    icon: '🧼',
    badge: 'ESSENTIALS',
    categoryIds: ['household_cleaning', 'personal_care', 'baby_wellness', 'all'],
  },
];

export const QuickCommerceView: React.FC<QuickCommerceViewProps> = ({
  onSwitchToFoodDelivery,
  setIsCartOpen,
  initialCategory,
}) => {
  const {
    currentLocation,
    currentZone,
    cart,
    addToCart,
    updateCartQuantity,
    cartTotals,
    addNotification,
    setActivePortal,
    setAdminInitialTab,
    martProducts,
    martCategories,
    martServiceConfig,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [categoryViewMode, setCategoryViewMode] = useState<'scannable_grid' | 'grouped_rows'>('scannable_grid');
  const [activeReelItem, setActiveReelItem] = useState<VideoReelData | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [categorySearchQuery, setCategorySearchQuery] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterVegOnly, setFilterVegOnly] = useState<boolean>(false);
  const [filterNonVegOnly, setFilterNonVegOnly] = useState<boolean>(false);
  const [filterDiscountOnly, setFilterDiscountOnly] = useState<boolean>(false);
  const [filterUnder100, setFilterUnder100] = useState<boolean>(false);
  const [filterTopRated, setFilterTopRated] = useState<boolean>(false);
  const [filterBestsellerOnly, setFilterBestsellerOnly] = useState<boolean>(false);
  const [filterInStockOnly, setFilterInStockOnly] = useState<boolean>(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [minDiscountPercent, setMinDiscountPercent] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<
    'popular' | 'price_low' | 'price_high' | 'discount' | 'rating' | 'alphabetical'
  >('popular');

  const setPriceRange = (min: number | null, max: number | null) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  const handleResetAllFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setFilterVegOnly(false);
    setFilterNonVegOnly(false);
    setFilterDiscountOnly(false);
    setFilterUnder100(false);
    setFilterTopRated(false);
    setFilterBestsellerOnly(false);
    setFilterInStockOnly(false);
    setSelectedBrands([]);
    setMinPrice(null);
    setMaxPrice(null);
    setMinDiscountPercent(null);
    setSortBy('popular');
  };

  const [addedItemAnimId, setAddedItemAnimId] = useState<string | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [activeVariantModalItem, setActiveVariantModalItem] = useState<QuickCommerceItem | null>(null);

  const allAvailableCategories = useMemo(() => {
    return martCategories && martCategories.length > 0 ? martCategories : QUICK_COMMERCE_CATEGORIES;
  }, [martCategories]);

  // Total products count per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    let total = 0;
    (martProducts || []).forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
      total++;
    });
    counts['all'] = total;
    return counts;
  }, [martProducts]);

  // Department tabs
  const departmentTabs = [
    { id: 'all', label: 'All Aisles', icon: '⚡' },
    { id: 'fresh', label: 'Fresh Produce', icon: '🥦' },
    { id: 'grocery', label: 'Kitchen & Staples', icon: '🍚' },
    { id: 'snacks', label: 'Snacks & Drinks', icon: '🍿' },
    { id: 'household', label: 'Home & Wellness', icon: '🧼' },
  ];

  const departmentCategoryMap: Record<string, string[]> = {
    fresh: ['fruits_vegetables', 'fresh_fruits', 'dairy_breakfast', 'meat_seafood'],
    grocery: ['atta_rice_oil', 'masalas', 'oils_ghee', 'cereals_breakfast'],
    snacks: ['cold_drinks', 'ice_creams', 'snacks_munchies', 'chocolates_sweets', 'biscuits_cookies', 'tea_coffee', 'sauces_spreads', 'sweets_mithai'],
    household: ['household_cleaning', 'personal_care', 'baby_wellness'],
  };

  const displayedCategories = useMemo(() => {
    let cats = allAvailableCategories;
    if (selectedDepartment !== 'all') {
      const allowed = departmentCategoryMap[selectedDepartment] || [];
      cats = cats.filter((c) => c.id === 'all' || allowed.includes(c.id));
    }
    if (categorySearchQuery.trim()) {
      const q = categorySearchQuery.toLowerCase().trim();
      cats = cats.filter(
        (c) => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
      );
    }
    return cats;
  }, [allAvailableCategories, selectedDepartment, categorySearchQuery]);

  // Filter items based on category, search, dietary preference, brands, price range, and sorting
  const filteredItems = useMemo(() => {
    let items = (martProducts || []).filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Veg only
      if (filterVegOnly && !item.isVeg) {
        return false;
      }

      // Non-veg only
      if (filterNonVegOnly && item.isVeg) {
        return false;
      }

      // Discount only
      if (filterDiscountOnly && (!item.discountPercent || item.discountPercent <= 0)) {
        return false;
      }

      // Minimum discount percent
      if (
        minDiscountPercent !== null &&
        (!item.discountPercent || item.discountPercent < minDiscountPercent)
      ) {
        return false;
      }

      // Under 100
      if (filterUnder100 && item.price >= 100) {
        return false;
      }

      // Top rated (4.5+)
      if (filterTopRated && (item.rating || 0) < 4.5) {
        return false;
      }

      // Bestseller only
      if (filterBestsellerOnly && !item.isBestseller) {
        return false;
      }

      // In stock only
      if (filterInStockOnly && item.inStock === false) {
        return false;
      }

      // Selected brands
      if (
        selectedBrands.length > 0 &&
        (!item.brand || !selectedBrands.includes(item.brand))
      ) {
        return false;
      }

      // Price range
      if (minPrice !== null && item.price < minPrice) {
        return false;
      }
      if (maxPrice !== null && item.price > maxPrice) {
        return false;
      }

      // Search query (multi-word token matching across name, brand, description, unit, category)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const tokens = q.split(/\s+/).filter(Boolean);
        const matchesAllTokens = tokens.every(
          (t) =>
            item.name.toLowerCase().includes(t) ||
            item.brand.toLowerCase().includes(t) ||
            (item.description || '').toLowerCase().includes(t) ||
            item.unit.toLowerCase().includes(t) ||
            item.category.toLowerCase().includes(t)
        );
        if (!matchesAllTokens) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    if (sortBy === 'price_low') {
      items = [...items].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_high') {
      items = [...items].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'discount') {
      items = [...items].sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
    } else if (sortBy === 'rating') {
      items = [...items].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'alphabetical') {
      items = [...items].sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Default: bestsellers first
      items = [...items].sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
    }

    return items;
  }, [
    martProducts,
    selectedCategory,
    searchQuery,
    filterVegOnly,
    filterNonVegOnly,
    filterDiscountOnly,
    minDiscountPercent,
    filterUnder100,
    filterTopRated,
    filterBestsellerOnly,
    filterInStockOnly,
    selectedBrands,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  // Spotlight carousel items
  const bestsellers = useMemo(() => {
    return (martProducts || []).filter((p) => p.isBestseller).slice(0, 8);
  }, [martProducts]);

  const freshHarvestItems = useMemo(() => {
    return (martProducts || []).filter((p) => p.category === 'fruits_vegetables' || p.category === 'fresh_fruits').slice(0, 8);
  }, [martProducts]);

  const snacksAndDrinks = useMemo(() => {
    return (martProducts || []).filter((p) => p.category === 'snacks_munchies' || p.category === 'cold_drinks').slice(0, 8);
  }, [martProducts]);

  // Resolve active variant for an item
  const getActiveVariant = (qcItem: QuickCommerceItem): QuickCommerceVariant | undefined => {
    if (!qcItem.variants || qcItem.variants.length === 0) return undefined;
    const selectedId = selectedVariants[qcItem.id] || qcItem.selectedVariantId;
    if (selectedId) {
      const found = qcItem.variants.find((v) => v.id === selectedId);
      if (found) return found;
    }
    return qcItem.variants.find((v) => v.isDefault) || qcItem.variants[0];
  };

  // Get cart quantity for a specific variant or the active variant
  const getCartQuantity = (qcId: string, variantId?: string): number => {
    if (variantId) {
      const targetId = `${qcId}__${variantId}`;
      const inCart = cart.find(
        (ci) =>
          ci.item.id === targetId ||
          (ci.item.id === qcId && ci.selectedVariant?.id === variantId)
      );
      return inCart ? inCart.quantity : 0;
    }
    const activeVarId = selectedVariants[qcId];
    if (activeVarId) {
      const targetId = `${qcId}__${activeVarId}`;
      const inCart = cart.find(
        (ci) =>
          ci.item.id === targetId ||
          (ci.item.id === qcId && ci.selectedVariant?.id === activeVarId)
      );
      if (inCart) return inCart.quantity;
    }
    // Direct item match
    const exact = cart.find((ci) => ci.item.id === qcId);
    if (exact) return exact.quantity;

    // Variant prefixed match fallback
    const prefixMatch = cart.find((ci) => ci.item.id.startsWith(`${qcId}__`));
    return prefixMatch ? prefixMatch.quantity : 0;
  };

  // Total quantity of an item across all variants in basket
  const getTotalProductQuantity = (qcId: string): number => {
    return cart
      .filter((ci) => ci.item.id === qcId || ci.item.id.startsWith(`${qcId}__`))
      .reduce((sum, ci) => sum + ci.quantity, 0);
  };

  // Handle direct item or variant add
  const handleAddItem = (qcItem: QuickCommerceItem, specificVariant?: QuickCommerceVariant) => {
    if (martServiceConfig?.isActive === false) {
      addNotification(
        'Likart Mart Paused',
        martServiceConfig.deactivationNotice || 'Likart Mart is currently paused by administration. You can order from Likart Food!',
        'warning'
      );
      return;
    }
    const variant = specificVariant || getActiveVariant(qcItem);
    const menuItem = quickCommerceItemToMenuItem(qcItem, variant);
    addToCart(menuItem);
    setAddedItemAnimId(menuItem.id);
    setTimeout(() => setAddedItemAnimId(null), 1200);
    addNotification(
      'Added to Cart',
      `1x ${qcItem.name} (${variant ? variant.unit : qcItem.unit}) added for 10-minute delivery.`,
      'order'
    );
  };

  // Handle cart quantity update (+1 / -1) for variant or base item
  const handleUpdateItemQuantity = (
    qcItem: QuickCommerceItem,
    delta: number,
    specificVariant?: QuickCommerceVariant
  ) => {
    const variant = specificVariant || getActiveVariant(qcItem);
    const effectiveId = variant ? `${qcItem.id}__${variant.id}` : qcItem.id;
    const inCart = cart.find((ci) => ci.item.id === effectiveId);
    if (inCart) {
      updateCartQuantity(effectiveId, delta);
    } else {
      const fallback = cart.find(
        (ci) => ci.item.id === qcItem.id || ci.item.id.startsWith(`${qcItem.id}__`)
      );
      if (fallback) {
        updateCartQuantity(fallback.item.id, delta);
      }
    }
  };

  const handleSelectVariant = (qcItemId: string, variantId: string) => {
    setSelectedVariants((prev) => ({ ...prev, [qcItemId]: variantId }));
  };

  const selectedCatObj = allAvailableCategories.find((c) => c.id === selectedCategory);

  return (
    <div className="space-y-6 pb-24 animate-in fade-in">
      {/* 1. TOP HEADER & DELIVERY SLA BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-5 sm:p-7 shadow-xl border border-emerald-800/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 text-xs font-black uppercase tracking-wider shadow-xs">
                <Zap className="w-3.5 h-3.5 fill-emerald-300 text-emerald-300 animate-pulse" />
                <span>Likart Mart Express</span>
              </span>
              <span className="text-[11px] font-bold bg-white/10 text-emerald-200 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-300" />
                <span>10-12 Mins Guaranteed</span>
              </span>
              <span className="text-[11px] font-bold bg-amber-400/20 text-amber-300 px-2.5 py-1 rounded-full border border-amber-300/30">
                ⚡ 24/7 Micro-Fulfillment Pod
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-black tracking-tight text-white leading-tight">
              Groceries &amp; Daily Essentials{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200">
                in 10 Minutes.
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Farm-fresh produce, sealed dairy &amp; bread, pantry grains, chilled beverages, and home staples packed with micro-precision.
            </p>

            {/* Live Location & Speed Info */}
            <div className="pt-1 flex flex-wrap items-center gap-3 text-xs text-emerald-200">
              <div className="flex items-center gap-2 bg-black/30 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-white/15">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  Delivering to:{' '}
                  <strong className="text-white font-bold truncate max-w-[200px] inline-block align-bottom">
                    {currentLocation.address.split(',')[0]}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2 bg-black/30 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/15">
                <Truck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  Nearest Pod Store: <strong className="text-white">Active (1.2 km away)</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right Action: Service Mode Switcher Card */}
          <div className="bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-white/15 space-y-3 shrink-0 md:w-72 shadow-lg">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-200">
              <span>Service Mode</span>
              {martServiceConfig?.isActive !== false ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE (ACTIVE)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-rose-300">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  PAUSED
                </span>
              )}
            </div>

            <div className="p-3 bg-white/10 rounded-2xl border border-white/10 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-md shrink-0 text-white ${
                martServiceConfig?.isActive !== false
                  ? 'bg-gradient-to-tr from-emerald-600 to-teal-400'
                  : 'bg-gradient-to-tr from-rose-700 to-slate-800'
              }`}>
                ⚡
              </div>
              <div>
                <span className="text-xs font-black text-white block">
                  {martServiceConfig?.isActive !== false ? 'Likart Mart Active' : 'Likart Mart Paused'}
                </span>
                <span className="text-[11px] text-emerald-200">
                  {martServiceConfig?.isActive !== false ? 'Micro-Store Grocery Dispatch' : 'Temporarily Offline'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onSwitchToFoodDelivery}
              className="w-full py-2.5 px-4 bg-white/15 hover:bg-white/25 text-white text-xs font-black rounded-xl border border-white/20 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <Store className="w-3.5 h-3.5 text-orange-400" />
              <span>Switch to Hot Restaurant Food →</span>
            </button>

            {/* Quick Admin & Manager Portal Shortcuts */}
            <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[11px] text-emerald-200">
              <button
                type="button"
                onClick={() => setActivePortal('mart_manager')}
                className="hover:text-white font-bold flex items-center gap-1 transition"
                title="Likart Mart Dark Store Operations"
              >
                <Zap className="w-3 h-3 fill-emerald-300 text-emerald-300" />
                <span>Store Manager</span>
              </button>
              <span className="text-white/20">•</span>
              <button
                type="button"
                onClick={() => {
                  setAdminInitialTab('likart_mart');
                  setActivePortal('admin');
                }}
                className="hover:text-white font-bold flex items-center gap-1 transition text-amber-200"
                title="Super Admin Likart Mart Management"
              >
                <ShieldCheck className="w-3 h-3 text-amber-300" />
                <span>Super Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Global Mart Deactivated Alert Banner for Customers */}
      {martServiceConfig?.isActive === false && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 border-2 border-rose-500/80 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-rose-500/20 text-rose-300 rounded-2xl border border-rose-500/40 shrink-0">
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-heading font-black text-base text-white">
                  Likart Mart 10-Minute Grocery Delivery is Temporarily Paused
                </h4>
                <span className="text-[10px] bg-rose-500 text-white font-black px-2.5 py-0.5 rounded-full uppercase">
                  Service Offline
                </span>
              </div>
              <p className="text-xs text-rose-200/90 mt-1 max-w-2xl leading-relaxed">
                {martServiceConfig.deactivationNotice ||
                  'Likart Mart quick-commerce ordering is temporarily paused by administration. You can browse products or order hot restaurant meals.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onSwitchToFoodDelivery}
            className="px-4 py-2.5 bg-orange-500 hover:bg-orange-400 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0 active:scale-95"
          >
            <Store className="w-4 h-4" />
            <span>Order Restaurant Food Instead →</span>
          </button>
        </div>
      )}

      {/* 2. DYNAMIC SMART SEARCH BAR WITH AUTOCOMPLETE, VOICE SEARCH & ADVANCED FILTERS */}
      <MartSearchAndFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        filterVegOnly={filterVegOnly}
        setFilterVegOnly={setFilterVegOnly}
        filterNonVegOnly={filterNonVegOnly}
        setFilterNonVegOnly={setFilterNonVegOnly}
        filterDiscountOnly={filterDiscountOnly}
        setFilterDiscountOnly={setFilterDiscountOnly}
        filterUnder100={filterUnder100}
        setFilterUnder100={setFilterUnder100}
        filterTopRated={filterTopRated}
        setFilterTopRated={setFilterTopRated}
        filterBestsellerOnly={filterBestsellerOnly}
        setFilterBestsellerOnly={setFilterBestsellerOnly}
        filterInStockOnly={filterInStockOnly}
        setFilterInStockOnly={setFilterInStockOnly}
        selectedBrands={selectedBrands}
        setSelectedBrands={setSelectedBrands}
        minPrice={minPrice}
        maxPrice={maxPrice}
        setPriceRange={setPriceRange}
        minDiscountPercent={minDiscountPercent}
        setMinDiscountPercent={setMinDiscountPercent}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onAddItem={(item) => handleAddItem(item)}
        allCategories={allAvailableCategories}
        totalResultsCount={filteredItems.length}
        onResetAllFilters={handleResetAllFilters}
      />

      {/* 3. PROMOTIONAL HERO BANNERS WITH AUTO-SLIDE OPTION & COUPON ACTIONS */}
      <MartHeroBanners
        onSelectCategory={(catId) => {
          setSelectedCategory(catId);
          const catalogEl = document.getElementById('mart-products-catalog');
          if (catalogEl) {
            catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }}
        onSearchTerm={(term) => {
          setSearchQuery(term);
          const catalogEl = document.getElementById('mart-products-catalog');
          if (catalogEl) {
            catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }}
      />

      {/* 4. UPGRADED GRID CATEGORY LAYOUT (MATCHING REFERENCE PHOTO: SCANNABLE COLUMN ROWS) */}
      <section className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
        {/* Header with Title, Scannable Subtitle, Search and View Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm border border-emerald-100 shadow-2xs">
                🛒
              </span>
              <h3 className="text-base sm:text-lg font-heading font-black text-slate-900 tracking-tight">
                Shop By Category
              </h3>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full">
                10-Min Delivery
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Organized into clean, scannable column rows · {allAvailableCategories.length} aisles ready for instant dispatch
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Filter Search inside Categories */}
            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={categorySearchQuery}
                onChange={(e) => setCategorySearchQuery(e.target.value)}
                placeholder="Filter aisles..."
                className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-emerald-500 transition"
              />
              {categorySearchQuery && (
                <button
                  type="button"
                  onClick={() => setCategorySearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* View Mode Toggle: Scannable 4-Column Grid vs Grouped by Aisle Rows */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/70">
              <button
                type="button"
                onClick={() => setCategoryViewMode('scannable_grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  categoryViewMode === 'scannable_grid'
                    ? 'bg-white text-slate-900 shadow-2xs font-black'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Scannable 4-Column Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Scannable Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setCategoryViewMode('grouped_rows')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  categoryViewMode === 'grouped_rows'
                    ? 'bg-white text-slate-900 shadow-2xs font-black'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Grouped by Aisle Rows"
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>Grouped Aisles</span>
              </button>
            </div>
          </div>
        </div>

        {/* Department Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
          {departmentTabs.map((dept) => {
            const isDeptActive = selectedDepartment === dept.id;
            return (
              <button
                key={dept.id}
                type="button"
                onClick={() => setSelectedDepartment(dept.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 border active:scale-95 ${
                  isDeptActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs font-black'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <span>{dept.icon}</span>
                <span>{dept.label}</span>
              </button>
            );
          })}
        </div>

        {/* VIEW 1: SCANNABLE 4-COLUMN GRID (Matching exact reference photo) */}
        {categoryViewMode === 'scannable_grid' ? (
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 sm:gap-3.5 pt-1">
            {displayedCategories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const count = categoryCounts[cat.id] ?? 0;
              const style = CATEGORY_STYLE_MAP[cat.id] || CATEGORY_STYLE_MAP.all;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    const el = document.getElementById('mart-products-catalog');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className={`group relative rounded-2xl p-2 sm:p-2.5 flex flex-col items-center justify-between transition-all duration-200 text-center border active:scale-95 ${
                    isSelected
                      ? 'bg-gradient-to-b from-slate-900 to-emerald-950 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/50 -translate-y-0.5'
                      : `${style.bg} ${style.border} ${style.hoverBorder} hover:shadow-md hover:-translate-y-0.5`
                  }`}
                >
                  {/* Category Image Container */}
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white/90 border border-slate-200/60 shadow-2xs flex items-center justify-center">
                    {cat.videoUrl ? (
                      <video
                        key={cat.videoUrl}
                        src={cat.videoUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-2xl sm:text-3xl">{cat.icon}</span>
                    )}

                    {/* Live Reel Tag */}
                    {cat.videoUrl && (
                      <span className="absolute top-1 right-1 bg-red-600 text-white text-[7px] font-black px-1 py-0.2 rounded shadow-2xs uppercase tracking-wider animate-pulse flex items-center gap-0.5 z-10 border border-white/40">
                        <Film className="w-2 h-2" />
                        <span>REEL</span>
                      </span>
                    )}

                    {/* Corner Tag/Badge if available */}
                    {cat.badge && (
                      <span
                        className={`absolute top-1 left-1 text-white text-[8px] font-black px-1.5 py-0.2 rounded-md shadow-2xs uppercase tracking-wider backdrop-blur-2xs ${
                          isSelected ? 'bg-emerald-600' : style.tagBg
                        }`}
                      >
                        {cat.badge}
                      </span>
                    )}

                    {/* Category Icon Stamp on bottom corner */}
                    <span className="absolute bottom-1 right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/95 backdrop-blur-2xs shadow-2xs flex items-center justify-center text-xs">
                      {cat.icon}
                    </span>

                    {/* Active Selected Check Indicator */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-emerald-950/45 backdrop-blur-[1px] flex items-center justify-center animate-in fade-in">
                        <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Category Title & Item Count */}
                  <div className="mt-2 w-full">
                    <h4
                      className={`text-[11px] sm:text-xs font-bold line-clamp-2 leading-tight transition ${
                        isSelected
                          ? 'text-emerald-300 font-black'
                          : `${style.text} group-hover:text-emerald-700`
                      }`}
                    >
                      {cat.name}
                    </h4>
                    <span
                      className={`text-[10px] block mt-0.5 font-medium ${
                        isSelected ? 'text-emerald-100/80 font-bold' : 'text-slate-400'
                      }`}
                    >
                      {count} {count === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* VIEW 2: GROUPED BY AISLE ROWS (Organizes shopping categories into clean, scannable column rows by department) */
          <div className="space-y-6 pt-2">
            {REFERENCE_DEPARTMENT_SECTIONS.map((sec) => {
              const secCats = allAvailableCategories.filter((c) => sec.categoryIds.includes(c.id));
              if (secCats.length === 0) return null;

              return (
                <div key={sec.id} className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{sec.icon}</span>
                      <h4 className="font-heading font-black text-sm text-slate-900">
                        {sec.title}
                      </h4>
                      <span className="text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                        {sec.badge}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      {sec.subtitle}
                    </span>
                  </div>

                  {/* Scannable Row of 4 Columns */}
                  <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
                    {secCats.map((cat) => {
                      const isSelected = selectedCategory === cat.id;
                      const count = categoryCounts[cat.id] ?? 0;
                      const style = CATEGORY_STYLE_MAP[cat.id] || CATEGORY_STYLE_MAP.all;

                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat.id);
                            const el = document.getElementById('mart-products-catalog');
                            if (el) {
                              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }}
                          className={`group relative rounded-2xl p-2.5 sm:p-3 flex flex-col items-center justify-between transition-all duration-200 text-center border active:scale-95 ${
                            isSelected
                              ? 'bg-gradient-to-b from-slate-900 to-emerald-950 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/50'
                              : `${style.bg} ${style.border} ${style.hoverBorder} hover:shadow-md hover:-translate-y-0.5`
                          }`}
                        >
                          <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-white/90 border border-slate-200/60 shadow-2xs flex items-center justify-center">
                            {cat.videoUrl ? (
                              <video
                                key={cat.videoUrl}
                                src={cat.videoUrl}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : cat.image ? (
                              <img
                                src={cat.image}
                                alt={cat.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                loading="lazy"
                              />
                            ) : (
                              <span className="text-3xl">{cat.icon}</span>
                            )}

                            {cat.videoUrl && (
                              <span className="absolute top-1 right-1 bg-red-600 text-white text-[7px] font-black px-1 py-0.2 rounded shadow-2xs uppercase tracking-wider animate-pulse flex items-center gap-0.5 z-10 border border-white/40">
                                <Film className="w-2 h-2" />
                                <span>REEL</span>
                              </span>
                            )}

                            {cat.badge && (
                              <span
                                className={`absolute top-1 left-1 text-white text-[8px] font-black px-1.5 py-0.2 rounded-md uppercase tracking-wider ${
                                  isSelected ? 'bg-emerald-600' : style.tagBg
                                }`}
                              >
                                {cat.badge}
                              </span>
                            )}

                            <span className="absolute bottom-1 right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/95 shadow-2xs flex items-center justify-center text-xs">
                              {cat.icon}
                            </span>

                            {isSelected && (
                              <div className="absolute inset-0 bg-emerald-950/45 backdrop-blur-[1px] flex items-center justify-center animate-in fade-in">
                                <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="mt-2 w-full">
                            <h5
                              className={`text-xs font-bold line-clamp-2 leading-tight transition ${
                                isSelected
                                  ? 'text-emerald-300 font-black'
                                  : `${style.text} group-hover:text-emerald-700`
                              }`}
                            >
                              {cat.name}
                            </h5>
                            <span
                              className={`text-[10px] block mt-0.5 font-medium ${
                                isSelected ? 'text-emerald-100/80 font-bold' : 'text-slate-400'
                              }`}
                            >
                              {count} {count === 1 ? 'item' : 'items'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Active Category Selection Banner */}
        {selectedCategory !== 'all' && selectedCatObj && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px] font-medium">Filtered Aisle:</span>
              <span className="font-black text-slate-900 flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-1 rounded-xl">
                <span>{selectedCatObj.icon}</span>
                <span>{selectedCatObj.name}</span>
                <span className="text-[10px] text-emerald-600 font-bold">
                  ({categoryCounts[selectedCatObj.id] || 0} products)
                </span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className="text-xs font-bold text-slate-500 hover:text-rose-600 hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Show All Aisles</span>
            </button>
          </div>
        )}
      </section>

      {/* 5. SPOTLIGHT SHELF: 10-MINUTE DARK STORE BESTSELLERS (When no specific category is filtered) */}
      {selectedCategory === 'all' && !searchQuery && bestsellers.length > 0 && (
        <section className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-emerald-500/10 rounded-3xl p-4 sm:p-5 border border-amber-200/70 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                🔥
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-heading font-black text-slate-900 leading-tight">
                  10-Minute Dark Store Bestsellers
                </h3>
                <p className="text-[11px] text-slate-500">
                  Most frequently ordered items from your nearest micro-pod
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-stretch gap-3 overflow-x-auto scrollbar-none pb-2 pt-1">
            {bestsellers.map((item) => {
              const activeVar = getActiveVariant(item);
              const hasVars = Boolean(item.variants && item.variants.length > 1);
              const displayPrice = activeVar ? activeVar.price : item.price;
              const displayOriginalPrice = activeVar?.originalPrice ?? item.originalPrice;
              const displayDiscount = activeVar?.discountPercent ?? item.discountPercent;
              const displayUnit = activeVar ? activeVar.unit : item.unit;
              const inCartQty = getCartQuantity(item.id, activeVar?.id);
              const totalProductQty = getTotalProductQuantity(item.id);

              return (
                <div
                  key={item.id}
                  className="w-44 sm:w-48 shrink-0 bg-white rounded-2xl border border-slate-200/90 p-2.5 flex flex-col justify-between hover:border-emerald-400 hover:shadow-md transition group"
                >
                  <div>
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-100">
                      {item.videoUrl ? (
                        <video
                          src={item.videoUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      )}
                      <span className="absolute top-1.5 left-1.5 bg-slate-900/90 text-white text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-2xs z-10">
                        <Zap className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        <span>10m</span>
                      </span>
                      {displayDiscount && displayDiscount > 0 ? (
                        <span className="absolute top-1.5 right-1.5 bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-2xs z-10">
                          {displayDiscount}% OFF
                        </span>
                      ) : null}
                      {item.videoUrl && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveReelItem({
                              title: item.name,
                              subtitle: `${item.brand} • ${displayUnit}`,
                              videoUrl: item.videoUrl!,
                              type: 'store_product',
                              price: displayPrice,
                              originalPrice: displayOriginalPrice,
                              discountLabel: displayDiscount ? `${displayDiscount}% OFF` : undefined,
                              description: item.description,
                              isVeg: item.isVeg,
                              rating: item.rating,
                              actionButtonText: 'Add to Mart Cart',
                              onAddToCart: () => handleAddItem(item, activeVar),
                            });
                          }}
                          className="absolute bottom-1.5 right-1.5 z-10 bg-red-600 hover:bg-red-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5 border border-white animate-pulse transition active:scale-90"
                          title="Watch product video reel with sound"
                        >
                          <Film className="w-2 h-2" />
                          <span>REEL</span>
                        </button>
                      )}
                      <div className="absolute bottom-1.5 left-1.5 bg-white/90 p-0.5 rounded-xs shadow-2xs z-10">
                        <span
                          className={`block w-2 h-2 rounded-full ${
                            item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Unit Pill / Variant Selector */}
                    <div className="mt-2 flex items-center justify-between text-[10px] gap-1">
                      {hasVars ? (
                        <button
                          type="button"
                          onClick={() => setActiveVariantModalItem(item)}
                          className="inline-flex items-center gap-1 font-bold text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200/80 px-1.5 py-0.5 rounded-md transition active:scale-95 group/pill truncate max-w-[125px]"
                          title="Select Pack Size / Variant"
                        >
                          <span className="truncate font-black">{displayUnit}</span>
                          <span className="text-[8px] bg-purple-200 text-purple-800 font-extrabold px-1 rounded shrink-0">
                            {item.variants!.length} sizes ▾
                          </span>
                        </button>
                      ) : (
                        <span className="font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {displayUnit}
                        </span>
                      )}
                      <span className="text-[9px] text-emerald-600 font-bold shrink-0">
                        ★ {item.rating}
                      </span>
                    </div>

                    <h5 className="mt-1 text-xs font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-emerald-700 transition">
                      {item.name}
                    </h5>
                    {activeVar?.label && (
                      <span className="text-[9px] text-purple-700 font-semibold block truncate mt-0.5">
                        {activeVar.label}
                      </span>
                    )}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs sm:text-sm font-black font-heading text-slate-900">
                          ₹{displayPrice}
                        </span>
                        {displayOriginalPrice && displayOriginalPrice > displayPrice && (
                          <span className="text-[10px] text-slate-400 line-through">
                            ₹{displayOriginalPrice}
                          </span>
                        )}
                      </div>
                      {totalProductQty > 0 && inCartQty === 0 && (
                        <span className="text-[8px] text-emerald-700 font-bold block truncate">
                          {totalProductQty} in basket (diff size)
                        </span>
                      )}
                    </div>

                    {inCartQty > 0 ? (
                      <div className="flex items-center gap-1 bg-emerald-600 text-white rounded-lg px-1.5 py-0.5 shadow-2xs text-xs font-black">
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQuantity(item, -1, activeVar)}
                          className="p-0.5 hover:bg-emerald-700 rounded transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="min-w-[14px] text-center">{inCartQty}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateItemQuantity(item, 1, activeVar)}
                          className="p-0.5 hover:bg-emerald-700 rounded transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAddItem(item, activeVar)}
                        className="px-2.5 py-1 bg-white hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-400 hover:border-emerald-600 rounded-lg text-xs font-black transition active:scale-95 shadow-2xs flex items-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" />
                        <span>ADD</span>
                        {hasVars && <span className="text-[8px] opacity-70">▾</span>}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 6. MAIN PRODUCTS CATALOG */}
      <div id="mart-products-catalog" className="space-y-4">
        {/* Catalog Control Bar with Sort and Reset */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div>
            <h3 className="text-lg font-heading font-black text-slate-900 flex items-center gap-2">
              <span>{selectedCatObj ? selectedCatObj.name : 'All Micro-Store Essentials'}</span>
              <span className="text-xs font-bold text-slate-400">
                ({filteredItems.length} items ready for 10-min dispatch)
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Fresh stock verified at nearest micro-fulfillment center
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 shadow-2xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="popular">⚡ Popularity / Top Pick</option>
                <option value="price_low">💰 Price: Low to High</option>
                <option value="price_high">💎 Price: High to Low</option>
                <option value="discount">🏷️ Biggest Discount %</option>
                <option value="rating">⭐ Customer Rating (4.5+)</option>
                <option value="alphabetical">🔤 Title (A to Z)</option>
              </select>
            </div>

            {/* Reset Filters */}
            {(selectedCategory !== 'all' ||
              searchQuery ||
              filterVegOnly ||
              filterNonVegOnly ||
              filterDiscountOnly ||
              filterUnder100 ||
              filterTopRated ||
              filterBestsellerOnly ||
              filterInStockOnly ||
              selectedBrands.length > 0 ||
              minPrice !== null ||
              maxPrice !== null ||
              minDiscountPercent !== null) && (
              <button
                type="button"
                onClick={handleResetAllFilters}
                className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 border border-rose-100 transition active:scale-95"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All</span>
              </button>
            )}
          </div>
        </div>

        {/* Empty state if no items match */}
        {filteredItems.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
              🔍
            </div>
            <h4 className="text-base font-black font-heading text-slate-800">
              No matching grocery items found
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try searching for common staples like milk, bread, tomatoes, chips or clear filters.
            </p>
            <button
              type="button"
              onClick={handleResetAllFilters}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-500"
            >
              Reset All Filters & View Catalog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {filteredItems.map((item) => {
              const activeVar = getActiveVariant(item);
              const hasVars = Boolean(item.variants && item.variants.length > 1);
              const displayPrice = activeVar ? activeVar.price : item.price;
              const displayOriginalPrice = activeVar?.originalPrice ?? item.originalPrice;
              const displayDiscount = activeVar?.discountPercent ?? item.discountPercent;
              const displayUnit = activeVar ? activeVar.unit : item.unit;
              const inCartQty = getCartQuantity(item.id, activeVar?.id);
              const totalProductQty = getTotalProductQuantity(item.id);
              const isAddedAnim = addedItemAnimId === (activeVar ? `${item.id}__${activeVar.id}` : item.id);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-400 p-3 flex flex-col justify-between transition-all duration-200 hover:shadow-lg group relative"
                >
                  {/* Top Image & Badges */}
                  <div>
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-100">
                      {item.videoUrl ? (
                        <video
                          src={item.videoUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      )}

                      {/* 10 Min Express badge */}
                      <span className="absolute top-2 left-2 bg-slate-900/90 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5 backdrop-blur-2xs shadow-xs z-10">
                        <Zap className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        <span>10m</span>
                      </span>

                      {/* Discount Tag */}
                      {displayDiscount && displayDiscount > 0 ? (
                        <span className="absolute top-2 right-2 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs z-10">
                          {displayDiscount}% OFF
                        </span>
                      ) : null}

                      {/* Live Video Reel Badge Button */}
                      {item.videoUrl && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveReelItem({
                              title: item.name,
                              subtitle: `${item.brand} • ${displayUnit}`,
                              videoUrl: item.videoUrl!,
                              type: 'store_product',
                              price: displayPrice,
                              originalPrice: displayOriginalPrice,
                              discountLabel: displayDiscount ? `${displayDiscount}% OFF` : undefined,
                              description: item.description,
                              isVeg: item.isVeg,
                              rating: item.rating,
                              actionButtonText: 'Add to Mart Cart',
                              onAddToCart: () => handleAddItem(item),
                            });
                          }}
                          className="absolute bottom-2 right-2 z-10 bg-red-600 hover:bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-md shadow-md flex items-center gap-1 border border-white animate-pulse transition active:scale-90"
                          title="Watch product video reel with sound"
                        >
                          <Film className="w-2.5 h-2.5" />
                          <span>REEL</span>
                        </button>
                      )}

                      {/* Veg / Non-Veg Indicator */}
                      <div className="absolute bottom-2 left-2 bg-white/90 p-0.5 rounded-xs shadow-xs border border-slate-200/50 z-10">
                        <span
                          className={`block w-2.5 h-2.5 rounded-full ${
                            item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Weight / Unit Badge or Variant Selector */}
                    <div className="mt-2.5">
                      {hasVars ? (
                        <button
                          type="button"
                          onClick={() => setActiveVariantModalItem(item)}
                          className="w-full flex items-center justify-between gap-1 font-bold text-purple-900 bg-purple-50 hover:bg-purple-100/90 border border-purple-200/90 px-2.5 py-1 rounded-xl transition active:scale-95 text-left group/varBtn"
                          title="Click to view all pack sizes and variants"
                        >
                          <div className="truncate flex items-center gap-1.5 min-w-0">
                            <Layers className="w-3 h-3 text-purple-600 shrink-0" />
                            <span className="truncate text-xs font-black">{displayUnit}</span>
                          </div>
                          <span className="text-[9px] bg-purple-200 text-purple-800 font-extrabold px-1.5 py-0.5 rounded-md shrink-0 flex items-center gap-0.5">
                            {item.variants!.length} sizes ▾
                          </span>
                        </button>
                      ) : (
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {displayUnit}
                          </span>
                          {item.isBestseller && (
                            <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.5 rounded">
                              TOP PICK
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Brand & Name */}
                    <div className="mt-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block truncate">
                        {item.brand}
                      </span>
                      <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-emerald-700 transition">
                        {item.name}
                      </h4>
                      {activeVar?.label && (
                        <span className="text-[10px] text-purple-700 font-semibold block truncate mt-0.5">
                          {activeVar.label}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom: Price & Add to Cart Controls */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm sm:text-base font-black font-heading text-slate-900">
                          ₹{displayPrice}
                        </span>
                        {displayOriginalPrice && displayOriginalPrice > displayPrice && (
                          <span className="text-[10px] text-slate-400 line-through">
                            ₹{displayOriginalPrice}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] text-emerald-600 font-bold block">
                          ★ {item.rating}
                        </span>
                        {totalProductQty > 0 && inCartQty === 0 && (
                          <span className="text-[9px] text-purple-700 font-bold truncate">
                            • {totalProductQty} in basket
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stepper or Add button */}
                    <div className="shrink-0">
                      {inCartQty > 0 ? (
                        <div className="flex items-center gap-1.5 bg-emerald-600 text-white rounded-xl px-2 py-1 shadow-xs">
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQuantity(item, -1, activeVar)}
                            className="p-0.5 hover:bg-emerald-700 rounded-md transition"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-black min-w-[14px] text-center">
                            {inCartQty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQuantity(item, 1, activeVar)}
                            className="p-0.5 hover:bg-emerald-700 rounded-md transition"
                            title="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddItem(item, activeVar)}
                          className={`px-3 py-1.5 rounded-xl font-black text-xs transition active:scale-95 shadow-xs flex items-center gap-1 ${
                            isAddedAnim
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-300 hover:border-emerald-600'
                          }`}
                        >
                          {isAddedAnim ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Added</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" />
                              <span>ADD</span>
                              {hasVars && <span className="text-[9px] opacity-75">▾</span>}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 7. TRUST & QUALITY PROMISES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-lg shrink-0">
            ⚡
          </div>
          <div>
            <h5 className="font-heading font-black text-xs text-slate-900">
              10-Minute Instant SLA
            </h5>
            <p className="text-[11px] text-slate-500">
              Dedicated micro dark-stores within 1.5 km of your address
            </p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg shrink-0">
            🥦
          </div>
          <div>
            <h5 className="font-heading font-black text-xs text-slate-900">
              100% Quality Checked
            </h5>
            <p className="text-[11px] text-slate-500">
              Daily harvest fresh vegetables, sealed dairy &amp; genuine brands
            </p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg shrink-0">
            🚚
          </div>
          <div>
            <h5 className="font-heading font-black text-xs text-slate-900">
              Zero Surge &amp; Free Delivery
            </h5>
            <p className="text-[11px] text-slate-500">
              Free delivery on grocery carts above ₹199
            </p>
          </div>
        </div>
      </div>

      {/* 8. STICKY FLOATING CART BAR WHEN ITEMS ARE IN CART */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-xl mx-auto z-40 animate-in slide-in-from-bottom-4 duration-200">
          <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 text-white rounded-2xl p-3.5 shadow-2xl flex items-center justify-between gap-3 border border-emerald-400/40">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xs font-black block leading-tight">
                  {cart.reduce((a, b) => a + b.quantity, 0)} items in basket • ₹
                  {cartTotals.grandTotal}
                </span>
                <span className="text-[10px] text-emerald-100 font-semibold flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-amber-300 text-amber-300" />
                  <span>Eligible for 10-Minute Express Delivery</span>
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="px-4 py-2 bg-white text-emerald-950 font-black text-xs rounded-xl shadow-md hover:bg-emerald-50 transition active:scale-95 flex items-center gap-1.5 shrink-0"
            >
              <span>View Cart &amp; Checkout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
      {/* 9. PRODUCT VARIANTS SELECTION MODAL (Quick-Commerce Style Bottom-Sheet / Dialog) */}
      {activeVariantModalItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setActiveVariantModalItem(null)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-white/10 border border-white/20 shrink-0">
                  <img
                    src={activeVariantModalItem.image}
                    alt={activeVariantModalItem.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 left-1 bg-white p-0.5 rounded-xs shadow-2xs">
                    <span
                      className={`block w-2 h-2 rounded-full ${
                        activeVariantModalItem.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-200 block">
                    {activeVariantModalItem.brand} • Quick Dispatch
                  </span>
                  <h3 className="text-sm sm:text-base font-black font-heading leading-snug line-clamp-2">
                    {activeVariantModalItem.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-purple-200">
                    <span className="flex items-center gap-0.5 font-bold text-amber-300">
                      ★ {activeVariantModalItem.rating}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-semibold text-emerald-300">
                      <Zap className="w-3 h-3 fill-emerald-300" />
                      10 Min SLA
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveVariantModalItem(null)}
                className="p-1.5 text-purple-200 hover:text-white hover:bg-white/10 rounded-xl transition shrink-0"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Subheader */}
            <div className="px-5 py-3 bg-purple-50/70 border-b border-purple-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-700" />
                <span className="text-xs font-black font-heading text-purple-950">
                  Select Pack Size &amp; Quantity
                </span>
              </div>
              <span className="text-[11px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                {activeVariantModalItem.variants?.length || 1} Pack Sizes Available
              </span>
            </div>

            {/* Variants List */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 max-h-[55vh]">
              {(activeVariantModalItem.variants && activeVariantModalItem.variants.length > 0
                ? activeVariantModalItem.variants
                : [
                    {
                      id: 'default',
                      unit: activeVariantModalItem.unit,
                      price: activeVariantModalItem.price,
                      originalPrice: activeVariantModalItem.originalPrice,
                      discountPercent: activeVariantModalItem.discountPercent,
                      inStock: activeVariantModalItem.inStock,
                      stockCount: activeVariantModalItem.stockCount,
                      isDefault: true,
                    },
                  ]
              ).map((variant) => {
                const vQty = getCartQuantity(activeVariantModalItem.id, variant.id);
                const isSelected =
                  (selectedVariants[activeVariantModalItem.id] ||
                    activeVariantModalItem.variants?.find((x) => x.isDefault)?.id ||
                    activeVariantModalItem.variants?.[0]?.id) === variant.id;
                const savings =
                  variant.originalPrice && variant.originalPrice > variant.price
                    ? variant.originalPrice - variant.price
                    : 0;

                return (
                  <div
                    key={variant.id}
                    onClick={() => handleSelectVariant(activeVariantModalItem.id, variant.id)}
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                      vQty > 0
                        ? 'bg-emerald-50/50 border-emerald-400 ring-1 ring-emerald-300'
                        : isSelected
                        ? 'bg-purple-50/40 border-purple-300 ring-1 ring-purple-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-black text-slate-900">
                          {variant.unit}
                        </span>
                        {variant.label && (
                          <span className="text-[10px] font-extrabold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                            {variant.label}
                          </span>
                        )}
                        {variant.isDefault && (
                          <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            Standard
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-sm sm:text-base font-black font-heading text-slate-900">
                          ₹{variant.price}
                        </span>
                        {variant.originalPrice && variant.originalPrice > variant.price && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{variant.originalPrice}
                          </span>
                        )}
                        {variant.discountPercent && variant.discountPercent > 0 ? (
                          <span className="text-[11px] font-extrabold text-rose-600">
                            {variant.discountPercent}% OFF
                          </span>
                        ) : null}
                        {savings > 0 && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded">
                            Save ₹{savings}
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500">
                        {variant.inStock !== false ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            {variant.stockCount && variant.stockCount <= 10
                              ? `Only ${variant.stockCount} left in dark store`
                              : 'Ready for 10-min dispatch'}
                          </span>
                        ) : (
                          <span className="text-rose-600 font-bold">Currently Sold Out</span>
                        )}
                      </div>
                    </div>

                    {/* Stepper or Add Button */}
                    <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                      {vQty > 0 ? (
                        <div className="flex items-center gap-1.5 bg-emerald-600 text-white rounded-xl px-2.5 py-1.5 shadow-xs font-black">
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQuantity(activeVariantModalItem, -1, variant)}
                            className="p-0.5 hover:bg-emerald-700 rounded-md transition"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-black min-w-[16px] text-center">{vQty}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQuantity(activeVariantModalItem, 1, variant)}
                            className="p-0.5 hover:bg-emerald-700 rounded-md transition"
                            title="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={variant.inStock === false}
                          onClick={() => {
                            handleSelectVariant(activeVariantModalItem.id, variant.id);
                            handleAddItem(activeVariantModalItem, variant);
                          }}
                          className="px-3.5 py-1.5 bg-white hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-400 hover:border-emerald-600 rounded-xl text-xs font-black transition active:scale-95 shadow-2xs flex items-center gap-1 disabled:opacity-40 disabled:pointer-events-none"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>ADD</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-600 block">
                  {getTotalProductQuantity(activeVariantModalItem.id) > 0 ? (
                    <span className="text-emerald-700 font-black">
                      ✓ {getTotalProductQuantity(activeVariantModalItem.id)} packs in your basket
                    </span>
                  ) : (
                    <span>Tap ADD on any pack size above</span>
                  )}
                </span>
                <span className="text-[10px] text-slate-400">
                  Delivered together from Likart Mart Hub
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveVariantModalItem(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition"
                >
                  Done
                </button>
                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveVariantModalItem(null);
                      setIsCartOpen(true);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1"
                  >
                    <span>View Cart (₹{cartTotals.grandTotal})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Video Reel Modal for Store Products & Aisles */}
      <CustomerVideoReelModal
        isOpen={Boolean(activeReelItem)}
        onClose={() => setActiveReelItem(null)}
        data={activeReelItem}
      />
    </div>
  );
};
