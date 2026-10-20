import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  Mic,
  MicOff,
  Clock,
  Sparkles,
  Tag,
  RotateCcw,
  SlidersHorizontal,
  ArrowUpDown,
  Check,
  Plus,
  Flame,
  Star,
  Layers,
  ChevronDown,
  ShoppingBag,
  Zap,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { QuickCommerceItem, QuickCommerceCategory } from '../../../types';
import { safeStorage } from '../../../utils/storageUtils';

interface MartSearchAndFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  filterVegOnly: boolean;
  setFilterVegOnly: (veg: boolean) => void;
  filterNonVegOnly: boolean;
  setFilterNonVegOnly: (nonVeg: boolean) => void;
  filterDiscountOnly: boolean;
  setFilterDiscountOnly: (val: boolean) => void;
  filterUnder100: boolean;
  setFilterUnder100: (val: boolean) => void;
  filterTopRated: boolean;
  setFilterTopRated: (val: boolean) => void;
  filterBestsellerOnly: boolean;
  setFilterBestsellerOnly: (val: boolean) => void;
  filterInStockOnly: boolean;
  setFilterInStockOnly: (val: boolean) => void;
  selectedBrands: string[];
  setSelectedBrands: (brands: string[]) => void;
  minPrice: number | null;
  maxPrice: number | null;
  setPriceRange: (min: number | null, max: number | null) => void;
  minDiscountPercent: number | null;
  setMinDiscountPercent: (pct: number | null) => void;
  sortBy: 'popular' | 'price_low' | 'price_high' | 'discount' | 'rating' | 'alphabetical';
  setSortBy: (
    sort: 'popular' | 'price_low' | 'price_high' | 'discount' | 'rating' | 'alphabetical'
  ) => void;
  onAddItem: (item: QuickCommerceItem) => void;
  allCategories: QuickCommerceCategory[];
  totalResultsCount: number;
  onResetAllFilters: () => void;
}

const TRENDING_MART_SEARCHES = [
  { term: 'Milk', label: 'Fresh Milk', icon: '🥛' },
  { term: 'Butter', label: 'Amul Butter', icon: '🧈' },
  { term: 'Tomato', label: 'Farm Tomatoes', icon: '🍅' },
  { term: 'Eggs', label: 'Brown Eggs', icon: '🥚' },
  { term: 'Atta', label: 'Aashirvaad Atta', icon: '🌾' },
  { term: 'Bread', label: 'Whole Wheat Bread', icon: '🍞' },
  { term: 'Chips', label: 'Lays & Kurkure', icon: '🥔' },
  { term: 'Ice Cream', label: 'Chilled Ice Cream', icon: '🍦' },
  { term: 'Coke', label: 'Cold Drinks', icon: '🥤' },
  { term: 'Maggi', label: 'Instant Noodles', icon: '🍜' },
];

export const MartSearchAndFilter: React.FC<MartSearchAndFilterProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  filterVegOnly,
  setFilterVegOnly,
  filterNonVegOnly,
  setFilterNonVegOnly,
  filterDiscountOnly,
  setFilterDiscountOnly,
  filterUnder100,
  setFilterUnder100,
  filterTopRated,
  setFilterTopRated,
  filterBestsellerOnly,
  setFilterBestsellerOnly,
  filterInStockOnly,
  setFilterInStockOnly,
  selectedBrands,
  setSelectedBrands,
  minPrice,
  maxPrice,
  setPriceRange,
  minDiscountPercent,
  setMinDiscountPercent,
  sortBy,
  setSortBy,
  onAddItem,
  allCategories,
  totalResultsCount,
  onResetAllFilters,
}) => {
  const { martProducts, addNotification } = useApp();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [brandSearchQuery, setBrandSearchQuery] = useState('');

  // Local draft price bounds for modal slider
  const [draftMinPrice, setDraftMinPrice] = useState<string>(minPrice !== null ? String(minPrice) : '');
  const [draftMaxPrice, setDraftMaxPrice] = useState<string>(maxPrice !== null ? String(maxPrice) : '');

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Rotating tips for input placeholder
  const searchTips = useMemo(
    () => [
      'Search "Amul butter, full cream milk, brown eggs"...',
      'Search "Farm fresh tomatoes, onions, crisp potatoes"...',
      'Search "Lays chips, Kurkure, cold drinks, Thums Up"...',
      'Search "Aashirvaad atta, Basmati rice, Fortune oil"...',
      'Search "Maggi noodles, chocolate cookies, ice creams"...',
    ],
    []
  );
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % searchTips.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [searchTips.length]);

  // Recent searches persisted in safeStorage
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = safeStorage.getItem('likart_mart_recent_searches');
      return saved ? JSON.parse(saved) : ['Fresh Milk', 'Amul Butter', 'Tomatoes', 'Eggs'];
    } catch {
      return ['Fresh Milk', 'Amul Butter', 'Tomatoes', 'Eggs'];
    }
  });

  const saveRecentSearch = (term: string) => {
    const clean = term.trim();
    if (!clean || clean.length < 2) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((t) => t.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...filtered].slice(0, 8);
      safeStorage.setItem('likart_mart_recent_searches', JSON.stringify(updated));
      return updated;
    });
  };

  const removeRecentSearch = (termToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((t) => t !== termToRemove);
      safeStorage.setItem('likart_mart_recent_searches', JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    safeStorage.setItem('likart_mart_recent_searches', JSON.stringify([]));
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Extract all available brands dynamically
  const availableBrands = useMemo(() => {
    const map = new Map<string, number>();
    (martProducts || []).forEach((p) => {
      if (p.brand && p.brand.trim()) {
        map.set(p.brand.trim(), (map.get(p.brand.trim()) || 0) + 1);
      }
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [martProducts]);

  const filteredBrandsList = useMemo(() => {
    if (!brandSearchQuery.trim()) return availableBrands;
    const q = brandSearchQuery.toLowerCase().trim();
    return availableBrands.filter((b) => b.name.toLowerCase().includes(q));
  }, [availableBrands, brandSearchQuery]);

  // Live matching items for autocomplete dropdown
  const autocompleteResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return { products: [], categories: [], brands: [] };
    }
    const q = searchQuery.toLowerCase().trim();

    // Matching products (limit to top 6)
    const products = (martProducts || [])
      .filter((p) => {
        return (
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q) ||
          p.unit.toLowerCase().includes(q)
        );
      })
      .slice(0, 6);

    // Matching categories
    const categories = (allCategories || [])
      .filter((c) => c.id !== 'all' && c.name.toLowerCase().includes(q))
      .slice(0, 3);

    // Matching brands
    const brands = availableBrands.filter((b) => b.name.toLowerCase().includes(q)).slice(0, 4);

    return { products, categories, brands };
  }, [searchQuery, martProducts, allCategories, availableBrands]);

  // Handle Speech Recognition for voice search
  const handleVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceNotice('Voice search requires Chrome/Safari on HTTPS or Android.');
      setTimeout(() => setVoiceNotice(null), 3500);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceNotice('Listening... Speak grocery item now (e.g. "Amul Butter", "Farm Milk")');
      };

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        if (spoken) {
          setSearchQuery(spoken);
          saveRecentSearch(spoken);
          setVoiceNotice(`Found: "${spoken}"`);
          setTimeout(() => setVoiceNotice(null), 2500);
          setIsDropdownOpen(false);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        setVoiceNotice(`Voice capture error (${event.error}). Please type.`);
        setTimeout(() => setVoiceNotice(null), 3000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      setVoiceNotice('Mic permission denied or unavailable.');
      setTimeout(() => setVoiceNotice(null), 3000);
    }
  };

  // Check if any filter is currently applied
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterVegOnly) count++;
    if (filterNonVegOnly) count++;
    if (filterDiscountOnly) count++;
    if (filterUnder100) count++;
    if (filterTopRated) count++;
    if (filterBestsellerOnly) count++;
    if (filterInStockOnly) count++;
    if (selectedBrands.length > 0) count += selectedBrands.length;
    if (minPrice !== null || maxPrice !== null) count++;
    if (minDiscountPercent !== null) count++;
    if (selectedCategory !== 'all') count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [
    filterVegOnly,
    filterNonVegOnly,
    filterDiscountOnly,
    filterUnder100,
    filterTopRated,
    filterBestsellerOnly,
    filterInStockOnly,
    selectedBrands.length,
    minPrice,
    maxPrice,
    minDiscountPercent,
    selectedCategory,
    searchQuery,
  ]);

  // Highlight matched search text
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-emerald-100 text-emerald-900 font-extrabold px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const handleSelectRecent = (term: string) => {
    setSearchQuery(term);
    saveRecentSearch(term);
    setIsDropdownOpen(false);
  };

  const handleSelectBrand = (brandName: string) => {
    if (selectedBrands.includes(brandName)) {
      setSelectedBrands(selectedBrands.filter((b) => b !== brandName));
    } else {
      setSelectedBrands([...selectedBrands, brandName]);
    }
  };

  // Sync draft price inputs
  useEffect(() => {
    setDraftMinPrice(minPrice !== null ? String(minPrice) : '');
    setDraftMaxPrice(maxPrice !== null ? String(maxPrice) : '');
  }, [minPrice, maxPrice]);

  const handleApplyModalFilters = () => {
    const pMin = draftMinPrice.trim() ? Number(draftMinPrice) : null;
    const pMax = draftMaxPrice.trim() ? Number(draftMaxPrice) : null;
    setPriceRange(pMin, pMax);
    setIsFilterModalOpen(false);
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3.5 relative">
      {/* 1. TOP BAR: SEARCH INPUT WITH CLEAR & VOICE, SORT DROPDOWN, ALL FILTERS BUTTON */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input Box Container */}
        <div ref={searchContainerRef} className="relative flex-1">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />

            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  saveRecentSearch(searchQuery);
                  setIsDropdownOpen(false);
                } else if (e.key === 'Escape') {
                  setIsDropdownOpen(false);
                }
              }}
              placeholder={searchTips[tipIndex]}
              className="w-full pl-10 pr-20 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 placeholder:text-slate-400 rounded-2xl text-xs sm:text-sm font-medium border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition shadow-2xs"
            />

            {/* Right Action Icons in Search Input (Clear & Voice) */}
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition"
                  title="Clear search input"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Voice Search Button */}
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`p-1.5 rounded-lg transition active:scale-95 ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse shadow-xs'
                    : 'text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50'
                }`}
                title="Voice Search: Click and speak item"
                aria-label="Voice Search"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Voice Feedback Tooltip */}
          {voiceNotice && (
            <div className="absolute top-full left-0 mt-1.5 z-40 bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-lg border border-slate-700 animate-in fade-in flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{voiceNotice}</span>
            </div>
          )}

          {/* AUTOCOMPLETE LIVE SUGGESTION DROPDOWN OVERLAY */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-3xl border border-slate-200 shadow-2xl p-4 space-y-4 max-h-[480px] overflow-y-auto animate-in fade-in">
              {/* STATE A: User has not typed anything yet (Zero State) */}
              {!searchQuery.trim() ? (
                <div className="space-y-4">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span className="flex items-center gap-1.5 text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Recent Searches</span>
                        </span>
                        <button
                          type="button"
                          onClick={clearRecentSearches}
                          className="text-[11px] text-rose-500 hover:underline"
                        >
                          Clear
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {recentSearches.map((term) => (
                          <div
                            key={term}
                            onClick={() => handleSelectRecent(term)}
                            className="group flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer border border-slate-200/60 transition"
                          >
                            <span>{term}</span>
                            <button
                              type="button"
                              onClick={(e) => removeRecentSearch(term, e)}
                              className="text-slate-400 hover:text-rose-500 p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trending in Likart Mart */}
                  <div className="space-y-2">
                    <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      <span>Trending Fast-Commerce Groceries</span>
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {TRENDING_MART_SEARCHES.map((t) => (
                        <button
                          key={t.term}
                          type="button"
                          onClick={() => handleSelectRecent(t.term)}
                          className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-emerald-50/80 rounded-xl border border-slate-200/80 text-left transition hover:border-emerald-300 group"
                        >
                          <span className="text-lg">{t.icon}</span>
                          <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-800">
                            {t.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* STATE B: User has typed query (Live Results) */
                <div className="space-y-3.5">
                  {/* Matching Categories if any */}
                  {autocompleteResults.categories.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        Matching Aisles
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {autocompleteResults.categories.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setSelectedCategory(c.id);
                              setIsDropdownOpen(false);
                            }}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-black flex items-center gap-1 hover:bg-emerald-100"
                          >
                            <span>{c.icon}</span>
                            <span>{c.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Brands if any */}
                  {autocompleteResults.brands.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        Matching Brands
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {autocompleteResults.brands.map((b) => (
                          <button
                            key={b.name}
                            type="button"
                            onClick={() => {
                              handleSelectBrand(b.name);
                              setIsDropdownOpen(false);
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1"
                          >
                            <span>🏷️ {b.name}</span>
                            <span className="text-[10px] text-slate-500">({b.count})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Products List with Direct ADD Button */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                      Grocery Items ({autocompleteResults.products.length})
                    </span>

                    {autocompleteResults.products.length === 0 ? (
                      <p className="text-xs text-slate-500 py-2">
                        No direct item title match for "{searchQuery}". Press Enter to search all tags.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {autocompleteResults.products.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-3 p-2 hover:bg-slate-50 rounded-2xl border border-slate-100 transition group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                              />
                              <div className="min-w-0">
                                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block truncate">
                                  {item.brand}
                                </span>
                                <h5 className="text-xs font-bold text-slate-900 truncate">
                                  {highlightMatch(item.name, searchQuery)}
                                </h5>
                                <div className="flex items-center gap-2 text-[10px]">
                                  <span className="font-bold text-slate-900">₹{item.price}</span>
                                  <span className="text-slate-400">{item.unit}</span>
                                  {item.discountPercent && item.discountPercent > 0 ? (
                                    <span className="text-rose-600 font-black">
                                      {item.discountPercent}% OFF
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddItem(item);
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-xs transition active:scale-95 shrink-0 flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>ADD</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom Action: View all matching */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-mono">Enter</kbd> to view full catalog
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        saveRecentSearch(searchQuery);
                        setIsDropdownOpen(false);
                      }}
                      className="font-black text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <span>Show {totalResultsCount} Results →</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Controls: Sort Dropdown & "All Filters" Modal Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-700 shadow-2xs hover:bg-white transition">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-black text-slate-900 focus:outline-none cursor-pointer text-xs"
              title="Sort products"
            >
              <option value="popular">⚡ Top Bestsellers</option>
              <option value="price_low">💰 Price: Low to High</option>
              <option value="price_high">💎 Price: High to Low</option>
              <option value="discount">🏷️ Biggest Discount %</option>
              <option value="rating">⭐ Customer Rating (4.5+)</option>
              <option value="alphabetical">🔤 Title (A to Z)</option>
            </select>
          </div>

          {/* All Filters Button */}
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-1.5 border active:scale-95 shadow-2xs ${
              activeFiltersCount > 0
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 2. HORIZONTAL QUICK FILTER PILLS BAR */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5 text-xs">
        {/* Pure Veg */}
        <button
          type="button"
          onClick={() => setFilterVegOnly(!filterVegOnly)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border active:scale-95 shrink-0 ${
            filterVegOnly
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              filterVegOnly ? 'bg-white' : 'bg-emerald-600'
            }`}
          />
          <span>Pure Veg</span>
        </button>

        {/* Non-Veg */}
        <button
          type="button"
          onClick={() => setFilterNonVegOnly(!filterNonVegOnly)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border active:scale-95 shrink-0 ${
            filterNonVegOnly
              ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              filterNonVegOnly ? 'bg-white' : 'bg-rose-600'
            }`}
          />
          <span>Non-Veg / Meat</span>
        </button>

        {/* Deals / Savers */}
        <button
          type="button"
          onClick={() => setFilterDiscountOnly(!filterDiscountOnly)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border active:scale-95 shrink-0 ${
            filterDiscountOnly
              ? 'bg-amber-500 text-slate-950 border-amber-500 font-black shadow-xs'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          <Tag className="w-3 h-3 text-amber-500" />
          <span>Super Deals</span>
        </button>

        {/* Under ₹100 */}
        <button
          type="button"
          onClick={() => setFilterUnder100(!filterUnder100)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border active:scale-95 shrink-0 ${
            filterUnder100
              ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          <Zap className="w-3 h-3 text-amber-400" />
          <span>Under ₹100</span>
        </button>

        {/* 4.5+ Top Rated */}
        <button
          type="button"
          onClick={() => setFilterTopRated(!filterTopRated)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border active:scale-95 shrink-0 ${
            filterTopRated
              ? 'bg-yellow-500 text-slate-950 border-yellow-500 font-black shadow-xs'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>4.5+ Rated</span>
        </button>

        {/* Bestsellers Only */}
        <button
          type="button"
          onClick={() => setFilterBestsellerOnly(!filterBestsellerOnly)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border active:scale-95 shrink-0 ${
            filterBestsellerOnly
              ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          <Flame className="w-3 h-3 text-amber-500" />
          <span>Bestsellers</span>
        </button>

        {/* In Stock Only */}
        <button
          type="button"
          onClick={() => setFilterInStockOnly(!filterInStockOnly)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border active:scale-95 shrink-0 ${
            filterInStockOnly
              ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          <span>📦 In Stock</span>
        </button>
      </div>

      {/* 3. ACTIVE FILTERS REMOVABLE CHIPS BAR */}
      {activeFiltersCount > 0 && (
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-slate-400 mr-1">
              Active Filters:
            </span>

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 text-white rounded-xl text-xs font-bold">
                <span>"{searchQuery}"</span>
                <button type="button" onClick={() => setSearchQuery('')} className="p-0.5 hover:text-rose-300">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filterVegOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold">
                <span>Pure Veg</span>
                <button type="button" onClick={() => setFilterVegOnly(false)} className="p-0.5 hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filterNonVegOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-100 text-rose-900 rounded-xl text-xs font-bold">
                <span>Non-Veg</span>
                <button type="button" onClick={() => setFilterNonVegOnly(false)} className="p-0.5 hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filterDiscountOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-900 rounded-xl text-xs font-bold">
                <span>Super Deals</span>
                <button type="button" onClick={() => setFilterDiscountOnly(false)} className="p-0.5 hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filterUnder100 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-900 rounded-xl text-xs font-bold">
                <span>Under ₹100</span>
                <button type="button" onClick={() => setFilterUnder100(false)} className="p-0.5 hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filterTopRated && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-900 rounded-xl text-xs font-bold">
                <span>4.5+ Stars</span>
                <button type="button" onClick={() => setFilterTopRated(false)} className="p-0.5 hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filterBestsellerOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-900 rounded-xl text-xs font-bold">
                <span>Bestsellers</span>
                <button type="button" onClick={() => setFilterBestsellerOnly(false)} className="p-0.5 hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedBrands.map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-800 rounded-xl text-xs font-bold"
              >
                <span>Brand: {b}</span>
                <button
                  type="button"
                  onClick={() => handleSelectBrand(b)}
                  className="p-0.5 hover:text-rose-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {(minPrice !== null || maxPrice !== null) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-900 rounded-xl text-xs font-bold">
                <span>
                  Price: ₹{minPrice ?? 0} - ₹{maxPrice ?? '∞'}
                </span>
                <button
                  type="button"
                  onClick={() => setPriceRange(null, null)}
                  className="p-0.5 hover:text-rose-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {minDiscountPercent !== null && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-100 text-rose-900 rounded-xl text-xs font-bold">
                <span>{minDiscountPercent}%+ Off</span>
                <button
                  type="button"
                  onClick={() => setMinDiscountPercent(null)}
                  className="p-0.5 hover:text-rose-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-slate-500">
              Showing <strong>{totalResultsCount}</strong> products
            </span>
            <button
              type="button"
              onClick={onResetAllFilters}
              className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear All</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. COMPREHENSIVE ALL FILTERS MODAL */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base text-slate-900">
                    Filter Likart Mart Catalog
                  </h3>
                  <p className="text-xs text-slate-500">
                    Fine-tune groceries by diet, brands, discounts, and prices
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-6 text-xs flex-1">
              {/* Dietary Preferences */}
              <div className="space-y-2.5">
                <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
                  Dietary &amp; Food Type
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFilterVegOnly(false);
                      setFilterNonVegOnly(false);
                    }}
                    className={`p-2.5 rounded-xl border text-center font-bold transition ${
                      !filterVegOnly && !filterNonVegOnly
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    All Items
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterVegOnly(true);
                      setFilterNonVegOnly(false);
                    }}
                    className={`p-2.5 rounded-xl border text-center font-bold transition flex items-center justify-center gap-1.5 ${
                      filterVegOnly
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Pure Veg</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterNonVegOnly(true);
                      setFilterVegOnly(false);
                    }}
                    className={`p-2.5 rounded-xl border text-center font-bold transition flex items-center justify-center gap-1.5 ${
                      filterNonVegOnly
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Non-Veg</span>
                  </button>
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
                    Price Range (₹)
                  </h4>
                  <div className="flex gap-1.5 text-[10px]">
                    {[
                      { label: '< ₹50', min: null, max: 50 },
                      { label: '₹50-150', min: 50, max: 150 },
                      { label: '₹150-300', min: 150, max: 300 },
                      { label: '> ₹300', min: 300, max: null },
                    ].map((bracket) => (
                      <button
                        key={bracket.label}
                        type="button"
                        onClick={() => {
                          setDraftMinPrice(bracket.min !== null ? String(bracket.min) : '');
                          setDraftMaxPrice(bracket.max !== null ? String(bracket.max) : '');
                        }}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
                      >
                        {bracket.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">
                      Min Price (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={draftMinPrice}
                      onChange={(e) => setDraftMinPrice(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">
                      Max Price (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="No limit"
                      value={draftMaxPrice}
                      onChange={(e) => setDraftMaxPrice(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Discount Percentage Savers */}
              <div className="space-y-2.5">
                <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
                  Discount &amp; Savings %
                </h4>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { label: 'Any', val: null },
                    { label: '10%+', val: 10 },
                    { label: '20%+', val: 20 },
                    { label: '30%+', val: 30 },
                    { label: '50%+', val: 50 },
                  ].map((disc) => (
                    <button
                      key={disc.label}
                      type="button"
                      onClick={() => setMinDiscountPercent(disc.val)}
                      className={`py-2 rounded-xl border text-center font-bold text-[11px] transition ${
                        minDiscountPercent === disc.val
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {disc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands Filter (Multi-select with Brand Search) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
                    Brands ({selectedBrands.length} selected)
                  </h4>
                  {selectedBrands.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedBrands([])}
                      className="text-[10px] text-rose-600 font-bold hover:underline"
                    >
                      Clear Brands
                    </button>
                  )}
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={brandSearchQuery}
                    onChange={(e) => setBrandSearchQuery(e.target.value)}
                    placeholder="Search brand (Amul, Aashirvaad, Tata, Lays...)"
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50/50">
                  {filteredBrandsList.map((b) => {
                    const isSelected = selectedBrands.includes(b.name);
                    return (
                      <button
                        key={b.name}
                        type="button"
                        onClick={() => handleSelectBrand(b.name)}
                        className={`p-2 rounded-xl border text-left flex items-center justify-between transition text-xs ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
                              isSelected ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </span>
                          <span className="truncate">{b.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">({b.count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rating & Availability */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
                    Customer Rating
                  </h4>
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => setFilterTopRated(false)}
                      className={`w-full p-2 rounded-xl text-left border text-xs font-bold transition ${
                        !filterTopRated
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      Any Rating
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterTopRated(true)}
                      className={`w-full p-2 rounded-xl text-left border text-xs font-bold transition flex items-center gap-1.5 ${
                        filterTopRated
                          ? 'bg-yellow-500 text-slate-950 border-yellow-500 font-black'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>★ 4.5 &amp; Above</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
                    Availability &amp; SLA
                  </h4>
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => setFilterInStockOnly(!filterInStockOnly)}
                      className={`w-full p-2 rounded-xl text-left border text-xs font-bold transition flex items-center justify-between ${
                        filterInStockOnly
                          ? 'bg-sky-600 text-white border-sky-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span>In Stock Only</span>
                      {filterInStockOnly && <Check className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterBestsellerOnly(!filterBestsellerOnly)}
                      className={`w-full p-2 rounded-xl text-left border text-xs font-bold transition flex items-center justify-between ${
                        filterBestsellerOnly
                          ? 'bg-orange-600 text-white border-orange-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span>Top Bestsellers</span>
                      {filterBestsellerOnly && <Check className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  onResetAllFilters();
                  setDraftMinPrice('');
                  setDraftMaxPrice('');
                  setIsFilterModalOpen(false);
                }}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-rose-600 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>

              <button
                type="button"
                onClick={handleApplyModalFilters}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5"
              >
                <span>Apply Filters ({totalResultsCount} Items)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
